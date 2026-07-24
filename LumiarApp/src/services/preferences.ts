import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFS_KEY = '@lumiar_preferences';

export interface UserPreferences {
  subcategoryWeights: Record<string, number>;
  lastInteraction: number;
}

let cachedPrefs: UserPreferences | null = null;

export async function loadPreferences(): Promise<UserPreferences> {
  if (cachedPrefs) return cachedPrefs;
  try {
    const data = await AsyncStorage.getItem(PREFS_KEY);
    if (data) {
      cachedPrefs = JSON.parse(data);
      return cachedPrefs;
    }
  } catch {}
  cachedPrefs = { subcategoryWeights: {}, lastInteraction: Date.now() };
  return cachedPrefs;
}

export async function savePreferences(prefs: UserPreferences): Promise<void> {
  cachedPrefs = prefs;
  await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

export async function incrementPreference(subcategorySlug: string, weight: number = 1): Promise<void> {
  if (!subcategorySlug) return;
  const prefs = await loadPreferences();
  const current = prefs.subcategoryWeights[subcategorySlug] || 0;
  prefs.subcategoryWeights[subcategorySlug] = current + weight;
  prefs.lastInteraction = Date.now();
  await savePreferences(prefs);
}

export async function trackView(subcategorySlug: string): Promise<void> {
  await incrementPreference(subcategorySlug, 1);
}

export async function trackDownload(subcategorySlug: string): Promise<void> {
  await incrementPreference(subcategorySlug, 3);
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function getFeedSorted(apps: any[]): Promise<any[]> {
  const prefs = await loadPreferences();
  const weights = prefs.subcategoryWeights;
  const hasPrefs = Object.keys(weights).length > 0;

  if (!hasPrefs) return shuffle(apps);

  const scored = apps.map(app => ({
    app,
    score: weights[app.SubcategoriaSlug || ''] || 0,
  }));

  scored.sort((a, b) => b.score - a.score);

  const topApps = scored.filter(s => s.score > 0);
  const unprefApps = shuffle(scored.filter(s => s.score === 0));

  return [...topApps.map(s => s.app), ...unprefApps.map(s => s.app)];
}
