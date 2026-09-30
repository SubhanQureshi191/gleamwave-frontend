// ─── SHARED INVOICE TEMPLATE ─────────────────────────────────────
// Used by both the customer profile page and the admin Orders tab, so
// the invoice only needs to be designed/fixed in one place.
export const generateInvoiceHTML = (order) => {
  const totalAmount = order.total_amount || 0;

  const subtotal =
    order.subtotal ||
    order.items?.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    ) ||
    0;

  const deliveryCharges = order.delivery_charges || 300;

  const totalAdvancePaid = (order.items || []).reduce(
    (sum, item) =>
      item.advance_required && item.advance_amount
        ? sum + item.advance_amount * (item.quantity || 1)
        : sum,
    0
  );
  const balanceDue = totalAmount - totalAdvancePaid;

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
                <td>
                  <div class="product-name">${escapeHtml(item.product_name)}</div>
                  ${item.advance_required && item.advance_amount ? `
                    <div style="font-size:10px;color:#B8860B;margin-top:2px;">
                      Advance paid: Rs. ${(item.advance_amount * (item.quantity || 1)).toLocaleString()}
                    </div>
                  ` : ""}
                </td>
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
            ${totalAdvancePaid > 0 ? `
              <div class="totals-row" style="color:#B8860B;"><span>Advance Paid</span><span>- Rs. ${totalAdvancePaid.toLocaleString()}</span></div>
              <div class="totals-row" style="font-weight:700;color:#4A2E22;border-top:1px solid #e8d9c0;padding-top:6px;margin-top:2px;"><span>Balance Due</span><span>Rs. ${balanceDue.toLocaleString()}</span></div>
            ` : ""}
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