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

function AuthModal({ onClose }: { onClose: () => void }) {
  const [view, setView] = useState<"login" | "register">("login");
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose}>✕</button>
        {view === "login"
          ? <Login onSwitch={() => setView("register")} />
          : <Register onSwitch={() => setView("login")} />}
      </div>
    </div>
  );
}

function CartDrawer({
  cart,
  onClose,
  onRemove,
  onCheckout,
}: {
  cart: CartItem[];
  onClose: () => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
}) {
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.drawer} onClick={e => e.stopPropagation()}>
        <div style={styles.drawerHeader}>
          <h3 style={{ margin: 0 }}>Cart</h3>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        {cart.length === 0 ? (
          <p style={{ color: "#888", textAlign: "center", marginTop: 40 }}>Your cart is empty</p>
        ) : (
          <>
            <div style={styles.cartItems}>
              {cart.map(item => (
                <div key={item.id} style={styles.cartItem}>
                  <div>
                    <p style={styles.cartName}>{item.name}</p>
                    <p style={styles.cartMeta}>{item.quantity} × ${item.price.toFixed(2)}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={styles.cartTotal}>${(item.price * item.quantity).toFixed(2)}</span>
                    <button style={styles.removeBtn} onClick={() => onRemove(item.id)}>✕</button>
                  </div>
                </div>
              ))}
            </div>
            <div style={styles.drawerFooter}>
              <div style={styles.totalRow}>
                <span>Total</span>
                <span style={{ fontWeight: 700, fontSize: 18 }}>${total.toFixed(2)}</span>
              </div>
              <button style={styles.checkoutBtn} onClick={onCheckout}>
                Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Nav({
  page, setPage, cartCount, isAuthenticated, onCartOpen, onAuthOpen, onLogout,
}: {
  page: Page; setPage: (p: Page) => void; cartCount: number;
  isAuthenticated: boolean; onCartOpen: () => void; onAuthOpen: () => void; onLogout: () => void;
}) {
  return (
    <nav style={styles.nav}>
      <span style={styles.logo}>ShopFlow</span>
      <div style={styles.navLinks}>
        <button style={page === "products" ? styles.activeLink : styles.link} onClick={() => setPage("products")}>
          Products
        </button>
        {isAuthenticated && (
          <button style={page === "orders" ? styles.activeLink : styles.link} onClick={() => setPage("orders")}>
            Orders
          </button>
        )}
        <button style={styles.cartBadge} onClick={onCartOpen}>
          Cart ({cartCount})
        </button>
        {isAuthenticated ? (
          <button style={styles.logoutBtn} onClick={onLogout}>Logout</button>
        ) : (
          <button style={styles.loginBtn} onClick={onAuthOpen}>Sign In</button>
        )}
      </div>
    </nav>
  );
}

function AppContent() {
  const { isAuthenticated, logout } = useAuth();
  const [page, setPage] = useState<Page>("products");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const addToCart = (product: { id: string; name: string; price: number }) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.id !== id));

  const handleCheckout = () => {
    if (!isAuthenticated) {
      setShowCart(false);
      setShowAuth(true);
    } else {
      alert("Checkout flow coming soon!");
    }
  };

  const handleAuthClose = () => setShowAuth(false);

  return (
    <div style={styles.app}>
      <Nav
        page={page}
        setPage={setPage}
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
        isAuthenticated={isAuthenticated}
        onCartOpen={() => setShowCart(true)}
        onAuthOpen={() => setShowAuth(true)}
        onLogout={logout}
      />

      <main>
        {page === "products" && <Products onAddToCart={addToCart} />}
        {page === "orders" && isAuthenticated && <Orders />}
      </main>

      {showCart && (
        <CartDrawer
          cart={cart}
          onClose={() => setShowCart(false)}
          onRemove={removeFromCart}
          onCheckout={handleCheckout}
        />
      )}

      {showAuth && <AuthModal onClose={handleAuthClose} />}
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
  cartBadge: { fontSize: 13, background: "#e94560", color: "#fff", border: "none", padding: "4px 12px", borderRadius: 12, cursor: "pointer" },
  logoutBtn: { background: "none", border: "1px solid #555", color: "#aaa", padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontSize: 13 },
  loginBtn: { background: "#e94560", border: "none", color: "#fff", padding: "6px 16px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", justifyContent: "flex-end" },
  modal: { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "#fff", borderRadius: 12, padding: 8, width: 420, zIndex: 101, boxShadow: "0 8px 40px rgba(0,0,0,0.2)" },
  drawer: { width: 400, height: "100vh", background: "#fff", display: "flex", flexDirection: "column", boxShadow: "-4px 0 20px rgba(0,0,0,0.15)" },
  drawerHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid #eee" },
  closeBtn: { background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#666" },
  cartItems: { flex: 1, overflowY: "auto", padding: "16px 24px" },
  cartItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f0f0f0" },
  cartName: { margin: 0, fontWeight: 500 },
  cartMeta: { margin: "2px 0 0", fontSize: 13, color: "#888" },
  cartTotal: { fontWeight: 600 },
  removeBtn: { background: "none", border: "none", color: "#ccc", cursor: "pointer", fontSize: 14 },
  drawerFooter: { padding: "20px 24px", borderTop: "1px solid #eee" },
  totalRow: { display: "flex", justifyContent: "space-between", marginBottom: 16, fontSize: 15 },
  checkoutBtn: { width: "100%", padding: "12px", background: "#1a1a2e", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer" },
};
