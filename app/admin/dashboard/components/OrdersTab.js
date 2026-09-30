"use client";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRotate,
  faBox,
  faCheckCircle,
  faTruck,
  faCircleCheck,
  faXmark,
  faFileInvoice,
  faCoins,
  faCalendar,
  faUser,
  faArrowTrendUp,
  faArrowTrendDown,
  faPhone,
  faCreditCard,
  faEnvelope,
  faLocationDot,
  faBagShopping,
  faEdit,
  faHourglassHalf,
  faImage,
} from "@fortawesome/free-solid-svg-icons";
import { C } from "@/lib/adminConstants";
import { downloadInvoice } from "@/lib/adminHelpers";

// ─── Get Status Color ───
const getStatusColor = (status) => {
  switch (status) {
    case "pending":
      return "#D97706";
    case "confirmed":
      return C.confirmed;
    case "shipped":
      return C.shipped;
    case "delivered":
      return C.delivered;
    case "cancelled":
      return C.cancelled;
    default:
      return "#6B7280";
  }
};

// ─── Get Status Icon ───
const getStatusIcon = (status) => {
  switch (status) {
    case "pending":
      return faHourglassHalf;
    case "confirmed":
      return faCheckCircle;
    case "shipped":
      return faTruck;
    case "delivered":
      return faCircleCheck;
    case "cancelled":
      return faXmark;
    default:
      return faBox;
  }
};

// ─── Calculate Order-level Profit ───
const getOrderProfit = (order, products) => {
  const revenue = order.total_amount || 0;
  const deliveryCharges = order.delivery_charges || 0;
  const productRevenue = revenue - deliveryCharges;

  const cost = (order.items || []).reduce((sum, item) => {
    let costPrice = item.cost_price;

    if (!costPrice || costPrice === 0) {
      const product = products.find((p) => p.id === item.product_id);
      costPrice = product?.cost_price || 0;
    }

    return sum + costPrice * (item.quantity || 1);
  }, 0);

  const profit = productRevenue - cost;

  return {
    revenue: productRevenue,
    totalRevenue: revenue,
    cost,
    profit,
    isLoss: profit < 0,
  };
};

