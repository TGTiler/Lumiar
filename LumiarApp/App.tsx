import React, { useState } from 'react';
import { View, Modal } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Colors } from './src/constants/theme';
import { HomeScreen } from './src/screens/HomeScreen';
import { AppDetailScreen } from './src/screens/AppDetailScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { ProfileModal } from './src/components/ProfileModal';
import { BottomNav } from './src/components/BottomNav';

type Tab = 'home' | 'settings';
type Screen = 'main' | 'AppDetail';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [screen, setScreen] = useState<Screen>('main');
  const [screenParams, setScreenParams] = useState<any>(null);
  const [showProfile, setShowProfile] = useState(false);

  const navigation = {
    navigate: (s: string, params?: any) => {
      if (s === 'AppDetail') {
        setScreen('AppDetail');
        setScreenParams(params);
      } else if (s === 'ProfileModal') {
        setShowProfile(true);
      }
    },
    goBack: () => {
      setScreen('main');
      setScreenParams(null);
    },
    params: screenParams,
    tabNavigate: (tab: Tab) => {
      setActiveTab(tab);
      setScreen('main');
      setScreenParams(null);
    },
  };

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
