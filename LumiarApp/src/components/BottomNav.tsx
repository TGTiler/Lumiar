import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
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

export function BottomNav({ activeTab, onTabPress }: BottomNavProps) {
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

const styles = StyleSheet.create({
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
});
