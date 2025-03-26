//PopupMessage.jsx
import React from "react";
import "./styles/PopupMessage.css";

function PopUpMessage({ message, onClose }) {
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-message">
        <span className="message-text">{message}</span>
        <button className="close-button" onClick={onClose}>
          X
        </button>
      </div>
    </div>
  );
}

export default PopUpMessage;
