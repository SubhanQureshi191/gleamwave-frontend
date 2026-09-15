"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { API_URL } from "@/lib/config";
import {
  faArrowRight,
  faTimes,
  faChevronDown,
  faChevronUp,
  faGift,
  faBook,
  faRing,
  faGem,
  faHeart,
  faStar,
  faPalette,
  faWandSparkles,
  faBox,
  faCircleCheck,
  faShoppingBag
} from "@fortawesome/free-solid-svg-icons";

// ── BRAND TOKENS ──────────────────────────────────────────────
const C = {
  white: "#FFFFFF",
  whiteOff: "#FDF8F3",
  maroon: "#6F4E37",
  maroonDark: "#4A2E22",
  gold: "#B8956A",
  goldLight: "#E8D9C0",
  goldPale: "#F5EDE0",
  text: "#3D2B1F",
  textMid: "#6B4F3A",
  textLight: "#A08070",
};

// ─── CATEGORY ICON MAP ──────────────────────────────────────────
const CATEGORY_ICONS = {
  "Silk Bouquet": faGift,
  "Quran Rehal": faBook,
  "Customize Gleamwave Basket": faGift,
  "Resin Rings": faRing,
  "Resin Jhumkas": faGem,
  "Resin Trays": faPalette,
  "Resin Bracelets": faGem,
  "Resin Pendants": faHeart,
  "Resin Studs": faStar,
  "Resin MDFs": faBox,
  "Trending Gajra": faHeart,
  "Customized Certificates": faCircleCheck,
  "Booklet": faBook,
  "Resin Stationery": faWandSparkles,
  "Baskets": faShoppingBag
};

