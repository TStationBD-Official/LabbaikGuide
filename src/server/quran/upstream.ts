import "server-only";
import { SERVER_CONFIG, hasQuranFoundationCredentials } from "@/config/server";

export class UpstreamError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "UpstreamError";
  }
}

type Token = { value: string; expiresAt: number };
let cachedToken: Token | null = null;
let tokenRequest: Promise<Token> | null = null;

/**
 * OAuth2 client-credentials token for the Quran Foundation Content API.
 * Cached in server memory until shortly before expiry; concurrent callers share
 * one in-flight request. Credentials never leave the server.
 */
async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) return cachedToken.value;
  if (!tokenRequest) {
    tokenRequest = (async () => {
      const { qfClientId, qfClientSecret, qfTokenUrl, timeoutMs } = SERVER_CONFIG.quran;
      const res = await fetch(qfTokenUrl, {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          authorization: `Basic ${Buffer.from(`${qfClientId}:${qfClientSecret}`).toString("base64")}`,
        },
        body: new URLSearchParams({ grant_type: "client_credentials", scope: "content" }),
        signal: AbortSignal.timeout(timeoutMs),
        cache: "no-store",
      });
      if (!res.ok) throw new UpstreamError(res.status, "Token request failed");
      const json = (await res.json()) as { access_token?: string; expires_in?: number };
      if (!json.access_token) throw new UpstreamError(502, "Token missing");
      const token = { value: json.access_token, expiresAt: Date.now() + (json.expires_in ?? 3600) * 1000 };
      cachedToken = token;
      return token;
    })().finally(() => {
      tokenRequest = null;
    });
  }
  return (await tokenRequest).value;
}

/**
 * GET from the configured Quran API. Uses the authenticated Quran Foundation API
 * when credentials exist, otherwise the public Quran.com v4 API.
 */
export async function quranFetch(
  path: string,
  params: Record<string, string | number | boolean | undefined>,
  { revalidate = SERVER_CONFIG.quran.revalidateSeconds }: { revalidate?: number } = {},
): Promise<unknown> {
  const authed = hasQuranFoundationCredentials();
  const base = authed ? SERVER_CONFIG.quran.qfApiBase : SERVER_CONFIG.quran.publicApiBase;
  const url = new URL(`${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
  }

  const headers: Record<string, string> = { accept: "application/json" };
  if (authed) {
    headers["x-auth-token"] = await getAccessToken();
    headers["x-client-id"] = SERVER_CONFIG.quran.qfClientId;
  }

  let res: Response;
  try {
    res = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(SERVER_CONFIG.quran.timeoutMs),
      next: { revalidate },
    });
  } catch (e) {
    const timeout = e instanceof DOMException && e.name === "TimeoutError";
    throw new UpstreamError(timeout ? 504 : 502, timeout ? "Upstream timeout" : "Upstream unreachable");
  }

  if (res.status === 401 && authed) cachedToken = null; // force refresh next time
  if (!res.ok) throw new UpstreamError(res.status, `Upstream ${res.status}`);
  return res.json();
}
