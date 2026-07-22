import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../constants/theme';

interface BottomNavProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
}

const tabs = [
  { id: 'home', label: 'Início', icon: 'home' as const, iconOutline: 'home-outline' as const },
  { id: 'settings', label: 'Config', icon: 'settings' as const, iconOutline: 'settings-outline' as const },
];

function isLandscape(): boolean {
  const { width, height } = Dimensions.get('window');
  return width > height;
}

export function BottomNav({ activeTab, onTabPress }: BottomNavProps) {
  const landscape = isLandscape();

  if (landscape) {
    return (
      <View style={styles.sidebar}>
        <View style={styles.sidebarInner}>
          {/* Logo */}
          <View style={styles.sidebarLogo}>
            <Text style={styles.sidebarLogoText}>L</Text>
          </View>

          {/* Nav Items */}
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.sidebarTab, isActive && styles.sidebarTabActive]}
                onPress={() => onTabPress(tab.id)}
                activeOpacity={0.7}
                focusable={true}
              >
                <Ionicons
                  name={isActive ? tab.icon : tab.iconOutline}
                  size={22}
                  color={isActive ? Colors.primary : Colors.textMuted}
                />
                <Text style={[styles.sidebarLabel, isActive && styles.sidebarLabelActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tab}
              onPress={() => onTabPress(tab.id)}
              activeOpacity={0.7}
              focusable={true}
            >
              <Ionicons
                name={isActive ? tab.icon : tab.iconOutline}
                size={24}
                color={isActive ? Colors.primary : Colors.textMuted}
              />
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {tab.label}
              </Text>
              {isActive && <View style={styles.activeDot} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const SIDEBAR_WIDTH = 72;

const styles = StyleSheet.create({
  // Portrait - Bottom Nav
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingHorizontal: Spacing.lg,
  },
  inner: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundLight,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    position: 'relative',
  },
  label: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  labelActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  activeDot: {
    position: 'absolute',
    bottom: -4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },

  // Landscape - Sidebar
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: Colors.backgroundLight,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    zIndex: 100,
  },
  sidebarInner: {
    flex: 1,
    alignItems: 'center',
    paddingTop: Spacing.xxl + Spacing.md,
    gap: Spacing.lg,
  },
  sidebarLogo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sidebarLogoText: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  sidebarTab: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    width: 56,
  },
  sidebarTabActive: {
    backgroundColor: Colors.primary + '20',
  },
  sidebarLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 4,
  },
  sidebarLabelActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
