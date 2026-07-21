import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '../constants/theme';
import { api, AppData } from '../services/api';
import { AppListItem } from '../components/AppCard';

export function CategoryScreen({ route, navigation }: any) {
  const { categoryId, categoryName } = route.params;
  const [apps, setApps] = useState<AppData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategoryApps();
  }, [categoryId]);

  const loadCategoryApps = async () => {
    try {
      const allApps = await api.fetchApps();
      const categoryApps = allApps.filter(
        (app) => app.categoria.toLowerCase() === categoryName.toLowerCase()
      );
      setApps(categoryApps);
    } catch (error) {
      console.error('Error loading category apps:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToApp = (app: AppData) => {
    navigation.navigate('AppDetail', { appId: app.ID });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{categoryName}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.appCount}>
            {apps.length} app(s) encontrado(s)
          </Text>
          {apps.length > 0 ? (
            apps.map((app) => (
              <AppListItem key={app.ID} app={app} onPress={() => navigateToApp(app)} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="folder-open-outline" size={64} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>Nenhum app nesta categoria</Text>
              <Text style={styles.emptyText}>
                Volte e explore outras categorias
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    paddingTop: Spacing.xl,
    backgroundColor: Colors.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 100,
  },
  appCount: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl * 2,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginTop: Spacing.lg,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 14,
    marginTop: Spacing.sm,
  },
});
