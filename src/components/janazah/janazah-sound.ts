"use client";

/**
 * Sound for the Janazah tutorial.
 *
 * Sources, in order of preference for each clip:
 *  1. A human recording at public/audio/janazah/<key>.mp3 — add the file and list its key in RECORDED.
 *  2. al-Fatiha: the recitation of Mishary Rashid Alafasy from Quran.com (the same audio as the Quran reader).
 *  3. Everything else (takbir, Thana, Durood, duas, salam): the device's own Arabic text-to-speech voice.
 * Nothing is ever replaced by a different text: if a clip can't be played it is skipped silently
 * and the page tells the user.
 */

export type ClipKey = "takbir" | "salam" | "fatiha" | "thana" | "durood" | "dua-awf" | "dua-all" | "dua-child";

/** Clips that have a human recording in public/audio/janazah/ (only add recordings you have the right to use). */
export const RECORDED: ClipKey[] = [];

const missing = new Set<string>();
let fatihaUrls: Promise<string[]> | null = null;

function loadFatiha(): Promise<string[]> {
  fatihaUrls ??= fetch("/api/quran/verses?mode=surah&id=1&audio=true&lang=en")
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
    .then((d: { verses: { audioUrl: string | null }[] }) => d.verses.map((v) => v.audioUrl).filter((u): u is string => !!u))
    .catch((e) => {
      fatihaUrls = null; // try again next time
      throw e;
    });
  return fatihaUrls;
}

/** The device's Arabic voice, if it has one (voices load asynchronously on some browsers). */
export function arabicVoice(): Promise<SpeechSynthesisVoice | null> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return Promise.resolve(null);
  const pick = () => {
    const vs = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith("ar"));
    return vs.find((v) => /sa/i.test(v.lang)) ?? vs[0] ?? null;
  };
  const now = pick();
  if (now || window.speechSynthesis.getVoices().length) return Promise.resolve(now);
  return new Promise((resolve) => {
    const done = () => {
      window.speechSynthesis.removeEventListener("voiceschanged", done);
      resolve(pick());
    };
    window.speechSynthesis.addEventListener("voiceschanged", done);
    window.setTimeout(done, 1500);
  });
}

/** Long utterances get cut off on some engines, so speak phrase by phrase. */
const phrases = (text: string) =>
  text
    .split(/[،,.؛]/)
    .map((s) => s.trim())
    .filter(Boolean);

export class JanazahSound {
  private audio: HTMLAudioElement | null = null;
  private token = 0;

  /**
   * Call from the Play click: mobile browsers (iOS especially) only allow sound that a tap
   * started, so the shared audio element and the speech engine are "unlocked" here.
   */
  unlock() {
    this.audio ??= new Audio();
    const a = this.audio;
    if (!a.src) {
      a.src = "/audio/silence.wav";
      a.play().catch(() => {});
    }
    if ("speechSynthesis" in window) window.speechSynthesis.speak(new SpeechSynthesisUtterance(""));
  }

  stop() {
    this.token++;
    if (this.audio) {
      this.audio.pause();
      this.audio.removeAttribute("src");
      this.audio.load();
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
  }

  /** Plays a clip; resolves when it ends, is stopped, or can't be played. Returns whether anything played. */
  async play(key: ClipKey, arabic: string): Promise<boolean> {
    this.stop();
    const token = this.token;
    const live = () => token === this.token;

    if (RECORDED.includes(key) && !missing.has(key)) {
      const ok = await this.file(`/audio/janazah/${key}.mp3`, live);
      if (ok === "played") return true;
      if (ok === "missing") missing.add(key);
      if (!live()) return false;
    }
    if (key === "fatiha") {
      let urls: string[] = [];
      try {
        urls = await loadFatiha();
      } catch {
        return false;
      }
      let any = false;
      for (const u of urls) {
        if (!live()) return any;
        if ((await this.file(u, live)) === "played") any = true;
      }
      return any;
    }
    return this.speak(arabic, live);
  }

  private file(url: string, live: () => boolean): Promise<"played" | "missing" | "stopped"> {
    return new Promise((resolve) => {
      this.audio ??= new Audio();
      const a = this.audio;
      const cleanup = () => {
        a.onended = a.onerror = null;
        window.clearInterval(watch);
      };
      // Stop() changes the token: notice it and resolve.
      const watch = window.setInterval(() => {
        if (!live()) {
          cleanup();
          resolve("stopped");
        }
      }, 150);
      a.onended = () => {
        cleanup();
        resolve("played");
      };
      a.onerror = () => {
        cleanup();
        resolve("missing");
      };
      a.src = url;
      a.play().catch(() => {
        cleanup();
        resolve("missing");
      });
    });
  }

  private async speak(text: string, live: () => boolean): Promise<boolean> {
    const voice = await arabicVoice();
    if (!voice || !live()) return false;
    for (const p of phrases(text)) {
      if (!live()) return true;
      await new Promise<void>((resolve) => {
        const u = new SpeechSynthesisUtterance(p);
        u.voice = voice;
        u.lang = voice.lang;
        u.rate = 0.82;
        u.onend = u.onerror = () => resolve();
        window.speechSynthesis.speak(u);
      });
    }
    return true;
  }
}
