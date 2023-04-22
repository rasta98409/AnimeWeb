import animeEpisodesSources from './AnimeData';

const getAnimeJsonUrl = (animeId) => {
  const json = animeEpisodesSources[animeId];
  if (json) {
    return json;
  } else {
    console.error("Archivo JSON del anime no encontrado");
    return null;
  }
};

export const fetchAnimeEpisodes = async (animeId) => {
  const jsonData = getAnimeJsonUrl(animeId);
  if (jsonData) {
    return jsonData;
  } else {
    console.error("Error al cargar el archivo JSON del anime");
    return null;
  }
};

// Función para obtener el total de enlaces de video
export const getTotalVideoLinks = (animeId) => {
  const animeEpisodes = animeEpisodesSources[animeId];
  if (animeEpisodes) {
    return Object.keys(animeEpisodes).length;
  } else {
    console.error("Error al obtener el total de enlaces de video");
    return 0;
  }
};