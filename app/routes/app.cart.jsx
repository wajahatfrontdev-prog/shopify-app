import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function Cart() {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();
  const shopify = useAppBridge();

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);
  }, []);

  const removeFromCart = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    shopify.toast.show("🗑️ Removed from cart");
  };

  const updateQuantity = (index, change) => {
    const newCart = [...cart];
    const currentQty = newCart[index].quantity || 1;
    const newQty = Math.max(1, currentQty + change);
    newCart[index].quantity = newQty;
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const total = cart.reduce((sum, item) => sum + (parseFloat(item.price) * (item.quantity || 1)), 0);

  const checkout = () => {
    shopify.toast.show("🚀 Proceeding to checkout...");
    navigate("/app/checkout");
  };

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
          gap: "16px"
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
            fontSize: "20px",
            fontWeight: "700",
            color: "#2c3e50"
          }}>Shopping Cart ({cart.length})</h1>
        </div>
      </div>

      <div style={{ padding: "20px", paddingBottom: "100px" }}>
        {cart.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "white",
            borderRadius: "16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
          }}>
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>🛍️</div>
            <h2 style={{
              margin: "0 0 12px 0",
              fontSize: "24px",
              fontWeight: "700",
              color: "#2c3e50"
            }}>Your cart is empty</h2>
            <p style={{
              margin: "0 0 24px 0",
              fontSize: "16px",
              color: "#7f8c8d"
            }}>Add some products to get started!</p>
            <Link to="/app/store" style={{ textDecoration: "none" }}>
              <button style={{
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                padding: "16px 32px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                transition: "all 0.3s ease"
              }}>
                🛒 Start Shopping
              </button>
            </Link>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div style={{ marginBottom: "20px" }}>
              {cart.map((item, index) => (
                <div key={index} style={{
                  background: "white",
                  borderRadius: "16px",
                  padding: "16px",
                  marginBottom: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}>
                  <div style={{
                    display: "flex",
                    gap: "16px",
                    alignItems: "center"
                  }}>
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.title}
                        style={{
                          width: "80px",
                          height: "80px",
                          objectFit: "cover",
                          borderRadius: "12px",
                          flexShrink: 0
                        }}
                      />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{
                        margin: "0 0 8px 0",
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#2c3e50",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}>{item.title}</h3>
                      <div style={{
                        fontSize: "18px",
                        fontWeight: "700",
                        color: "#e74c3c",
                        marginBottom: "12px"
                      }}>${item.price}</div>
                      
                      {/* Quantity Controls */}
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px"
                      }}>
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          background: "#f8f9fa",
                          borderRadius: "8px",
                          padding: "4px"
                        }}>
                          <button
                            onClick={() => updateQuantity(index, -1)}
                            style={{
                              background: "none",
                              border: "none",
                              width: "32px",
                              height: "32px",
                              borderRadius: "6px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              fontSize: "18px",
                              fontWeight: "bold",
                              color: "#667eea"
                            }}
                          >-</button>
                          <span style={{
                            minWidth: "40px",
                            textAlign: "center",
                            fontSize: "16px",
                            fontWeight: "600",
                            color: "#2c3e50"
                          }}>{item.quantity || 1}</span>
                          <button
                            onClick={() => updateQuantity(index, 1)}
                            style={{
                              background: "none",
                              border: "none",
                              width: "32px",
                              height: "32px",
                              borderRadius: "6px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              fontSize: "18px",
                              fontWeight: "bold",
                              color: "#667eea"
                            }}
                          >+</button>
                        </div>
                        
                        <button
                          onClick={() => removeFromCart(index)}
                          style={{
                            background: "#fee",
                            color: "#e74c3c",
                            border: "1px solid #fcc",
                            borderRadius: "8px",
                            padding: "8px 12px",
                            fontSize: "12px",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "all 0.3s ease"
                          }}
                        >
                          🗑️ Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div style={{
              background: "white",
              borderRadius: "16px",
              padding: "20px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              marginBottom: "20px"
            }}>
              <h3 style={{
                margin: "0 0 16px 0",
                fontSize: "18px",
                fontWeight: "700",
                color: "#2c3e50"
              }}>Order Summary</h3>
              
              <div style={{
                borderTop: "1px solid #e9ecef",
                paddingTop: "16px"
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "12px"
                }}>
                  <span style={{ color: "#7f8c8d" }}>Subtotal ({cart.reduce((sum, item) => sum + (item.quantity || 1), 0)} items)</span>
                  <span style={{ fontWeight: "600" }}>${total.toFixed(2)}</span>
                </div>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "12px"
                }}>
                  <span style={{ color: "#7f8c8d" }}>Shipping</span>
                  <span style={{ fontWeight: "600", color: "#27ae60" }}>Free</span>
                </div>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "12px"
                }}>
                  <span style={{ color: "#7f8c8d" }}>Tax</span>
                  <span style={{ fontWeight: "600" }}>${(total * 0.08).toFixed(2)}</span>
                </div>
                <div style={{
                  borderTop: "2px solid #e9ecef",
                  paddingTop: "12px",
                  display: "flex",
                  justifyContent: "space-between"
                }}>
                  <span style={{
                    fontSize: "18px",
                    fontWeight: "700",
                    color: "#2c3e50"
                  }}>Total</span>
                  <span style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "#e74c3c"
                  }}>${(total + (total * 0.08)).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Fixed Bottom Checkout */}
      {cart.length > 0 && (
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
            gridTemplateColumns: "1fr 1fr",
            gap: "12px"
          }}>
            <Link to="/app/store" style={{ textDecoration: "none" }}>
              <button style={{
                width: "100%",
                background: "#f8f9fa",
                color: "#667eea",
                border: "2px solid #667eea",
                borderRadius: "12px",
                padding: "16px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s ease"
              }}>
                🛒 Continue Shopping
              </button>
            </Link>
            <button
              onClick={checkout}
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                padding: "16px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                transition: "all 0.3s ease"
              }}
            >
              🚀 Checkout ${(total + (total * 0.08)).toFixed(2)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
