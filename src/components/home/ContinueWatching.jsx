import React, { useState, useEffect } from "react";
import { useAuth } from "../../AuthContext";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate, Link } from "react-router-dom";
import { formatAnimeName } from "../../formatAnimeName";






const ContinueWatching = () => {
  const [watchedEpisodes, setWatchedEpisodes] = useState([]);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const cloudName = "dgemgyoxo";
  
  const resizeImage = (imageUrl, width, height) => {
    if (!imageUrl) {
      return null;
    }
    const urlParts = imageUrl.split("/");
    const imageName = urlParts[urlParts.length - 1];
    return `https://res.cloudinary.com/${cloudName}/image/fetch/w_${width},h_${height},c_fill/${imageUrl}`;
  };


  const fetchEpisodeId = async (animeId, episodeNumber) => {
  try {
    const kitsuUrl = `https://kitsu.io/api/edge/anime/${animeId}/episodes?page[limit]=1&page[offset]=${episodeNumber - 1}`;
    const response = await fetch(kitsuUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      throw new Error("No se encontraron datos en la respuesta de la API");
    }

    return data.data[0].id;
  } catch (error) {
    console.error("Error al obtener el ID del episodio:", error);
    return null;
  } 
}

const handleWatchedEpisodeClick = async (animeId, episodeNumber) => {
  // Obtener el ID del episodio utilizando la API de Kitsu
  const episodeId = await fetchEpisodeId(animeId, episodeNumber);

  // Redirigir al usuario al episodio si se encontró el ID
  if (episodeId) {
    navigate(`/anime/${animeId}/episode/${episodeNumber}`);
  } else {
    alert("No se pudo obtener el ID del episodio. Por favor, inténtalo de nuevo.");
  }
};



const unique = (array, comparator) => {
  return array.filter((value, index, self) => {
    return (
      self.findIndex((other) => {
        return comparator(value, other);
      }) === index
    );
  });
};


useEffect(() => {
  if (currentUser) {
    const watchedEpisodesRef = collection(
      db,
      "users",
      currentUser.uid,
      "watchedEpisodes"
    );
    const q = query(watchedEpisodesRef, orderBy("watchedAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newWatchedEpisodes = unique(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          episodeId: doc.data().episodeId,
        })),
        (a, b) => a.animeId === b.animeId && a.number === b.number
      );
      setWatchedEpisodes(newWatchedEpisodes);
    });

    return () => {
      unsubscribe();
    };
  }
}, [currentUser]);




  return (
    <div className="view-all ">
    <div className="continue-watching-section">
      <h1>Seguir viendo</h1>
      <div className="card-container">
      {watchedEpisodes.map((episode, index) => (
  <div
    key={episode.id}
    onClick={() =>
      handleWatchedEpisodeClick(episode.animeId, episode.number)
    }
    className={`${index === watchedEpisodes.length - 1 ? "hide-episode" : ""}`}
  >
<div className="contain-img-name">
    <div className="card-home card-home-continue-watching">
      <img src={resizeImage(episode.imageUrl, 400, 225)} alt={episode.title} />
      
      <h3
              className={`h3-genero-fav ${
                episode.animeTitle &&  episode.animeTitle.length > 26 ? "h3-genero-fav-largo" : "h3-genero-fav-corto"
              } `}
              
              data-title={`${episode.animeTitle}  - Episodio ${episode.number}`}
            >
            </h3>
  
           
          
    </div>
    </div>
  </div>
))}
      </div>
    </div>
    </div>
  );
};

export default ContinueWatching;