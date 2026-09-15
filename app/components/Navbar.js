"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faShoppingCart,
  faRightFromBracket,
  faUserCircle,
  faGauge,
} from "@fortawesome/free-solid-svg-icons";
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

export default function Navbar({
  activePage = "home",
  user: userProp,
  onMenuClick,
  onLoginClick,
  onLogoutClick,
}) {
  const router = useRouter();
  const [localUser, setLocalUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ✅ Use prop user if provided, otherwise use local state
  const user = userProp !== undefined ? userProp : localUser;

  // ─── LOAD USER & CART ───
  useEffect(() => {
    const loadUserAndCart = async () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (userProp === undefined) {
        if (token && userData) {
          setLocalUser(JSON.parse(userData));
        } else {
          setLocalUser(null);
        }
      }

      if (token) {
        try {
          const res = await fetch(`${API_URL}/cart`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            setCartCount((data.items || []).length);
          } else {
            setCartCount(0);
          }
        } catch (e) {
          console.error("Cart load error:", e);
          setCartCount(0);
        }
      } else {
        const guestCart = JSON.parse(localStorage.getItem("guest_cart") || "[]");
        const totalItems = guestCart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        setCartCount(totalItems);
      }
    };

    loadUserAndCart();

    const handleCartUpdate = () => loadUserAndCart();
    window.addEventListener("cartUpdated", handleCartUpdate);
    window.addEventListener("storage", handleCartUpdate);
    window.addEventListener("userUpdated", handleCartUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
      window.removeEventListener("storage", handleCartUpdate);
      window.removeEventListener("userUpdated", handleCartUpdate);
    };
  }, [userProp]);

  // ─── CLOSE DROPDOWN ON OUTSIDE CLICK ───
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navLinks = [
    { label: "Home", path: "/", key: "home" },
    { label: "Shop", path: "/products", key: "shop" },
    { label: "Contact", path: "/contact", key: "contact" },
  ];

  // ─── HANDLE USER ICON CLICK ───
  const handleUserIconClick = () => {
    if (!user) {
      if (onLoginClick) onLoginClick();
    } else {
      setDropdownOpen(!dropdownOpen);
    }
  };

  // ─── HANDLE LOGOUT FROM DROPDOWN ───
  const handleDropdownLogout = () => {
    setDropdownOpen(false);
    if (onLogoutClick) onLogoutClick();
  };

  return (
    <>
      <nav
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          backgroundColor: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(12px)",
          borderBottom: `2px solid ${C.goldPale}`,
          padding: "0 24px",
        }}
      >
        <div
          style={{
            maxWidth: 1100, margin: "0 auto",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            height: 68,
          }}
        >
          {/* ═══════ LEFT: MENU + LOGO ═══════ */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {onMenuClick && (
              <button
                id="menu-button"
                onClick={onMenuClick}
                style={{
                  backgroundColor: "transparent", border: "none",
                  cursor: "pointer", display: "flex", flexDirection: "column",
                  gap: "5px", padding: "8px 6px", borderRadius: "8px",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = C.goldPale)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <span style={{ display: "block", width: "26px", height: "3px", backgroundColor: C.maroon, borderRadius: "4px" }}></span>
                <span style={{ display: "block", width: "26px", height: "3px", backgroundColor: C.maroon, borderRadius: "4px" }}></span>
                <span style={{ display: "block", width: "26px", height: "3px", backgroundColor: C.maroon, borderRadius: "4px" }}></span>
              </button>
            )}

            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
              <div
                style={{
                  width: 44, height: 44, borderRadius: "50%",
                  overflow: "hidden", border: `2px solid ${C.gold}`,
                  backgroundColor: C.white, display: "flex",
                  alignItems: "center", justifyContent: "center",
                  flexShrink: 0, boxShadow: `0 2px 8px ${C.gold}40`,
                }}
              >
                <img
                  src="/images/categories/logo.jpg"
                  alt="gleamwave"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.style.display = "none";
                    const parent = e.target.parentElement;
                    parent.style.backgroundColor = C.maroon;
                    parent.style.color = C.goldLight;
                    parent.style.fontSize = "18px";
                    parent.style.fontWeight = "700";
                    parent.textContent = "G";
                  }}
                />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 22, fontWeight: 700, letterSpacing: "0.12em",
                    color: C.maroon, lineHeight: 1.1,
                  }}
                >
                  gleamwave
                </div>
                <div
                  style={{
                    fontSize: 8, letterSpacing: "0.35em", color: C.gold,
                    textTransform: "uppercase", marginTop: 1,
                  }}
                >
                  Handcrafted Resin Art
                </div>
              </div>
            </Link>
          </div>

          {/* ═══════ RIGHT: NAV LINKS + USER + CART ═══════ */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                display: "flex", gap: 28, fontSize: 13,
                letterSpacing: "0.1em", alignItems: "center",
              }}
              className="hidden-mobile"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.key}
                  href={link.path}
                  style={{
                    color: activePage === link.key ? C.maroon : C.textMid,
                    textDecoration: "none",
                    fontWeight: activePage === link.key ? 600 : 400,
                    transition: "color 0.2s",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* ═══════ USER ICON WITH DROPDOWN ═══════ */}
            <div style={{ position: "relative" }} ref={dropdownRef}>
              <button
                onClick={handleUserIconClick}
                style={{
                  backgroundColor: dropdownOpen ? C.maroon : "transparent",
                  border: `2px solid ${C.maroon}`,
                  borderRadius: "50%",
                  width: 42,
                  height: 42,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = C.maroon;
                }}
                onMouseLeave={(e) => {
                  if (!dropdownOpen) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                <FontAwesomeIcon
                  icon={faUser}
                  style={{ fontSize: 16, color: dropdownOpen ? "#fff" : C.maroon }}
                />
              </button>

              {/* ═══════ DROPDOWN MENU ═══════ */}
              {dropdownOpen && user && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 12px)",
                    right: 0,
                    minWidth: 240,
                    backgroundColor: C.white,
                    borderRadius: 14,
                    border: `2px solid ${C.goldPale}`,
                    boxShadow: "0 8px 32px rgba(74,46,34,0.18)",
                    overflow: "hidden",
                    zIndex: 200,
                    animation: "dropdownFade 0.2s ease",
                  }}
                >
                  {/* User Info Header */}
                  <div
                    style={{
                      padding: "16px 18px",
                      backgroundColor: C.whiteOff,
                      borderBottom: `1px solid ${C.goldPale}`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: C.maroonDark,
                        marginBottom: 2,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {user.name}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: C.textLight,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {user.email}
                    </div>
                  </div>

                  {/* My Profile */}
                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 18px",
                      color: C.textMid,
                      textDecoration: "none",
                      fontSize: 14,
                      transition: "all 0.2s",
                      borderBottom: `1px solid ${C.goldPale}`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = C.goldPale;
                      e.currentTarget.style.color = C.maroon;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = C.textMid;
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faUserCircle}
                      style={{ fontSize: 16, color: C.gold, width: 18 }}
                    />
                    My Profile
                  </Link>

                  {/* Admin Dashboard (Only for Admin) */}
                  {user?.role === "admin" && (
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "12px 18px",
                        color: C.textMid,
                        textDecoration: "none",
                        fontSize: 14,
                        transition: "all 0.2s",
                        borderBottom: `1px solid ${C.goldPale}`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = C.goldPale;
                        e.currentTarget.style.color = C.maroon;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = C.textMid;
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faGauge}
                        style={{ fontSize: 16, color: C.gold, width: 18 }}
                      />
                      Admin Dashboard
                    </Link>
                  )}

                  {/* Logout */}
                  <button
                    onClick={handleDropdownLogout}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      width: "100%",
                      textAlign: "left",
                      padding: "12px 18px",
                      backgroundColor: "transparent",
                      border: "none",
                      color: C.maroon,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = C.maroon;
                      e.currentTarget.style.color = C.goldLight;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = C.maroon;
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faRightFromBracket}
                      style={{ fontSize: 16, width: 18 }}
                    />
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* ═══════ CART ═══════ */}
            <Link href="/cart" style={{ textDecoration: "none" }}>
              <div style={{ position: "relative", cursor: "pointer" }}>
                <FontAwesomeIcon
                  icon={faShoppingCart}
                  style={{ fontSize: 22, color: C.maroon }}
                />
                {cartCount > 0 && (
                  <span
                    style={{
                      position: "absolute", top: -6, right: -6,
                      backgroundColor: C.maroon, color: C.goldLight,
                      borderRadius: "50%", width: 18, height: 18,
                      fontSize: 10, display: "flex", alignItems: "center",
                      justifyContent: "center", fontWeight: 700,
                    }}
                  >
                    {cartCount}
                  </span>
                )}
              </div>
            </Link>
          </div>
        </div>
      </nav>

      <style>{`
        .hidden-mobile { display: flex; }
        @media (max-width: 800px) {
          .hidden-mobile { display: none !important; }
        }

        @keyframes dropdownFade {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}