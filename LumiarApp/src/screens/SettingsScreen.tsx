import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../constants/theme';
import { api } from '../services/api';

interface SettingsScreenProps {
  navigation: any;
}

export function SettingsScreen({ navigation }: SettingsScreenProps) {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string>('--');
  const [version, setVersion] = useState('1.0.0');
  const [appsCount, setAppsCount] = useState(0);

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
      const [apps, ver] = await Promise.all([
        api.fetchApps(),
        api.fetchVersion(),
      ]);
      setAppsCount(apps.length);
      setVersion(ver.Versao);
      const now = new Date();
      setLastSync(
        `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      );
      Alert.alert('Sincronizado', `${apps.length} apps carregados do GitHub`);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao sincronizar com o GitHub');
    } finally {
      setSyncing(false);
    }
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
            {syncing ? 'Sincronizando...' : 'Sincronizar com o GitHub'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações</Text>
        <View style={styles.infoRow}>
          <Ionicons name="cube-outline" size={20} color={Colors.textMuted} />
          <Text style={styles.infoLabel}>Versão</Text>
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
});
