import { useState, useEffect } from "react";
import { useFetcher, useNavigate } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export const action = async ({ request }) => {
  await authenticate.admin(request);
  const formData = await request.formData();
  
  const orderId = `ORD-${Date.now()}`;
  const cartData = formData.get("cart");
  const cart = JSON.parse(cartData || "[]");
  const total = cart.reduce((sum, item) => sum + (parseFloat(item.price) * (item.quantity || 1)), 0);
  
  await db.order.create({
    data: {
      orderId,
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      city: formData.get("city"),
      zip: formData.get("zip"),
      items: JSON.stringify(cart),
      total: total + 10,
      status: "pending"
    }
  });
  
  return { 
    success: true, 
    orderId,
    message: "Order placed successfully!" 
  };
};

export default function Checkout() {
  const [cart, setCart] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zip: "",
  });
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const shopify = useAppBridge();

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);
  }, []);

  useEffect(() => {
    if (fetcher.data?.success) {
      shopify.toast.show(fetcher.data.message);
      localStorage.removeItem("cart");
      setTimeout(() => navigate("/app/home"), 2000);
    }
  }, [fetcher.data, navigate, shopify]);

  const total = cart.reduce((sum, item) => sum + (parseFloat(item.price) * (item.quantity || 1)), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));
    data.append("cart", JSON.stringify(cart));
    fetcher.submit(data, { method: "POST" });
  };

  return (
    <s-page heading="Checkout">
      <style>{`
        .checkout-container {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 40px;
        }
        .city-zip-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 16px;
        }
        .order-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 12px;
          border-bottom: 1px solid #e1e3e5;
        }
        .order-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 12px;
        }
        .final-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 12px;
          border-top: 2px solid #e1e3e5;
        }
        @media (max-width: 768px) {
          .checkout-container {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .city-zip-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .order-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }
        }
        @media (max-width: 480px) {
          .checkout-container {
            gap: 16px;
          }
        }
      `}</style>
      
      <div className="checkout-container">
        <s-section heading="Shipping Information">
          <s-stack direction="block" gap="base">
            <s-text-field
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <s-text-field
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <s-text-field
              label="Phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
            <s-text-field
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
            <div className="city-zip-grid">
              <s-text-field
                label="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
              <s-text-field
                label="ZIP Code"
                value={formData.zip}
                onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                required
              />
            </div>
          </s-stack>
        </s-section>

        <div>
          <s-section heading="Order Summary">
            <s-card>
              <s-stack direction="block" gap="base" style={{ padding: "16px" }}>
                {cart.map((item, index) => (
                  <div key={index} className="order-item">
                    <s-text>{item.title}</s-text>
                    <s-text>${item.price}</s-text>
                  </div>
                ))}
                <div className="order-total">
                  <s-text>Subtotal</s-text>
                  <s-text>${total.toFixed(2)}</s-text>
                </div>
                <div className="order-total">
                  <s-text>Shipping</s-text>
                  <s-text>$10.00</s-text>
                </div>
                <div className="final-total">
                  <s-text weight="bold" size="large">Total</s-text>
                  <s-text weight="bold" size="large" style={{ color: "#2c6ecb" }}>
                    ${(total + 10).toFixed(2)}
                  </s-text>
                </div>
              </s-stack>
            </s-card>
          </s-section>

          <s-button 
            variant="primary" 
            size="large" 
            onClick={handleSubmit}
            {...(fetcher.state === "submitting" ? { loading: true } : {})}
            style={{ width: "100%", marginTop: "20px" }}
          >
            Place Order
          </s-button>
        </div>
      </div>
    </s-page>
  );
}
