"use client";

export const PriceDisplay = ({ product, size = "medium", showBadge = true }) => {
  // Check if product has discount
  const hasDiscount = product?.original_price && product.original_price > product.price;
  
  // Size configurations
  const sizeStyles = {
    small: { 
      price: 16, 
      original: 13, 
      badge: 10,
      gap: 6,
    },
    medium: { 
      price: 20, 
      original: 14, 
      badge: 11,
      gap: 8,
    },
    large: { 
      price: 24, 
      original: 16, 
      badge: 12,
      gap: 10,
    },
  };
  
  const styles = sizeStyles[size] || sizeStyles.medium;

  return (
    <div style={{ 
      display: "flex", 
      alignItems: "center", 
      gap: styles.gap, 
      flexWrap: "wrap" 
    }}>
      {hasDiscount ? (
        <>
          {/* Original Price with Strikethrough */}
          <span style={{
            fontSize: styles.original,
            color: "#999",
            textDecoration: "line-through",
          }}>
            Rs. {product.original_price.toLocaleString()}
          </span>
          
          {/* Discounted Price */}
          <span style={{
            fontSize: styles.price,
            fontWeight: 700,
            color: "#dc2626",
          }}>
            Rs. {product.price.toLocaleString()}
          </span>
          
          {/* Discount Badge */}
          {showBadge && (
            <span style={{
              backgroundColor: "#dc2626",
              color: "white",
              padding: "2px 10px",
              borderRadius: 12,
              fontSize: styles.badge,
              fontWeight: 600,
            }}>
              -{product.discount_percentage}%
            </span>
          )}
        </>
      ) : (
        // No Discount - Show Normal Price
        <span style={{
          fontSize: styles.price,
          fontWeight: 700,
          color: "#6F4E37",
        }}>
          Rs. {product.price.toLocaleString()}
        </span>
      )}
    </div>
  );
};