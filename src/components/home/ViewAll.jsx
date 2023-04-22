import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { formatAnimeName } from "../../formatAnimeName";
import "./ViewAll.css";
import { useAnime } from "../../AnimeContext";
import { getCustomImage } from "./Home";


const ViewAll = () => {
  const [animes, setAnimes] = useState([]);
  const [pageOffset, setPageOffset] = useState(0);
  const { category } = useParams();
  const { animesToRemove } = useAnime();

  const observer = useRef();
  const lastAnimeElementRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setPageOffset((prevPageOffset) => prevPageOffset + 20);
        }
      });
      if (node) observer.current.observe(node);
    },
    [animes]
  );

  useEffect(() => {
    const fetchAnimes = async () => {
      let kitsuUrl;

      switch (category) {
        case "popular":
          kitsuUrl = "https://kitsu.io/api/edge/anime?sort=-userCount&page[limit]=20";
          break;
        case "current":
          kitsuUrl = "https://kitsu.io/api/edge/anime?sort=-userCount&filter[status]=current&page[limit]=20&filter[subtype]=TV";
          break;
        case "recent":
          kitsuUrl = `https://kitsu.io/api/edge/anime?sort=-averageRating,-createdAt&page[limit]=20&filter[subtype]=TV&filter[season_year]=2023&filter[season]=winter,spring,fall,summer&filter[status]=current `;
          break;
        default:
          return;
      }

      try {
        const response = await fetch(`${kitsuUrl}&page[offset]=${pageOffset}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.data) {
          throw new Error("No se encontraron datos en la respuesta de la API");
        }

        const fetchedAnimes = data.data
          .map((anime) => ({
            id: anime.id,
            title: anime.attributes.titles.en || anime.attributes.titles.en_jp,
            image: getCustomImage(anime.id) || anime.attributes.posterImage?.large,
          }))
          .filter((anime) => !animesToRemove.includes(anime.id));

        setAnimes((prevAnimes) => [...prevAnimes, ...fetchedAnimes]);
      } catch (error) {
        console.error(`Error al obtener animes de la categoría ${category}:`, error);
      }
    };

    fetchAnimes();
  }, [category, pageOffset]);

  return (
    <div className="view-all ">
      <h1>{`Animes ${category === "popular" ? "Populares" : category === "current" ? "en Emisión" : "Recientes"}`}</h1>
      <div className="card-container-view">
        {animes
          .filter((anime) => !animesToRemove.includes(anime.id))
          .map((anime, index) => (
            <Link
              key={anime.id}
              to={`/anime/${anime.id}/${formatAnimeName(anime.title)}`}
              ref={index === animes.length - 1 ? lastAnimeElementRef : null}
            >
             <div className="contain-img-name">
              <div className="card-home card-home-fixed-height">
                <img src={anime.image} alt={anime.title} />
                <h3
                  className={`h3-genero-fav ${
                    anime.title && anime.title.length > 26 ? "h3-genero-fav-largo" : "h3-genero-fav-corto"
                  }`}
                  data-title={anime.title}
                ></h3>
              </div>
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
};

export default ViewAll;