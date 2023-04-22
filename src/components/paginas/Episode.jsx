import React, { useState, useEffect } from "react";
import "./Episode.css";
import { Link } from "react-router-dom";

const Episode = ({ episode , animeId, onEpisodeClick }) => {

  useEffect(() => {
  }, []);

  const truncateDescription = (description) => {
    if (!description) return "";
    const maxLength = 300; // Puedes ajustar este valor para controlar la longitud de la descripción recortada
    return description.length > maxLength
      ? description.slice(0, maxLength) + "..."
      : description;
  };

  return (
    <div className="episode-container" onClick={() => onEpisodeClick(episode)}>
      <Link
  to={`/anime/${animeId}/episode/${episode.attributes.number}`} // Cambia esto
  style={{ textDecoration: "none", color: "inherit" }}
>
      <div className="episode">
        <div className="episode-image-container">
        <img
          src={
            episode.attributes.thumbnail
              ? episode.attributes.thumbnail.original
              : ""
          }
          alt={`Episode ${episode.attributes.number}`}
        />
        </div>
        <div className="episode-info">
          <h3 className="episode-title">
            {episode.attributes.titles.en || episode.attributes.canonicalTitle}
          </h3>
          <p style={{ marginTop: 0 }}>Episodio {episode.attributes.number}</p> {/* Agrega style para eliminar el espacio */}
          <p className="description-episode">
            {truncateDescription(episode.attributes.description)}
          </p>
        </div>
      </div>
      </Link>
    </div>
  );
};

export default Episode;