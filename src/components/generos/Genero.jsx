// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import "./Genero.css";
// import { Link } from "react-router-dom";
// import PaginationNumbers from "./PaginationNumbers";
// import { LazyLoadImage } from "react-lazy-load-image-component";


// const Genero = () => {
//   const { genero } = useParams();
//   const [recentAnimes, setRecentAnimes] = useState([]);
//   const [popularAnimes, setPopularAnimes] = useState([]);
//   const [allAnimes, setAllAnimes] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);



//   const handlePageChange = (pageNumber) => {
//     setCurrentPage(pageNumber);
//   };

//   const fetchAnimesByGenre = async (kitsuUrl) => {
//     const response = await fetch(kitsuUrl);
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }
//     const data = await response.json();
//     if (!data.data) {
//       throw new Error('No se encontraron datos en la respuesta de la API');
//     }
//     const animesData = data.data.map((anime) => {
//       return {
//         id: anime.id,
//         title: anime.attributes.titles.en || anime.attributes.titles.en_jp,
//         image:
//           anime.attributes.posterImage?.large ||
//           anime.attributes.posterImage?.original,
//         name: anime.attributes.titles.en_jp,
//         foto:
//           anime.attributes.coverImage?.large ||
//           anime.attributes.coverImage?.original,
//       };
//     });

//     return animesData;
//   };

  

//   const fetchPopularAnimesByGenre = async () => {
//     try {
//       const genre = genero.toLowerCase();
//       const kitsuUrl = `https://kitsu.io/api/edge/anime?filter[genres]=${genre}&page[limit]=20&sort=-userCount&filter[subtype]=TV`;
//       const animesData = await fetchAnimesByGenre(kitsuUrl);
//       setPopularAnimes(animesData.slice(0, 5));
//     } catch (error) {
//       console.error("Error al obtener animes más populares:", error);
//     }
//   };

//   const fetchAnimesByGenrePerPage = async () => {
//     try {
//       const genre = genero.toLowerCase();
//       const limit = currentPage === 1 ? 10 : 20;
//       const kitsuUrl = `https://kitsu.io/api/edge/anime?filter[genres]=${genre}&page[limit]=${limit}&page[offset]=${(currentPage - 1) * limit}&sort=-favoritesCount&filter[subtype]=TV,OVA`;
//       const animesData = await fetchAnimesByGenre(kitsuUrl);
//       setAllAnimes(animesData.slice(0, limit));
//       setAllAnimes(animesData);
//       const response = await fetch(kitsuUrl);
//       const data = await response.json();
//       setTotalPages(Math.ceil(data.meta.count / limit));
//     } catch (error) {
//       console.error("Error al obtener animes del género:", error);
//     }
//   };

//   useEffect(() => {
//     const fetchAllData = async () => {
//       await fetchPopularAnimesByGenre();
//       await fetchAnimesByGenrePerPage();
//     };

//     fetchAllData();

//     const intervalId = setInterval(() => {
//       fetchAllData();
//     }, 2 * 60 * 60 * 1000); // Actualiza cada 2 horas

//     // Limpiar intervalo al desmontar el componente
//     return () => clearInterval(intervalId);
//   }, [genero, currentPage]);

//   const handlePreviousPage = () => {
//     if (currentPage > 1) {
//       setCurrentPage(currentPage - 1);
//     }
//   };

//   const handleNextPage = () => {
//     if (currentPage < totalPages) {
//       setCurrentPage(currentPage + 1);
//     }
//   };

  

//   return (
//     <div className="container">
//       <h1 className="genero-h1">{genero}</h1>

//       {currentPage === 1 && (
//         <>
//           <div className="popular-anime-section">
//             <h2 className="h2-genero">Más populares</h2>
//             <div className="anime-grid">
//               {popularAnimes.map((anime) => (
//                 <div key={anime.id} className="anime-item">
//                   <Link to={`/anime/${anime.id}`} className="h3-genero-link">
//                   <LazyLoadImage
//                     src={anime.image}
//                     alt={anime.title}
//                   />
//                     <h3 className="h3-genero">{anime.title}</h3>
//                   </Link>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </>
//       )}

