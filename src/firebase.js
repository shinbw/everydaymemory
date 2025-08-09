// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, signInAnonymously } from "firebase/auth";

// ↓↓↓ Firebase 콘솔에서 복사해 붙여넣기 ↓↓↓
const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "XXXX",
  appId: "XXXXX",
};
// ↑↑↑ 여기 본인 값으로 교체 ↑↑↑

const app = initializeApp(firebaseConfig);

// 익명 로그인 (읽기/쓰기 위해)
const auth = getAuth(app);
signInAnonymously(auth).catch(console.error);

export const db = getFirestore(app);
export const storage = getStorage(app);
