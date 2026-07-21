import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../constants/theme';
import { api, AppData, CategoryData } from '../services/api';
import { FeaturedCard, AppListItem } from '../components/AppCard';
import { AvatarIcon, loadProfile, UserProfile } from '../components/ProfileModal';

interface HomeScreenProps {
  navigation: any;
}

function isValidUrl(uri: string): boolean {
  if (!uri || uri.trim() === '') return false;
  if (uri.includes('placeholder.com')) return false;
  return uri.startsWith('http://') || uri.startsWith('https://');
}

function getInitial(name: string): string {
  return (name || '?').charAt(0).toUpperCase();
}

export function HomeScreen({ navigation }: HomeScreenProps) {
  const [apps, setApps] = useState<AppData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AppData[] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile>({ name: 'Usuário', avatarUrl: '' });
  const featuredRef = useRef<FlatList>(null);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  const loadData = useCallback(async () => {
    try {
      const [appsData, categoriesData, profileData] = await Promise.all([
        api.fetchApps(),
        api.fetchCategories(),
        loadProfile(),
      ]);
      setApps(appsData);
      setCategories(categoriesData);
      setProfile(profileData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (navigation.params?.profileUpdated) {
      loadProfile().then(setProfile);
    }
  }, [navigation.params]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length > 0) {
      const results = await api.searchApps(query);
      setSearchResults(results);
    } else {
      setSearchResults(null);
    }
  };

  const navigateToApp = (app: AppData) => {
    navigation.navigate('AppDetail', { appId: app.ID });
  };

  const filteredApps = selectedCategory
    ? apps.filter((a) => a.categoria === selectedCategory)
    : apps;

  const featuredApps = api.getFeaturedApps(apps, 5);

  // Get similar apps for search results
  const getSimilarApps = (targetApp: AppData): AppData[] => {
    return apps.filter(
      (a) =>
        a.ID !== targetApp.ID &&
        (a.categoria === targetApp.categoria ||
          a.CategoriaSlug === targetApp.CategoriaSlug ||
          a.SubcategoriaSlug === targetApp.SubcategoriaSlug)
    ).slice(0, 8);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Carregando Lumiar...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Bem-vindo ao</Text>
              <Text style={styles.title}>Lumiar Store</Text>
            </View>
            <TouchableOpacity
              style={styles.avatarButton}
              onPress={() => navigation.navigate('ProfileModal')}
            >
              <AvatarIcon name={profile.name} size={40} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar apps..."
              placeholderTextColor={Colors.textMuted}
              value={searchQuery}
              onChangeText={handleSearch}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch('')}>
                <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category Chips */}
        {!searchResults && (
          <View style={styles.chipsSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsList}>
              <TouchableOpacity
                style={[styles.chip, !selectedCategory && styles.chipActive]}
                onPress={() => setSelectedCategory(null)}
              >
                <Text style={[styles.chipText, !selectedCategory && styles.chipTextActive]}>Todos</Text>
              </TouchableOpacity>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.slug}
                  style={[styles.chip, selectedCategory === cat.nome && styles.chipActive]}
                  onPress={() => setSelectedCategory(selectedCategory === cat.nome ? null : cat.nome)}
                >
                  <Text style={styles.chipIcon}>{cat.icon}</Text>
                  <Text style={[styles.chipText, selectedCategory === cat.nome && styles.chipTextActive]}>
                    {cat.nome}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Search Results */}
        {searchResults !== null ? (
          <View style={styles.section}>
            {searchResults.length > 0 ? (
              <>
                {/* Featured Search Result */}
                {searchResults.length > 0 && (
                  <View style={styles.searchFeatured}>
                    <TouchableOpacity
                      style={styles.searchFeaturedCard}
                      onPress={() => navigateToApp(searchResults[0])}
                      activeOpacity={0.7}
                    >
                      <View style={styles.searchFeaturedTop}>
                        {isValidUrl(searchResults[0].logo) ? (
                          <Image
                            source={{ uri: searchResults[0].logo }}
                            style={styles.searchFeaturedLogo}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.searchFeaturedFallback}>
                            <Text style={styles.searchFeaturedFallbackText}>
                              {getInitial(searchResults[0].NomeAPP)}
                            </Text>
                          </View>
                        )}
                        <View style={styles.searchFeaturedInfo}>
                          <Text style={styles.searchFeaturedName}>{searchResults[0].NomeAPP}</Text>
                          <Text style={styles.searchFeaturedDesc} numberOfLines={2}>
                            {searchResults[0].Descricao || searchResults[0].descricao || ''}
                          </Text>
                          <View style={styles.searchFeaturedMeta}>
                            <Text style={styles.searchFeaturedVersion}>v{searchResults[0].Versao}</Text>
                            <View style={styles.searchFeaturedBadge}>
                              <Text style={styles.searchFeaturedBadgeText}>{searchResults[0].categoria}</Text>
                            </View>
                          </View>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.searchInstallBtn}
                        onPress={() => navigateToApp(searchResults[0])}
                      >
                        <Ionicons name="download-outline" size={18} color={Colors.text} />
                        <Text style={styles.searchInstallText}>Instalar</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Similar Apps */}
                {(() => {
                  const similar = getSimilarApps(searchResults[0]);
                  if (similar.length === 0) return null;
                  return (
                    <View style={styles.similarSection}>
                      <Text style={styles.sectionTitle}>Semelhantes nesta categoria</Text>
                      <FlatList
                        data={similar}
                        keyExtractor={(item) => item.ID}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.similarList}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={styles.similarCard}
                            onPress={() => navigateToApp(item)}
                            activeOpacity={0.7}
                          >
                            {isValidUrl(item.logo) ? (
                              <Image source={{ uri: item.logo }} style={styles.similarLogo} resizeMode="cover" />
                            ) : (
                              <View style={styles.similarFallback}>
                                <Text style={styles.similarFallbackText}>{getInitial(item.NomeAPP)}</Text>
                              </View>
                            )}
                            <Text style={styles.similarName} numberOfLines={1}>{item.NomeAPP}</Text>
                            <Text style={styles.similarVersion}>v{item.Versao}</Text>
                          </TouchableOpacity>
                        )}
                      />
                    </View>
                  );
                })()}

                {/* Other results */}
                {searchResults.length > 1 && (
                  <View style={styles.otherResults}>
                    <Text style={styles.sectionTitle}>Outros resultados</Text>
                    {searchResults.slice(1).map((app) => (
                      <AppListItem key={app.ID} app={app} onPress={() => navigateToApp(app)} />
                    ))}
                  </View>
                )}
              </>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={48} color={Colors.textMuted} />
                <Text style={styles.emptyText}>Nenhum app encontrado</Text>
              </View>
            )}
          </View>
        ) : (
          <>
            {/* Featured Section */}
            {!selectedCategory && featuredApps.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Destaques</Text>
                  <Text style={styles.sectionCount}>{featuredApps.length} apps</Text>
                </View>
                <FlatList
                  ref={featuredRef}
                  data={featuredApps}
                  keyExtractor={(item) => item.ID}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={300}
                  snapToAlignment="center"
                  decelerationRate="fast"
                  contentContainerStyle={styles.featuredList}
                  onViewableItemsChanged={({ viewableItems }) => {
                    if (viewableItems.length > 0 && viewableItems[0].index != null) {
                      setFeaturedIndex(viewableItems[0].index);
                    }
                  }}
                  viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
                  renderItem={({ item }) => (
                    <FeaturedCard app={item} onPress={() => navigateToApp(item)} />
                  )}
                />
                {featuredApps.length > 1 && (
                  <View style={styles.dotsContainer}>
                    {featuredApps.map((_, i) => (
                      <View
                        key={i}
                        style={[styles.dot, i === featuredIndex && styles.dotActive]}
                      />
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* All Apps / Filtered */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {selectedCategory ? selectedCategory : 'Todos os Apps'}
              </Text>
              {filteredApps.map((app) => (
                <AppListItem key={app.ID} app={app} onPress={() => navigateToApp(app)} />
              ))}
              {filteredApps.length === 0 && (
                <View style={styles.emptyState}>
                  <Ionicons name="folder-open-outline" size={48} color={Colors.textMuted} />
                  <Text style={styles.emptyText}>Nenhum app nesta categoria</Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: Colors.textSecondary, marginTop: Spacing.md, fontSize: 16 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 120 },
  header: { paddingHorizontal: Spacing.md, paddingTop: Spacing.xl, paddingBottom: Spacing.sm },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  greeting: { color: Colors.textSecondary, fontSize: 13 },
  title: { color: Colors.text, fontSize: 26, fontWeight: 'bold' },
  avatarButton: { width: 40, height: 40, borderRadius: 20, overflow: 'hidden' },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, height: 44,
    borderWidth: 1, borderColor: Colors.border,
  },
  searchInput: { flex: 1, height: 44, color: Colors.text, fontSize: 15, marginLeft: Spacing.sm },
  chipsSection: { paddingVertical: Spacing.sm },
  chipsList: { paddingHorizontal: Spacing.md, gap: Spacing.sm },
  chip: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.chipInactive,
    borderRadius: BorderRadius.xl, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderWidth: 1, borderColor: Colors.chipBorder, gap: Spacing.xs,
  },
  chipActive: { backgroundColor: Colors.chipActive, borderColor: Colors.chipActive },
  chipIcon: { fontSize: 14 },
  chipText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '500' },
  chipTextActive: { color: Colors.text, fontWeight: '600' },
  section: { marginTop: Spacing.sm, paddingHorizontal: Spacing.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  sectionTitle: { color: Colors.text, fontSize: 18, fontWeight: 'bold' },
  sectionCount: { color: Colors.textMuted, fontSize: 12 },
  featuredList: { paddingBottom: Spacing.sm },
  dotsContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.sm, gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.textMuted },
  dotActive: { backgroundColor: Colors.primary, width: 16 },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyText: { color: Colors.textMuted, fontSize: 15, marginTop: Spacing.md },

  // Search Featured
  searchFeatured: { marginBottom: Spacing.lg },
  searchFeaturedCard: {
    backgroundColor: Colors.backgroundCard, borderRadius: BorderRadius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.primary + '40',
  },
  searchFeaturedTop: { flexDirection: 'row', marginBottom: Spacing.md },
  searchFeaturedLogo: { width: 72, height: 72, borderRadius: BorderRadius.md, backgroundColor: Colors.surface },
  searchFeaturedFallback: {
    width: 72, height: 72, borderRadius: BorderRadius.md, backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  searchFeaturedFallbackText: { color: Colors.text, fontSize: 28, fontWeight: 'bold' },
  searchFeaturedInfo: { flex: 1, marginLeft: Spacing.md },
  searchFeaturedName: { color: Colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 2 },
  searchFeaturedDesc: { color: Colors.textSecondary, fontSize: 13, marginBottom: 6 },
  searchFeaturedMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  searchFeaturedVersion: { color: Colors.textMuted, fontSize: 12 },
  searchFeaturedBadge: { backgroundColor: Colors.primary + '25', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  searchFeaturedBadgeText: { color: Colors.primaryLight, fontSize: 11, fontWeight: '500' },
  searchInstallBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.primary, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, gap: Spacing.sm,
  },
  searchInstallText: { color: Colors.text, fontSize: 15, fontWeight: '700' },

  // Similar Apps
  similarSection: { marginBottom: Spacing.lg },
  similarList: { paddingBottom: Spacing.sm, gap: Spacing.sm },
  similarCard: {
    width: 100, alignItems: 'center', backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md, padding: Spacing.sm, borderWidth: 1, borderColor: Colors.border,
  },
  similarLogo: { width: 56, height: 56, borderRadius: BorderRadius.md, backgroundColor: Colors.surface, marginBottom: Spacing.xs },
  similarFallback: {
    width: 56, height: 56, borderRadius: BorderRadius.md, backgroundColor: Colors.primary + '30',
    justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.xs,
  },
  similarFallbackText: { color: Colors.primaryLight, fontSize: 20, fontWeight: 'bold' },
  similarName: { color: Colors.text, fontSize: 12, fontWeight: '600', textAlign: 'center' },
  similarVersion: { color: Colors.textMuted, fontSize: 10, marginTop: 2 },

  otherResults: { marginTop: Spacing.sm },
});
