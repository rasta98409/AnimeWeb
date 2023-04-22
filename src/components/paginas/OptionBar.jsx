import React, { useState } from "react";
import "./OptionBar.css";

const OptionBar = ({ options, onOptionChange }) => {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    onOptionChange(option);
  };

  return (
    <div className="option-bar">
      {options.map((option, index) => (
        <div
          key={index}
          className={`option-item ${selectedOption === option ? "selected" : ""}`}
          onClick={() => handleOptionClick(option)}
        >
          <span className="option-text-pc">{option}</span>
          <span className="option-text-mobile">{index + 1}</span>

          {index < options.length - 1}
        </div>
      ))}
    </div>
  );
};

export default OptionBar;