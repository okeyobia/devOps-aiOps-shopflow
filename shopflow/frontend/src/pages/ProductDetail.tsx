import React from "react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image_url: string;
}

export default function ProductDetail({
  product,
  onBack,
  onAddToCart,
}: {
  product: Product;
  onBack: () => void;
  onAddToCart: (p: Product) => void;
}) {
  return (
    <div style={styles.page}>
      <button style={styles.back} onClick={onBack}>← Back to Products</button>

      <div style={styles.card}>
        {product.image_url && (
          <img src={product.image_url} alt={product.name} style={styles.image} />
        )}
        <div style={styles.body}>
          <span style={styles.category}>{product.category}</span>
          <h1 style={styles.name}>{product.name}</h1>
          <p style={styles.desc}>{product.description}</p>

          <div style={styles.meta}>
            <span style={styles.price}>${product.price.toFixed(2)}</span>
            <span style={styles.stock}>
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </span>
          </div>

          <button
            style={product.stock > 0 ? styles.addBtn : styles.disabledBtn}
            disabled={product.stock === 0}
            onClick={() => onAddToCart(product)}
          >
            {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
          </button>
        </div>
      </div>

      <div style={styles.details}>
        <div style={styles.detailsSection}>
          <h2 style={styles.sectionTitle}>Product Details</h2>
          <p style={styles.sectionText}>
            Crafted with premium materials and designed for everyday use, this product delivers
            outstanding quality and reliability. Every detail has been considered to ensure you
            get the best experience from the moment it arrives at your door.
          </p>
          <p style={styles.sectionText}>
            Whether you're treating yourself or looking for the perfect gift, this is a choice
            you won't regret. Built to last and backed by our satisfaction guarantee — if you're
            not happy, we'll make it right.
          </p>
        </div>

        <div style={styles.detailsSection}>
          <h2 style={styles.sectionTitle}>What's Included</h2>
          <ul style={styles.list}>
            <li style={styles.listItem}>1 × {product.name}</li>
            <li style={styles.listItem}>User guide & quick-start booklet</li>
            <li style={styles.listItem}>Protective packaging</li>
            <li style={styles.listItem}>12-month manufacturer warranty</li>
          </ul>
        </div>

        <div style={styles.detailsSection}>
          <h2 style={styles.sectionTitle}>Shipping & Returns</h2>
          <p style={styles.sectionText}>
            Free standard shipping on all orders over $50. Express delivery available at checkout.
            Not satisfied? Return within 30 days for a full refund — no questions asked.
          </p>
        </div>
      </div>
    </div>
  );
}

const brand = {
  navy: "oklch(14% 0.04 255)",
  red: "oklch(56% 0.2 15)",
  bg: "oklch(98% 0.004 255)",
  bgCard: "oklch(99.5% 0.003 255)",
  bgSkeleton: "oklch(92% 0.005 255)",
  textPrimary: "oklch(14% 0.04 255)",
  textSecondary: "oklch(50% 0.01 255)",
  border: "oklch(93% 0.005 255)",
  white: "oklch(97% 0.005 255)",
};

const styles: Record<string, React.CSSProperties> = {
  page: { padding: "32px 48px", maxWidth: 860, background: brand.bg, minHeight: "100%" },
  back: {
    background: "none", border: "none", color: brand.red,
    fontSize: 14, fontWeight: 600, cursor: "pointer", padding: 0, marginBottom: 28,
  },
  card: {
    background: brand.bgCard,
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.07), 0 8px 24px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "row",
  },
  image: { width: 380, flexShrink: 0, objectFit: "cover" as const, display: "block" },
  body: { padding: "40px 40px", display: "flex", flexDirection: "column", flex: 1 },
  category: {
    fontSize: 11, fontWeight: 600, textTransform: "uppercase" as const,
    letterSpacing: "0.07em", color: brand.red, marginBottom: 12, display: "block",
  },
  name: {
    margin: "0 0 16px", fontSize: 30, fontWeight: 800,
    color: brand.textPrimary, lineHeight: 1.2, letterSpacing: "-0.02em",
  },
  desc: {
    fontSize: 15, color: brand.textSecondary,
    lineHeight: 1.7, margin: "0 0 28px", flex: 1,
  },
  meta: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    marginBottom: 28,
  },
  price: {
    fontSize: 34, fontWeight: 800, color: brand.textPrimary,
    letterSpacing: "-0.03em",
  },
  stock: {
    fontSize: 13, color: brand.textSecondary,
    background: brand.bgSkeleton, padding: "5px 12px", borderRadius: 20,
  },
  addBtn: {
    padding: "14px 32px", background: brand.navy, color: brand.white,
    border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700,
    cursor: "pointer", width: "100%",
  },
  disabledBtn: {
    padding: "14px 32px", background: brand.bgSkeleton, color: brand.textSecondary,
    border: "none", borderRadius: 10, fontSize: 15, width: "100%",
  },
  details: {
    marginTop: 40,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: 24,
  },
  detailsSection: {
    background: brand.bgCard,
    borderRadius: 12,
    padding: "28px 28px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  sectionTitle: {
    fontSize: 15, fontWeight: 700, color: brand.textPrimary,
    margin: "0 0 14px", letterSpacing: "-0.01em",
  },
  sectionText: {
    fontSize: 14, color: brand.textSecondary,
    lineHeight: 1.7, margin: "0 0 12px",
  },
  list: { margin: 0, padding: "0 0 0 18px" },
  listItem: {
    fontSize: 14, color: brand.textSecondary,
    lineHeight: 1.8,
  },
};
