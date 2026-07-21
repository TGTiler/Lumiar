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
import { ScreenshotItem } from '../components/AppCard';

const { width } = Dimensions.get('window');

function getInitial(name: string): string {
  return (name || '?').charAt(0).toUpperCase();
}

function isValidUrl(uri: string): boolean {
  if (!uri || uri.trim() === '') return false;
  if (uri.includes('placeholder.com')) return false;
  return uri.startsWith('http://') || uri.startsWith('https://');
}

function DetailLogo({ uri, name }: { uri: string; name: string }) {
  const [hasError, setHasError] = React.useState(false);
  if (hasError || !isValidUrl(uri)) {
    return (
      <View style={styles.fallbackLogo}>
        <Text style={styles.fallbackText}>{getInitial(name)}</Text>
      </View>
    );
  }
  return (
    <Image source={{ uri }} style={styles.appLogo} resizeMode="cover" onError={() => setHasError(true)} />
  );
}

function DetailBanner({ uri, name }: { uri: string; name: string }) {
  const [hasError, setHasError] = React.useState(false);
  if (hasError || !isValidUrl(uri)) {
    return (
      <View style={styles.fallbackBanner}>
        <Text style={styles.fallbackBannerText}>{getInitial(name)}</Text>
      </View>
    );
  }
  return (
    <Image source={{ uri }} style={styles.headerImage} resizeMode="cover" onError={() => setHasError(true)} />
  );
}

interface AppDetailScreenProps {
  route: { params: { appId: string } };
  navigation: any;
}

