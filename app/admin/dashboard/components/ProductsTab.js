"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faBox, faArrowTrendUp, faArrowTrendDown, faEdit, faTrashCan } from "@fortawesome/free-solid-svg-icons";
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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
        {products.map((product) => {
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
    </>
  );
}
