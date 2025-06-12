// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Passo de depuração: Log para ver se as variáveis de ambiente estão a ser carregadas
console.log("Variáveis de Ambiente do Firebase:", {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? "Carregada" : "Faltando",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? "Carregada" : "Faltando",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ? "Carregada" : "Faltando",
});

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Verificação para evitar erro de inicialização se as variáveis estiverem em falta
let app, auth, db;
if (firebaseConfig.apiKey) {
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
    } catch (error) {
        console.error("Erro ao inicializar o Firebase:", error);
    }
} else {
    console.error("Configuração do Firebase incompleta. O aplicativo não pode ser inicializado.");
}

export { app, auth, db };
