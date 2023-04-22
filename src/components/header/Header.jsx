import { useAuth } from "../../AuthContext";
import "./Header.css";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
// import "boxicons";
import { useAnime } from "../../AnimeContext";


function Header() {
  const [tabernaDropdownOpen, setTabernaDropdownOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [blurTimeout, setBlurTimeout] = useState(null);
  const { currentUser, setCurrentUser, forceUpdate, searchResults, setSearchResults } = useAuth();
  const [mobileGenresOpen, setMobileGenresOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const { animesToRemove } = useAnime();


  const formatAnimeName = (name) => {
    if (!name) {
      return "";
    }
    // Reemplaza los espacios con guiones y elimina caracteres especiales
    return name.replace(/ /g, "-").replace(/[^\w-]/gi, '');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      forceUpdate();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const handleSearchChange = async (event) => {
    const query = event.target.value.trim();
    setSearchQuery(query);

    if (!query) {
      setSearchResults([]);
      return;
    }

    try {
      const kitsuUrl = `https://kitsu.io/api/edge/anime?filter[text]=${query}&page[limit]=7`;
      const response = await fetch(kitsuUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.data) {
        throw new Error("No se encontraron datos en la respuesta de la API");
      }

      const allowedShowTypes = ["TV", "OVA", "movie"];

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

  const handleSearchFocus = () => {
    if (blurTimeout) {
      clearTimeout(blurTimeout);
      setBlurTimeout(null);
    }
    setSearchDropdownOpen(true);
  };

  const handleSearchBlur = () => {
    const timeoutId = setTimeout(() => {
      setSearchDropdownOpen(false);
    }, 300);
    setBlurTimeout(timeoutId);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    if (searchQuery) {
      setSearchResults([]);
      window.location.href = `/search?query=${searchQuery}`;
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!event.target.closest(".search-section")) {
        setSearchResults([]);
      }
    };

    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [setSearchResults]);

  useEffect(() => {
    return () => {
      if (blurTimeout) {
        clearTimeout(blurTimeout);
      }
    };
  }, [blurTimeout]);
  

  const handleMobileDropdownClick = (event) => {
    event.stopPropagation();
  };

  const closeMobileMenu = () => {
    setMobileDropdownOpen(false);
  };

  return (
    <header className="header">
    <div className="header-main-div">
      <div className="left-section">
      <Link to="/" className="logo-container"> {/* Aquí está el cambio */}
          <h1 className="logo">Taberna</h1>
          <h1 className="anime">Anime</h1>
       </Link>
        <nav>
          <div className="nav-item">
            <Link to="/">Home</Link>
          </div>
          <div className="nav-item" onClick={() => setTabernaDropdownOpen(!tabernaDropdownOpen)}>
            <span className="taberna">Taberna</span>
            {tabernaDropdownOpen ? (
              <div className="dropdown-menu">
                <div className="genres-title">Géneros</div>
                <hr className="genres-divider" />
                <div className="genre-list">
                  <Link to="/genero/action">Acción</Link>
                  <Link to="/genero/adventure">Aventura</Link>
                  <Link to="/genero/comedy">Comedia</Link>
                  <Link to="/genero/drama">Drama</Link>
                  <Link to="/genero/fantasy">Fantasía</Link>
                  <Link to="/genero/horror">Horror</Link>
                  <Link to="/genero/mecha">Mecha</Link>
                  <Link to="/genero/psychological">Psicológico</Link>
                  <Link to="/genero/romance">Romance</Link>
                  <Link to="/genero/Sci-fi">Ciencia Ficción</Link>
                  <Link to="/genero/Slice of Life">Recuentos de la vida</Link>
                  <Link to="/genero/Sports">Deportes</Link>
                  <Link to="/genero/supernatural">Sobrenatural</Link>
                  <Link to="/genero/thriller">Suspenso</Link>
                  <Link to="/genero/ecchi">Ecchi</Link>
                </div>
              </div>
            ) : null}
          </div>
        </nav>
        <div className="mobile-menu" onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}>
        <div className="mobile-menu-icon" onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}>
  <box-icon color='white' size="md" name="menu" type="solid"></box-icon>
  </div>
  {mobileDropdownOpen && (
    <div className="mobile-dropdown"  onClick={handleMobileDropdownClick}>
    {currentUser ? (
      <>
        <img
          src={currentUser.photoURL}
          alt="avatar"
          className="user-logo-preview-large"
        />
        <span className="user-name">{currentUser.displayName}</span>
      </>
    ) : (
      <Link to="/login"   onClick={closeMobileMenu} className={!currentUser && mobileDropdownOpen ? "margin-top-login" : ""}> Iniciar sesión</Link> 
    )}
  
      <div className="search-section">
      <form onSubmit={handleSearchSubmit}>
        <div className="search-input">
        <div className="search-container">
        <input
          type="text"
          placeholder="Buscar anime..."
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
          onChange={handleSearchChange}
        />
        <button onClick={handleSearchSubmit} className="search-icon-button">

        </button>
        {searchDropdownOpen && (
          <div className="search-dropdown">
            {searchResults.map((anime) => (
              <Link
                key={anime.id}
                to={`/anime/${anime.id}/${formatAnimeName(anime.title)}`}
                className="search-item"
                onClick={closeMobileMenu}
             
              >
                <img src={anime.image} alt={anime.title} />
                <span>{anime.title}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
        <button type="submit" className="search-icon-button"></button>
          </div>     
          </form>
        </div>
        <div className="mobile-genres" onClick={() => setMobileGenresOpen(!mobileGenresOpen)}>
                  <span className="taberna-movil-menu"><box-icon name='beer' type='solid' color='#ffffff' ></box-icon>Taberna</span>
                  {mobileGenresOpen && (
                    <div className="mobile-genres-dropdown">
                  <div className="genres-title">Géneros</div>
                  <hr className="genres-divider" />
                  <div className="genre-list">
                  <Link    onClick={closeMobileMenu} to="/genero/action">Acción</Link>
                  <Link     onClick={closeMobileMenu} to="/genero/adventure">Aventura</Link>
                  <Link    onClick={closeMobileMenu} to="/genero/comedy">Comedia</Link>
                  <Link    onClick={closeMobileMenu} to="/genero/drama">Drama</Link>
                  <Link    onClick={closeMobileMenu} to="/genero/fantasy">Fantasía</Link>
                  <Link    onClick={closeMobileMenu} to="/genero/horror">Horror</Link>
                  <Link    onClick={closeMobileMenu} to="/genero/mecha">Mecha</Link>
                  <Link    onClick={closeMobileMenu} to="/genero/psychological">Psicológico</Link>
                  <Link    onClick={closeMobileMenu} to="/genero/romance">Romance</Link>
                  <Link    onClick={closeMobileMenu} to="/genero/Sci-fi">Ciencia Ficción</Link>
                  <Link    onClick={closeMobileMenu} to="/genero/Slice of Life">Recuentos de la vida</Link>
                  <Link    onClick={closeMobileMenu} to="/genero/Sports">Deportes</Link>
                  <Link    onClick={closeMobileMenu} to="/genero/supernatural">Sobrenatural</Link>
                  <Link    onClick={closeMobileMenu} to="/genero/thriller">Suspenso</Link>
                  <Link    onClick={closeMobileMenu} to="/genero/ecchi">Ecchi</Link>
          </div>
        </div>
          )}
        </div> 
        {currentUser ? (
      <>
      <Link className="favoritos-menu" style={{color: "white"}}    onClick={closeMobileMenu} to="/favoritos"> <box-icon name='star' type='solid' color='#ffffff' ></box-icon>Favoritos</Link>
        <Link className="mi-cuenta"    onClick={closeMobileMenu} style={{color: "white"}} to="/mi-cuenta"><box-icon name='user' type='solid' color='#ffffff' ></box-icon> Mi cuenta</Link>
           
        <div className="dropdown-separator"></div>
        <button className="button-menu-drop" onClick={handleLogout}><box-icon name='log-out' type='solid' color='#ffffff' ></box-icon>Cerrar sesión</button>
        
      </>
    ) : (  
    <></>
    )}

    </div>
  )}
</div>
      </div>
      <div className="right-section">
      <div className="search-section">
      <form onSubmit={handleSearchSubmit}>
        <div className="search-input">
        <div className="search-container">
        <input
          type="text"
          placeholder="Buscar anime..."
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
          onChange={handleSearchChange}
        />
        <button onClick={handleSearchSubmit} className="search-icon-button">
          <box-icon name='search-alt-2'  color='#972525'></box-icon>
        </button>
        {searchDropdownOpen && (
          <div className="search-dropdown">
            {searchResults.map((anime) => (
              <Link
                key={anime.id}
                to={`/anime/${anime.id}/${formatAnimeName(anime.title)}`}
                className="search-item"
              >
                <img src={anime.image} alt={anime.title} />
                <span>{anime.title}</span>
              </Link>
            ))}
          </div>
          
        )}
      </div>
              <button type="submit" className="search-icon-button"></button>
            </div>
          </form>
        </div>
        {currentUser && currentUser.photoURL ? (
          <div
            className="user-dropdown"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <img
              src={currentUser.photoURL}
              alt="avatar"
              className="user-logo-preview"
            />
            {dropdownOpen ? (
              <div className="dropdown-menu user-menu">
                <div className="user-info">
                  <img
                    src={currentUser.photoURL}
                    alt="avatar"
                    className="user-logo-preview-large"
                  />
                  <span className="user-name">{currentUser.displayName}</span>
                </div>
                <div className="dropdown-separator"></div>
                <Link to="/favoritos"> <box-icon name='star' type='solid' color='#ffffff' ></box-icon>Favoritos</Link>
             
                <Link className="mi-cuenta" to="/mi-cuenta"><box-icon name='user' type='solid' color='#ffffff' ></box-icon> Mi cuenta</Link>
              
                <div className="dropdown-separator"></div>
                <button onClick={handleLogout}><box-icon name='log-out' type='solid' color='#ffffff' ></box-icon>Cerrar sesión</button>
              </div>
            ) : null}
          </div>
        ) : (
          <Link  to="/login"> Iniciar sesión</Link>
        )}
      </div>
      </div>
    </header>
  );
}

export default Header;