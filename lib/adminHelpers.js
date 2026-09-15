import { API_URL } from "./adminConstants";

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

// ─── INVOICE GENERATION ─────────────────────────────────────────
export const generateInvoiceHTML = (order, products) => {
  const itemsWithDetails = order.items.map((item) => {
    const product = products.find((p) => p.id === item.product_id);
    return {
      ...item,
      image: product?.images?.[0]?.image_url || null,
    };
  });

  const totalAmount = order.total_amount || 0;
  const subtotal =
    order.subtotal ||
    order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryCharges = order.delivery_charges || 300;
  const orderDate = new Date(order.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const escapeHtml = (text) => {
    if (!text) return "";
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  };

  const safeShippingName = escapeHtml(order.shipping_name);
  const safeShippingPhone = escapeHtml(order.shipping_phone);
  const safeShippingAddress = escapeHtml(order.shipping_address);
  const safeExtraNote = escapeHtml(order.extra_note);
  const safeProductNames = itemsWithDetails.map((item) => escapeHtml(item.product_name));

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
        .invoice-wrapper { max-width: 700px; width: 100%; background: #ffffff; border: 2px solid #f5ede0; border-radius: 12px; padding: 24px 28px; margin: 0; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #f5ede0; padding-bottom: 12px; margin-bottom: 14px; }
        .brand h1 { font-size: 26px; font-weight: 700; color: #4A2E22; letter-spacing: -0.5px; }
        .brand h1 span { color: #B8956A; }
        .brand p { font-size: 9px; color: #B8956A; text-transform: uppercase; letter-spacing: 2px; margin-top: 1px; }
        .invoice-title { text-align: right; }
        .invoice-title h2 { font-size: 18px; font-weight: 700; color: #4A2E22; }
        .invoice-title p { font-size: 10px; color: #A08070; margin-top: 2px; }
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
        @media (max-width: 600px) { .invoice-wrapper { padding: 16px; } .header { flex-direction: column; align-items: flex-start; gap: 6px; } .invoice-title { text-align: left; width: 100%; } .info-grid { grid-template-columns: 1fr; } .items-table { font-size: 11px; } .items-table thead th, .items-table tbody td { padding: 6px 8px; } .totals-inner { width: 100%; } .footer { flex-direction: column; text-align: center; } }
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
            <p>#${order.id} - ${orderDate}</p>
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
          ${
            order.extra_note
              ? `
          <div class="full-width">
            <div class="label">Order Note</div>
            <div class="value light" style="font-style:italic;font-size:11px;">"${safeExtraNote}"</div>
          </div>
          `
              : ""
          }
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
            ${itemsWithDetails
              .map(
                (item, idx) => `
              <tr>
                <td><div class="product-name">${safeProductNames[idx] || item.product_name}</div></td>
                <td style="text-align:center;">${item.quantity}</td>
                <td style="text-align:right;">Rs. ${item.price?.toLocaleString() || 0}</td>
                <td style="text-align:right;font-weight:600;">Rs. ${((item.price || 0) * (item.quantity || 1)).toLocaleString()}</td>
              </tr>
            `
              )
              .join("")}
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
          <div class="thanks"><strong>Thank you for your order!</strong><br>We hope you love your gleamwave pieces</div>
          <div class="powered">Powered by <span>gleamwave</span></div>
        </div>
        
        <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
      </div>
      
      <script>
        if (window.location.search.includes('autoPrint=true')) {
          window.onload = function() { setTimeout(function() { window.print(); }, 500); };
        }
      </script>
    </body>
    </html>
  `;
};

// ─── DOWNLOAD INVOICE ───
export const downloadInvoice = async (orderId, products, showToast) => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}/admin/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to fetch order details");

    const order = await res.json();
    const productsRes = await fetch(`${API_URL}/products`);
    const allProducts = await productsRes.json();

    const html = generateInvoiceHTML(order, allProducts);

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
