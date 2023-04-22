import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { useAuth } from "../../AuthContext";
import { Helmet } from 'react-helmet';


function getErrorMessage(errorCode) {
  switch (errorCode) {
    case "auth/invalid-email":
      return "Correo electrónico inválido";
    case "auth/user-disabled":
      return "El usuario está deshabilitado";
    case "auth/user-not-found":
      return "Usuario no registrado";
    case "auth/wrong-password":
      return "Contraseña incorrecta";
    default:
      return "Error desconocido";
  }
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const { setCurrentUser, forceUpdate } = useAuth(); // Agrega forceUpdate aquí

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);

      setCurrentUser(user);
      forceUpdate(); // Llama a forceUpdate después de actualizar el currentUser
      navigate("/");
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setErrorMessage(getErrorMessage(error.code));
    }
  };

  return (
    <div className="contain-login">
     <Helmet>
        <title>Taberna Anime - Login</title>
      </Helmet>
    <div className="login card-login">
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <h2 className="iniciar-sesion">Iniciar sesión</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Iniciar sesión</button>
      </form>
      <div className="recover-register">
      <p className="register-p">
        ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
      </p>
      <p className="recover-pass">
        ¿Olvidaste tu contraseña?{" "}
        <Link to="/password-reset">Restablecer contraseña</Link>
      </p>
      </div>
    </div>
    </div>
  );
}

export default Login;


