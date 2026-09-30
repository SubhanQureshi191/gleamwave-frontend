"use client";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faBox, faArrowTrendUp, faArrowTrendDown, faEdit, faTrashCan, faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons";
import { C } from "@/lib/adminConstants";

// ─── Calculate Product-level Profit ───
const getProductProfit = (product) => {
  const costPrice = product.cost_price || 0;
  const salePrice = product.price || 0;
  const profitPerUnit = salePrice - costPrice;
  const margin = salePrice > 0 ? (profitPerUnit / salePrice) * 100 : 0;

  return {
    costPrice,
    salePrice,
    profitPerUnit,
    margin,
    isLoss: profitPerUnit < 0,
  };
};

export default function ProductsTab({ products, onAddClick, onEditClick, onDeleteClick }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // ─── Unique categories present in the current product list ───
  const categories = ["All", ...new Set(products.map((p) => p.category).filter(Boolean))];

  // ─── Apply search + category filter ───
  const filteredProducts = products.filter((product) => {
    const matchesCategory = categoryFilter === "All" || product.category === categoryFilter;
    const matchesSearch =
      !searchTerm.trim() ||
      product.name?.toLowerCase().includes(searchTerm.trim().toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ fontSize: "clamp(2rem, 3vw, 2.8rem)", fontWeight: 700, color: C.maroonDark }}>Products</h1>
          <p style={{ color: C.textLight }}>Manage your product inventory & profit</p>
        </div>
        <button
          onClick={onAddClick}
          style={{
            padding: "12px 24px",
            borderRadius: 50,
            border: "none",
            backgroundColor: C.maroon,
            color: C.goldLight,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "transform 0.2s",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
          onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
          onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
        >
          <FontAwesomeIcon icon={faPlus} /> Add New Product
        </button>
      </div>

      {/* ─── SEARCH BAR ─── */}
      <div style={{ position: "relative", marginBottom: 16, maxWidth: 420 }}>
        <FontAwesomeIcon
          icon={faMagnifyingGlass}
          style={{
            position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
            color: C.textLight, fontSize: 14,
          }}
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search products by name..."
          style={{
            width: "100%",
            padding: "12px 16px 12px 42px",
            borderRadius: 30,
            border: `2px solid ${C.goldPale}`,
            fontSize: 14,
            fontFamily: "inherit",
            outline: "none",
            backgroundColor: C.white,
            boxSizing: "border-box",
          }}
          onFocus={(e) => (e.target.style.borderColor = C.maroon)}
          onBlur={(e) => (e.target.style.borderColor = C.goldPale)}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            aria-label="Clear search"
            style={{
              position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
              border: "none", backgroundColor: "transparent", color: C.textLight,
              cursor: "pointer", fontSize: 14, padding: 4, display: "flex",
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        )}
      </div>

      {/* ─── CATEGORY FILTERS ─── */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            style={{
              padding: "8px 18px",
              borderRadius: 30,
              border: `2px solid ${categoryFilter === cat ? C.maroon : C.goldPale}`,
              backgroundColor: categoryFilter === cat ? C.maroon : "transparent",
              color: categoryFilter === cat ? C.goldLight : C.textMid,
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 12,
              fontWeight: 600,
              transition: "all 0.2s",
              whiteSpace: "nowrap",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <p style={{ fontSize: 13, color: C.textLight, marginBottom: 16 }}>
        Showing {filteredProducts.length} of {products.length} product{products.length !== 1 ? "s" : ""}
      </p>

      {filteredProducts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", backgroundColor: C.whiteOff, borderRadius: 24 }}>
          <FontAwesomeIcon icon={faBox} style={{ fontSize: 48, marginBottom: 16, color: C.textLight }} />
          <h3 style={{ fontSize: 20, color: C.textMid }}>No products match</h3>
          <p style={{ color: C.textLight }}>Try a different search term or category</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
          {filteredProducts.map((product) => {
            const isOutOfStock = product.stock <= 0;
            const productProfit = getProductProfit(product);

            return (
              <div
                key={product.id}
                style={{
                  backgroundColor: C.white,
                  borderRadius: 16,
                  overflow: "hidden",
                  border: `2px solid ${isOutOfStock ? "#EF4444" : C.goldPale}`,
                  transition: "all 0.3s",
                  opacity: isOutOfStock ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  style={{
                    height: 180,
                    background: `linear-gradient(135deg, ${C.maroonPale}, ${C.goldPale})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 56,
                    position: "relative",
                  }}
                >
                  {product.images?.[0]?.image_url ? (
                    <img
                      src={product.images[0].image_url}
                      alt={product.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover", opacity: isOutOfStock ? 0.4 : 1 }}
                    />
                  ) : (
                    <FontAwesomeIcon icon={faBox} style={{ fontSize: 48, color: C.maroon }} />
                  )}

                  {isOutOfStock && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      <span
                        style={{
                          backgroundColor: "#EF4444",
                          color: "white",
                          padding: "4px 12px",
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 700,
                          letterSpacing: "0.05em",
                          transform: "rotate(-15deg)",
                        }}
                      >
                        OUT OF STOCK
                      </span>
                    </div>
                  )}

                  <span
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      backgroundColor: productProfit.isLoss ? C.lossRed : C.profitGreen,
                      color: "white",
                      padding: "4px 12px",
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    }}
                  >
                    <FontAwesomeIcon icon={productProfit.isLoss ? faArrowTrendDown : faArrowTrendUp} style={{ fontSize: 10 }} />
                    {productProfit.isLoss ? "-" : "+"}Rs. {Math.abs(productProfit.profitPerUnit).toLocaleString()}
                  </span>
                </div>

                <div style={{ padding: "16px 20px" }}>
                  <div style={{ fontSize: 12, color: C.textLight, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
                    {product.category}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: C.maroonDark, marginBottom: 12 }}>{product.name}</div>

                  <div
                    style={{
                      backgroundColor: C.whiteOff,
                      padding: "12px 14px",
                      borderRadius: 10,
                      marginBottom: 12,
                      border: `1px solid ${C.goldPale}`,
                    }}
                  >
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, fontSize: 12 }}>
                      <div>
                        <div style={{ color: C.textLight, fontSize: 10, marginBottom: 2 }}>COST</div>
                        <div style={{ fontWeight: 600, color: C.textMid }}>Rs. {productProfit.costPrice.toLocaleString()}</div>
                      </div>
                      <div>
                        <div style={{ color: C.textLight, fontSize: 10, marginBottom: 2 }}>SALE</div>
                        <div style={{ fontWeight: 600, color: C.maroon }}>Rs. {productProfit.salePrice.toLocaleString()}</div>
                      </div>
                      <div>
                        <div style={{ color: C.textLight, fontSize: 10, marginBottom: 2 }}>PROFIT</div>
                        <div style={{ fontWeight: 700, color: productProfit.isLoss ? C.lossRed : C.profitGreen }}>
                          Rs. {productProfit.profitPerUnit.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: 8,
                        paddingTop: 8,
                        borderTop: `1px solid ${C.goldPale}`,
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 11,
                        color: C.textLight,
                      }}
                    >
                      <span>
                        Margin: <strong style={{ color: productProfit.isLoss ? C.lossRed : C.profitGreen }}>{productProfit.margin.toFixed(1)}%</strong>
                      </span>
                      <span>
                        Stock: <strong>{product.stock}</strong>
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      onClick={() => onEditClick(product)}
                      style={{
                        flex: 1,
                        padding: "8px",
                        borderRadius: 8,
                        border: `2px solid ${C.gold}`,
                        backgroundColor: "transparent",
                        color: C.gold,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        fontSize: 13,
                        transition: "all 0.2s",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
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
                      <FontAwesomeIcon icon={faEdit} /> Edit
                    </button>
                    <button
                      onClick={() => onDeleteClick(product.id)}
                      style={{
                        flex: 1,
                        padding: "8px",
                        borderRadius: 8,
                        border: `2px solid ${C.maroon}`,
                        backgroundColor: "transparent",
                        color: C.maroon,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        fontSize: 13,
                        transition: "all 0.2s",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = C.maroon;
                        e.target.style.color = C.goldLight;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "transparent";
                        e.target.style.color = C.maroon;
                      }}
                    >
                      <FontAwesomeIcon icon={faTrashCan} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}