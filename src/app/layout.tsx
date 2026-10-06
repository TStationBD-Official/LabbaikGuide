import type { Metadata, Viewport } from "next";
import "./globals.css";
import { APP_CONFIG } from "@/config/app";
import { htmlAttributes } from "@/lib/preferences";
import { getServerT } from "@/i18n/server";
import { AppProviders } from "@/components/providers/app-providers";
import { AppShell } from "@/components/layout/app-shell";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerT();
  return {
    metadataBase: new URL(APP_CONFIG.siteUrl),
    title: { default: `${t("app.name")} — ${t("app.tagline")}`, template: `%s · ${t("app.name")}` },
    description: APP_CONFIG.description,
    applicationName: APP_CONFIG.name,
    manifest: "/manifest.webmanifest",
    appleWebApp: { capable: true, title: APP_CONFIG.shortName, statusBarStyle: "black-translucent" },
    formatDetection: { telephone: false },
    icons: {
      icon: [
        { url: "/icons/icon.svg", type: "image/svg+xml" },
        { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      ],
      apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
    },
    openGraph: { type: "website", siteName: APP_CONFIG.name },
    twitter: { card: "summary_large_image" },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0f5c45" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1511" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Preferences come from a cookie so theme, language, direction and fonts are
  // correct on the first server-rendered paint (no flash).
  const { prefs, messages } = await getServerT();
  const attrs = htmlAttributes(prefs);

  return (
    <html {...attrs} suppressHydrationWarning>
      <body className="antialiased">
        <AppProviders prefs={prefs} messages={messages}>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
