import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Alert,
  ImageBackground,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { signInWithEmailAndPassword,onAuthStateChanged } from 'firebase/auth';
import { Link, router } from 'expo-router';
import { auth } from '../../config';
import { FirebaseError } from 'firebase/app';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true); // ローディング状態を管理

  // アプリ起動時にログイン状態を確認
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // ユーザーがログインしている場合、メイン画面に移動
        router.replace('/mainscreen/FooterNavigation');
      }else {
        setLoading(false); // ローディング終了
      }
    });
    return () => unsubscribe();
  }, []);

  const handlePress = async (email: string, password: string): Promise<void> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log(userCredential.user.uid);
      router.replace('/mainscreen/FooterNavigation'); // メイン画面に移動
    } catch (error) {
      if (error instanceof FirebaseError) {
        const { code } = error; // code プロパティを安全に取得
        let customMessage;
        switch (code) {
          case 'auth/invalid-email':
            customMessage = '有効なメールアドレスを入力してください。';
            break;
          case 'auth/user-not-found':
            customMessage = 'ユーザーが見つかりません。';
            break;
          case 'auth/wrong-password':
            customMessage = 'パスワードが間違っています。';
            break;
          default:
            customMessage = 'エラーが発生しました。もう一度お試しください。';
        }
        Alert.alert('ログインエラー', customMessage);
      } else {
        console.error('予期しないエラー:', error);
      }
    }
  };

  if (loading) {
    // ローディング中はスピナーを表示
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text>ログイン状態を確認しています...</Text>
      </View>
    );
  }

     
// const Login = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
  
// const handlePress = (email: string, password: string): void => {
//   signInWithEmailAndPassword(auth, email, password)
//     .then((userCredential) => {
//       console.log(userCredential.user.uid);
//       router.push('/mainscreen/FooterNavigation');
//     })
//     .catch((error) => {
//       const { code } = error;
//       let customMessage;

//       // エラーコードに応じてカスタムメッセージを設定
//       switch (code) {
//         case "auth/invalid-email":
//           customMessage = "有効なメールアドレスを入力してください。";
//           break;
//         default:
//           customMessage = "エラーが発生しました。もう一度お試しください。";
//           break;
//       }

//       // Alertでカスタムメッセージを表示
//       Alert.alert("ログインエラー", customMessage);
//     });
// };

  return (
    <ImageBackground
    source={require('../../../assets/background.png')}
    style={styles.background}
    resizeMode="cover"
  >
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* 固定部分 */}
        <View style={styles.fixedHeader}>
          <Text style={styles.subtitle}>先延ばし解決支援アプリ</Text>
          <Text style={styles.title}>MotivateXへようこそ!</Text>
        </View>

        {/* 入力部分 */}
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={(text) => setEmail(text)}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="メールアドレス"
                textContentType="emailAddress"
              />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={(text) => setPassword(text)}
                autoCapitalize="none"
                secureTextEntry
                placeholder="パスワード"
                textContentType="password"
              />
              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => handlePress(email, password)}
              >
                <Text style={styles.loginButtonText}>ログイン</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>新規登録はこちら!</Text>
              <Link href="/auth/sign_up" asChild replace>
                <TouchableOpacity>
                  <Text style={styles.signupLink}>アカウントを作成</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  </ImageBackground>

  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 70, // これで全体を少しだけ下に移動
  },
  fixedHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  subtitle: { // 新しいスタイル
    fontSize: 14, // サイズを調整
    color: '#046576', // 少し控えめな色
    marginBottom: 2,
    paddingTop: 140
    // タイトルとの間隔を少し空ける
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00796B',
  },
  keyboardAvoidingView: {
    flex: 0.65,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    width: '95%',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // 背景色に透明度を追加
    paddingVertical: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  input: {
    width: '90%',
    height: 50,
    backgroundColor: '#F7F7F7',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  loginButton: {
    backgroundColor: '#9ad0d3',
    width: '50%',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#046576',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#046576',
  },
  signupLink: {
    fontSize: 14,
    color: '#467fd3',
    marginLeft: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Login;
