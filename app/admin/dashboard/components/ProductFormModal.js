"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faPlus, faEdit, faTrashCan, faPalette } from "@fortawesome/free-solid-svg-icons";
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
  existingImages = [],
  onDeleteImage,
  deletingImageId,
  // ─── COLOR VARIANTS ───
  variantRows = [],
  onAddVariantRow,
  onRemoveVariantRow,
  onVariantRowChange,
  onVariantImageSelect,
  savingVariantId,
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
          maxWidth: "560px",
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
                Stock * <span style={{ fontWeight: 400, color: C.textLight }}>(used only if no colors below)</span>
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

          {/* ─── COLOR VARIANTS SECTION ─── */}
          <div
            style={{
              marginBottom: 24,
              padding: "16px 18px",
              backgroundColor: C.whiteOff,
              borderRadius: 12,
              border: `1px solid ${C.goldLight}`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: C.maroonDark, display: "flex", alignItems: "center", gap: 6 }}>
                <FontAwesomeIcon icon={faPalette} style={{ color: C.gold }} />
                Colors (Optional)
              </div>
              <button
                type="button"
                onClick={onAddVariantRow}
                style={{
                  padding: "6px 14px",
                  borderRadius: 20,
                  border: `2px solid ${C.maroon}`,
                  backgroundColor: "transparent",
                  color: C.maroon,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <FontAwesomeIcon icon={faPlus} style={{ fontSize: 10 }} /> Add Color
              </button>
            </div>

            {variantRows.length === 0 ? (
              <div style={{ fontSize: 12, color: C.textLight }}>
                No colors added — this product will use the single Stock number above.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {variantRows.map((row, index) => {
                  const isSavingThisOne = row.id && savingVariantId === row.id;
                  const previewUrl = row.imageFile ? URL.createObjectURL(row.imageFile) : row.image_url;

                  return (
                    <div
                      key={row.id ?? `new-${index}`}
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "flex-start",
                        padding: "10px",
                        backgroundColor: C.white,
                        borderRadius: 10,
                        border: `1px solid ${C.goldPale}`,
                      }}
                    >
                      {/* Image thumbnail + upload */}
                      <label
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 8,
                          border: `2px dashed ${C.goldPale}`,
                          backgroundColor: C.whiteOff,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                          cursor: "pointer",
                          flexShrink: 0,
                          position: "relative",
                        }}
                        title="Click to upload/replace this color's photo"
                      >
                        {previewUrl ? (
                          <img
                            src={previewUrl}
                            alt={row.color_name || "color"}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <FontAwesomeIcon icon={faPlus} style={{ fontSize: 14, color: C.textLight }} />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) onVariantImageSelect(index, file);
                          }}
                        />
                      </label>

                      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 90px", gap: 8 }}>
                        <input
                          type="text"
                          placeholder="Color name (e.g. Green)"
                          value={row.color_name}
                          onChange={(e) => onVariantRowChange(index, "color_name", e.target.value)}
                          style={{
                            padding: "8px 10px",
                            borderRadius: 8,
                            border: `2px solid ${C.goldPale}`,
                            fontSize: 13,
                            fontFamily: "inherit",
                            outline: "none",
                            backgroundColor: C.whiteOff,
                          }}
                          required
                        />
                        <input
                          type="number"
                          placeholder="Stock"
                          min="0"
                          value={row.stock}
                          onChange={(e) => onVariantRowChange(index, "stock", e.target.value)}
                          style={{
                            padding: "8px 10px",
                            borderRadius: 8,
                            border: `2px solid ${C.goldPale}`,
                            fontSize: 13,
                            fontFamily: "inherit",
                            outline: "none",
                            backgroundColor: C.whiteOff,
                          }}
                          required
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemoveVariantRow(index, row.id)}
                        disabled={isSavingThisOne}
                        title="Remove this color"
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          border: "none",
                          backgroundColor: "#FEE2E2",
                          color: "#DC2626",
                          cursor: isSavingThisOne ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <FontAwesomeIcon icon={faTrashCan} style={{ fontSize: 13 }} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            <div style={{ fontSize: 11, color: C.textLight, marginTop: 10 }}>
              {isEdit
                ? "Photos upload immediately when selected. Name/stock changes and new colors save when you press Update Product below."
                : "Add each color's name and stock now. Photos will upload right after you create the product."}
            </div>
          </div>

          {/* ─── EXISTING GENERAL IMAGES (edit mode only) — click ✕ to delete ─── */}
          {isEdit && existingImages.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 14, fontWeight: 500, color: C.textMid, display: "block", marginBottom: 8 }}>
                General Product Images
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                {existingImages.map((img) => {
                  const isDeleting = deletingImageId === img.id;
                  return (
                    <div
                      key={img.id}
                      style={{
                        position: "relative",
                        width: "100%",
                        paddingTop: "100%",
                        borderRadius: 10,
                        overflow: "hidden",
                        border: `2px solid ${C.goldPale}`,
                        opacity: isDeleting ? 0.5 : 1,
                      }}
                    >
                      <img
                        src={img.image_url}
                        alt="Product"
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => onDeleteImage && onDeleteImage(img.id)}
                        disabled={isDeleting}
                        title="Delete this image"
                        style={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          border: "none",
                          backgroundColor: "rgba(220,38,38,0.9)",
                          color: "#fff",
                          fontSize: 11,
                          cursor: isDeleting ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <FontAwesomeIcon icon={faTrashCan} />
                      </button>
                    </div>
                  );
                })}
              </div>
              <div style={{ fontSize: 11, color: C.textLight, marginTop: 6 }}>
                These are shown only for products without colors selected.
              </div>
            </div>
          )}

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 14, fontWeight: 500, color: C.textMid, display: "block", marginBottom: 4 }}>
              {isEdit ? "Add New General Images (Optional)" : "General Product Images"}
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