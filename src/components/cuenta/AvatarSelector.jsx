import React from "react";
import "./AvatarSelector.css";
import avatar1 from "../auth/avatars/avatar1.png";
import avatar2 from "../auth/avatars/avatar2.png";

const avatars = [
  avatar1,
  avatar2

];



function AvatarSelector({ onAvatarChange }) {
  return (
    <div className="avatarSelector">
      {avatars.map((avatar, index) => (
        <img
          key={index}
          src={`/components/auth/avatars/${avatar}`}
          alt={`Avatar ${index + 1}`}
          onClick={() => onAvatarChange(`/components/auth/avatars/${avatar}`)}
        />
      ))}
    </div>
  );
}

export default AvatarSelector;