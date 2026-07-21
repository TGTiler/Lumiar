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
type Screen = 'main' | 'AppDetail';

interface HistoryEntry {
  screen: Screen;
  tab: Tab;
  params?: any;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [screen, setScreen] = useState<Screen>('main');
  const [screenParams, setScreenParams] = useState<any>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [showUpdate, setShowUpdate] = useState(false);

  const historyRef = useRef<HistoryEntry[]>([]);
  const lastBackPress = useRef<number>(0);

  // Check for updates on app start
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

  const pushHistory = useCallback(() => {
    historyRef.current.push({ screen, tab: activeTab, params: screenParams });
    if (historyRef.current.length > 20) {
      historyRef.current = historyRef.current.slice(-20);
    }
  }, [screen, activeTab, screenParams]);

  const navigation = {
    navigate: (s: string, params?: any) => {
      pushHistory();
      if (s === 'AppDetail') {
        setScreen('AppDetail');
        setScreenParams(params);
      } else if (s === 'ProfileModal') {
        setShowProfile(true);
      }
    },
    goBack: () => {
      const prev = historyRef.current.pop();
      if (prev) {
        setScreen(prev.screen);
        setActiveTab(prev.tab);
        setScreenParams(prev.params);
      } else {
        setScreen('main');
        setScreenParams(null);
      }
    },
    params: screenParams,
    tabNavigate: (tab: Tab) => {
      pushHistory();
      setActiveTab(tab);
      setScreen('main');
      setScreenParams(null);
    },
  };

  // Back handler
  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (showUpdate) {
        setShowUpdate(false);
        return true;
      }

      if (showProfile) {
        setShowProfile(false);
        return true;
      }

      if (screen === 'AppDetail') {
        navigation.goBack();
        return true;
      }

      if (activeTab === 'settings') {
        navigation.tabNavigate('home');
        return true;
      }

      const now = Date.now();
      if (now - lastBackPress.current < 2000) {
        BackHandler.exitApp();
        return true;
      } else {
        lastBackPress.current = now;
        if (Platform.OS === 'android') {
          ToastAndroid.show('Pressione novamente para sair', ToastAndroid.SHORT);
        }
        return true;
      }
    });

    return () => handler.remove();
  }, [screen, activeTab, showProfile, showUpdate]);

  const renderScreen = () => {
    if (screen === 'AppDetail') {
      return (
        <AppDetailScreen
          navigation={navigation}
          route={{ params: screenParams }}
        />
      );
    }

    if (activeTab === 'settings') {
      return <SettingsScreen navigation={navigation} />;
    }

    return <HomeScreen navigation={navigation} />;
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <StatusBar style="light" backgroundColor={Colors.background} />
      {renderScreen()}

      {screen === 'main' && (
        <BottomNav
          activeTab={activeTab}
          onTabPress={(tab) => navigation.tabNavigate(tab as Tab)}
        />
      )}

      <ProfileModal
        visible={showProfile}
        onClose={() => setShowProfile(false)}
        onSave={() => {}}
      />

      <UpdateModal
        visible={showUpdate}
        updateInfo={updateInfo}
        onDismiss={() => setShowUpdate(false)}
      />
    </View>
  );
}
