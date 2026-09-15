"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_URL } from "@/lib/config";

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
};

export default function Orders() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
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
      setToast(error.message);
      setTimeout(() => setToast(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#F59E0B";
      case "confirmed":
        return "#3B82F6";
      case "shipped":
        return "#8B5CF6";
      case "delivered":
        return "#10B981";
      case "cancelled":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "confirmed":
        return "Confirmed";
      case "shipped":
        return "Shipped";
      case "delivered":
        return "Delivered";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: C.white,
        }}
      >
        <div style={{ fontSize: 24, color: C.maroon }}>Loading orders...</div>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: C.white,
        color: C.text,
        fontFamily: "'Georgia', 'Times New Roman', serif",
        minHeight: "100vh",
        paddingTop: "80px",
      }}
    >
      {/* ── TOAST ── */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 24,
            right: 24,
            zIndex: 999,
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

      {/* ─── NAVBAR ── */}
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
          <Link href="/">
            <div>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  color: C.maroon,
                }}
              >
                gleamwave
              </div>
              <div
                style={{
                  fontSize: 9,
                  letterSpacing: "0.35em",
                  color: C.gold,
                  textTransform: "uppercase",
                  marginTop: -2,
                }}
              >
                Handcrafted Resin Art
              </div>
            </div>
          </Link>
          <div
            style={{
              display: "flex",
              gap: 32,
              fontSize: 13,
              letterSpacing: "0.1em",
              alignItems: "center",
            }}
          >
            <Link href="/" style={{ color: C.textMid, textDecoration: "none" }}>
              Home
            </Link>
            <Link
              href="/products"
              style={{ color: C.textMid, textDecoration: "none" }}
            >
              Shop
            </Link>
            <Link
              href="/orders"
              style={{
                color: C.maroon,
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              My Orders ({orders.length})
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── CONTENT ─── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
        <h1
          style={{
            fontSize: "clamp(2rem, 3vw, 2.8rem)",
            fontWeight: 700,
            color: C.maroonDark,
            marginBottom: 8,
          }}
        >
          My Orders
        </h1>
        <p style={{ color: C.textLight, marginBottom: 32 }}>
          {orders.length > 0
            ? `You have ${orders.length} order${orders.length > 1 ? "s" : ""}`
            : "You haven't placed any orders yet"}
        </p>

        {orders.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px 20px",
              backgroundColor: C.whiteOff,
              borderRadius: 24,
            }}
          >
            <h2
              style={{ fontSize: 24, color: C.maroonDark, marginBottom: 12 }}
            >
              No orders yet
            </h2>
            <p style={{ color: C.textLight, marginBottom: 24 }}>
              Start shopping and place your first order!
            </p>
            <Link href="/products">
              <button
                style={{
                  padding: "12px 32px",
                  borderRadius: 50,
                  border: "none",
                  backgroundColor: C.maroon,
                  color: C.goldLight,
                  fontSize: 14,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "transform 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "scale(1)";
                }}
              >
                Start Shopping
              </button>
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {orders.map((order) => (
              <div
                key={order.id}
                style={{
                  backgroundColor: C.whiteOff,
                  borderRadius: 16,
                  padding: "24px",
                  border: `1px solid ${C.goldPale}`,
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 32px rgba(0,0,0,0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: 12,
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        flexWrap: "wrap",
                      }}
                    >
                      <h3
                        style={{
                          fontSize: 18,
                          fontWeight: 600,
                          color: C.maroonDark,
                        }}
                      >
                        Order #{order.id}
                      </h3>
                      <span
                        style={{
                          padding: "4px 14px",
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600,
                          backgroundColor: getStatusColor(order.status) + "22",
                          color: getStatusColor(order.status),
                        }}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: C.textLight, marginTop: 4 }}>
                      Placed on {order.created_at}
                    </p>
                  </div>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: C.maroon,
                    }}
                  >
                    Rs. {order.total_amount.toLocaleString()}
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 16,
                    paddingTop: 16,
                    borderTop: `1px solid ${C.goldPale}`,
                  }}
                >
                  <div style={{ fontSize: 13, color: C.textMid }}>
                    <strong>Shipping Address:</strong> {order.shipping_address}
                  </div>
                  <div style={{ fontSize: 13, color: C.textMid, marginTop: 4 }}>
                    <strong>Payment:</strong>{" "}
                    {order.payment_method === "cod"
                      ? "Cash on Delivery"
                      : "EasyPaisa"}
                  </div>
                  {order.extra_note && (
                    <div
                      style={{
                        marginTop: 8,
                        padding: "8px 12px",
                        backgroundColor: C.goldPale,
                        borderRadius: 8,
                        fontSize: 13,
                        color: C.textMid,
                      }}
                    >
                      <strong>Note:</strong> {order.extra_note}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── FOOTER ─── */}
      <footer
        style={{
          padding: "28px 24px",
          textAlign: "center",
          borderTop: `2px solid ${C.goldPale}`,
          backgroundColor: C.whiteOff,
          marginTop: 40,
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: "0.12em",
            color: C.maroonDark,
            marginBottom: 4,
          }}
        >
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