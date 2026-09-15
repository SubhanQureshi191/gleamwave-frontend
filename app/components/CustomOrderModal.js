"use client";
import { useState, useEffect } from "react";
import { API_URL } from "@/lib/config";

const CustomOrderModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    productType: "",
    description: "",
    budget: "",
    colorPreference: "",
    occasion: "",
    whatsapp: "",
    name: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);

  // ── BRAND TOKENS ──────────────────────────────────────────
  const C = {
    white: "#FFFFFF",
    whiteOff: "#FDF8F3",
    maroon: "#6F4E37",
    maroonDark: "#4A2E22",
    maroonLight: "#8B6F47",
    gold: "#B8956A",
    goldLight: "#E8D9C0",
    goldPale: "#F5EDE0",
    text: "#3D2B1F",
    textMid: "#6B4F3A",
    textLight: "#A08070",
  };

  // ─── AUTO-FILL USER DATA ──────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const user = JSON.parse(userData);
          setFormData(prev => ({
            ...prev,
            name: user.name || "",
            email: user.email || "",
            whatsapp: user.phone || "",
          }));
        } catch (e) {}
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Build WhatsApp message with complete payment flow
    const message = ` *New Custom Order Request* 

 *Product Type:* ${formData.productType || "Not specified"}
 *Color Preference:* ${formData.colorPreference || "Not specified"}
 *Occasion:* ${formData.occasion || "Not specified"}
 *Budget Range:* ${formData.budget || "Not specified"}

 *Description:*
${formData.description || "No description provided"}

 *Name:* ${formData.name || "Not provided"}
 *Email:* ${formData.email || "Not provided"}
 *WhatsApp:* ${formData.whatsapp || "Not provided"}

          ORDER PAYMENT FLOW :            

 40% Advance Payment → Order Confirmed 
 Crafting Time: 10-15 Days
 Product Ready → We'll Contact You 
 Remaining 60% Payment 
 Order Delivered to You! 

 Sent from Gleamwave Custom Order Form
 We'll get back to you within 24 hours!`;

    // Encode for WhatsApp URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = "923192206562"; // 03192206562 without 0
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    // Save to database (optional)
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/custom-orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
    } catch (error) {
      console.error("Error saving inquiry:", error);
    }

    // Open WhatsApp
    window.open(whatsappURL, "_blank");
    
    setLoading(false);
    onClose();
    // Reset form
    setFormData({
      productType: "",
      description: "",
      budget: "",
      colorPreference: "",
      occasion: "",
      whatsapp: "",
      name: "",
      email: "",
    });
  };

  // ─── PRODUCT TYPES ──────────────────────────────────────
  const productTypes = [
    "Jewelry",
    "Memory Jewelry",
    "Bridal & Nikkah",
    "Resin Trays",
    "Frames & MDF",
    "Resin Stationery",
    "Custom Gajra",
    "Nikkah Booklet",
    "Quran Rehal",
    "Other",
  ];

  const occasions = [
    "Wedding",
    "Nikkah",
    "Birthday",
    "Anniversary",
    "Eid",
    "Graduation",
    "Valentine's Day",
    "Mother's Day",
    "Just Because",
    "Other",
  ];

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: C.white,
          borderRadius: "24px",
          padding: "40px",
          maxWidth: "540px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
          boxShadow: "0 24px 80px rgba(0,0,0,0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "20px",
            backgroundColor: "transparent",
            border: "none",
            fontSize: "28px",
            cursor: "pointer",
            color: C.textLight,
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => e.target.style.opacity = "0.6"}
          onMouseLeave={(e) => e.target.style.opacity = "1"}
        >
          ×
        </button>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              fontSize: 32,
              marginBottom: 8,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span></span>
            <span style={{ fontSize: 24, fontWeight: 700, color: C.maroonDark, fontFamily: "'Georgia', serif" }}>
              Custom Order
            </span>
          </div>
          <p style={{ color: C.textLight, fontSize: 14, lineHeight: 1.6 }}>
            Tell us your vision and we'll bring it to life! Fill in the details below and we'll get back to you within 24 hours.
          </p>
        </div>

        {/* ─── PAYMENT FLOW BANNER ─── */}
        <div
          style={{
            backgroundColor: C.goldPale,
            borderRadius: 12,
            padding: "18px 20px",
            marginBottom: 24,
            border: `2px solid ${C.gold}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 18 }}></span>
            <span style={{ fontWeight: 700, color: C.maroonDark, fontSize: 15 }}>
              How It Works
            </span>
          </div>
          
          <div style={{ fontSize: 13, color: C.textMid, lineHeight: 2 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <span style={{ color: C.maroon, fontWeight: 700, minWidth: 20 }}></span>
              <span><strong>40% Advance Payment</strong> - Order Confirmed</span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <span style={{ color: C.maroon, fontWeight: 700, minWidth: 20 }}></span>
              <span><strong>Crafting Time:</strong> 10-15 Days</span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <span style={{ color: C.maroon, fontWeight: 700, minWidth: 20 }}></span>
              <span><strong>Product Ready!</strong> We'll contact you </span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <span style={{ color: C.maroon, fontWeight: 700, minWidth: 20 }}></span>
              <span><strong>Remaining 60% Payment</strong> — Before Delivery </span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <span style={{ color: C.maroon, fontWeight: 700, minWidth: 20 }}></span>
              <span><strong>Order Delivered</strong> to your doorstep! </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 14, fontWeight: 500, color: C.textMid, display: "block", marginBottom: 4 }}>
              Your Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 12,
                border: `2px solid ${C.goldPale}`,
                fontSize: 14,
                fontFamily: "inherit",
                outline: "none",
                backgroundColor: C.whiteOff,
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => e.target.style.borderColor = C.maroon}
              onBlur={(e) => e.target.style.borderColor = C.goldPale}
              required
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 14, fontWeight: 500, color: C.textMid, display: "block", marginBottom: 4 }}>
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 12,
                border: `2px solid ${C.goldPale}`,
                fontSize: 14,
                fontFamily: "inherit",
                outline: "none",
                backgroundColor: C.whiteOff,
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => e.target.style.borderColor = C.maroon}
              onBlur={(e) => e.target.style.borderColor = C.goldPale}
              required
            />
          </div>

          {/* WhatsApp */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 14, fontWeight: 500, color: C.textMid, display: "block", marginBottom: 4 }}>
              WhatsApp Number *
            </label>
            <input
              type="tel"
              name="whatsapp"
              value={formData.whatsapp}
              onChange={handleChange}
              placeholder="03XX-XXXXXXX"
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 12,
                border: `2px solid ${C.goldPale}`,
                fontSize: 14,
                fontFamily: "inherit",
                outline: "none",
                backgroundColor: C.whiteOff,
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => e.target.style.borderColor = C.maroon}
              onBlur={(e) => e.target.style.borderColor = C.goldPale}
              required
            />
          </div>

          {/* Product Type */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 14, fontWeight: 500, color: C.textMid, display: "block", marginBottom: 4 }}>
              Product Type *
            </label>
            <select
              name="productType"
              value={formData.productType}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 12,
                border: `2px solid ${C.goldPale}`,
                fontSize: 14,
                fontFamily: "inherit",
                outline: "none",
                backgroundColor: C.whiteOff,
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => e.target.style.borderColor = C.maroon}
              onBlur={(e) => e.target.style.borderColor = C.goldPale}
              required
            >
              <option value="">Select product type</option>
              {productTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Occasion */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 14, fontWeight: 500, color: C.textMid, display: "block", marginBottom: 4 }}>
              Occasion
            </label>
            <select
              name="occasion"
              value={formData.occasion}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 12,
                border: `2px solid ${C.goldPale}`,
                fontSize: 14,
                fontFamily: "inherit",
                outline: "none",
                backgroundColor: C.whiteOff,
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => e.target.style.borderColor = C.maroon}
              onBlur={(e) => e.target.style.borderColor = C.goldPale}
            >
              <option value="">Select occasion</option>
              {occasions.map((occ) => (
                <option key={occ} value={occ}>{occ}</option>
              ))}
            </select>
          </div>

          {/* Color Preference */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 14, fontWeight: 500, color: C.textMid, display: "block", marginBottom: 4 }}>
              Color Preference
            </label>
            <input
              type="text"
              name="colorPreference"
              value={formData.colorPreference}
              onChange={handleChange}
              placeholder="e.g., Pink & Gold, Maroon & Beige"
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 12,
                border: `2px solid ${C.goldPale}`,
                fontSize: 14,
                fontFamily: "inherit",
                outline: "none",
                backgroundColor: C.whiteOff,
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => e.target.style.borderColor = C.maroon}
              onBlur={(e) => e.target.style.borderColor = C.goldPale}
            />
          </div>

          {/* Budget */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 14, fontWeight: 500, color: C.textMid, display: "block", marginBottom: 4 }}>
              Budget Range
            </label>
            <select
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 12,
                border: `2px solid ${C.goldPale}`,
                fontSize: 14,
                fontFamily: "inherit",
                outline: "none",
                backgroundColor: C.whiteOff,
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => e.target.style.borderColor = C.maroon}
              onBlur={(e) => e.target.style.borderColor = C.goldPale}
            >
              <option value="">Select budget range</option>
              <option value="Under Rs. 1,000">Under Rs. 1,000</option>
              <option value="Rs. 1,000 - 2,500">Rs. 1,000 - 2,500</option>
              <option value="Rs. 2,500 - 5,000">Rs. 2,500 - 5,000</option>
              <option value="Rs. 5,000 - 10,000">Rs. 5,000 - 10,000</option>
              <option value="Rs. 10,000+">Rs. 10,000+</option>
              <option value="Flexible">Flexible</option>
            </select>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 14, fontWeight: 500, color: C.textMid, display: "block", marginBottom: 4 }}>
              Description / Details *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe your custom order in detail... What flowers, colors, size, or specific design do you have in mind?"
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 12,
                border: `2px solid ${C.goldPale}`,
                fontSize: 14,
                fontFamily: "inherit",
                outline: "none",
                backgroundColor: C.whiteOff,
                resize: "vertical",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => e.target.style.borderColor = C.maroon}
              onBlur={(e) => e.target.style.borderColor = C.goldPale}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: 14,
              border: "none",
              backgroundColor: C.maroon,
              color: C.goldLight,
              fontSize: 16,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              transition: "all 0.3s",
              opacity: loading ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = C.maroonDark;
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = C.maroon;
              }
            }}
          >
            {loading ? (
              <>
                <span style={{ animation: "spin 1s linear infinite" }}>⏳</span>
                Sending...
              </>
            ) : (
              <>
                <span></span>
                Send via WhatsApp
              </>
            )}
          </button>

          <p style={{
            textAlign: "center",
            fontSize: 12,
            color: C.textLight,
            marginTop: 12,
          }}>
            By submitting, you'll be redirected to WhatsApp to confirm your order.
          </p>
        </form>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CustomOrderModal;