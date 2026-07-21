import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  ScrollView as ScrollViewModal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../constants/theme';
import { api } from '../services/api';
import { checkForUpdate, UpdateInfo } from '../services/versionCheck';

interface SettingsScreenProps {
  navigation: any;
}

export function SettingsScreen({ navigation }: SettingsScreenProps) {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string>('--');
  const [version, setVersion] = useState('1.0.6');
  const [appsCount, setAppsCount] = useState(0);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    loadInfo();
  }, []);

  const loadInfo = async () => {
    try {
      const ver = await api.fetchVersion();
      setVersion(ver.Versao);
      const apps = await api.fetchApps();
      setAppsCount(apps.length);
    } catch {}
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const [apps, ver, update] = await Promise.all([
        api.fetchApps(),
        api.fetchVersion(),
        checkForUpdate(),
      ]);
      setAppsCount(apps.length);
      setVersion(ver.Versao);
      const now = new Date();
      setLastSync(
        `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      );

      if (update.available) {
        setUpdateInfo(update);
        setShowUpdate(true);
      } else {
        Alert.alert('Sincronizado', `${apps.length} apps carregados. Você já está na versão mais recente.`);
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao sincronizar com o GitHub');
    } finally {
      setSyncing(false);
    }
  };

  const handleUpdate = async () => {
    if (updateInfo?.downloadUrl) {
      try {
        const supported = await Linking.canOpenURL(updateInfo.downloadUrl);
        if (supported) {
          await Linking.openURL(updateInfo.downloadUrl);
        }
      } catch {}
    }
    setShowUpdate(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Section */}
      <TouchableOpacity
        style={styles.profileCard}
        onPress={() => navigation.navigate('ProfileModal')}
        activeOpacity={0.7}
      >
        <View style={styles.profileAvatar}>
          <Ionicons name="person" size={28} color={Colors.primaryLight} />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>Meu Perfil</Text>
          <Text style={styles.profileSub}>Editar nome e foto</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
      </TouchableOpacity>

      {/* Sync Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sincronização</Text>
        <TouchableOpacity
          style={[styles.syncButton, syncing && styles.syncButtonDisabled]}
          onPress={handleSync}
          disabled={syncing}
          activeOpacity={0.7}
        >
          {syncing ? (
            <ActivityIndicator color={Colors.text} size="small" />
          ) : (
            <Ionicons name="refresh" size={22} color={Colors.text} />
          )}
          <Text style={styles.syncButtonText}>
            {syncing ? 'Verificando atualizações...' : 'Sincronizar e Verificar Atualizações'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações</Text>
        <View style={styles.infoRow}>
          <Ionicons name="cube-outline" size={20} color={Colors.textMuted} />
          <Text style={styles.infoLabel}>Versão Instalada</Text>
          <Text style={styles.infoValue}>{version}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="list-outline" size={20} color={Colors.textMuted} />
          <Text style={styles.infoLabel}>Apps Cadastrados</Text>
          <Text style={styles.infoValue}>{appsCount}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={20} color={Colors.textMuted} />
          <Text style={styles.infoLabel}>Última Sincronização</Text>
          <Text style={styles.infoValue}>{lastSync}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="logo-github" size={20} color={Colors.textMuted} />
          <Text style={styles.infoLabel}>Fonte</Text>
          <Text style={styles.infoValue}>GitHub</Text>
        </View>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sobre</Text>
        <View style={styles.aboutCard}>
          <Text style={styles.aboutTitle}>Lumiar Store</Text>
          <Text style={styles.aboutDesc}>
            Loja alternativa de apps, mods e ports da comunidade Android.
          </Text>
          <Text style={styles.aboutCopyright}>TGTiler © 2026</Text>
        </View>
      </View>

      {/* Update Modal */}
      <Modal visible={showUpdate} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Ionicons name="arrow-up-circle" size={48} color={Colors.primary} />
              <Text style={styles.modalTitle}>Nova Versão Disponível</Text>
              <Text style={styles.modalVersion}>Lumiar Store {updateInfo?.remoteVersion}</Text>
            </View>

            <View style={styles.modalChangelog}>
              <Text style={styles.modalChangelogLabel}>O que mudou:</Text>
              <ScrollViewModal style={styles.modalChangelogScroll} nestedScrollEnabled>
                <Text style={styles.modalChangelogText}>{updateInfo?.changelog}</Text>
              </ScrollViewModal>
            </View>

            {updateInfo && (
              <View style={styles.modalVersionBadge}>
                <Text style={styles.modalVersionBadgeText}>
                  {updateInfo.currentVersion} → {updateInfo.remoteVersion}
                </Text>
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalUpdateBtn} onPress={handleUpdate}>
                <Ionicons name="download" size={20} color={Colors.text} />
                <Text style={styles.modalUpdateBtnText}>Atualizar Agora</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalLaterBtn} onPress={() => setShowUpdate(false)}>
                <Text style={styles.modalLaterBtnText}>Lembrar Mais Tarde</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: 120,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  profileSub: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  syncButtonDisabled: {
    opacity: 0.6,
  },
  syncButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    flex: 1,
    marginLeft: Spacing.sm,
  },
  infoValue: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  aboutCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  aboutTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  aboutDesc: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  aboutCopyright: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  // Update Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: BorderRadius.xl,
    width: '100%',
    maxWidth: 380,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.primary + '40',
  },
  modalHeader: {
    alignItems: 'center',
    padding: Spacing.xl,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.primary + '10',
  },
  modalTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  modalVersion: {
    color: Colors.primaryLight,
    fontSize: 16,
    fontWeight: '600',
  },
  modalChangelog: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  modalChangelogLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  modalChangelogScroll: {
    maxHeight: 120,
  },
  modalChangelogText: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  modalVersionBadge: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  modalVersionBadgeText: {
    color: Colors.primaryLight,
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'monospace',
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  modalButtons: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  modalUpdateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  modalUpdateBtnText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  modalLaterBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  modalLaterBtnText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
});
