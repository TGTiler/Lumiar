import React, { useEffect } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  BackHandler,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '../constants/theme';

const { width, height } = Dimensions.get('window');

interface LightboxProps {
  visible: boolean;
  uri: string;
  onClose: () => void;
}

export function Lightbox({ visible, uri, onClose }: LightboxProps) {
  useEffect(() => {
    if (!visible) return;

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });

    return () => backHandler.remove();
  }, [visible, onClose]);

  if (!visible || !uri) return null;

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      {/* Close button */}
      <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
        <Ionicons name="close" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Image */}
      <TouchableOpacity style={styles.imageContainer} activeOpacity={1} onPress={onClose}>
        <Image
          source={{ uri }}
          style={styles.image}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.95)',
    zIndex: 9999,
  },
  closeBtn: {
    position: 'absolute',
    top: Spacing.xl,
    right: Spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width,
    height: height * 0.85,
  },
});
