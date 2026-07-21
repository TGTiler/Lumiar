import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Linking,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../constants/theme';
import { UpdateInfo } from '../services/versionCheck';

interface UpdateModalProps {
  visible: boolean;
  updateInfo: UpdateInfo | null;
  onDismiss: () => void;
}

export function UpdateModal({ visible, updateInfo, onDismiss }: UpdateModalProps) {
  if (!updateInfo) return null;

  const handleUpdate = async () => {
    if (updateInfo.downloadUrl) {
      try {
        const supported = await Linking.canOpenURL(updateInfo.downloadUrl);
        if (supported) {
          await Linking.openURL(updateInfo.downloadUrl);
        }
      } catch {}
    }
    onDismiss();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="arrow-up-circle" size={48} color={Colors.primary} />
            </View>
            <Text style={styles.title}>Nova Versão Disponível</Text>
            <Text style={styles.versionText}>
              Lumiar Store {updateInfo.remoteVersion}
            </Text>
          </View>

          {/* Changelog */}
          <View style={styles.changelogSection}>
            <Text style={styles.changelogLabel}>O que mudou:</Text>
            <ScrollView style={styles.changelogScroll} nestedScrollEnabled>
              <Text style={styles.changelogText}>{updateInfo.changelog}</Text>
            </ScrollView>
          </View>

          {/* Version Info */}
          <View style={styles.versionInfo}>
            <View style={styles.versionBadge}>
              <Text style={styles.versionBadgeText}>
                {updateInfo.currentVersion} → {updateInfo.remoteVersion}
              </Text>
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
              <Ionicons name="download" size={20} color={Colors.text} />
              <Text style={styles.updateButtonText}>Atualizar Agora</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.laterButton} onPress={onDismiss}>
              <Text style={styles.laterButtonText}>Lembrar Mais Tarde</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: BorderRadius.xl,
    width: '100%',
    maxWidth: 380,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.primary + '40',
  },
  header: {
    alignItems: 'center',
    padding: Spacing.xl,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.primary + '10',
  },
  iconContainer: {
    marginBottom: Spacing.md,
  },
  title: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  versionText: {
    color: Colors.primaryLight,
    fontSize: 16,
    fontWeight: '600',
  },
  changelogSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  changelogLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  changelogScroll: {
    maxHeight: 120,
  },
  changelogText: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  versionInfo: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    alignItems: 'center',
  },
  versionBadge: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  versionBadgeText: {
    color: Colors.primaryLight,
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  buttons: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  updateButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  laterButton: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  laterButtonText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
});
