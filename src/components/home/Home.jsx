import React, { useState, useEffect } from "react";
import "./Home.css";
import { db } from "../../firebase";
import { useAuth } from "../../AuthContext";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { limit } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { useAnime } from "../../AnimeContext";
import Tengoku from './images/Tengoku.jpg'
import { formatAnimeName } from "../../formatAnimeName";
import { translateToSpanishGPT3 } from "../../translationUtils";
import { Helmet } from 'react-helmet';


export const customImages = {
  "46641": Tengoku,
};


export const getCustomImage = (id) => {
    return customImages[id] || null;
  };

function Home() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [popularAnimes, setPopularAnimes] = useState([]);
  const [recentAnimes, setRecentAnimes] = useState([]);
  const [currentAnimes, setCurrentAnimes] = useState([]);
  const [sliderImages, setSliderImages] = useState([]);
  const [activeAnime, setActiveAnime] = useState(null);
  const [customAnimes, setCustomAnimes] = useState([]);
  const { currentUser } = useAuth();
  const [watchedEpisodes, setWatchedEpisodes] = useState([]);
  const navigate = useNavigate();
  const { animesToRemove } = useAnime();
  const customAnimeIds = ["44289", "44012"]
  

  
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
  
  // ...
  
  useEffect(() => {
    if (currentUser) {
      const watchedEpisodesRef = collection(
        db,
        "users",
        currentUser.uid,
        "watchedEpisodes"
      );
      const q = query(watchedEpisodesRef, orderBy("watchedAt", "desc"), limit(6));
  
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







  

  const setActiveAndImages = (animesData) => {
    setCustomAnimes(animesData);
  
    const coverImages = animesData.map((anime) => anime.coverImage).filter((image) => image);
    setSliderImages(coverImages);
    setActiveAnime(animesData[0]);
  };


  const fetchAnimesByIds = async (ids) => {
    try {
      const animesData = [];
  
      for (const id of ids) {
        const kitsuUrl = `https://kitsu.io/api/edge/anime/${id}`;
        const response = await fetch(kitsuUrl);
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const data = await response.json();
  
        if (!data.data) {
          throw new Error("No se encontraron datos en la respuesta de la API");
        }
  
        const anime = data.data;
        const translatedDescription = await translateToSpanishGPT3(
          anime.attributes.description
        );
        const truncatedDescription = truncateDescription(translatedDescription, 200);
        animesData.push({
          id: anime.id,
          title: anime.attributes.titles.en || anime.attributes.titles.en_jp,
          description: truncatedDescription,
          episodeCount: anime.attributes.episodeCount,
          image: anime.attributes.posterImage?.large,
          coverImage: anime.attributes.coverImage?.large,
        });
      }
  
      setCustomAnimes(animesData);
  
      const coverImages = animesData
        .map((anime) => anime.coverImage)
        .filter((image) => image);
      setSliderImages(coverImages);
      setActiveAndImages(animesData);
    } catch (error) {
      console.error("Error al obtener animes personalizados:", error);
    }
  };

  useEffect(() => {
    // Agrega los IDs de los animes que deseas mostrar en el slider
    const customAnimeIds = ["45398", "12", "11469", "10740", "44973"]; // Reemplaza estos números con los IDs de tus animes favoritos
    fetchAnimesByIds(customAnimeIds);
  }, []);


  const fetchCustomAnimes = async () => {
    try {
      const customAnimeIdsString = customAnimeIds.join();
      const customAnimesUrl = `https://kitsu.io/api/edge/anime?filter[id]=${customAnimeIdsString}`;
      const customAnimesResponse = await fetch(customAnimesUrl);
  
      if (!customAnimesResponse.ok) {
        throw new Error(`HTTP error! status: ${customAnimesResponse.status}`);
      }
  
      const customAnimesData = await customAnimesResponse.json();
  
      return customAnimesData.data;
    } catch (error) {
      console.error("Error al obtener animes personalizados:", error);
      return [];
    }
  };

  const fetchPopularAnimes = async () => {
    try {
      const kitsuUrl = "https://kitsu.io/api/edge/anime?sort=-userCount&page[limit]=6";
      const response = await fetch(kitsuUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.data) {
        throw new Error("No se encontraron datos en la respuesta de la API");
      }

      const animesData = data.data.map((anime) => ({
        id: anime.id,
        title: anime.attributes.titles.en || anime.attributes.titles.en_jp,
        description: anime.attributes.description,
        episodeCount: anime.attributes.episodeCount,
        image: getCustomImage(anime.id) || anime.attributes.posterImage?.large,
        coverImage: anime.attributes.coverImage?.large,
      }));

      
    // Filtrar animes que no estén en animesToRemove
    const filteredAnimesData = animesData.filter(
      (anime) => !animesToRemove.includes(anime.id)
    );

      setPopularAnimes(filteredAnimesData);


    } catch (error) {
      console.error("Error al obtener animes populares:", error);
    }
  };

  const fetchRecentAnimes = async () => {
    try {
      const kitsuUrl = `https://kitsu.io/api/edge/anime?sort=-averageRating,-createdAt&page[limit]=6&filter[subtype]=TV&filter[season_year]=2023&filter[season]=winter,spring,fall,summer&filter[status]=current `;
      const response = await fetch(kitsuUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.data) {
        throw new Error("No se encontraron datos en la respuesta de la API");
      }

      const animesData = data.data.map((anime) => ({
        id: anime.id,
        title: anime.attributes.titles.en || anime.attributes.titles.en_jp,
        image: getCustomImage(anime.id) || anime.attributes.posterImage?.large,
      }));

      const filteredAnimesData = animesData.filter(
        (anime) => !animesToRemove.includes(anime.id)
      );


      setRecentAnimes(filteredAnimesData);
    } catch (error) {
      console.error("Error al obtener animes recientes:", error);
    }
  };

  const fetchCurrentAnimes = async () => {
    try {
      const kitsuUrl = "https://kitsu.io/api/edge/anime?sort=-userCount&filter[status]=current&page[limit]=6";
      const response = await fetch(kitsuUrl);
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
  
      if (!data.data) {
        throw new Error("No se encontraron datos en la respuesta de la API");
      }
  
      const customAnimes = await fetchCustomAnimes();
  
      const animesData = [
        ...customAnimes,
        ...data.data.filter(
          (anime) => !customAnimes.some((customAnime) => customAnime.id === anime.id)
        ),
      ].map((anime) => ({
        id: anime.id,
        title: anime.attributes.titles.en || anime.attributes.titles.en_jp,
        image: getCustomImage(anime.id) || anime.attributes.posterImage?.large,
      }));
  
      const filteredAnimesData = animesData.filter(
        (anime) => !animesToRemove.includes(anime.id)
      );
  
      setCurrentAnimes(filteredAnimesData);
    } catch (error) {
      console.error("Error al obtener animes en emisión:", error);
    }
  };

  useEffect(() => {
    fetchPopularAnimes();
    fetchRecentAnimes();
    fetchCurrentAnimes();
  }, []);

  const goToSlide = (index) => {
    setActiveIndex(index);
    setActiveAnime(customAnimes[index]);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      goToSlide((activeIndex + 1) % sliderImages.length);
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [activeIndex, sliderImages]);

  const truncateDescription = (description, maxLength) => {
    if (description.length <= maxLength) {
      return description;
    }
    const truncatedDescription = description.slice(0, maxLength) + "...";
    return truncatedDescription;
  };

  const handleViewAllClick = (category) => {
    if (category === "continue-watching") {
      // Aquí puedes redirigir a la página de "Seguir viendo"
      navigate(`/continue-watching`);
    } else {
      navigate(`/view-all/${category}`);
    }
  };

  
  return (
    <div className="home">
    <Helmet>
        <title>Taberna Anime - Disfruta de los animes mas populares en HD</title>
      </Helmet>
      <div className="slider-container">
        {sliderImages.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Imagen ${index + 1}`}
            className={`slider-image ${index === activeIndex ? "active" : ""}`}
          />
        ))}
        <div className="slider-gradient-left" />
        <div className="slider-gradient-right" />
        <div className="slider-gradient" />
        <div className="slider-dots">
          {sliderImages.map((_, index) => (
            <div
              key={index}
              className={`slider-dot ${index === activeIndex ? "active" : ""}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
        <div className="slider-info">
          {activeAnime && (
            <>
              <h3 className="slider-title">{activeAnime.title}</h3>
              <p className="slider-description">
              {truncateDescription(activeAnime.description, 200)}
              </p>
              <p className="slider-episode-count">
                Episodios: {activeAnime.episodeCount}
              </p>
              <button
              className="slider-watch-now"
              onClick={() => navigate(`/anime/${activeAnime.id}/${activeAnime.title}`)}
            >
              Ver ahora
            </button>
            </>
          )}
        </div>
      </div>
      {watchedEpisodes.length > 0 && (
      <div className="seguir-viendo">
      <div className="name-button-contain">
        <div className="name-button">
        <h2 className=" h2-seguir-viendo">Seguir viendo</h2>
        <button onClick={() => handleViewAllClick("continue-watching")}>Ver todo</button>
        </div>
        </div>
        <div className="continue-watching-section">
          <div className="card-container">
          {watchedEpisodes.map((episode, index) => (
  <div
    key={episode.id}
    onClick={() =>
      handleWatchedEpisodeClick(episode.animeId, episode.number)
    }
    className={`${index === watchedEpisodes.length - 1 ? "hide-episode" : ""}`}
  >

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
))}
          </div>
        </div>
      </div>
    )}

     
      
      <div className="popular">
      <div className="name-button-contain">
      <div className="name-button">
        <h2>Popular</h2>
        <button onClick={() => handleViewAllClick("popular")}>Ver todo</button>
        </div>
        </div>
        <div className="card-container">
        {popularAnimes.map((anime, index) => (
  <Link key={anime.id} to={`/anime/${anime.id}/${formatAnimeName(anime.title)}`}>
    <div
      className={`card-home card-home-fixed-height ${
        index === popularAnimes.length - 1 ? "hide-anime" : ""
      }`}
    >
      <img src={anime.image} alt={anime.title} />
      <h3
        className={`h3-genero-fav ${
        anime.title && anime.title.length > 26 ? "h3-genero-fav-largo" : "h3-genero-fav-corto"
        }`}
        data-title={anime.title}
      ></h3>
    </div>
  </Link>
))}
        </div>
      </div>
      <div className="current">
      <div className="name-button-contain">
      <div className="name-button">
        <h2>Animes en Emisión</h2>
        <button onClick={() => handleViewAllClick("current")}>Ver todo</button>
        </div>
        </div>
        <div className="card-container">
          {currentAnimes.map((anime, index) => (
            <Link key={anime.id} to={`/anime/${anime.id}/${formatAnimeName(anime.title)}`}>
            <div
      className={`card-home card-home-fixed-height ${
        index === popularAnimes.length - 1 ? "hide-anime" : ""
      }`}
    >
              <img src={anime.image} alt={anime.title} />
              <h3
             
              className={`h3-genero-fav ${
              anime.title && anime.title.length > 26 ? "h3-genero-fav-largo" : "h3-genero-fav-corto"
             }`}
              data-title={anime.title}
            >
            </h3>
            </div>
          </Link>
          ))}
        </div>
      </div>
      <div className="ultimos">
      <div className="name-button-contain">
      <div className="name-button">
        <h2>Últimos Animes Agregados</h2>
        <button onClick={() => handleViewAllClick("recent")}>Ver todo</button>
        </div>
        </div>
        <div className="card-container">
          {recentAnimes.map((anime, index) => (
            <Link key={anime.id} to={`/anime/${anime.id}/${formatAnimeName(anime.title)}`}>
            <div
      className={`card-home card-home-fixed-height ${
        index === popularAnimes.length - 1 ? "hide-anime" : ""
      }`}
    >
              <img src={anime.image} alt={anime.title} />
              <h3
              className={`h3-genero-fav ${
              anime.title && anime.title.length > 26 ? "h3-genero-fav-largo" : "h3-genero-fav-corto"
              }`}
              data-title={anime.title}
            >
            </h3>
            </div>
          </Link> 
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;