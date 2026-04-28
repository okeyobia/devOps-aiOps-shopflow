import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import Orders from "./pages/Orders";

type Page = "products" | "orders";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

function Nav({ page, setPage, cartCount, onLogout }: {
  page: Page; setPage: (p: Page) => void; cartCount: number; onLogout: () => void;
}) {
  return (
    <nav style={styles.nav}>
      <span style={styles.logo}>ShopFlow</span>
      <div style={styles.navLinks}>
        <button style={page === "products" ? styles.activeLink : styles.link} onClick={() => setPage("products")}>Products</button>
        <button style={page === "orders" ? styles.activeLink : styles.link} onClick={() => setPage("orders")}>Orders</button>
        <span style={styles.cartBadge}>Cart ({cartCount})</span>
        <button style={styles.logoutBtn} onClick={onLogout}>Logout</button>
      </div>
    </nav>
  );
}

function AppContent() {
  const { isAuthenticated, logout } = useAuth();
  const [authView, setAuthView] = useState<"login" | "register">("login");
  const [page, setPage] = useState<Page>("products");
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: { id: string; name: string; price: number }) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  if (!isAuthenticated) {
    return authView === "login"
      ? <Login onSwitch={() => setAuthView("register")} />
      : <Register onSwitch={() => setAuthView("login")} />;
  }

  return (
    <div style={styles.app}>
      <Nav
        page={page}
        setPage={setPage}
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
        onLogout={logout}
      />
      <main>
        {page === "products" && <Products onAddToCart={addToCart} />}
        {page === "orders" && <Orders />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles: Record<string, React.CSSProperties> = {
  app: { minHeight: "100vh", background: "#f9fafb", fontFamily: "system-ui, sans-serif" },
  nav: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 32px", height: 60, background: "#1a1a2e", color: "#fff" },
  logo: { fontWeight: 700, fontSize: 20, letterSpacing: 1 },
  navLinks: { display: "flex", gap: 16, alignItems: "center" },
  link: { background: "none", border: "none", color: "#aaa", cursor: "pointer", fontSize: 14 },
  activeLink: { background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600 },
  cartBadge: { fontSize: 13, background: "#e94560", padding: "3px 10px", borderRadius: 12 },
  logoutBtn: { background: "none", border: "1px solid #555", color: "#aaa", padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontSize: 13 },
};
