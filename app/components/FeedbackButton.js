"use client";
import { useState } from "react";
import FeedbackModal from "./FeedbackModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment, faStar } from "@fortawesome/free-solid-svg-icons";

const C = {
  maroon: "#6F4E37",
  maroonDark: "#4A2E22",
  goldLight: "#E8D9C0",
};

export default function FeedbackButton({ user }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 999,
          padding: "14px 22px",
          borderRadius: "50px",
          border: "none",
          backgroundColor: C.maroon,
          color: C.goldLight,
          fontSize: "14px",
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "'Georgia', serif",
          boxShadow: "0 4px 24px rgba(107,26,36,0.35)",
          transition: "all 0.3s ease",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = "scale(1.05)";
          e.target.style.backgroundColor = C.maroonDark;
          e.target.style.boxShadow = "0 8px 40px rgba(107,26,36,0.5)";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "scale(1)";
          e.target.style.backgroundColor = C.maroon;
          e.target.style.boxShadow = "0 4px 24px rgba(107,26,36,0.35)";
        }}
      >
        <FontAwesomeIcon icon={faComment} style={{ fontSize: 18 }} />
        <span>Give Feedback</span>
        <div style={{
          position: "absolute",
          top: -6,
          right: -6,
          background: "#EF4444",
          color: "white",
          fontSize: 9,
          fontWeight: 700,
          borderRadius: "50%",
          width: 20,
          height: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "pulse 2s ease-in-out infinite",
        }}>
          <FontAwesomeIcon icon={faStar} style={{ fontSize: 10 }} />
        </div>
      </button>

      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={user}
      />

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </>
  );
}