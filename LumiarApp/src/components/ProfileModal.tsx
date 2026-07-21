import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../constants/theme';

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (profile: UserProfile) => void;
}

export interface UserProfile {
  name: string;
  avatarUrl: string;
}

const PROFILE_KEY = '@lumiar_profile';

export async function loadProfile(): Promise<UserProfile> {
  try {
    const data = await AsyncStorage.getItem(PROFILE_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  return { name: 'Usuário', avatarUrl: '' };
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

function getInitial(name: string): string {
  return (name || 'U').charAt(0).toUpperCase();
}

export function AvatarIcon({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <View style={[avatarStyles.container, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[avatarStyles.text, { fontSize: size * 0.45 }]}>{getInitial(name)}</Text>
    </View>
  );
}

const avatarStyles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: Colors.text,
    fontWeight: 'bold',
  },
});

export function ProfileModal({ visible, onClose, onSave }: ProfileModalProps) {
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    if (visible) {
      loadProfile().then((p) => {
        setName(p.name);
        setAvatarUrl(p.avatarUrl);
      });
    }
  }, [visible]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Digite um nome de usuário');
      return;
    }
    const profile = { name: name.trim(), avatarUrl: avatarUrl.trim() };
    await saveProfile(profile);
    onSave(profile);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Perfil do Usuário</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.avatarSection}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarPreview} />
            ) : (
              <AvatarIcon name={name} size={80} />
            )}
            <TouchableOpacity style={styles.changeAvatarBtn}>
              <Ionicons name="camera-outline" size={20} color={Colors.primaryLight} />
              <Text style={styles.changeAvatarText}>Alterar Foto</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>URL da Foto de Perfil</Text>
            <TextInput
              style={styles.input}
              placeholder="https://exemplo.com/foto.jpg"
              placeholderTextColor={Colors.textMuted}
              value={avatarUrl}
              onChangeText={setAvatarUrl}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome de Usuário</Text>
            <TextInput
              style={styles.input}
              placeholder="Seu nome"
              placeholderTextColor={Colors.textMuted}
              value={name}
              onChangeText={setName}
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Salvar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: Colors.backgroundLight,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  avatarPreview: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface,
    marginBottom: Spacing.sm,
  },
  changeAvatarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  changeAvatarText: {
    color: Colors.primaryLight,
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    color: Colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  saveButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
