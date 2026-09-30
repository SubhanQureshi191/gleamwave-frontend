import { API_URL } from "./adminConstants";
import { generateInvoiceHTML } from "./invoiceTemplate";

// ─── HELPER: Convert "YYYY-MM-DD HH:MM" or "YYYY-MM-DD" to Date ───
export const parseOrderDate = (dateStr) => {
  if (!dateStr) return null;
  try {
    // Backend "2025-11-20 14:30" format bhejta hai
    const normalized = String(dateStr).replace(" ", "T");
    const d = new Date(normalized);
    if (isNaN(d.getTime())) return null;
    return d;
  } catch {
    return null;
  }
};

// ─── HELPER: Check if order is within date range ───
export const isWithinDateRange = (orderDate, fromDate, toDate) => {
  if (!fromDate && !toDate) return true;
  const d = parseOrderDate(orderDate);
  if (!d) return true;

  // Normalize to start of day
  const orderDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (fromDate) {
    const from = new Date(fromDate);
    const fromDay = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    if (orderDay < fromDay) return false;
  }

  if (toDate) {
    const to = new Date(toDate);
    const toDay = new Date(to.getFullYear(), to.getMonth(), to.getDate());
    if (orderDay > toDay) return false;
  }

  return true;
};

// ─── HELPER: Format date as YYYY-MM-DD ───
export const formatDateInput = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// ─── DOWNLOAD INVOICE (ADMIN) ───
// `products` is accepted for backward compatibility with existing callers
// but is no longer needed — the shared invoice template renders directly
// from the order's own items, so we don't fetch the full product list
// just for this anymore.
export const downloadInvoice = async (orderId, products, showToast) => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}/admin/orders/${orderId}`, {
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
    if (showToast) showToast("Failed to generate invoice: " + error.message, "error");
  }
};