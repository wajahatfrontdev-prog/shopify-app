import { useLoaderData, Link } from "react-router";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(
    `#graphql
      query getProducts {
        products(first: 6) {
          edges {
            node {
              id
              title
              productType
              featuredImage {
                url
                altText
              }
              variants(first: 1) {
                edges {
                  node {
                    id
                    price
                  }
                }
              }
            }
          }
        }
      }`
  );

  const responseJson = await response.json();
  const featuredProducts = responseJson.data.products.edges.map((edge) => edge.node);

  return { featuredProducts };
};

export default function Home() {
  const { featuredProducts } = useLoaderData();

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      {/* Mobile Header */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(20px)",
        padding: "12px 20px",
        borderBottom: "1px solid rgba(0,0,0,0.1)"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <h1 style={{
            margin: 0,
            fontSize: "20px",
            fontWeight: "700",
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>WajahatEcom</h1>
          <div style={{ display: "flex", gap: "12px" }}>
            <Link to="/app/cart" style={{ textDecoration: "none" }}>
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "20px",
                background: "#f8f9fa",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px"
              }}>🛒</div>
            </Link>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "20px",
              background: "#f8f9fa",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px"
            }}>👤</div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div style={{
        padding: "40px 20px",
        textAlign: "center",
        color: "white"
      }}>
        <h2 style={{
          margin: "0 0 16px 0",
          fontSize: "32px",
          fontWeight: "800",
          textShadow: "0 2px 4px rgba(0,0,0,0.3)"
        }}>
          Shop Premium Fashion
        </h2>
        <p style={{
          margin: "0 0 32px 0",
          fontSize: "16px",
          opacity: 0.9,
          lineHeight: "1.5"
        }}>
          Discover the latest trends for men, women & kids
        </p>
        
        {/* Search Bar */}
        <div style={{
          background: "rgba(255, 255, 255, 0.2)",
          borderRadius: "25px",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "24px",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.3)"
        }}>
          <span style={{ fontSize: "16px" }}>🔍</span>
          <input
            type="text"
            placeholder="Search products..."
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              color: "white",
              fontSize: "16px",
              flex: 1,
              "::placeholder": { color: "rgba(255, 255, 255, 0.7)" }
            }}
          />
        </div>

        {/* Quick Actions */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
          maxWidth: "300px",
          margin: "0 auto"
        }}>
          <Link to="/app/store" style={{ textDecoration: "none" }}>
            <div style={{
              background: "rgba(255, 255, 255, 0.2)",
              borderRadius: "16px",
              padding: "16px",
              textAlign: "center",
              color: "white",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              transition: "all 0.3s ease"
            }}>
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>🛍️</div>
              <div style={{ fontSize: "14px", fontWeight: "600" }}>Shop Now</div>
            </div>
          </Link>
          <Link to="/app/products" style={{ textDecoration: "none" }}>
            <div style={{
              background: "rgba(255, 255, 255, 0.2)",
              borderRadius: "16px",
              padding: "16px",
              textAlign: "center",
              color: "white",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              transition: "all 0.3s ease"
            }}>
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>📱</div>
              <div style={{ fontSize: "14px", fontWeight: "600" }}>Products</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        background: "#f8f9fa",
        borderTopLeftRadius: "24px",
        borderTopRightRadius: "24px",
        minHeight: "60vh",
        padding: "24px 20px"
      }}>
        {/* Categories */}
        <div style={{ marginBottom: "32px" }}>
          <h3 style={{
            margin: "0 0 20px 0",
            fontSize: "20px",
            fontWeight: "700",
            color: "#2c3e50"
          }}>Shop by Category</h3>
          
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "16px"
          }}>
            {/* Men's */}
            <Link to="/app/store" style={{ textDecoration: "none" }}>
              <div style={{
                position: "relative",
                borderRadius: "16px",
                overflow: "hidden",
                height: "120px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
              }}>
                <div style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: "url('/men.webp')",
                  backgroundSize: "cover",
                  backgroundPosition: "center"
                }}></div>
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0, 0, 0, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <div style={{
                    color: "white",
                    textAlign: "center"
                  }}>
                    <div style={{ fontSize: "24px", marginBottom: "4px" }}>👔</div>
                    <div style={{ fontSize: "14px", fontWeight: "600" }}>Men's</div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Women's */}
            <Link to="/app/store" style={{ textDecoration: "none" }}>
              <div style={{
                position: "relative",
                borderRadius: "16px",
                overflow: "hidden",
                height: "120px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
              }}>
                <div style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: "url('/beauty.jpg')",
                  backgroundSize: "cover",
                  backgroundPosition: "center"
                }}></div>
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0, 0, 0, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <div style={{
                    color: "white",
                    textAlign: "center"
                  }}>
                    <div style={{ fontSize: "24px", marginBottom: "4px" }}>👗</div>
                    <div style={{ fontSize: "14px", fontWeight: "600" }}>Women's</div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Kids */}
            <Link to="/app/store" style={{ textDecoration: "none" }}>
              <div style={{
                position: "relative",
                borderRadius: "16px",
                overflow: "hidden",
                height: "120px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
              }}>
                <div style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: "url('/Kid.jpg')",
                  backgroundSize: "cover",
                  backgroundPosition: "center"
                }}></div>
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0, 0, 0, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <div style={{
                    color: "white",
                    textAlign: "center"
                  }}>
                    <div style={{ fontSize: "24px", marginBottom: "4px" }}>👶</div>
                    <div style={{ fontSize: "14px", fontWeight: "600" }}>Kids</div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Featured Products */}
        <div>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px"
          }}>
            <h3 style={{
              margin: 0,
              fontSize: "20px",
              fontWeight: "700",
              color: "#2c3e50"
            }}>Featured Products</h3>
            <Link to="/app/store" style={{
              textDecoration: "none",
              color: "#667eea",
              fontSize: "14px",
              fontWeight: "600"
            }}>View All</Link>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "16px"
          }}>
            {featuredProducts.slice(0, 4).map((product) => {
              const productId = product.id.split('/').pop();
              return (
                <Link key={product.id} to={`/app/product/${productId}`} style={{ textDecoration: "none" }}>
                  <div style={{
                    background: "white",
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    transition: "transform 0.3s ease"
                  }}>
                    {product.featuredImage && (
                      <img
                        src={product.featuredImage.url}
                        alt={product.title}
                        style={{
                          width: "100%",
                          height: "140px",
                          objectFit: "cover"
                        }}
                      />
                    )}
                    <div style={{ padding: "12px" }}>
                      <h4 style={{
                        margin: "0 0 4px 0",
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#2c3e50",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}>{product.title}</h4>
                      <p style={{
                        margin: "0 0 8px 0",
                        fontSize: "12px",
                        color: "#7f8c8d"
                      }}>{product.productType}</p>
                      <div style={{
                        fontSize: "16px",
                        fontWeight: "700",
                        color: "#e74c3c"
                      }}>${product.variants.edges[0].node.price}</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Features */}
        <div style={{
          marginTop: "32px",
          padding: "24px",
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "20px",
            textAlign: "center"
          }}>
            <div>
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>🚚</div>
              <div style={{ fontSize: "12px", fontWeight: "600", color: "#2c3e50" }}>Free Shipping</div>
              <div style={{ fontSize: "10px", color: "#7f8c8d" }}>On orders $50+</div>
            </div>
            <div>
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>🔄</div>
              <div style={{ fontSize: "12px", fontWeight: "600", color: "#2c3e50" }}>Easy Returns</div>
              <div style={{ fontSize: "10px", color: "#7f8c8d" }}>30-day policy</div>
            </div>
            <div>
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>🛡️</div>
              <div style={{ fontSize: "12px", fontWeight: "600", color: "#2c3e50" }}>Secure Pay</div>
              <div style={{ fontSize: "10px", color: "#7f8c8d" }}>100% secure</div>
            </div>
            <div>
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>📞</div>
              <div style={{ fontSize: "12px", fontWeight: "600", color: "#2c3e50" }}>24/7 Support</div>
              <div style={{ fontSize: "10px", color: "#7f8c8d" }}>Always here</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "white",
        borderTop: "1px solid rgba(0,0,0,0.1)",
        padding: "12px 20px",
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "8px",
        zIndex: 100
      }}>
        <Link to="/app/home" style={{ textDecoration: "none", textAlign: "center" }}>
          <div style={{ fontSize: "20px", marginBottom: "4px" }}>🏠</div>
          <div style={{ fontSize: "10px", color: "#667eea", fontWeight: "600" }}>Home</div>
        </Link>
        <Link to="/app/store" style={{ textDecoration: "none", textAlign: "center" }}>
          <div style={{ fontSize: "20px", marginBottom: "4px" }}>🛍️</div>
          <div style={{ fontSize: "10px", color: "#7f8c8d" }}>Shop</div>
        </Link>
        <Link to="/app/cart" style={{ textDecoration: "none", textAlign: "center" }}>
          <div style={{ fontSize: "20px", marginBottom: "4px" }}>🛒</div>
          <div style={{ fontSize: "10px", color: "#7f8c8d" }}>Cart</div>
        </Link>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "20px", marginBottom: "4px" }}>👤</div>
          <div style={{ fontSize: "10px", color: "#7f8c8d" }}>Profile</div>
        </div>
      </div>

      {/* Bottom Padding for Fixed Nav */}
      <div style={{ height: "80px" }}></div>
    </div>
  );
}