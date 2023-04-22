import React, { useState } from "react";
import "./MiCuenta.css";
import { useAuth } from "../../AuthContext";
import {
  updateEmail,
  updatePassword,
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { Helmet } from 'react-helmet';
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { getDoc } from "firebase/firestore";
import { useEffect } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import avatar1 from '../auth/avatars/avatar1.png';
import avatar2 from '../auth/avatars/avatar2.png';
import avatar3 from '../auth/avatars/avatar3.png';
import avatar4 from '../auth/avatars/avatar4.png';
import avatar5 from '../auth/avatars/avatar5.png';
import avatar6 from '../auth/avatars/avatar6.png';
import avatar7 from '../auth/avatars/avatar7.png';
import avatar8 from '../auth/avatars/avatar8.png';
import avatar9 from '../auth/avatars/avatar9.png';
import avatar10 from '../auth/avatars/avatar10.png';
import avatar11 from '../auth/avatars/avatar11.png';
import avatar12 from '../auth/avatars/avatar12.png';
import avatar13 from '../auth/avatars/avatar13.png';
import avatar14 from '../auth/avatars/avatar14.png';
import avatar15 from '../auth/avatars/avatar15.png';
import avatar16 from '../auth/avatars/avatar16.png';
import avatar17 from '../auth/avatars/avatar17.png';
import avatar18 from '../auth/avatars/avatar18.png';
import avatar19 from '../auth/avatars/avatar19.png';
import avatar20 from '../auth/avatars/avatar20.png';
import avatar21 from '../auth/avatars/avatar21.png';
import avatar22 from '../auth/avatars/avatar22.jpg';
import avatar23 from '../auth/avatars/avatar23.png';
import avatar24 from '../auth/avatars/avatar24.png';
import avatar25 from '../auth/avatars/avatar25.png';

function MiCuenta() {
  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [username, setUsername] = useState("");
  const [country, setCountry] = useState("");
  const [gender, setGender] = useState("");
  const [initialCountry, setInitialCountry] = useState("");
  const [initialGender, setInitialGender] = useState("");
  const [message, setMessage] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const { currentUser } = useAuth();
  const [showAvatars, setShowAvatars] = useState(false);
  const [confirmNewPassword, setConfirmNewPassword] = useState(""); // Nuevo estado para confirmar la nueva contraseña
  const [confirmCurrentPassword, setConfirmCurrentPassword] = useState(""); // Nuevo estado para confirmar la contraseña actual
  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState(""); // Nuevo estado


  const handleUpdateUserInfo = async (e) => {
    e.preventDefault();
    if ((country && country !== initialCountry) || (gender && gender !== initialGender)) {
      await saveCountryAndGender(currentUser.uid, country, gender);
    }
  
    if (selectedAvatar && selectedAvatar !== currentUser.photoURL) {
      await updateAvatar(currentUser.uid, selectedAvatar);
    }
  };
  
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword) {
      if (newPassword === confirmNewPassword) { // Verificación de coincidencia de contraseñas
        if (currentPassword) {
          const isReauthenticated = await reauthenticateUser(email, currentPassword);
          if (isReauthenticated) {
            try {
              await updatePassword(currentUser, newPassword);
              showMessage("Contraseña actualizada");
            } catch (error) {
              console.error("Error al actualizar la contraseña:", error);
              showMessage("Error al actualizar la contraseña");
            }
          } else {
            console.error("La contraseña actual no es correcta");
            showMessage("La contraseña actual no es correcta");
          }
        } else {
          console.error("Debes ingresar tu contraseña actual para actualizar la contraseña");
          showMessage("Debes ingresar tu contraseña actual para actualizar la contraseña");
        }
      } else {
        console.error("Las nuevas contraseñas no coinciden");
        showMessage("Las nuevas contraseñas no coinciden");
      }
    }
  };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    if (newEmail && email !== newEmail) {
      if (currentPasswordForEmail) {
        if (currentPasswordForEmail === confirmCurrentPassword) {
          // Reautenticar al usuario antes de actualizar el correo electrónico
          const isReauthenticated = await reauthenticateUser(email, currentPasswordForEmail);
          if (isReauthenticated) {
            try {
              await updateEmail(currentUser, newEmail);
              showMessage("Correo electrónico actualizado");
            } catch (error) {
              console.error("Error al actualizar el correo electrónico:", error);
              showMessage("Error al actualizar el correo electrónico");
            }
          } else {
            console.error("La contraseña actual no es correcta");
            showMessage("La contraseña actual no es correcta");
          }
        } else {
          console.error("Las contraseñas actuales no coinciden");
          showMessage("Las contraseñas actuales no coinciden");
        }
      } else {
        console.error("Debes ingresar tu contraseña actual para actualizar el correo electrónico");
        showMessage("Debes ingresar tu contraseña actual para actualizar el correo electrónico");
      }
    }
  };



  const saveCountryAndGender = async (uid, country, gender) => {
    try {
      await setDoc(doc(db, "users", uid), { country, gender }, { merge: true });
      showMessage("País y género actualizados");
    } catch (error) {
      console.error("Error al actualizar el país y el género:", error);
      showMessage("Error al actualizar el país y el género");
    }
  };

  const getCountryAndGender = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setCountry(userData.country || "");
        setGender(userData.gender || "");
        setInitialCountry(userData.country || "");
        setInitialGender(userData.gender || "");
      }
    } catch (error) {
      console.error("Error al obtener el país y el género:", error);
      showMessage("Error al obtener el país y el género");
    }
  };

  useEffect(() => {
    if (currentUser) {
      setEmail(currentUser.email);
      setUsername(currentUser.displayName);
      getCountryAndGender(currentUser.uid);
    }
  }, [currentUser]);

  const reauthenticateUser = async (email, password) => {
    const credential = EmailAuthProvider.credential(email, password);
    try {
      await reauthenticateWithCredential(currentUser, credential);
      return true;
    } catch (error) {
      console.error("Error al reautenticar:", error);
      showMessage("Error al reautenticar");
      return false;
    }
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const updateAvatar = async (uid, avatarUrl) => {
    try {
      await updateProfile(currentUser, { photoURL: avatarUrl });
      await setDoc(doc(db, "users", uid), { photoURL: avatarUrl }, { merge: true });
      showMessage("Avatar actualizado");
    } catch (error) {
      console.error("Error al actualizar el avatar:", error);
      showMessage("Error al actualizar el avatar");
    }
  };

 
  return (
    <div className="miCuenta">
     <Helmet>
        <title>Taberna Anime - Mi Cuenta </title>
      </Helmet>
      <div className="miCuentaHeader">
        {currentUser && currentUser.photoURL && (
          <img
            src={currentUser.photoURL}
            alt="avatar"
            className="user-logo-miCuenta"
          />
        )}
        <h2>Mi Cuenta</h2>
      </div>
      {message && (
        <div className="message">
          {message}
        </div>
      )}
      <Tabs>
        <TabList>
          <Tab>Información del usuario</Tab>
          <Tab>Cambiar contraseña</Tab>
          <Tab>Cambiar correo electrónico</Tab>
        </TabList>

        <TabPanel>
        <form onSubmit={handleUpdateUserInfo}>
            <label htmlFor="currentEmail">Correo electrónico actual:</label>
            <input
              type="email"
              id="currentEmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled
            />

            <label htmlFor="username">Nombre de usuario actual:</label>
            <input
              type="text"
              id="currentUsername"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled
            />

            <label htmlFor="country">País:</label>
            <select
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            >
              <option value="">Selecciona un país</option>
              <option value="colombia">Colombia</option>
              <option value="argentina">Argentina</option>
              <option value="mexico">México</option>
            </select>

            <label htmlFor="gender">Género:</label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="">Selecciona un género</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="otro">Otro</option>
            </select>
            <div className="buttons-container">
            <input
              type="checkbox"
              id="toggleAvatars"
              className="checkbox-button"
              checked={showAvatars}
              onChange={(e) => setShowAvatars(e.target.checked)}
            />
            <label htmlFor="toggleAvatars">Cambiar Avatar</label>
            {showAvatars && (
            <div className="avatars-change">
              <input
                type="radio"
                id="avatar1"
                name="avatar"
                value={avatar1}
                onChange={(e) => setSelectedAvatar(e.target.value)}
              />
              <label htmlFor="avatar1">
                <img src={avatar1} alt="Avatar 1" />
              </label>

              <input
                type="radio"
                id="avatar2"
                name="avatar"
                value={avatar2}
                onChange={(e) => setSelectedAvatar(e.target.value)}
              />
              <label htmlFor="avatar2">
                <img src={avatar2} alt="Avatar 2" />
              </label>
              <input
                type="radio"
                id="avatar3"
                name="avatar"
                value={avatar3}
                onChange={(e) => setSelectedAvatar(e.target.value)}
              />
              <label htmlFor="avatar3">
                <img src={avatar3} alt="Avatar 3" />
              </label>
              <input
                type="radio"
                id="avatar4"
                name="avatar"
                value={avatar4}
                onChange={(e) => setSelectedAvatar(e.target.value)}
              />
              <label htmlFor="avatar4">
                <img src={avatar4} alt="Avatar 4" />
              </label>
              <input
                type="radio"
                id="avatar5"
                name="avatar"
                value={avatar5}
                onChange={(e) => setSelectedAvatar(e.target.value)}
              />
              <label htmlFor="avatar5">
                <img src={avatar5} alt="Avatar 5" />
              </label>
              <input
                type="radio"
                id="avatar6"
                name="avatar"
                value={avatar6}
                onChange={(e) => setSelectedAvatar(e.target.value)}
              />
              <label htmlFor="avatar6">
                <img src={avatar6} alt="Avatar 6" />
              </label>
              <input
                type="radio"
                id="avatar7"
                name="avatar"
                value={avatar7}
                onChange={(e) => setSelectedAvatar(e.target.value)}
              />
              <label htmlFor="avatar7">
                <img src={avatar7} alt="Avatar 7" />
              </label>
              <input
                type="radio"
                id="avatar8"
                name="avatar"
                value={avatar8}
                onChange={(e) => setSelectedAvatar(e.target.value)}
              />
              <label htmlFor="avatar8">
                <img src={avatar8} alt="Avatar 8" />
              </label>
              <input
                type="radio"
                id="avatar9"
                name="avatar"
                value={avatar9}
                onChange={(e) => setSelectedAvatar(e.target.value)}
              />
              <label htmlFor="avatar9">
                <img src={avatar9} alt="Avatar 9" />
              </label>
              <input
                type="radio"
                id="avatar10"
                name="avatar"
                value={avatar10}
                onChange={(e) => setSelectedAvatar(e.target.value)}
              />
              <label htmlFor="avatar10">
                <img src={avatar10} alt="Avatar 10" />
              </label>
              <input
                type="radio"
                id="avatar11"
                name="avatar"
                value={avatar11}
                onChange={(e) => setSelectedAvatar(e.target.value)}
              />
              <label htmlFor="avatar11">
                <img src={avatar11} alt="Avatar 11" />
              </label>
              <input
                type="radio"
                id="avatar12"
                name="avatar"
                value={avatar12}
                onChange={(e) => setSelectedAvatar(e.target.value)}
              />
              <label htmlFor="avatar12">
                <img src={avatar12} alt="Avatar 12" />
              </label>

              <input
                type="radio"
                id="avatar13"
                name="avatar"
                value={avatar13}
                onChange={(e) => setSelectedAvatar(e.target.value)}
              />
              <label htmlFor="avatar13">
                <img src={avatar13} alt="Avatar 13" />
              </label>

              <input
                type="radio"
                id="avatar14"
                name="avatar"
                value={avatar14}
                onChange={(e) => setSelectedAvatar(e.target.value)}
              />
              <label htmlFor="avatar14">
                <img src={avatar14} alt="Avatar 14" />
              </label>

              <input
                type="radio"
                id="avatar15"
                name="avatar"
                value={avatar15}
                onChange={(e) => setSelectedAvatar(e.target.value)}
              />
              <label htmlFor="avatar15">
                <img src={avatar15} alt="Avatar 15" />
              </label>

              <input
                type="radio"
                id="avatar16"
                name="avatar"
                value={avatar16}
                onChange={(e) => setSelectedAvatar(e.target.value)}
              />
              <label htmlFor="avatar16">
                <img src={avatar16} alt="Avatar 16" />
              </label>

              <input
                type="radio"
                id="avatar17"
                name="avatar"
                value={avatar17}
                onChange={(e) => setSelectedAvatar(e.target.value)}
              />
              <label htmlFor="avatar17">
                <img src={avatar17} alt="Avatar 17" />
              </label>

              <input
                type="radio"
                id="avatar18"
                name="avatar"
                value={avatar18}
                onChange={(e) => setSelectedAvatar(e.target.value)}
              />
              <label htmlFor="avatar18">
                <img src={avatar18} alt="Avatar 18" />
              </label>

              <input
                type="radio"
                id="avatar19"
                name="avatar"
                value={avatar19}
                onChange={(e) => setSelectedAvatar(e.target.value)}
              />
              <label htmlFor="avatar19">
                <img src={avatar19} alt="Avatar 19" />
              </label>

              <input
                type="radio"
                id="avatar20"
                name="avatar"
                value={avatar20}
                onChange={(e) => setSelectedAvatar(e.target.value)}
              />
              <label htmlFor="avatar20">
                <img src={avatar20} alt="Avatar 20" />
              </label>

              <input
                type="radio"
                id="avatar21"
                name="avatar"
                value={avatar21}
                onChange={(e) => setSelectedAvatar(e.target.value)}
              />
              <label htmlFor="avatar21">
                <img src={avatar21} alt="Avatar 21" />
              </label>

              <input
                type="radio"
                id="avatar22"
                name="avatar"
                value={avatar22}
                onChange={(e) => setSelectedAvatar(e.target.value)}
              />
              <label htmlFor="avatar22">
                <img src={avatar22} alt="Avatar 22" />
              </label>
              <input
                type="radio"
                id="avatar23"
                name="avatar"
                value={avatar23}
                onChange={(e) => setSelectedAvatar(e.target.value)}
              />
              <label htmlFor="avatar23">
                <img src={avatar23} alt="Avatar 23" />
              </label>

              <input
                type="radio"
                id="avatar24"
                name="avatar"
                value={avatar24}
                onChange={(e) => setSelectedAvatar(e.target.value)}
              />
              <label htmlFor="avatar24">
                <img src={avatar24} alt="Avatar 24" />
              </label>

              <input
                type="radio"
                id="avatar25"
                name="avatar"
                value={avatar25}
                onChange={(e) => setSelectedAvatar(e.target.value)}
              />
              <label htmlFor="avatar25">
                <img src={avatar25} alt="Avatar 25" />
              </label>
            </div>
            )}
            <button type="submit">Actualizar información</button>
            </div>

          </form>
        </TabPanel>
        <TabPanel>
        <form onSubmit={handleUpdatePassword}>

            <label htmlFor="currentPassword">Contraseña actual:</label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />

            <label htmlFor="newPassword">Nueva contraseña:</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <label htmlFor="confirmNewPassword">Confirmar nueva contraseña:</label> {/* Nuevo campo para confirmar la nueva contraseña */}
            <input
              type="password"
              id="confirmNewPassword"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
            <button type="submit">Actualizar contraseña</button>
          </form>
        </TabPanel>
        <TabPanel>
        <form onSubmit={handleUpdateEmail}>
            <label htmlFor="newEmail">Nuevo correo electrónico:</label>
            <input
              type="email"
              id="newEmail"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />

            <label htmlFor="currentPasswordForEmail">Contraseña actual:</label>
            <input
              type="password"
              id="currentPasswordForEmail"
              value={currentPasswordForEmail}
              onChange={(e) => setCurrentPasswordForEmail(e.target.value)}
            />
            <label htmlFor="confirmCurrentPassword">Confirmar contraseña actual:</label> {/* Nuevo campo para confirmar la contraseña actual */}
            <input
              type="password"
              id="confirmCurrentPassword"
              value={confirmCurrentPassword}
              onChange={(e) => setConfirmCurrentPassword(e.target.value)}
            />

            <button type="submit">Actualizar correo electrónico</button>
          </form>
        </TabPanel>
      </Tabs>
    </div>
  );
}

export default MiCuenta;