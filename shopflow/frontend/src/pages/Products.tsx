import React, { useEffect, useState } from "react";
import { api } from "../api/client";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image_url: string;
}

function ProductModal({
  product,
  onClose,
  onAddToCart,
}: {
  product: Product;
  onClose: () => void;
  onAddToCart: (p: Product) => void;
}) {
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose}>✕</button>
        {product.image_url && (
          <img src={product.image_url} alt={product.name} style={styles.modalImage} />
        )}
        <div style={styles.modalBody}>
          <span style={styles.modalCategory}>{product.category}</span>
          <h2 style={styles.modalName}>{product.name}</h2>
          <p style={styles.modalDesc}>{product.description}</p>
          <div style={styles.modalMeta}>
            <span style={styles.modalPrice}>${product.price.toFixed(2)}</span>
            <span style={styles.stockBadge}>
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </span>
          </div>
          <button
            style={product.stock > 0 ? styles.addBtn : styles.disabledBtn}
            disabled={product.stock === 0}
            onClick={() => { onAddToCart(product); onClose(); }}
          >
            {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Products({ onAddToCart }: { onAddToCart: (p: Product) => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Product | null>(null);

  useEffect(() => {
    api.get(`/products${category ? `?category=${category}` : ""}`)
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category]);

  const categories = Array.from(new Set(products.map(p => p.category)));

  if (loading) return <p style={{ textAlign: "center", marginTop: 40 }}>Loading products...</p>;

  return (
    <div style={styles.page}>
      <div style={styles.filters}>
        <button style={category === "" ? styles.activeFilter : styles.filter} onClick={() => setCategory("")}>All</button>
        {categories.map(c => (
          <button key={c} style={category === c ? styles.activeFilter : styles.filter} onClick={() => setCategory(c)}>{c}</button>
        ))}
      </div>
      <div style={styles.grid}>
        {products.map(p => (
          <div key={p.id} style={styles.card} onClick={() => setSelected(p)}>
            {p.image_url && <img src={p.image_url} alt={p.name} style={styles.image} />}
            <div style={styles.cardBody}>
              <span style={styles.category}>{p.category}</span>
              <h3 style={styles.name}>{p.name}</h3>
              <p style={styles.desc}>{p.description}</p>
              <div style={styles.footer}>
                <span style={styles.price}>${p.price.toFixed(2)}</span>
                <button
                  style={p.stock > 0 ? styles.addBtn : styles.disabledBtn}
                  disabled={p.stock === 0}
                  onClick={e => { e.stopPropagation(); onAddToCart(p); }}
                >
                  {p.stock > 0 ? "Add to Cart" : "Out of Stock"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <ProductModal
          product={selected}
          onClose={() => setSelected(null)}
          onAddToCart={onAddToCart}
        />
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { padding: "24px 32px" },
  filters: { display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" },
  filter: { padding: "6px 16px", border: "1px solid #ccc", borderRadius: 20, background: "#fff", cursor: "pointer" },
  activeFilter: { padding: "6px 16px", border: "1px solid #1a1a2e", borderRadius: 20, background: "#1a1a2e", color: "#fff", cursor: "pointer" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 24 },
  card: { border: "1px solid #eee", borderRadius: 10, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", cursor: "pointer", transition: "box-shadow 0.15s", },
  image: { width: "100%", height: 180, objectFit: "cover" },
  cardBody: { padding: 16 },
  category: { fontSize: 11, textTransform: "uppercase", color: "#888", letterSpacing: 1 },
  name: { margin: "6px 0 4px", fontSize: 16 },
  desc: { fontSize: 13, color: "#666", marginBottom: 12, minHeight: 36 },
  footer: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  price: { fontWeight: 700, fontSize: 18, color: "#1a1a2e" },
  addBtn: { padding: "7px 14px", background: "#1a1a2e", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" },
  disabledBtn: { padding: "7px 14px", background: "#ccc", color: "#fff", border: "none", borderRadius: 6 },
  // modal
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 },
  modal: { background: "#fff", borderRadius: 14, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 12px 48px rgba(0,0,0,0.25)", position: "relative" },
  closeBtn: { position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.35)", border: "none", color: "#fff", width: 32, height: 32, borderRadius: "50%", fontSize: 15, cursor: "pointer", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center" },
  modalImage: { width: "100%", display: "block", borderRadius: "14px 14px 0 0" },
  modalBody: { padding: 24 },
  modalCategory: { fontSize: 11, textTransform: "uppercase", color: "#888", letterSpacing: 1 },
  modalName: { margin: "8px 0 12px", fontSize: 22, fontWeight: 700, color: "#1a1a2e" },
  modalDesc: { fontSize: 14, color: "#555", lineHeight: 1.6, marginBottom: 20 },
  modalMeta: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  modalPrice: { fontWeight: 700, fontSize: 26, color: "#1a1a2e" },
  stockBadge: { fontSize: 13, color: "#666", background: "#f0f0f0", padding: "4px 10px", borderRadius: 20 },
};
