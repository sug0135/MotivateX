import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ImageBackground,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Link, router } from 'expo-router';
import { auth } from '../../config';

const handleSignUp = (email: string, password: string): void => {
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log(userCredential.user.uid);
      router.push('/mainscreen/Home'); // サインアップ後の画面に遷移
    })
    .catch((error) => {
      const { code } = error;
      let customMessage;

      // エラーコードに応じてカスタムメッセージを設定
      switch (code) {
        case "auth/invalid-email":
          customMessage = "有効なメールアドレスを入力してください。";
          break;
        default:
          customMessage = "エラーが発生しました。もう一度お試しください。";
          break;
      }

      // Alertでカスタムメッセージを表示
      Alert.alert("ログインエラー", customMessage);
    });
};

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <ImageBackground
      source={require('../../../assets/background.png')} // 背景画像のパスを設定
      style={styles.background}
      resizeMode="cover"
    >
      {/* <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      > */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
         <View style={styles.container}>
          <View style={styles.fixedHeader}>
            <Text style={styles.subtitle}>先延ばし解決支援アプリMotivateX</Text>
            <Text style={styles.title}>新規登録</Text>
          </View>  
            
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
                style={styles.signupButton}
                onPress={() => handleSignUp(email, password)}
              >
                <Text style={styles.signupButtonText}>登録する</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>登録済みの方は</Text>
              <Link href="/auth/log_in" asChild replace>
                <TouchableOpacity>
                  <Text style={styles.loginLink}>こちら</Text>
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
    paddingTop: 70,
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
    color: '#ffb968',
  },
  keyboardAvoidingView: {
    flex: 0.63,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // width: '100%', // スクロールビュー内で最大幅を確保
  },
  inputContainer: {
    width: '95%', // 横幅を画面の85%に変更（レスポンシブに調整）
    // maxWidth: 400, // 必要に応じて最大幅を指定（デバイスが広い場合でも調整可能）
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
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  signupButton: {
    backgroundColor: '#fbd5c0',
    width: '50%',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  signupButtonText: {
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
  loginLink: {
    fontSize: 14,
    color: '#467fd3',
    marginLeft: 5,
  },
});

export default SignUp;
