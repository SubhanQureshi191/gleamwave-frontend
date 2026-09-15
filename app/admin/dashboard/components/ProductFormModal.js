"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faPlus, faEdit } from "@fortawesome/free-solid-svg-icons";
import { C, ALL_CATEGORIES } from "@/lib/adminConstants";

// mode: "add" | "edit"
export default function ProductFormModal({
  mode,
  show,
  onClose,
  formData,
  handleChange,
  handleImageUpload,
  images,
  onSubmit,
  uploading,
}) {
  if (!show) return null;

  const isEdit = mode === "edit";

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
    >
      <div
        style={{
          backgroundColor: C.white,
          borderRadius: "24px",
          padding: "40px",
          maxWidth: "520px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 20,
            backgroundColor: "transparent",
            border: "none",
            fontSize: 28,
            cursor: "pointer",
            color: C.textLight,
          }}
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>

        <h2
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: C.maroonDark,
            marginBottom: 8,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <FontAwesomeIcon icon={isEdit ? faEdit : faPlus} /> {isEdit ? "Edit Product" : "Add New Product"}
        </h2>
        <p style={{ color: C.textLight, marginBottom: 24, fontSize: 14 }}>
          {isEdit ? "Update product details" : "Fill in the product details below"}
        </p>

        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 14, fontWeight: 500, color: C.textMid, display: "block", marginBottom: 4 }}>
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 10,
                border: `2px solid ${C.goldPale}`,
                fontSize: 14,
                fontFamily: "inherit",
                outline: "none",
                backgroundColor: C.whiteOff,
              }}
              required
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 14, fontWeight: 500, color: C.textMid, display: "block", marginBottom: 4 }}>
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 10,
                border: `2px solid ${C.goldPale}`,
                fontSize: 14,
                fontFamily: "inherit",
                outline: "none",
                backgroundColor: C.whiteOff,
              }}
              required
            >
              <option value="">Select Category</option>
              {ALL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 14, fontWeight: 500, color: C.textMid, display: "block", marginBottom: 4 }}>
                Cost Price (Rs.) *
              </label>
              <input
                type="number"
                name="cost_price"
                value={formData.cost_price}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="e.g. 500"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: `2px solid ${C.lossRed}44`,
                  fontSize: 14,
                  fontFamily: "inherit",
                  outline: "none",
                  backgroundColor: C.whiteOff,
                }}
                required
              />
              {!isEdit && <div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>Your production cost</div>}
            </div>

            <div>
              <label style={{ fontSize: 14, fontWeight: 500, color: C.textMid, display: "block", marginBottom: 4 }}>
                Original Price (Rs.)
              </label>
              <input
                type="number"
                name="original_price"
                value={formData.original_price}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="e.g. 1999"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: `2px solid ${C.goldPale}`,
                  fontSize: 14,
                  fontFamily: "inherit",
                  outline: "none",
                  backgroundColor: C.whiteOff,
                }}
              />
              {!isEdit && <div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>Before discount (optional)</div>}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 14, fontWeight: 500, color: C.textMid, display: "block", marginBottom: 4 }}>
              Discount (%)
            </label>
            <input
              type="number"
              name="discount_percent"
              value={formData.discount_percent}
              onChange={handleChange}
              min="0"
              max="100"
              step="1"
              placeholder="e.g. 20"
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 10,
                border: `2px solid ${C.goldPale}`,
                fontSize: 14,
                fontFamily: "inherit",
                outline: "none",
                backgroundColor: C.whiteOff,
              }}
            />
          </div>

          <div
            style={{
              marginBottom: 20,
              padding: "16px 18px",
              backgroundColor: C.whiteOff,
              borderRadius: 12,
              border: `1px solid ${C.goldLight}`,
            }}
          >
            <div style={{ fontSize: 12, color: C.textLight, marginBottom: 10, fontWeight: 600 }}>PROFIT CALCULATION</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div>
                <div style={{ fontSize: 10, color: C.textLight, textTransform: "uppercase" }}>Cost</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.textMid }}>
                  Rs. {formData.cost_price ? Number(formData.cost_price).toLocaleString() : 0}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: C.textLight, textTransform: "uppercase" }}>Sale Price</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.maroon }}>
                  Rs. {formData.price ? Number(formData.price).toLocaleString() : 0}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: C.textLight, textTransform: "uppercase" }}>Profit/Unit</div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: Number(formData.price) - Number(formData.cost_price) >= 0 ? C.profitGreen : C.lossRed,
                  }}
                >
                  Rs. {(Number(formData.price || 0) - Number(formData.cost_price || 0)).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 14, fontWeight: 500, color: C.textMid, display: "block", marginBottom: 4 }}>Tag</label>
              <select
                name="tag"
                value={formData.tag}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: `2px solid ${C.goldPale}`,
                  fontSize: 14,
                  fontFamily: "inherit",
                  outline: "none",
                  backgroundColor: C.whiteOff,
                }}
              >
                <option value="New">New</option>
                <option value="Bestseller">Bestseller</option>
                <option value="Premium">Premium</option>
                <option value="Popular">Popular</option>
                <option value="Trending">Trending</option>
                <option value="Gifting">Gifting</option>
                <option value="Custom">Custom</option>
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 14, fontWeight: 500, color: C.textMid, display: "block", marginBottom: 4 }}>
                Stock *
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: `2px solid ${C.goldPale}`,
                  fontSize: 14,
                  fontFamily: "inherit",
                  outline: "none",
                  backgroundColor: C.whiteOff,
                }}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 14, fontWeight: 500, color: C.textMid, display: "block", marginBottom: 4 }}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 10,
                border: `2px solid ${C.goldPale}`,
                fontSize: 14,
                fontFamily: "inherit",
                outline: "none",
                backgroundColor: C.whiteOff,
                resize: "vertical",
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 14, fontWeight: 500, color: C.textMid, display: "block", marginBottom: 4 }}>
              {isEdit ? "Add New Images (Optional)" : "Product Images"}
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: 10,
                border: `2px solid ${C.goldPale}`,
                fontSize: 14,
                fontFamily: "inherit",
                backgroundColor: C.whiteOff,
              }}
            />
            {images.length > 0 && (
              <div style={{ fontSize: 13, color: C.textLight, marginTop: 4 }}>
                {images.length} {isEdit ? "new " : ""}image(s) {isEdit ? "will be added" : "selected"}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={uploading}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 12,
              border: "none",
              backgroundColor: isEdit ? C.gold : C.maroon,
              color: isEdit ? "#fff" : C.goldLight,
              fontSize: 16,
              fontWeight: 600,
              cursor: uploading ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              opacity: uploading ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {uploading ? (
              isEdit ? (
                "Updating Product..."
              ) : (
                "Adding Product..."
              )
            ) : (
              <>
                <FontAwesomeIcon icon={isEdit ? faEdit : faPlus} /> {isEdit ? "Update Product" : "Add Product"}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