//       <div className="all-anime-section">
//         <h2 className=" h2-genero">Todos los animes {genero}</h2>
//         <div className="anime-grid">
//           {allAnimes.map((anime) => (
//             <div key={anime.id} className="anime-item">
//               <Link to={`/anime/${anime.id}`} className="h3-genero-link">
//               <LazyLoadImage
//                 src={anime.image}
//                 alt={anime.title}
//               />
//                 <h3 className="h3-genero">{anime.title}</h3>
//               </Link>
//             </div>
//           ))}
//         </div>
//       </div>
//       <div className="pagination">
//         <PaginationNumbers
//           currentPage={currentPage}
//           totalPages={totalPages}
//           onPageChange={handlePageChange}
//           handlePreviousPage={handlePreviousPage}
//           handleNextPage={handleNextPage}
//         />
//       </div>
//     </div>
//   );
// };

// export default Genero;


import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./Genero.css";
import { Link } from "react-router-dom";
import PaginationNumbers from "./PaginationNumbers";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "boxicons";
import { useAnime } from "../../AnimeContext";
import { formatAnimeName } from "../../formatAnimeName";
import { Helmet } from 'react-helmet';



const getGenreIcon = (genre) => {
  switch (genre.toLowerCase()) {
    case "action":
      return <box-icon name='hot' type='solid' animation='tada' color='#972525' size='lg' ></box-icon>
    case "adventure":
      return <box-icon name='leaf' animation='tada'  type='solid' color='#972525'  size='lg'></box-icon>
    // Agrega casos adicionales para otros géneros e íconos aquí
    case "comedy":
      return <box-icon name='laugh' animation='tada' type='solid' color='#972525'  size='lg'></box-icon>
      case "horror":
        return <box-icon name='ghost' type='solid' animation='tada' color='#972525'  size='lg'></box-icon>
        case "romance":
          return <box-icon name='heart' type='solid' animation='tada' color='#972525'  size='lg'></box-icon>
          case "sports":
            return <box-icon name='football'  animation='tada' color='#972525'  size='lg'></box-icon>
            case "mecha":
              return <box-icon name='bot' type='solid' animation='tada' color='#972525'  size='lg'></box-icon>
              case "drama":
                return <box-icon name='shocked' type='solid' animation='tada' color='#972525'  size='lg'></box-icon>
                case "fantasy":
                return <box-icon name='meteor' type='solid' animation='tada' color='#972525'  size='lg'></box-icon>
                case "psychological":
                return <box-icon name='dizzy' type='solid' animation='tada' color='#972525'  size='lg'></box-icon>
                case "sci-fi":
                return <box-icon name='yin-yang' type='solid' animation='tada' color='#972525'  size='lg'></box-icon>
                case "slice of life":
                return <box-icon name='book-reader' type='solid' animation='tada' color='#972525'  size='lg'></box-icon>
                case "supernatural":
                return <box-icon name='invader' type='solid' animation='tada' color='#972525'  size='lg'></box-icon>
                case "thriller":
                return <box-icon name='skull' type='solid' animation='tada' color='#972525'  size='lg'></box-icon>
                case "ecchi":
                return <box-icon name='hot' type='solid' animation='tada' color='#972525'  size='lg'></box-icon>
    default:
      return null;
  }
}


