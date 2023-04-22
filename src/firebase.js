import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB-4lnSTQLYrYZy2VieiuyiWsOpUDhDeQg",
  authDomain: "mi-projecto-web-59b52.firebaseapp.com",
  projectId: "mi-projecto-web-59b52",
  storageBucket: "mi-projecto-web-59b52.appspot.com",
  messagingSenderId: "347303903774",
  appId: "1:347303903774:web:2ef9b609eb08f7284c240f",
  measurementId: "G-1RCCHSC1PF",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);


export { storage, db, auth };