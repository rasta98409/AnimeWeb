import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase";
import "./PasswordReset.css";
import { Helmet } from 'react-helmet';


function PasswordReset() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Se ha enviado un correo para restablecer tu contraseña.");
      setError(false);
    } catch (error) {
      console.error("Error al enviar el correo de restablecimiento:", error);
      setMessage("Error al enviar el correo de restablecimiento.");
      setError(true);
    }
  };

  return (
    <div className="password-reset card-reset">
     <Helmet>
        <title>Taberna Anime - Password Reset </title>
      </Helmet>
      <h2>Restablecer contraseña</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit">Enviar correo de restablecimiento</button>
      </form>
      {message && (
      <p className={error ? "error" : ""}>{message}</p>
    )}
    </div>
  );
}

export default PasswordReset;