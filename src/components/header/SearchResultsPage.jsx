import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import "./SearchResultsPage.css";
import { useAnime } from "../../AnimeContext";


function SearchResultsPage() {
  const location = useLocation();
  const { searchResults, setSearchResults } = useAuth();
  const { animesToRemove } = useAnime();

  const formatAnimeName = (name) => {
    if (!name) {
      return "";
    }
    // Reemplaza los espacios con guiones y elimina caracteres especiales
    return name.replace(/ /g, "-").replace(/[^\w-]/gi, '');
  };

  const handleClick = (event) => {
    event.stopPropagation();
  };

  useEffect(() => {
    const search = new URLSearchParams(location.search);
    const query = search.get("query");

    if (query) {
      const fetchResults = async () => {
        try {
          const kitsuUrl = `https://kitsu.io/api/edge/anime?filter[text]=${query}&page[limit]=20`;
          const response = await fetch(kitsuUrl);

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          if (!data.data) {
            throw new Error("No se encontraron datos en la respuesta de la API");
          }

          const allowedShowTypes = ["TV", "OVA", "movie", "special"];

          const animesData = data.data
            .filter((anime) => allowedShowTypes.includes(anime.attributes.showType))
            .map((anime) => ({
              id: anime.id,
              title: anime.attributes.titles.en || anime.attributes.titles.en_jp,
              image: anime.attributes.posterImage?.small || anime.attributes.posterImage?.original,
            }));

            const filteredAnimesData = animesData.filter(
              (anime) => !animesToRemove.includes(anime.id)
            );
        
            setSearchResults(filteredAnimesData);

         
        } catch (error) {
          console.error("Error al realizar búsqueda:", error);
        }
      };

      fetchResults();
    }
  }, [location.search]);



  return (
    <div className="container-genero" onClick={handleClick}>
    <div className="h1-search">
      <h1>Resultados de búsqueda</h1>
      <box-icon name='search-alt' animation='tada' type='solid' color='#972525'  size='lg'></box-icon>
      </div>
      <div className="card-container">
        {searchResults.map((anime) => (
          <div key={anime.id} className="card-home card-home-fixed-height">
          <Link
            key={anime.id}
            to={`/anime/${anime.id}/${formatAnimeName(anime.title)}`}
            className="h3-genero-link"
          >
          
            
            <div>
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
          </div>
        ))}
      </div>
    </div>
  );
}

export default SearchResultsPage;