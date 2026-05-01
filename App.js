import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import StatsScreen from './src/screens/StatsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { registerNotification, scheduleDailyReminder } from './src/notifications';

const Tab = createBottomTabNavigator();

const icons = { ホーム: '🏠', カレンダー: '📅', 統計: '📊', 設定: '⚙️' };

export default function App() {
  useEffect(() => {
    (async () => {
      try {
        await registerNotification();
        await scheduleDailyReminder(20, 0);
      } catch (e) {
        console.warn('Notification setup failed:', e);
      }
    })();
  }, []);

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>{icons[route.name]}</Text>,
          tabBarLabelStyle: { fontSize: 12 },
        })}
      >
        <Tab.Screen name="ホーム" component={HomeScreen} />
        <Tab.Screen name="カレンダー" component={CalendarScreen} />
        <Tab.Screen name="統計" component={StatsScreen} />
        <Tab.Screen name="設定" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
