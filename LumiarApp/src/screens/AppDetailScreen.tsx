import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
  Dimensions,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../constants/theme';
import { api, AppData } from '../services/api';
import { Lightbox } from '../components/Lightbox';
import { trackView, trackDownload } from '../services/preferences';

const { width } = Dimensions.get('window');
const SCREENSHOT_WIDTH = width * 0.65;

function getInitial(name: string): string {
  return (name || '?').charAt(0).toUpperCase();
}

function isValidUrl(uri: string): boolean {
  if (!uri || uri.trim() === '') return false;
  if (uri.includes('placeholder.com')) return false;
  return uri.startsWith('http://') || uri.startsWith('https://');
}

function AppBanner({ uri, name }: { uri: string; name: string }) {
  const [hasError, setHasError] = React.useState(false);
  if (hasError || !isValidUrl(uri)) {
    return <View style={styles.fallbackBanner}><Text style={styles.fallbackBannerText}>{getInitial(name)}</Text></View>;
  }
  return <Image source={{ uri }} style={styles.bannerImage} resizeMode="cover" onError={() => setHasError(true)} />;
}

interface AppDetailScreenProps {
  route: { params: { appId: string } };
  navigation: any;
}

export function AppDetailScreen({ route, navigation }: AppDetailScreenProps) {
  const { appId } = route.params;
  const [app, setApp] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  const [lightboxUri, setLightboxUri] = useState<string | null>(null);

  useEffect(() => {
    loadApp();
  }, [appId]);

  const loadApp = async () => {
    try {
      const appData = await api.getAppById(appId);
      setApp(appData || null);
      if (appData) trackView(appData.SubcategoriaSlug || '');
    } catch (error) {
      console.error('Error loading app:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!app?.url_apk) { Alert.alert('Erro', 'URL de download não disponível'); return; }
    setShowWarning(true);
  };

  const confirmDownload = async () => {
    setShowWarning(false);
    if (!app?.url_apk) return;
    trackDownload(app.SubcategoriaSlug || '');
    try {
      const supported = await Linking.canOpenURL(app.url_apk);
      if (supported) await Linking.openURL(app.url_apk);
      else Alert.alert('Erro', 'Não foi possível abrir o link');
    } catch {
      Alert.alert('Erro', 'Falha ao iniciar download');
    }
  };

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  if (!app) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={Colors.error} />
        <Text style={styles.errorText}>App não encontrado</Text>
        <TouchableOpacity style={styles.backHomeBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backHomeText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Banner */}
        <View style={styles.bannerContainer}>
          <AppBanner uri={app.img1} name={app.NomeAPP} />
          <View style={styles.bannerOverlay} />
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.appInfo}>
          {/* Logo + Title */}
          <View style={styles.appHeader}>
            <AppLogoSmall uri={app.logo} name={app.NomeAPP} />
            <View style={styles.appTitle}>
              <Text style={styles.appName}>{app.NomeAPP}</Text>
              <Text style={styles.appVersion}>v{app.Versao}</Text>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{app.categoria}</Text>
              </View>
            </View>
          </View>

          {/* Download Button */}
          <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
            <Ionicons name="download-outline" size={20} color={Colors.text} />
            <Text style={styles.downloadButtonText}>Instalar</Text>
          </TouchableOpacity>

          {/* Description */}
          <View style={styles.descSection}>
            <Text style={styles.descTitle}>Sobre este app</Text>
            <Text style={styles.descText}>{app.Descricao || app.descricao || 'Sem descrição disponível.'}</Text>
          </View>

          {/* Screenshots */}
          {(isValidUrl(app.img1) || isValidUrl(app.img2)) && (
            <View style={styles.screenshotsSection}>
              <Text style={styles.descTitle}>Screenshots</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.screenshotsList}>
                {isValidUrl(app.img1) && (
                  <TouchableOpacity onPress={() => setLightboxUri(app.img1)}>
                    <Image source={{ uri: app.img1 }} style={styles.screenshot} resizeMode="cover" />
                  </TouchableOpacity>
                )}
                {isValidUrl(app.img2) && (
                  <TouchableOpacity onPress={() => setLightboxUri(app.img2)}>
                    <Image source={{ uri: app.img2 }} style={styles.screenshot} resizeMode="cover" />
                  </TouchableOpacity>
                )}
              </ScrollView>
            </View>
          )}

          <View style={styles.infoCards}>
            <View style={styles.infoCard}>
              <Ionicons name="cube-outline" size={20} color={Colors.primary} />
              <Text style={styles.infoLabel}>Versão</Text>
              <Text style={styles.infoValue}>{app.Versao}</Text>
            </View>
            <View style={styles.infoCard}>
              <Ionicons name="folder-outline" size={20} color={Colors.accent} />
              <Text style={styles.infoLabel}>Categoria</Text>
              <Text style={styles.infoValue}>{app.categoria}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomDownloadBtn} onPress={handleDownload}>
          <Ionicons name="download" size={20} color={Colors.text} />
          <Text style={styles.bottomDownloadText}>Instalar</Text>
        </TouchableOpacity>
      </View>

      {/* Warning Modal */}
      <Modal visible={showWarning} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Ionicons name="information-circle" size={40} color={Colors.primary} />
            <Text style={styles.modalTitle}>Aviso de Instalação</Text>
            <Text style={styles.modalText}>
              Se o arquivo baixado contiver números no nome, fique tranquilo. É o identificador seguro da nossa plataforma para este aplicativo.
            </Text>
            <TouchableOpacity style={styles.modalBtn} onPress={confirmDownload}>
              <Text style={styles.modalBtnText}>Entendi, baixar agora</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Lightbox visible={lightboxUri !== null} uri={lightboxUri || ''} onClose={() => setLightboxUri(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  errorText: { color: Colors.text, fontSize: 18, fontWeight: '600', marginTop: Spacing.md },
  backHomeBtn: { marginTop: Spacing.lg, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, backgroundColor: Colors.primary, borderRadius: BorderRadius.md },
  backHomeText: { color: Colors.text, fontSize: 16, fontWeight: '600' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  bannerContainer: { width, height: 220, position: 'relative' },
  bannerImage: { width: '100%', height: '100%' },
  fallbackBanner: { width: '100%', height: '100%', backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  fallbackBannerText: { color: Colors.text, fontSize: 64, fontWeight: 'bold', opacity: 0.3 },
  bannerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },
  backBtn: { position: 'absolute', top: Spacing.xl, left: Spacing.md, width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.overlay, justifyContent: 'center', alignItems: 'center' },
  appInfo: { padding: Spacing.lg, marginTop: -Spacing.xxl },
  appHeader: { flexDirection: 'row', marginBottom: Spacing.lg },
  logoImage: { width: 88, height: 88, borderRadius: 18, backgroundColor: Colors.surface },
  logoFallback: { width: 88, height: 88, borderRadius: 18, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  logoFallbackText: { color: Colors.text, fontSize: 32, fontWeight: 'bold' },
  appTitle: { marginLeft: Spacing.md, flex: 1, justifyContent: 'center' },
  appName: { color: Colors.text, fontSize: 22, fontWeight: 'bold', marginBottom: 2 },
  appVersion: { color: Colors.textSecondary, fontSize: 13, marginBottom: Spacing.xs },
  categoryBadge: { alignSelf: 'flex-start', backgroundColor: Colors.primary + '25', paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: BorderRadius.sm },
  categoryText: { color: Colors.primaryLight, fontSize: 11, fontWeight: '500' },
  downloadButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, marginBottom: Spacing.lg, gap: Spacing.sm },
  downloadButtonText: { color: Colors.text, fontSize: 16, fontWeight: '700' },
  descSection: { marginBottom: Spacing.lg },
  descTitle: { color: Colors.text, fontSize: 16, fontWeight: 'bold', marginBottom: Spacing.sm },
  descText: { color: Colors.textSecondary, fontSize: 14, lineHeight: 22 },
  screenshotsSection: { marginBottom: Spacing.lg },
  screenshotsList: { paddingBottom: Spacing.xs },
  screenshot: { width: SCREENSHOT_WIDTH, height: 200, borderRadius: BorderRadius.md, backgroundColor: Colors.surface, marginRight: Spacing.sm },
  infoCards: { flexDirection: 'row', gap: Spacing.sm },
  infoCard: { flex: 1, backgroundColor: Colors.backgroundCard, borderRadius: BorderRadius.md, padding: Spacing.md, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  infoLabel: { color: Colors.textMuted, fontSize: 11, marginTop: Spacing.xs },
  infoValue: { color: Colors.text, fontSize: 13, fontWeight: '600', marginTop: 2 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.md, paddingBottom: Spacing.xl, backgroundColor: Colors.backgroundLight, borderTopWidth: 1, borderTopColor: Colors.border },
  bottomDownloadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, gap: Spacing.sm },
  bottomDownloadText: { color: Colors.text, fontSize: 16, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  modalCard: { backgroundColor: Colors.backgroundLight, borderRadius: BorderRadius.xl, padding: Spacing.lg, width: '100%', maxWidth: 360, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  modalTitle: { color: Colors.text, fontSize: 18, fontWeight: 'bold', marginTop: Spacing.sm, marginBottom: Spacing.sm, textAlign: 'center' },
  modalText: { color: Colors.textSecondary, fontSize: 14, lineHeight: 22, textAlign: 'center', marginBottom: Spacing.lg },
  modalBtn: { backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, width: '100%', alignItems: 'center' },
  modalBtnText: { color: Colors.text, fontSize: 16, fontWeight: '700' },
});
