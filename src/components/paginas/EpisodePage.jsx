import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import './EpisodePage.css'
import OptionBar from './OptionBar';
import CommentSection from './CommentSection';
// import "boxicons";
import { db, storage, auth } from "../../firebase";
import { collection,getDocs,query, where, doc, setDoc, updateDoc, onSnapshot, serverTimestamp, increment, getDoc, addDoc  } from "firebase/firestore";
import animeEpisodesSources from './AnimeData';
import { translateToSpanishGPT3 } from "../../translationUtils";
import { Helmet } from 'react-helmet';
import { fetchAnimeEpisodes, getTotalVideoLinks } from "./fetchAnimeEpisodes"; // Agregue esta línea





const EpisodePage = () => {
  const { animeId, episodeNumber } = useParams();
  const [animeName, setAnimeName] = useState("");
  const [episodeName, setEpisodeName] = useState("");
  const [episodeDescription, setEpisodeDescription] = useState("");
  const [currentEpisodeNumber, setEpisodeNumber] = useState(0);
  const [videoLink, setVideoLink] = useState("");
  const [uploadedImageName, setUploadedImageName] = useState("");
  const [episodeReleaseDate, setEpisodeReleaseDate] = useState("");
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [userVote, setUserVote] = useState(null);
  const episodeRef = doc(db, "episodes", `${animeId}-${episodeNumber}`);
  const [selectedOption, setSelectedOption] = useState("Opción 1");
  const [totalEpisodes, setTotalEpisodes] = useState(0);
  const [imageUrl, setImageUrl] = useState("");
  const [isVoting, setIsVoting] = useState(false);
  const [hasNextEpisodeVideo, setHasNextEpisodeVideo] = useState(false);

  const navigate = useNavigate();

  

  const checkNextEpisodeVideo = async (animeId, nextEpisodeNumber) => {
    const totalVideoEpisodes = getTotalVideoLinks(animeId);
    setHasNextEpisodeVideo(nextEpisodeNumber <= totalVideoEpisodes);
  };

  const saveWatchedEpisode = async (userId, animeId, episodeNumber, imageUrl, title, animeTitle) => {
    const watchedEpisodesRef = collection(db, "users", userId, "watchedEpisodes");
    
    // Verifica si el episodio ya está en la base de datos
    const existingEpisodeSnapshot = await getDocs(query(watchedEpisodesRef, where("animeId", "==", animeId), where("number", "==", episodeNumber)));
    
    if (existingEpisodeSnapshot.empty) {
      await addDoc(watchedEpisodesRef, {
        animeId,
        number: episodeNumber,
        imageUrl,
        title,
        animeTitle,
        watchedAt: serverTimestamp(),
      });
    }
  };


  
  const saveVote = async (userId, episodeId, vote, previousVote) => {
    // Guarda el voto en el documento del usuario
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, {
      [episodeId]: vote,
    }, { merge: true });
  
    localStorage.setItem(`${userId}-${episodeId}`, vote);
    const episodeDoc = await getDoc(episodeRef);
    if (!episodeDoc.exists()) {
      // Crea el documento con valores predeterminados si no existe
      await setDoc(episodeRef, {
        likes: 0,
        dislikes: 0,
      });
    }


    // Incrementa o disminuye los votos en el documento del episodio

    if (vote === 1 && previousVote === null) {
      await updateDoc(episodeRef, {
        likes: increment(1),
      });
    } else if (vote === 1 && previousVote === -1) {
      await updateDoc(episodeRef, {
        likes: increment(1),
        dislikes: increment(-1),
      });
    } else if (vote === -1 && previousVote === null) {
      await updateDoc(episodeRef, {
        dislikes: increment(1),
      });
    } else if (vote === -1 && previousVote === 1) {
      await updateDoc(episodeRef, {
        likes: increment(-1),
        dislikes: increment(1),
      });
    }
  };

  const handleLike = async () => {
    if (isVoting) return;
    setIsVoting(true);
  
    await saveVote(auth.currentUser.uid, `${animeId}-${episodeNumber}`, 1, userVote);

    if (userVote === null) {
      setLikes(likes + 1);
      setUserVote(1);
      await saveVote(auth.currentUser.uid, episodeNumber, 1);
    } else if (userVote === -1) {
      setLikes(likes + 1);
      setDislikes(dislikes - 1);
      setUserVote(1);
      await saveVote(auth.currentUser.uid, episodeNumber, 1);
    }
    setIsVoting(false);

  };
  
  const handleDislike = async () => {
    if (isVoting) return;
    setIsVoting(true);
  
    await saveVote(auth.currentUser.uid, `${animeId}-${episodeNumber}`, -1, userVote);

    if (userVote === null) {
      setDislikes(dislikes + 1);
      setUserVote(-1);
      await saveVote(auth.currentUser.uid, episodeNumber, -1);
    } else if (userVote === 1) {
      setLikes(likes - 1);
      setDislikes(dislikes + 1);
      setUserVote(-1);
      await saveVote(auth.currentUser.uid, episodeNumber, -1);
    }
      setIsVoting(false);
  };

  const fetchUserVote = async (userId, animeId, episodeId) => {
    const storedVote = localStorage.getItem(`${userId}-${animeId}-${episodeId}`);
  if (storedVote) {
    return parseInt(storedVote);
  }

  
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      return userDoc.data()[`${animeId}-${episodeId}`] || null;
    } else {
      return null;
    }
  };

  const fetchVideoLink = async (animeId, episodeNumber, option) => {
    const animeEpisodes = await fetchAnimeEpisodes(animeId);
    const videoUrl = animeEpisodes?.[episodeNumber]?.[option];
    if (videoUrl) {
      setVideoLink(videoUrl);
    } else {
      console.error("Enlace de video no encontrado");
    }
  };

  const handleOptionChange = (option) => {
    setSelectedOption(option);
  };


  useEffect(() => {
    const fetchVotes = async () => {
      const userId = auth.currentUser.uid;
      const userVote = await fetchUserVote(userId, animeId, episodeNumber); // Agrega animeId aquí
      setUserVote(userVote);
  
      const episodeRef = doc(db, "episodes", `${animeId}-${episodeNumber}`); // Cambia esto también
      const unsubscribe = onSnapshot(episodeRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setLikes(data.likes || 0);
          setDislikes(data.dislikes || 0);
        } else {
          console.error("Documento no encontrado");
        }
      });
  
      return () => {
        unsubscribe();
      };
    };
  
    fetchVotes();
  }, [episodeNumber, animeId]); // Agrega animeId aquí




  const handleImageChange = (event) => {
    if (event.target.files[0]) {
      setUploadedImageName(event.target.files[0].name);
    } else {
      setUploadedImageName("");
    }
  };
  

  useEffect(() => {
    fetchEpisodeDetails(animeId, episodeNumber);
    fetchAnimeDetails(animeId);
  }, [episodeNumber, animeId]);

  useEffect(() => {
    if (currentEpisodeNumber) {
      fetchVideoLink(animeId, currentEpisodeNumber, selectedOption);
      checkNextEpisodeVideo(animeId, currentEpisodeNumber + 1); // Verifica si el siguiente episodio tiene enlace de video
    }
  }, [currentEpisodeNumber, animeId, selectedOption]);

  const fetchEpisodeDetails = async (animeId, episodeNumber) => {
    const response = await fetch(
      `https://kitsu.io/api/edge/anime/${animeId}/episodes?page[limit]=1&page[offset]=${episodeNumber - 1}`
    );
    const data = await response.json();
  
    if (data.data.length > 0) {
      const episode = data.data[0];
  
      if (episode.attributes.titles.en || episode.attributes.canonicalTitle) {
        const translatedEpisodeName = await translateToSpanishGPT3(
          episode.attributes.titles.en || episode.attributes.canonicalTitle
        );
        setEpisodeName(translatedEpisodeName.replace(/"/g, ""));
      }

      setEpisodeNumber(episode.attributes.number);
  
      // Establece la URL de la imagen del episodio
      setImageUrl(episode.attributes.thumbnail && episode.attributes.thumbnail.original);
  
      // Traduce la descripción del episodio y establece el estado
      if (episode.attributes.description) {
        const translatedDescription = await translateToSpanishGPT3(
          episode.attributes.description
        );
        setEpisodeDescription(translatedDescription);
      }
  
      // Agrega esta línea para establecer la fecha de lanzamiento
      setEpisodeReleaseDate(episode.attributes.airdate);
    } else {
      console.error("Episodio no encontrado");
    }
  };


  const fetchAnimeDetails = async (animeId) => {
    const response = await fetch(`https://kitsu.io/api/edge/anime/${animeId}`);
    const data = await response.json();
  
    setAnimeName(
      data.data.attributes.titles.en || data.data.attributes.canonicalTitle
    );
  
    // Obtiene el total de episodios
    const totalVideoEpisodes = getTotalVideoLinks(animeId);
    const totalApiEpisodes = data.data.attributes.episodeCount;
  
    // Usa el mayor valor entre los episodios de video y de la API
    setTotalEpisodes(Math.max(totalVideoEpisodes, totalApiEpisodes));
  };
  


  const updateWatchedEpisode = async (userId, animeId, episodeNumber) => {
    const watchedEpisodesRef = collection(db, "users", userId, "watchedEpisodes");
  
    // Encuentra el episodio existente en la base de datos
    const existingEpisodeSnapshot = await getDocs(query(watchedEpisodesRef, where("animeId", "==", animeId), where("number", "==", episodeNumber)));
  
    if (!existingEpisodeSnapshot.empty) {
      const docId = existingEpisodeSnapshot.docs[0].id;
      const episodeDocRef = doc(db, "users", userId, "watchedEpisodes", docId);
  
      // Actualiza el campo 'watchedAt' del episodio
      await updateDoc(episodeDocRef, {
        watchedAt: serverTimestamp(),
      });
    }
  };
 

  
  const handleNextEpisode = async () => {
    if (currentEpisodeNumber) {
      const nextEpisodeNumber = currentEpisodeNumber + 1;
  
      if (nextEpisodeNumber) {
        // Obtiene los detalles del siguiente episodio
        const response = await fetch(
          `https://kitsu.io/api/edge/anime/${animeId}/episodes?page[limit]=1&page[offset]=${nextEpisodeNumber - 1}`
        );
        const data = await response.json();
        if (data.data.length > 0) {
          const nextEpisode = data.data[0];
          const nextEpisodeName =
            nextEpisode.attributes.titles.en || nextEpisode.attributes.canonicalTitle;
  
          // Establece la URL de la imagen del siguiente episodio
          const nextImageUrl = nextEpisode.attributes.thumbnail && nextEpisode.attributes.thumbnail.original;
  
          // Actualiza el campo 'watchedAt' del episodio actual en la base de datos si el usuario está logueado
          if (auth.currentUser) {
            await updateWatchedEpisode(auth.currentUser.uid, animeId, currentEpisodeNumber);
          }
  
          // Guarda el siguiente episodio visto en la base de datos antes de navegar al siguiente episodio si el usuario está logueado
          if (nextEpisodeNumber > 1 && auth.currentUser) {
            await saveWatchedEpisode(auth.currentUser.uid, animeId, nextEpisodeNumber, nextImageUrl, nextEpisodeName, animeName);
          }
  
          navigate(`/anime/${animeId}/episode/${nextEpisodeNumber}`);
          window.location.reload();
        } else {
          console.error("Episodio no encontrado");
        }
      }
    }
  };
 
  const handlePreviousEpisode = async () => {
    if (currentEpisodeNumber) {
      const previousEpisodeNumber = currentEpisodeNumber - 1;
  
      if (previousEpisodeNumber) {
        // Actualiza el campo 'watchedAt' del episodio actual en la base de datos si el usuario está logueado
        if (auth.currentUser) {
          await updateWatchedEpisode(auth.currentUser.uid, animeId, currentEpisodeNumber);
        }
  
        navigate(`/anime/${animeId}/episode/${previousEpisodeNumber}`);
        window.location.reload();
      }
    }
  };

  return (
    <div className="container-page-ep">
    <Helmet>
        <title>{animeName} - Episodio  {episodeNumber}   </title>
      </Helmet>
      
      <div className="title-container-page-ep">
     <h1>
    <Link to={`/anime/${animeId}/${animeName} `}  className="anime-name-link">
      {animeName}
      {currentEpisodeNumber ? ` - Episodio ${currentEpisodeNumber}` : ""}
    </Link>
      </h1>
    </div>
      {videoLink && (
        <div className="contain-bar-iframe">
         <OptionBar   className="option-bar"  options={  ["Opción 1", "Opción 2", "Opción 3", "Opción 4", "Opción 5", "Opción 6",] } onOptionChange={handleOptionChange} />
         <iframe
            src={videoLink}
            width="640"
            height="360"
            frameborder="0"
            allowFullScreen
            allow="autoplay"
            // Agrega esta línea para agregar dinámicamente el atributo sandbox
            
          ></iframe>
        </div>
      )}
      <div className="episode-and-title-and-fecha">
      <div className="contain-episode-title-like">
      <div className="episode-title-ep">
      <h2>{episodeName}       <p>Fecha de lanzamiento: {episodeReleaseDate}</p></h2>
      </div>

    
      <div className="likes-dislikes">
      <button className="like-button" onClick={handleLike}>
  <box-icon
    name="like"
    type={userVote === 1 ? "solid" : "regular"}
    color={userVote === 1 ? "#972525" : "currentColor"}
  />{" "}
  {likes}
</button>
<button className="dislike-button" onClick={handleDislike}>
  <box-icon
    name="dislike"
    type={userVote === -1 ? "solid" : "regular"}
    color={userVote === -1 ? "#972525" : "currentColor"}
  />{" "}
  {dislikes}
</button>
</div>
     
    
      </div>
      <p className="episode-description-p">{episodeDescription}</p>
      </div>
      <div className="button-next-previous">
      {currentEpisodeNumber > 1 && (
  <button className="button-previous-ep" onClick={handlePreviousEpisode}>
    Episodio anterior
  </button>
)}
      {currentEpisodeNumber < totalEpisodes && hasNextEpisodeVideo && (
  <button className="button-next-ep" onClick={handleNextEpisode}>
    Siguiente episodio
  </button>
)}
</div>
<div className="comments-section-ep-page">

      <CommentSection animeId={animeId} episodeId={episodeNumber} />
      </div>
    </div>





  );
      }
export default EpisodePage;