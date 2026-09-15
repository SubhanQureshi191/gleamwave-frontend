"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faPhone,
  faLocationDot,
  faUser,
  faPaperPlane,
  faComment,
  faCircleCheck,
  faArrowRight,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import {
  faInstagram,
  faTiktok,
  faWhatsapp
} from "@fortawesome/free-brands-svg-icons";

// ── Components ──
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

// ─── BRAND COLORS (SAME AS REST OF WEBSITE) ───
const C = {
  white: "#FFFFFF",
  whiteOff: "#FDF8F3",
  snow: "#FDF6F0",
  blush: "#F3E9DE",
  blushDeep: "#E8D5BF",
  maroon: "#6F4E37",
  maroonDark: "#4A2E22",
  maroonLight: "#8B6F47",
  maroonPale: "#F0E6DA",
  gold: "#B8956A",
  goldLight: "#E8D9C0",
  goldPale: "#F5EDE0",
  goldDark: "#8B6F47",
  text: "#3D2B1F",
  textMid: "#6B4F3A",
  textLight: "#A08070",
};

export default function ContactPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      const u = JSON.parse(userData);
      setUser(u);
      setFormData((prev) => ({
        ...prev,
        name: u.name || "",
        email: u.email || "",
        phone: u.phone || "",
      }));
    }
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const message = `📩 *New Contact Form Message*

👤 Name: ${formData.name || "Not provided"}
📧 Email: ${formData.email || "Not provided"}
📱 Phone: ${formData.phone || "Not provided"}

📝 Message:
${formData.message || "No message provided"}

---
Sent from Gleamwave Website Contact Form`;

    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/923192206562?text=${encoded}`;
    window.open(url, "_blank");

    setLoading(false);
    setSubmitted(true);
    showToast("Message sent! We'll get back to you within 24 hours.");

    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      message: "",
    });
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setShowLogoutConfirm(false);
    showToast("Logged out successfully");
    router.push("/");
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <div style={{
      backgroundColor: C.white,
      color: C.text,
      fontFamily: "'Georgia', 'Times New Roman', serif",
      minHeight: "100vh",
    }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 24, right: 24, zIndex: 9999,
          backgroundColor: toast.type === "error" ? "#EF4444" : C.maroon,
          color: C.goldLight, padding: "12px 20px", borderRadius: 14,
          fontSize: 14, boxShadow: "0 8px 32px rgba(74,46,34,0.3)",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <FontAwesomeIcon icon={faCircleCheck} />
          {toast.msg}
        </div>
      )}

      {/* ─── SIDEBAR COMPONENT ─── */}
      <Sidebar
        isOpen={mobileMenu}
        onClose={() => setMobileMenu(false)}
        user={user}
        onLogoutClick={handleLogoutClick}
        onLoginClick={() => router.push("/")}
      />

      {/* ─── NAVBAR COMPONENT ─── */}
      <Navbar
        activePage="contact"
        onMenuClick={() => setMobileMenu(true)}
        onLoginClick={() => router.push("/")}
        onSignupClick={() => router.push("/")}
        onLogoutClick={handleLogoutClick}
      />

      {/* ─── LOGOUT CONFIRMATION MODAL ─── */}
      {showLogoutConfirm && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 2000, padding: "20px",
          }}
          onClick={cancelLogout}
        >
          <div
            style={{
              backgroundColor: C.white, borderRadius: "24px",
              padding: "40px 36px", maxWidth: "420px", width: "100%",
              textAlign: "center",
              boxShadow: "0 20px 60px rgba(74,46,34,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              backgroundColor: C.goldPale,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 24px",
              border: `3px solid ${C.gold}`,
            }}>
              <FontAwesomeIcon icon={faRightFromBracket} style={{ fontSize: 32, color: C.maroon }} />
            </div>

            <h2 style={{ fontSize: 24, fontWeight: 700, color: C.maroonDark, marginBottom: 12 }}>
              Confirm Logout
            </h2>

            <p style={{ fontSize: 15, color: C.textMid, lineHeight: 1.7, marginBottom: 32 }}>
              Are you sure you want to log out of your account?
              <br />
              <span style={{ fontSize: 13, color: C.textLight, marginTop: 6, display: "inline-block" }}>
                You'll need to login again to access your cart and orders.
              </span>
            </p>

            <div style={{ display: "flex", gap: 12, flexDirection: "column" }}>
              <button
                onClick={confirmLogout}
                style={{
                  width: "100%", padding: "14px", borderRadius: 12, border: "none",
                  background: `linear-gradient(135deg, ${C.maroon}, ${C.maroonDark})`,
                  color: C.goldLight, fontSize: 15, fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                <FontAwesomeIcon icon={faRightFromBracket} />
                Yes, Logout
              </button>
              <button
                onClick={cancelLogout}
                style={{
                  width: "100%", padding: "14px", borderRadius: 12,
                  border: `2px solid ${C.goldPale}`,
                  backgroundColor: "transparent", color: C.textMid,
                  fontSize: 15, fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ─── HERO HEADER (BROWN BACKGROUND LIKE FOOTER) ─── */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section style={{
        paddingTop: "140px",
        paddingBottom: "80px",
        paddingLeft: "24px",
        paddingRight: "24px",
        textAlign: "center",
        background: `linear-gradient(135deg, ${C.maroonDark}, ${C.maroon}, ${C.goldDark})`,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative circles */}
        <div style={{
          position: "absolute",
          top: "-50px",
          right: "-50px",
          width: 250,
          height: 250,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.goldLight}22, transparent 70%)`,
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute",
          bottom: "-80px",
          left: "-80px",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.goldLight}15, transparent 70%)`,
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 800, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{
            fontSize: 11,
            letterSpacing: "0.35em",
            color: C.gold,
            textTransform: "uppercase",
            marginBottom: 20,
            opacity: 0.9,
          }}>
            Get in Touch
          </div>
          <h1 style={{
            fontSize: "clamp(2.5rem, 5vw, 4rem)",
            fontWeight: 700,
            color: C.goldLight,
            margin: "0 0 8px",
            lineHeight: 1.1,
            fontFamily: "'Georgia', serif",
          }}>
            Let's start your
          </h1>
          <h1 style={{
            fontSize: "clamp(2.5rem, 5vw, 4rem)",
            fontWeight: 700,
            color: C.gold,
            margin: "0 0 24px",
            lineHeight: 1.1,
            fontFamily: "'Georgia', serif",
            fontStyle: "italic",
          }}>
            next project
          </h1>
          <p style={{
            fontSize: "clamp(1rem, 1.5vw, 1.15rem)",
            color: C.goldLight,
            opacity: 0.9,
            lineHeight: 1.7,
            maxWidth: 640,
            margin: "0 auto",
          }}>
            Share your idea and our team will respond within 24 hours with a
            free consultation and project estimate.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ─── MAIN CONTENT ─── */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section style={{ padding: "60px 24px 80px", backgroundColor: C.white }}>
        <div style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1.3fr",
          gap: 32,
          alignItems: "start",
        }} className="contact-grid">

          {/* LEFT: PREMIUM INFO CONTAINER */}
          <div style={{
            backgroundColor: C.whiteOff,
            borderRadius: 24,
            padding: "8px",
            border: `2px solid ${C.goldPale}`,
            boxShadow: `0 4px 24px rgba(74,46,34,0.06)`,
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: `linear-gradient(90deg, ${C.maroon}, ${C.gold}, ${C.maroon})`,
            }} />

            <div style={{
              padding: "32px 28px 28px",
            }}>
              <div style={{ marginBottom: 28, textAlign: "center" }}>
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 18px",
                  backgroundColor: C.goldPale,
                  borderRadius: 30,
                  marginBottom: 14,
                }}>
                  <FontAwesomeIcon icon={faEnvelope} style={{ fontSize: 12, color: C.maroon }} />
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.maroonDark,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                  }}>
                    Contact Info
                  </span>
                </div>
                <h3 style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: C.maroonDark,
                  margin: "0 0 6px",
                  fontFamily: "'Georgia', serif",
                }}>
                  Get in Touch
                </h3>
                <p style={{
                  fontSize: 13,
                  color: C.textLight,
                  margin: 0,
                  lineHeight: 1.6,
                }}>
                  Reach out through any of these channels
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                {/* Email Card */}
                <a
                  href="mailto:hello.gleamwave.pk@gmail.com"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "18px 20px",
                    backgroundColor: C.white,
                    borderRadius: 16,
                    border: `1px solid ${C.goldPale}`,
                    textDecoration: "none",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateX(6px)";
                    e.currentTarget.style.boxShadow = `0 8px 24px ${C.maroon}15`;
                    e.currentTarget.style.borderColor = C.gold;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateX(0)";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.borderColor = C.goldPale;
                  }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: `linear-gradient(135deg, ${C.maroon}, ${C.maroonDark})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: `0 4px 12px ${C.maroon}30`,
                  }}>
                    <FontAwesomeIcon icon={faEnvelope} style={{ fontSize: 18, color: C.goldLight }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 11,
                      color: C.textLight,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      fontWeight: 600,
                      marginBottom: 3,
                    }}>
                      Email Us
                    </div>
                    <div style={{
                      fontSize: 14,
                      color: C.maroonDark,
                      fontWeight: 600,
                      wordBreak: "break-all",
                    }}>
                      hello.gleamwave.pk@gmail.com
                    </div>
                  </div>
                  <FontAwesomeIcon
                    icon={faArrowRight}
                    style={{
                      fontSize: 12,
                      color: C.gold,
                      flexShrink: 0,
                    }}
                  />
                </a>

                {/* Call Card */}
                <a
                  href="tel:+923192206562"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "18px 20px",
                    backgroundColor: C.white,
                    borderRadius: 16,
                    border: `1px solid ${C.goldPale}`,
                    textDecoration: "none",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateX(6px)";
                    e.currentTarget.style.boxShadow = `0 8px 24px ${C.maroon}15`;
                    e.currentTarget.style.borderColor = C.gold;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateX(0)";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.borderColor = C.goldPale;
                  }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: `linear-gradient(135deg, ${C.maroon}, ${C.maroonDark})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: `0 4px 12px ${C.maroon}30`,
                  }}>
                    <FontAwesomeIcon icon={faPhone} style={{ fontSize: 18, color: C.goldLight }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 11,
                      color: C.textLight,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      fontWeight: 600,
                      marginBottom: 3,
                    }}>
                      Call Us
                    </div>
                    <div style={{
                      fontSize: 14,
                      color: C.maroonDark,
                      fontWeight: 600,
                    }}>
                      0319 2206562
                    </div>
                  </div>
                  <FontAwesomeIcon
                    icon={faArrowRight}
                    style={{
                      fontSize: 12,
                      color: C.gold,
                      flexShrink: 0,
                    }}
                  />
                </a>

                {/* Visit Card */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 16,
                    padding: "18px 20px",
                    backgroundColor: C.white,
                    borderRadius: 16,
                    border: `1px solid ${C.goldPale}`,
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateX(6px)";
                    e.currentTarget.style.boxShadow = `0 8px 24px ${C.maroon}15`;
                    e.currentTarget.style.borderColor = C.gold;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateX(0)";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.borderColor = C.goldPale;
                  }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: `linear-gradient(135deg, ${C.maroon}, ${C.maroonDark})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: `0 4px 12px ${C.maroon}30`,
                  }}>
                    <FontAwesomeIcon icon={faLocationDot} style={{ fontSize: 18, color: C.goldLight }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 11,
                      color: C.textLight,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      fontWeight: 600,
                      marginBottom: 6,
                    }}>
                      Visit Us
                    </div>
                    <div style={{
                      fontSize: 13,
                      color: C.textMid,
                      lineHeight: 1.7,
                    }}>
                      Islamabad, Pakistan<br />
                      Mon - Sat: 10 AM - 8 PM
                    </div>
                  </div>
                </div>
              </div>

              <div style={{
                marginTop: 24,
                padding: "14px 18px",
                backgroundColor: C.goldPale,
                borderRadius: 12,
                textAlign: "center",
                border: `1px dashed ${C.gold}55`,
              }}>
                <div style={{
                  fontSize: 12,
                  color: C.maroonDark,
                  lineHeight: 1.6,
                  fontWeight: 500,
                }}>
                  <FontAwesomeIcon icon={faCircleCheck} style={{ marginRight: 6, color: C.maroon }} />
                  We typically respond within 24 hours
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: FORM */}
          <div style={{
            backgroundColor: C.whiteOff,
            borderRadius: 24,
            padding: "40px 40px",
            border: `2px solid ${C.goldPale}`,
            boxShadow: `0 4px 24px rgba(74,46,34,0.06)`,
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: `linear-gradient(90deg, ${C.gold}, ${C.maroon}, ${C.gold})`,
            }} />

            {submitted ? (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <div style={{
                  width: 80, height: 80, borderRadius: "50%",
                  backgroundColor: C.goldPale,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 24px",
                  border: `3px solid ${C.gold}`,
                }}>
                  <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: 36, color: C.maroon }} />
                </div>
                <h2 style={{
                  fontSize: 24, fontWeight: 700, color: C.maroonDark,
                  marginBottom: 12, fontFamily: "'Georgia', serif",
                }}>
                  Message Sent!
                </h2>
                <p style={{
                  fontSize: 15, color: C.textMid, lineHeight: 1.7, marginBottom: 24,
                }}>
                  Thank you for reaching out. We'll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  style={{
                    padding: "12px 32px", borderRadius: 12, border: "none",
                    backgroundColor: C.maroon, color: C.goldLight,
                    fontSize: 14, fontWeight: 600, cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 28, textAlign: "center" }}>
                  <h3 style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: C.maroonDark,
                    margin: "0 0 6px",
                    fontFamily: "'Georgia', serif",
                  }}>
                    Send us a Message
                  </h3>
                  <p style={{
                    fontSize: 13,
                    color: C.textLight,
                    margin: 0,
                  }}>
                    Fill out the form below and we'll get back to you
                  </p>
                </div>

                <div style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr",
                  gap: 16, marginBottom: 16,
                }} className="form-row">
                  <div style={{ position: "relative" }}>
                    <FontAwesomeIcon icon={faUser} style={{
                      position: "absolute", left: 18, top: "50%",
                      transform: "translateY(-50%)", color: C.gold, fontSize: 14,
                    }} />
                    <input
                      type="text" name="name" placeholder="Full Name"
                      value={formData.name} onChange={handleChange} required
                      style={{
                        width: "100%", padding: "16px 18px 16px 48px",
                        borderRadius: 12, border: `2px solid ${C.goldPale}`,
                        backgroundColor: C.white, color: C.text,
                        fontSize: 14, fontFamily: "inherit",
                        outline: "none", boxSizing: "border-box",
                        transition: "border-color 0.2s",
                      }}
                      onFocus={(e) => e.target.style.borderColor = C.gold}
                      onBlur={(e) => e.target.style.borderColor = C.goldPale}
                    />
                  </div>
                  <div style={{ position: "relative" }}>
                    <FontAwesomeIcon icon={faEnvelope} style={{
                      position: "absolute", left: 18, top: "50%",
                      transform: "translateY(-50%)", color: C.gold, fontSize: 14,
                    }} />
                    <input
                      type="email" name="email" placeholder="Email Address"
                      value={formData.email} onChange={handleChange} required
                      style={{
                        width: "100%", padding: "16px 18px 16px 48px",
                        borderRadius: 12, border: `2px solid ${C.goldPale}`,
                        backgroundColor: C.white, color: C.text,
                        fontSize: 14, fontFamily: "inherit",
                        outline: "none", boxSizing: "border-box",
                        transition: "border-color 0.2s",
                      }}
                      onFocus={(e) => e.target.style.borderColor = C.gold}
                      onBlur={(e) => e.target.style.borderColor = C.goldPale}
                    />
                  </div>
                </div>

                <div style={{ position: "relative", marginBottom: 16 }}>
                  <FontAwesomeIcon icon={faPhone} style={{
                    position: "absolute", left: 18, top: "50%",
                    transform: "translateY(-50%)", color: C.gold, fontSize: 14,
                  }} />
                  <input
                    type="tel" name="phone" placeholder="Phone (optional)"
                    value={formData.phone} onChange={handleChange}
                    style={{
                      width: "100%", padding: "16px 18px 16px 48px",
                      borderRadius: 12, border: `2px solid ${C.goldPale}`,
                      backgroundColor: C.white, color: C.text,
                      fontSize: 14, fontFamily: "inherit",
                      outline: "none", boxSizing: "border-box",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={(e) => e.target.style.borderColor = C.gold}
                    onBlur={(e) => e.target.style.borderColor = C.goldPale}
                  />
                </div>

                <div style={{ position: "relative", marginBottom: 24 }}>
                  <FontAwesomeIcon icon={faComment} style={{
                    position: "absolute", left: 18, top: 20,
                    color: C.gold, fontSize: 14,
                  }} />
                  <textarea
                    name="message" placeholder="Tell us about your project"
                    value={formData.message} onChange={handleChange}
                    required rows={6}
                    style={{
                      width: "100%", padding: "16px 18px 16px 48px",
                      borderRadius: 12, border: `2px solid ${C.goldPale}`,
                      backgroundColor: C.white, color: C.text,
                      fontSize: 14, fontFamily: "inherit",
                      outline: "none", boxSizing: "border-box",
                      resize: "vertical",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={(e) => e.target.style.borderColor = C.gold}
                    onBlur={(e) => e.target.style.borderColor = C.goldPale}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%", padding: "18px", borderRadius: 14,
                    border: "none",
                    background: `linear-gradient(135deg, ${C.maroon}, ${C.maroonDark})`,
                    color: C.goldLight,
                    fontSize: 15, fontWeight: 700,
                    letterSpacing: "0.05em",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontFamily: "'Georgia', serif",
                    transition: "all 0.3s ease",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    gap: 12, boxShadow: `0 4px 20px ${C.maroon}40`,
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow = `0 8px 32px ${C.maroon}60`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = `0 4px 20px ${C.maroon}40`;
                  }}
                >
                  <FontAwesomeIcon icon={faPaperPlane} />
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ─── FOOTER ─── */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <footer style={{
        background: `linear-gradient(135deg, ${C.maroonDark}, ${C.maroon}, ${C.goldDark})`,
        color: C.goldLight,
        paddingTop: 60,
        paddingBottom: 0,
      }}>
        <div style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 24px",
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1.5fr 1fr 1fr 1fr",
            gap: 48,
            paddingBottom: 48,
          }} className="footer-grid">

            <div>
              <Link href="/" style={{ textDecoration: "none" }}>
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 20,
                }}>
                  <div style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: `2px solid ${C.gold}`,
                    backgroundColor: C.white,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 4px 16px ${C.gold}40`,
                  }}>
                    <img
                      src="/images/categories/logo.jpg"
                      alt="Gleamwave Logo"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => {
                        e.target.style.display = "none";
                        const parent = e.target.parentElement;
                        parent.style.backgroundColor = C.goldLight;
                        parent.style.color = C.maroonDark;
                        parent.style.fontSize = "22px";
                        parent.style.fontWeight = "700";
                        parent.textContent = "G";
                      }}
                    />
                  </div>
                  <div>
                    <div style={{
                      fontSize: 22,
                      fontWeight: 700,
                      color: C.goldLight,
                      letterSpacing: "0.12em",
                      lineHeight: 1.1,
                    }}>
                      gleamwave
                    </div>
                    <div style={{
                      fontSize: 9,
                      color: C.gold,
                      letterSpacing: "0.35em",
                      textTransform: "uppercase",
                      marginTop: 2,
                    }}>
                      Handcrafted Resin Art
                    </div>
                  </div>
                </div>
              </Link>

              <p style={{
                fontSize: 14,
                color: C.goldLight,
                opacity: 0.85,
                lineHeight: 1.7,
                marginBottom: 24,
              }}>
                We craft premium resin art pieces that preserve your memories
                and elevate your space. Every piece is handmade with love.
              </p>

              <div style={{ display: "flex", gap: 12 }}>
                {[
                  { icon: faInstagram, url: "https://www.instagram.com/gleam0_0wave?igsh=MWRpeWNyM3V5b3M2OA==" },
                  { icon: faTiktok, url: "https://www.tiktok.com/@gleam_wave?_r=1&_t=ZS-97mLVqUy11I" },
                  { icon: faWhatsapp, url: "https://wa.me/923192206562" },
                ].map((social, idx) => (
                  <a
                    key={idx}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 10,
                      backgroundColor: "rgba(255,255,255,0.1)",
                      border: `2px solid ${C.goldLight}30`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: C.goldLight,
                      textDecoration: "none",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = C.goldLight;
                      e.currentTarget.style.borderColor = C.goldLight;
                      e.currentTarget.style.color = C.maroonDark;
                      e.currentTarget.style.transform = "translateY(-3px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                      e.currentTarget.style.borderColor = `${C.goldLight}30`;
                      e.currentTarget.style.color = C.goldLight;
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <FontAwesomeIcon icon={social.icon} style={{ fontSize: 16 }} />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 style={{
                fontSize: 13,
                fontWeight: 700,
                color: C.goldLight,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                marginBottom: 20,
              }}>
                Shop
              </h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { label: "Resin Rings", href: "/products?category=Resin Rings" },
                  { label: "Resin Jhumkas", href: "/products?category=Resin Jhumkas" },
                  { label: "Resin Trays", href: "/products?category=Resin Trays" },
                  { label: "Silk Bouquets", href: "/products?category=Silk Bouquet" },
                  { label: "All Products", href: "/products" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      style={{
                        fontSize: 14,
                        color: C.goldLight,
                        opacity: 0.85,
                        textDecoration: "none",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.opacity = "1";
                        e.target.style.paddingLeft = "4px";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.opacity = "0.85";
                        e.target.style.paddingLeft = "0";
                      }}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 style={{
                fontSize: 13,
                fontWeight: 700,
                color: C.goldLight,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                marginBottom: 20,
              }}>
                Company
              </h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { label: "About Us", href: "/about" },
                  { label: "Contact Us", href: "/contact" },
                  { label: "My Account", href: "/profile" },
                  { label: "My Orders", href: "/profile" },
                  { label: "Cart", href: "/cart" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      style={{
                        fontSize: 14,
                        color: C.goldLight,
                        opacity: 0.85,
                        textDecoration: "none",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.opacity = "1";
                        e.target.style.paddingLeft = "4px";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.opacity = "0.85";
                        e.target.style.paddingLeft = "0";
                      }}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 style={{
                fontSize: 13,
                fontWeight: 700,
                color: C.goldLight,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                marginBottom: 20,
              }}>
                Contact
              </h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                <li>
                  <a
                    href="mailto:hello.gleamwave.pk@gmail.com"
                    style={{
                      fontSize: 14,
                      color: C.goldLight,
                      opacity: 0.85,
                      textDecoration: "none",
                      transition: "all 0.2s",
                      wordBreak: "break-all",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.opacity = "1";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.opacity = "0.85";
                    }}
                  >
                    hello.gleamwave.pk@gmail.com
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+923192206562"
                    style={{
                      fontSize: 14,
                      color: C.goldLight,
                      opacity: 0.85,
                      textDecoration: "none",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.opacity = "1";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.opacity = "0.85";
                    }}
                  >
                    0319 2206562
                  </a>
                </li>
                <li style={{
                  fontSize: 14,
                  color: C.goldLight,
                  opacity: 0.85,
                  lineHeight: 1.6,
                }}>
                  Islamabad, Pakistan
                </li>
              </ul>

              <Link href="/products" style={{ textDecoration: "none" }}>
                <button style={{
                  marginTop: 20,
                  padding: "12px 24px",
                  borderRadius: 30,
                  border: `2px solid ${C.goldLight}`,
                  backgroundColor: "transparent",
                  color: C.goldLight,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = C.goldLight;
                  e.currentTarget.style.color = C.maroonDark;
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = C.goldLight;
                  e.currentTarget.style.transform = "translateY(0)";
                }}
                >
                  Shop Now
                  <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 11 }} />
                </button>
              </Link>
            </div>
          </div>

          <div style={{
            borderTop: `1px solid ${C.goldLight}30`,
            padding: "24px 0",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }} className="footer-bottom">
            <div style={{
              fontSize: 13,
              color: C.goldLight,
              opacity: 0.7,
              textAlign: "center",
            }}>
              © 2025 Gleamwave. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 900px) {
          .contact-grid {
            grid-template-columns: 1fr !important;
          }
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 32px !important;
          }
        }
        @media (max-width: 600px) {
          .form-row {
            grid-template-columns: 1fr !important;
          }
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
          .footer-bottom {
            flex-direction: column !important;
            text-align: center !important;
          }
        }
      `}</style>
    </div>
  );
}