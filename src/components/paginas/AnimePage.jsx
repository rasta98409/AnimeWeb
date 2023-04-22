import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { db, storage } from "../../firebase";
import "./AnimePage.css";
import { collection, addDoc, onSnapshot, doc, setDoc, deleteDoc, query, where, getDocs } from "firebase/firestore";
import StarRatings from "react-star-ratings";
import { useAuth } from "../../AuthContext";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import Episode from "./Episode";
import AnimeCover from "./AnimeCover"; // Importa el componente
// import "boxicons";
import portada2 from './images/portada2.jpg'
import Tengoku from  "./images/Tengoku.jpg"
import { translateToSpanishGPT3 } from "../../translationUtils";
import { Helmet } from 'react-helmet';
import { fetchAnimeEpisodes, getTotalVideoLinks } from "./fetchAnimeEpisodes"; // Importa la función
import Pagination from "./Pagination";




const defaultAnimeImages = {
  "46641": Tengoku,
  // "12837": portada2,
  // ...
};









const AnimePage = (props) => {
  const { animeId } = useParams();
  const [anime, setAnime] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [comments, setComments] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const { currentUser } = useAuth();
  const [episodes, setEpisodes] = useState([]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [uploadedImageName, setUploadedImageName] = useState("");
  const [page, setPage] = useState(1);
  const episodesContainerRef = useRef(null);
  const [episodeOrder, setEpisodeOrder] = useState("asc");
  const [hasMoreEpisodes, setHasMoreEpisodes] = useState(true);
  const [showConfirmButton, setShowConfirmButton] = useState(false);
  const [loadedEpisodesCount, setLoadedEpisodesCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalVideoLinks, setTotalVideoLinks] = useState(0);
 

  const addRating = async (rating) => {
    await addDoc(collection(db, "animes", animeId, "ratings"), { rating });
  };

  
  const addComment = async (comment, imageFile) => {
    let imageURL = null;
  
    if (imageFile) {
      const storageRef = ref(storage, `images/${imageFile.name}`);
      const uploadTask = uploadBytesResumable(storageRef, imageFile);

      await new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            // Puedes mostrar el progreso de la subida aquí
          },
          (error) => {
            console.log("Error al subir la imagen:", error);
            reject(error);
          },
          async () => {
            imageURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve();
          }
        );
      });
    }
  
    await addDoc(collection(db, "animes", animeId, "comments"), {
      comment,
      userName: currentUser.displayName,
      userPhotoURL: currentUser.photoURL,
      imageURL, // Guarda la URL de la imagen en la base de datos
    });
  };



  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // Carga los episodios según la página seleccionada
    fetchEpisodes(anime, newPage);
  };

  const handleEpisodeClick = async (episode) => {
    if (currentUser) {
      const watchedEpisodesRef = doc(
        db,
        "users",
        currentUser.uid,
        "watchedEpisodes",
        episode.id
      );
      await setDoc(watchedEpisodesRef, {
        id: episode.id,
        number: episode.attributes.number,
        title: episode.attributes.titles.en || episode.attributes.canonicalTitle,
        animeId: animeId,
        animeTitle: anime.titles.en || anime.canonicalTitle,
        imageUrl: episode.attributes.thumbnail.small,
        watchedAt: new Date(), // Agrega esta línea
      });
    } else {
      console.log("No estás autenticado");
    }
  };

  const checkIsFavorite = async () => {
    if (currentUser) {
      const userFavoritesRef = collection(
        db,
        "users",
        currentUser.uid,
        "favorites"
      );
      const q = query(userFavoritesRef, where("id", "==", animeId));
  
      const snapshot = await getDocs(q);
      setIsFavorite(snapshot.docs.length > 0);
    }
  };

  const getUserRating = async () => {
    if (currentUser) {
      const ratingsRef = collection(db, "animes", animeId, "ratings");
      const q = query(ratingsRef, where("userId", "==", currentUser.uid));
  
      const snapshot = await getDocs(q);
      if (snapshot.docs.length > 0) {
        const userRating = snapshot.docs[0];
        setUserRating(userRating.data().rating);
        return userRating;
      }
    }
    return null;
  };

  useEffect(() => {
    fetchAnime();
    getUserRating();
    checkIsFavorite();
  }, [animeId]);

  const removeFromFavorites = async () => {
    if (currentUser) {
      const favoriteRef = doc(
        db,
        "users",
        currentUser.uid,
        "favorites",
        animeId
      );
      await deleteDoc(favoriteRef);
    }
  };

  const addToFavorites = async () => {
    if (currentUser) {
      const favoritesRef = doc(
        db,
        "users",
        currentUser.uid,
        "favorites",
        animeId
      );
      await setDoc(favoritesRef, {
        id: animeId,
        title: anime.titles.en || anime.canonicalTitle,
        imageUrl: anime.posterImage.small,
      });
    } else {
      console.log("No estás autenticado");
    }
  };

  const handleAddToFavorites = () => {
    if (isFavorite) {
      removeFromFavorites();
    } else {
      addToFavorites();
    }
    setIsFavorite(!isFavorite);
  };


  const removeBracketContent = (text) => {
    return text.replace(/\[.*?\]/g, "");
  };

  const removeParenthesisContent = (text) => {
    return text.replace(/\(.*?\)/g, "");
  };

  const handleRatingClick = async (newRating) => {
    setUserRating(newRating);
    setShowConfirmButton(true); // Muestra el botón de confirmaciónación
  
  };

  const handleConfirmButtonClick = async () => {
    await changeRating(userRating);
    setShowConfirmButton(false); // Oculta el botón de confirmación
  };


  useEffect(() => {
    if (anime) {
      setTotalVideoLinks(getTotalVideoLinks(animeId));
    }
  }, [anime, animeId]);

  const fetchAnime = async () => {
    try {
      const response = await fetch(
        `https://kitsu.io/api/edge/anime/${animeId}`
      );
      const data = await response.json();
      const translatedSynopsis = await translateToSpanishGPT3(data.data.attributes.synopsis);
      const cleanedSynopsis = removeBracketContent(translatedSynopsis);
      const cleanedSynopsisWithoutParenthesis = removeParenthesisContent(cleanedSynopsis);
      // Asegúrate de que haya una imagen de portada y una imagen de póster disponibles
      const coverImage = {
        small: data.data.attributes.coverImage?.small || portada2,
        large: data.data.attributes.coverImage?.large || portada2,
        original: data.data.attributes.coverImage?.original || portada2,
      };
      const defaultImage = defaultAnimeImages[animeId];
      const posterImage = {
        small: data.data.attributes.posterImage?.small || defaultImage,
        large: data.data.attributes.posterImage?.large || defaultImage,
        original: data.data.attributes.posterImage?.original || defaultImage,
      };
      setAnime({ ...data.data.attributes, coverImage, posterImage, synopsis: cleanedSynopsisWithoutParenthesis });
    } catch (error) {
      console.error("Error fetching anime:", error);
    }
  };

  const fetchEpisodes = async (anime, currentPage) => {
    try {
      const response = await fetch(
        `https://kitsu.io/api/edge/anime/${animeId}/episodes?page[limit]=12&page[offset]=${
          (currentPage - 1) * 12
        }`
      );
      const data = await response.json();
      const newEpisodes = await Promise.all(
        data.data.map(async (episode) => {
          // Verifica si la descripción del episodio es nula o vacía antes de llamar a la función de traducción
          const translatedDescription =
            episode.attributes.description &&
            (await translateToSpanishGPT3(episode.attributes.description));
  
          // Utiliza la imagen de la portada del anime si no hay una imagen del episodio
          const episodeImage =
            episode.attributes.thumbnail?.large ||
            episode.attributes.thumbnail?.original ||
            anime.posterImage?.small;
  
          return {
            ...episode,
            attributes: {
              ...episode.attributes,
              description: translatedDescription,
              thumbnail: {
                ...episode.attributes.thumbnail,
                small: episodeImage,
                large: episodeImage,
                original: episodeImage,
              },
            },
          };
        })
      );
  
      // Filtra los episodios con un número menor a 1
      const filteredEpisodes = newEpisodes.filter((episode) => episode.attributes.number >= 1);
      const sortedEpisodes = filteredEpisodes.sort((a, b) => {
        return episodeOrder === "asc"
          ? a.attributes.number - b.attributes.number
          : b.attributes.number - a.attributes.number;
      });
  
      // Obtiene los enlaces de los episodios desde el archivo JSON
      const animeEpisodes = await fetchAnimeEpisodes(animeId);
  
      // Filtra los episodios que tienen enlace de video
      const episodesWithLinks = sortedEpisodes.filter(
        (episode) =>
          animeEpisodes &&
          animeEpisodes[episode.attributes.number] &&
          animeEpisodes[episode.attributes.number]["Opción 1"]
      );
  
      setEpisodes(episodesWithLinks);
  
      // Utiliza "data.links.next" en lugar de "data.data.length" para verificar si hay más episodios
      setHasMoreEpisodes(!!data.links.next);
    } catch (error) {
      console.error("Error fetching episodes:", error);
    }
  };

  const fetchLatestEpisodes = async (anime, page) => {
    try {
      const response = await fetch(
        `https://kitsu.io/api/edge/anime/${animeId}/episodes?page[limit]=12&page[offset]=${
          (page - 1) * 12
        }&sort=-number`
      );
      const data = await response.json();
      const newEpisodes = data.data.map((episode) => {
        // Utiliza la imagen de la portada del anime si no hay una imagen del episodio
        const episodeImage =
          episode.attributes.thumbnail?.large ||
          episode.attributes.thumbnail?.original ||
          anime.posterImage?.small;
        return {
          ...episode,
          attributes: {
            ...episode.attributes,
            thumbnail: {
              ...episode.attributes.thumbnail,
              small: episodeImage,
              large: episodeImage,
              original: episodeImage,
            },
          },
        };
      });
      // Filtra los episodios con un número menor a 1
      const filteredEpisodes = newEpisodes.filter((episode) => episode.attributes.number >= 1);
      const sortedEpisodes = filteredEpisodes.sort((a, b) => b.attributes.number - a.attributes.number);
      setEpisodes(sortedEpisodes);
      setPage(Math.ceil(data.meta.count / 12));
    } catch (error) {
      console.error("Error fetching episodes:", error);
    }
  };

  
  const loadEpisodes = async (anime, page, order) => {
    if (order === "asc") {
      await fetchEpisodes(anime, page);
    } else {
      await fetchLatestEpisodes(anime, page);
    }
  };

  useEffect(() => {
    if (anime) {
      loadEpisodes(anime, page, episodeOrder);
    }
  }, [anime, page, episodeOrder]);


  
  

  const toggleEpisodeOrder = () => {
    setEpisodeOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
  };

  useEffect(() => {
    fetchAnime();
  }, [animeId]);



  const changeRating = async (newRating) => {
    const userRating = await getUserRating();
    if (userRating) {
      await setDoc(doc(db, "animes", animeId, "ratings", userRating.id), {
        rating: newRating,
        userId: currentUser.uid, // Agregue el userId al documento
      });
    } else {
      await addDoc(collection(db, "animes", animeId, "ratings"), {
        rating: newRating,
        userId: currentUser.uid, // Agregue el userId al documento
      });
    }
  };


  useEffect(() => {
    // Obtén la referencia a la colección de ratings y comentarios
    const ratingsRef = collection(db, "animes", animeId, "ratings");
    const commentsRef = collection(db, "animes", animeId, "comments");

    // Suscríbete a los cambios en los ratings y actualiza el estado local
    const unsubscribeRatings = onSnapshot(ratingsRef, (snapshot) => {
      const newRatings = snapshot.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        };
      });

      setRatings(newRatings);
    });
    const unsubscribeComments = onSnapshot(commentsRef, (snapshot) => {
      const newComments = snapshot.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        };
      });

      setComments(newComments);
    });

    // Limpia las suscripciones cuando el componente se desmonte
    return () => {
      unsubscribeRatings();
      unsubscribeComments();
    };
  }, [animeId]);

  const addRatingAndComment = async (rating, comment, imageFile) => {
    await addDoc(collection(db, "animes", animeId, "ratings"), { rating });

    let imageURL = null;

    if (imageFile) {
      const storageRef = ref(storage, `images/${imageFile.name}`);
      const uploadTask = uploadBytesResumable(storageRef, imageFile);

      await new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            // Puedes mostrar el progreso de la subida aquí
          },
          (error) => {
            console.log("Error al subir la imagen:", error);
            reject(error);
          },
          async () => {
            imageURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve();
          }
        );
      });
    }
    await addDoc(collection(db, "animes", animeId, "comments"), {
      comment,
      userName: currentUser.displayName,
      userPhotoURL: currentUser.photoURL,
      imageURL, // Guarda la URL de la imagen en la base de datos
    });
  };

  if (!anime) {
    return <div>Cargando...</div>;
  }

  const totalRatings = ratings.length;
  const averageRating =
    totalRatings > 0
      ? ratings.reduce((acc, cur) => acc + cur.rating, 0) / totalRatings
      : 0;
  const ratingPercentage = (averageRating / 5) * 100;

  const handleImageChange = (event) => {
    if (event.target.files[0]) {
      setUploadedImageName(event.target.files[0].name);
    } else {
      setUploadedImageName("");
    }
  };

 
  return (
    <div>
    <Helmet>
        <title>{anime.titles.en}</title>
      </Helmet>
    <AnimeCover coverImage={anime.coverImage.large} />
    <div className="anime-page">
    <div className="container-main-page">
    <div className="sidebar">
    <div className="img-vote-sidebar">
          <img
            src={anime.posterImage.small}
            alt={anime.titles.en || anime.canonicalTitle}
          />
          <div className="rating-section-total">
          <StarRatings
            rating={averageRating}
            changeRating={handleRatingClick}
            starRatedColor="#972525"
            numberOfStars={5}
            name="rating"
            starDimension="25px"
            starSpacing="5px"
          />
        </div>
            <span>
              {totalRatings} {totalRatings === 1 ? "voto" : "votos"} 
            </span>

            <div className="main-button-vote">
            {currentUser && (
              <button
                className="button-vote"
                onClick={handleConfirmButtonClick}
                style={{ display: showConfirmButton ? "block" : "none" }}
              >
                Confirmar votación
              </button>
            )}
          </div>
          </div>
         
        <div className="anime-info-details">
          <p><strong>Estado:</strong> {anime.status}</p>
          <p><strong>Clasificación:</strong> {anime.ageRating}  {anime.ageRatingGuide}</p>
          <p><strong>Episodios:</strong> {totalVideoLinks}</p>

          <p><strong>Duración EP:</strong> {anime.episodeLength} minutos</p>
          <p><strong>Emitido:</strong> {anime.startDate} Al  {anime.endDate}</p>
        </div>
        <div className="favorites-button">
        <div className="favorites-button">
          {currentUser ? (
            <button onClick={handleAddToFavorites}>
              {isFavorite ? "Eliminar de favoritos" : "Agregar a favoritos"}
            </button>
          ) : (
            <button>
             Agregar a favoritos
          </button>
          )}
        </div>
        </div>
      </div>
      <div className="main-content">
        <div className="anime-info">
        <div className="titulo-y-rating">
          <div className="title-and-rating">
            <h1>{anime.titles.en || anime.canonicalTitle}</h1>
            <div className="rating-section-total-movil">
            <StarRatings
              rating={averageRating}
              changeRating={handleRatingClick}
              starRatedColor="#972525"
              numberOfStars={5}
              name="rating"
              starDimension="25px"
              starSpacing="5px"
            />
            <button
            className="button-vote"
            onClick={handleConfirmButtonClick}
            style={{ display: showConfirmButton ? "block" : "none" }}
          >
            Confirmar votación
          </button>
        
          </div>
            </div>
            <div>
          </div>

          </div>
          <div className="synopsis">
            <h3>Sinopsis</h3>
            <p>{anime.synopsis}</p>
          </div>
        </div>
        <div className="favorites-button-movil">
          {currentUser ? (
            <button onClick={handleAddToFavorites}>
              {isFavorite ? "Eliminar de favoritos" : "Agregar a favoritos"}
            </button>
          ) : (
            <button>
             Agregar a favoritos
          </button>
          )}
        </div>
        <div className="video-section" ref={episodesContainerRef}>
        <div className="episode-list-header">
        <h2>Lista De Episodios</h2>
      </div>
      {episodes.map((episode) => (
  <Episode
    key={episode.id}
    episode={episode}
    animeId={animeId}
    onEpisodeClick={handleEpisodeClick} // Agrega esta línea
  />
))}
<Pagination
  currentPage={currentPage}
  totalVideoLinks={totalVideoLinks}
  onPageChange={handlePageChange}
/>
      </div>
        <div className="comments">
          <h2>Comentarios</h2>
          {currentUser ? (
            <div className="comments-section">

              <div className="input-container">
                <textarea id="comment" />
                <div className="button-and-upload">
                <div className="icon">
                <box-icon
                  name="image-add"
                  onClick={() => {
                    document.getElementById("image").click();
                  }}
                />
                <span>{uploadedImageName}</span>
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  className="image-upload"
                  onChange={handleImageChange}
                  hidden
                />
                </div>

                <button
  onClick={async () => {
    const commentInput = document.getElementById("comment");
    const imageInput = document.getElementById("image");

    if (commentInput.value.length > 0) {
      await addComment(commentInput.value, imageInput.files[0]);
      commentInput.value = "";
      imageInput.value = "";
      setUploadedImageName("");
    } else {
      // ...
    }
  }}
>
  Comentar
</button>
                            </div>
              </div>
            </div>
          ) : (
            <div>
              Por favor, inicia sesión para dejar un comentario.
            </div>
          )}
          {comments.map((comment) => (
            <div className="AniComments" key={comment.id}>
              <img
                className="user-photo"
                src={comment.userPhotoURL}
                alt="User"
              />
              <div className="comment-text">
                <span className="user-name">{comment.userName}</span>
                <span className="comment">{comment.comment}</span>
                {comment.imageURL && (
                  <img
                    className="comment-image"
                    src={comment.imageURL}
                    alt="Comment"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </div>
    </div>
  );
};

export default AnimePage; 