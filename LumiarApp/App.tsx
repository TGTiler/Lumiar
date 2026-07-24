import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, BackHandler, ToastAndroid, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Colors } from './src/constants/theme';
import { HomeScreen } from './src/screens/HomeScreen';
import { AppDetailScreen } from './src/screens/AppDetailScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { ProfileModal } from './src/components/ProfileModal';
import { BottomNav } from './src/components/BottomNav';
import { UpdateModal } from './src/components/UpdateModal';
import { checkForUpdate, UpdateInfo } from './src/services/versionCheck';

type Tab = 'home' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [showDetail, setShowDetail] = useState(false);
  const [detailAppId, setDetailAppId] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const lastBackPress = useRef<number>(0);

  // Check for updates once on app start
  useEffect(() => {
    const timer = setTimeout(async () => {
      const info = await checkForUpdate();
      if (info.available) {
        setUpdateInfo(info);
        setShowUpdate(true);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const navigation = {
    navigate: (s: string, params?: any) => {
      if (s === 'AppDetail' && params?.appId) {
        setDetailAppId(params.appId);
        setShowDetail(true);
      } else if (s === 'ProfileModal') {
        setShowProfile(true);
      }
    },
    goBack: () => {
      setShowDetail(false);
      setDetailAppId(null);
    },
    params: null,
    tabNavigate: (tab: string) => {
      setActiveTab(tab as Tab);
      setShowDetail(false);
      setDetailAppId(null);
      setShowSettings(tab === 'settings');
    },
  };

  // Back handler
  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (showUpdate) { setShowUpdate(false); return true; }
      if (showProfile) { setShowProfile(false); return true; }
      if (showDetail) { setShowDetail(false); setDetailAppId(null); return true; }
      if (showSettings) { setShowSettings(false); setActiveTab('home'); return true; }

      const now = Date.now();
      if (now - lastBackPress.current < 2000) {
        BackHandler.exitApp();
        return true;
      }
      lastBackPress.current = now;
      if (Platform.OS === 'android') {
        ToastAndroid.show('Pressione novamente para sair', ToastAndroid.SHORT);
      }
      return true;
    });
    return () => handler.remove();
  }, [showDetail, showProfile, showUpdate, showSettings]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <StatusBar style="light" backgroundColor={Colors.background} />

      {/* Home - ALWAYS mounted, never remounted */}
      {!showSettings && (
        <HomeScreen
          navigation={navigation}
          style={{ display: showDetail ? 'none' : 'flex' }}
        />
      )}

      {/* Settings - mounted when tab active */}
      {showSettings && <SettingsScreen navigation={navigation} />}

      {/* Detail - mounted on top when needed */}
      {showDetail && detailAppId && (
        <AppDetailScreen
          navigation={navigation}
          route={{ params: { appId: detailAppId } }}
        />
      )}

      {/* Bottom Nav */}
      {!showDetail && (
        <BottomNav
          activeTab={activeTab}
          onTabPress={(tab) => navigation.tabNavigate(tab)}
        />
      )}

      {/* Modals */}
      <ProfileModal visible={showProfile} onClose={() => setShowProfile(false)} onSave={() => {}} />
      <UpdateModal visible={showUpdate} updateInfo={updateInfo} onDismiss={() => setShowUpdate(false)} />
    </View>
  );
}
