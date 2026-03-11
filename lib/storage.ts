import { DEFAULT_PREFERENCES, LOCAL_STORAGE_KEYS } from "@/lib/constants";
import { SavedSession, UserPreferences } from "@/lib/types";

function canUseLocalStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadPreferences(): UserPreferences {
  if (!canUseLocalStorage()) {
    return DEFAULT_PREFERENCES;
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEYS.preferences);
    if (!raw) {
      return DEFAULT_PREFERENCES;
    }
    const parsed = JSON.parse(raw) as Partial<UserPreferences>;
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
      platforms: {
        ...DEFAULT_PREFERENCES.platforms,
        ...parsed.platforms
      }
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(preferences: UserPreferences): void {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.setItem(LOCAL_STORAGE_KEYS.preferences, JSON.stringify(preferences));
}

export function loadLastSession(): SavedSession | null {
  if (!canUseLocalStorage()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEYS.lastSession);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as SavedSession;
  } catch {
    return null;
  }
}

export function saveLastSession(session: SavedSession): void {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.setItem(LOCAL_STORAGE_KEYS.lastSession, JSON.stringify(session));
}

export function clearLastSession(): void {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.removeItem(LOCAL_STORAGE_KEYS.lastSession);
}
