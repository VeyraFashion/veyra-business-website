/** Remembers the last brand demo a visitor opened, so the main site can offer a way back to
 *  it if they navigate away (e.g. by clicking a nav link on the demo page itself) — without
 *  this, the only way back to a /demo/<brandId> link is having the original URL again, which
 *  is otherwise unguessable by design (see config/brands.json). Per-browser only (localStorage),
 *  never sent anywhere; one brand's demo link is still never discoverable from another's. */

const STORAGE_KEY = "styld_last_demo";

export interface RememberedDemo {
  brandId: string;
  brand: string;
  savedAt: number;
}

export function rememberDemo(brandId: string, brand: string): void {
  try {
    const payload: RememberedDemo = { brandId, brand, savedAt: Date.now() };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Private browsing / disabled storage — the return chip just won't appear. Non-critical.
  }
}

export function recallDemo(): RememberedDemo | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<RememberedDemo>;
    if (typeof parsed.brandId !== "string" || typeof parsed.brand !== "string") return null;
    return { brandId: parsed.brandId, brand: parsed.brand, savedAt: parsed.savedAt ?? 0 };
  } catch {
    return null;
  }
}

export function forgetDemo(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to do if storage is unavailable.
  }
}
