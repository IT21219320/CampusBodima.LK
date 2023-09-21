// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBfBxB62Lg5mncrCH6hndb3fHwOhLIMKTw",
  authDomain: "campusbodima-71f84.firebaseapp.com",
  projectId: "campusbodima-71f84",
  storageBucket: "campusbodima-71f84.appspot.com",
  messagingSenderId: "974005068200",
  appId: "1:974005068200:web:74c6de72326f595152bd9d",
  measurementId: "G-07W153SXSN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
 
// Firebase storage reference
const storage = getStorage(app);
export default storage;