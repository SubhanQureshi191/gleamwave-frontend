"use client";
import { useRef, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart, faGem } from "@fortawesome/free-solid-svg-icons";

// ── BRAND TOKENS ──
const C = {
  white: "#FFFFFF",
  maroon: "#6F4E37",
  maroonDark: "#4A2E22",
  maroonPale: "#F0E6DA",
  gold: "#B8956A",
  goldLight: "#E8D9C0",
  goldPale: "#F5EDE0",
  textLight: "#A08070",
};

const GAP = 16;

// ─── PRICE DISPLAY (kept local so this component is self-contained) ───
const PriceDisplay = ({ product }) => {
  const hasDiscount = product?.original_price && product.original_price > product.price;
  let discountPercent = product?.discount_percent || 0;
  if (!discountPercent && hasDiscount) {
    discountPercent = Math.round(
      ((product.original_price - product.price) / product.original_price) * 100,
    );
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      {hasDiscount ? (
        <>
          <span style={{ fontSize: 14, color: "#999", textDecoration: "line-through" }}>
            Rs. {product.original_price.toLocaleString()}
          </span>
          <span style={{ fontSize: 20, fontWeight: 700, color: "#dc2626" }}>
            Rs. {product.price.toLocaleString()}
          </span>
          <span
            style={{
              backgroundColor: "#dc2626",
              color: "white",
              padding: "2px 10px",
              borderRadius: 12,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            -{discountPercent}% OFF
          </span>
        </>
      ) : (
        <span style={{ fontSize: 20, fontWeight: 700, color: C.maroon }}>
          Rs. {product.price.toLocaleString()}
        </span>
      )}
    </div>
  );
};

// ─── SINGLE PRODUCT CARD ─────────────────────────────────────
function ProductCard({ product, onProductClick, onAddToCart }) {
  const isOutOfStock = product.stock <= 0;

  return (
    <div
      className="prod-card"
      onClick={() => !isOutOfStock && onProductClick(product.id)}
      style={{
        backgroundColor: "#fff",
        borderRadius: 22,
        overflow: "hidden",
        border: `2px solid ${isOutOfStock ? "#EF4444" : C.goldPale}`,
        cursor: isOutOfStock ? "not-allowed" : "pointer",
        opacity: isOutOfStock ? 0.7 : 1,
      }}
    >
      <div
        style={{
          aspectRatio: "4 / 3",
          background: `linear-gradient(135deg, ${C.maroonPale}, ${C.goldPale})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {product.images?.[0]?.image_url ? (
          <img
            src={product.images[0].image_url}
            alt={product.name}
            loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <FontAwesomeIcon icon={faGem} style={{ fontSize: 48, color: C.maroon }} />
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
            }}
          >
            <span
              style={{
                backgroundColor: "#EF4444",
                color: "white",
                padding: "6px 16px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              OUT OF STOCK
            </span>
          </div>
        )}
      </div>
      <div style={{ padding: "20px 22px" }}>
        <div style={{ fontSize: 12, color: C.textLight, textTransform: "uppercase", marginBottom: 4 }}>
          {product.category}
        </div>
        <div style={{ fontSize: 17, fontWeight: 600, color: C.maroonDark, marginBottom: 10 }}>
          {product.name}
        </div>
        <PriceDisplay product={product} />
        <button
          onClick={(e) => onAddToCart(product.id, product.name, e)}
          disabled={isOutOfStock}
          style={{
            marginTop: 12,
            width: "100%",
            padding: "10px",
            borderRadius: 30,
            border: "none",
            backgroundColor: isOutOfStock ? "#ccc" : C.maroon,
            color: isOutOfStock ? "#999" : C.goldLight,
            fontSize: 12,
            cursor: isOutOfStock ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            fontWeight: 600,
          }}
        >
          <FontAwesomeIcon icon={faShoppingCart} style={{ marginRight: 6 }} />
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

// ─── LOADING SKELETON CARD ─────────────────────────────────────
function SkeletonCard() {
  return (
    <div
      className="prod-card"
      style={{
        backgroundColor: "#fff",
        borderRadius: 22,
        height: 380,
        border: `2px solid ${C.goldPale}`,
      }}
    />
  );
}

// ─── CAROUSEL ─────────────────────────────────────────────────
// Desktop / tablet: normal responsive grid.
// Phone (<= 768px): one row you swipe sideways, snapping card by card.
export default function ProductCarousel({ products = [], loading = false, onProductClick, onAddToCart }) {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);

  const items = loading ? Array(6).fill(null) : products;

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const onScroll = () => {
      const first = el.firstElementChild;
      if (!first) return;
      const step = first.getBoundingClientRect().width + GAP;
      const index = Math.round(el.scrollLeft / step);
      setActive(Math.min(items.length - 1, Math.max(0, index)));
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [items.length]);

  const goTo = (index) => {
    const el = trackRef.current;
    const child = el?.children[index];
    if (!el || !child) return;
    const padLeft = parseFloat(getComputedStyle(el).paddingLeft) || 0;
    el.scrollTo({ left: child.offsetLeft - padLeft, behavior: "smooth" });
  };

  if (!items.length) return null;

  return (
    <div>
      <div ref={trackRef} className="prod-track">
        {items.map((product, i) =>
          product ? (
            <ProductCard
              key={product.id}
              product={product}
              onProductClick={onProductClick}
              onAddToCart={onAddToCart}
            />
          ) : (
            <SkeletonCard key={i} />
          ),
        )}
      </div>

      {!loading && items.length > 1 && (
        <div className="prod-dots">
          {items.map((product, i) => (
            <button
              key={product.id}
              type="button"
              aria-label={`Show ${product.name}`}
              onClick={() => goTo(i)}
              style={{
                width: i === active ? 22 : 8,
                height: 8,
                borderRadius: 8,
                border: "none",
                padding: 0,
                cursor: "pointer",
                backgroundColor: i === active ? C.maroon : C.goldLight,
                transition: "width 0.3s ease, background-color 0.3s ease",
              }}
            />
          ))}
        </div>
      )}

      <style>{`
        .prod-track {
          position: relative;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
        }
        .prod-dots { display: none; }
        .prod-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .prod-card:hover { transform: translateY(-6px); box-shadow: 0 12px 40px ${C.maroon}33; }

        @media (max-width: 768px) {
          .prod-track {
            display: flex;
            gap: ${GAP}px;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            scroll-padding: 0 24px;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior-x: contain;
            scrollbar-width: none;
            margin: 0 -24px;
            padding: 4px 24px 18px;
          }
          .prod-track::-webkit-scrollbar { display: none; }
          .prod-card {
            flex: 0 0 78%;
            max-width: 320px;
            scroll-snap-align: start;
          }
          .prod-card:hover { transform: none; box-shadow: none; }
          .prod-dots {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 8px;
            margin-top: 4px;
          }
        }
      `}</style>
    </div>
  );
}