import React, { useEffect, useState } from "react";
import { api } from "../api/client";

interface Order {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  shipped: "#8b5cf6",
  delivered: "#10b981",
  cancelled: "#ef4444",
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/orders")
      .then(setOrders)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ textAlign: "center", marginTop: 40 }}>Loading orders...</p>;
  if (error) return <p style={{ textAlign: "center", color: "red", marginTop: 40 }}>{error}</p>;

  return (
    <div style={styles.page}>
      <h2 style={{ marginBottom: 24 }}>My Orders</h2>
      {orders.length === 0 ? (
        <p style={{ color: "#888" }}>No orders yet.</p>
      ) : (
        <div style={styles.list}>
          {orders.map(o => (
            <div key={o.id} style={styles.card}>
              <div style={styles.row}>
                <div>
                  <p style={styles.productName}>{o.product_name}</p>
                  <p style={styles.meta}>Qty: {o.quantity} × ${o.unit_price.toFixed(2)}</p>
                  <p style={styles.meta}>{new Date(o.created_at).toLocaleDateString()}</p>
                </div>
                <div style={styles.right}>
                  <p style={styles.total}>${o.total_price.toFixed(2)}</p>
                  <span style={{ ...styles.badge, background: STATUS_COLORS[o.status] || "#888" }}>
                    {o.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { padding: "24px 32px", maxWidth: 800 },
  list: { display: "flex", flexDirection: "column", gap: 16 },
  card: { border: "1px solid #eee", borderRadius: 10, padding: 20, boxShadow: "0 2px 6px rgba(0,0,0,0.05)" },
  row: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  productName: { fontWeight: 600, fontSize: 16, margin: "0 0 4px" },
  meta: { fontSize: 13, color: "#888", margin: "2px 0" },
  right: { textAlign: "right" },
  total: { fontWeight: 700, fontSize: 18, margin: "0 0 8px" },
  badge: { color: "#fff", padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600 },
};
