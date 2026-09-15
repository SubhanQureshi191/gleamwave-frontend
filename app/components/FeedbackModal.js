"use client";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faTimes, faComment, faUser, faEnvelope, faTag } from "@fortawesome/free-solid-svg-icons";
import { API_URL } from "@/lib/config";

const C = {
  white: "#FFFFFF",
  whiteOff: "#FDF8F3",
  maroon: "#6F4E37",
  maroonDark: "#4A2E22",
  gold: "#B8956A",
  goldLight: "#E8D9C0",
  goldPale: "#F5EDE0",
  text: "#3D2B1F",
  textMid: "#6B4F3A",
  textLight: "#A08070",
};

export default function FeedbackModal({ isOpen, onClose, user }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [category, setCategory] = useState("general");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Auto-fill user data
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      // Reset submitted state when modal opens
      setSubmitted(false);
      setRating(0);
      setComment("");
      setCategory("general");
      setError("");
      
      // Check if user already submitted feedback
      const hasSubmitted = localStorage.getItem("feedback_submitted");
      if (hasSubmitted) {
        setSubmitted(true);
      }
    }
  }, [isOpen]);

  // Check if feedback already submitted on mount
  useEffect(() => {
    const hasSubmitted = localStorage.getItem("feedback_submitted");
    if (hasSubmitted) {
      setSubmitted(true);
    }
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }
    
    if (!comment.trim() || comment.length < 10) {
      setError("Please write a detailed review (minimum 10 characters)");
      return;
    }

    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${API_URL}/feedback/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({
          name: name,
          email: email,
          rating: rating,
          comment: comment,
          category: category
        })
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || "Failed to submit feedback");

      localStorage.setItem("feedback_submitted", "true");
      setSubmitted(true);
      
      // Close modal after 3 seconds
      setTimeout(() => {
        onClose();
        // Reset submitted state for next time
        setSubmitted(false);
        localStorage.removeItem("feedback_submitted");
      }, 3000);

    } catch (error) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    const currentRating = hoverRating || rating;
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => setRating(i)}
          onMouseEnter={() => setHoverRating(i)}
          onMouseLeave={() => setHoverRating(0)}
          style={{
            background: "transparent",
            border: "none",
            fontSize: 32,
            cursor: "pointer",
            color: i <= currentRating ? C.gold : "#E5E7EB",
            transition: "all 0.2s",
            padding: "2px",
            transform: i <= currentRating ? "scale(1.1)" : "scale(1)",
          }}
        >
          <FontAwesomeIcon icon={faStar} />
        </button>
      );
    }
    return stars;
  };

  const ratingLabels = {
    1: "😕 Needs Improvement",
    2: "🤔 Okay",
    3: "👍 Good",
    4: "😊 Very Good",
    5: "🌟 Excellent!"
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
        animation: "fadeIn 0.3s ease",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: C.white,
          borderRadius: "24px",
          padding: "36px 32px 32px",
          maxWidth: "500px",
          width: "100%",
          position: "relative",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {submitted ? (
          <div style={{ textAlign: "center", padding: "30px 0" }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
            <h2 style={{ fontSize: 22, color: C.maroonDark, marginBottom: 6 }}>
              Thank You!
            </h2>
            <p style={{ color: C.textMid, fontSize: 14, lineHeight: 1.6 }}>
              Your feedback helps us improve and serve you better.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                localStorage.removeItem("feedback_submitted");
                onClose();
              }}
              style={{
                marginTop: 16,
                padding: "10px 24px",
                borderRadius: 30,
                border: `2px solid ${C.maroon}`,
                backgroundColor: "transparent",
                color: C.maroon,
                fontSize: 14,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = C.maroon;
                e.target.style.color = C.goldLight;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
                e.target.style.color = C.maroon;
              }}
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={onClose}
              style={{
                position: "absolute",
                top: "16px",
                right: "18px",
                backgroundColor: "transparent",
                border: "none",
                fontSize: "22px",
                cursor: "pointer",
                color: C.textLight,
                opacity: 0.6,
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                e.target.style.opacity = 1;
                e.target.style.transform = "rotate(90deg)";
              }}
              onMouseLeave={(e) => {
                e.target.style.opacity = 0.6;
                e.target.style.transform = "rotate(0)";
              }}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>

            <h2
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: C.maroonDark,
                marginBottom: "6px",
                fontFamily: "'Georgia', serif",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <FontAwesomeIcon icon={faComment} style={{ color: C.gold }} />
              Share Your Experience
            </h2>
            <p
              style={{
                fontSize: "13px",
                color: C.textLight,
                marginBottom: "20px",
              }}
            >
              Your feedback helps us create better products for you.
            </p>

            <form onSubmit={handleSubmit}>
              {/* Name & Email */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, color: C.textMid, display: "block", marginBottom: 4 }}>
                    <FontAwesomeIcon icon={faUser} style={{ marginRight: 6, fontSize: 12 }} />
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: `2px solid ${C.goldPale}`,
                      fontSize: "13px",
                      fontFamily: "inherit",
                      outline: "none",
                      backgroundColor: C.whiteOff,
                      transition: "border-color 0.2s",
                    }}
                    onFocus={(e) => e.target.style.borderColor = C.maroon}
                    onBlur={(e) => e.target.style.borderColor = C.goldPale}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, color: C.textMid, display: "block", marginBottom: 4 }}>
                    <FontAwesomeIcon icon={faEnvelope} style={{ marginRight: 6, fontSize: 12 }} />
                    Email *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: `2px solid ${C.goldPale}`,
                      fontSize: "13px",
                      fontFamily: "inherit",
                      outline: "none",
                      backgroundColor: C.whiteOff,
                      transition: "border-color 0.2s",
                    }}
                    onFocus={(e) => e.target.style.borderColor = C.maroon}
                    onBlur={(e) => e.target.style.borderColor = C.goldPale}
                    required
                  />
                </div>
              </div>

              {/* Rating Section */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: C.textMid, display: "block", marginBottom: 6 }}>
                  How would you rate your experience?
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {renderStars()}
                  {rating > 0 && (
                    <span style={{ fontSize: 14, color: C.textMid, marginLeft: 8 }}>
                      {ratingLabels[rating]}
                    </span>
                  )}
                </div>
              </div>

              {/* Category Section */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: C.textMid, display: "block", marginBottom: 4 }}>
                  <FontAwesomeIcon icon={faTag} style={{ marginRight: 6, fontSize: 12 }} />
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: `2px solid ${C.goldPale}`,
                    fontSize: "13px",
                    fontFamily: "inherit",
                    outline: "none",
                    backgroundColor: C.whiteOff,
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => e.target.style.borderColor = C.maroon}
                  onBlur={(e) => e.target.style.borderColor = C.goldPale}
                >
                  <option value="general">General Feedback</option>
                  <option value="product">Product Quality</option>
                  <option value="delivery">Delivery Experience</option>
                  <option value="service">Customer Service</option>
                  <option value="website">Website Experience</option>
                </select>
              </div>

              {/* Comment Section */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: C.textMid, display: "block", marginBottom: 4 }}>
                  Your Review *
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  placeholder="Tell us about your experience with Gleamwave..."
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: `2px solid ${C.goldPale}`,
                    fontSize: "13px",
                    fontFamily: "inherit",
                    outline: "none",
                    backgroundColor: C.whiteOff,
                    resize: "vertical",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => e.target.style.borderColor = C.maroon}
                  onBlur={(e) => e.target.style.borderColor = C.goldPale}
                  required
                />
                <div style={{ fontSize: 12, color: C.textLight, marginTop: 4 }}>
                  {comment.length < 10 && comment.length > 0 ? 
                    `Please write at least ${10 - comment.length} more characters` : 
                    comment.length >= 10 ? "✅ Good length!" : ""}
                </div>
              </div>

              {error && (
                <div
                  style={{
                    backgroundColor: "#FEE2E2",
                    color: "#991B1B",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    fontSize: 13,
                    marginBottom: 14,
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "12px",
                  border: "none",
                  backgroundColor: C.maroon,
                  color: C.goldLight,
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: submitting ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.3s",
                  opacity: submitting ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!submitting) {
                    e.target.style.backgroundColor = C.maroonDark;
                    e.target.style.transform = "scale(1.02)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!submitting) {
                    e.target.style.backgroundColor = C.maroon;
                    e.target.style.transform = "scale(1)";
                  }
                }}
              >
                {submitting ? "Submitting..." : "Submit Feedback"}
              </button>

              <p
                style={{
                  textAlign: "center",
                  fontSize: "11px",
                  color: C.textLight,
                  marginTop: "10px",
                }}
              >
                Your feedback will be reviewed before being published.
              </p>
            </form>
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}