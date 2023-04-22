// import React from 'react';
// import { Link } from 'react-router-dom';
// import './Footer.css';

// const Footer = () => {
//   return (
//     <footer className="footer">
//       <div className="footer-container">
//         <div className="footer-links">
//           <Link to="/">Home</Link>
//           <Link to="/favoritos">Favoritos</Link>
//           <Link to="/mi-cuenta">Mi Cuenta</Link>
//         </div>
//         <div className="footer-social">
//           <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
//             <i className="fab fa-instagram"></i>
//           </a>
//           <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
//             <i className="fab fa-facebook-f"></i>
//           </a>
//           <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer">
//             <i className="fab fa-twitter"></i>
//           </a>
//         </div>
//         <div className="footer-legal">
//           <Link to="/terminos-y-condiciones">Términos y Condiciones</Link>
//         </div>
//       </div>
//     </footer>
//   );
// };

// export default Footer;



import React from 'react';
import './Footer.css';
import { Link } from 'react-router-dom';
// import "boxicons";
import { useAuth } from '../../AuthContext'; // Importar useAuth

const Footer = () => {
  const { currentUser } = useAuth(); // Obtener currentUser de useAuth

  return (
    <footer className="footer" >
      <div className="footer-container">
        <div className="footer-section">
          <h1>Taberna Anime</h1>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            {currentUser && (
              <>
                <li>
                  <Link to="/favoritos">Favoritos</Link>
                </li>
                <li>
                  <Link to="/mi-cuenta">Mi cuenta</Link>
                </li>
              </>
            )}
          </ul>
        </div>
        <div className="footer-section">
          <h1>Redes sociales</h1>
          <ul>
            <li>
              <a className='icono-name-footer' href="https://www.facebook.com">
                <box-icon  color='white' type='logo' name='facebook-square'></box-icon> Facebook
              </a>
            </li>
            <li>
              <a className='icono-name-footer' href="https://www.instagram.com">
                <box-icon color='white' name='instagram-alt' type='logo' ></box-icon> Instagram
              </a>
            </li>
            <li>
              <a className='icono-name-footer' href="https://www.twitter.com">
                <box-icon color='white' name='twitter' type='logo' ></box-icon> Twitter
            
              </a>
            </li>
          </ul>
        </div>
        <div className="footer-section">
        <div className='h1-and-ul-footer'>
          <h1>Información</h1>
          
          <ul className='ul-footer'>
            <li>
              <Link to="/terminos-y-condiciones">Términos y condiciones</Link>
            </li>
          </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;