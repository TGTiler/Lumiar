import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, BackHandler, ToastAndroid, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Colors } from './src/constants/theme';
import { HomeScreen } from './src/screens/HomeScreen';
import { AppDetailScreen } from './src/screens/AppDetailScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { ProfileModal } from './src/components/ProfileModal';
import { BottomNav } from './src/components/BottomNav';

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

  const historyRef = useRef<HistoryEntry[]>([]);
  const lastBackPress = useRef<number>(0);

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
      // If profile modal is open, close it
      if (showProfile) {
        setShowProfile(false);
        return true;
      }

      // If we're on AppDetail, go back to home
      if (screen === 'AppDetail') {
        navigation.goBack();
        return true;
      }

      // If we're on settings tab, switch to home
      if (activeTab === 'settings') {
        navigation.tabNavigate('home');
        return true;
      }

      // We're on home root - double tap to exit
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
  }, [screen, activeTab, showProfile]);

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
    </View>
  );
}
