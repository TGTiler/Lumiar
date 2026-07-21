import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing } from '../constants/theme';
import { AppData } from '../services/api';

const { width } = Dimensions.get('window');
const FEATURED_CARD_WIDTH = width * 0.82;
const SCREENSHOT_WIDTH = width * 0.65;

function getInitial(name: string): string {
  return (name || '?').charAt(0).toUpperCase();
}

function isValidUrl(uri: string): boolean {
  if (!uri || uri.trim() === '') return false;
  if (uri.includes('placeholder.com')) return false;
  return uri.startsWith('http://') || uri.startsWith('https://');
}

// ─── AppLogo (used in featured and list) ───
function AppLogo({ uri, name, size, radius }: { uri: string; name: string; size: number; radius?: number }) {
  const [hasError, setHasError] = React.useState(false);
  const r = radius ?? size / 2;

  if (hasError || !isValidUrl(uri)) {
    return (
      <View style={[styles.fallbackLogo, { width: size, height: size, borderRadius: r }]}>
        <Text style={[styles.fallbackText, { fontSize: size * 0.4 }]}>{getInitial(name)}</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={{ width: size, height: size, borderRadius: r, backgroundColor: Colors.surface }}
      resizeMode="cover"
      onError={() => setHasError(true)}
    />
  );
}

// ─── Featured Card (compact, horizontal, snap) ───
interface FeaturedCardProps {
  app: AppData;
  onPress: () => void;
}

export function FeaturedCard({ app, onPress }: FeaturedCardProps) {
  return (
    <TouchableOpacity style={styles.featuredCard} onPress={onPress} activeOpacity={0.7}>
      <AppLogo uri={app.logo} name={app.NomeAPP} size={64} radius={BorderRadius.md} />
      <View style={styles.featuredInfo}>
        <Text style={styles.featuredName} numberOfLines={1}>{app.NomeAPP}</Text>
        <Text style={styles.featuredDesc} numberOfLines={1}>
          {app.Descricao || app.descricao || ''}
        </Text>
        <View style={styles.featuredMeta}>
          <Text style={styles.featuredVersion}>v{app.Versao}</Text>
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredBadgeText}>{app.categoria}</Text>
          </View>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}

// ─── App List Item (for "All Apps") ───
interface AppListItemProps {
  app: AppData;
  onPress: () => void;
}

export function AppListItem({ app, onPress }: AppListItemProps) {
  return (
    <TouchableOpacity style={styles.listItem} onPress={onPress} activeOpacity={0.7}>
      <AppLogo uri={app.logo} name={app.NomeAPP} size={52} radius={BorderRadius.md} />
      <View style={styles.listInfo}>
        <Text style={styles.listName} numberOfLines={1}>{app.NomeAPP}</Text>
        <Text style={styles.listDescription} numberOfLines={1}>
          {app.Descricao || app.descricao || ''}
        </Text>
        <View style={styles.listMeta}>
          <Text style={styles.listVersion}>v{app.Versao}</Text>
          <View style={styles.listBadge}>
            <Text style={styles.listBadgeText}>{app.categoria}</Text>
          </View>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}

// ─── Screenshot Item ───
interface ScreenshotProps {
  uri: string;
  name: string;
}

export function ScreenshotItem({ uri, name }: ScreenshotProps) {
  const [hasError, setHasError] = React.useState(false);

  if (hasError || !isValidUrl(uri)) {
    return (
      <View style={styles.screenshotFallback}>
        <Text style={styles.screenshotFallbackText}>{getInitial(name)}</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={styles.screenshot}
      resizeMode="cover"
      onError={() => setHasError(true)}
    />
  );
}

const styles = StyleSheet.create({
  // Fallback
  fallbackLogo: {
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    color: Colors.text,
    fontWeight: 'bold',
  },

  // Featured Card (compact)
  featuredCard: {
    width: FEATURED_CARD_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginRight: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featuredInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  featuredName: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  featuredDesc: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 6,
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  featuredVersion: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  featuredBadge: {
    backgroundColor: Colors.primary + '25',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  featuredBadgeText: {
    color: Colors.primaryLight,
    fontSize: 10,
    fontWeight: '500',
  },

  // List Item
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  listInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  listName: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  listDescription: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  listMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  listVersion: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  listBadge: {
    backgroundColor: Colors.primary + '25',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  listBadgeText: {
    color: Colors.primaryLight,
    fontSize: 10,
  },

  // Screenshot
  screenshot: {
    width: SCREENSHOT_WIDTH,
    height: 200,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    marginRight: Spacing.sm,
  },
  screenshotFallback: {
    width: SCREENSHOT_WIDTH,
    height: 200,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  screenshotFallbackText: {
    color: Colors.primaryLight,
    fontSize: 40,
    fontWeight: 'bold',
    opacity: 0.4,
  },
});
