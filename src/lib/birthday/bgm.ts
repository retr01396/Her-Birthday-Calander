import { MUSIC } from "./config";

/**
 * Shared background-music singleton.
 * One audio element for the whole site so the song keeps playing
 * seamlessly across page navigations and is never played twice.
 */

let audio: HTMLAudioElement | null = null;

declare global {
  interface Window {
    __bgm?: HTMLAudioElement;
  }
}

export function getBgmAudio(): HTMLAudioElement {
  if (!audio) {
    const src = MUSIC.playlist[0]?.src ?? "/birthday/audio/lofi.mp3";
    audio = new Audio(src);
    audio.loop = MUSIC.loop ?? true; // plays until the site is closed
    audio.preload = "auto";
    audio.volume = 0.65;
    if (typeof window !== "undefined") window.__bgm = audio; // debug/inspect handle
  }
  return audio;
}

/** Try to start playback (must be called from a user gesture). */
export async function startBgm(): Promise<boolean> {
  const a = getBgmAudio();
  try {
    await a.play();
    return true;
  } catch {
    return false;
  }
}

export function pauseBgm() {
  getBgmAudio().pause();
}

export function isBgmPlaying(): boolean {
  return !getBgmAudio().paused;
}
