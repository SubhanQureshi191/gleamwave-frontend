"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faGem, 
  faSearch,
  faTimes,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";

// ── Components ──
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

// ── BRAND TOKENS ──
const C = {
  white: "#FFFFFF",
  whiteOff: "#FDF8F3",
  snow: "#FDF6F0",
  blush: "#F3E9DE",
  blushDeep: "#E8D5BF",
  maroon: "#6F4E37",
  maroonDark: "#4A2E22",
  maroonLight: "#8B6F47",
  maroonPale: "#F0E6DA",
  gold: "#B8956A",
  goldLight: "#E8D9C0",
  goldPale: "#F5EDE0",
  goldDark: "#8B6F47",
  text: "#3D2B1F",
  textMid: "#6B4F3A",
  textLight: "#A08070",
};

const API_URL = "http://localhost:5000/api";

// ─── PRICE COMPONENT ──────────────────────────────────────────
const PriceDisplay = ({ product }) => {
  const hasDiscount = product?.original_price && product.original_price > product.price;
  const discountPercent = product?.discount_percent || product?.discount_percentage || 0;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      {hasDiscount ? (
        <>
          <span style={{ fontSize: 14, color: C.textLight, textDecoration: "line-through" }}>
            Rs. {product.original_price.toLocaleString()}
          </span>
          <span style={{ fontSize: 20, fontWeight: 700, color: "#dc2626" }}>
            Rs. {product.price.toLocaleString()}
          </span>
          <span style={{
            backgroundColor: "#dc2626", color: "white", padding: "2px 10px",
            borderRadius: 12, fontSize: 11, fontWeight: 600,
          }}>
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

export default function Products() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedCategories, setExpandedCategories] = useState({});
  const [sortBy, setSortBy] = useState("default");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [user, setUser] = useState(null);

  // ─── SEARCH STATE ───
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  // ─── DYNAMIC CATEGORIES ───
  const [dynamicCategories, setDynamicCategories] = useState([]);

  // ─── FETCH PRODUCTS ───
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      setUser(JSON.parse(userData));
    }

    fetchProducts();
    updateCartCount();
  }, []);

  const updateCartCount = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (token) {
        const res = await fetch(`${API_URL}/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setCart(data.items || []);
        }
      } else {
        const guestCart = JSON.parse(localStorage.getItem("guest_cart") || "[]");
        setCart(guestCart);
      }
    } catch (error) {
      console.error("Error fetching cart count:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/products`);
      const data = await res.json();
      setProducts(data);

      const categoryMap = new Map();
      
      data.forEach(product => {
        if (product.category) {
          if (!categoryMap.has(product.category)) {
            categoryMap.set(product.category, []);
          }
          categoryMap.get(product.category).push(product.name);
        }
      });

      const categories = [
        { name: "All", subCategories: [] },
        ...Array.from(categoryMap.entries()).map(([name, products]) => ({
          name: name,
          subCategories: products
        }))
      ];

      setDynamicCategories(categories);

    } catch (error) {
      console.error("Error fetching products:", error);
      setToast("Failed to load products");
      setTimeout(() => setToast(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // ─── ADD TO CART ───
  const addCart = async (productId, productName, e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        const guestCart = JSON.parse(localStorage.getItem("guest_cart") || "[]");
        
        const existingIndex = guestCart.findIndex(item => item.product_id === productId);
        
        if (existingIndex >= 0) {
          guestCart[existingIndex].quantity += 1;
        } else {
          guestCart.push({ product_id: productId, quantity: 1 });
        }
        
        localStorage.setItem("guest_cart", JSON.stringify(guestCart));
        window.dispatchEvent(new Event("cartUpdated"));
        setCart(guestCart);
        
        setToast(`"${productName}" added to cart`);
        setTimeout(() => setToast(null), 2500);
        return;
      }

      const res = await fetch(`${API_URL}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: productId, quantity: 1 }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add to cart");

      setCart((prev) => [...prev, productName]);
      window.dispatchEvent(new Event("cartUpdated"));
      setToast(`"${productName}" added to cart`);
      setTimeout(() => setToast(null), 2500);
    } catch (error) {
      setToast(error.message);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const toggleCategory = (categoryName) => {
    if (categoryName === "All") {
      setSelectedCategory("All");
      return;
    }
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  const selectSubCategory = (categoryName, subCategory) => {
    setSelectedCategory(categoryName);
    const product = products.find(p => p.name === subCategory && p.category === categoryName);
    if (product) {
      router.push(`/product/${product.id}`);
    }
  };

  const handleLogoutClick = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setCart([]);
    setToast("Logged out successfully");
    setTimeout(() => setToast(null), 3000);
    router.push("/");
  };

  // ─── FILTER & SORT & SEARCH ──
  let filteredProducts = selectedCategory === "All" 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  // ✅ SEARCH FILTER
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(q) ||
      (p.category && p.category.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
  }

  if (sortBy === "price-low") {
    filteredProducts = [...filteredProducts].sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-high") {
    filteredProducts = [...filteredProducts].sort((a, b) => b.price - a.price);
  } else if (sortBy === "name") {
    filteredProducts = [...filteredProducts].sort((a, b) => a.name.localeCompare(b.name));
  }

  if (loading) {
    return (
      <div style={{
        display: "flex", justifyContent: "center", alignItems: "center",
        height: "100vh", backgroundColor: C.white,
      }}>
        <div style={{ fontSize: 24, color: C.maroon }}>Loading products...</div>
      </div>
    );
  }

  const handleProductClick = (productId) => {
    router.push(`/product/${productId}`);
  };

  return (
    <div style={{
      backgroundColor: C.white, color: C.text,
      fontFamily: "'Georgia', 'Times New Roman', serif",
      minHeight: "100vh",
    }}>
      {/* ── TOAST ── */}
      {toast && (
        <div style={{
          position: "fixed", top: 24, right: 24, zIndex: 9999,
          backgroundColor: C.maroon, color: C.goldLight,
          padding: "12px 20px", borderRadius: 14, fontSize: 14,
          boxShadow: "0 8px 32px rgba(74,46,34,0.3)",
          animation: "fadeIn 0.3s ease",
        }}>
          {toast}
        </div>
      )}

      {/* ─── SIDEBAR COMPONENT ─── */}
      <Sidebar
        isOpen={mobileMenu}
        onClose={() => setMobileMenu(false)}
        user={user}
        onLogoutClick={handleLogoutClick}
        onLoginClick={() => router.push("/")}
      />

      {/* ─── NAVBAR COMPONENT ─── */}
      <Navbar
        activePage="shop"
        user={user}
        onMenuClick={() => setMobileMenu(true)}
        onLoginClick={() => router.push("/")}
        onSignupClick={() => router.push("/")}
        onLogoutClick={handleLogoutClick}
      />

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ─── PRODUCTS HEADER (BROWN BACKGROUND LIKE FOOTER) ─── */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section style={{
        paddingTop: "140px",
        paddingBottom: "70px",
        paddingLeft: "24px",
        paddingRight: "24px",
        textAlign: "center",
        background: `linear-gradient(135deg, ${C.maroonDark}, ${C.maroon}, ${C.goldDark})`,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative circles */}
        <div style={{
          position: "absolute",
          top: "-50px",
          right: "-50px",
          width: 250,
          height: 250,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.goldLight}22, transparent 70%)`,
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute",
          bottom: "-80px",
          left: "-80px",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.goldLight}15, transparent 70%)`,
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{
            fontSize: 11,
            letterSpacing: "0.35em",
            color: C.gold,
            textTransform: "uppercase",
            marginBottom: 14,
            opacity: 0.9,
          }}>
            Explore Our Collection
          </div>
          <h1 style={{
            fontSize: "clamp(2.5rem, 4vw, 3.5rem)",
            fontWeight: 700,
            color: C.goldLight,
            marginBottom: 12,
            fontFamily: "'Georgia', serif",
          }}>
            Our Collection
          </h1>
          <p style={{
            color: C.goldLight,
            fontSize: 17,
            maxWidth: 500,
            margin: "0 auto",
            opacity: 0.9,
            lineHeight: 1.7,
          }}>
            Each piece is handcrafted with love — explore our full range of resin art.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ─── PREMIUM SEARCH BAR ─── */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section style={{ padding: "30px 24px 0", backgroundColor: C.white }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{
            position: "relative",
            maxWidth: 600,
            margin: "0 auto",
          }}>
            {/* Search Icon */}
            <div style={{
              position: "absolute",
              left: 20,
              top: "50%",
              transform: "translateY(-50%)",
              color: searchFocused ? C.maroon : C.gold,
              fontSize: 16,
              transition: "color 0.3s ease",
              pointerEvents: "none",
            }}>
              <FontAwesomeIcon icon={faSearch} />
            </div>

            {/* Search Input */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search products..."
              style={{
                width: "100%",
                padding: "16px 52px 16px 52px",
                borderRadius: 50,
                border: `2px solid ${searchFocused ? C.maroon : C.goldPale}`,
                backgroundColor: C.white,
                color: C.text,
                fontSize: 15,
                fontFamily: "inherit",
                outline: "none",
                transition: "all 0.3s ease",
                boxShadow: searchFocused 
                  ? `0 8px 32px ${C.maroon}22, 0 2px 8px ${C.gold}22`
                  : `0 2px 12px rgba(74,46,34,0.06)`,
                boxSizing: "border-box",
              }}
            />

            {/* Clear Button */}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  position: "absolute",
                  right: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  backgroundColor: C.goldPale,
                  border: "none",
                  borderRadius: "50%",
                  width: 28,
                  height: 28,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: C.maroon,
                  cursor: "pointer",
                  fontSize: 12,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = C.maroon;
                  e.currentTarget.style.color = C.goldLight;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = C.goldPale;
                  e.currentTarget.style.color = C.maroon;
                }}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
          </div>

          {/* Search Result Count */}
          {searchQuery.trim() && (
            <div style={{
              textAlign: "center",
              marginTop: 14,
              fontSize: 13,
              color: C.textLight,
              animation: "fadeIn 0.3s ease",
            }}>
              Found <strong style={{ color: C.maroon }}>{filteredProducts.length}</strong> product{filteredProducts.length !== 1 ? "s" : ""} for "{searchQuery}"
            </div>
          )}
        </div>
      </section>

      {/* ─── FILTERS & CATEGORIES ── */}
      <section style={{ padding: "24px 24px 0", backgroundColor: C.white }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
          
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "flex-start" }}>
            {dynamicCategories.map((cat) => (
              <div key={cat.name} style={{ position: "relative" }}>
                <button
                  onClick={() => toggleCategory(cat.name)}
                  style={{
                    padding: "8px 18px", borderRadius: 30,
                    border: `2px solid ${selectedCategory === cat.name ? C.maroon : C.goldPale}`,
                    backgroundColor: selectedCategory === cat.name ? C.maroon : "transparent",
                    color: selectedCategory === cat.name ? C.goldLight : C.textMid,
                    fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                    transition: "all 0.2s", display: "flex",
                    alignItems: "center", gap: 6,
                  }}
                >
                  {cat.name}
                  {cat.subCategories.length > 0 && (
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      style={{
                        fontSize: 10,
                        transition: "transform 0.3s ease",
                        transform: expandedCategories[cat.name] ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    />
                  )}
                </button>

                {expandedCategories[cat.name] && cat.subCategories.length > 0 && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 8px)", left: 0,
                    minWidth: "220px", backgroundColor: C.white,
                    border: `2px solid ${C.goldPale}`, borderRadius: 12,
                    padding: "8px 0", boxShadow: "0 8px 32px rgba(74,46,34,0.15)",
                    zIndex: 10, animation: "fadeIn 0.2s ease",
                  }}>
                    {cat.subCategories.map((sub) => (
                      <button
                        key={sub}
                        onClick={() => selectSubCategory(cat.name, sub)}
                        style={{
                          display: "block", width: "100%", padding: "8px 18px",
                          backgroundColor: "transparent", border: "none",
                          color: C.textMid, fontSize: 13, textAlign: "left",
                          cursor: "pointer", fontFamily: "inherit",
                          transition: "all 0.2s", borderLeft: `3px solid transparent`,
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = C.goldPale;
                          e.target.style.borderLeftColor = C.maroon;
                          e.target.style.color = C.maroon;
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "transparent";
                          e.target.style.borderLeftColor = "transparent";
                          e.target.style.color = C.textMid;
                        }}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{
            display: "flex", justifyContent: "flex-end", alignItems: "center",
            gap: 8, paddingBottom: 8, borderBottom: `1px solid ${C.goldPale}`,
          }}>
            <span style={{ fontSize: 13, color: C.textLight }}>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: "6px 14px", borderRadius: 30,
                border: `2px solid ${C.goldPale}`,
                backgroundColor: C.white, color: C.textMid,
                fontSize: 13, fontFamily: "inherit",
                outline: "none", cursor: "pointer"
              }}
            >
              <option value="default">Default</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </div>
      </section>

      {/* ─── PRODUCTS GRID ── */}
      <section style={{ padding: "30px 24px 80px", backgroundColor: C.white }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ marginBottom: 20, color: C.textLight, fontSize: 14 }}>
            Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            {selectedCategory !== "All" && ` in "${selectedCategory}"`}
            {searchQuery.trim() && ` matching "${searchQuery}"`}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
            {filteredProducts.map((p) => {
              const hasDiscount = p.original_price && p.original_price > p.price;
              const discountPercent = p.discount_percent || p.discount_percentage || 0;
              const isOutOfStock = p.stock <= 0;
              
              return (
                <div 
                  key={p.id}
                  onClick={() => !isOutOfStock && handleProductClick(p.id)}
                  style={{
                    backgroundColor: C.white, borderRadius: 22,
                    overflow: "hidden", border: `2px solid ${C.goldPale}`,
                    transition: "all 0.3s",
                    cursor: isOutOfStock ? "not-allowed" : "pointer",
                    boxShadow: "0 2px 16px rgba(74,46,34,0.05)",
                    opacity: isOutOfStock ? 0.7 : 1,
                  }}
                  onMouseEnter={e => { 
                    if (!isOutOfStock) {
                      e.currentTarget.style.transform = "translateY(-6px)"; 
                      e.currentTarget.style.boxShadow = `0 16px 48px ${C.maroon}33`; 
                    }
                  }}
                  onMouseLeave={e => { 
                    e.currentTarget.style.transform = "translateY(0)"; 
                    e.currentTarget.style.boxShadow = "0 2px 16px rgba(74,46,34,0.05)"; 
                  }}
                >
                  <div style={{
                    height: 200,
                    background: `linear-gradient(135deg, ${C.maroonPale}, ${C.goldPale})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    position: "relative", fontSize: 60
                  }}>
                    {p.images && p.images.length > 0 && p.images[0].image_url ? (
                      <img
                        src={p.images[0].image_url}
                        alt={p.name}
                        style={{
                          width: "100%", height: "100%",
                          objectFit: "cover",
                          opacity: isOutOfStock ? 0.4 : 1,
                        }}
                      />
                    ) : (
                      <FontAwesomeIcon icon={faGem} style={{ fontSize: 48, color: C.maroon }} />
                    )}
                    
                    {isOutOfStock && (
                      <div style={{
                        position: "absolute", inset: 0,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        backdropFilter: "blur(4px)",
                      }}>
                        <span style={{
                          backgroundColor: "#EF4444", color: "white",
                          padding: "6px 16px", borderRadius: 30,
                          fontSize: 14, fontWeight: 700,
                          letterSpacing: "0.1em",
                          transform: "rotate(-15deg)",
                          boxShadow: "0 4px 20px rgba(239,68,68,0.5)",
                        }}>
                          OUT OF STOCK
                        </span>
                      </div>
                    )}
                    
                    {!isOutOfStock && (
                      <span style={{
                        position: "absolute", top: 12, left: 12,
                        backgroundColor: C.maroon, color: C.goldLight,
                        fontSize: 10, padding: "4px 12px",
                        borderRadius: 20, fontFamily: "sans-serif",
                        letterSpacing: "0.05em"
                      }}>{p.tag || "New"}</span>
                    )}
                    
                    {hasDiscount && !isOutOfStock && (
                      <span style={{
                        position: "absolute", top: 12, right: 12,
                        backgroundColor: "#dc2626", color: "white",
                        fontSize: 10, fontWeight: 700,
                        padding: "4px 12px", borderRadius: 20,
                        fontFamily: "sans-serif",
                        letterSpacing: "0.05em",
                        boxShadow: "0 2px 8px rgba(220,38,38,0.4)",
                      }}>
                        -{discountPercent}% OFF
                      </span>
                    )}
                    
                    <span style={{
                      position: "absolute", bottom: 12, right: 12,
                      backgroundColor: "rgba(255,255,255,0.9)",
                      color: C.maroon, fontSize: 11,
                      padding: "4px 12px", borderRadius: 20,
                      fontFamily: "sans-serif"
                    }}>{p.category}</span>
                  </div>
                  <div style={{ padding: "18px 20px" }}>
                    <div style={{ 
                      fontSize: 12, color: C.textLight, textTransform: "uppercase",
                      letterSpacing: "0.1em", marginBottom: 4,
                    }}>
                      {p.category}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: C.maroonDark, marginBottom: 8 }}>{p.name}</div>
                    {p.description && (
                      <div style={{ fontSize: 13, color: C.textLight, marginBottom: 8, lineHeight: 1.4 }}>
                        {p.description.substring(0, 60)}{p.description.length > 60 ? '...' : ''}
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <PriceDisplay product={p} />
                      <button 
                        onClick={(e) => addCart(p.id, p.name, e)}
                        disabled={isOutOfStock}
                        style={{
                          padding: "10px 20px", borderRadius: 30, border: "none",
                          backgroundColor: isOutOfStock ? "#ccc" : C.maroon,
                          color: isOutOfStock ? "#999" : C.goldLight,
                          fontSize: 12,
                          cursor: isOutOfStock ? "not-allowed" : "pointer",
                          fontFamily: "inherit",
                          letterSpacing: "0.05em",
                          transition: "opacity 0.2s ease, transform 0.2s ease",
                          fontWeight: 600,
                          opacity: 1,
                        }}
                        onMouseEnter={e => { 
                          if (!isOutOfStock) {
                            e.currentTarget.style.opacity = "0.85";
                            e.currentTarget.style.transform = "scale(1.05)";
                          }
                        }}
                        onMouseLeave={e => { 
                          if (!isOutOfStock) {
                            e.currentTarget.style.opacity = "1";
                            e.currentTarget.style.transform = "scale(1)";
                          }
                        }}
                        onMouseDown={e => {
                          if (!isOutOfStock) e.currentTarget.style.opacity = "0.6";
                        }}
                        onMouseUp={e => {
                          if (!isOutOfStock) e.currentTarget.style.opacity = "0.85";
                        }}
                      >
                        {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {filteredProducts.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 0", color: C.textLight }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <h3 style={{ fontSize: 20, color: C.textMid }}>
                {searchQuery.trim() ? `No products found for "${searchQuery}"` : "No products found"}
              </h3>
              <p>{searchQuery.trim() ? "Try a different search term" : "Try selecting a different category"}</p>
              {searchQuery.trim() && (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{
                    marginTop: 16,
                    padding: "10px 24px",
                    borderRadius: 30,
                    border: `2px solid ${C.maroon}`,
                    backgroundColor: "transparent",
                    color: C.maroon,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = C.maroon;
                    e.currentTarget.style.color = C.goldLight;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = C.maroon;
                  }}
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}