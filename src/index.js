import React from 'react';
import ReactDOM from 'react-dom';
import WrappedApp from './App';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";


ReactDOM.render(
  <React.StrictMode>
    <WrappedApp />
  </React.StrictMode>,
  document.getElementById('root')
);

// Registra el service worker


// Si deseas desregistrar el service worker, simplemente llama a la función `unregister`
// unregister();