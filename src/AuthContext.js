import { createContext, useState, useContext, useEffect, useRef } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';


const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const forceUpdate = useForceUpdate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    searchResults,
    setSearchResults,
    setCurrentUser,
    forceUpdate, // Agrega la función forceUpdate al contexto
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Función personalizada para forzar la actualización de un componente
function useForceUpdate() {
  const [, setValue] = useState(0);
  return () => setValue((value) => value + 1);
}