"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { API_URL } from "@/lib/config";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

// ── BRAND TOKENS ──────────────────────────────────────────────
const C = {
  white: "#FFFFFF",
  whiteOff: "#FDF8F3",
  snow: "#FDF6F0",
  maroon: "#6F4E37",
  maroonDark: "#4A2E22",
  maroonPale: "#F0E6DA",
  gold: "#B8956A",
  goldLight: "#E8D9C0",
  goldPale: "#F5EDE0",
  goldDark: "#8B6F47",
  text: "#3D2B1F",
  textMid: "#6B4F3A",
  textLight: "#A08070",
};

const DELIVERY_CHARGE = 200;

// ─── PRICE COMPONENT ──────────────────────────────────────────
const PriceDisplay = ({ product, size = "small" }) => {
  const hasDiscount = product?.original_price && product.original_price > product.price;
  const discountPercent = product?.discount_percent || product?.discount_percentage || 0;
  
  const sizeStyles = {
    small: { price: 16, original: 13, badge: 10 },
    medium: { price: 20, original: 14, badge: 11 },
    large: { price: 24, original: 16, badge: 12 },
  };
  
  const styles = sizeStyles[size] || sizeStyles.small;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
      {hasDiscount ? (
        <>
          <span style={{ fontSize: styles.original, color: C.textLight, textDecoration: "line-through" }}>
            Rs. {product.original_price.toLocaleString()}
          </span>
          <span style={{ fontSize: styles.price, fontWeight: 700, color: "#dc2626" }}>
            Rs. {product.price.toLocaleString()}
          </span>
          <span style={{
            backgroundColor: "#dc2626", color: "white", padding: "1px 8px",
            borderRadius: 10, fontSize: styles.badge, fontWeight: 600,
          }}>
            -{discountPercent}% OFF
          </span>
        </>
      ) : (
        <span style={{ fontSize: styles.price, fontWeight: 700, color: C.maroon }}>
          Rs. {product.price.toLocaleString()}
        </span>
      )}
    </div>
  );
};

