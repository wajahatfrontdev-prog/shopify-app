import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" }
  });
  return { orders };
};

export default function Orders() {
  const { orders } = useLoaderData();

  return (
    <s-page heading="📦 All Orders">
      <s-section>
        {orders.length === 0 ? (
          <s-card>
            <div style={{ textAlign: "center", padding: "40px" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📦</div>
              <s-text size="large">No orders yet</s-text>
            </div>
          </s-card>
        ) : (
          <s-stack direction="block" gap="base">
            {orders.map((order) => {
              const items = JSON.parse(order.items);
              return (
                <s-card key={order.id}>
                  <div style={{ padding: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                      <s-text weight="bold" size="large">{order.orderId}</s-text>
                      <s-badge status={order.status === "pending" ? "warning" : "success"}>
                        {order.status}
                      </s-badge>
                    </div>
                    
                    <div style={{ marginBottom: "12px" }}>
                      <s-text>👤 {order.name}</s-text><br/>
                      <s-text>📧 {order.email}</s-text><br/>
                      <s-text>📱 {order.phone}</s-text><br/>
                      <s-text>📍 {order.address}, {order.city} - {order.zip}</s-text>
                    </div>

                    <div style={{ borderTop: "1px solid #e1e3e5", paddingTop: "12px", marginTop: "12px" }}>
                      <s-text weight="bold">Items:</s-text>
                      {items.map((item, idx) => (
                        <div key={idx} style={{ marginTop: "8px" }}>
                          <s-text>• {item.title} - ${item.price} x {item.quantity || 1}</s-text>
                        </div>
                      ))}
                    </div>

                    <div style={{ borderTop: "1px solid #e1e3e5", paddingTop: "12px", marginTop: "12px" }}>
                      <s-text weight="bold" size="large" style={{ color: "#2c6ecb" }}>
                        Total: ${order.total.toFixed(2)}
                      </s-text>
                      <br/>
                      <s-text size="small" style={{ color: "#666" }}>
                        {new Date(order.createdAt).toLocaleString()}
                      </s-text>
                    </div>
                  </div>
                </s-card>
              );
            })}
          </s-stack>
        )}
      </s-section>
    </s-page>
  );
}
