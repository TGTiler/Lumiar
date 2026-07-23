import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFS_KEY = '@lumiar_preferences';

export interface UserPreferences {
  subcategoryWeights: Record<string, number>;
}

export async function loadPreferences(): Promise<UserPreferences> {
  try {
    const data = await AsyncStorage.getItem(PREFS_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  return { subcategoryWeights: {} };
}

export async function incrementPreference(subcategorySlug: string): Promise<void> {
  try {
    const prefs = await loadPreferences();
    const current = prefs.subcategoryWeights[subcategorySlug] || 0;
    prefs.subcategoryWeights[subcategorySlug] = current + 1;
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {}
}

export async function trackView(subcategorySlug: string): Promise<void> {
  await incrementPreference(subcategorySlug);
}

export async function trackDownload(subcategorySlug: string): Promise<void> {
  try {
    const prefs = await loadPreferences();
    const current = prefs.subcategoryWeights[subcategorySlug] || 0;
    prefs.subcategoryWeights[subcategorySlug] = current + 3;
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {}
}

// Fisher-Yates shuffle
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

  // If no preferences, shuffle randomly
  const hasPrefs = Object.keys(weights).length > 0;
  if (!hasPrefs) {
    return shuffle(apps);
  }

  // Sort by subcategory weight, then shuffle within same weight
  const scored = apps.map(app => ({
    app,
    score: weights[app.SubcategoriaSlug || ''] || 0,
  }));

  scored.sort((a, b) => b.score - a.score);

  // Mix: top weighted apps first, then randomize rest
  const topApps = scored.filter(s => s.score > 0);
  const unprefApps = shuffle(scored.filter(s => s.score === 0));

  return [...topApps.map(s => s.app), ...unprefApps.map(s => s.app)];
}
