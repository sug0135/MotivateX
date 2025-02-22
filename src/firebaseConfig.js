// firebaseConfig.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebaseプロジェクトの設定（あなたのAPIキーを使用）
const firebaseConfig = {
  apiKey: "AIzaSyBTa2050wmdcDt0PS5oPvwzzCKxJTHL4LY",
  authDomain: "motivatex-8fd72.firebaseapp.com",
  projectId: "motivatex-8fd72",
  storageBucket: "motivatex-8fd72.appspot.com",
  messagingSenderId: "945476020375",
  appId: "1:945476020375:web:example" // 仮のID、適宜変更してください
};

// Firebaseの初期化
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Firestoreの初期化
const db = getFirestore(app);
const auth = getAuth(app); // Firebase Authentication

export { db };