const Genero = () => {
  const { genero } = useParams();
  const [popularAnimes, setPopularAnimes] = useState([]);
  const [allAnimes, setAllAnimes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { animesToRemove } = useAnime();

  


  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const fetchAnimesByGenre = async (kitsuUrl) => {
    const response = await fetch(kitsuUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (!data.data) {
      throw new Error('No se encontraron datos en la respuesta de la API');
    }
    const animesData = data.data.map((anime) => {
      return {
        id: anime.id,
        title: anime.attributes.titles.en || anime.attributes.titles.en_jp,
        image:
          anime.attributes.posterImage?.large ||
          anime.attributes.posterImage?.original,
        name: anime.attributes.titles.en_jp,
        foto:
          anime.attributes.coverImage?.large ||
          anime.attributes.coverImage?.original,
      };
    });

    return animesData;
  };

  

  const fetchPopularAnimesByGenre = async () => {
    try {
      const genre = genero.toLowerCase();
      const kitsuUrl = `https://kitsu.io/api/edge/anime?filter[genres]=${genre}&page[limit]=20&sort=-userCount&filter[subtype]=TV`;
      const animesData = await fetchAnimesByGenre(kitsuUrl);
      const filteredAnimesData = animesData.filter(
        (anime) => !animesToRemove.includes(anime.id)
      );
  
      setPopularAnimes(filteredAnimesData.slice(0, 5));
    
    } catch (error) {
      console.error("Error al obtener animes más populares:", error);
    }
  };

  const fetchAnimesByGenrePerPage = async () => {
    try {
      const genre = genero.toLowerCase();
      const limit = currentPage === 1 ? 11 : 20;
      const kitsuUrl = `https://kitsu.io/api/edge/anime?filter[genres]=${genre}&page[limit]=${limit}&page[offset]=${(currentPage - 1) * limit}&sort=-favoritesCount&filter[subtype]=TV,OVA`;
      const animesData = await fetchAnimesByGenre(kitsuUrl);
      const filteredAnimesData = animesData.filter(
        (anime) => !animesToRemove.includes(anime.id)
      );
  
      setAllAnimes(
        currentPage === 1
          ? filteredAnimesData.slice(0, 10)
          : filteredAnimesData
      );

      const response = await fetch(kitsuUrl);
      const data = await response.json();

      
      setTotalPages(Math.ceil(data.meta.count / limit));
    } catch (error) {
      console.error("Error al obtener animes del género:", error);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      await fetchPopularAnimesByGenre();
      await fetchAnimesByGenrePerPage();
    };

    fetchAllData();

    const intervalId = setInterval(() => {
      fetchAllData();
    }, 2 * 60 * 60 * 1000); // Actualiza cada 2 horas

    // Limpiar intervalo al desmontar el componente
    return () => clearInterval(intervalId);
  }, [genero, currentPage]);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  

  return (
    <div className="container-genero">
     <Helmet>
        <title>Taberna - {genero}</title>
      </Helmet>
    <div className="genero-title-h1">
      <h1>{genero}  {getGenreIcon(genero)}</h1>
      </div>

      {currentPage === 1 && (
        <>
          <div className="popular-anime-section">
            <h2 className="h2-genero">Más populares</h2>
            <div className="card-container">
              {popularAnimes.map((anime) => (
                <div key={anime.id} className="card-home card-home-fixed-height">
            <Link
              to={`/anime/${anime.id}/${formatAnimeName(anime.name)}`}
              className="h3-genero-link"
            >
            <div className="imagen-h3">
            
              <LazyLoadImage src={anime.image} alt={anime.title} />
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
        </>
      )}

      <div className="all-anime-section">
        <h2 className=" h2-genero">Todos los animes {genero}</h2>
        <div className="card-container">
          {allAnimes.map((anime) => (
            <div key={anime.id} className="card-home card-home-fixed-height">
            <Link
              to={`/anime/${anime.id}/${formatAnimeName(anime.name)}`}
              className="h3-genero-link"
            >
            <div className="imagen-h3"> 
              <LazyLoadImage src={anime.image} alt={anime.title} />
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
      <div className="pagination">
        <PaginationNumbers
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          handlePreviousPage={handlePreviousPage}
          handleNextPage={handleNextPage}
        />
      </div>
    </div>
  );
};

export default Genero;