export default function Cart() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [toast, setToast] = useState(null);
  const [user, setUser] = useState(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleDescription = (itemId) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      fetchServerCart();
    } else {
      fetchLocalCart();
    }
  }, []);

  // ─── LOGGED IN USER - FETCH FROM SERVER ───
  const fetchServerCart = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/cart`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
          fetchLocalCart();
          return;
        }
        throw new Error(data.error || "Failed to fetch cart");
      }
      
      setCartItems(data.items || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Fetch Cart Error:", error);
      showToast(error.message || "Failed to load cart", "error");
    } finally {
      setLoading(false);
    }
  };

  // ─── GUEST USER - FETCH FROM LOCALSTORAGE ───
  const fetchLocalCart = async () => {
    try {
      const localCart = JSON.parse(localStorage.getItem("guest_cart") || "[]");
      
      if (localCart.length === 0) {
        setCartItems([]);
        setTotal(0);
        setLoading(false);
        return;
      }

      // Fetch product details for each cart item
      const itemsWithProducts = await Promise.all(
        localCart.map(async (item) => {
          try {
            const res = await fetch(`${API_URL}/products/${item.product_id}`);
            if (!res.ok) return null;
            const product = await res.json();
            return {
              id: item.product_id, // Use product_id as cart item id
              product_id: item.product_id,
              quantity: item.quantity,
              product: product,
            };
          } catch (e) {
            return null;
          }
        })
      );

      const validItems = itemsWithProducts.filter(item => item !== null);
      setCartItems(validItems);
      
      const totalAmount = validItems.reduce(
        (sum, item) => sum + (item.product?.price || 0) * item.quantity, 
        0
      );
      setTotal(totalAmount);
    } catch (error) {
      console.error("Local Cart Error:", error);
      showToast("Failed to load cart", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ─── UPDATE QUANTITY ───
  const updateQuantity = async (itemId, newQuantity) => {
    try {
      if (user) {
        // Logged in user - update on server
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/cart/${itemId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ quantity: newQuantity }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update");
        await fetchServerCart();
      } else {
        // Guest user - update localStorage
        const localCart = JSON.parse(localStorage.getItem("guest_cart") || "[]");
        const updated = localCart.map(item => 
          item.product_id === itemId 
            ? { ...item, quantity: newQuantity }
            : item
        );
        localStorage.setItem("guest_cart", JSON.stringify(updated));
        await fetchLocalCart();
      }
      
      showToast("Cart updated successfully");
    } catch (error) {
      console.error("Update Error:", error);
      showToast(error.message, "error");
    }
  };

  // ─── REMOVE ITEM ───
  const removeItem = async (itemId) => {
    try {
      if (user) {
        // Logged in user - remove from server
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/cart/${itemId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to remove item");
        await fetchServerCart();
      } else {
        // Guest user - remove from localStorage
        const localCart = JSON.parse(localStorage.getItem("guest_cart") || "[]");
        const updated = localCart.filter(item => item.product_id !== itemId);
        localStorage.setItem("guest_cart", JSON.stringify(updated));
        await fetchLocalCart();
      }
      
      showToast("Item removed from cart");
    } catch (error) {
      console.error("Remove Error:", error);
      showToast(error.message, "error");
    }
  };

  // ─── CLEAR CART ───
  const clearCart = async () => {
    try {
      if (user) {
        const token = localStorage.getItem("token");
        for (const item of cartItems) {
          await fetch(`${API_URL}/cart/${item.id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
        }
        await fetchServerCart();
      } else {
        localStorage.removeItem("guest_cart");
        await fetchLocalCart();
      }
      
      showToast("Cart cleared successfully");
    } catch (error) {
      console.error("Clear Cart Error:", error);
      showToast(error.message, "error");
    }
  };

  // ─── CHECKOUT ───
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      showToast("Your cart is empty", "error");
      return;
    }
    router.push("/checkout");
  };

  if (loading) {
    return (
      <div style={{
        display: "flex", justifyContent: "center", alignItems: "center",
        height: "100vh", backgroundColor: C.white,
      }}>
        <div style={{ fontSize: 24, color: C.maroon }}>Loading cart...</div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: C.white,
      color: C.text,
      fontFamily: "'Georgia', 'Times New Roman', serif",
      minHeight: "100vh",
      paddingTop: "80px",
    }}>
      {/* ── TOAST ── */}
      {toast && (
        <div style={{
          position: "fixed", top: 24, right: 24, zIndex: 999,
          backgroundColor: toast.type === "error" ? "#EF4444" : C.maroon,
          color: C.goldLight, padding: "12px 20px", borderRadius: 14,
          fontSize: 14, boxShadow: "0 8px 32px rgba(74,46,34,0.3)",
          animation: "fadeIn 0.3s ease",
        }}>
          {toast.message}
        </div>
      )}

      {/* ─── SIDEBAR ── */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ─── NAVBAR ── */}
      <Navbar
        activePage="cart"
        onMenuClick={() => setSidebarOpen(true)}
        onLoginClick={() => router.push("/")}
      />

      {/* ─── CART CONTENT ─── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
        
        {/* ─── GUEST BANNER ─── */}
        {!user && cartItems.length > 0 && (
          <div style={{
            backgroundColor: C.goldPale,
            border: `2px solid ${C.gold}`,
            borderRadius: 12,
            padding: "14px 20px",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.maroonDark, marginBottom: 2 }}>
                Guest Checkout Available!
              </div>
              <div style={{ fontSize: 13, color: C.textMid }}>
                No account needed — just fill your details at checkout
              </div>
            </div>
            <Link href="/checkout">
              <button style={{
                padding: "8px 20px",
                borderRadius: 30,
                border: "none",
                backgroundColor: C.maroon,
                color: C.goldLight,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}>
                Checkout Now
              </button>
            </Link>
          </div>
        )}

        <h1 style={{
          fontSize: "clamp(2rem, 3vw, 2.8rem)", fontWeight: 700,
          color: C.maroonDark, marginBottom: 8,
        }}>
          Your Cart
        </h1>
        <p style={{ color: C.textLight, marginBottom: 32 }}>
          {cartItems.length > 0
            ? `You have ${cartItems.length} item${cartItems.length > 1 ? "s" : ""} in your cart`
            : "Your cart is empty"}
        </p>

        {cartItems.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "80px 20px",
            backgroundColor: C.whiteOff, borderRadius: 24,
          }}>
            <h2 style={{ fontSize: 24, color: C.maroonDark, marginBottom: 12 }}>
              Your cart is empty
            </h2>
            <p style={{ color: C.textLight, marginBottom: 24 }}>
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link href="/products">
              <button style={{
                padding: "12px 32px", borderRadius: 50, border: "none",
                backgroundColor: C.maroon, color: C.goldLight,
                fontSize: 14, cursor: "pointer", fontFamily: "inherit",
              }}>
                Start Shopping
              </button>
            </Link>
          </div>
        ) : (
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 320px", gap: 40,
          }} className="cart-grid">
            
            {/* ─── CART ITEMS LIST ─── */}
            <div>
              {cartItems.map((item) => {
                const isExpanded = expandedDescriptions[item.id];
                const description = item.product?.description || "No description available for this product.";
                const isOutOfStock = item.product?.stock <= 0;
                
                return (
                  <div key={item.id} style={{ padding: "20px 0", borderBottom: `1px solid ${C.goldPale}` }}>
                    <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                      <div style={{
                        width: 100, height: 100, borderRadius: 12,
                        background: `linear-gradient(135deg, ${C.maroonPale}, ${C.goldPale})`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 40, flexShrink: 0,
                        opacity: isOutOfStock ? 0.5 : 1,
                        overflow: "hidden",
                      }}>
                        {item.product?.images?.[0]?.image_url ? (
                          <img
                            src={item.product.images[0].image_url}
                            alt={item.product.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 12 }}
                          />
                        ) : null}
                      </div>

                      <div style={{ flex: 1 }}>
                        <Link href={`/product/${item.product_id}`} style={{
                          fontSize: 16, fontWeight: 600,
                          color: C.maroonDark, textDecoration: "none",
                        }}>
                          {item.product?.name || "Product"}
                        </Link>
                        <div style={{ fontSize: 13, color: C.textLight, marginTop: 4 }}>
                          {item.product?.category || "Category"}
                        </div>
                        
                        <div style={{ marginTop: 6 }}>
                          <PriceDisplay product={item.product} size="small" />
                        </div>

                        {isOutOfStock && (
                          <div style={{
                            fontSize: 12, color: "#EF4444",
                            fontWeight: 600, marginTop: 4,
                          }}>
                            Out of Stock - Please remove from cart
                          </div>
                        )}

                        <button
                          onClick={() => toggleDescription(item.id)}
                          style={{
                            backgroundColor: "transparent", border: "none",
                            color: C.gold, fontSize: 12, cursor: "pointer",
                            fontFamily: "inherit", marginTop: 8,
                            display: "flex", alignItems: "center", gap: 6,
                            padding: "4px 0",
                          }}
                        >
                          <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} style={{ fontSize: 12 }} />
                          {isExpanded ? "Hide Description" : "View Description"}
                        </button>

                        {isExpanded && (
                          <div style={{
                            marginTop: 10, padding: "12px 16px",
                            backgroundColor: C.whiteOff, borderRadius: 8,
                            border: `1px solid ${C.goldPale}`,
                            animation: "slideDown 0.3s ease",
                          }}>
                            <p style={{ fontSize: 13, color: C.textMid, lineHeight: 1.6, margin: 0 }}>
                              {description}
                            </p>
                          </div>
                        )}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          disabled={isOutOfStock}
                          style={{
                            width: 32, height: 32, borderRadius: "50%",
                            border: `2px solid ${isOutOfStock ? "#ddd" : C.goldPale}`,
                            backgroundColor: "transparent",
                            color: isOutOfStock ? "#ccc" : C.textMid,
                            fontSize: 18,
                            cursor: isOutOfStock ? "not-allowed" : "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontFamily: "inherit", opacity: isOutOfStock ? 0.5 : 1,
                          }}
                        >
                          −
                        </button>
                        <span style={{ fontSize: 16, fontWeight: 600, color: C.maroonDark, minWidth: 30, textAlign: "center" }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => {
                            if (item.product?.stock > item.quantity) {
                              updateQuantity(item.id, item.quantity + 1);
                            } else {
                              showToast("Maximum stock available", "error");
                            }
                          }}
                          disabled={isOutOfStock}
                          style={{
                            width: 32, height: 32, borderRadius: "50%",
                            border: `2px solid ${isOutOfStock ? "#ddd" : C.goldPale}`,
                            backgroundColor: "transparent",
                            color: isOutOfStock ? "#ccc" : C.textMid,
                            fontSize: 18,
                            cursor: isOutOfStock ? "not-allowed" : "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontFamily: "inherit", opacity: isOutOfStock ? 0.5 : 1,
                          }}
                        >
                          +
                        </button>
                      </div>

                      <div style={{ textAlign: "right", minWidth: 100 }}>
                        <div style={{ fontSize: 18, fontWeight: 700, color: C.maroon }}>
                          Rs. {((item.product?.price || 0) * item.quantity).toLocaleString()}
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          style={{
                            backgroundColor: "transparent", border: "none",
                            color: C.textLight, fontSize: 12, cursor: "pointer",
                            fontFamily: "inherit", textDecoration: "underline", marginTop: 4,
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={clearCart}
                  style={{
                    backgroundColor: "transparent",
                    border: `2px solid ${C.maroon}`,
                    borderRadius: 30, padding: "8px 24px",
                    color: C.maroon, fontSize: 13,
                    cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  Clear Cart
                </button>
              </div>
            </div>

            {/* ─── ORDER SUMMARY ─── */}
            <div style={{
              backgroundColor: C.whiteOff, borderRadius: 20,
              padding: "28px 24px",
              border: `2px solid ${C.goldPale}`,
              height: "fit-content", position: "sticky", top: 100,
            }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: C.maroonDark, marginBottom: 20 }}>
                Order Summary
              </h3>

              <div style={{
                display: "flex", justifyContent: "space-between",
                padding: "12px 0", borderBottom: `1px solid ${C.goldPale}`,
                fontSize: 14, color: C.textMid,
              }}>
                <span>Subtotal ({cartItems.length} items)</span>
                <span style={{ fontWeight: 600 }}>Rs. {total.toLocaleString()}</span>
              </div>

              <div style={{
                display: "flex", justifyContent: "space-between",
                padding: "12px 0", borderBottom: `1px solid ${C.goldPale}`,
                fontSize: 14, color: C.textMid,
              }}>
                <span>Shipping</span>
                <span style={{ fontWeight: 600, color: C.maroon }}>Rs. {DELIVERY_CHARGE.toLocaleString()}</span>
              </div>

              <div style={{
                display: "flex", justifyContent: "space-between",
                padding: "16px 0", fontSize: 20, fontWeight: 700,
                color: C.maroonDark, borderBottom: `2px solid ${C.goldPale}`,
                marginBottom: 20,
              }}>
                <span>Total</span>
                <span style={{ color: C.maroon }}>Rs. {(total + DELIVERY_CHARGE).toLocaleString()}</span>
              </div>

              <button
                onClick={handleCheckout}
                style={{
                  width: "100%", padding: "14px",
                  borderRadius: 12, border: "none",
                  backgroundColor: C.maroon, color: C.goldLight,
                  fontSize: 16, fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Proceed to Checkout
              </button>

              {!user && (
                <p style={{
                  fontSize: 12, color: C.textLight,
                  textAlign: "center", marginTop: 12, lineHeight: 1.5,
                }}>
                  No account required — checkout as guest
                </p>
              )}

              <Link href="/products" style={{
                display: "block", textAlign: "center",
                marginTop: 16, color: C.textLight,
                fontSize: 13, textDecoration: "underline",
              }}>
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>

      <footer style={{
        padding: "28px 24px", textAlign: "center",
        borderTop: `2px solid ${C.goldPale}`,
        backgroundColor: C.whiteOff, marginTop: 40,
      }}>
        <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "0.12em", color: C.maroonDark, marginBottom: 4 }}>
          gleamwave
        </div>
        <div style={{ fontSize: 12, color: C.textLight }}>
          © 2025 Gleamwave · Handcrafted Resin Art · Made with love in Pakistan
        </div>
      </footer>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); max-height: 0; } to { opacity: 1; transform: translateY(0); max-height: 200px; } }
        @media (max-width: 768px) { .cart-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}