export function AppDetailScreen({ route, navigation }: AppDetailScreenProps) {
  const { appId } = route.params;
  const [app, setApp] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    loadApp();
  }, [appId]);

  const loadApp = async () => {
    try {
      const appData = await api.getAppById(appId);
      setApp(appData || null);
    } catch (error) {
      console.error('Error loading app:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!app?.url_apk) {
      Alert.alert('Erro', 'URL de download não disponível');
      return;
    }
    setShowWarning(true);
  };

  const confirmDownload = async () => {
    setShowWarning(false);
    if (!app?.url_apk) return;
    setDownloading(true);
    try {
      const supported = await Linking.canOpenURL(app.url_apk);
      if (supported) await Linking.openURL(app.url_apk);
      else Alert.alert('Erro', 'Não foi possível abrir o link');
    } catch {
      Alert.alert('Erro', 'Falha ao iniciar download');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
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
          <DetailBanner uri={app.img1} name={app.NomeAPP} />
          <View style={styles.bannerOverlay} />
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <View style={styles.appHeader}>
            <DetailLogo uri={app.logo} name={app.NomeAPP} />
            <View style={styles.appTitle}>
              <Text style={styles.appName}>{app.NomeAPP}</Text>
              <Text style={styles.appVersion}>v{app.Versao}</Text>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{app.categoria}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.downloadBtn, downloading && styles.downloadBtnDisabled]}
            onPress={handleDownload}
            disabled={downloading}
          >
            {downloading ? (
              <ActivityIndicator color={Colors.text} />
            ) : (
              <>
                <Ionicons name="download-outline" size={20} color={Colors.text} />
                <Text style={styles.downloadBtnText}>Instalar</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.descSection}>
            <Text style={styles.descTitle}>Sobre este app</Text>
            <Text style={styles.descText}>
              {app.Descricao || app.descricao || 'Sem descrição disponível.'}
            </Text>
          </View>

          {/* Screenshots */}
          {(isValidUrl(app.img1) || isValidUrl(app.img2)) && (
            <View style={styles.screenshotsSection}>
              <Text style={styles.descTitle}>Screenshots</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.screenshotsList}>
                {isValidUrl(app.img1) && <ScreenshotItem uri={app.img1} name={app.NomeAPP} />}
                {isValidUrl(app.img2) && <ScreenshotItem uri={app.img2} name={app.NomeAPP} />}
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
        <TouchableOpacity
          style={[styles.downloadBarBtn, downloading && styles.downloadBtnDisabled]}
          onPress={handleDownload}
          disabled={downloading}
        >
          {downloading ? (
            <ActivityIndicator color={Colors.text} />
          ) : (
            <>
              <Ionicons name="download" size={20} color={Colors.text} />
              <Text style={styles.downloadBarText}>Instalar</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Warning Modal */}
      <Modal visible={showWarning} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIcon}>
              <Ionicons name="information-circle" size={40} color={Colors.primary} />
            </View>
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
  headerImage: { width: '100%', height: '100%' },
  bannerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },
  backBtn: { position: 'absolute', top: Spacing.xl, left: Spacing.md, width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.overlay, justifyContent: 'center', alignItems: 'center' },
  appInfo: { padding: Spacing.lg, marginTop: -Spacing.xxl },
  appHeader: { flexDirection: 'row', marginBottom: Spacing.lg },
  fallbackLogo: { width: 72, height: 72, borderRadius: BorderRadius.xl, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: Colors.background },
  fallbackText: { color: Colors.text, fontSize: 28, fontWeight: 'bold' },
  appLogo: { width: 72, height: 72, borderRadius: BorderRadius.xl, backgroundColor: Colors.surface, borderWidth: 3, borderColor: Colors.background },
  appTitle: { marginLeft: Spacing.md, flex: 1 },
  appName: { color: Colors.text, fontSize: 22, fontWeight: 'bold', marginBottom: 2 },
  appVersion: { color: Colors.textSecondary, fontSize: 13, marginBottom: Spacing.xs },
  categoryBadge: { alignSelf: 'flex-start', backgroundColor: Colors.primary + '25', paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: BorderRadius.sm },
  categoryText: { color: Colors.primaryLight, fontSize: 11, fontWeight: '500' },
  downloadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, marginBottom: Spacing.lg, gap: Spacing.sm },
  downloadBtnDisabled: { opacity: 0.6 },
  downloadBtnText: { color: Colors.text, fontSize: 16, fontWeight: '700' },
  descSection: { marginBottom: Spacing.lg },
  descTitle: { color: Colors.text, fontSize: 16, fontWeight: 'bold', marginBottom: Spacing.sm },
  descText: { color: Colors.textSecondary, fontSize: 14, lineHeight: 22 },
  screenshotsSection: { marginBottom: Spacing.lg },
  screenshotsList: { paddingBottom: Spacing.xs },
  infoCards: { flexDirection: 'row', gap: Spacing.sm },
  infoCard: { flex: 1, backgroundColor: Colors.backgroundCard, borderRadius: BorderRadius.md, padding: Spacing.md, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  infoLabel: { color: Colors.textMuted, fontSize: 11, marginTop: Spacing.xs },
  infoValue: { color: Colors.text, fontSize: 13, fontWeight: '600', marginTop: 2 },
  fallbackBanner: { width: '100%', height: '100%', backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  fallbackBannerText: { color: Colors.text, fontSize: 64, fontWeight: 'bold', opacity: 0.3 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.md, paddingBottom: Spacing.xl, backgroundColor: Colors.backgroundLight, borderTopWidth: 1, borderTopColor: Colors.border },
  downloadBarBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, gap: Spacing.sm },
  downloadBarText: { color: Colors.text, fontSize: 16, fontWeight: '700' },

  // Warning Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  modalCard: { backgroundColor: Colors.backgroundLight, borderRadius: BorderRadius.xl, padding: Spacing.lg, width: '100%', maxWidth: 360, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  modalIcon: { marginBottom: Spacing.md },
  modalTitle: { color: Colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: Spacing.sm, textAlign: 'center' },
  modalText: { color: Colors.textSecondary, fontSize: 14, lineHeight: 22, textAlign: 'center', marginBottom: Spacing.lg },
  modalBtn: { backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, width: '100%', alignItems: 'center' },
  modalBtnText: { color: Colors.text, fontSize: 16, fontWeight: '700' },
});
