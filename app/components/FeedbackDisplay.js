"use client";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faEnvelope, faCalendar, faCheckCircle, faClock, faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
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

export default function FeedbackDisplay() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [visibleCount, setVisibleCount] = useState(6);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    fetchFeedbacks();
    fetchStats();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const response = await fetch(`${API_URL}/feedback`);
      if (!response.ok) throw new Error("Failed to fetch feedback");
      const data = await response.json();
      // Only show approved feedback
      const approvedFeedbacks = data.filter(fb => fb.is_approved === true);
      setFeedbacks(approvedFeedbacks);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/feedback/stats`);
      if (!response.ok) throw new Error("Failed to fetch stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const toggleExpand = (id) => {
    setExpanded(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const loadMore = () => {
    setVisibleCount(prev => prev + 6);
  };

  const loadLess = () => {
    setVisibleCount(6);
  };

  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <FontAwesomeIcon 
        key={i}
        icon={faStar} 
        style={{
          color: i < rating ? C.gold : "#E5E7EB",
          fontSize: 14,
          marginRight: 2,
        }}
      />
    ));
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case 'product': return '#3B82F6';
      case 'delivery': return '#8B5CF6';
      case 'service': return '#10B981';
      case 'website': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getCategoryLabel = (category) => {
    switch(category) {
      case 'product': return 'Product Quality';
      case 'delivery': return 'Delivery Experience';
      case 'service': return 'Customer Service';
      case 'website': return 'Website Experience';
      default: return 'General Feedback';
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <div style={{ 
          width: 40, 
          height: 40, 
          border: `4px solid ${C.goldPale}`,
          borderTop: `4px solid ${C.maroon}`,
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          margin: "0 auto",
        }} />
        <p style={{ marginTop: 16, color: C.textLight }}>Loading feedback...</p>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: C.maroon }}>
        <p>Failed to load feedback. Please try again later.</p>
      </div>
    );
  }

  if (feedbacks.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: C.textLight }}>
        <h3 style={{ fontSize: 20, color: C.textMid }}>No feedback yet</h3>
        <p>Be the first to share your experience!</p>
      </div>
    );
  }

  const visibleFeedbacks = feedbacks.slice(0, visibleCount);
  const hasMore = visibleCount < feedbacks.length;

  return (
    <div>
      {/* Stats Summary */}
      {stats && stats.approved > 0 && (
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: 40,
          flexWrap: "wrap",
          marginBottom: 32,
          padding: "20px",
          backgroundColor: C.whiteOff,
          borderRadius: 16,
          border: `2px solid ${C.goldPale}`,
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: C.maroonDark }}>
              {stats.average_rating || 0}
            </div>
            <div style={{ fontSize: 13, color: C.textLight }}>Average Rating</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: C.maroonDark }}>
              {stats.approved || 0}
            </div>
            <div style={{ fontSize: 13, color: C.textLight }}>Total Reviews</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: C.maroonDark }}>
              {stats.pending || 0}
            </div>
            <div style={{ fontSize: 13, color: C.textLight }}>Pending Approval</div>
          </div>
        </div>
      )}

      {/* Feedback Cards Grid - Single Row */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", 
        gap: 24,
        marginBottom: 24,
      }}>
        {visibleFeedbacks.map((fb) => (
          <div
            key={fb.id}
            style={{
              backgroundColor: C.white,
              borderRadius: 16,
              padding: "20px 24px",
              border: `2px solid ${C.goldPale}`,
              transition: "all 0.3s ease",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              display: "flex",
              flexDirection: "column",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)";
            }}
          >
            {/* User Info */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                backgroundColor: C.goldPale,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                fontWeight: 600,
                color: C.maroonDark,
                flexShrink: 0,
              }}>
                {fb.user?.name ? fb.user.name.charAt(0).toUpperCase() : fb.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: C.maroonDark, fontSize: 15 }}>
                  {fb.user?.name || fb.name}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.textLight }}>
                  <FontAwesomeIcon icon={faEnvelope} style={{ fontSize: 10 }} />
                  <span>{fb.user?.email || fb.email}</span>
                </div>
              </div>
            </div>

            {/* Rating */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              {renderStars(fb.rating)}
              <span style={{ fontSize: 13, color: C.textMid, fontWeight: 600 }}>
                {fb.rating}.0
              </span>
            </div>

            {/* Category Badge */}
            <div style={{ marginBottom: 10 }}>
              <span style={{
                backgroundColor: getCategoryColor(fb.category) + "22",
                color: getCategoryColor(fb.category),
                padding: "4px 12px",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 600,
              }}>
                {getCategoryLabel(fb.category)}
              </span>
            </div>

            {/* Comment with Read More */}
            <div style={{ flex: 1 }}>
              <p style={{
                color: C.textMid,
                fontSize: 14,
                lineHeight: 1.6,
                marginBottom: 8,
              }}>
                {expanded[fb.id] ? `"${fb.comment}"` : `"${fb.comment.substring(0, 100)}${fb.comment.length > 100 ? '...' : ''}"`}
              </p>
              {fb.comment.length > 100 && (
                <button
                  onClick={() => toggleExpand(fb.id)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: C.gold,
                    fontSize: 12,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    padding: 0,
                    transition: "color 0.3s",
                  }}
                  onMouseEnter={(e) => e.target.style.color = C.maroon}
                  onMouseLeave={(e) => e.target.style.color = C.gold}
                >
                  {expanded[fb.id] ? 'Read Less ▲' : 'Read More ▼'}
                </button>
              )}
            </div>

            {/* Date */}
            <div style={{
              fontSize: 11,
              color: C.textLight,
              marginTop: 12,
              paddingTop: 12,
              borderTop: `1px solid ${C.goldPale}`,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}>
              <FontAwesomeIcon icon={faCalendar} style={{ fontSize: 10 }} />
              {fb.created_at}
              <span style={{ marginLeft: "auto" }}>
                {fb.is_approved ? (
                  <span style={{ color: "#10B981" }}>
                    <FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: 4 }} />
                    Verified
                  </span>
                ) : (
                  <span style={{ color: "#F59E0B" }}>
                    <FontAwesomeIcon icon={faClock} style={{ marginRight: 4 }} />
                    Pending
                  </span>
                )}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Load More / Show Less Buttons */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: 16,
        marginTop: 16,
      }}>
        {hasMore && (
          <button
            onClick={loadMore}
            style={{
              padding: "12px 32px",
              borderRadius: 30,
              border: `2px solid ${C.maroon}`,
              backgroundColor: "transparent",
              color: C.maroon,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = C.maroon;
              e.target.style.color = C.goldLight;
              e.target.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent";
              e.target.style.color = C.maroon;
              e.target.style.transform = "scale(1)";
            }}
          >
            <FontAwesomeIcon icon={faChevronDown} />
            Load More ({feedbacks.length - visibleCount} remaining)
          </button>
        )}
        
        {visibleCount > 6 && (
          <button
            onClick={loadLess}
            style={{
              padding: "12px 32px",
              borderRadius: 30,
              border: `2px solid ${C.goldPale}`,
              backgroundColor: "transparent",
              color: C.textLight,
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = C.maroon;
              e.target.style.color = C.maroon;
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = C.goldPale;
              e.target.style.color = C.textLight;
            }}
          >
            <FontAwesomeIcon icon={faChevronUp} />
            Show Less
          </button>
        )}
      </div>
    </div>
  );
}