import React from "react";
import PencilSquare from "../assets/pencil-square.svg";

const Menu = ({ onEdit, onRemove }) => {
  return (
    <div className="menu-container">
      <div className="menu" onClick={(e) => e.stopPropagation()}>
        <button
          className="menu-item"
          onClick={() => {
            if (typeof onEdit === "function") onEdit();
          }}
          // use inline styles to change color on hover via CSS :hover would be preferred in stylesheet
          style={{ cursor: "pointer" }}
        >
          <img
            className="menu-icon"
            src={PencilSquare}
            alt="edit icon"
            style={{ marginRight: 8 }}
          />
          <span className="menu-text">Edit Holdings</span>
        </button>
        <button
          className="menu-item"
          onClick={() => {
            if (typeof onRemove === "function") onRemove();
          }}
          style={{ cursor: "pointer" }}
        >
          <svg
            className="menu-icon"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ marginRight: 8 }}
          >
            <path
              d="M2 4H14M6 4V3C6 2.44772 6.44772 2 7 2H9C9.55228 2 10 2.44772 10 3V4M12 4V13C12 13.5523 11.5523 14 11 14H5C4.44772 14 4 13.5523 4 13V4H12Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="menu-text">Remove</span>
        </button>
      </div>
    </div>
  );
};

export default Menu;
