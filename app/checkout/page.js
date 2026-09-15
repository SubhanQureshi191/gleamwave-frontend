"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_URL } from "@/lib/config";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

// ── BRAND TOKENS ──────────────────────────────────────────────
const C = {
  white: "#FFFFFF",
  whiteOff: "#FDF8F3",
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
  success: "#10B981",
  error: "#EF4444",
};

const DELIVERY_CHARGES = 200;

export default function Checkout() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ─── FORM STATE ───
  const [formData, setFormData] = useState({
    shipping_name: "",
    email: "",
    shipping_phone: "",
    shipping_address: "",
    city: "",
    postalCode: "",
    billing_address: "",
    sameAsShipping: true,
    payment_method: "cod",
    extra_note: "",
  });

  // ─── CHECK USER & CART ───
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (token && userData) {
      const userObj = JSON.parse(userData);
      setUser(userObj);
      setFormData(prev => ({
        ...prev,
        shipping_name: userObj.name || "",
        email: userObj.email || "",
        shipping_phone: userObj.phone || "",
      }));
      fetchServerCart();
    } else {
      // Guest user
      setUser(null);
      fetchLocalCart();
    }
  }, []);

  // ─── FETCH SERVER CART (Logged In) ───
  const fetchServerCart = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch cart");
      
      setCartItems(data.items || []);
      const subtotalAmount = data.total || 0;
      setSubtotal(subtotalAmount);
      setTotal(subtotalAmount + DELIVERY_CHARGES);
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // ─── FETCH LOCAL CART (Guest) ───
  const fetchLocalCart = async () => {
    try {
      const localCart = JSON.parse(localStorage.getItem("guest_cart") || "[]");
      
      if (localCart.length === 0) {
        setCartItems([]);
        setSubtotal(0);
        setTotal(DELIVERY_CHARGES);
        setLoading(false);
        return;
      }

      const itemsWithProducts = await Promise.all(
        localCart.map(async (item) => {
          try {
            const res = await fetch(`${API_URL}/products/${item.product_id}`);
            if (!res.ok) return null;
            const product = await res.json();
            return {
              id: item.product_id,
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
      setSubtotal(totalAmount);
      setTotal(totalAmount + DELIVERY_CHARGES);
    } catch (error) {
      showToast("Failed to load cart", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "sameAsShipping" && checked) {
      setFormData(prev => ({
        ...prev,
        billing_address: prev.shipping_address,
      }));
    }
  };

  // ─── PLACE ORDER ───
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    // Validate
    if (!formData.shipping_name || !formData.shipping_address || !formData.city) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    if (!formData.email) {
      showToast("Email is required", "error");
      return;
    }

    if (cartItems.length === 0) {
      showToast("Your cart is empty", "error");
      return;
    }

    setSubmitting(true);

    try {
      const orderData = {
        shipping_name: formData.shipping_name,
        shipping_phone: formData.shipping_phone,
        shipping_address: `${formData.shipping_address}, ${formData.city}`,
        billing_address: formData.sameAsShipping 
          ? `${formData.shipping_address}, ${formData.city}`
          : formData.billing_address,
        payment_method: formData.payment_method,
        delivery_charges: DELIVERY_CHARGES,
        extra_note: formData.extra_note || "",
        city: formData.city,
        postalCode: formData.postalCode,
      };

      let res;
      
      if (user) {
        // ─── LOGGED IN USER ───
        const token = localStorage.getItem("token");
        res = await fetch(`${API_URL}/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(orderData),
        });
      } else {
        // ─── GUEST USER ───
        const guestOrderData = {
          ...orderData,
          guest_email: formData.email,
          items: cartItems.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
          })),
        };
        
        res = await fetch(`${API_URL}/guest/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(guestOrderData),
        });
      }

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to place order");
      }

      const orderId = data.id || data.order?.id;
      setPlacedOrderId(orderId);
      setOrderPlaced(true);
      
      showToast("Order placed successfully! Confirmation email sent.", "success");
      
      // ─── CLEAR CART ───
      if (user) {
        await clearServerCart();
      } else {
        localStorage.removeItem("guest_cart");
      }
      
      // Redirect after 4 seconds
      setTimeout(() => {
        if (user) {
          router.push("/profile");
        } else {
          router.push(`/order-success?order_id=${orderId}&email=${encodeURIComponent(formData.email)}`);
        }
      }, 4000);

    } catch (error) {
      console.error("Order error:", error);
      showToast(error.message || "Failed to place order", "error");
      setOrderPlaced(false);
    } finally {
      setSubmitting(false);
    }
  };

  const clearServerCart = async () => {
    try {
      const token = localStorage.getItem("token");
      const cartRes = await fetch(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const cartData = await cartRes.json();
      
      if (cartData.items && cartData.items.length > 0) {
        for (const item of cartData.items) {
          await fetch(`${API_URL}/cart/${item.id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: "flex", justifyContent: "center", alignItems: "center",
        height: "100vh", backgroundColor: C.white,
      }}>
        <div style={{ fontSize: 24, color: C.maroon }}>Loading checkout...</div>
      </div>
    );
  }

  // ─── EMPTY CART ───
  if (cartItems.length === 0 && !orderPlaced) {
    return (
      <div style={{
        backgroundColor: C.white, color: C.text,
        fontFamily: "'Georgia', 'Times New Roman', serif",
        minHeight: "100vh",
      }}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <Navbar
          activePage="checkout"
          onMenuClick={() => setSidebarOpen(true)}
          onLoginClick={() => router.push("/")}
        />
        <div style={{
          minHeight: "calc(100vh - 68px)", paddingTop: "68px",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{ textAlign: "center", padding: "40px" }}>
            <h2 style={{ fontSize: 28, color: C.maroonDark, marginBottom: 12 }}>
              Your cart is empty
            </h2>
            <p style={{ color: C.textLight, marginBottom: 24 }}>
              Add some items to your cart before checking out.
            </p>
            <Link href="/products">
              <button style={{
                padding: "12px 32px", borderRadius: 50, border: "none",
                backgroundColor: C.maroon, color: C.goldLight,
                fontSize: 14, cursor: "pointer", fontFamily: "inherit",
              }}>
                Continue Shopping
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: C.white, color: C.text,
      fontFamily: "'Georgia', 'Times New Roman', serif",
      minHeight: "100vh", paddingTop: "80px",
    }}>
      {/* ── TOAST ── */}
      {toast && (
        <div style={{
          position: "fixed", top: 24, right: 24, zIndex: 999,
          backgroundColor: toast.type === "error" ? C.error : C.success,
          color: C.white, padding: "12px 20px", borderRadius: 14,
          fontSize: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          animation: "fadeIn 0.3s ease", maxWidth: "400px",
        }}>
          {toast.message}
        </div>
      )}

      {/* ─── SUCCESS OVERLAY ─── */}
      {orderPlaced && (
        <div style={{
          position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(8px)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "20px",
        }}>
          <div style={{
            backgroundColor: C.white, borderRadius: 24,
            padding: "48px 40px", maxWidth: "500px", width: "100%",
            textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              backgroundColor: C.success, color: "white",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 40, margin: "0 auto 20px",
            }}>
              ✓
            </div>
            <h2 style={{ fontSize: 26, color: C.maroonDark, marginBottom: 8 }}>
              Order Placed!
            </h2>
            <p style={{ color: C.textMid, marginBottom: 6 }}>
              Order ID: <strong>#{placedOrderId}</strong>
            </p>
            <p style={{ color: C.textLight, fontSize: 14, marginBottom: 20 }}>
              A confirmation email has been sent to <strong>{formData.email}</strong>
            </p>
            <p style={{ color: C.textLight, fontSize: 13 }}>
              Redirecting... Please wait
            </p>
          </div>
        </div>
      )}

      {/* ─── SIDEBAR ── */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ─── NAVBAR ── */}
      <Navbar
        activePage="checkout"
        onMenuClick={() => setSidebarOpen(true)}
        onLoginClick={() => router.push("/")}
      />

      {/* ─── CHECKOUT CONTENT ─── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
        
        {/* ─── GUEST INDICATOR ─── */}
        {!user && (
          <div style={{
            backgroundColor: C.goldPale,
            border: `1px solid ${C.gold}`,
            borderRadius: 12,
            padding: "12px 18px",
            marginBottom: 24,
            fontSize: 13,
            color: C.textMid,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}>
            <span>
              <strong>Guest Checkout:</strong> No account needed. Just fill your details below.
            </span>
          </div>
        )}

        <h1 style={{
          fontSize: "clamp(2rem, 3vw, 2.8rem)", fontWeight: 700,
          color: C.maroonDark, marginBottom: 8,
        }}>
          Checkout
        </h1>
        <p style={{ color: C.textLight, marginBottom: 32 }}>
          Fill in your details to complete your order
        </p>

        <div style={{
          display: "grid", gridTemplateColumns: "1fr 380px", gap: 40,
        }} className="checkout-grid">
          
          {/* ─── LEFT: FORM ─── */}
          <div>
            <form onSubmit={handlePlaceOrder}>
              {/* Personal Information */}
              <div style={{
                backgroundColor: C.whiteOff, borderRadius: 16,
                padding: "24px", marginBottom: 24,
                border: `2px solid ${C.goldPale}`,
              }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: C.maroonDark, marginBottom: 16 }}>
                  Personal Information
                </h3>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 14, fontWeight: 500, color: C.textMid, display: "block", marginBottom: 4 }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="shipping_name"
                    value={formData.shipping_name}
                    onChange={handleChange}
                    style={{
                      width: "100%", padding: "12px 16px",
                      borderRadius: 12, border: `2px solid ${C.goldPale}`,
                      fontSize: 14, fontFamily: "inherit", outline: "none",
                      backgroundColor: C.white,
                    }}
                    onFocus={(e) => e.target.style.borderColor = C.maroon}
                    onBlur={(e) => e.target.style.borderColor = C.goldPale}
                    required
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 14, fontWeight: 500, color: C.textMid, display: "block", marginBottom: 4 }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      style={{
                        width: "100%", padding: "12px 16px",
                        borderRadius: 12, border: `2px solid ${C.goldPale}`,
                        fontSize: 14, fontFamily: "inherit", outline: "none",
                        backgroundColor: C.white,
                      }}
                      onFocus={(e) => e.target.style.borderColor = C.maroon}
                      onBlur={(e) => e.target.style.borderColor = C.goldPale}
                      required
                    />
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 14, fontWeight: 500, color: C.textMid, display: "block", marginBottom: 4 }}>
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="shipping_phone"
                      value={formData.shipping_phone}
                      onChange={handleChange}
                      style={{
                        width: "100%", padding: "12px 16px",
                        borderRadius: 12, border: `2px solid ${C.goldPale}`,
                        fontSize: 14, fontFamily: "inherit", outline: "none",
                        backgroundColor: C.white,
                      }}
                      onFocus={(e) => e.target.style.borderColor = C.maroon}
                      onBlur={(e) => e.target.style.borderColor = C.goldPale}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div style={{
                backgroundColor: C.whiteOff, borderRadius: 16,
                padding: "24px", marginBottom: 24,
                border: `2px solid ${C.goldPale}`,
              }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: C.maroonDark, marginBottom: 16 }}>
                  Shipping Address
                </h3>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 14, fontWeight: 500, color: C.textMid, display: "block", marginBottom: 4 }}>
                    Address *
                  </label>
                  <input
                    type="text"
                    name="shipping_address"
                    value={formData.shipping_address}
                    onChange={handleChange}
                    placeholder="Street address, house number"
                    style={{
                      width: "100%", padding: "12px 16px",
                      borderRadius: 12, border: `2px solid ${C.goldPale}`,
                      fontSize: 14, fontFamily: "inherit", outline: "none",
                      backgroundColor: C.white,
                    }}
                    onFocus={(e) => e.target.style.borderColor = C.maroon}
                    onBlur={(e) => e.target.style.borderColor = C.goldPale}
                    required
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 14, fontWeight: 500, color: C.textMid, display: "block", marginBottom: 4 }}>
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="e.g., Lahore"
                      style={{
                        width: "100%", padding: "12px 16px",
                        borderRadius: 12, border: `2px solid ${C.goldPale}`,
                        fontSize: 14, fontFamily: "inherit", outline: "none",
                        backgroundColor: C.white,
                      }}
                      onFocus={(e) => e.target.style.borderColor = C.maroon}
                      onBlur={(e) => e.target.style.borderColor = C.goldPale}
                      required
                    />
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 14, fontWeight: 500, color: C.textMid, display: "block", marginBottom: 4 }}>
                      Postal Code
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      placeholder="e.g., 54000"
                      style={{
                        width: "100%", padding: "12px 16px",
                        borderRadius: 12, border: `2px solid ${C.goldPale}`,
                        fontSize: 14, fontFamily: "inherit", outline: "none",
                        backgroundColor: C.white,
                      }}
                      onFocus={(e) => e.target.style.borderColor = C.maroon}
                      onBlur={(e) => e.target.style.borderColor = C.goldPale}
                    />
                  </div>
                </div>
              </div>

              {/* Billing Address */}
              <div style={{
                backgroundColor: C.whiteOff, borderRadius: 16,
                padding: "24px", marginBottom: 24,
                border: `2px solid ${C.goldPale}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <input
                    type="checkbox"
                    name="sameAsShipping"
                    checked={formData.sameAsShipping}
                    onChange={handleChange}
                    style={{ width: 18, height: 18, accentColor: C.maroon, cursor: "pointer" }}
                  />
                  <label style={{ fontSize: 14, fontWeight: 500, color: C.textMid, cursor: "pointer" }}>
                    Billing address same as shipping
                  </label>
                </div>

                {!formData.sameAsShipping && (
                  <div>
                    <label style={{ fontSize: 14, fontWeight: 500, color: C.textMid, display: "block", marginBottom: 4 }}>
                      Billing Address *
                    </label>
                    <input
                      type="text"
                      name="billing_address"
                      value={formData.billing_address}
                      onChange={handleChange}
                      placeholder="Enter billing address"
                      style={{
                        width: "100%", padding: "12px 16px",
                        borderRadius: 12, border: `2px solid ${C.goldPale}`,
                        fontSize: 14, fontFamily: "inherit", outline: "none",
                        backgroundColor: C.white,
                      }}
                      onFocus={(e) => e.target.style.borderColor = C.maroon}
                      onBlur={(e) => e.target.style.borderColor = C.goldPale}
                    />
                  </div>
                )}
              </div>

              {/* Order Instructions */}
              <div style={{
                backgroundColor: C.whiteOff, borderRadius: 16,
                padding: "24px", marginBottom: 24,
                border: `2px solid ${C.goldPale}`,
              }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: C.maroonDark, marginBottom: 16 }}>
                  Order Instructions
                </h3>
                <p style={{ fontSize: 13, color: C.textLight, marginBottom: 12 }}>
                  Any special instructions or delivery notes? Let us know!
                </p>
                <textarea
                  name="extra_note"
                  value={formData.extra_note}
                  onChange={handleChange}
                  rows={3}
                  placeholder="e.g., Please deliver after 5 PM, Gift wrapping required, etc."
                  style={{
                    width: "100%", padding: "12px 16px",
                    borderRadius: 12, border: `2px solid ${C.goldPale}`,
                    fontSize: 14, fontFamily: "inherit", outline: "none",
                    backgroundColor: C.white, resize: "vertical",
                  }}
                  onFocus={(e) => e.target.style.borderColor = C.maroon}
                  onBlur={(e) => e.target.style.borderColor = C.goldPale}
                />
              </div>

              {/* Payment Method */}
              <div style={{
                backgroundColor: C.whiteOff, borderRadius: 16,
                padding: "24px", marginBottom: 24,
                border: `2px solid ${C.goldPale}`,
              }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: C.maroonDark, marginBottom: 16 }}>
                  Payment Method
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <label style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "14px 16px", borderRadius: 12,
                    border: `2px solid ${formData.payment_method === "cod" ? C.maroon : C.goldPale}`,
                    backgroundColor: formData.payment_method === "cod" ? C.goldPale : C.white,
                    cursor: "pointer",
                  }}>
                    <input
                      type="radio"
                      name="payment_method"
                      value="cod"
                      checked={formData.payment_method === "cod"}
                      onChange={handleChange}
                      style={{ accentColor: C.maroon, width: 18, height: 18 }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, color: C.text }}>Cash on Delivery</div>
                      <div style={{ fontSize: 12, color: C.textLight }}>Pay when you receive your order</div>
                    </div>
                  </label>

                  <label style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "14px 16px", borderRadius: 12,
                    border: `2px solid ${formData.payment_method === "easypaisa" ? C.maroon : C.goldPale}`,
                    backgroundColor: formData.payment_method === "easypaisa" ? C.goldPale : C.white,
                    cursor: "pointer",
                  }}>
                    <input
                      type="radio"
                      name="payment_method"
                      value="easypaisa"
                      checked={formData.payment_method === "easypaisa"}
                      onChange={handleChange}
                      style={{ accentColor: C.maroon, width: 18, height: 18 }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, color: C.text }}>EasyPaisa</div>
                      <div style={{ fontSize: 13, color: C.textLight }}>
                        Account: 03192206562 • Ariba Atiq
                      </div>
                      {formData.payment_method === "easypaisa" && (
                        <div style={{
                          marginTop: 8, padding: "12px 16px",
                          backgroundColor: "#FEF3C7", borderRadius: 8,
                          fontSize: 13, color: "#92400E", lineHeight: 1.5,
                        }}>
                          Please send payment to the above EasyPaisa account and share screenshot on WhatsApp.
                          <br />
                          <span style={{ fontWeight: 600 }}>Account Title:</span> Ariba Atiq
                          <br />
                          <span style={{ fontWeight: 600 }}>Account Number:</span> 031922206562
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: "100%", padding: "16px",
                  borderRadius: 14, border: "none",
                  backgroundColor: submitting ? C.textLight : C.maroon,
                  color: C.goldLight, fontSize: 16, fontWeight: 600,
                  cursor: submitting ? "not-allowed" : "pointer",
                  fontFamily: "inherit", opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? "Placing Order..." : "Place Order"}
              </button>

              <p style={{
                textAlign: "center", fontSize: 12,
                color: C.textLight, marginTop: 12,
              }}>
                You will receive a confirmation email after placing order
              </p>
            </form>
          </div>

          {/* ─── RIGHT: ORDER SUMMARY ─── */}
          <div style={{
            backgroundColor: C.whiteOff, borderRadius: 16,
            padding: "24px", border: `2px solid ${C.goldPale}`,
            height: "fit-content", position: "sticky", top: 100,
          }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: C.maroonDark, marginBottom: 16 }}>
              Order Summary
            </h3>

            <div style={{ maxHeight: 300, overflowY: "auto", marginBottom: 16 }}>
              {cartItems.map((item) => (
                <div key={item.id} style={{
                  display: "flex", gap: 12,
                  padding: "12px 0", borderBottom: `1px solid ${C.goldPale}`,
                }}>
                  <div style={{
                    width: 50, height: 50, borderRadius: 8,
                    background: `linear-gradient(135deg, ${C.maroonPale}, ${C.goldPale})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 24, flexShrink: 0, overflow: "hidden",
                  }}>
                    {item.product?.images?.[0]?.image_url ? (
                      <img
                        src={item.product.images[0].image_url}
                        alt={item.product.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }}
                      />
                    ) : null}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.maroonDark }}>
                      {item.product?.name || "Product"}
                    </div>
                    <div style={{ fontSize: 12, color: C.textLight }}>
                      Qty: {item.quantity}
                    </div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.maroon }}>
                    Rs. {((item.product?.price || 0) * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ paddingTop: 16, borderTop: `2px solid ${C.goldPale}` }}>
              <div style={{
                display: "flex", justifyContent: "space-between",
                padding: "8px 0", fontSize: 14, color: C.textMid,
              }}>
                <span>Subtotal</span>
                <span>Rs. {subtotal.toLocaleString()}</span>
              </div>
              <div style={{
                display: "flex", justifyContent: "space-between",
                padding: "8px 0", fontSize: 14, color: C.textMid,
              }}>
                <span>Delivery Charges</span>
                <span style={{ fontWeight: 600, color: C.maroon }}>
                  Rs. {DELIVERY_CHARGES.toLocaleString()}
                </span>
              </div>
              <div style={{
                display: "flex", justifyContent: "space-between",
                padding: "16px 0 8px", fontSize: 22, fontWeight: 700,
                color: C.maroonDark, borderTop: `2px solid ${C.goldPale}`,
              }}>
                <span>Total</span>
                <span style={{ color: C.maroon }}>Rs. {total.toLocaleString()}</span>
              </div>
            </div>

            <Link href="/cart" style={{
              display: "block", textAlign: "center",
              marginTop: 16, color: C.textLight,
              fontSize: 13, textDecoration: "underline",
            }}>
              ← Back to Cart
            </Link>
          </div>
        </div>
      </div>

      <footer style={{
        padding: "28px 24px", textAlign: "center",
        borderTop: `2px solid ${C.goldPale}`,
        backgroundColor: C.whiteOff, marginTop: 40,
      }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.maroonDark, marginBottom: 4 }}>
          gleamwave
        </div>
        <div style={{ fontSize: 12, color: C.textLight }}>
          © 2025 Gleamwave · Handcrafted Resin Art · Made with Love in Pakistan
        </div>
      </footer>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          .checkout-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}