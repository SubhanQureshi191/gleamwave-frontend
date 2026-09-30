"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ── Components ──
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { API_URL } from "@/lib/config";
import { generateInvoiceHTML } from "@/lib/invoiceTemplate";

// ── BRAND TOKENS ──────────────────────────────────────────────
const C = {
  white: "#FFFFFF",
  whiteOff: "#FDF8F3",
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
  confirmed: "#3B82F6",
  shipped: "#8B5CF6",
  delivered: "#10B981",
  cancelled: "#EF4444",
  pending: "#F59E0B",
};


// ─── DOWNLOAD INVOICE ───────────────────────────────────────────
const downloadInvoice = async (orderId, showToast) => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to fetch order details");

    const order = await res.json();
    const html = generateInvoiceHTML(order);

    const win = window.open("", "_blank", "width=800,height=600,scrollbars=yes");

    if (win) {
      win.document.write(html);
      win.document.close();
    } else {
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Invoice_Order_${orderId}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error("Error generating invoice:", error);
    if (showToast) {
      showToast("Failed to generate invoice: " + error.message, "error");
    }
  }
};

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (!token || !userData) {
      router.push("/");
      return;
    }
    
    setUser(JSON.parse(userData));
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch orders");
      setOrders(data);
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleOrderDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return C.confirmed;
      case 'shipped': return C.shipped;
      case 'delivered': return C.delivered;
      case 'cancelled': return C.cancelled;
      default: return C.pending;
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'pending': return 'Pending';
      case 'confirmed': return 'Confirmed';
      case 'shipped': return 'Shipped';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const handleLogoutClick = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setOrders([]);
    showToast("Logged out successfully");
    setTimeout(() => {
      router.push("/");
    }, 1000);
  };

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: C.white,
      }}>
        <div style={{ fontSize: 24, color: C.maroon }}>Loading profile...</div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: C.white,
      color: C.text,
      fontFamily: "'Georgia', 'Times New Roman', serif",
      minHeight: "100vh",
      paddingTop: "100px",
    }}>
      {/* ── TOAST ── */}
      {toast && (
        <div style={{
          position: "fixed",
          top: 24,
          right: 24,
          zIndex: 9999,
          backgroundColor: toast.type === "error" ? "#EF4444" : C.maroon,
          color: C.goldLight,
          padding: "12px 20px",
          borderRadius: 14,
          fontSize: 14,
          boxShadow: "0 8px 32px rgba(74,46,34,0.3)",
          animation: "fadeIn 0.3s ease",
        }}>
          {toast.message}
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
        activePage="profile"
        user={user}
        onMenuClick={() => setMobileMenu(true)}
        onLoginClick={() => router.push("/")}
        onSignupClick={() => router.push("/")}
        onLogoutClick={handleLogoutClick}
      />

      {/* ─── PROFILE CONTENT ─── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
        {/* User Info */}
        <div style={{
          backgroundColor: C.whiteOff,
          borderRadius: 16,
          padding: "32px",
          border: `2px solid ${C.goldPale}`,
          marginBottom: 32,
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            flexWrap: "wrap",
          }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              backgroundColor: C.maroon,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              fontWeight: 700,
              color: C.goldLight,
              fontFamily: "'Georgia', serif",
            }}>
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: C.maroonDark, marginBottom: 4 }}>
                {user?.name || "User"}
              </h1>
              <p style={{ color: C.textLight, fontSize: 15 }}>
                {user?.email || "Not provided"}
              </p>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <span style={{
                backgroundColor: C.goldPale,
                padding: "6px 16px",
                borderRadius: 20,
                fontSize: 12,
                color: C.textMid,
              }}>
                {orders.length} Order{orders.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
            flexWrap: "wrap",
            gap: 12,
          }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: C.maroonDark }}>
              My Orders
            </h2>
            <button
              onClick={fetchOrders}
              style={{
                padding: "8px 20px",
                borderRadius: 30,
                border: `2px solid ${C.gold}`,
                backgroundColor: "transparent",
                color: C.gold,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = C.gold;
                e.target.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
                e.target.style.color = C.gold;
              }}
            >
              Refresh
            </button>
          </div>

          {orders.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "60px 20px",
              backgroundColor: C.whiteOff,
              borderRadius: 16,
              border: `2px solid ${C.goldPale}`,
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
              <h3 style={{ fontSize: 20, color: C.textMid }}>No orders yet</h3>
              <p style={{ color: C.textLight, marginBottom: 16 }}>You haven't placed any orders yet.</p>
              <Link href="/products">
                <button style={{
                  padding: "10px 28px",
                  borderRadius: 30,
                  border: "none",
                  backgroundColor: C.maroon,
                  color: C.goldLight,
                  fontSize: 14,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}>
                  Start Shopping
                </button>
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {orders.map((order) => {
                const isExpanded = expandedOrder === order.id;
                return (
                  <div
                    key={order.id}
                    style={{
                      backgroundColor: C.whiteOff,
                      borderRadius: 16,
                      padding: "20px 24px",
                      border: `1px solid ${C.goldPale}`,
                      transition: "all 0.3s",
                      cursor: "pointer",
                    }}
                    onClick={() => toggleOrderDetails(order.id)}
                  >
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: 12,
                    }}>
                      <div>
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          flexWrap: "wrap",
                        }}>
                          <h3 style={{ fontSize: 18, fontWeight: 600, color: C.maroonDark, display: "flex", alignItems: "center", gap: 8 }}>
                            Order #{order.id}
                          </h3>
                          <span style={{
                            padding: "4px 14px",
                            borderRadius: 20,
                            fontSize: 12,
                            fontWeight: 600,
                            backgroundColor: getStatusColor(order.status) + "22",
                            color: getStatusColor(order.status),
                          }}>
                            {getStatusLabel(order.status)}
                          </span>

                          {/* ─── INVOICE BUTTON ─── */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadInvoice(order.id, showToast);
                            }}
                            style={{
                              padding: "6px 16px",
                              borderRadius: 20,
                              border: "none",
                              backgroundColor: "#4A2E22",
                              color: "#fdf8f3",
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              fontFamily: "inherit",
                              transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = "#6F4E37";
                              e.target.style.transform = "scale(1.05)";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = "#4A2E22";
                              e.target.style.transform = "scale(1)";
                            }}
                          >
                            Invoice
                          </button>
                        </div>
                        <p style={{ fontSize: 13, color: C.textLight, marginTop: 4 }}>
                          {order.created_at}
                        </p>
                      </div>
                      <div style={{
                        fontSize: 20,
                        fontWeight: 700,
                        color: C.maroon,
                      }}>
                        Rs. {order.total_amount?.toLocaleString()}
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={{
                        marginTop: 16,
                        paddingTop: 16,
                        borderTop: `1px solid ${C.goldPale}`,
                      }}>
                        <div style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 12,
                          marginBottom: 16,
                        }}>
                          <div>
                            <div style={{ fontSize: 13, color: C.textMid }}>
                              <strong>Customer:</strong> {order.shipping_name}
                            </div>
                            <div style={{ fontSize: 13, color: C.textMid }}>
                              <strong>Phone:</strong> {order.shipping_phone}
                            </div>
                            <div style={{ fontSize: 13, color: C.textMid }}>
                              <strong>Payment:</strong> {order.payment_method === "cod" ? "Cash on Delivery" : "EasyPaisa"}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: 13, color: C.textMid }}>
                              <strong>Subtotal:</strong> Rs. {order.subtotal?.toLocaleString() || 0}
                            </div>
                            <div style={{ fontSize: 13, color: C.textMid }}>
                              <strong>Delivery:</strong> Rs. {order.delivery_charges?.toLocaleString() || 300}
                            </div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: C.maroon }}>
                              <strong>Total:</strong> Rs. {order.total_amount?.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        <div style={{
                          marginBottom: 16,
                          padding: "12px 16px",
                          backgroundColor: C.white,
                          borderRadius: 8,
                          border: `1px solid ${C.goldPale}`,
                        }}>
                          <div style={{ fontSize: 13, color: C.textMid }}>
                            <strong>Shipping Address:</strong> {order.shipping_address}
                          </div>
                          {order.extra_note && (
                            <div style={{ fontSize: 13, color: C.textMid, marginTop: 4 }}>
                              <strong>Note:</strong> {order.extra_note}
                            </div>
                          )}
                        </div>

                        <div>
                          <h4 style={{ fontSize: 14, fontWeight: 600, color: C.maroonDark, marginBottom: 12 }}>
                            Order Items ({order.items?.length || 0})
                          </h4>
                          {order.items && order.items.length > 0 ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              {order.items.map((item, idx) => (
                                <div
                                  key={idx}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12,
                                    padding: "10px 14px",
                                    backgroundColor: C.white,
                                    borderRadius: 10,
                                    border: `1px solid ${C.goldPale}`,
                                  }}
                                >
                                  <div style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 8,
                                    background: `linear-gradient(135deg, #f5ede0, #e8d9c0)`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 20,
                                    flexShrink: 0,
                                  }}>
                                    🎨
                                  </div>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: C.maroonDark }}>
                                      {item.product_name}
                                    </div>
                                    <div style={{ fontSize: 12, color: C.textLight }}>
                                      Qty: {item.quantity} × Rs. {item.price?.toLocaleString() || 0}
                                    </div>
                                  </div>
                                  <div style={{
                                    fontSize: 15,
                                    fontWeight: 700,
                                    color: C.maroon,
                                  }}>
                                    Rs. {((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div style={{ fontSize: 13, color: C.textLight }}>
                              No items found for this order.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ─── FOOTER ─── */}
      <footer style={{
        padding: "28px 24px",
        textAlign: "center",
        borderTop: `2px solid ${C.goldPale}`,
        backgroundColor: C.whiteOff,
        marginTop: 40,
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
      `}</style>
    </div>
  );
}