import React from "react";

const GameOverModal = ({ show, winner, play }) => {
  if (!show) return null;

  const onRestart = () => {
    window.location.reload(); // Reload the page to restart the game
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.header}>{play}</h2>
        <p style={styles.message}>
          {winner ? `${winner} wins!` : "It's a draw!"}
        </p>
        <button style={styles.button} onClick={onRestart}>
          Restart Game
        </button>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.8)", // Dark background with opacity
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000, // Ensure modal stays on top
  },
  modal: {
    background: "rgba(255, 255, 255, 0.9)", // Slightly transparent white background
    padding: "40px 60px", // Increased padding for better spacing
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
    textAlign: "center",
    width: "500px", // Increased width for better visibility
    zIndex: 1001, // Ensure modal content stays above the background overlay
  },
  header: {
    fontSize: "36px", // Larger font for the title
    fontWeight: "bold",
    marginBottom: "15px",
    color: "#333",
  },
  message: {
    fontSize: "24px", // Increased font size for the message
    marginBottom: "30px",
    color: "#333",
  },
  button: {
    padding: "15px 30px",
    fontSize: "18px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
};

// Add hover effect for the button
styles.button[":hover"] = {
  backgroundColor: "#0056b3", // Darker shade for button hover effect
};

export default GameOverModal;
