"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { QcfVersion } from "@/lib/preferences";

/** Font file variant (v4 = Tajweed, COLRv1 colour glyphs). */
export type QcfVariant = "v1" | "v2" | "v4";

/** CSS family name of one Mushaf page font. */
export const qcfFamily = (variant: QcfVariant, page: number) => `qcf-${variant}-p${page}`;

const loaded = new Set<string>();

/**
 * Tajweed (v4) fonts carry two colour palettes: 0 for light backgrounds (black
 * text) and 1 for dark backgrounds (white text, adjusted rule colours).
 * `@font-palette-values` must name the family, so one rule is added per page
 * font through a constructed stylesheet (allowed under our CSP).
 */
let paletteSheet: CSSStyleSheet | null = null;
function addDarkPalette(family: string) {
  try {
    if (!paletteSheet) {
      paletteSheet = new CSSStyleSheet();
      document.adoptedStyleSheets = [...document.adoptedStyleSheets, paletteSheet];
    }
    // Embedded palettes: 0 light, 1 dark, 2 sepia.
    paletteSheet.insertRule(`@font-palette-values --${family}-dark { font-family: "${family}"; base-palette: 1; }`);
    paletteSheet.insertRule(`@font-palette-values --${family}-sepia { font-family: "${family}"; base-palette: 2; }`);
  } catch {
    /* older browsers: the light palette is used */
  }
}

/** `font-palette` for a Tajweed glyph on the current background. */
export const qcfPalette = (variant: QcfVariant, page: number, tone: "light" | "dark" | "sepia") =>
  variant === "v4" && tone !== "light" ? `--${qcfFamily(variant, page)}-${tone}` : undefined;
const pending = new Map<string, Promise<boolean>>();

function loadPage(variant: QcfVariant, page: number): Promise<boolean> {
  const family = qcfFamily(variant, page);
  if (loaded.has(family)) return Promise.resolve(true);
  const existing = pending.get(family);
  if (existing) return existing;
  const p = (async () => {
    try {
      const face = new FontFace(family, `url(/qcf/${variant}/${page}.woff2) format("woff2")`, { display: "block" });
      await face.load();
      document.fonts.add(face);
      if (variant === "v4") addDarkPalette(family);
      loaded.add(family);
      return true;
    } catch {
      return false;
    } finally {
      pending.delete(family);
    }
  })();
  pending.set(family, p);
  return p;
}

export const qcfVariantFor = (version: QcfVersion): QcfVariant => version;

/**
 * Loads the page fonts for the given pages and reports which are ready.
 * Until a page's font is ready its verses are shown in Unicode text, so a
 * glyph is never drawn with a missing or wrong font.
 */
export function useQcfFonts(variant: QcfVariant | null, pages: number[]) {
  const key = useMemo(() => [...new Set(pages)].sort((a, b) => a - b).join(","), [pages]);
  const [ready, setReady] = useState<Set<string>>(() => new Set(loaded));

  useEffect(() => {
    if (!variant || !key) return;
    let cancelled = false;
    const list = key.split(",").map(Number);
    // Load in reading order, a few at a time.
    (async () => {
      for (let i = 0; i < list.length; i += 4) {
        await Promise.all(list.slice(i, i + 4).map((p) => loadPage(variant, p)));
        if (!cancelled) setReady(new Set(loaded));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [variant, key]);

  return useCallback((page: number) => (variant ? ready.has(qcfFamily(variant, page)) : false), [variant, ready]);
}