export default function OrdersTab({ orders, products, showToast, fetchOrders, updateOrderStatus }) {
  const [expandedOrder, setExpandedOrder] = useState(null);

  const toggleOrderDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const handleDownloadInvoice = (orderId) => {
    downloadInvoice(orderId, products, showToast);
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 32,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ fontSize: "clamp(2rem, 3vw, 2.8rem)", fontWeight: 700, color: C.maroonDark }}>Orders</h1>
          <p style={{ color: C.textLight }}>{orders.length} total orders</p>
        </div>
        <button
          onClick={fetchOrders}
          style={{
            padding: "10px 20px",
            borderRadius: 50,
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
          <FontAwesomeIcon icon={faRotate} /> Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", backgroundColor: C.whiteOff, borderRadius: 24 }}>
          <FontAwesomeIcon icon={faBox} style={{ fontSize: 48, marginBottom: 16, color: C.textLight }} />
          <h3 style={{ fontSize: 20, color: C.textMid }}>No orders yet</h3>
          <p style={{ color: C.textLight }}>Customer orders will appear here</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {orders.map((order) => {
            const isExpanded = expandedOrder === order.id;
            const orderProfit = getOrderProfit(order, products);

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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      <h3 style={{ fontSize: 18, fontWeight: 600, color: C.maroonDark, display: "flex", alignItems: "center", gap: 8 }}>
                        <FontAwesomeIcon icon={faBox} /> Order #{order.id}
                      </h3>
                      <span
                        style={{
                          padding: "4px 14px",
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600,
                          backgroundColor: getStatusColor(order.status) + "22",
                          color: getStatusColor(order.status),
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <FontAwesomeIcon icon={getStatusIcon(order.status)} /> {order.status.toUpperCase()}
                      </span>

                      <span
                        style={{
                          padding: "4px 14px",
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 700,
                          backgroundColor: (orderProfit.isLoss ? C.lossRed : C.profitGreen) + "22",
                          color: orderProfit.isLoss ? C.lossRed : C.profitGreen,
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <FontAwesomeIcon icon={orderProfit.isLoss ? faArrowTrendDown : faArrowTrendUp} style={{ fontSize: 10 }} />
                        {orderProfit.isLoss ? "Loss" : "Profit"}: Rs. {Math.abs(orderProfit.profit).toLocaleString()}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadInvoice(order.id);
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
                        <FontAwesomeIcon icon={faFileInvoice} /> Invoice
                      </button>
                    </div>
                    <p style={{ fontSize: 13, color: C.textLight, marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
                      <FontAwesomeIcon icon={faCalendar} /> {order.created_at} • <FontAwesomeIcon icon={faUser} /> {order.shipping_name}
                    </p>
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: C.maroon, display: "flex", alignItems: "center", gap: 4 }}>
                    <FontAwesomeIcon icon={faCoins} /> {order.total_amount?.toLocaleString()}
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.goldPale}` }}>
                    {order.status === "pending" && (
                      <div
                        style={{
                          marginBottom: 16,
                          padding: "14px 18px",
                          backgroundColor: "#FFFBEB",
                          border: "2px solid #F5C453",
                          borderRadius: 12,
                          fontSize: 13,
                          color: "#92400E",
                          lineHeight: 1.6,
                        }}
                      >
                        <strong>Awaiting Approval:</strong> this order includes an advance-payment
                        item. Review the payment screenshot(s) below, then set the status to{" "}
                        <strong>Confirmed</strong> to approve it and send the customer their
                        confirmation email.
                      </div>
                    )}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 12,
                        marginBottom: 16,
                        padding: "14px 18px",
                        backgroundColor: C.white,
                        borderRadius: 12,
                        border: `1px solid ${C.goldPale}`,
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 11, color: C.textLight, textTransform: "uppercase" }}>Product Revenue</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: C.maroon }}>Rs. {orderProfit.revenue.toLocaleString()}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: C.textLight, textTransform: "uppercase" }}>Cost</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: C.cancelled }}>Rs. {orderProfit.cost.toLocaleString()}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: C.textLight, textTransform: "uppercase" }}>
                          {orderProfit.isLoss ? "Loss" : "Profit"}
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: orderProfit.isLoss ? C.lossRed : C.profitGreen }}>
                          Rs. {orderProfit.profit.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                      <div>
                        <div style={{ fontSize: 13, color: C.textMid, display: "flex", alignItems: "center", gap: 6 }}>
                          <FontAwesomeIcon icon={faUser} /> <strong>Customer:</strong> {order.shipping_name}
                        </div>
                        <div style={{ fontSize: 13, color: C.textMid, display: "flex", alignItems: "center", gap: 6 }}>
                          <FontAwesomeIcon icon={faPhone} /> <strong>Phone:</strong> {order.shipping_phone}
                        </div>
                        <div style={{ fontSize: 13, color: C.textMid, display: "flex", alignItems: "center", gap: 6 }}>
                          <FontAwesomeIcon icon={faCreditCard} /> <strong>Payment:</strong>{" "}
                          {order.payment_method === "cod" ? "Cash on Delivery" : "EasyPaisa"}
                        </div>
                        <div style={{ fontSize: 13, color: C.textMid, display: "flex", alignItems: "center", gap: 6 }}>
                          <FontAwesomeIcon icon={faCalendar} /> <strong>Order Date:</strong> {order.created_at}
                        </div>
                        <div style={{ fontSize: 13, color: C.textMid, display: "flex", alignItems: "center", gap: 6 }}>
                          <FontAwesomeIcon icon={faEnvelope} /> <strong>Email:</strong>{" "}
                          {order.user_email || order.guest_email || order.email || "Not available"}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 13, color: C.textMid, display: "flex", alignItems: "center", gap: 6 }}>
                          <FontAwesomeIcon icon={faCoins} /> <strong>Subtotal:</strong> Rs. {order.subtotal?.toLocaleString() || 0}
                        </div>
                        <div style={{ fontSize: 13, color: C.textMid, display: "flex", alignItems: "center", gap: 6 }}>
                          <FontAwesomeIcon icon={faTruck} /> <strong>Delivery:</strong> Rs.{" "}
                          {order.delivery_charges?.toLocaleString() || 300}
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: C.maroon, marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
                          <FontAwesomeIcon icon={faCoins} /> <strong>Total:</strong> Rs. {order.total_amount?.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div style={{ marginBottom: 16, padding: "12px 16px", backgroundColor: C.white, borderRadius: 8, border: `1px solid ${C.goldPale}` }}>
                      <div style={{ fontSize: 13, color: C.textMid, display: "flex", alignItems: "flex-start", gap: 6 }}>
                        <FontAwesomeIcon icon={faLocationDot} style={{ marginTop: 2 }} />
                        <div>
                          <strong>Shipping Address:</strong> {order.shipping_address}
                        </div>
                      </div>
                      {order.extra_note && (
                        <div style={{ fontSize: 13, color: C.textMid, marginTop: 4, display: "flex", alignItems: "flex-start", gap: 6 }}>
                          <FontAwesomeIcon icon={faEdit} style={{ marginTop: 2 }} />
                          <div>
                            <strong>Note:</strong> {order.extra_note}
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <h4 style={{ fontSize: 14, fontWeight: 600, color: C.maroonDark, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                        <FontAwesomeIcon icon={faBagShopping} /> Order Items ({order.items?.length || 0})
                      </h4>
                      {order.items && order.items.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {order.items.map((item, idx) => {
                            const product = products.find((p) => p.id === item.product_id);
                            let costPrice = item.cost_price;
                            if (!costPrice || costPrice === 0) {
                              costPrice = product?.cost_price || 0;
                            }
                            const itemProfit = (item.price - costPrice) * (item.quantity || 1);
                            const isItemLoss = itemProfit < 0;

                            return (
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
                                <div
                                  style={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: 8,
                                    background: `linear-gradient(135deg, ${C.maroonPale}, ${C.goldPale})`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 24,
                                    overflow: "hidden",
                                    flexShrink: 0,
                                  }}
                                >
                                  {product?.images?.[0]?.image_url ? (
                                    <img
                                      src={product.images[0].image_url}
                                      alt={item.product_name}
                                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    />
                                  ) : (
                                    <FontAwesomeIcon icon={faBox} style={{ fontSize: 24, color: C.maroon }} />
                                  )}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: 14, fontWeight: 600, color: C.maroonDark }}>
                                    {item.product_name}
                                    {item.color_name && (
                                      <span style={{
                                        marginLeft: 8, fontSize: 11, fontWeight: 600,
                                        color: C.maroon, backgroundColor: C.goldPale,
                                        padding: "2px 8px", borderRadius: 10,
                                      }}>
                                        {item.color_name}
                                      </span>
                                    )}
                                  </div>
                                  <div style={{ fontSize: 12, color: C.textLight }}>
                                    Qty: {item.quantity} × Rs. {item.price?.toLocaleString() || 0}
                                    {costPrice > 0 && <span style={{ marginLeft: 8 }}>• Cost: Rs. {costPrice.toLocaleString()}</span>}
                                  </div>
                                  {item.advance_required && (
                                    <div style={{ marginTop: 6 }}>
                                      <div style={{ fontSize: 11, fontWeight: 600, color: "#92400E", marginBottom: 4 }}>
                                        Advance {item.advance_amount ? `(Rs. ${item.advance_amount.toLocaleString()})` : ""}:
                                      </div>
                                      {(item.advance_screenshot_urls || []).length > 0 ? (
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                          {item.advance_screenshot_urls.map((url, sIdx) => (
                                            <a
                                              key={url + sIdx}
                                              href={url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              <img
                                                src={url}
                                                alt={`Advance payment screenshot ${sIdx + 1}`}
                                                style={{
                                                  width: 48, height: 48, objectFit: "cover",
                                                  borderRadius: 8, border: "2px solid #F5C453",
                                                  display: "block",
                                                }}
                                              />
                                            </a>
                                          ))}
                                        </div>
                                      ) : (
                                        <span style={{
                                          display: "inline-flex", alignItems: "center", gap: 6,
                                          fontSize: 12, fontWeight: 600, color: C.lossRed,
                                          backgroundColor: C.lossRed + "1A", padding: "3px 10px",
                                          borderRadius: 10,
                                        }}>
                                          <FontAwesomeIcon icon={faImage} /> No screenshot attached
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div style={{ textAlign: "right" }}>
                                  <div style={{ fontSize: 15, fontWeight: 700, color: C.maroon }}>
                                    Rs. {((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                                  </div>
                                  {costPrice > 0 && (
                                    <div
                                      style={{
                                        fontSize: 11,
                                        fontWeight: 600,
                                        color: isItemLoss ? C.lossRed : C.profitGreen,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 3,
                                        justifyContent: "flex-end",
                                      }}
                                    >
                                      <FontAwesomeIcon icon={isItemLoss ? faArrowTrendDown : faArrowTrendUp} style={{ fontSize: 9 }} />
                                      {isItemLoss ? "-" : "+"}Rs. {Math.abs(itemProfit).toLocaleString()}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div style={{ fontSize: 13, color: C.textLight }}>No items found for this order.</div>
                      )}
                    </div>

                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.goldPale}` }}>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                        <label style={{ fontSize: 13, fontWeight: 500, color: C.textMid, display: "flex", alignItems: "center", gap: 4 }}>
                          <FontAwesomeIcon icon={faEdit} /> Update Status:
                        </label>
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          style={{
                            padding: "8px 14px",
                            borderRadius: 8,
                            border: `1px solid ${C.goldPale}`,
                            fontSize: 13,
                            fontFamily: "inherit",
                            backgroundColor: C.white,
                            cursor: "pointer",
                            outline: "none",
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {order.status === "pending" && (
                            <option value="pending">Pending Approval</option>
                          )}
                          <option value="confirmed">Confirmed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}