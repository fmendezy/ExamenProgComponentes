import { initializeApp } from "firebase/app";
import { getFirestore, doc, deleteDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBePgl7yj_y6mtuMHecqp8GQ8R9-05QD8s",
  authDomain: "francisco-2c8a2.firebaseapp.com",
  projectId: "francisco-2c8a2",
  storageBucket: "francisco-2c8a2.firebasestorage.app",
  messagingSenderId: "283397549152",
  appId: "1:283397549152:web:af65d42bf37bfdaf366705",
  measurementId: "G-TM4EFCM1ZG"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, deleteDoc, doc };






