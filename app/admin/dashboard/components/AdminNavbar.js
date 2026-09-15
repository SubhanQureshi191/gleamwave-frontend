"use client";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faHouse,
  faTableColumns,
  faBagShopping,
  faBox,
  faComments,
} from "@fortawesome/free-solid-svg-icons";
import { C } from "@/lib/adminConstants";

export default function AdminNavbar({ activeTab, setActiveTab, pendingFeedbackCount, onMenuClick }) {
  const tabButtonStyle = (tab) => ({
    backgroundColor: "transparent",
    border: "none",
    color: activeTab === tab ? C.maroon : C.textMid,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: activeTab === tab ? 600 : 400,
    fontFamily: "inherit",
    borderBottom: activeTab === tab ? `2px solid ${C.maroon}` : "none",
    paddingBottom: "4px",
    display: "flex",
    alignItems: "center",
    gap: 6,
  });

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: "rgba(255,255,255,0.96)",
        backdropFilter: "blur(12px)",
        borderBottom: `2px solid ${C.goldPale}`,
        padding: "0 24px",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 68,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* ── HAMBURGER / SIDEBAR TOGGLE ── */}
          <button
            id="menu-button"
            onClick={onMenuClick}
            style={{
              backgroundColor: "transparent",
              border: "none",
              color: C.maroon,
              fontSize: 20,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 4,
            }}
            aria-label="Open menu"
          >
            <FontAwesomeIcon icon={faBars} />
          </button>

          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                overflow: "hidden",
                border: `2px solid ${C.gold}`,
                backgroundColor: C.goldLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <img
                src="/images/categories/logo.jpg"
                alt="gleamwave"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => {
                  e.target.style.display = "none";
                  const parent = e.target.parentElement;
                  parent.style.color = C.maroonDark;
                  parent.style.fontWeight = "700";
                  parent.style.fontSize = "16px";
                  parent.textContent = "G";
                }}
              />
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 700, color: C.maroon }}>gleamwave</div>
              <div style={{ fontSize: 9, color: C.gold, textTransform: "uppercase" }}>Admin Panel</div>
            </div>
          </Link>
        </div>

        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <Link
            href="/"
            style={{
              color: C.textMid,
              textDecoration: "none",
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <FontAwesomeIcon icon={faHouse} /> Home
          </Link>
          <button onClick={() => setActiveTab("dashboard")} style={tabButtonStyle("dashboard")}>
            <FontAwesomeIcon icon={faTableColumns} /> Dashboard
          </button>
          <button onClick={() => setActiveTab("products")} style={tabButtonStyle("products")}>
            <FontAwesomeIcon icon={faBagShopping} /> Products
          </button>
          <button onClick={() => setActiveTab("orders")} style={tabButtonStyle("orders")}>
            <FontAwesomeIcon icon={faBox} /> Orders
          </button>
          <button onClick={() => setActiveTab("feedback")} style={tabButtonStyle("feedback")}>
            <FontAwesomeIcon icon={faComments} /> Feedback ({pendingFeedbackCount})
          </button>
        </div>
      </div>
    </nav>
  );
}