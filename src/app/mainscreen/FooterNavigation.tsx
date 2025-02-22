import React, { useState } from 'react';
import { StackActions } from '@react-navigation/native';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Home from './Home';
import Profile from './Profile';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Login from '../auth/log_in';

// ルートの型定義
type RootStackParamList = {
  Login: undefined;
  FooterNavigation: undefined;
};

const Tab = createBottomTabNavigator();

// const FooterNavigation = () => {
//   const navigation = useNavigation(); // 型を明示
//   const [isModalVisible, setModalVisible] = useState(false);

//   const handleLogoutPress = () => {
//     setModalVisible(true);
//   };

//   const closeModal = () => {
//     setModalVisible(false);
//   };

//   const logout = async () => {
//     try {
//       setModalVisible(false);
//       await AsyncStorage.removeItem('userToken'); // 保存されたユーザーデータを削除
//       navigation.dispatch(StackActions.replace("Profile")); // スタックを置き換えてログイン画面に遷移
//     } catch (error) {
//       console.error('ログアウト時にエラーが発生:', error);
//     }
//   };

//   return (
//     <>
//       <Tab.Navigator
//         screenOptions={({ route }) => {
//           const iconName = (() => {
//             switch (route.name) {
//               case '問題把握':
//                 return 'search';
//               case '解決策':
//                 return 'bulb-outline';
//               default:
//                 return 'help-circle';
//             }
//           })();

//           return {
//             tabBarIcon: ({ color, size }) => (
//               <Ionicons name={iconName} size={size} color={color} />
//             ),
//             tabBarActiveTintColor: 'tomato',
//             tabBarInactiveTintColor: 'gray',
//             headerStyle: { backgroundColor: 'rgba(5,120,150,1)', height: 60 },
//             headerTintColor: 'white',
//             headerTitleStyle: { fontWeight: 'bold', fontSize: 20 },
//             headerTransparent: false,
//             headerShown:true,
            
            
//             headerRight: () => (
//               <TouchableOpacity
//                 onPress={handleLogoutPress}
//                 style={styles.logoutButton}
//                 accessibilityLabel="ログアウトボタン"
//               >
//                 <Ionicons name="log-out-outline" size={24} color="orange" />
//               </TouchableOpacity>
//             ),
//           };
//         }}
//       >
//         <Tab.Screen 
//           name="問題把握" 
//           component={Profile}
//           options={{
//             headerTitle:'私の先延ばし問題'
//           }}   
//         />
//         <Tab.Screen 
//           name="解決策" 
//           component={Home}
//           options={{
//             headerTitle:'あなたの先延ばし傾向'
//           }} 
//         />
//       </Tab.Navigator>

//       <Modal
//         animationType="fade"
//         transparent={true}
//         visible={isModalVisible}
//         onRequestClose={closeModal}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.deleteModal}>
//             <Text style={styles.modalText}>本当にログアウトしますか？</Text>
//             <View style={styles.modalButtonContainer}>
//               <TouchableOpacity
//                 style={styles.deleteButton}
//                 onPress={logout}
//                 accessibilityLabel="ログアウト確認ボタン"
//               >
//                 <Text style={styles.deleteButtonText}>ログアウトする</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={styles.cancelButton}
//                 onPress={closeModal}
//                 accessibilityLabel="キャンセルボタン"
//               >
//                 <Text style={styles.cancelButtonText}>キャンセル</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </>
//   );
// };

const FooterNavigation = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const iconName = (() => {
          switch (route.name) {
            case '問題把握':
              return 'search';
            case '解決策':
              return 'bulb-outline';
            default:
              return 'help-circle';
          }
        })();

        return {
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={iconName} size={size} color={color} />
          ),
          tabBarActiveTintColor: 'tomato',
          tabBarInactiveTintColor: 'gray',
          headerStyle: { backgroundColor: 'rgba(5,120,150,1)', height: 60 },
          headerTintColor: 'white',
          headerTitleStyle: { fontWeight: 'bold', fontSize: 20 },
        };
      }}
    >
      <Tab.Screen 
        name="問題把握" 
        component={Profile}
        options={{ headerTitle: '私の先延ばし問題' }}
      />
      <Tab.Screen 
        name="解決策" 
        component={Home}
        options={{ headerTitle: 'あなたの先延ばし傾向' }}
      />
    </Tab.Navigator>
  );
};


const styles = StyleSheet.create({
  logoutButton: { marginRight: 15, padding: 10 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteModal: { backgroundColor: 'white', padding: 20, borderRadius: 10, alignItems: 'center' },
  modalText: { fontSize: 16, marginBottom: 20, fontWeight: 'bold', color: 'darkred' },
  modalButtonContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '80%' },
  deleteButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButton: { backgroundColor: 'grey', padding: 10, borderRadius: 5, flex: 1, alignItems: 'center' },
  deleteButtonText: { color: 'white', fontWeight: 'bold' },
  cancelButtonText: { color: 'white', fontWeight: 'bold' },
});

export default FooterNavigation;
