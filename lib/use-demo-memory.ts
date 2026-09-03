"use client";

import { useSyncExternalStore } from "react";

/** Remembers the last brand demo a visitor opened, so the main site can offer a way back to
 *  it if they navigate away (e.g. by clicking a nav link on the demo page itself) — without
 *  this, the only way back to a /demo/<brandId> link is having the original URL again, which
 *  is otherwise unguessable by design (see config/brands.json). Per-browser only
 *  (localStorage), never sent anywhere; one brand's demo link is still never discoverable
 *  from another's.
 *
 *  localStorage is an external store, so it's read through useSyncExternalStore rather than
 *  an effect: that gives a null server snapshot (no hydration mismatch), keeps the value in
 *  sync across tabs via the `storage` event, and avoids a setState-in-effect cascade. */

const STORAGE_KEY = "styld_last_demo";
/** Same-tab writes don't fire `storage`, so we dispatch our own event alongside it. */
const CHANGE_EVENT = "styld:demo-memory";

export interface RememberedDemo {
  brandId: string;
  brand: string;
  savedAt: number;
}

// getSnapshot must be referentially stable between real changes, or React re-renders
// forever — so the parsed object is cached against the raw string it came from.
let cachedRaw: string | null = null;
let cachedValue: RememberedDemo | null = null;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // Private browsing / disabled storage — the chip just never appears. Non-critical.
    return null;
  }
}

function parse(raw: string | null): RememberedDemo | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<RememberedDemo>;
    if (typeof parsed.brandId !== "string" || typeof parsed.brand !== "string") return null;
    return { brandId: parsed.brandId, brand: parsed.brand, savedAt: parsed.savedAt ?? 0 };
  } catch {
    return null;
  }
}

function getSnapshot(): RememberedDemo | null {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedValue = parse(raw);
  }
  return cachedValue;
}

function getServerSnapshot(): RememberedDemo | null {
  return null;
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function announce(): void {
  try {
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // Nothing to do — a failed notify only means this tab won't live-update.
  }
}

export function rememberDemo(brandId: string, brand: string): void {
  try {
    const payload: RememberedDemo = { brandId, brand, savedAt: Date.now() };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    announce();
  } catch {
    // Storage unavailable; nothing to remember.
  }
}

export function forgetDemo(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    announce();
  } catch {
    // Nothing to do.
  }
}

/** Null on the server and on the first client render, then the remembered demo if any. */
export function useRememberedDemo(): RememberedDemo | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
