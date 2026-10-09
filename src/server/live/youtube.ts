import "server-only";

export type LiveVideo = { videoId: string; title: string | null };

const ID = /^[\w-]{11}$/;

/**
 * Find the stream that is live now on a channel's "Live" tab (/streams): the first item carrying
 * YouTube's LIVE badge. Returns null when nothing is live or the page format changed — the caller then
 * falls back to YouTube's own channel live embed, never to a guessed video.
 */
export function parseLiveFromStreams(html: string): LiveVideo | null {
  const items = html.split('"lockupViewModel":{"contentImage"').slice(1);
  for (const it of items) {
    if (!it.includes("THUMBNAIL_OVERLAY_BADGE_STYLE_LIVE")) continue;
    const id = it.match(/"contentId":"([\w-]{11})"/)?.[1] ?? it.match(/"animationActivationTargetId":"([\w-]{11})"/)?.[1];
    if (!id || !ID.test(id)) continue;
    const raw = it.match(/"lockupMetadataViewModel":\{"title":\{"content":"((?:[^"\\]|\\.)*)"/)?.[1] ?? null;
    let title: string | null = null;
    if (raw) {
      try {
        title = JSON.parse(`"${raw}"`) as string;
      } catch {
        title = null;
      }
    }
    return { videoId: id, title };
  }
  return null;
}

const cache = new Map<string, { at: number; v: LiveVideo | null }>();
const TTL = 10 * 60_000;

export async function liveVideoFor(channelId: string): Promise<LiveVideo | null> {
  const hit = cache.get(channelId);
  if (hit && Date.now() - hit.at < TTL) return hit.v;
  const res = await fetch(`https://www.youtube.com/channel/${channelId}/streams`, {
    headers: {
      "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36",
      "accept-language": "en-US,en;q=0.9",
      cookie: "CONSENT=YES+1; SOCS=CAI",
    },
    signal: AbortSignal.timeout(8000),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`youtube ${res.status}`);
  const v = parseLiveFromStreams(await res.text());
  cache.set(channelId, { at: Date.now(), v });
  return v;
}
