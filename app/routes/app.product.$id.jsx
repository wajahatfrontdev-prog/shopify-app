import { useLoaderData, useNavigate, Link } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request, params }) => {
  const { admin } = await authenticate.admin(request);
  const productId = params.id;

  const response = await admin.graphql(
    `#graphql
      query getProduct($id: ID!) {
        product(id: $id) {
          id
          title
          description
          productType
          vendor
          featuredImage {
            url
            altText
          }
          images(first: 8) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 5) {
            edges {
              node {
                id
                title
                price
                availableForSale
                inventoryQuantity
              }
            }
          }
        }
      }`,
    {
      variables: { id: `gid://shopify/Product/${productId}` },
    }
  );

  const responseJson = await response.json();
  return { product: responseJson.data.product };
};

export default function ProductDetails() {
  const { product } = useLoaderData();
  const navigate = useNavigate();
  const shopify = useAppBridge();

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    cart.push({
      id: product.id,
      title: product.title,
      price: product.variants.edges[0].node.price,
      image: product.featuredImage?.url,
      quantity: 1
    });
    localStorage.setItem("cart", JSON.stringify(cart));
    shopify.toast.show("🛒 Added to cart successfully!");
  };

  const shareOnWhatsApp = () => {
    const productUrl = window.location.href;
    const price = product.variants.edges[0].node.price;
    const description = product.description || "Check out this amazing product!";
    
    const message = `🛍️ *${product.title}*\n\n💰 Price: $${price}\n\n📝 ${description}\n\n🔗 View Product: ${productUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const images = product.images.edges.map(edge => edge.node);
  const variants = product.variants.edges.map(edge => edge.node);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f8f9fa",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      {/* Mobile Header */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "white",
        padding: "16px 20px",
        borderBottom: "1px solid rgba(0,0,0,0.1)",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: "none",
              border: "none",
              fontSize: "20px",
              cursor: "pointer",
              padding: "8px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            ←
          </button>
          <h1 style={{
            margin: 0,
            fontSize: "18px",
            fontWeight: "700",
            color: "#2c3e50",
            textAlign: "center",
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            paddingRight: "40px"
          }}>{product.title}</h1>
        </div>
      </div>

      <div style={{ paddingBottom: "100px" }}>
        {/* Product Images */}
        <div style={{ background: "white", marginBottom: "8px" }}>
          {product.featuredImage && (
            <img
              src={product.featuredImage.url}
              alt={product.title}
              style={{
                width: "100%",
                height: "400px",
                objectFit: "cover"
              }}
            />
          )}
          
          {/* Thumbnail Images */}
          {images.length > 1 && (
            <div style={{
              padding: "16px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))",
              gap: "12px",
              maxWidth: "400px",
              margin: "0 auto"
            }}>
              {images.slice(1, 5).map((img, idx) => (
                <img
                  key={idx}
                  src={img.url}
                  alt={img.altText || product.title}
                  style={{
                    width: "100%",
                    height: "80px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    cursor: "pointer",
                    border: "2px solid transparent",
                    transition: "all 0.3s ease"
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div style={{
          background: "white",
          padding: "20px",
          marginBottom: "8px"
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "16px"
          }}>
            <div style={{ flex: 1 }}>
              <h2 style={{
                margin: "0 0 8px 0",
                fontSize: "24px",
                fontWeight: "700",
                color: "#2c3e50",
                lineHeight: "1.3"
              }}>{product.title}</h2>
              <p style={{
                margin: "0 0 16px 0",
                fontSize: "14px",
                color: "#7f8c8d"
              }}>{product.productType} • by {product.vendor}</p>
            </div>
            <button
              onClick={shareOnWhatsApp}
              style={{
                background: "#25D366",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "48px",
                height: "48px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "20px",
                boxShadow: "0 4px 12px rgba(37, 211, 102, 0.3)",
                transition: "all 0.3s ease",
                flexShrink: 0
              }}
            >
              📱
            </button>
          </div>

          <div style={{
            fontSize: "32px",
            fontWeight: "800",
            color: "#e74c3c",
            marginBottom: "20px"
          }}>
            ${variants[0]?.price || "0.00"}
          </div>

          {/* Stock Status */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "20px",
            padding: "12px 16px",
            borderRadius: "12px",
            background: variants[0]?.availableForSale ? "#d4edda" : "#f8d7da",
            border: `1px solid ${variants[0]?.availableForSale ? "#c3e6cb" : "#f5c6cb"}`
          }}>
            <span style={{ fontSize: "16px" }}>
              {variants[0]?.availableForSale ? "✅" : "❌"}
            </span>
            <span style={{
              fontSize: "14px",
              fontWeight: "600",
              color: variants[0]?.availableForSale ? "#155724" : "#721c24"
            }}>
              {variants[0]?.availableForSale ? "In Stock - Ready to Ship" : "Currently Out of Stock"}
            </span>
          </div>
        </div>

        {/* Description */}
        <div style={{
          background: "white",
          padding: "20px",
          marginBottom: "8px"
        }}>
          <h3 style={{
            margin: "0 0 16px 0",
            fontSize: "18px",
            fontWeight: "700",
            color: "#2c3e50"
          }}>📝 Description</h3>
          <p style={{
            margin: 0,
            fontSize: "16px",
            lineHeight: "1.6",
            color: "#555"
          }}>
            {product.description || "Stay warm and comfortable in this versatile hoodie, perfect for layering or wearing solo. Crafted from soft, breathable fabric, it features a spacious kangaroo pocket and adjustable drawstring hood for a customized fit. The relaxed silhouette works for casual outings, workouts, or lounging at home. A wardrobe essential that transitions seamlessly from season to season."}
          </p>
        </div>

        {/* Features */}
        <div style={{
          background: "white",
          padding: "20px",
          marginBottom: "8px"
        }}>
          <h3 style={{
            margin: "0 0 16px 0",
            fontSize: "18px",
            fontWeight: "700",
            color: "#2c3e50"
          }}>✨ Key Features</h3>
          <div style={{ display: "grid", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "16px" }}>🏆</span>
              <span style={{ fontSize: "15px", color: "#555" }}>Premium quality materials</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "16px" }}>👌</span>
              <span style={{ fontSize: "15px", color: "#555" }}>Comfortable and perfect fit</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "16px" }}>💪</span>
              <span style={{ fontSize: "15px", color: "#555" }}>Durable and long-lasting</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "16px" }}>🧼</span>
              <span style={{ fontSize: "15px", color: "#555" }}>Easy care and maintenance</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "16px" }}>🎨</span>
              <span style={{ fontSize: "15px", color: "#555" }}>Modern and stylish design</span>
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div style={{
          background: "white",
          padding: "20px"
        }}>
          <h3 style={{
            margin: "0 0 16px 0",
            fontSize: "18px",
            fontWeight: "700",
            color: "#2c3e50"
          }}>🎁 Why Choose Us?</h3>
          <div style={{ display: "grid", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "16px" }}>🚚</span>
              <span style={{ fontSize: "14px", color: "#555" }}><strong>Free Shipping:</strong> On all orders over $50</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "16px" }}>🔄</span>
              <span style={{ fontSize: "14px", color: "#555" }}><strong>Easy Returns:</strong> 30-day hassle-free returns</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "16px" }}>🛡️</span>
              <span style={{ fontSize: "14px", color: "#555" }}><strong>Secure Payment:</strong> 100% secure checkout</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "16px" }}>📞</span>
              <span style={{ fontSize: "14px", color: "#555" }}><strong>24/7 Support:</strong> Always here to help</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Actions */}
      <div style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "white",
        padding: "16px 20px",
        borderTop: "1px solid rgba(0,0,0,0.1)",
        boxShadow: "0 -4px 12px rgba(0,0,0,0.1)",
        zIndex: 100
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          gap: "12px",
          alignItems: "center"
        }}>
          {/* WhatsApp Button */}
          <button
            onClick={shareOnWhatsApp}
            style={{
              background: "#25D366",
              color: "white",
              border: "none",
              borderRadius: "12px",
              padding: "14px 16px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 12px rgba(37, 211, 102, 0.3)",
              transition: "all 0.3s ease",
              whiteSpace: "nowrap"
            }}
          >
            📱 Share
          </button>

          {/* Add to Cart Button */}
          <button
            onClick={addToCart}
            disabled={!variants[0]?.availableForSale}
            style={{
              background: variants[0]?.availableForSale 
                ? "linear-gradient(135deg, #667eea, #764ba2)" 
                : "#95a5a6",
              color: "white",
              border: "none",
              borderRadius: "12px",
              padding: "16px 24px",
              fontSize: "16px",
              fontWeight: "700",
              cursor: variants[0]?.availableForSale ? "pointer" : "not-allowed",
              boxShadow: variants[0]?.availableForSale 
                ? "0 4px 12px rgba(102, 126, 234, 0.3)" 
                : "none",
              transition: "all 0.3s ease",
              opacity: variants[0]?.availableForSale ? 1 : 0.6
            }}
          >
            {variants[0]?.availableForSale ? "🛒 Add to Cart" : "❌ Out of Stock"}
          </button>

          {/* View Cart Button */}
          <Link to="/app/cart" style={{ textDecoration: "none" }}>
            <button style={{
              background: "#f8f9fa",
              color: "#667eea",
              border: "2px solid #667eea",
              borderRadius: "12px",
              padding: "14px 16px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.3s ease",
              whiteSpace: "nowrap"
            }}>
              🛍️ Cart
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
