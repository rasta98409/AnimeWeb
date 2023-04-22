import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import "./Register.css";
import { useAuth } from "../../AuthContext";
import { Helmet } from 'react-helmet';
import avatar1 from "./avatars/avatar1.png";
import avatar2 from "./avatars/avatar2.png";
import avatar3 from "./avatars/avatar3.png";
import avatar4 from "./avatars/avatar4.png";
import avatar5 from "./avatars/avatar5.png";
import avatar6 from "./avatars/avatar6.png";
import avatar7 from "./avatars/avatar7.png";
import avatar8 from "./avatars/avatar8.png";
import avatar9 from "./avatars/avatar9.png";
import avatar10 from "./avatars/avatar10.png";
import avatar11 from "./avatars/avatar11.png";
import avatar12 from "./avatars/avatar12.png";
import avatar13 from "./avatars/avatar13.png";
import avatar14 from "./avatars/avatar14.png";
import avatar15 from "./avatars/avatar15.png";
import avatar16 from "./avatars/avatar16.png";
import avatar17 from "./avatars/avatar17.png";
import avatar18 from "./avatars/avatar18.png";
import avatar19 from "./avatars/avatar19.png";
import avatar20 from "./avatars/avatar20.png";
import avatar21 from "./avatars/avatar21.png";
import avatar22 from "./avatars/avatar22.jpg";
import avatar23 from "./avatars/avatar23.png";
import avatar24 from "./avatars/avatar24.png";
import avatar25 from "./avatars/avatar25.png";






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
    case "auth/email-already-in-use":
      return "Correo electrónico ya en uso";
    case "auth/weak-password":
      return "Contraseña débil";
    default:
      return "Error desconocido";
  }
}

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleAvatarChange = (newAvatar) => {
    setAvatar(newAvatar);
    console.log(avatar);
  };

  const { setCurrentUser, forceUpdate } = useAuth();

  const avatars = [
    avatar1,
    avatar2,
    avatar3,
    avatar4,
    avatar5,
    avatar6,
    avatar7,
    avatar8,
    avatar9,
    avatar10,
    avatar11,
    avatar12,
    avatar13,
    avatar14,
    avatar15,
    avatar16,
    avatar17,
    avatar18,
    avatar19,
    avatar20,
    avatar21,
    avatar22,
    avatar23,
    avatar24,
    avatar25

  ];

  const [showAvatars, setShowAvatars] = useState(false);

  const [confirmPassword, setConfirmPassword] = useState(""); // Nuevo estado para confirmar contraseña


  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!displayName) {
      setErrorMessage("Debes ingresar un nombre de usuario antes de registrarte");
      return;
    }
  
    if (displayName.length < 5) {
      setErrorMessage("El nombre de usuario debe tener al menos 5 caracteres");
      return;
    }
  
    if (!avatar) {
      setErrorMessage("Debes seleccionar un avatar antes de registrarte");
      return;
    }
    
    if (password !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden");
      return;
    }
  
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName, photoURL: avatar });
  
      setCurrentUser(user);
      forceUpdate();
      navigate("/");
    } catch (error) {
      console.error("Error al registrar:", error);
      setErrorMessage(getErrorMessage(error.code));
    }
  };

  return (
    <div className="contain-register">
     <Helmet>
        <title>Taberna Anime - Registrarse </title>
      </Helmet>
    <div className="register card-register">
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}
      <h2 className="registrarse">Registrarse</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Usuario"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
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
        <input
          type="password"
          placeholder="Confirmar contraseña" // Nuevo campo de entrada para confirmar contraseña
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button
        className="button-avatars"
          type="button"
          onClick={() => setShowAvatars(!showAvatars)}
        >
          Avatars
        </button>
        {showAvatars && (
          <div className="image-options">
            {avatars.map((a) => (
              <img
                key={a}
                src={a}
                alt=""
                className={`image-option ${avatar === a ? "image-selected" : ""}`}
                onClick={() => handleAvatarChange(a)}
              />
            ))}
          </div>
        )}
        <button type="submit">Registrarse</button>
      </form>
    </div>
    </div>
  );
}

export default Register;