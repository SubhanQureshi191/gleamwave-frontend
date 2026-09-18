"use client";
import { useState, useEffect, useCallback } from "react";
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
  faShoppingBag,
} from "@fortawesome/free-solid-svg-icons";

// ── BRAND TOKENS ──
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

// ─── CATEGORY ICON MAP ───
const CATEGORY_ICONS = {
  "Silk Bouquet": faGift,
  "Quran Rehal": faBook,
  "Customize Gleamwave Basket": faGift,
  "Resin Rings": faRing,
  "Resin Jhumkas": faGem,
  "Resin Earings": faGem,
  "Resin Trays": faPalette,
  "Resin Bracelets": faGem,
  "Resin Pendants": faHeart,
  "Resin Studs": faStar,
  "Resin MDFs": faBox,
  "Trending Gajra": faHeart,
  "Customized Certificates": faCircleCheck,
  Booklet: faBook,
  "Resin Stationery": faWandSparkles,
  Baskets: faShoppingBag,
};

// ─── CACHE CONFIG ───
const CATEGORIES_CACHE_KEY = "gleamwave_categories_cache";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// ─── HELPER: Build categories from products ───
const buildCategories = (products) => {
  const productList = Array.isArray(products)
    ? products
    : products.products || products.data || [];

  const categoryMap = new Map();
  productList.forEach((product) => {
    if (product.category) {
      if (!categoryMap.has(product.category)) {
        categoryMap.set(product.category, []);
      }
      categoryMap.get(product.category).push(product);
    }
  });

  const categories = Array.from(categoryMap.entries()).map(
    ([name, items]) => ({
      id: name.toLowerCase().replace(/\s+/g, "-"),
      label: name,
      icon: CATEGORY_ICONS[name] || faBox,
      products: items,
    })
  );

  categories.sort((a, b) => a.label.localeCompare(b.label));
  return categories;
};