export default function Sidebar({
  isOpen,
  onClose,
  showBrandHeader = true,
}) {
  const router = useRouter();
  const [expandedCategories, setExpandedCategories] = useState({});
  const [allDynamicCategories, setAllDynamicCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // ─── FETCH PRODUCTS & BUILD CATEGORIES ───
  useEffect(() => {
    if (!isOpen) return;

    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const res = await fetch(`${API_URL}/products`);
        if (!res.ok) {
          setAllDynamicCategories([]);
          return;
        }
        const data = await res.json();
        const products = Array.isArray(data) ? data : data.products || data.data || [];

        const categoryMap = new Map();
        products.forEach(product => {
          if (product.category) {
            if (!categoryMap.has(product.category)) {
              categoryMap.set(product.category, []);
            }
            categoryMap.get(product.category).push(product);
          }
        });

        const categories = Array.from(categoryMap.entries()).map(([name, items]) => ({
          id: name.toLowerCase().replace(/\s+/g, '-'),
          label: name,
          icon: CATEGORY_ICONS[name] || faBox,
          products: items,
        }));

        categories.sort((a, b) => a.label.localeCompare(b.label));
        setAllDynamicCategories(categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setAllDynamicCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [isOpen]);

  // ─── CLOSE ON OUTSIDE CLICK ───
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen) {
        const sidebar = document.getElementById("sidebar-menu");
        const menuButton = document.getElementById("menu-button");

        if (sidebar && !sidebar.contains(e.target) && menuButton && !menuButton.contains(e.target)) {
          onClose();
          setExpandedCategories({});
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const toggleCategoryExpand = (categoryId, e) => {
    e.stopPropagation();
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleProductClick = (productId) => {
    onClose();
    setExpandedCategories({});
    router.push(`/product/${productId}`);
  };

  const handleClose = () => {
    onClose();
    setExpandedCategories({});
  };

  return (
    <>
      {/* ─── SIDEBAR OVERLAY ─── */}
      {isOpen && (
        <div
          onClick={handleClose}
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            zIndex: 998,
            animation: "fadeIn 0.3s ease",
          }}
        />
      )}

      {/* ─── SIDEBAR ─── */}
      <div
        id="sidebar-menu"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: "320px",
          maxWidth: "85vw",
          backgroundColor: C.whiteOff,
          boxShadow: "4px 0 30px rgba(74,46,34,0.2)",
          zIndex: 999,
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ─── HEADER ─── */}
        <div style={{
          padding: "20px 24px",
          borderBottom: `2px solid ${C.goldPale}`,
          display: "flex",
          alignItems: "center",
          justifyContent: showBrandHeader ? "space-between" : "flex-end",
          backgroundColor: C.maroon,
        }}>
          {showBrandHeader && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 38, height: 38, borderRadius: "50%",
                overflow: "hidden", border: `2px solid ${C.gold}`,
                backgroundColor: C.white,
              }}>
                <img
                  src="/images/categories/logo.jpg"
                  alt="gleamwave"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.style.display = "none";
                    const parent = e.target.parentElement;
                    parent.style.display = "flex";
                    parent.style.alignItems = "center";
                    parent.style.justifyContent = "center";
                    parent.style.backgroundColor = C.goldLight;
                    parent.style.color = C.maroonDark;
                    parent.style.fontWeight = "700";
                    parent.textContent = "G";
                  }}
                />
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: C.goldLight, letterSpacing: "0.1em" }}>
                  gleamwave
                </div>
                <div style={{ fontSize: 8, color: C.goldLight, opacity: 0.7, letterSpacing: "0.2em", textTransform: "uppercase" }}>
                  Handcrafted Resin Art
                </div>
              </div>
            </div>
          )}
          <button
            onClick={handleClose}
            style={{
              backgroundColor: "transparent", border: "none",
              color: C.goldLight, fontSize: 20, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: 4,
            }}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* ─── CONTENT (Categories) ─── */}
        <div style={{ padding: "16px 0", flex: 1 }}>

          {/* Categories List */}
          {loadingCategories ? (
            <div style={{ padding: "20px 24px", color: C.textLight, fontSize: 14 }}>
              Loading categories...
            </div>
          ) : allDynamicCategories.length === 0 ? (
            <div style={{ padding: "20px 24px", color: C.textLight, fontSize: 14 }}>
              No categories available
            </div>
          ) : (
            allDynamicCategories.map((category) => {
              const isExpanded = expandedCategories[category.id] || false;
              return (
                <div key={category.id} style={{ borderBottom: `1px solid ${C.goldPale}` }}>
                  <div
                    onClick={(e) => toggleCategoryExpand(category.id, e)}
                    style={{
                      display: "flex", alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 24px", cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = C.goldPale}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <span style={{
                      fontSize: 14, fontWeight: 500,
                      color: C.maroonDark,
                      display: "flex", alignItems: "center", gap: 10,
                    }}>
                      <FontAwesomeIcon icon={category.icon} style={{ color: C.gold, width: 16 }} />
                      {category.label}
                      <span style={{ fontSize: 11, color: C.textLight }}>
                        ({category.products.length})
                      </span>
                    </span>
                    <FontAwesomeIcon
                      icon={isExpanded ? faChevronUp : faChevronDown}
                      style={{
                        color: C.gold, fontSize: 12,
                        transition: "transform 0.3s ease",
                      }}
                    />
                  </div>

                  {isExpanded && (
                    <div style={{
                      padding: "4px 24px 12px 52px",
                      backgroundColor: "rgba(245,237,224,0.5)",
                      animation: "slideDown 0.3s ease",
                    }}>
                      {category.products.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => handleProductClick(product.id)}
                          style={{
                            padding: "8px 12px", fontSize: 13,
                            color: C.textMid, cursor: "pointer",
                            borderRadius: "6px",
                            display: "flex", alignItems: "center", gap: 8,
                            transition: "all 0.15s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = C.white;
                            e.currentTarget.style.color = C.maroon;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.color = C.textMid;
                          }}
                        >
                          <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 9, color: C.gold }} />
                          {product.name}
                          <span style={{ fontSize: 11, color: C.textLight, marginLeft: "auto" }}>
                            Rs. {product.price}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}