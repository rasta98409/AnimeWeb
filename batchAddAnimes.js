const firebase = require('firebase/app');
require('firebase/firestore');


const firebaseConfig = {
  apiKey: "AIzaSyB-4lnSTQLYrYZy2VieiuyiWsOpUDhDeQg",
  authDomain: "mi-projecto-web-59b52.firebaseapp.com",
  projectId: "mi-projecto-web-59b52",
  storageBucket: "mi-projecto-web-59b52.appspot.com",
  messagingSenderId: "347303903774",
  appId: "1:347303903774:web:2ef9b609eb08f7284c240f",
  measurementId: "G-1RCCHSC1PF",
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

const animesToAdd = [
  {
    id: 4,
    title: "One Piece",
    genre: "accion",
    image: "https://static.wikia.nocookie.net/onepiece/images/6/6d/One_Piece_Logo.png",
  },
  {
    id: 5,
    title: "My Hero Academia",
    genre: "accion",
    image: "https://static.wikia.nocookie.net/bokunoheroacademia/images/6/65/My_Hero_Academia_Logo.png",
  },
  {
    id: 6,
    title: "Attack on Titan",
    genre: "accion",
    image: "https://static.wikia.nocookie.net/shingekinokyojin/images/5/5d/Shingeki_no_Kyojin_Title_Card.png",
  },
  {
    id: 7,
    title: "Dragon Ball",
    genre: "accion",
    image: "https://static.wikia.nocookie.net/dragonball/images/6/62/Dragon_Ball_Logo.png",
  },
  {
    id: 8,
    title: "Bleach",
    genre: "accion",
    image: "https://static.wikia.nocookie.net/bleach/images/1/1b/Bleach_Logo.png",
  },
  // ...más animes del género acción
];

const addAnimesToDatabase = async (animes) => {
  const animeCollection = db.collection('animes');

  for (const anime of animes) {
    await animeCollection.add(anime);
    console.log(`Anime ${anime.title} agregado a la base de datos.`);
  }
};

addAnimesToDatabase(animesToAdd);


