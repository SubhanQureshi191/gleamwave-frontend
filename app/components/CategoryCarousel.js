"use client";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faBox } from "@fortawesome/free-solid-svg-icons";

// ── BRAND TOKENS ──
const C = {
  white: "#FFFFFF",
  maroon: "#6F4E37",
  maroonDark: "#4A2E22",
  maroonPale: "#F0E6DA",
  gold: "#B8956A",
  goldLight: "#E8D9C0",
  goldPale: "#F5EDE0",
  textMid: "#6B4F3A",
};

const GAP = 16; // gap between cards on mobile (must match .cat-track gap below)

// ─── SINGLE CATEGORY CARD ─────────────────────────────────────
function CategoryCard({ cat }) {
  const [imgFailed, setImgFailed] = useState(false);
  const count = cat.products?.length || 0;
  const showImage = cat.image && !imgFailed;

  return (
    <Link
      href={`/products?category=${encodeURIComponent(cat.label)}`}
      className="cat-card"
      style={{
        display: "block",
        textDecoration: "none",
        backgroundColor: C.white,
        border: "1px solid rgba(184,149,106,0.18)",
        borderRadius: 20,
        overflow: "hidden",
        boxShadow: "0 2px 16px rgba(74,46,34,0.05)",
      }}
    >
      {/* Image area — a gradient + icon shows if the photo is missing */}
      <div
        className="cat-card-img"
        style={{
          position: "relative",
          aspectRatio: "4 / 3",
          overflow: "hidden",
          background: `linear-gradient(135deg, ${C.maroonPale}, ${C.goldPale})`,
        }}
      >
        {showImage ? (
          <img
            src={cat.image}
            alt={cat.label}
            loading="lazy"
            onError={() => setImgFailed(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FontAwesomeIcon icon={cat.icon || faBox} style={{ fontSize: 44, color: C.gold, opacity: 0.6 }} />
          </div>
        )}

        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(20,12,8,0) 40%, rgba(20,12,8,0.75) 100%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: 14,
            left: 14,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.18)",
              backdropFilter: "blur(6px)",
              border: `1px solid ${C.goldLight}66`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <FontAwesomeIcon icon={cat.icon || faBox} style={{ color: C.goldLight, fontSize: 13 }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#FFFFFF", letterSpacing: "0.03em" }}>
            {count} piece{count !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Text area */}
      <div style={{ padding: "18px 20px 20px" }}>
        <div style={{ fontWeight: 700, fontSize: 18, color: C.maroonDark, marginBottom: 10 }}>
          {cat.label}
        </div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12,
            fontWeight: 600,
            color: C.maroon,
            letterSpacing: "0.04em",
          }}
        >
          View All <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 11 }} />
        </span>
      </div>
    </Link>
  );
}

// ─── CAROUSEL ─────────────────────────────────────────────────
// Desktop / tablet: normal responsive grid.
// Phone (<= 768px): one row you swipe sideways, snapping card by card,
// with the next card peeking in so people know they can swipe.
export default function CategoryCarousel({ categories = [] }) {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);

  // Keep the dots in sync with the swipe position
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const onScroll = () => {
      const first = el.firstElementChild;
      if (!first) return;
      const step = first.getBoundingClientRect().width + GAP;
      const index = Math.round(el.scrollLeft / step);
      setActive(Math.min(categories.length - 1, Math.max(0, index)));
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [categories.length]);

  const goTo = (index) => {
    const el = trackRef.current;
    const child = el?.children[index];
    if (!el || !child) return;
    const padLeft = parseFloat(getComputedStyle(el).paddingLeft) || 0;
    el.scrollTo({ left: child.offsetLeft - padLeft, behavior: "smooth" });
  };

  if (!categories.length) return null;

  return (
    <div>
      <div ref={trackRef} className="cat-track">
        {categories.map((cat) => (
          <CategoryCard key={cat.id} cat={cat} />
        ))}
      </div>

      {categories.length > 1 && (
        <div className="cat-dots" aria-hidden="false">
          {categories.map((cat, i) => (
            <button
              key={cat.id}
              type="button"
              aria-label={`Show ${cat.label}`}
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
        .cat-track {
          position: relative;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
        }
        .cat-dots { display: none; }
        .cat-card { transition: transform 0.35s ease, box-shadow 0.35s ease; }
        .cat-card:hover { transform: translateY(-6px); box-shadow: 0 20px 48px rgba(111,78,55,0.14) !important; }
        .cat-card-img img { transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1); }
        .cat-card:hover .cat-card-img img { transform: scale(1.08); }

        @media (max-width: 768px) {
          .cat-track {
            display: flex;
            gap: ${GAP}px;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            scroll-padding: 0 24px;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior-x: contain;
            scrollbar-width: none;
            /* bleed to the screen edges (the section has 24px side padding) */
            margin: 0 -24px;
            padding: 4px 24px 18px;
          }
          .cat-track::-webkit-scrollbar { display: none; }
          .cat-card {
            flex: 0 0 78%;
            max-width: 320px;
            scroll-snap-align: start;
          }
          .cat-card:hover { transform: none; }
          .cat-dots {
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