import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons  from 'react-native-vector-icons/Ionicons'; // 正しいインポート
import { Stack } from 'expo-router'; // expo-routerのStackインポート

import Home from './mainscreen/Home';
import AIChat from './mainscreen/AIChat';
import ProfileScreen from './mainscreen/Profile';

const Tab = createBottomTabNavigator();

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => {
      let iconName: string;

      // アイコン名をswitch文で割り当て
      switch (route.name) {
        case 'Home':
          iconName = 'home';
          break;
        case 'AIChat':
          iconName = 'chatbubble';
          break;
        case 'Profile':
          iconName = 'person';
          break;
        default:
          iconName = 'help-circle'; // フォールバックアイコン
      }

      return {
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={iconName} size={size} color={color} />
        ),
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      };
    }}
  >
    <Tab.Screen name="Home" component={Home} />
    <Tab.Screen name="AIChat" component={AIChat} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const Layout = () => (
  <Stack>
    {/* Stack.Screenにnameのみを指定し、ファイルベースルーティングに依存 */}
    <Stack.Screen name="index" options={{ headerShown: false }} />
  </Stack>
);

export default Layout;
