import { collection, doc, setDoc, getDoc } from "firebase/firestore";
import { sha256 } from 'crypto-hash';

import { db } from "./firebase";

const generateDocKey = async (text) => {
  return await sha256(text);
};

const saveTranslationToFirestore = async (text, translatedText) => {
  const docKey = await generateDocKey(text);
  const translationsCollection = collection(db, "translations");
  const translationDoc = doc(translationsCollection, docKey);
  await setDoc(translationDoc, { text, translatedText });
};

const getTranslationFromFirestore = async (text) => {
  const docKey = await generateDocKey(text);
  const translationsCollection = collection(db, "translations");
  const translationDoc = doc(translationsCollection, docKey);
  const docSnapshot = await getDoc(translationDoc);

  if (docSnapshot.exists()) {
    return docSnapshot.data().translatedText;
  } else {
    return null;
  }
};

const saveTranslationToLocalCache = async (text, translatedText) => {
  const docKey = await generateDocKey(text);
  localStorage.setItem(docKey, translatedText);
};

const getTranslationFromLocalCache = async (text) => {
  const docKey = await generateDocKey(text);
  return localStorage.getItem(docKey);
};

const api_key = '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';

export const translateToSpanishGPT3 = async (text) => {
  // Primero verifica si la traducción ya está en el almacenamiento local
  const localCacheTranslation = await getTranslationFromLocalCache(text);
  if (localCacheTranslation) {
    return localCacheTranslation;
  }

  // Luego verifica si la traducción ya está en Firestore
  const firestoreTranslation = await getTranslationFromFirestore(text);
  if (firestoreTranslation) {
    // Guarda la traducción en el almacenamiento local antes de devolverla
    await saveTranslationToLocalCache(text, firestoreTranslation);
    return firestoreTranslation;
  }

  // Si no está en el almacenamiento local ni en Firestore,
  // realiza la llamada a la API de GPT-3 para traducir el texto
  const response = await fetch('https://api.openai.com/v1/engines/text-davinci-003/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${api_key}`,
    },
    body: JSON.stringify({
      prompt: `Translate the following English text to Spanish: "${text}"`,
      max_tokens: 1000,
      n: 1,
      stop: null,
      temperature: 1,
    }),
  });

  const data = await response.json();

  // Guarda la traducción en el almacenamiento local y en Firestore antes de devolverla
  await saveTranslationToLocalCache(text, data.choices[0].text.trim());
  await saveTranslationToFirestore(text, data.choices[0].text.trim());

  return data.choices[0].text.trim();
};