export default function Sidebar({
  isOpen,
  onClose,
  showBrandHeader = true,
  user = null,
  onLogoutClick,
  onLoginClick,
}) {
  const router = useRouter();
  const [expandedCategories, setExpandedCategories] = useState({});
  const [allDynamicCategories, setAllDynamicCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // ─── CACHE HELPER ───
  const getCachedCategories = useCallback(() => {
    try {
      const cached = localStorage.getItem(CATEGORIES_CACHE_KEY);
      if (!cached) return null;
      const { data, timestamp } = JSON.parse(cached);
      if (!Array.isArray(data) || data.length === 0) return null;
      return { data, timestamp };
    } catch (e) {
      console.warn("Cache read failed:", e);
      return null;
    }
  }, []);

  const setCachedCategories = useCallback((categories) => {
    try {
      localStorage.setItem(
        CATEGORIES_CACHE_KEY,
        JSON.stringify({ data: categories, timestamp: Date.now() })
      );
    } catch (e) {
      console.warn("Cache write failed:", e);
    }
  }, []);

  // ─── FETCH & CACHE CATEGORIES ───
  const fetchCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);
      const res = await fetch(`${API_URL}/products`);
      if (!res.ok) throw new Error("Failed to fetch products");

      const data = await res.json();
      const categories = buildCategories(data);

      setAllDynamicCategories(categories);
      setCachedCategories(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      // Fallback: agar cached data hai toh use karo
      const cached = getCachedCategories();
      if (cached) {
        setAllDynamicCategories(cached.data);
      } else {
        setAllDynamicCategories([]);
      }
    } finally {
      setLoadingCategories(false);
    }
  }, [getCachedCategories, setCachedCategories]);

  // ─── LOAD ON OPEN (CACHE FIRST) ───
  useEffect(() => {
    if (!isOpen) return;

    // 1. INSTANT: Cache se load karo
    const cached = getCachedCategories();
    if (cached) {
      setAllDynamicCategories(cached.data);

      // 2. BACKGROUND: Agar stale hai toh refresh karo
      const isStale = Date.now() - cached.timestamp >= CACHE_DURATION;
      if (isStale) {
        fetchCategories();
      }
      return;
    }

    // 3. Agar cache nahi hai toh fresh fetch
    fetchCategories();
  }, [isOpen, getCachedCategories, fetchCategories]);

  // ─── BODY SCROLL LOCK ───
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow || "";
      };
    }
  }, [isOpen]);

  // ─── CLOSE ON OUTSIDE CLICK ───
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen) {
        const sidebar = document.getElementById("sidebar-menu");
        const menuButton = document.getElementById("menu-button");

        if (
          sidebar &&
          !sidebar.contains(e.target) &&
          menuButton &&
          !menuButton.contains(e.target)
        ) {
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

  // ─── TOGGLE EXPAND (chevron only) ───
  const toggleCategoryExpand = (categoryId, e) => {
    e.stopPropagation();
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  // ─── ⭐ CATEGORY CLICK → NAVIGATE TO SHOP WITH FILTER ───
  const handleCategoryClick = (categoryLabel, e) => {
    e.stopPropagation();
    onClose();
    setExpandedCategories({});
    router.push(`/products?category=${encodeURIComponent(categoryLabel)}`);
  };

  // ─── PRODUCT CLICK → PRODUCT PAGE ───
  const handleProductClick = (productId, e) => {
    e.stopPropagation();
    onClose();
    setExpandedCategories({});
    router.push(`/product/${productId}`);
  };

  const handleClose = () => {
    onClose();
    setExpandedCategories({});
  };

  const handleShopAll = () => {
    onClose();
    setExpandedCategories({});
    router.push("/products");
  };

  const handleLogout = () => {
    handleClose();
    if (onLogoutClick) onLogoutClick();
  };

  const handleLogin = () => {
    handleClose();
    if (onLoginClick) onLoginClick();
  };

  return (
    <>
      {/* ─── SIDEBAR OVERLAY ─── */}
      {isOpen && (
        <div
          onClick={handleClose}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
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
        <div
          style={{
            padding: "20px 24px",
            borderBottom: `2px solid ${C.goldPale}`,
            display: "flex",
            alignItems: "center",
            justifyContent: showBrandHeader ? "space-between" : "flex-end",
            backgroundColor: C.maroon,
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          {showBrandHeader && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: `2px solid ${C.gold}`,
                  backgroundColor: C.white,
                }}
              >
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
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: C.goldLight,
                    letterSpacing: "0.1em",
                  }}
                >
                  gleamwave
                </div>
                <div
                  style={{
                    fontSize: 8,
                    color: C.goldLight,
                    opacity: 0.7,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                  }}
                >
                  Handcrafted Resin Art
                </div>
              </div>
            </div>
          )}
          <button
            onClick={handleClose}
            aria-label="Close sidebar"
            style={{
              backgroundColor: "transparent",
              border: "none",
              color: C.goldLight,
              fontSize: 20,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 4,
              borderRadius: "50%",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* ─── CONTENT ─── */}
        <div style={{ padding: "12px 0", flex: 1 }}>
          {/* ⭐ SHOP ALL LINK */}
          <div
            onClick={handleShopAll}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 24px",
              cursor: "pointer",
              borderBottom: `1px solid ${C.goldPale}`,
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = C.goldPale)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <FontAwesomeIcon
              icon={faShoppingBag}
              style={{ color: C.gold, width: 16 }}
            />
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: C.maroonDark,
                letterSpacing: "0.03em",
              }}
            >
              Shop All Products
            </span>
            <FontAwesomeIcon
              icon={faArrowRight}
              style={{ marginLeft: "auto", color: C.gold, fontSize: 12 }}
            />
          </div>

          {/* Section Label */}
          <div
            style={{
              padding: "16px 24px 8px",
              fontSize: 11,
              fontWeight: 700,
              color: C.textLight,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
            }}
          >
            Categories
          </div>

          {/* Categories */}
          {loadingCategories && allDynamicCategories.length === 0 ? (
            <div
              style={{
                padding: "20px 24px",
                color: C.textLight,
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  border: `2px solid ${C.goldPale}`,
                  borderTop: `2px solid ${C.maroon}`,
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              Loading categories...
            </div>
          ) : allDynamicCategories.length === 0 ? (
            <div
              style={{
                padding: "20px 24px",
                color: C.textLight,
                fontSize: 14,
              }}
            >
              No categories available
            </div>
          ) : (
            allDynamicCategories.map((category) => {
              const isExpanded = expandedCategories[category.id] || false;
              return (
                <div
                  key={category.id}
                  style={{ borderBottom: `1px solid ${C.goldPale}` }}
                >
                  {/* Category Row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 24px",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = C.goldPale)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    {/* Category Name — Click to Navigate */}
                    <div
                      onClick={(e) => handleCategoryClick(category.label, e)}
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        cursor: "pointer",
                        paddingRight: 8,
                      }}
                    >
                      <FontAwesomeIcon
                        icon={category.icon}
                        style={{ color: C.gold, width: 16 }}
                      />
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: C.maroonDark,
                        }}
                      >
                        {category.label}
                      </span>
                      <span style={{ fontSize: 11, color: C.textLight }}>
                        ({category.products.length})
                      </span>
                    </div>

                    {/* Expand Toggle — Only for expand/collapse */}
                    <button
                      onClick={(e) => toggleCategoryExpand(category.id, e)}
                      aria-label={isExpanded ? "Collapse" : "Expand"}
                      style={{
                        backgroundColor: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: 6,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "50%",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "rgba(184,149,106,0.3)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      <FontAwesomeIcon
                        icon={isExpanded ? faChevronUp : faChevronDown}
                        style={{
                          color: C.gold,
                          fontSize: 11,
                          transition: "transform 0.3s ease",
                        }}
                      />
                    </button>
                  </div>

                  {/* Products List (if expanded) */}
                  {isExpanded && (
                    <div
                      style={{
                        padding: "4px 24px 12px 52px",
                        backgroundColor: "rgba(245,237,224,0.5)",
                        animation: "slideDown 0.3s ease",
                      }}
                    >
                      {category.products.map((product) => (
                        <div
                          key={product.id}
                          onClick={(e) => handleProductClick(product.id, e)}
                          style={{
                            padding: "8px 12px",
                            fontSize: 13,
                            color: C.textMid,
                            cursor: "pointer",
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            transition: "all 0.15s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = C.white;
                            e.currentTarget.style.color = C.maroon;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                            e.currentTarget.style.color = C.textMid;
                          }}
                        >
                          <FontAwesomeIcon
                            icon={faArrowRight}
                            style={{ fontSize: 9, color: C.gold }}
                          />
                          <span
                            style={{
                              flex: 1,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {product.name}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              color: C.textLight,
                              flexShrink: 0,
                            }}
                          >
                            Rs. {product.price?.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* ─── USER SECTION (Bottom) ─── */}
          <div
            style={{
              marginTop: 16,
              borderTop: `2px solid ${C.goldPale}`,
              paddingTop: 8,
            }}
          >
            {user ? (
              <>
                <div
                  onClick={() => {
                    handleClose();
                    router.push("/profile");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 24px",
                    color: C.maroon,
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 15,
                    borderBottom: `1px solid ${C.goldPale}`,
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = C.goldPale)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      backgroundColor: C.maroon,
                      color: C.goldLight,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {user.name}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    width: "100%",
                    textAlign: "left",
                    padding: "14px 24px",
                    color: C.maroon,
                    backgroundColor: "transparent",
                    border: "none",
                    fontSize: 15,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = C.goldPale)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <FontAwesomeIcon
                    icon={faTimes}
                    style={{ width: 18, color: C.gold }}
                  />
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={handleLogin}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  width: "100%",
                  textAlign: "left",
                  padding: "14px 24px",
                  color: C.maroon,
                  backgroundColor: "transparent",
                  border: "none",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = C.goldPale)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                Login / Signup
                <FontAwesomeIcon
                  icon={faArrowRight}
                  style={{ marginLeft: "auto", color: C.gold, fontSize: 12 }}
                />
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideDown {
          from { opacity: 0; max-height: 0; }
          to { opacity: 1; max-height: 800px; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}