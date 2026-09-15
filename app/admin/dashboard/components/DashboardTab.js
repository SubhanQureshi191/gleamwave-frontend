"use client";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faXmark,
  faArrowTrendUp,
  faArrowTrendDown,
  faWallet,
  faMoneyBillTrendUp,
  faPercent,
  faCheckCircle,
  faTruck,
  faCircleCheck,
  faBox,
  faBoxes,
  faCartShopping,
  faUser,
  faEnvelope,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";
import { C } from "@/lib/adminConstants";
import { isWithinDateRange, formatDateInput } from "@/lib/adminHelpers";

export default function DashboardTab({ orders, products }) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [customerFilter, setCustomerFilter] = useState("all");

  // ─── Filter orders by date range first ───
  const ordersInDateRange = orders.filter((o) => isWithinDateRange(o.created_at, dateFrom, dateTo));

  // ─── Filter out cancelled orders ───
  const validOrders = ordersInDateRange.filter((o) => o.status !== "cancelled");

  // ─── TOTAL AMOUNT (with delivery) - what customer paid ───
  const totalAmountWithDelivery = validOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);

  // ─── PRODUCT REVENUE (without delivery) - actual sales revenue ───
  const totalRevenue = validOrders.reduce((sum, order) => {
    const total = order.total_amount || 0;
    const delivery = order.delivery_charges || 0;
    return sum + (total - delivery);
  }, 0);

  // ─── TOTAL COST (product cost) - with fallback for old orders ───
  const totalCost = validOrders.reduce((sum, order) => {
    return (
      sum +
      (order.items || []).reduce((itemSum, item) => {
        let costPrice = item.cost_price;

        if (!costPrice || costPrice === 0) {
          const product = products.find((p) => p.id === item.product_id);
          costPrice = product?.cost_price || 0;
        }

        return itemSum + costPrice * (item.quantity || 1);
      }, 0)
    );
  }, 0);

  // ─── NET PROFIT = Product Revenue - Cost ───
  const totalProfit = totalRevenue - totalCost;

  // ─── PROFIT MARGIN ───
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  // ─── Date-filtered order stats ───
  const dateFilteredOrderStats = (() => {
    const stats = { total: 0, confirmed: 0, shipped: 0, delivered: 0, cancelled: 0 };
    ordersInDateRange.forEach((order) => {
      stats.total++;
      switch (order.status) {
        case "confirmed":
          stats.confirmed++;
          break;
        case "shipped":
          stats.shipped++;
          break;
        case "delivered":
          stats.delivered++;
          break;
        case "cancelled":
          stats.cancelled++;
          break;
      }
    });
    return stats;
  })();

  // ─── Date range label for display ───
  const getDateRangeLabel = () => {
    if (!dateFrom && !dateTo) return "All Time";
    if (dateFrom && !dateTo) return `From ${dateFrom}`;
    if (!dateFrom && dateTo) return `Until ${dateTo}`;
    return `${dateFrom} → ${dateTo}`;
  };

  // ─── Quick Date Range Handlers ───
  const setQuickRange = (range) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (range === "today") {
      setDateFrom(formatDateInput(today));
      setDateTo(formatDateInput(today));
    } else if (range === "7days") {
      const from = new Date(today);
      from.setDate(from.getDate() - 6);
      setDateFrom(formatDateInput(from));
      setDateTo(formatDateInput(today));
    } else if (range === "30days") {
      const from = new Date(today);
      from.setDate(from.getDate() - 29);
      setDateFrom(formatDateInput(from));
      setDateTo(formatDateInput(today));
    } else if (range === "month") {
      const from = new Date(today.getFullYear(), today.getMonth(), 1);
      setDateFrom(formatDateInput(from));
      setDateTo(formatDateInput(today));
    } else if (range === "all") {
      setDateFrom("");
      setDateTo("");
    }
  };

  // ─── Get Filtered Customer Orders ───
  const getFilteredCustomerOrders = () => {
    if (customerFilter === "registered") {
      return validOrders.filter((o) => o.user_id && !o.is_guest_order);
    }
    if (customerFilter === "guest") {
      return validOrders.filter((o) => o.is_guest_order || !o.user_id);
    }
    return validOrders;
  };

  const filteredCustomerOrders = getFilteredCustomerOrders();

  return (
    <>
      <h1 style={{ fontSize: "clamp(2rem, 3vw, 2.8rem)", fontWeight: 700, color: C.maroonDark, marginBottom: 8 }}>
        Dashboard
      </h1>
      <p style={{ color: C.textLight, marginBottom: 24 }}>Overview of your store performance</p>

      {/* ─── DATE RANGE FILTER (CALENDAR) ─── */}
      <div
        style={{
          backgroundColor: C.whiteOff,
          borderRadius: 16,
          border: `2px solid ${C.goldPale}`,
          padding: "20px 24px",
          marginBottom: 32,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <FontAwesomeIcon icon={faCalendar} style={{ fontSize: 18, color: C.maroon }} />
          <span style={{ fontSize: 16, fontWeight: 700, color: C.maroonDark }}>Date Range Filter</span>
          <span
            style={{
              fontSize: 12,
              color: C.textLight,
              backgroundColor: C.goldPale,
              padding: "4px 12px",
              borderRadius: 12,
              marginLeft: "auto",
              fontWeight: 600,
            }}
          >
            {getDateRangeLabel()} • {validOrders.length} order{validOrders.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Date Inputs */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}
          className="date-filter-grid"
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 600,
                color: C.textMid,
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              From Date
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 10,
                border: `2px solid ${C.goldPale}`,
                backgroundColor: C.white,
                color: C.text,
                fontSize: 14,
                fontFamily: "inherit",
                outline: "none",
                cursor: "pointer",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = C.maroon)}
              onBlur={(e) => (e.target.style.borderColor = C.goldPale)}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 600,
                color: C.textMid,
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              To Date
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 10,
                border: `2px solid ${C.goldPale}`,
                backgroundColor: C.white,
                color: C.text,
                fontSize: 14,
                fontFamily: "inherit",
                outline: "none",
                cursor: "pointer",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = C.maroon)}
              onBlur={(e) => (e.target.style.borderColor = C.goldPale)}
            />
          </div>
        </div>

        {/* Quick Range Buttons */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: C.textLight, fontWeight: 600, marginRight: 4 }}>Quick:</span>
          <button
            onClick={() => setQuickRange("today")}
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              border: `2px solid ${C.goldPale}`,
              backgroundColor: C.white,
              color: C.textMid,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = C.maroon;
              e.target.style.color = C.goldLight;
              e.target.style.borderColor = C.maroon;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = C.white;
              e.target.style.color = C.textMid;
              e.target.style.borderColor = C.goldPale;
            }}
          >
            Today
          </button>
          <button
            onClick={() => setQuickRange("7days")}
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              border: `2px solid ${C.goldPale}`,
              backgroundColor: C.white,
              color: C.textMid,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = C.maroon;
              e.target.style.color = C.goldLight;
              e.target.style.borderColor = C.maroon;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = C.white;
              e.target.style.color = C.textMid;
              e.target.style.borderColor = C.goldPale;
            }}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setQuickRange("30days")}
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              border: `2px solid ${C.goldPale}`,
              backgroundColor: C.white,
              color: C.textMid,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = C.maroon;
              e.target.style.color = C.goldLight;
              e.target.style.borderColor = C.maroon;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = C.white;
              e.target.style.color = C.textMid;
              e.target.style.borderColor = C.goldPale;
            }}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setQuickRange("month")}
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              border: `2px solid ${C.goldPale}`,
              backgroundColor: C.white,
              color: C.textMid,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = C.maroon;
              e.target.style.color = C.goldLight;
              e.target.style.borderColor = C.maroon;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = C.white;
              e.target.style.color = C.textMid;
              e.target.style.borderColor = C.goldPale;
            }}
          >
            This Month
          </button>
          <button
            onClick={() => setQuickRange("all")}
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              border: `2px solid ${C.maroon}`,
              backgroundColor: C.maroon,
              color: C.goldLight,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = C.maroonDark;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = C.maroon;
            }}
          >
            All Time
          </button>
          {(dateFrom || dateTo) && (
            <button
              onClick={() => {
                setDateFrom("");
                setDateTo("");
              }}
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                border: `2px solid ${C.cancelled}44`,
                backgroundColor: "transparent",
                color: C.cancelled,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = C.cancelled;
                e.target.style.color = "#fff";
                e.target.style.borderColor = C.cancelled;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
                e.target.style.color = C.cancelled;
                e.target.style.borderColor = C.cancelled + "44";
              }}
            >
              <FontAwesomeIcon icon={faXmark} style={{ fontSize: 10 }} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ─── PROFIT & REVENUE CARDS ─── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        {/* TOTAL REVENUE (with delivery) */}
        <div
          style={{
            background: `linear-gradient(135deg, ${C.confirmed}15, ${C.confirmed}05)`,
            padding: "24px",
            borderRadius: 16,
            border: `2px solid ${C.confirmed}44`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: C.textMid, fontWeight: 600 }}>Total Revenue</span>
            <FontAwesomeIcon icon={faArrowTrendUp} style={{ fontSize: 20, color: C.confirmed }} />
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: C.confirmed }}>
            Rs. {totalAmountWithDelivery.toLocaleString()}
          </div>
          <div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>
            Product: Rs. {totalRevenue.toLocaleString()} + Delivery
          </div>
        </div>

        {/* TOTAL COST */}
        <div
          style={{
            background: `linear-gradient(135deg, ${C.cancelled}15, ${C.cancelled}05)`,
            padding: "24px",
            borderRadius: 16,
            border: `2px solid ${C.cancelled}44`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: C.textMid, fontWeight: 600 }}>Total Cost</span>
            <FontAwesomeIcon icon={faWallet} style={{ fontSize: 20, color: C.cancelled }} />
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: C.cancelled }}>Rs. {totalCost.toLocaleString()}</div>
          <div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>Cost of goods sold</div>
        </div>

        {/* NET PROFIT */}
        <div
          style={{
            background: `linear-gradient(135deg, ${C.profitGreen}15, ${C.profitGreen}05)`,
            padding: "24px",
            borderRadius: 16,
            border: `2px solid ${C.profitGreen}44`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: C.textMid, fontWeight: 600 }}>Net Profit</span>
            <FontAwesomeIcon icon={faMoneyBillTrendUp} style={{ fontSize: 20, color: C.profitGreen }} />
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: totalProfit >= 0 ? C.profitGreen : C.lossRed,
            }}
          >
            Rs. {totalProfit.toLocaleString()}
          </div>
          <div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>
            {totalProfit >= 0 ? "Profit" : "Loss"} after cost
          </div>
        </div>

        {/* PROFIT MARGIN */}
        <div
          style={{
            background: `linear-gradient(135deg, ${C.gold}15, ${C.gold}05)`,
            padding: "24px",
            borderRadius: 16,
            border: `2px solid ${C.gold}44`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: C.textMid, fontWeight: 600 }}>Profit Margin</span>
            <FontAwesomeIcon icon={faPercent} style={{ fontSize: 20, color: C.gold }} />
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: C.gold }}>{profitMargin.toFixed(1)}%</div>
          <div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>On product revenue</div>
        </div>
      </div>

      {/* ─── ORDER STATUS CARDS ─── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 16,
          marginBottom: 40,
        }}
      >
        {[
          { label: "Total Orders", value: dateFilteredOrderStats.total, icon: faBox, color: C.maroon },
          { label: "Confirmed", value: dateFilteredOrderStats.confirmed, icon: faCheckCircle, color: C.confirmed },
          { label: "Shipped", value: dateFilteredOrderStats.shipped, icon: faTruck, color: C.shipped },
          { label: "Delivered", value: dateFilteredOrderStats.delivered, icon: faCircleCheck, color: C.delivered },
          { label: "Cancelled", value: dateFilteredOrderStats.cancelled, icon: faXmark, color: C.cancelled },
        ].map((stat, i) => (
          <div
            key={i}
            style={{
              backgroundColor: C.whiteOff,
              padding: "20px",
              borderRadius: 16,
              border: `2px solid ${stat.color}44`,
              textAlign: "center",
            }}
          >
            <FontAwesomeIcon icon={stat.icon} style={{ fontSize: 28, marginBottom: 6, color: stat.color }} />
            <div style={{ fontSize: 28, fontWeight: 700, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 13, color: C.textLight }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ─── QUICK STATS ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 32 }}>
        <div
          style={{
            backgroundColor: C.whiteOff,
            padding: "20px 24px",
            borderRadius: 16,
            border: `2px solid ${C.goldPale}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <FontAwesomeIcon icon={faBoxes} style={{ fontSize: 20, color: C.maroon }} />
            <span style={{ fontSize: 13, color: C.textLight }}>Total Products</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: C.maroon }}>{products.length}</div>
        </div>
        <div
          style={{
            backgroundColor: C.whiteOff,
            padding: "20px 24px",
            borderRadius: 16,
            border: `2px solid ${C.goldPale}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <FontAwesomeIcon icon={faCartShopping} style={{ fontSize: 20, color: C.maroon }} />
            <span style={{ fontSize: 13, color: C.textLight }}>Avg Order Value</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: C.maroon }}>
            Rs.{" "}
            {validOrders.length > 0
              ? Math.round(totalAmountWithDelivery / validOrders.length).toLocaleString()
              : 0}
          </div>
        </div>
      </div>

      {/* ─── CUSTOMER ORDERS SUMMARY (REGISTERED vs GUEST) ─── */}
      <div>
        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: C.maroonDark,
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <FontAwesomeIcon icon={faUser} /> Customer Orders Summary
        </h2>

        {/* Summary Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              background: `linear-gradient(135deg, ${C.confirmed}15, ${C.confirmed}05)`,
              padding: "24px",
              borderRadius: 16,
              border: `2px solid ${C.confirmed}44`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: C.textMid, fontWeight: 600 }}>Registered Customers</span>
              <FontAwesomeIcon icon={faUser} style={{ fontSize: 20, color: C.confirmed }} />
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: C.confirmed }}>
              {validOrders.filter((o) => o.user_id && !o.is_guest_order).length}
            </div>
            <div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>Orders by logged-in users</div>
          </div>

          <div
            style={{
              background: `linear-gradient(135deg, ${C.gold}15, ${C.gold}05)`,
              padding: "24px",
              borderRadius: 16,
              border: `2px solid ${C.gold}44`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: C.textMid, fontWeight: 600 }}>Guest Customers</span>
              <FontAwesomeIcon icon={faUser} style={{ fontSize: 20, color: C.gold }} />
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: C.gold }}>
              {validOrders.filter((o) => o.is_guest_order || !o.user_id).length}
            </div>
            <div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>Orders without login</div>
          </div>

          <div
            style={{
              background: `linear-gradient(135deg, ${C.maroon}15, ${C.maroon}05)`,
              padding: "24px",
              borderRadius: 16,
              border: `2px solid ${C.maroon}44`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: C.textMid, fontWeight: 600 }}>Unique Registered Users</span>
              <FontAwesomeIcon icon={faUser} style={{ fontSize: 20, color: C.maroon }} />
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: C.maroon }}>
              {new Set(validOrders.filter((o) => o.user_id && !o.is_guest_order).map((o) => o.user_id)).size}
            </div>
            <div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>Distinct users who ordered</div>
          </div>

          <div
            style={{
              background: `linear-gradient(135deg, ${C.shipped}15, ${C.shipped}05)`,
              padding: "24px",
              borderRadius: 16,
              border: `2px solid ${C.shipped}44`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: C.textMid, fontWeight: 600 }}>Unique Guest Emails</span>
              <FontAwesomeIcon icon={faEnvelope} style={{ fontSize: 20, color: C.shipped }} />
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: C.shipped }}>
              {
                new Set(
                  validOrders.filter((o) => o.is_guest_order || !o.user_id).map((o) => o.guest_email).filter(Boolean)
                ).size
              }
            </div>
            <div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>Distinct guest email addresses</div>
          </div>
        </div>

        {/* ─── FILTER BUTTONS ─── */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 13, color: C.textMid, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
            <FontAwesomeIcon icon={faFilter} /> Filter:
          </span>
          <button
            onClick={() => setCustomerFilter("all")}
            style={{
              padding: "8px 18px",
              borderRadius: 30,
              border: `2px solid ${customerFilter === "all" ? C.maroon : C.goldPale}`,
              backgroundColor: customerFilter === "all" ? C.maroon : "transparent",
              color: customerFilter === "all" ? C.goldLight : C.textMid,
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 12,
              fontWeight: 600,
              transition: "all 0.2s",
            }}
          >
            All ({validOrders.length})
          </button>
          <button
            onClick={() => setCustomerFilter("registered")}
            style={{
              padding: "8px 18px",
              borderRadius: 30,
              border: `2px solid ${customerFilter === "registered" ? C.confirmed : C.goldPale}`,
              backgroundColor: customerFilter === "registered" ? C.confirmed : "transparent",
              color: customerFilter === "registered" ? "#fff" : C.textMid,
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 12,
              fontWeight: 600,
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: 10 }} />
            Registered ({validOrders.filter((o) => o.user_id && !o.is_guest_order).length})
          </button>
          <button
            onClick={() => setCustomerFilter("guest")}
            style={{
              padding: "8px 18px",
              borderRadius: 30,
              border: `2px solid ${customerFilter === "guest" ? C.gold : C.goldPale}`,
              backgroundColor: customerFilter === "guest" ? C.gold : "transparent",
              color: customerFilter === "guest" ? "#fff" : C.textMid,
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 12,
              fontWeight: 600,
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <FontAwesomeIcon icon={faUser} style={{ fontSize: 10 }} />
            Guest ({validOrders.filter((o) => o.is_guest_order || !o.user_id).length})
          </button>
        </div>

        {/* ─── DETAILED LIST ─── */}
        <div style={{ backgroundColor: C.whiteOff, borderRadius: 16, border: `2px solid ${C.goldPale}`, overflow: "hidden" }}>
          <div
            style={{
              padding: "14px 20px",
              backgroundColor: C.maroon,
              color: C.goldLight,
              display: "grid",
              gridTemplateColumns: "80px 1fr 1.5fr 120px 120px",
              gap: 12,
              fontSize: 12,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            <div>Order #</div>
            <div>Customer</div>
            <div>Email / Contact</div>
            <div>Type</div>
            <div style={{ textAlign: "right" }}>Amount</div>
          </div>

          <div style={{ maxHeight: 500, overflowY: "auto" }}>
            {filteredCustomerOrders.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: C.textLight }}>
                No {customerFilter !== "all" ? customerFilter : ""} orders found in selected date range
              </div>
            ) : (
              filteredCustomerOrders.map((order) => {
                const isGuest = order.is_guest_order || !order.user_id;
                const customerEmail = order.user_email || order.guest_email || order.email || "N/A";

                return (
                  <div
                    key={order.id}
                    style={{
                      padding: "12px 20px",
                      borderBottom: `1px solid ${C.goldPale}`,
                      display: "grid",
                      gridTemplateColumns: "80px 1fr 1.5fr 120px 120px",
                      gap: 12,
                      alignItems: "center",
                      fontSize: 13,
                      color: C.textMid,
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = C.white)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <div style={{ fontWeight: 600, color: C.maroonDark }}>#{order.id}</div>
                    <div style={{ fontWeight: 500, color: C.maroonDark }}>{order.shipping_name || "Unknown"}</div>
                    <div style={{ fontSize: 12, wordBreak: "break-all" }}>{customerEmail}</div>
                    <div>
                      <span
                        style={{
                          padding: "3px 10px",
                          borderRadius: 12,
                          fontSize: 11,
                          fontWeight: 600,
                          backgroundColor: isGuest ? `${C.gold}22` : `${C.confirmed}22`,
                          color: isGuest ? C.gold : C.confirmed,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <FontAwesomeIcon icon={isGuest ? faUser : faCircleCheck} style={{ fontSize: 9 }} />
                        {isGuest ? "Guest" : "Registered"}
                      </span>
                    </div>
                    <div style={{ textAlign: "right", fontWeight: 600, color: C.maroon }}>
                      Rs. {order.total_amount?.toLocaleString() || 0}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {filteredCustomerOrders.length > 0 && (
            <div
              style={{
                padding: "10px 20px",
                backgroundColor: C.white,
                borderTop: `1px solid ${C.goldPale}`,
                fontSize: 12,
                color: C.textLight,
                textAlign: "center",
              }}
            >
              Showing {filteredCustomerOrders.length} {customerFilter !== "all" ? customerFilter : ""} order
              {filteredCustomerOrders.length !== 1 ? "s" : ""} in selected date range
            </div>
          )}
        </div>
      </div>
    </>
  );
}