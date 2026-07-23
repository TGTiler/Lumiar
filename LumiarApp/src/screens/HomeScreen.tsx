import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  FlatList,
  Animated,
  Keyboard,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../constants/theme';
import { api, AppData, CategoryData } from '../services/api';
import { FeaturedCard, AppListItem } from '../components/AppCard';
import { AvatarIcon, loadProfile, UserProfile } from '../components/ProfileModal';
import { getFeedSorted } from '../services/preferences';

interface HomeScreenProps {
  navigation: any;
  resetKey?: number;
}

function isValidUrl(uri: string): boolean {
  if (!uri || uri.trim() === '') return false;
  if (uri.includes('placeholder.com')) return false;
  return uri.startsWith('http://') || uri.startsWith('https://');
}

function getInitial(name: string): string {
  return (name || '?').charAt(0).toUpperCase();
}

function isLandscape(): boolean {
  const { width, height } = Dimensions.get('window');
  return width > height;
}

const PAGE_SIZE = 15;

export function HomeScreen({ navigation, resetKey }: HomeScreenProps) {
  const [apps, setApps] = useState<AppData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AppData[] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile>({ name: 'Usuário', avatarUrl: '' });
  const featuredRef = useRef<FlatList>(null);
  const scrollRef = useRef<ScrollView>(null);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const headerHidden = useRef(false);
  const savedScrollY = useRef(0);
  const [landscape, setLandscape] = useState(isLandscape());

  // Pagination state
  const [displayedApps, setDisplayedApps] = useState<AppData[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const sub = Dimensions.addEventListener('change', ({ window }) => {
      setLandscape(window.width > window.height);
    });
    return () => sub?.remove();
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [appsData, categoriesData, profileData] = await Promise.all([
        api.fetchApps(),
        api.fetchCategories(),
        loadProfile(),
      ]);
      const sortedApps = await getFeedSorted(appsData);
      setApps(sortedApps);
      setCategories(categoriesData);
      setProfile(profileData);
      setDisplayedApps(sortedApps.slice(0, PAGE_SIZE));
      setHasMore(sortedApps.length > PAGE_SIZE);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (navigation.params?.profileUpdated) {
      loadProfile().then(setProfile);
    }
    // Restore scroll position when returning from detail
    if (navigation.params?.returning && savedScrollY.current > 0) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: savedScrollY.current, animated: false });
      }, 100);
    }
  }, [navigation.params]);

  useEffect(() => {
    if (resetKey && resetKey > 0) {
      setSearchQuery('');
      setSearchResults(null);
      setSelectedCategory(null);
      setDisplayedApps(apps.slice(0, PAGE_SIZE));
      setHasMore(apps.length > PAGE_SIZE);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      headerHidden.current = false;
      Animated.timing(headerTranslateY, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    }
  }, [resetKey]);

  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const currentY = contentOffset.y;
    const diff = currentY - lastScrollY.current;

    // Header hide/show on scroll
    if (diff > 10 && !headerHidden.current && currentY > 50) {
      headerHidden.current = true;
      Animated.timing(headerTranslateY, { toValue: -200, duration: 300, useNativeDriver: true }).start();
    } else if (diff < -10 && headerHidden.current) {
      headerHidden.current = false;
      Animated.timing(headerTranslateY, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    }
    lastScrollY.current = currentY;
    savedScrollY.current = currentY;

    // Infinite scroll: load more when near bottom
    const distanceFromBottom = contentSize.height - layoutMeasurement.height - currentY;
    if (distanceFromBottom < 200 && !loadingMore && hasMore && searchResults === null && !selectedCategory) {
      loadMoreApps();
    }
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

  // Pagination
  const loadMoreApps = useCallback(() => {
    if (loadingMore || !hasMore || searchResults !== null) return;
    setLoadingMore(true);
    setTimeout(() => {
      const currentLength = displayedApps.length;
      const nextBatch = apps.slice(currentLength, currentLength + PAGE_SIZE);
      if (nextBatch.length > 0) {
        setDisplayedApps((prev) => [...prev, ...nextBatch]);
        setHasMore(currentLength + nextBatch.length < apps.length);
      } else {
        setHasMore(false);
      }
      setLoadingMore(false);
    }, 300);
  }, [displayedApps, apps, loadingMore, hasMore, searchResults]);

  const filteredApps = selectedCategory
    ? apps.filter((a) => a.categoria === selectedCategory)
    : displayedApps;

  const featuredApps = api.getFeaturedApps(apps, 5);

  const getSimilarApps = (targetApp: AppData): AppData[] => {
    const targetSlug = targetApp.CategoriaSlug || '';
    const targetSubSlug = targetApp.SubcategoriaSlug || '';
    return apps.filter(
      (a) =>
        a.ID !== targetApp.ID &&
        ((targetSlug && a.CategoriaSlug === targetSlug) ||
         (targetSubSlug && a.SubcategoriaSlug === targetSubSlug))
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Carregando Lumiar...</Text>
      </View>
    );
  }

  // Landscape render
  if (landscape) {
    return (
      <View style={styles.landscapeContainer}>
        <View style={styles.landscapeContent}>
          {/* Header */}
          <View style={styles.landscapeHeader}>
            <View>
              <Text style={styles.title}>Lumiar Store</Text>
            </View>
            <TouchableOpacity
              style={styles.avatarButton}
              onPress={() => navigation.navigate('ProfileModal')}
            >
              <AvatarIcon name={profile.name} size={36} />
            </TouchableOpacity>
          </View>

          {/* Search */}
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

          {/* Category Chips */}
          {!searchResults && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsList}>
              <TouchableOpacity
                style={[styles.chip, !selectedCategory && styles.chipActive]}
                onPress={() => setSelectedCategory(null)}
                focusable={true}
              >
                <Text style={[styles.chipText, !selectedCategory && styles.chipTextActive]}>Todos</Text>
              </TouchableOpacity>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.slug}
                  style={[styles.chip, selectedCategory === cat.nome && styles.chipActive]}
                  onPress={() => setSelectedCategory(selectedCategory === cat.nome ? null : cat.nome)}
                  focusable={true}
                >
                  <Text style={styles.chipIcon}>{cat.icon}</Text>
                  <Text style={[styles.chipText, selectedCategory === cat.nome && styles.chipTextActive]}>
                    {cat.nome}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Search Results or All Apps - Landscape Grid */}
          {searchResults !== null ? (
            <ScrollView style={styles.landscapeScrollView}>
              {searchResults.length > 0 ? (
                <>
                  {/* Featured */}
                  <TouchableOpacity
                    style={styles.landscapeFeatured}
                    onPress={() => navigateToApp(searchResults[0])}
                    focusable={true}
                  >
                    <Image source={{ uri: searchResults[0].logo }} style={styles.landscapeFeaturedLogo} />
                    <View style={styles.landscapeFeaturedInfo}>
                      <Text style={styles.landscapeFeaturedName}>{searchResults[0].NomeAPP}</Text>
                      <Text style={styles.landscapeFeaturedDesc} numberOfLines={1}>
                        {searchResults[0].Descricao || searchResults[0].descricao || ''}
                      </Text>
                      <Text style={styles.landscapeFeaturedVersion}>v{searchResults[0].Versao}</Text>
                    </View>
                  </TouchableOpacity>
                  {/* Grid */}
                  <View style={styles.landscapeGrid}>
                    {searchResults.slice(1).map((app) => (
                      <TouchableOpacity
                        key={app.ID}
                        style={styles.landscapeGridCard}
                        onPress={() => navigateToApp(app)}
                        focusable={true}
                      >
                        <Image source={{ uri: app.logo }} style={styles.landscapeGridLogo} />
                        <Text style={styles.landscapeGridName} numberOfLines={1}>{app.NomeAPP}</Text>
                        <Text style={styles.landscapeGridVersion}>v{app.Versao}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="search-outline" size={48} color={Colors.textMuted} />
                  <Text style={styles.emptyText}>Nenhum app encontrado</Text>
                </View>
              )}
            </ScrollView>
          ) : (
            <FlatList
              data={filteredApps}
              keyExtractor={(item) => item.ID}
              numColumns={landscape ? 4 : undefined}
              contentContainerStyle={styles.landscapeGrid}
              showsVerticalScrollIndicator={false}
              initialNumToRender={10}
              maxToRenderPerBatch={8}
              windowSize={5}
              removeClippedSubviews={true}
              onEndReached={loadMoreApps}
              onEndReachedThreshold={0.5}
              ListFooterComponent={loadingMore ? <ActivityIndicator color={Colors.primary} style={{ padding: 16 }} /> : null}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.landscapeGridCard}
                  onPress={() => navigateToApp(item)}
                  focusable={true}
                >
                  <Image source={{ uri: item.logo }} style={styles.landscapeGridLogo} />
                  <Text style={styles.landscapeGridName} numberOfLines={1}>{item.NomeAPP}</Text>
                  <Text style={styles.landscapeGridVersion}>v{item.Versao}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </View>
    );
  }

  // Portrait render
  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={[styles.header, { transform: [{ translateY: headerTranslateY }] }]}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Bem-vindo ao</Text>
              <Text style={styles.title}>Lumiar Store</Text>
            </View>
            <TouchableOpacity
              style={styles.avatarButton}
              onPress={() => navigation.navigate('ProfileModal')}
              focusable={true}
            >
              <AvatarIcon name={profile.name} size={40} />
            </TouchableOpacity>
          </View>

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

          {!searchResults && (
            <View style={styles.chipsSection}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsList}>
                <TouchableOpacity
                  style={[styles.chip, !selectedCategory && styles.chipActive]}
                  onPress={() => setSelectedCategory(null)}
                  focusable={true}
                >
                  <Text style={[styles.chipText, !selectedCategory && styles.chipTextActive]}>Todos</Text>
                </TouchableOpacity>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.slug}
                    style={[styles.chip, selectedCategory === cat.nome && styles.chipActive]}
                    onPress={() => setSelectedCategory(selectedCategory === cat.nome ? null : cat.nome)}
                    focusable={true}
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
        </Animated.View>

        {/* Search Results - Portrait */}
        {searchResults !== null ? (
          <View style={styles.section}>
            {searchResults.length > 0 ? (
              <>
                <View style={styles.searchFeatured}>
                  <TouchableOpacity
                    style={styles.searchFeaturedCard}
                    onPress={() => navigateToApp(searchResults[0])}
                    activeOpacity={0.7}
                    focusable={true}
                  >
                    <View style={styles.searchFeaturedTop}>
                      {isValidUrl(searchResults[0].logo) ? (
                        <Image source={{ uri: searchResults[0].logo }} style={styles.searchFeaturedLogo} resizeMode="cover" />
                      ) : (
                        <View style={styles.searchFeaturedFallback}>
                          <Text style={styles.searchFeaturedFallbackText}>{getInitial(searchResults[0].NomeAPP)}</Text>
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
                    <TouchableOpacity style={styles.searchInstallBtn} onPress={() => navigateToApp(searchResults[0])}>
                      <Ionicons name="download-outline" size={18} color={Colors.text} />
                      <Text style={styles.searchInstallText}>Instalar</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                </View>

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
                            focusable={true}
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

                {(() => {
                  const featuredApp = searchResults[0];
                  const similarIds = getSimilarApps(featuredApp).map(s => s.ID);
                  const outrosResultados = searchResults.filter(
                    (app, idx) => idx > 0 && !similarIds.includes(app.ID)
                  );
                  if (outrosResultados.length === 0) return null;
                  return (
                    <View style={styles.otherResults}>
                      <Text style={styles.sectionTitle}>Outros resultados</Text>
                      {outrosResultados.map((app) => (
                        <AppListItem key={app.ID} app={app} onPress={() => navigateToApp(app)} />
                      ))}
                    </View>
                  );
                })()}
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
                      <View key={i} style={[styles.dot, i === featuredIndex && styles.dotActive]} />
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* All Apps - FlatList with Pagination */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {selectedCategory ? selectedCategory : 'Todos os Apps'}
              </Text>
              {filteredApps.map((app) => (
                <AppListItem key={app.ID} app={app} onPress={() => navigateToApp(app)} />
              ))}
              {loadingMore && <ActivityIndicator color={Colors.primary} style={{ padding: 16 }} />}
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
  // Portrait
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: Colors.textSecondary, marginTop: Spacing.md, fontSize: 16 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 120 },
  header: {
    paddingHorizontal: Spacing.md, paddingTop: Spacing.xl, paddingBottom: Spacing.sm,
    backgroundColor: Colors.background + 'F0', zIndex: 100, elevation: 100,
  },
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

  // Search Featured (Portrait)
  searchFeatured: { marginBottom: Spacing.lg },
  searchFeaturedCard: {
    backgroundColor: Colors.backgroundCard, borderRadius: BorderRadius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.primary + '40',
  },
  searchFeaturedTop: { flexDirection: 'row', marginBottom: Spacing.md },
  searchFeaturedLogo: { width: 72, height: 72, borderRadius: BorderRadius.md, backgroundColor: Colors.surface },
  searchFeaturedFallback: { width: 72, height: 72, borderRadius: BorderRadius.md, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
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
  similarSection: { marginBottom: Spacing.lg },
  similarList: { paddingBottom: Spacing.sm, gap: Spacing.sm },
  similarCard: { width: 100, alignItems: 'center', backgroundColor: Colors.backgroundCard, borderRadius: BorderRadius.md, padding: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  similarLogo: { width: 56, height: 56, borderRadius: BorderRadius.md, backgroundColor: Colors.surface, marginBottom: Spacing.xs },
  similarFallback: { width: 56, height: 56, borderRadius: BorderRadius.md, backgroundColor: Colors.primary + '30', justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.xs },
  similarFallbackText: { color: Colors.primaryLight, fontSize: 20, fontWeight: 'bold' },
  similarName: { color: Colors.text, fontSize: 12, fontWeight: '600', textAlign: 'center' },
  similarVersion: { color: Colors.textMuted, fontSize: 10, marginTop: 2 },
  otherResults: { marginTop: Spacing.sm },

  // Landscape
  landscapeContainer: { flex: 1, backgroundColor: Colors.background, flexDirection: 'row' },
  landscapeContent: { flex: 1, paddingLeft: 72 + Spacing.md, padding: Spacing.md },
  landscapeHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: Spacing.md, paddingTop: Spacing.sm,
  },
  landscapeScrollView: { flex: 1 },
  landscapeFeatured: {
    flexDirection: 'row', backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.primary + '40',
  },
  landscapeFeaturedLogo: { width: 64, height: 64, borderRadius: BorderRadius.md, backgroundColor: Colors.surface },
  landscapeFeaturedInfo: { flex: 1, marginLeft: Spacing.md, justifyContent: 'center' },
  landscapeFeaturedName: { color: Colors.text, fontSize: 16, fontWeight: 'bold' },
  landscapeFeaturedDesc: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  landscapeFeaturedVersion: { color: Colors.textMuted, fontSize: 11, marginTop: 4 },
  landscapeGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md,
  },
  landscapeGridCard: {
    width: (Dimensions.get('window').width - 72 - Spacing.md * 5) / 4,
    backgroundColor: Colors.backgroundCard, borderRadius: BorderRadius.md,
    padding: Spacing.sm, alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  landscapeGridLogo: { width: 56, height: 56, borderRadius: BorderRadius.md, backgroundColor: Colors.surface, marginBottom: Spacing.xs },
  landscapeGridName: { color: Colors.text, fontSize: 12, fontWeight: '600', textAlign: 'center' },
  landscapeGridVersion: { color: Colors.textMuted, fontSize: 10 },
});
