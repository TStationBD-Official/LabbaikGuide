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
  if (typeof window === "undefined" || !window.speechSynthesis) return Promise.resolve(null);
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

  /** Keeps the current utterance referenced: Chrome drops events of garbage-collected utterances. */
  private utterance: SpeechSynthesisUtterance | null = null;

  /**
   * Call from a tap (Play / Test): mobile browsers (iOS especially) only allow sound that a tap
   * started, so the shared audio element and the speech engine are "unlocked" here.
   */
  unlock() {
    this.audio ??= new Audio();
    const a = this.audio;
    if (!a.getAttribute("src")) {
      a.src = "/audio/silence.wav";
      a.play().catch(() => {});
    }
    if (window.speechSynthesis) {
      const u = new SpeechSynthesisUtterance(".");
      u.volume = 0;
      u.lang = "ar-SA";
      window.speechSynthesis.speak(u);
    }
  }

  stop() {
    this.token++;
    if (this.audio) {
      this.audio.pause();
      this.audio.removeAttribute("src");
      this.audio.load();
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const ss = window.speechSynthesis;
      if (ss.speaking || ss.pending) ss.cancel();
    }
  }

  /** Set after the device voice fails once, so later clips don't wait on it again (cleared by a working test). */
  speechBroken = false;

  /**
   * Plays a clip; resolves when it ends or can't be played.
   * true = played, false = couldn't play, null = stopped by stop()/another clip.
   */
  async play(key: ClipKey, arabic: string): Promise<boolean | null> {
    this.stop();
    const token = this.token;
    const live = () => token === this.token;
    const r = await this.run(key, arabic, live);
    return live() ? r : null;
  }

  private async run(key: ClipKey, arabic: string, live: () => boolean): Promise<boolean> {

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
        const r = await this.file(u, live);
        if (r === "played") any = true;
        else if (r === "missing" && !any) return false;
      }
      return any;
    }
    if (this.speechBroken && key !== "takbir") return false;
    const ok = await this.speak(arabic, live);
    if (live()) this.speechBroken = !ok;
    return ok;
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
        resolve(live() ? "missing" : "stopped");
      };
      a.src = url;
      a.play().catch(() => {
        cleanup();
        resolve(live() ? "missing" : "stopped");
      });
    });
  }

  private async speak(text: string, live: () => boolean): Promise<boolean> {
    if (typeof window === "undefined" || !window.speechSynthesis) return false;
    const voice = await arabicVoice();
    // Some Android browsers never list their voices; then try the Arabic language anyway.
    if (!voice && window.speechSynthesis.getVoices().length > 0) return false;
    if (!live()) return false;
    let spoke = false;
    for (const p of phrases(text)) {
      if (!live()) return spoke;
      const r = await this.utter(p, voice);
      if (r === "error") return spoke;
      spoke = true;
    }
    return spoke;
  }

  /** One phrase. "error" when the browser refuses or never starts speaking (silent failure). */
  private utter(text: string, voice: SpeechSynthesisVoice | null): Promise<"ok" | "error"> {
    return new Promise((resolve) => {
      const ss = window.speechSynthesis;
      const u = new SpeechSynthesisUtterance(text);
      if (voice) u.voice = voice;
      u.lang = voice?.lang ?? "ar-SA";
      u.rate = 0.82;
      u.volume = 1;
      this.utterance = u;
      const finish = (r: "ok" | "error") => {
        window.clearTimeout(guard);
        resolve(r);
      };
      // If speech never starts (a silent failure), don't hold the animation.
      let guard = window.setTimeout(() => finish("error"), 2500);
      u.onstart = () => {
        window.clearTimeout(guard);
        guard = window.setTimeout(() => finish("ok"), 2000 + text.length * 250);
      };
      u.onend = () => finish("ok");
      u.onerror = (e) => finish(e.error === "interrupted" || e.error === "canceled" ? "ok" : "error");
      ss.speak(u);
      // Chrome can leave the queue paused after a cancel.
      if (ss.paused) ss.resume();
    });
  }
}
