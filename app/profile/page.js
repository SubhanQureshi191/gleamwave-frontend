"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ── Components ──
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
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
  confirmed: "#3B82F6",
  shipped: "#8B5CF6",
  delivered: "#10B981",
  cancelled: "#EF4444",
  pending: "#F59E0B",
};

// ─── INVOICE GENERATOR ──────────────────────────────────────────
const generateInvoiceHTML = (order) => {
  const totalAmount = order.total_amount || 0;

  const subtotal =
    order.subtotal ||
    order.items?.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    ) ||
    0;

  const deliveryCharges = order.delivery_charges || 300;

  const formatPakistanDateTime = (dateValue) => {
    if (!dateValue) {
      return { date: "N/A", time: "" };
    }

    try {
      let dateString = String(dateValue).trim();

      const hasTimezone =
        dateString.endsWith("Z") ||
        /[+-]\d{2}:?\d{2}$/.test(dateString);

      if (!hasTimezone) {
        dateString = dateString.replace(" ", "T") + "Z";
      }

      const date = new Date(dateString);

      if (Number.isNaN(date.getTime())) {
        return { date: "N/A", time: "" };
      }

      const dateOptions = {
        timeZone: "Asia/Karachi",
        year: "numeric",
        month: "long",
        day: "numeric",
      };

      const timeOptions = {
        timeZone: "Asia/Karachi",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      };

      const pakistanDate = date.toLocaleDateString("en-US", dateOptions);
      const pakistanTime = date.toLocaleTimeString("en-US", timeOptions);

      return { date: pakistanDate, time: pakistanTime };
    } catch (error) {
      console.error("Invoice date/time formatting error:", error);
      return { date: "N/A", time: "" };
    }
  };

  const { date: orderDate, time: orderTime } = formatPakistanDateTime(order.created_at);

  const escapeHtml = (text) => {
    if (!text) return "";
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const safeShippingName = escapeHtml(order.shipping_name);
  const safeShippingPhone = escapeHtml(order.shipping_phone);
  const safeShippingAddress = escapeHtml(order.shipping_address);
  const safeExtraNote = escapeHtml(order.extra_note);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice #${order.id}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, Helvetica, sans-serif; background: #ffffff; padding: 20px; margin: 0; }
        .invoice-wrapper { max-width: 700px; width: 100%; background: #ffffff; border: 2px solid #f5ede0; border-radius: 12px; padding: 24px 28px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #f5ede0; padding-bottom: 12px; margin-bottom: 14px; }
        .brand h1 { font-size: 26px; font-weight: 700; color: #4A2E22; letter-spacing: -0.5px; }
        .brand h1 span { color: #B8956A; }
        .brand p { font-size: 9px; color: #B8956A; text-transform: uppercase; letter-spacing: 2px; margin-top: 1px; }
        .invoice-title { text-align: right; }
        .invoice-title h2 { font-size: 18px; font-weight: 700; color: #4A2E22; }
        .invoice-title p { font-size: 10px; color: #A08070; margin-top: 2px; }
        .order-meta { display: flex; justify-content: flex-end; gap: 10px; font-size: 11px; color: #6B4F3A; margin-top: 4px; flex-wrap: wrap; }
        .order-meta span { background: #FDF8F3; padding: 4px 10px; border-radius: 12px; border: 1px solid #f5ede0; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 20px; background: #FDF8F3; padding: 12px 16px; border-radius: 8px; border: 1px solid #f5ede0; margin-bottom: 12px; font-size: 12px; }
        .info-grid .label { font-weight: 600; color: #A08070; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
        .info-grid .value { color: #4A2E22; font-weight: 500; margin-top: 1px; }
        .info-grid .value.light { font-weight: 400; color: #6B4F3A; word-wrap: break-word; }
        .info-grid .full-width { grid-column: 1 / -1; }
        .status-badge { display: inline-block; padding: 2px 12px; border-radius: 20px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .status-badge.confirmed { background: #3B82F622; color: #3B82F6; }
        .status-badge.shipped { background: #8B5CF622; color: #8B5CF6; }
        .status-badge.delivered { background: #10B98122; color: #10B981; }
        .status-badge.cancelled { background: #EF444422; color: #EF4444; }
        .status-badge.pending { background: #F59E0B22; color: #F59E0B; }
        .items-table { width: 100%; border-collapse: collapse; margin: 10px 0 12px; font-size: 12px; }
        .items-table thead th { background: #6F4E37; color: #E8D9C0; padding: 8px 10px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
        .items-table thead th:last-child, .items-table tbody td:last-child { text-align: right; }
        .items-table thead th:nth-child(2) { text-align: center; }
        .items-table tbody td { padding: 8px 10px; border-bottom: 1px solid #f5ede0; color: #4A2E22; }
        .items-table tbody td:nth-child(2) { text-align: center; }
        .items-table tbody td:last-child { text-align: right; font-weight: 600; }
        .items-table tbody tr:last-child td { border-bottom: none; }
        .items-table .product-name { font-weight: 500; }
        .totals { display: flex; justify-content: flex-end; border-top: 2px solid #f5ede0; padding-top: 10px; margin-top: 4px; }
        .totals-inner { width: 220px; }
        .totals-row { display: flex; justify-content: space-between; padding: 3px 0; font-size: 12px; color: #6B4F3A; }
        .totals-row.total { font-size: 16px; font-weight: 700; color: #4A2E22; border-top: 2px solid #e8d9c0; padding-top: 6px; margin-top: 2px; }
        .footer { border-top: 2px solid #f5ede0; padding-top: 12px; margin-top: 14px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
        .footer .thanks { font-size: 12px; color: #6B4F3A; }
        .footer .thanks strong { color: #4A2E22; }
        .footer .powered { font-size: 9px; color: #A08070; }
        .footer .powered span { color: #B8956A; font-weight: 600; }
        .print-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 20px; background: #4A2E22; color: #fdf8f3; border: none; border-radius: 30px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit; margin-top: 12px; }
        .print-btn:hover { background: #6F4E37; }
        @media (max-width: 600px) { .invoice-wrapper { padding: 16px; } .header { flex-direction: column; align-items: flex-start; gap: 6px; } .invoice-title { text-align: left; width: 100%; } .order-meta { justify-content: flex-start; flex-wrap: wrap; } .info-grid { grid-template-columns: 1fr; } .items-table { font-size: 11px; } .items-table thead th, .items-table tbody td { padding: 6px 8px; } .totals-inner { width: 100%; } .footer { flex-direction: column; text-align: center; } }
        @media print { body { padding: 0; background: white; } .invoice-wrapper { border: none; border-radius: 0; padding: 16px 20px; max-width: 100%; margin: 0; } .print-btn { display: none !important; } .info-grid { background: #f8f4f0; } .items-table thead th { background: #4A2E22; } .items-table tbody td { border-bottom: 1px solid #eee; } .status-badge { print-color-adjust: exact; -webkit-print-color-adjust: exact; } .items-table thead th { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
      </style>
    </head>
    <body>
      <div class="invoice-wrapper">
        <div class="header">
          <div class="brand">
            <h1>gleam<span>wave</span></h1>
            <p>Premium Resin Artistry</p>
          </div>
          <div class="invoice-title">
            <h2>INVOICE</h2>
            <div class="order-meta">
              <span>Order #${order.id}</span>
              <span>${orderDate}</span>
              <span>${orderTime}</span>
            </div>
          </div>
        </div>
        
        <div class="info-grid">
          <div>
            <div class="label">Customer</div>
            <div class="value">${safeShippingName}</div>
            <div style="font-size:11px;color:#6B4F3A;margin-top:1px;">${safeShippingPhone}</div>
          </div>
          <div>
            <div class="label">Payment</div>
            <div class="value light">${order.payment_method === "cod" ? "Cash on Delivery" : "EasyPaisa"}</div>
          </div>
          <div class="full-width">
            <div class="label">Shipping Address</div>
            <div class="value light" style="word-wrap:break-word;">${safeShippingAddress || "N/A"}</div>
          </div>
          <div>
            <div class="label">Status</div>
            <div><span class="status-badge ${order.status}">${order.status}</span></div>
          </div>
          ${order.extra_note ? `
          <div class="full-width">
            <div class="label">Order Note</div>
            <div class="value light" style="font-style:italic;font-size:11px;">"${safeExtraNote}"</div>
          </div>
          ` : ""}
        </div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th>Product</th>
              <th style="text-align:center;">Qty</th>
              <th style="text-align:right;">Price</th>
              <th style="text-align:right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${(order.items || []).map((item) => `
              <tr>
                <td><div class="product-name">${escapeHtml(item.product_name)}</div></td>
                <td style="text-align:center;">${item.quantity}</td>
                <td style="text-align:right;">Rs. ${item.price?.toLocaleString() || 0}</td>
                <td style="text-align:right;font-weight:600;">Rs. ${((item.price || 0) * (item.quantity || 1)).toLocaleString()}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        
        <div class="totals">
          <div class="totals-inner">
            <div class="totals-row"><span>Subtotal</span><span>Rs. ${subtotal.toLocaleString()}</span></div>
            <div class="totals-row"><span>Delivery</span><span>Rs. ${deliveryCharges.toLocaleString()}</span></div>
            <div class="totals-row total"><span>Total</span><span>Rs. ${totalAmount.toLocaleString()}</span></div>
          </div>
        </div>
        
        <div class="footer">
          <div class="thanks"><strong>Thank you for your order!</strong><br />We hope you love your gleamwave pieces</div>
          <div class="powered">Powered by <span>gleamwave</span></div>
        </div>
        
        <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
      </div>
      
      <script>
        if (window.location.search.includes("autoPrint=true")) {
          window.onload = function () {
            setTimeout(function () { window.print(); }, 500);
          };
        }
      </script>
    </body>
    </html>
  `;
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