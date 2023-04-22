import React from "react";
import "./AnimeCover.css";

const AnimeCover = ({ coverImage }) => {
  return (
    <div className="anime-cover">
      <img src={coverImage} alt="Anime cover" />
      <div className="slider-gradient-cover" />
    </div>
  );
};

export default AnimeCover;
