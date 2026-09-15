"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { API_URL } from "@/lib/config";

const C = {
  white: "#FFFFFF",
  whiteOff: "#FDF8F3",
  maroon: "#6F4E37",
  maroonDark: "#4A2E22",
  maroonPale: "#F0E6DA",
  gold: "#B8956A",
  goldLight: "#E8D9C0",
  goldPale: "#F5EDE0",
  text: "#3D2B1F",
  textMid: "#6B4F3A",
  textLight: "#A08070",
  success: "#10B981",
  confirmed: "#3B82F6",
  shipped: "#8B5CF6",
  delivered: "#10B981",
  cancelled: "#EF4444",
  pending: "#F59E0B",
};

function OrderSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const orderId = searchParams.get("order_id");
  const email = searchParams.get("email");

  useEffect(() => {
    if (!orderId || !email) {
      setError("Order information missing");
      setLoading(false);
      return;
    }
    fetchOrder();
  }, [orderId, email]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`${API_URL}/guest/orders/${orderId}?email=${encodeURIComponent(email)}`);
      if (!res.ok) throw new Error("Failed to fetch order");
      const data = await res.json();
      setOrder(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div style={{
        display: "flex", justifyContent: "center", alignItems: "center",
        height: "100vh", backgroundColor: C.white,
      }}>
        <div style={{ fontSize: 20, color: C.maroon }}>Loading order details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", justifyContent: "center",
        alignItems: "center", height: "100vh",
        backgroundColor: C.white, padding: "20px", textAlign: "center",
      }}>
        <h1 style={{ color: C.maroonDark, marginBottom: 16 }}>Order Not Found</h1>
        <p style={{ color: C.textLight, marginBottom: 24 }}>{error}</p>
        <Link href="/">
          <button style={{
            padding: "12px 32px", borderRadius: 50, border: "none",
            backgroundColor: C.maroon, color: C.goldLight,
            fontSize: 14, cursor: "pointer", fontFamily: "inherit",
          }}>
            Go Home
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: C.white, color: C.text,
      fontFamily: "'Georgia', 'Times New Roman', serif",
      minHeight: "100vh", paddingTop: "80px", paddingBottom: "40px",
    }}>
      {/* ─── NAVBAR ─── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        backgroundColor: "rgba(255,255,255,0.96)", backdropFilter: "blur(12px)",
        borderBottom: `2px solid ${C.goldPale}`, padding: "0 24px",
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto", display: "flex",
          alignItems: "center", justifyContent: "space-between", height: 68,
        }}>
          <Link href="/">
            <div>
              <div style={{ fontSize: 26, fontWeight: 700, color: C.maroon }}>gleamwave</div>
              <div style={{ fontSize: 9, color: C.gold, textTransform: "uppercase" }}>
                Handcrafted Resin Art
              </div>
            </div>
          </Link>
          <Link href="/products" style={{ color: C.textMid, textDecoration: "none" }}>
            Continue Shopping
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 24px" }}>
        
        {/* ─── SUCCESS HEADER ─── */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            width: 90, height: 90, borderRadius: "50%",
            backgroundColor: C.success, color: "white",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 48, margin: "0 auto 20px",
            boxShadow: `0 10px 40px ${C.success}40`,
          }}>
            ✓
          </div>
          <h1 style={{
            fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 700,
            color: C.maroonDark, marginBottom: 12,
          }}>
            Order Confirmed!
          </h1>
          <p style={{ color: C.textMid, fontSize: 16, marginBottom: 8 }}>
            Thank you for your order, <strong>{order?.shipping_name}</strong>
          </p>
          <p style={{ color: C.textLight, fontSize: 14 }}>
            A confirmation email has been sent to <strong>{order?.guest_email}</strong>
          </p>
        </div>

        {/* ─── ORDER DETAILS CARD ─── */}
        <div style={{
          backgroundColor: C.whiteOff, borderRadius: 16,
          padding: "28px", border: `2px solid ${C.goldPale}`,
          marginBottom: 24,
        }}>
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", marginBottom: 20,
            paddingBottom: 16, borderBottom: `1px solid ${C.goldPale}`,
            flexWrap: "wrap", gap: 12,
          }}>
            <div>
              <div style={{ fontSize: 13, color: C.textLight, marginBottom: 4 }}>Order ID</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: C.maroonDark }}>
                #{order?.id}
              </div>
            </div>
            <span style={{
              padding: "6px 16px", borderRadius: 20,
              fontSize: 13, fontWeight: 600,
              backgroundColor: getStatusColor(order?.status) + "22",
              color: getStatusColor(order?.status),
              textTransform: "uppercase",
            }}>
              {order?.status}
            </span>
          </div>

          {/* Customer Details */}
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: C.maroonDark, marginBottom: 10 }}>
              Customer Details
            </h3>
            <div style={{ fontSize: 14, color: C.textMid, lineHeight: 1.8 }}>
              <div><strong>Name:</strong> {order?.shipping_name}</div>
              <div><strong>Phone:</strong> {order?.shipping_phone}</div>
              <div><strong>Address:</strong> {order?.shipping_address}</div>
              <div><strong>Payment:</strong> {order?.payment_method === "cod" ? "Cash on Delivery" : "EasyPaisa"}</div>
            </div>
          </div>

          {/* Order Items */}
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: C.maroonDark, marginBottom: 10 }}>
              Order Items
            </h3>
            <div style={{
              backgroundColor: C.white, borderRadius: 10,
              padding: "12px 16px",
              border: `1px solid ${C.goldPale}`,
            }}>
              {order?.items?.map((item, idx) => (
                <div key={idx} style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: idx < order.items.length - 1 ? `1px solid ${C.goldPale}` : "none",
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: C.maroonDark }}>
                      {item.product_name}
                    </div>
                    <div style={{ fontSize: 12, color: C.textLight }}>
                      Qty: {item.quantity} × Rs. {item.price?.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.maroon }}>
                    Rs. {((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Total */}
          <div style={{
            paddingTop: 16, borderTop: `2px solid ${C.goldPale}`,
          }}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              padding: "6px 0", fontSize: 14, color: C.textMid,
            }}>
              <span>Subtotal</span>
              <span>Rs. {order?.subtotal?.toLocaleString()}</span>
            </div>
            <div style={{
              display: "flex", justifyContent: "space-between",
              padding: "6px 0", fontSize: 14, color: C.textMid,
            }}>
              <span>Delivery</span>
              <span>Rs. {order?.delivery_charges?.toLocaleString()}</span>
            </div>
            <div style={{
              display: "flex", justifyContent: "space-between",
              padding: "12px 0 0", fontSize: 20, fontWeight: 700,
              color: C.maroonDark,
            }}>
              <span>Total</span>
              <span style={{ color: C.maroon }}>Rs. {order?.total_amount?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* ─── NEXT STEPS ─── */}
        <div style={{
          backgroundColor: C.goldPale, borderRadius: 12,
          padding: "16px 20px", marginBottom: 24,
          fontSize: 14, color: C.textMid, lineHeight: 1.7,
        }}>
          <strong style={{ color: C.maroonDark, display: "block", marginBottom: 6 }}>
            What happens next?
          </strong>
          We'll craft your order with care and send you shipping updates. 
          You'll receive your order within the estimated delivery time.
        </div>

        {/* ─── ACTION BUTTONS ─── */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/products">
            <button style={{
              padding: "12px 32px", borderRadius: 50, border: "none",
              backgroundColor: C.maroon, color: C.goldLight,
              fontSize: 14, cursor: "pointer", fontFamily: "inherit",
              fontWeight: 600,
            }}>
              Continue Shopping
            </button>
          </Link>
          <Link href="/">
            <button style={{
              padding: "12px 32px", borderRadius: 50,
              border: `2px solid ${C.maroon}`,
              backgroundColor: "transparent",
              color: C.maroon, fontSize: 14,
              cursor: "pointer", fontFamily: "inherit",
              fontWeight: 600,
            }}>
              Back to Home
            </button>
          </Link>
        </div>
      </div>

      <footer style={{
        padding: "28px 24px", textAlign: "center",
        borderTop: `2px solid ${C.goldPale}`,
        backgroundColor: C.whiteOff, marginTop: 60,
      }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.maroonDark, marginBottom: 4 }}>
          gleamwave
        </div>
        <div style={{ fontSize: 12, color: C.textLight }}>
          © 2025 Gleamwave · Handcrafted Resin Art · Made with Love in Pakistan
        </div>
      </footer>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div style={{
        display: "flex", justifyContent: "center", alignItems: "center",
        height: "100vh", backgroundColor: "#FFFFFF",
      }}>
        <div style={{ fontSize: 20, color: "#6F4E37" }}>Loading...</div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}