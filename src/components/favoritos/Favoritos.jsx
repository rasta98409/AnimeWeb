import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import  "./Favoritos.css";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Link } from "react-router-dom";
import { Helmet } from 'react-helmet';

const Favoritos = ({  currentUser }) => {
  const [favorites, setFavorites] = useState([]);

  const formatAnimeName = (name) => {
    if (!name) {
      return "";
    }
    // Reemplaza los espacios con guiones y elimina caracteres especiales
    return name.replace(/ /g, "-").replace(/[^\w-]/gi, '');
  };


  useEffect(() => {
    if (currentUser) {
      const userFavoritesRef = collection(
        db,
        "users",
        currentUser.uid,
        "favorites"
      );
      const q = query(userFavoritesRef);
  
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const newFavorites = snapshot.docs.map((doc) => {
          return {
            id: doc.id,
            ...doc.data(),
          };
        });
        setFavorites(newFavorites);
      });
  
      return () => {
        unsubscribe();
      };
    }
  }, [currentUser]);

 // Función para determinar la clase del título


   
  return (
    <div className="container">
     <Helmet>
        <title>Taberna Anime - Favoritos </title>
      </Helmet>
    <div className="icon-h1">
      <h1 className="genero-h1">Favoritos</h1>
      <box-icon className='rastas' name='star' type='solid' animation='tada' color='#972525'  size='lg'></box-icon>
      </div>
      <div className="card-container">
      {favorites.map((favorite) => (
  <Link
    key={favorite.id}
    to={`/anime/${favorite.id}/${formatAnimeName(favorite.title)}`}
    className="h3-genero-link"
  >
    <div className="card-home card-home-fixed-height">
      <LazyLoadImage src={favorite.imageUrl} alt={favorite.title} />
      <h3
        className={`h3-genero-fav ${
          favorite.title && favorite.title.length > 26 ? "h3-genero-fav-largo" : "h3-genero-fav-corto"
        } `}
        data-title={favorite.title}
      >
      </h3>
    </div>
  </Link>
))}
      </div>
    </div>
  );
};

export default Favoritos;