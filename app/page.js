"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ── Components ──
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import CustomOrderModal from "./components/CustomOrderModal";
import FeedbackButton from "./components/FeedbackButton";
import FeedbackDisplay from "./components/FeedbackDisplay";
import ForgotPasswordModal from "./components/ForgotPasswordModal";
import { API_URL } from "@/lib/config";

// ── Font Awesome Icons ─────────────────────────────────────────
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInstagram,
  faTiktok,
  faWhatsapp,
} from "@fortawesome/free-brands-svg-icons";
import {
  faShoppingCart,
  faUser,
  faUserPlus,
  faStore,
  faTags,
  faEnvelope,
  faRing,
  faGem,
  faHeart,
  faStar,
  faGift,
  faPalette,
  faCreditCard,
  faWandSparkles,
  faBox,
  faCircleCheck,
  faArrowRight,
  faTimes,
  faLock,
  faPhone,
  faBook,
  faRightFromBracket,
  faCircleExclamation,
  faMapMarkerAlt,
  faShoppingBag,
} from "@fortawesome/free-solid-svg-icons";

// ── BRAND TOKENS ──────────────────────────────────────────────
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
  terra: "#C97B6B",
  text: "#3D2B1F",
  textMid: "#6B4F3A",
  textLight: "#A08070",
};

// ─── CATEGORY ICON MAP ──────────────────────────────────────────
const CATEGORY_ICONS = {
  "Silk Bouquet": faGift,
  "Quran Rehal": faBook,
  "Customize Gleamwave Basket": faGift,
  "Resin Rings": faRing,
  "Resin Jhumkas": faGem,
  "Resin Trays": faPalette,
  "Resin Bracelets": faGem,
  "Resin Pendants": faHeart,
  "Resin Studs": faStar,
  "Resin MDFs": faBox,
  "Trending Gajra": faHeart,
  "Customized Certificates": faCircleCheck,
  Booklet: faBook,
  "Resin Stationery": faWandSparkles,
  Baskets: faShoppingBag,
};

// ─── CATEGORY IMAGE MAP ──────────────────────────────────────────
const CATEGORY_IMAGES = {
  "Silk Bouquet": "/images/categories/silk-bouquet.jpg",
  "Quran Rehal": "/images/categories/quran-rehal.jpg",
  "Customize Gleamwave Basket": "/images/categories/custom-basket.jpg",
  "Resin Rings": "/images/categories/resin-rings.jpg",
  "Resin Jhumkas": "/images/categories/resin-jhumkas.jpg",
  "Resin Trays": "/images/categories/trays.jpg",
  "Resin Bracelets": "/images/categories/jewelry.jpg",
  "Resin Pendants": "/images/categories/jewelry.jpg",
  "Resin Studs": "/images/categories/studs.jpeg",
  "Resin MDFs": "/images/categories/frames.jpg",
  "Trending Gajra": "/images/categories/bridal.jpg",
  "Customized Certificates": "/images/categories/stationery.jpg",
  Booklet: "/images/categories/stationery.jpg",
  "Resin Stationery": "/images/categories/stationery.jpg",
  Baskets: "/images/categories/bridal.jpg",
};

const DISPLAY_CATEGORIES = [
  "Resin Rings",
  "Resin Jhumkas",
  "Resin Trays",
  "Silk Bouquet",
  "Quran Rehal",
  "Customize Gleamwave Basket",
];

// ─── PRICE DISPLAY ──────────────────────────────────────────────
const PriceDisplay = ({ product, size = "medium" }) => {
  const hasDiscount =
    product?.original_price && product.original_price > product.price;
  let discountPercent = product?.discount_percent || 0;
  if (!discountPercent && hasDiscount) {
    discountPercent = Math.round(
      ((product.original_price - product.price) / product.original_price) * 100,
    );
  }
  const sizeStyles = {
    small: { price: 16, original: 13, badge: 10 },
    medium: { price: 20, original: 14, badge: 11 },
    large: { price: 24, original: 16, badge: 12 },
  };
  const styles = sizeStyles[size] || sizeStyles.medium;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap",
      }}
    >
      {hasDiscount ? (
        <>
          <span
            style={{
              fontSize: styles.original,
              color: "#999",
              textDecoration: "line-through",
            }}
          >
            Rs. {product.original_price.toLocaleString()}
          </span>
          <span
            style={{
              fontSize: styles.price,
              fontWeight: 700,
              color: "#dc2626",
            }}
          >
            Rs. {product.price.toLocaleString()}
          </span>
          <span
            style={{
              backgroundColor: "#dc2626",
              color: "white",
              padding: "2px 10px",
              borderRadius: 12,
              fontSize: styles.badge,
              fontWeight: 600,
            }}
          >
            -{discountPercent}% OFF
          </span>
        </>
      ) : (
        <span
          style={{ fontSize: styles.price, fontWeight: 700, color: C.maroon }}
        >
          Rs. {product.price.toLocaleString()}
        </span>
      )}
    </div>
  );
};

// ── CAROUSEL IMAGES ──
const carouselImages = [
  {
    id: 1,
    name: "Jhumka",
    image: "/images/categories/jhumka.png",
    bg: "#F5E8D0",
  },
  {
    id: 2,
    name: "Studs",
    image: "/images/categories/studs.jpeg",
    bg: "#F0E6DA",
  },
  {
    id: 3,
    name: "Earings",
    image: "/images/categories/earings.jpeg",
    bg: "#EDE1D3",
  },
];

