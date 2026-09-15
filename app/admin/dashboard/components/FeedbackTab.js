"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faCheckDouble,
  faRotate,
  faComments,
  faEnvelope,
  faCalendar,
  faStar,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { C, API_URL } from "@/lib/adminConstants";

// ─── Get Category Color ───
const getCategoryColor = (category) => {
  switch (category) {
    case "product":
      return "#3B82F6";
    case "delivery":
      return "#8B5CF6";
    case "service":
      return "#10B981";
    case "website":
      return "#F59E0B";
    default:
      return "#6B7280";
  }
};

// ─── Get Category Label ───
const getCategoryLabel = (category) => {
  switch (category) {
    case "product":
      return "Product Quality";
    case "delivery":
      return "Delivery Experience";
    case "service":
      return "Customer Service";
    case "website":
      return "Website Experience";
    default:
      return "General Feedback";
  }
};

const renderStars = (rating) => {
  return Array(5)
    .fill(0)
    .map((_, i) => (
      <FontAwesomeIcon
        key={i}
        icon={faStar}
        style={{ color: i < rating ? "#F59E0B" : "#E5E7EB", fontSize: 14, marginRight: 2 }}
      />
    ));
};

export default function FeedbackTab({
  feedbackList,
  feedbackStats,
  feedbackFilter,
  setFeedbackFilter,
  showToast,
  fetchFeedback,
  fetchFeedbackStats,
}) {
  // ─── Get Filtered Feedback ───
  const getFilteredFeedback = () => {
    if (feedbackFilter === "all") return feedbackList;
    if (feedbackFilter === "pending") return feedbackList.filter((f) => !f.is_approved);
    if (feedbackFilter === "approved") return feedbackList.filter((f) => f.is_approved);
    return feedbackList;
  };

  const filteredFeedback = getFilteredFeedback();

  // ─── Approve Feedback ───
  const approveFeedback = async (feedbackId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/admin/feedback/${feedbackId}/approve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to approve feedback");

      showToast("Feedback approved successfully!", "success");
      fetchFeedback();
      fetchFeedbackStats();
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  // ─── Delete Feedback ───
  const deleteFeedback = async (feedbackId) => {
    if (!confirm("Are you sure you want to delete this feedback?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/admin/feedback/${feedbackId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete feedback");

      showToast("Feedback deleted successfully!", "success");
      fetchFeedback();
      fetchFeedbackStats();
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 32,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ fontSize: "clamp(2rem, 3vw, 2.8rem)", fontWeight: 700, color: C.maroonDark }}>Customer Feedback</h1>
          <p style={{ color: C.textLight }}>
            {feedbackStats.total} total • {feedbackStats.pending} pending • {feedbackStats.approved} approved
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={() => setFeedbackFilter("all")}
            style={{
              padding: "8px 16px",
              borderRadius: 30,
              border: `2px solid ${feedbackFilter === "all" ? C.maroon : C.goldPale}`,
              backgroundColor: feedbackFilter === "all" ? C.maroon : "transparent",
              color: feedbackFilter === "all" ? C.goldLight : C.textMid,
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 12,
              transition: "all 0.2s",
            }}
          >
            All
          </button>
          <button
            onClick={() => setFeedbackFilter("pending")}
            style={{
              padding: "8px 16px",
              borderRadius: 30,
              border: `2px solid ${feedbackFilter === "pending" ? C.pending : C.goldPale}`,
              backgroundColor: feedbackFilter === "pending" ? C.pending : "transparent",
              color: feedbackFilter === "pending" ? "#fff" : C.textMid,
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 12,
              transition: "all 0.2s",
            }}
          >
            <FontAwesomeIcon icon={faClock} style={{ marginRight: 4 }} />
            Pending ({feedbackStats.pending})
          </button>
          <button
            onClick={() => setFeedbackFilter("approved")}
            style={{
              padding: "8px 16px",
              borderRadius: 30,
              border: `2px solid ${feedbackFilter === "approved" ? C.delivered : C.goldPale}`,
              backgroundColor: feedbackFilter === "approved" ? C.delivered : "transparent",
              color: feedbackFilter === "approved" ? "#fff" : C.textMid,
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 12,
              transition: "all 0.2s",
            }}
          >
            <FontAwesomeIcon icon={faCheckDouble} style={{ marginRight: 4 }} />
            Approved ({feedbackStats.approved})
          </button>
          <button
            onClick={() => {
              fetchFeedback();
              fetchFeedbackStats();
            }}
            style={{
              padding: "8px 16px",
              borderRadius: 30,
              border: `2px solid ${C.goldPale}`,
              backgroundColor: "transparent",
              color: C.textMid,
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 12,
              transition: "all 0.2s",
            }}
          >
            <FontAwesomeIcon icon={faRotate} /> Refresh
          </button>
        </div>
      </div>

      {filteredFeedback.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", backgroundColor: C.whiteOff, borderRadius: 24 }}>
          <FontAwesomeIcon icon={faComments} style={{ fontSize: 48, marginBottom: 16, color: C.textLight }} />
          <h3 style={{ fontSize: 20, color: C.textMid }}>No feedback found</h3>
          <p style={{ color: C.textLight }}>Customer feedback will appear here</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {filteredFeedback.map((fb) => (
            <div
              key={fb.id}
              style={{
                backgroundColor: C.whiteOff,
                borderRadius: 16,
                padding: "20px 24px",
                border: `1px solid ${fb.is_approved ? C.goldPale : C.pending + "44"}`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <div
                      style={{
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
                      }}
                    >
                      {fb.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: C.maroonDark, fontSize: 15 }}>{fb.name}</div>
                      <div style={{ fontSize: 12, color: C.textLight, display: "flex", alignItems: "center", gap: 6 }}>
                        <FontAwesomeIcon icon={faEnvelope} style={{ fontSize: 10 }} />
                        {fb.email}
                      </div>
                    </div>
                    <div
                      style={{
                        padding: "4px 14px",
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 600,
                        backgroundColor: fb.is_approved ? "#10B98122" : "#F59E0B22",
                        color: fb.is_approved ? "#10B981" : "#F59E0B",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <FontAwesomeIcon icon={fb.is_approved ? faCheckDouble : faClock} />
                      {fb.is_approved ? "Approved" : "Pending"}
                    </div>
                  </div>
                  <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
                    {renderStars(fb.rating)}
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.textMid }}>{fb.rating}.0</span>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: C.textLight }}>
                  <FontAwesomeIcon icon={faCalendar} style={{ marginRight: 4 }} />
                  {fb.created_at}
                </div>
              </div>

              <div
                style={{
                  marginTop: 12,
                  padding: "12px 16px",
                  backgroundColor: C.white,
                  borderRadius: 10,
                  border: `1px solid ${C.goldPale}`,
                }}
              >
                <p style={{ fontSize: 14, color: C.textMid, lineHeight: 1.6, margin: 0 }}>"{fb.comment}"</p>
              </div>

              <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <span
                  style={{
                    padding: "4px 12px",
                    borderRadius: 20,
                    fontSize: 11,
                    backgroundColor: getCategoryColor(fb.category) + "22",
                    color: getCategoryColor(fb.category),
                  }}
                >
                  {getCategoryLabel(fb.category)}
                </span>
                <div style={{ display: "flex", gap: 10 }}>
                  {!fb.is_approved && (
                    <button
                      onClick={() => approveFeedback(fb.id)}
                      style={{
                        padding: "8px 20px",
                        borderRadius: 30,
                        border: "none",
                        backgroundColor: C.delivered,
                        color: "#fff",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <FontAwesomeIcon icon={faCheckDouble} /> Approve
                    </button>
                  )}
                  <button
                    onClick={() => deleteFeedback(fb.id)}
                    style={{
                      padding: "8px 20px",
                      borderRadius: 30,
                      border: "none",
                      backgroundColor: "#EF4444",
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <FontAwesomeIcon icon={faTrashCan} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
