import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './src/app/auth/log_in'; 
import FooterNavigation from './src/app/mainscreen/FooterNavigation'; // FooterNavigationをインポート


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="FooterNavigation">
        <Stack.Screen 
          name="Login" 
          component={Login} 
          options={{ title: 'ログイン' }} // タイトルを設定
        />
        <Stack.Screen
          name="FooterNavigation"
          component={FooterNavigation}
          options={{ headerShown: false }} // FooterNavigationにはヘッダーを表示しない
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
