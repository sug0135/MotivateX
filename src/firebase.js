// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebaseの設定情報（プロジェクトごとに異なる）
const firebaseConfig = {
  apiKey: "AIzaSyBTa2050wmdcDt0PS5oPvwzzCKxJTHL4LY",
  authDomain: "motivatex-8fd72.firebaseapp.com",
  projectId: "motivatex-8fd72",
  storageBucket: "motivatex-8fd72.appspot.com",
  messagingSenderId: "945476020375",
  appId: "1:945476020375:web:5eba2c940d69a6657721d2"
};

// Firebaseの初期化
const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);

