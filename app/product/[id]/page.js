"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronUp,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";

// ── Components ──
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

// ── BRAND TOKENS ──
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

const API_URL = "http://localhost:5000/api";

// ─── PRICE COMPONENT ──────────────────────────────────────────
const PriceDisplay = ({ product, size = "large" }) => {
  const hasDiscount = product?.original_price && product.original_price > product.price;
  const discountPercent = product?.discount_percent || product?.discount_percentage || 0;
  
  const priceSize = size === "large" ? 28 : 20;
  const originalSize = size === "large" ? 18 : 14;
  const badgeSize = size === "large" ? 13 : 10;
  
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      {hasDiscount ? (
        <>
          <span style={{ fontSize: originalSize, color: C.textLight, textDecoration: "line-through" }}>
            Rs. {product.original_price.toLocaleString()}
          </span>
          <span style={{ fontSize: priceSize, fontWeight: 700, color: "#dc2626" }}>
            Rs. {product.price.toLocaleString()}
          </span>
          <span style={{
            backgroundColor: "#dc2626", color: "white",
            padding: "4px 14px", borderRadius: 20,
            fontSize: badgeSize, fontWeight: 600,
          }}>
            -{discountPercent}% OFF
          </span>
        </>
      ) : (
        <span style={{ fontSize: priceSize, fontWeight: 700, color: C.maroon }}>
          Rs. {product.price.toLocaleString()}
        </span>
      )}
    </div>
  );
};

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState([]);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [user, setUser] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const productId = params.id;

  // ─── FETCH PRODUCT & CART ──────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      setUser(JSON.parse(userData));
    }

    fetchProduct();
    updateCartCount();
  }, [productId]);

  // ─── UPDATE CART COUNT ───
  const updateCartCount = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (token) {
        const res = await fetch(`${API_URL}/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setCart(data.items || []);
        }
      } else {
        const guestCart = JSON.parse(localStorage.getItem("guest_cart") || "[]");
        setCart(guestCart);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  const fetchProduct = async () => {
    try {
      const res = await fetch(`${API_URL}/products/${productId}`);
      if (!res.ok) throw new Error("Product not found");
      const data = await res.json();
      setProduct(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleDescription = () => {
    setDescriptionExpanded(!descriptionExpanded);
  };

  // ─── ADD TO CART (Supports Guest) ────────────────────────────
  const addToCart = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        const guestCart = JSON.parse(localStorage.getItem("guest_cart") || "[]");
        
        const existingIndex = guestCart.findIndex(item => item.product_id === parseInt(productId));
        
        if (existingIndex >= 0) {
          guestCart[existingIndex].quantity += quantity;
        } else {
          guestCart.push({ product_id: parseInt(productId), quantity: quantity });
        }
        
        localStorage.setItem("guest_cart", JSON.stringify(guestCart));
        window.dispatchEvent(new Event("cartUpdated"));
        setCart(guestCart);
        
        setToast(`"${product.name}" added to cart`);
        setTimeout(() => setToast(null), 3000);
        return;
      }

      const res = await fetch(`${API_URL}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: parseInt(productId),
          quantity: quantity,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add to cart");

      setCart((prev) => [...prev, product.name]);
      window.dispatchEvent(new Event("cartUpdated"));
      setToast(`"${product.name}" added to cart`);
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      setToast(error.message);
      setTimeout(() => setToast(null), 3000);
    }
  };

  // ─── BUY NOW ──────────────────────────────────────────────
  const buyNow = () => {
    addToCart();
    setTimeout(() => {
      router.push("/cart");
    }, 500);
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
    router.push("/");
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  if (loading) {
    return (
      <div style={{
        display: "flex", justifyContent: "center", alignItems: "center",
        height: "100vh", backgroundColor: C.white,
      }}>
        <div style={{ fontSize: 24, color: C.maroon }}>Loading product...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", justifyContent: "center",
        alignItems: "center", height: "100vh",
        backgroundColor: C.white, padding: "20px", textAlign: "center",
      }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>✕</div>
        <h2 style={{ fontSize: 24, color: C.maroonDark, marginBottom: 12 }}>
          Product Not Found
        </h2>
        <p style={{ color: C.textLight, marginBottom: 24 }}>
          The product you're looking for doesn't exist or has been removed.
        </p>
        <Link href="/products">
          <button style={{
            padding: "12px 32px", borderRadius: 50, border: "none",
            backgroundColor: C.maroon, color: C.goldLight,
            fontSize: 14, cursor: "pointer", fontFamily: "inherit",
          }}>
            ← Back to Shop
          </button>
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <div style={{
      backgroundColor: C.white, color: C.text,
      fontFamily: "'Georgia', 'Times New Roman', serif",
      minHeight: "100vh",
    }}>
      {/* ── TOAST ── */}
      {toast && (
        <div style={{
          position: "fixed", top: 24, right: 24, zIndex: 9999,
          backgroundColor: C.maroon, color: C.goldLight,
          padding: "12px 20px", borderRadius: 14,
          fontSize: 14, boxShadow: "0 8px 32px rgba(74,46,34,0.3)",
          animation: "fadeIn 0.3s ease",
        }}>
          {toast}
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
        activePage="shop"
        user={user}
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
              <FontAwesomeIcon icon={faInfoCircle} style={{ fontSize: 32, color: C.maroon }} />
            </div>

            <h2 style={{ fontSize: 24, fontWeight: 700, color: C.maroonDark, marginBottom: 12 }}>
              Confirm Logout
            </h2>

            <p style={{ fontSize: 15, color: C.textMid, lineHeight: 1.7, marginBottom: 32 }}>
              Are you sure you want to log out?
            </p>

            <div style={{ display: "flex", gap: 12, flexDirection: "column" }}>
              <button
                onClick={confirmLogout}
                style={{
                  width: "100%", padding: "14px", borderRadius: 12, border: "none",
                  background: `linear-gradient(135deg, ${C.maroon}, ${C.maroonDark})`,
                  color: C.goldLight, fontSize: 15, fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
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

      {/* ─── PRODUCT DETAIL ─── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "100px 24px 40px" }}>
        <div style={{
          fontSize: 13, color: C.textLight, marginBottom: 32,
          display: "flex", gap: 8, alignItems: "center",
        }}>
          <Link href="/" style={{ color: C.textLight, textDecoration: "none" }}>Home</Link>
          <span style={{ color: C.textLight }}>›</span>
          <Link href="/products" style={{ color: C.textLight, textDecoration: "none" }}>Shop</Link>
          <span style={{ color: C.textLight }}>›</span>
          <span style={{ color: C.maroon, fontWeight: 600 }}>{product.name}</span>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60,
        }} className="product-grid">
          
          {/* ─── LEFT: IMAGES ─── */}
          <div>
            <div style={{
              width: "100%", height: 450, borderRadius: 20,
              overflow: "hidden", backgroundColor: C.whiteOff,
              border: `2px solid ${C.goldPale}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative",
              boxShadow: "0 2px 16px rgba(74,46,34,0.06)",
            }}>
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[selectedImage]?.image_url || product.images[0]?.image_url}
                  alt={product.name}
                  style={{
                    width: "100%", height: "100%",
                    objectFit: "cover",
                    opacity: isOutOfStock ? 0.5 : 1,
                  }}
                />
              ) : (
                <div style={{ fontSize: 80, color: C.textLight }}>◆</div>
              )}

              {isOutOfStock && (
                <div style={{
                  position: "absolute", inset: 0,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  backdropFilter: "blur(4px)",
                }}>
                  <span style={{
                    backgroundColor: "#EF4444", color: "white",
                    padding: "8px 24px", borderRadius: 30,
                    fontSize: 18, fontWeight: 700,
                    letterSpacing: "0.1em",
                    transform: "rotate(-15deg)",
                    boxShadow: "0 4px 20px rgba(239,68,68,0.5)",
                  }}>
                    OUT OF STOCK
                  </span>
                </div>
              )}

              {product.tag && !isOutOfStock && (
                <span style={{
                  position: "absolute", top: 16, left: 16,
                  backgroundColor: C.maroon, color: C.goldLight,
                  padding: "6px 16px", borderRadius: 20,
                  fontSize: 12, fontWeight: 600,
                  fontFamily: "sans-serif",
                  letterSpacing: "0.05em",
                }}>
                  {product.tag}
                </span>
              )}

              {product.original_price && product.original_price > product.price && !isOutOfStock && (
                <span style={{
                  position: "absolute", top: 16, right: 16,
                  backgroundColor: "#dc2626", color: "white",
                  padding: "6px 16px", borderRadius: 20,
                  fontSize: 13, fontWeight: 700,
                  fontFamily: "sans-serif",
                  letterSpacing: "0.05em",
                  boxShadow: "0 4px 16px rgba(220,38,38,0.4)",
                }}>
                  -{product.discount_percent || product.discount_percentage || 0}% OFF
                </span>
              )}
            </div>

            {product.images && product.images.length > 1 && (
              <div style={{
                display: "flex", gap: 12, marginTop: 16,
                overflowX: "auto", paddingBottom: 8,
              }}>
                {product.images.map((img, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    style={{
                      width: 80, height: 80, borderRadius: 12,
                      overflow: "hidden",
                      border: selectedImage === index ? `3px solid ${C.maroon}` : `2px solid ${C.goldPale}`,
                      cursor: "pointer", flexShrink: 0,
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      if (selectedImage !== index) {
                        e.currentTarget.style.transform = "scale(1.05)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    <img
                      src={img.image_url}
                      alt={`${product.name} ${index + 1}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ─── RIGHT: DETAILS ─── */}
          <div>
            <div style={{
              fontSize: 12, color: C.textLight,
              textTransform: "uppercase",
              letterSpacing: "0.1em", marginBottom: 8,
            }}>
              {product.category}
            </div>

            <h1 style={{
              fontSize: "clamp(1.8rem, 3vw, 2.8rem)", fontWeight: 700,
              color: C.maroonDark, marginBottom: 12,
            }}>
              {product.name}
            </h1>

            <div style={{ marginBottom: 16 }}>
              <PriceDisplay product={product} size="large" />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <span style={{
                display: "inline-block", width: 10, height: 10,
                borderRadius: "50%",
                backgroundColor: isOutOfStock ? "#EF4444" : "#22C55E",
              }} />
              <span style={{ 
                fontSize: 14, 
                color: isOutOfStock ? "#EF4444" : C.textMid,
                fontWeight: isOutOfStock ? 600 : 400,
              }}>
                {isOutOfStock ? "Out of Stock" : `In Stock (${product.stock} available)`}
              </span>
            </div>

            {/* ─── DESCRIPTION TOGGLE (FontAwesome Icon) ─── */}
            <div style={{
              border: `2px solid ${C.goldPale}`, borderRadius: 16,
              overflow: "hidden", marginBottom: 24,
              backgroundColor: C.whiteOff,
              boxShadow: "0 2px 12px rgba(74,46,34,0.06)",
            }}>
              <button
                onClick={toggleDescription}
                style={{
                  width: "100%", padding: "16px 24px",
                  backgroundColor: descriptionExpanded ? C.maroon : "transparent",
                  border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center",
                  justifyContent: "space-between",
                  fontFamily: "inherit", transition: "all 0.4s ease",
                  borderRadius: descriptionExpanded ? "0" : "16px",
                }}
                onMouseEnter={(e) => {
                  if (!descriptionExpanded) {
                    e.currentTarget.style.backgroundColor = C.goldPale;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!descriptionExpanded) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%",
                    backgroundColor: descriptionExpanded ? C.goldLight : C.maroon,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.4s ease",
                  }}>
                    <FontAwesomeIcon
                      icon={faInfoCircle}
                      style={{
                        fontSize: 18,
                        color: descriptionExpanded ? C.maroonDark : C.goldLight,
                      }}
                    />
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <div style={{
                      fontSize: 15, fontWeight: 600,
                      color: descriptionExpanded ? C.goldLight : C.maroonDark,
                      transition: "color 0.3s ease",
                    }}>Product Details</div>
                    <div style={{
                      fontSize: 12,
                      color: descriptionExpanded ? C.goldPale : C.textLight,
                      transition: "color 0.3s ease",
                    }}>
                      {descriptionExpanded ? "Tap to close" : "Tap to learn more"}
                    </div>
                  </div>
                </div>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  backgroundColor: descriptionExpanded ? C.goldLight : C.goldPale,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.4s ease",
                }}>
                  <FontAwesomeIcon
                    icon={descriptionExpanded ? faChevronUp : faChevronDown}
                    style={{
                      fontSize: 14,
                      color: descriptionExpanded ? C.maroonDark : C.maroon,
                      transition: "color 0.3s ease",
                    }}
                  />
                </div>
              </button>

              {descriptionExpanded && (
                <div style={{
                  padding: "24px 24px 28px",
                  borderTop: `2px solid ${C.goldPale}`,
                  animation: "slideDown 0.4s ease",
                  backgroundColor: C.white,
                }}>
                  <h3 style={{
                    fontSize: 14, fontWeight: 600, color: C.textMid,
                    marginBottom: 12, letterSpacing: "0.05em",
                  }}>Description</h3>
                  <p style={{
                    fontSize: 15, lineHeight: 1.8,
                    color: C.textMid, marginBottom: 20,
                  }}>
                    {product.description || "No description available for this product."}
                  </p>
                  <div style={{
                    display: "grid", gridTemplateColumns: "1fr 1fr",
                    gap: 12, paddingTop: 16,
                    borderTop: `1px solid ${C.goldPale}`,
                  }}>
                    <div>
                      <div style={{ fontSize: 11, color: C.textLight, textTransform: "uppercase", letterSpacing: "0.05em" }}>Category</div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: C.textMid }}>{product.category}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: C.textLight, textTransform: "uppercase", letterSpacing: "0.05em" }}>Product ID</div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: C.textMid }}>#{product.id}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: C.textLight, textTransform: "uppercase", letterSpacing: "0.05em" }}>Stock</div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: isOutOfStock ? "#EF4444" : C.textMid }}>
                        {isOutOfStock ? "Out of Stock" : `${product.stock} units`}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: C.textLight, textTransform: "uppercase", letterSpacing: "0.05em" }}>Tag</div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: C.maroon }}>{product.tag || "No tag"}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ─── QUANTITY SELECTOR ─── */}
            <div style={{
              display: "flex", alignItems: "center",
              gap: 16, marginBottom: 24,
            }}>
              <span style={{ fontSize: 14, color: C.textMid, fontWeight: 500 }}>Quantity:</span>
              <div style={{
                display: "flex", alignItems: "center", gap: 12,
                border: `2px solid ${C.goldPale}`, borderRadius: 12,
                padding: "4px", backgroundColor: C.white,
              }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={isOutOfStock}
                  style={{
                    width: 36, height: 36, borderRadius: 8,
                    border: "none", backgroundColor: "transparent",
                    color: isOutOfStock ? "#ccc" : C.textMid,
                    fontSize: 20,
                    cursor: isOutOfStock ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "inherit", transition: "background 0.2s",
                    opacity: isOutOfStock ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!isOutOfStock) e.target.style.backgroundColor = C.goldPale;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "transparent";
                  }}
                >
                  −
                </button>
                <span style={{
                  fontSize: 18, fontWeight: 600,
                  color: C.maroonDark, minWidth: 40, textAlign: "center",
                }}>
                  {quantity}
                </span>
                <button
                  onClick={() => {
                    if (product.stock > quantity) {
                      setQuantity(quantity + 1);
                    } else {
                      setToast("Maximum stock available");
                      setTimeout(() => setToast(null), 3000);
                    }
                  }}
                  disabled={isOutOfStock}
                  style={{
                    width: 36, height: 36, borderRadius: 8,
                    border: "none", backgroundColor: "transparent",
                    color: isOutOfStock ? "#ccc" : C.textMid,
                    fontSize: 20,
                    cursor: isOutOfStock ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "inherit", transition: "background 0.2s",
                    opacity: isOutOfStock ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!isOutOfStock) e.target.style.backgroundColor = C.goldPale;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "transparent";
                  }}
                >
                  +
                </button>
              </div>
              <span style={{ fontSize: 13, color: C.textLight }}>
                {isOutOfStock ? "No stock available" : `Max: ${product.stock}`}
              </span>
            </div>

            {/* ─── ACTION BUTTONS ─── */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                onClick={addToCart}
                disabled={isOutOfStock}
                style={{
                  flex: 1, padding: "14px 32px",
                  borderRadius: 12,
                  border: `2px solid ${isOutOfStock ? "#ccc" : C.maroon}`,
                  backgroundColor: isOutOfStock ? "#f5f5f5" : "transparent",
                  color: isOutOfStock ? "#999" : C.maroon,
                  fontSize: 15, fontWeight: 600,
                  cursor: isOutOfStock ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.3s ease",
                  opacity: isOutOfStock ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isOutOfStock) {
                    e.target.style.backgroundColor = C.maroon;
                    e.target.style.color = C.goldLight;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isOutOfStock) {
                    e.target.style.backgroundColor = "transparent";
                    e.target.style.color = C.maroon;
                  }
                }}
              >
                {isOutOfStock ? "Out of Stock" : "Add to Cart"}
              </button>

              {/* ─── BUY NOW (Blinking Button) ─── */}
              <button
                onClick={buyNow}
                disabled={isOutOfStock}
                style={{
                  flex: 1, padding: "14px 32px",
                  borderRadius: 12, border: "none",
                  backgroundColor: isOutOfStock ? "#ccc" : C.maroon,
                  color: isOutOfStock ? "#999" : C.goldLight,
                  fontSize: 15, fontWeight: 600,
                  cursor: isOutOfStock ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.3s ease",
                  opacity: isOutOfStock ? 0.6 : 1,
                  boxShadow: !isOutOfStock ? `0 4px 20px ${C.maroon}55` : "none",
                  animation: !isOutOfStock ? "blink 1.5s ease-in-out infinite" : "none",
                }}
                onMouseEnter={(e) => {
                  if (!isOutOfStock) {
                    e.target.style.animation = "none";
                    e.target.style.backgroundColor = C.maroonDark;
                    e.target.style.transform = "scale(1.05)";
                    e.target.style.boxShadow = `0 8px 32px ${C.maroon}99`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isOutOfStock) {
                    e.target.style.animation = "blink 1.5s ease-in-out infinite";
                    e.target.style.backgroundColor = C.maroon;
                    e.target.style.transform = "scale(1)";
                    e.target.style.boxShadow = `0 4px 20px ${C.maroon}55`;
                  }
                }}
              >
                {isOutOfStock ? "Out of Stock" : "Buy Now"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── FOOTER ─── */}
      <footer style={{
        padding: "28px 24px", textAlign: "center",
        borderTop: `2px solid ${C.goldPale}`,
        backgroundColor: C.whiteOff, marginTop: 40,
      }}>
        <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "0.12em", color: C.maroonDark, marginBottom: 4 }}>
          gleamwave
        </div>
        <div style={{ fontSize: 12, color: C.textLight }}>
          © 2025 Gleamwave · Handcrafted Resin Art · Made with Love in Pakistan
        </div>
      </footer>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); max-height: 0; } to { opacity: 1; transform: translateY(0); max-height: 500px; } }
        
        /* ─── BLINK ANIMATION FOR BUY NOW ─── */
        @keyframes blink {
          0%, 100% {
            box-shadow: 0 4px 20px rgba(111, 78, 55, 0.33), 0 0 0 0 rgba(111, 78, 55, 0.7);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 8px 40px rgba(111, 78, 55, 0.6), 0 0 0 12px rgba(111, 78, 55, 0);
            transform: scale(1.03);
          }
        }

        @media (max-width: 768px) { .product-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}