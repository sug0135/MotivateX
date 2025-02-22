import { initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
import { getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage"


const firebaseConfig = {
  apiKey: "AIzaSyBTa2050wmdcDt0PS5oPvwzzCKxJTHL4LY",
  authDomain: "motivatex-8fd72.firebaseapp.com",
  projectId: "motivatex-8fd72",
  storageBucket: "motivatex-8fd72.appspot.com",
  messagingSenderId: "945476020375",
  appId: "1:945476020375:web:5eba2c940d69a6657721d2"
};


const app = initializeApp(firebaseConfig)
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  })
const db = getFirestore(app)




export const firestore = getFirestore(app);
export { app, auth, db }

