import React from "react";
// im
// import "./ // Custom styles

const PromotionModal = ({ show, onPromote, row, col }) => {
  if (!show) return null;

  const handleSelect = (piece) => {
    onPromote(row, col, piece); // Call the promotion handler with the selected piece
  };

  return (
    <div className="promotion-modal-container">
      <div className="promotion-modal">
        <h2 className="promotion-title">Promote Your Pawn</h2>
        <div className="promotion-options">
          <button
            className="promotion-button"
            onClick={() => handleSelect("q")}
          >
            Queen
          </button>
          <button
            className="promotion-button"
            onClick={() => handleSelect("r")}
          >
            Rook
          </button>
          <button
            className="promotion-button"
            onClick={() => handleSelect("b")}
          >
            Bishop
          </button>
          <button
            className="promotion-button"
            onClick={() => handleSelect("k")}
          >
            Knight
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromotionModal;
