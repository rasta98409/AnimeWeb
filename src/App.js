import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/header/Header";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Home from "./components/home/Home";
import Micuenta from "./components/cuenta/MiCuenta";
import "./App.css";
import { AuthProvider, useAuth } from './AuthContext';
import Genero from "./components/generos/Genero";
import AnimePage from "./components/paginas/AnimePage";
import Favoritos from "./components/favoritos/Favoritos";
import EpisodePage from "./components/paginas/EpisodePage";
import SearchResultsPage from "./components/header/SearchResultsPage";
import PasswordReset from "./components/auth/PasswordReset";
import Footer from "./components/footer/Footer";
import { AnimeProvider } from "./AnimeContext";
import ViewAll from "./components/home/ViewAll";
import ContinueWatching from "./components/home/ContinueWatching";

function App() {
  const { currentUser } = useAuth();
  return (
    <Router>
      <div className="app">
        <Header />
        <div className="app-main"> {/* Agrega este div */}

        <Routes>
       
    <>
    
      <Route path="/" element={<Home />} />
      <Route path="/mi-cuenta" element={<Micuenta />} />
      {/* Puedes agregar más rutas protegidas aquí */}
      <Route path="/genero/:genero" element={<Genero />} />
      <Route path="/anime/:animeId/:animeName" element={<AnimePage />} />
      <Route path="/favoritos" element={<Favoritos currentUser={currentUser} />} />
      <Route path="/anime/:animeId/episode/:episodeNumber" element={<EpisodePage />} />
      <Route path="/search" element={<SearchResultsPage/>}/> {/* Mueve esta ruta aquí */}



            
    </>
  ) : ( 

    
          <>
          
     <Route path="/search" element={<SearchResultsPage/>}/> 
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/genero/:genero" element={<Genero />} />
      <Route path="/anime/:animeId/:animeName" element={<AnimePage />} />
      <Route path="/anime/:animeId/episode/:episodeId" element={<EpisodePage />} />
      <Route path="/password-reset" element={<PasswordReset />} />
      <Route path="/view-all/:category" element={<ViewAll />} />
      <Route path="/continue-watching" element={<ContinueWatching />} />

    </>
        
      </Routes>
      </div>
      <Footer />
      </div>
    </Router>
  );
}

export default function WrappedApp() {
  return (
    <AuthProvider>
    <AnimeProvider>
      <App />
      </AnimeProvider>
    </AuthProvider>
  );
}