export default function Home() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const refs = useRef({});

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [dynamicCategories, setDynamicCategories] = useState([]);

  // ─── AUTH STATE ──
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [signupFirstName, setSignupFirstName] = useState("");
  const [signupLastName, setSignupLastName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupError, setSignupError] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);

  const [showCustomOrderModal, setShowCustomOrderModal] = useState(false);

  const socialLinks = [
    {
      name: "Instagram",
      icon: faInstagram,
      url: "https://www.instagram.com/gleam0_0wave?igsh=MWRpeWNyM3V5b3M2OA==",
    },
    {
      name: "TikTok",
      icon: faTiktok,
      url: "https://www.tiktok.com/@gleam_wave?_r=1&_t=ZS-97mLVqUy11I",
    },
    { name: "WhatsApp", icon: faWhatsapp, url: "https://wa.me/923192206562" },
  ];

  // ─── AUTO SLIDE ───
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % carouselImages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // ─── CHECK USER & CART ───
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      setUser(JSON.parse(userData));
    }

    const loadCart = async () => {
      if (token) {
        try {
          const res = await fetch(`${API_URL}/cart`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            setCart(data.items || []);
          }
        } catch (e) {
          console.error("Cart load error", e);
        }
      } else {
        const guestCart = JSON.parse(
          localStorage.getItem("guest_cart") || "[]",
        );
        setCart(guestCart);
      }
    };
    loadCart();
  }, []);

  // ─── FETCH PRODUCTS ───
  useEffect(() => {
    fetchAllProducts();
  }, []);

  const fetchAllProducts = async () => {
    setLoadingFeatured(true);
    setLoadingCategories(true);
    try {
      const res = await fetch(`${API_URL}/products`);
      if (!res.ok) {
        setFeaturedProducts([]);
        setDynamicCategories([]);
        return;
      }

      const raw = await res.json();
      const data = Array.isArray(raw) ? raw : raw.products || raw.data || [];

      if (!Array.isArray(data)) return;

      const bestsellers = data.filter((p) => p.tag === "Bestseller");
      setFeaturedProducts(
        bestsellers.length > 0 ? bestsellers : data.slice(0, 6),
      );

      const allCategoryMap = new Map();
      data.forEach((product) => {
        if (product.category) {
          if (!allCategoryMap.has(product.category)) {
            allCategoryMap.set(product.category, []);
          }
          allCategoryMap.get(product.category).push(product);
        }
      });

      const displayCategories = Array.from(allCategoryMap.entries())
        .filter(([name]) => DISPLAY_CATEGORIES.includes(name))
        .map(([name, products]) => ({
          id: name.toLowerCase().replace(/\s+/g, "-"),
          label: name,
          icon: CATEGORY_ICONS[name] || faBox,
          image: CATEGORY_IMAGES[name] || "/images/categories/jewelry.jpg",
          products: products,
        }));

      displayCategories.sort((a, b) => a.label.localeCompare(b.label));
      setDynamicCategories(displayCategories);
    } catch (error) {
      console.error("Error fetching products:", error);
      setToast("Failed to load products");
      setTimeout(() => setToast(null), 3000);
    } finally {
      setLoadingFeatured(false);
      setLoadingCategories(false);
    }
  };

  // ─── ADD TO CART ───
  const addCart = async (productId, productName, e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        const guestCart = JSON.parse(
          localStorage.getItem("guest_cart") || "[]",
        );
        const existingIndex = guestCart.findIndex(
          (item) => item.product_id === productId,
        );

        if (existingIndex >= 0) {
          guestCart[existingIndex].quantity += 1;
        } else {
          guestCart.push({ product_id: productId, quantity: 1 });
        }

        localStorage.setItem("guest_cart", JSON.stringify(guestCart));
        window.dispatchEvent(new Event("cartUpdated"));

        setCart(guestCart);
        setToast(`"${productName}" added to cart`);
        setTimeout(() => setToast(null), 2500);
        return;
      }

      const res = await fetch(`${API_URL}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: productId, quantity: 1 }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add to cart");

      setCart((prev) => [...prev, productName]);
      setToast(`"${productName}" added to cart`);
      setTimeout(() => setToast(null), 2500);
    } catch (error) {
      setToast(error.message);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleProductClick = (productId) => {
    router.push(`/product/${productId}`);
  };

  // ─── LOGIN ───
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      setShowLogin(false);
      setLoginEmail("");
      setLoginPassword("");
      setToast(`Welcome back ${data.user.name}`);
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  // ─── SIGNUP ───
  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupLoading(true);
    setSignupError("");

    if (signupPassword !== signupConfirmPassword) {
      setSignupError("Passwords do not match");
      setSignupLoading(false);
      return;
    }

    if (signupPassword.length < 6) {
      setSignupError("Password must be at least 6 characters");
      setSignupLoading(false);
      return;
    }

    try {
      const fullName = `${signupFirstName} ${signupLastName}`.trim();
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName || signupFirstName,
          email: signupEmail,
          password: signupPassword,
          phone: signupPhone,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      setShowSignup(false);
      setSignupFirstName("");
      setSignupLastName("");
      setSignupEmail("");
      setSignupPassword("");
      setSignupConfirmPassword("");
      setSignupPhone("");
      setToast(`Welcome to Gleamwave ${data.user.name}`);
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setSignupError(err.message);
    } finally {
      setSignupLoading(false);
    }
  };

  // ─── LOGOUT ───
  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setCart([]);
    setShowLogoutConfirm(false);
    setToast("Logged out successfully");
    setTimeout(() => setToast(null), 3000);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  // ─── RENDER ───
  return (
    <div
      style={{
        backgroundColor: C.white,
        color: C.text,
        fontFamily: "'Georgia', 'Times New Roman', serif",
        minHeight: "100vh",
      }}
    >
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 24,
            right: 24,
            zIndex: 9999,
            backgroundColor: C.maroon,
            color: C.goldLight,
            padding: "12px 20px",
            borderRadius: 14,
            fontSize: 14,
            boxShadow: "0 8px 32px rgba(74,46,34,0.3)",
            animation: "fadeIn 0.3s ease",
          }}
        >
          {toast}
        </div>
      )}

      {/* ─── SIDEBAR COMPONENT ─── */}
      <Sidebar
        isOpen={mobileMenu}
        onClose={() => setMobileMenu(false)}
        user={user}
        onLogoutClick={handleLogoutClick}
        onLoginClick={() => setShowLogin(true)}
      />

      {/* ─── NAVBAR COMPONENT ─── */}
      <Navbar
        activePage="home"
        user={user}
        onMenuClick={() => setMobileMenu(true)}
        onLoginClick={() => setShowLogin(true)}
        onSignupClick={() => setShowSignup(true)}
        onLogoutClick={handleLogoutClick}
      />

      {/* ─── LOGOUT CONFIRMATION MODAL ─── */}
      {showLogoutConfirm && (
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
            zIndex: 2000,
            padding: "20px",
          }}
          onClick={cancelLogout}
        >
          <div
            style={{
              backgroundColor: C.white,
              borderRadius: "24px",
              padding: "40px 36px",
              maxWidth: "420px",
              width: "100%",
              textAlign: "center",
              boxShadow: "0 20px 60px rgba(74,46,34,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                backgroundColor: C.goldPale,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
                border: `3px solid ${C.gold}`,
              }}
            >
              <FontAwesomeIcon
                icon={faRightFromBracket}
                style={{ fontSize: 32, color: C.maroon }}
              />
            </div>

            <h2
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: C.maroonDark,
                marginBottom: 12,
              }}
            >
              Confirm Logout
            </h2>

            <p
              style={{
                fontSize: 15,
                color: C.textMid,
                lineHeight: 1.7,
                marginBottom: 32,
              }}
            >
              Are you sure you want to log out of your account?
              <br />
              <span
                style={{
                  fontSize: 13,
                  color: C.textLight,
                  marginTop: 6,
                  display: "inline-block",
                }}
              >
                You'll need to login again to access your cart and orders.
              </span>
            </p>

            <div style={{ display: "flex", gap: 12, flexDirection: "column" }}>
              <button
                onClick={confirmLogout}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: 12,
                  border: "none",
                  background: `linear-gradient(135deg, ${C.maroon}, ${C.maroonDark})`,
                  color: C.goldLight,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <FontAwesomeIcon icon={faRightFromBracket} />
                Yes, Logout
              </button>
              <button
                onClick={cancelLogout}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: 12,
                  border: `2px solid ${C.goldPale}`,
                  backgroundColor: "transparent",
                  color: C.textMid,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── LOGIN MODAL ─── */}
      {showLogin && (
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
            zIndex: 2000,
            padding: "20px",
          }}
          onClick={() => setShowLogin(false)}
        >
          <div
            style={{
              backgroundColor: C.white,
              borderRadius: "24px",
              padding: "36px",
              maxWidth: "400px",
              width: "100%",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowLogin(false)}
              style={{
                position: "absolute",
                top: "16px",
                right: "20px",
                backgroundColor: "transparent",
                border: "none",
                fontSize: "20px",
                cursor: "pointer",
                color: C.textMid,
                opacity: 0.6,
              }}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h2
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: C.maroonDark,
                marginBottom: "4px",
              }}
            >
              Welcome Back
            </h2>
            <p
              style={{
                fontSize: "13px",
                color: C.textLight,
                marginBottom: "20px",
              }}
            >
              Login to your Gleamwave account
            </p>

            <form
              onSubmit={handleLogin}
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: "4px" }}
              >
                <label
                  style={{ fontSize: "12px", fontWeight: 500, color: C.text }}
                >
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    style={{ marginRight: 6, fontSize: 11 }}
                  />{" "}
                  Email
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: `2px solid ${C.goldPale}`,
                    fontSize: "13px",
                    fontFamily: "inherit",
                    outline: "none",
                    backgroundColor: C.whiteOff,
                  }}
                  required
                />
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: "4px" }}
              >
                <label
                  style={{ fontSize: "12px", fontWeight: 500, color: C.text }}
                >
                  <FontAwesomeIcon
                    icon={faLock}
                    style={{ marginRight: 6, fontSize: 11 }}
                  />{" "}
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: `2px solid ${C.goldPale}`,
                    fontSize: "13px",
                    fontFamily: "inherit",
                    outline: "none",
                    backgroundColor: C.whiteOff,
                  }}
                  required
                />
              </div>

              {loginError && (
                <p
                  style={{
                    color: C.maroonDark,
                    fontSize: "12px",
                    backgroundColor: C.maroonPale,
                    padding: "8px 12px",
                    borderRadius: "8px",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faCircleExclamation}
                    style={{ marginRight: 6 }}
                  />
                  {loginError}
                </p>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                style={{
                  padding: "12px",
                  borderRadius: "12px",
                  border: "none",
                  backgroundColor: C.maroonDark,
                  color: C.goldLight,
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  marginTop: "4px",
                }}
              >
                {loginLoading ? "Logging in..." : "Login"}
              </button>
            </form>

            <p
              style={{
                textAlign: "center",
                fontSize: "13px",
                color: C.textMid,
                marginTop: "14px",
              }}
            >
              Don't have an account?{" "}
              <span
                style={{
                  color: C.maroonDark,
                  fontWeight: 600,
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
                onClick={() => {
                  setShowLogin(false);
                  setShowSignup(true);
                }}
              >
                Sign Up
              </span>
            </p>

            <div style={{ textAlign: "center", marginTop: "8px" }}>
              <button
                onClick={() => {
                  setShowLogin(false);
                  setShowForgotPassword(true);
                }}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  color: C.textMid,
                  cursor: "pointer",
                  fontSize: "12px",
                  fontFamily: "inherit",
                  textDecoration: "underline",
                }}
              >
                Forgot Password?
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── SIGNUP MODAL ─── */}
      {showSignup && (
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
            zIndex: 2000,
            padding: "20px",
          }}
          onClick={() => setShowSignup(false)}
        >
          <div
            style={{
              backgroundColor: C.white,
              borderRadius: "22px",
              padding: "28px 32px",
              maxWidth: "420px",
              width: "100%",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowSignup(false)}
              style={{
                position: "absolute",
                top: "14px",
                right: "18px",
                backgroundColor: "transparent",
                border: "none",
                fontSize: "20px",
                cursor: "pointer",
                color: C.textMid,
                opacity: 0.6,
              }}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>

            <h2
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: C.maroonDark,
                marginBottom: "2px",
              }}
            >
              Create Account
            </h2>
            <p
              style={{
                fontSize: "12px",
                color: C.textLight,
                marginBottom: "14px",
              }}
            >
              Join Gleamwave family today
            </p>

            <form
              onSubmit={handleSignup}
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "3px",
                  }}
                >
                  <label
                    style={{ fontSize: "11px", fontWeight: 500, color: C.text }}
                  >
                    First Name *
                  </label>
                  <input
                    type="text"
                    placeholder="John"
                    value={signupFirstName}
                    onChange={(e) => setSignupFirstName(e.target.value)}
                    style={{
                      padding: "8px 11px",
                      borderRadius: "9px",
                      border: `2px solid ${C.goldPale}`,
                      fontSize: "12px",
                      fontFamily: "inherit",
                      outline: "none",
                      backgroundColor: C.whiteOff,
                    }}
                    required
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "3px",
                  }}
                >
                  <label
                    style={{ fontSize: "11px", fontWeight: 500, color: C.text }}
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    placeholder="Doe"
                    value={signupLastName}
                    onChange={(e) => setSignupLastName(e.target.value)}
                    style={{
                      padding: "8px 11px",
                      borderRadius: "9px",
                      border: `2px solid ${C.goldPale}`,
                      fontSize: "12px",
                      fontFamily: "inherit",
                      outline: "none",
                      backgroundColor: C.whiteOff,
                    }}
                  />
                </div>
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: "3px" }}
              >
                <label
                  style={{ fontSize: "11px", fontWeight: 500, color: C.text }}
                >
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    style={{ marginRight: 5, fontSize: 10 }}
                  />{" "}
                  Email *
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  style={{
                    padding: "8px 11px",
                    borderRadius: "9px",
                    border: `2px solid ${C.goldPale}`,
                    fontSize: "12px",
                    fontFamily: "inherit",
                    outline: "none",
                    backgroundColor: C.whiteOff,
                  }}
                  required
                />
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: "3px" }}
              >
                <label
                  style={{ fontSize: "11px", fontWeight: 500, color: C.text }}
                >
                  <FontAwesomeIcon
                    icon={faPhone}
                    style={{ marginRight: 5, fontSize: 10 }}
                  />{" "}
                  Phone (WhatsApp)
                </label>
                <input
                  type="tel"
                  placeholder="+92 300 1234567"
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  style={{
                    padding: "8px 11px",
                    borderRadius: "9px",
                    border: `2px solid ${C.goldPale}`,
                    fontSize: "12px",
                    fontFamily: "inherit",
                    outline: "none",
                    backgroundColor: C.whiteOff,
                  }}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "3px",
                  }}
                >
                  <label
                    style={{ fontSize: "11px", fontWeight: 500, color: C.text }}
                  >
                    <FontAwesomeIcon
                      icon={faLock}
                      style={{ marginRight: 5, fontSize: 10 }}
                    />{" "}
                    Password *
                  </label>
                  <input
                    type="password"
                    placeholder="Min 6 chars"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    style={{
                      padding: "8px 11px",
                      borderRadius: "9px",
                      border: `2px solid ${C.goldPale}`,
                      fontSize: "12px",
                      fontFamily: "inherit",
                      outline: "none",
                      backgroundColor: C.whiteOff,
                    }}
                    required
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "3px",
                  }}
                >
                  <label
                    style={{ fontSize: "11px", fontWeight: 500, color: C.text }}
                  >
                    <FontAwesomeIcon
                      icon={faLock}
                      style={{ marginRight: 5, fontSize: 10 }}
                    />{" "}
                    Confirm *
                  </label>
                  <input
                    type="password"
                    placeholder="Re-enter"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    style={{
                      padding: "8px 11px",
                      borderRadius: "9px",
                      border: `2px solid ${C.goldPale}`,
                      fontSize: "12px",
                      fontFamily: "inherit",
                      outline: "none",
                      backgroundColor: C.whiteOff,
                    }}
                    required
                  />
                </div>
              </div>

              {signupError && (
                <p
                  style={{
                    color: C.maroonDark,
                    fontSize: "11px",
                    backgroundColor: C.maroonPale,
                    padding: "6px 10px",
                    borderRadius: "8px",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faCircleExclamation}
                    style={{ marginRight: 5 }}
                  />
                  {signupError}
                </p>
              )}

              <button
                type="submit"
                disabled={signupLoading}
                style={{
                  padding: "11px",
                  borderRadius: "11px",
                  border: "none",
                  backgroundColor: C.maroonDark,
                  color: C.goldLight,
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  marginTop: "2px",
                }}
              >
                {signupLoading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <p
              style={{
                textAlign: "center",
                fontSize: "12px",
                color: C.textMid,
                marginTop: "12px",
              }}
            >
              Already have an account?{" "}
              <span
                style={{
                  color: C.maroonDark,
                  fontWeight: 600,
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
                onClick={() => {
                  setShowSignup(false);
                  setShowLogin(true);
                }}
              >
                Login
              </span>
            </p>
          </div>
        </div>
      )}

      {/* ─── FORGOT PASSWORD MODAL ─── */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onBack={() => {
          setShowForgotPassword(false);
          setShowLogin(true);
        }}
      />

      {/* ─── HERO SECTION ── */}
      <section
        style={{
          minHeight: "100vh",
          paddingTop: 68,
          display: "flex",
          alignItems: "center",
          background: `linear-gradient(135deg, ${C.white} 0%, ${C.maroonPale} 40%, ${C.goldPale} 100%)`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "10%",
            right: "-5%",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${C.goldLight}44, transparent 70%)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "5%",
            left: "-8%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${C.maroon}22, transparent 70%)`,
          }}
        />

        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "60px 24px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 60,
            alignItems: "center",
          }}
          className="hero-grid"
        >
          <div>
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.35em",
                color: C.gold,
                textTransform: "uppercase",
                marginBottom: 16,
              }}
            >
              <FontAwesomeIcon
                icon={faHeart}
                style={{ marginRight: 8, color: C.gold }}
              />
              Handmade with love
            </div>
            <h1
              style={{
                fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
                fontWeight: 700,
                lineHeight: 1.1,
                color: C.maroonDark,
                margin: "0 0 20px",
              }}
            >
              Wear Your
              <br />
              <span style={{ color: C.maroon }}>Memories.</span>
              <br />
              Adorn Your
              <br />
              World.
            </h1>
            <p
              style={{
                fontSize: 17,
                lineHeight: 1.7,
                color: C.textMid,
                maxWidth: 420,
                marginBottom: 32,
              }}
            >
              From preserve memory jewelry to bridal keepsakes and resin art —
              every Gleamwave piece is poured by hand, just for you.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <Link href="/products">
                <button
                  style={{
                    padding: "14px 32px",
                    borderRadius: 50,
                    border: "none",
                    backgroundColor: C.maroon,
                    color: C.goldLight,
                    fontSize: 14,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    boxShadow: `0 4px 20px ${C.maroon}55`,
                  }}
                >
                  <FontAwesomeIcon icon={faStore} style={{ marginRight: 8 }} />{" "}
                  Shop Collection
                </button>
              </Link>
              <Link href="#categories">
                <button
                  style={{
                    padding: "14px 32px",
                    borderRadius: 50,
                    border: `2px solid ${C.maroon}`,
                    backgroundColor: "transparent",
                    color: C.maroon,
                    fontSize: 14,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  <FontAwesomeIcon icon={faTags} style={{ marginRight: 8 }} />{" "}
                  Browse Categories
                </button>
              </Link>
            </div>
            <div style={{ display: "flex", gap: 36, marginTop: 48 }}>
              {[
                ["500+", "Orders Delivered"],
                ["100%", "Handmade"],
                ["5", "Avg Rating"],
              ].map(([n, l]) => (
                <div key={l}>
                  <div
                    style={{ fontSize: 24, fontWeight: 700, color: C.maroon }}
                  >
                    {n}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      letterSpacing: "0.15em",
                      color: C.textLight,
                      textTransform: "uppercase",
                    }}
                  >
                    {l}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CAROUSEL */}
          <div
            style={{
              position: "relative",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 420,
            }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                maxWidth: 380,
                height: 400,
                perspective: "1200px",
              }}
            >
              {carouselImages.map((img, index) => {
                const isActive = index === activeSlide;
                const offset =
                  (index - activeSlide + carouselImages.length) %
                  carouselImages.length;
                const isPrev = offset === carouselImages.length - 1;
                const isNext = offset === 1;

                let transform = "translateX(0) translateZ(0) scale(0.85)";
                let opacity = 0.4,
                  zIndex = 1;

                if (offset === 0) {
                  transform = "translateX(0) translateZ(0) scale(1)";
                  opacity = 1;
                  zIndex = 3;
                } else if (isPrev) {
                  transform =
                    "translateX(-60%) translateZ(-100px) scale(0.7) rotateY(15deg)";
                  opacity = 0.5;
                  zIndex = 2;
                } else if (isNext) {
                  transform =
                    "translateX(60%) translateZ(-100px) scale(0.7) rotateY(-15deg)";
                  opacity = 0.5;
                  zIndex = 2;
                } else {
                  transform = "translateX(0) translateZ(-200px) scale(0.5)";
                  opacity = 0;
                  zIndex = 0;
                }

                return (
                  <div
                    key={img.id}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      transform,
                      opacity,
                      zIndex,
                      transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                      transformStyle: "preserve-3d",
                      pointerEvents: isActive ? "auto" : "none",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: 28,
                        overflow: "hidden",
                        background: `linear-gradient(145deg, ${img.bg}, #FFFFFF)`,
                        boxShadow: isActive
                          ? `0 30px 80px ${C.maroon}44, 0 10px 30px rgba(0,0,0,0.1)`
                          : `0 10px 30px rgba(0,0,0,0.08)`,
                        border: isActive
                          ? `3px solid ${C.gold}`
                          : "1px solid rgba(184,149,106,0.2)",
                        padding: "20px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          height: "70%",
                          borderRadius: 20,
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={img.image}
                          alt={img.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          onError={(e) => {
                            e.target.src = "/images/categories/jewelry.jpg";
                          }}
                        />
                      </div>
                      <div style={{ marginTop: 16, textAlign: "center" }}>
                        <div
                          style={{
                            fontSize: 20,
                            fontWeight: 700,
                            color: C.maroonDark,
                          }}
                        >
                          {img.name}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div
              style={{
                position: "absolute",
                bottom: -20,
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: 12,
                zIndex: 10,
              }}
            >
              {carouselImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveSlide(index)}
                  style={{
                    width: index === activeSlide ? 32 : 10,
                    height: 10,
                    borderRadius: 5,
                    border: "none",
                    background:
                      index === activeSlide
                        ? `linear-gradient(90deg, ${C.gold}, ${C.maroon})`
                        : C.goldPale,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── MARQUEE STRIP ── */}
      <div
        style={{
          backgroundColor: C.maroonDark,
          color: C.goldLight,
          padding: "14px 0",
          overflow: "hidden",
          whiteSpace: "nowrap",
        }}
      >
        <div
          style={{
            display: "inline-block",
            animation: "marquee 22s linear infinite",
            fontSize: 13,
            letterSpacing: "0.2em",
          }}
        >
          {Array(4)
            .fill(
              "Preserve Memory Jewelry  ·  Resin Trays  ·  Bridal Gajra  ·  Nikkah Gifts  ·  Custom Frames  ·  Resin Jewelry  ·  MDF Art  ·  Stationery  ·  Quran Rehal  ",
            )
            .join("")}
        </div>
      </div>

      {/* ─── CATEGORIES ── */}
      <section
        id="categories"
        style={{ padding: "80px 24px", backgroundColor: C.whiteOff }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.35em",
                color: C.gold,
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              Explore Our Collection
            </div>
            <h2
              style={{
                fontSize: "clamp(2rem,4vw,3rem)",
                fontWeight: 700,
                color: C.maroonDark,
                margin: 0,
              }}
            >
              Browse by Categories
            </h2>
          </div>

          {loadingCategories ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: C.textLight,
              }}
            >
              Loading categories...
            </div>
          ) : dynamicCategories.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: C.textLight,
              }}
            >
              <h3 style={{ fontSize: 20, color: C.textMid }}>
                No categories yet
              </h3>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 24,
              }}
            >
              {dynamicCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="category-card"
                  onClick={() =>
                    setActiveCategory(activeCategory === cat.id ? null : cat.id)
                  }
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: `1px solid ${activeCategory === cat.id ? `${C.maroon}55` : "rgba(184,149,106,0.18)"}`,
                    borderRadius: 20,
                    cursor: "pointer",
                    overflow: "hidden",
                    transition: "border-color 0.4s ease, box-shadow 0.4s ease",
                    boxShadow:
                      activeCategory === cat.id
                        ? `0 20px 48px ${C.maroon}22`
                        : "0 2px 16px rgba(74,46,34,0.05)",
                  }}
                >
                  <div className="category-image-box" style={{ position: "relative", height: 220 }}>
                    <img
                      className="category-image"
                      src={cat.image}
                      alt={cat.label}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                    <div className="category-image-gradient" />
                    <div
                      style={{
                        position: "absolute",
                        bottom: 16,
                        left: 16,
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          backgroundColor: "rgba(255,255,255,0.18)",
                          backdropFilter: "blur(6px)",
                          border: `1px solid ${C.goldLight}66`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <FontAwesomeIcon
                          icon={cat.icon}
                          style={{ color: C.goldLight, fontSize: 14 }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#FFFFFF",
                          letterSpacing: "0.03em",
                        }}
                      >
                        {cat.products.length} piece
                        {cat.products.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <div style={{ padding: "24px" }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 19,
                        color: C.maroonDark,
                        marginBottom: 8,
                      }}
                    >
                      {cat.label}
                    </div>
                    <p style={{ fontSize: 14, color: C.textMid, margin: 0 }}>
                      {cat.products.length} product(s) available
                    </p>
                    {activeCategory === cat.id && (
                      <Link href={`/products?category=${cat.label}`}>
                        <button
                          style={{
                            marginTop: 14,
                            padding: "8px 18px",
                            borderRadius: 30,
                            border: "none",
                            backgroundColor: C.maroon,
                            color: C.goldLight,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                            fontFamily: "inherit",
                          }}
                        >
                          View All{" "}
                          <FontAwesomeIcon
                            icon={faArrowRight}
                            style={{ marginLeft: 6 }}
                          />
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── BEST SELLING ── */}
      <section
        id="shop"
        style={{ padding: "80px 24px", backgroundColor: C.white }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.35em",
                color: C.gold,
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              HANDPICKED
            </div>
            <h2
              style={{
                fontSize: "clamp(2rem,4vw,3rem)",
                fontWeight: 700,
                color: C.maroonDark,
                margin: 0,
              }}
            >
              Best Selling Collection
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 24,
            }}
          >
            {loadingFeatured
              ? Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      style={{
                        backgroundColor: "#fff",
                        borderRadius: 22,
                        height: 380,
                        border: `2px solid ${C.goldPale}`,
                      }}
                    />
                  ))
              : featuredProducts.map((p) => {
                  const isOutOfStock = p.stock <= 0;
                  return (
                    <div
                      key={p.id}
                      onClick={() => !isOutOfStock && handleProductClick(p.id)}
                      style={{
                        backgroundColor: "#fff",
                        borderRadius: 22,
                        overflow: "hidden",
                        border: `2px solid ${isOutOfStock ? "#EF4444" : C.goldPale}`,
                        cursor: isOutOfStock ? "not-allowed" : "pointer",
                        opacity: isOutOfStock ? 0.7 : 1,
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (!isOutOfStock) {
                          e.currentTarget.style.transform = "translateY(-6px)";
                          e.currentTarget.style.boxShadow = `0 12px 40px ${C.maroon}33`;
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <div
                        style={{
                          height: 220,
                          background: `linear-gradient(135deg, ${C.maroonPale}, ${C.goldPale})`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        {p.images?.[0]?.image_url ? (
                          <img
                            src={p.images[0].image_url}
                            alt={p.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <FontAwesomeIcon
                            icon={faGem}
                            style={{ fontSize: 48, color: C.maroon }}
                          />
                        )}
                        {isOutOfStock && (
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              backgroundColor: "rgba(0,0,0,0.5)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <span
                              style={{
                                backgroundColor: "#EF4444",
                                color: "white",
                                padding: "6px 16px",
                                borderRadius: 20,
                                fontSize: 12,
                                fontWeight: 700,
                              }}
                            >
                              OUT OF STOCK
                            </span>
                          </div>
                        )}
                      </div>
                      <div style={{ padding: "20px 22px" }}>
                        <div
                          style={{
                            fontSize: 12,
                            color: C.textLight,
                            textTransform: "uppercase",
                            marginBottom: 4,
                          }}
                        >
                          {p.category}
                        </div>
                        <div
                          style={{
                            fontSize: 17,
                            fontWeight: 600,
                            color: C.maroonDark,
                            marginBottom: 10,
                          }}
                        >
                          {p.name}
                        </div>
                        <PriceDisplay product={p} size="medium" />
                        <button
                          onClick={(e) => addCart(p.id, p.name, e)}
                          disabled={isOutOfStock}
                          style={{
                            marginTop: 12,
                            width: "100%",
                            padding: "10px",
                            borderRadius: 30,
                            border: "none",
                            backgroundColor: isOutOfStock ? "#ccc" : C.maroon,
                            color: isOutOfStock ? "#999" : C.goldLight,
                            fontSize: 12,
                            cursor: isOutOfStock ? "not-allowed" : "pointer",
                            fontFamily: "inherit",
                            fontWeight: 600,
                            transition:
                              "opacity 0.2s ease, transform 0.2s ease",
                            opacity: 1,
                          }}
                          onMouseEnter={(e) => {
                            if (!isOutOfStock) {
                              e.currentTarget.style.opacity = "0.8";
                              e.currentTarget.style.transform = "scale(1.02)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = "1";
                            e.currentTarget.style.transform = "scale(1)";
                          }}
                          onMouseDown={(e) => {
                            if (!isOutOfStock)
                              e.currentTarget.style.opacity = "0.6";
                          }}
                          onMouseUp={(e) => {
                            if (!isOutOfStock)
                              e.currentTarget.style.opacity = "0.8";
                          }}
                        >
                          <FontAwesomeIcon
                            icon={faShoppingCart}
                            style={{ marginRight: 6 }}
                          />
                          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                        </button>
                      </div>
                    </div>
                  );
                })}
          </div>

          <div style={{ textAlign: "center", marginTop: 48 }}>
            <Link href="/products">
              <button
                style={{
                  padding: "14px 48px",
                  borderRadius: 50,
                  border: `2px solid ${C.maroon}`,
                  backgroundColor: "transparent",
                  color: C.maroon,
                  fontSize: 14,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontWeight: 600,
                  transition: "opacity 0.2s ease, transform 0.2s ease",
                  opacity: 1,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.75";
                  e.currentTarget.style.transform = "scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                  e.currentTarget.style.transform = "scale(1)";
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.opacity = "0.5";
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.opacity = "0.75";
                }}
                onTouchStart={(e) => {
                  e.currentTarget.style.opacity = "0.5";
                }}
                onTouchEnd={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
              >
                <FontAwesomeIcon icon={faStore} style={{ marginRight: 8 }} />{" "}
                View All Products
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── CUSTOM ORDER BANNER ── */}
      <section
        style={{
          padding: "80px 24px",
          textAlign: "center",
          background: `linear-gradient(135deg, ${C.maroonDark}, ${C.maroon}, ${C.goldDark})`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.35em",
              color: C.goldLight,
              textTransform: "uppercase",
              marginBottom: 14,
              opacity: 0.8,
            }}
          >
            MADE JUST FOR YOU
          </div>

          <h2
            style={{
              fontSize: "clamp(2rem,4vw,3.2rem)",
              fontWeight: 700,
              color: C.goldLight,
              margin: "0 0 16px",
            }}
          >
            Want Something Truly Yours?
          </h2>

          <p
            style={{
              color: "#fff",
              opacity: 0.9,
              maxWidth: 560,
              margin: "0 auto 32px",
              fontSize: 16,
              lineHeight: 1.8,
            }}
          >
            Share your vision — flowers, colors, size, occasion — and we'll
            create something you'll treasure forever.
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 30,
              flexWrap: "wrap",
              marginBottom: 36,
            }}
          >
            {[
              {
                icon: faBox,
                title: "Delivery Timeline",
                subtitle: "Within 15 Days",
              },
              {
                icon: faCreditCard,
                title: "Payment Terms",
                subtitle: "40% Advance | 60% After Ready",
              },
              {
                icon: faPalette,
                title: "Fully Custom",
                subtitle: "Your Vision, Our Craft",
              },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: "rgba(255,255,255,0.08)",
                  backdropFilter: "blur(10px)",
                  padding: "18px 28px",
                  borderRadius: 16,
                  border: `1px solid ${C.goldLight}30`,
                  minWidth: 180,
                  textAlign: "center",
                }}
              >
                <FontAwesomeIcon
                  icon={item.icon}
                  style={{ fontSize: 32, color: C.goldLight, marginBottom: 6 }}
                />
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: C.goldLight,
                    marginBottom: 2,
                  }}
                >
                  {item.title}
                </div>
                <div style={{ fontSize: 13, color: "#fff", opacity: 0.85 }}>
                  {item.subtitle}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowCustomOrderModal(true)}
            style={{
              padding: "16px 48px",
              borderRadius: 50,
              border: `2px solid ${C.goldLight}`,
              backgroundColor: "transparent",
              color: C.goldLight,
              fontSize: 15,
              letterSpacing: "0.1em",
              cursor: "pointer",
              fontFamily: "inherit",
              fontWeight: 600,
              transition: "opacity 0.2s ease, transform 0.2s ease",
              opacity: 1,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.75";
              e.currentTarget.style.transform = "scale(1.02)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.transform = "scale(1)";
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.opacity = "0.5";
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.opacity = "0.75";
            }}
            onTouchStart={(e) => {
              e.currentTarget.style.opacity = "0.5";
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          >
            <FontAwesomeIcon icon={faGift} style={{ marginRight: 8 }} /> Request
            Custom Order
          </button>
        </div>
      </section>

      {/* ─── FEEDBACK ─── */}
      <section
        id="feedback"
        style={{ padding: "60px 24px", backgroundColor: C.whiteOff }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.35em",
                color: C.gold,
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              WHAT OUR CUSTOMERS SAY
            </div>
            <h2
              style={{
                fontSize: "clamp(2rem,4vw,3rem)",
                fontWeight: 700,
                color: C.maroonDark,
                margin: 0,
              }}
            >
              Customer Feedback
            </h2>
          </div>
          <FeedbackDisplay />
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer
        style={{
          background: `linear-gradient(135deg, ${C.maroonDark}, ${C.maroon}, ${C.goldDark})`,
          color: C.goldLight,
          paddingTop: 60,
          paddingBottom: 0,
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.5fr 1fr 1fr 1.5fr",
              gap: 48,
              paddingBottom: 48,
            }}
            className="footer-grid"
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
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
                  }}
                >
                  <img
                    src="/images/categories/logo.jpg"
                    alt="Gleamwave Logo"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
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
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      color: C.goldLight,
                      letterSpacing: "0.12em",
                      lineHeight: 1.1,
                    }}
                  >
                    gleamwave
                  </div>
                  <div
                    style={{
                      fontSize: 9,
                      color: C.gold,
                      letterSpacing: "0.35em",
                      textTransform: "uppercase",
                      marginTop: 2,
                    }}
                  >
                    Handcrafted Resin Art
                  </div>
                </div>
              </div>

              <p
                style={{
                  fontSize: 14,
                  color: C.goldLight,
                  opacity: 0.85,
                  lineHeight: 1.7,
                  marginBottom: 24,
                }}
              >
                We craft premium resin art pieces that preserve your memories
                and elevate your space. Every piece is handmade with love.
              </p>

              <div style={{ display: "flex", gap: 12 }}>
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
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
                      e.currentTarget.style.backgroundColor =
                        "rgba(255,255,255,0.1)";
                      e.currentTarget.style.borderColor = `${C.goldLight}30`;
                      e.currentTarget.style.color = C.goldLight;
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <FontAwesomeIcon
                      icon={social.icon}
                      style={{ fontSize: 16 }}
                    />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: C.goldLight,
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  marginBottom: 20,
                }}
              >
                Shop
              </h3>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {[
                  {
                    label: "Resin Rings",
                    href: "/products?category=Resin Rings",
                  },
                  {
                    label: "Resin Jhumkas",
                    href: "/products?category=Resin Jhumkas",
                  },
                  {
                    label: "Resin Trays",
                    href: "/products?category=Resin Trays",
                  },
                  {
                    label: "Silk Bouquets",
                    href: "/products?category=Silk Bouquet",
                  },
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
              <h3
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: C.goldLight,
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  marginBottom: 20,
                }}
              >
                Company
              </h3>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
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
              <h3
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: C.goldLight,
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  marginBottom: 20,
                }}
              >
                Contact
              </h3>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  marginBottom: 24,
                }}
              >
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
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      style={{ marginRight: 8, fontSize: 12 }}
                    />
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
                    <FontAwesomeIcon
                      icon={faPhone}
                      style={{ marginRight: 8, fontSize: 12 }}
                    />
                    0319 2206562
                  </a>
                </li>
                <li
                  style={{
                    fontSize: 14,
                    color: C.goldLight,
                    opacity: 0.85,
                    lineHeight: 1.6,
                  }}
                >
                  <FontAwesomeIcon
                    icon={faMapMarkerAlt}
                    style={{ marginRight: 8, fontSize: 12 }}
                  />
                  Islamabad, Pakistan
                </li>
              </ul>

              <button
                onClick={() => setShowCustomOrderModal(true)}
                style={{
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
                Request Custom Order
                <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 11 }} />
              </button>
            </div>
          </div>

          <div
            style={{
              borderTop: `1px solid ${C.goldLight}30`,
              padding: "24px 0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 16,
            }}
            className="footer-bottom"
          >
            <div style={{ fontSize: 13, color: C.goldLight, opacity: 0.7 }}>
              © 2025 Gleamwave. All rights reserved.
            </div>
            <div style={{ fontSize: 13, color: C.goldLight, opacity: 0.7 }}>
              Made with love in Pakistan
            </div>
          </div>
        </div>
      </footer>

      <CustomOrderModal
        isOpen={showCustomOrderModal}
        onClose={() => setShowCustomOrderModal(false)}
      />

      <FeedbackButton user={user} />

      <style>{`
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; max-height: 0; } to { opacity: 1; max-height: 500px; } }

        .hero-grid { grid-template-columns: 1fr 1fr; }

        .category-card { transition: transform 0.35s ease, box-shadow 0.35s ease; }
        .category-card:hover { transform: translateY(-6px); }
        .category-image-box { overflow: hidden; }
        .category-image { transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1); }
        .category-card:hover .category-image { transform: scale(1.1); }
        .category-image-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(20,12,8,0) 40%, rgba(20,12,8,0.75) 100%);
          pointer-events: none;
        }

        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 32px !important; }
        }

        @media (max-width: 600px) {
          .footer-grid { grid-template-columns: 1fr !important; }
          .footer-bottom { flex-direction: column !important; text-align: center !important; }
        }
      `}</style>
    </div>
  );
}