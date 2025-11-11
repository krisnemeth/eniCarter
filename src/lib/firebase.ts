import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: "AIzaSyB2-QdC0snFl_94oci3dmEL34IgoruRWBU",
  authDomain: "enicarter.firebaseapp.com",
  projectId: "enicarter",
  storageBucket: "enicarter.firebasestorage.app",
  messagingSenderId: "396606781521",
  appId: "1:396606781521:web:6f0a1bb41dc0d4585b2070",
  measurementId: "G-9SNQBE7CBN"
};

function getFirebaseApp(): FirebaseApp {
  if (!getApps().length) {
    return initializeApp(firebaseConfig)
  }
  return getApp()
}

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)
export const analytics = getAnalytics(app)


