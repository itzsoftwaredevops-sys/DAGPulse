// Simple localStorage-based preferences store
type Preferences = {
  autoRefresh: boolean;
  refreshInterval: number; // milliseconds
  theme: "dark" | "light";
  compactView: boolean;
};

const DEFAULTS: Preferences = {
  autoRefresh: true,
  refreshInterval: 2000,
  theme: "dark",
  compactView: false,
};

const STORAGE_KEY = "dagpulse-preferences";

export const preferencesStore = {
  get(): Preferences {
    if (typeof window === "undefined") return DEFAULTS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  },

  set(preferences: Partial<Preferences>): void {
    if (typeof window === "undefined") return;
    try {
      const current = this.get();
      const updated = { ...current, ...preferences };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to save preferences:", error);
    }
  },

  subscribe(callback: (prefs: Preferences) => void): () => void {
    callback(this.get());
    const handleStorageChange = () => callback(this.get());
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  },
};
