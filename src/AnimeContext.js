import { createContext, useContext, useState } from "react";

const AnimeContext = createContext();

export const useAnime = () => {
  return useContext(AnimeContext);
};

export const AnimeProvider = ({ children }) => {
  const [animesToRemove, setAnimesToRemove] = useState(["856", "8884", "5443", "11359", "2182", "7993", "6452", "12837", "1078", "4445", "12050", "1766","3618", "10682", "12288", "5297", "43801", "42617", "12503", "5007", "6212", "12168", "10478", "8563", "42600", "10639", "12595", "13743", "13003", "9039", "10659", "9832", "43036", "40821", "40820", "40822", "40957", "14170", "40850", "43081", "43333", "46100", "46651", "46639", "44215", "45274", "45405", "43256", "41143", "44062", "44218", "44216", "46046", "46779", "44221", "45575", "44322", "46331", "46508", "46316", "46974", "46783","46144", "46509"]); // Reemplaza estos números con los IDs de los animes que deseas eliminar

  const removeAnimeById = (id) => {
    setAnimesToRemove((prevState) => [...prevState, id]);
  };

  const value = {
    animesToRemove,
    setAnimesToRemove,
    removeAnimeById,
  };

  return <AnimeContext.Provider value={value}>{children}</AnimeContext.Provider>;
};