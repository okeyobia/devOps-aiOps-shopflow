import React, { useState, useEffect } from "react";
import "./App.css";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { api } from "./api/client";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import ProductDetail from "./pages/ProductDetail";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image_url: string;
}

type Page = "home" | "products" | "orders" | "product";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

function AuthModal({ onClose }: { onClose: () => void }) {
  const [view, setView] = useState<"login" | "register">("login");
  const { isAuthenticated } = useAuth();
  const wasAuthenticated = React.useRef(isAuthenticated);

  useEffect(() => {
    if (!wasAuthenticated.current && isAuthenticated) onClose();
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

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
  cart, onClose, onRemove, onCheckout,
}: {
  cart: CartItem[]; onClose: () => void; onRemove: (id: string) => void; onCheckout: () => void;
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
              <button style={styles.checkoutBtn} onClick={onCheckout}>Checkout</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ProfileMenu({ email, onLogout }: { email: string; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const initial = email.charAt(0).toUpperCase() || "U";

  return (
    <div ref={ref} style={styles.profileWrapper}>
      <button style={styles.avatarBtn} onClick={() => setOpen(o => !o)}>
        <span style={styles.avatar}>{initial}</span>
      </button>
      {open ? (
        <div style={styles.profileDropdown}>
          <p style={styles.profileEmail}>{email}</p>
          <div style={styles.profileDivider} />
          <button style={styles.profileLogout} onClick={() => { onLogout(); setOpen(false); }}>
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
}

function TopBar({
  cartCount, isAuthenticated, onCartOpen, onAuthOpen, onLogout,
}: {
  cartCount: number; isAuthenticated: boolean;
  onCartOpen: () => void; onAuthOpen: () => void; onLogout: () => void;
}) {
  const { userEmail } = useAuth();

  return (
    <header style={styles.topBar}>
      <div style={styles.topBarRight}>
        <button style={styles.cartBtn} onClick={onCartOpen}>
          Cart
          {cartCount > 0 ? <span style={styles.cartCount}>{cartCount}</span> : null}
        </button>
        {isAuthenticated ? (
          <ProfileMenu email={userEmail || ""} onLogout={onLogout} />
        ) : (
          <button style={styles.loginBtn} onClick={onAuthOpen}>Sign In</button>
        )}
      </div>
    </header>
  );
}

const NAV_ITEMS: { label: string; key: Page }[] = [
  { label: "Home", key: "home" },
  { label: "Products", key: "products" },
  { label: "Orders", key: "orders" },
];

function Sidebar({
  page, setPage, isAuthenticated, onAuthOpen,
}: {
  page: Page; setPage: (p: Page) => void;
  isAuthenticated: boolean; onAuthOpen: () => void;
}) {
  return (
    <aside style={styles.sidebar}>
      <div style={{ ...styles.sidebarLogo, cursor: "pointer" }} onClick={() => setPage("home")}>ShopFlow</div>
      <nav style={styles.sidebarNav}>
        {NAV_ITEMS.map(({ label, key }) => (
          <button
            key={key}
            style={(page === key || (page === "product" && key === "products")) ? styles.sidebarLinkActive : styles.sidebarLink}
            onClick={() => {
              if (key === "orders" && !isAuthenticated) {
                onAuthOpen();
              } else {
                setPage(key);
              }
            }}
          >
            {label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

function SkeletonCard() {
  return (
    <div style={styles.featuredCard} className="skeleton-pulse">
      <div style={styles.skeletonImage} />
      <div style={styles.featuredCardBody}>
        <div style={{ ...styles.skeletonLine, width: "38%", marginBottom: 12 }} />
        <div style={{ ...styles.skeletonLine, width: "75%", marginBottom: 8 }} />
        <div style={{ ...styles.skeletonLine, width: "55%" }} />
      </div>
      <div style={styles.featuredCardFooter}>
        <div style={{ ...styles.skeletonLine, width: "30%", height: 22 }} />
        <div style={{ ...styles.skeletonLine, width: "34%", height: 32, borderRadius: 8 }} />
      </div>
    </div>
  );
}

function HomePage({
  onNavigate, onAddToCart, onViewDetail,
}: {
  onNavigate: (p: Page) => void;
  onAddToCart: (p: Product) => void;
  onViewDetail: (p: Product) => void;
}) {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/products")
      .then((data: Product[]) => setFeatured(data.slice(0, 6)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={styles.homePage}>
      <div style={styles.homeHero}>
        <div style={styles.homeHeroInner}>
          <h1 style={styles.homeTitle}>Discover. Shop. Done.</h1>
          <p style={styles.homeSubtitle}>
            Browse our curated catalog and add to cart in seconds.
          </p>
          <button style={styles.homeBtn} onClick={() => onNavigate("products")}>
            Browse All Products
          </button>
        </div>
      </div>

      <div style={styles.featuredSection}>
        <div style={styles.featuredHeader}>
          <h2 style={styles.featuredTitle}>Featured Products</h2>
          <button style={styles.viewAllBtn} onClick={() => onNavigate("products")}>
            View all
          </button>
        </div>

        <div style={styles.featuredGrid}>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : featured.map(p => (
                <div key={p.id} style={{ ...styles.featuredCard, cursor: "pointer" }} className="product-card" onClick={() => onViewDetail(p)}>
                  {p.image_url
                    ? <img src={p.image_url} alt={p.name} style={styles.featuredImage} />
                    : <div style={styles.featuredImagePlaceholder} />}
                  <div style={styles.featuredCardBody}>
                    <span style={styles.featuredCategory}>{p.category}</span>
                    <h3 style={styles.featuredName}>{p.name}</h3>
                  </div>
                  <div style={styles.featuredCardFooter}>
                    <span style={styles.featuredPrice}>${p.price.toFixed(2)}</span>
                    <button
                      style={p.stock > 0 ? styles.addBtn : styles.disabledBtn}
                      disabled={p.stock === 0}
                      onClick={e => { e.stopPropagation(); onAddToCart(p); }}
                    >
                      {p.stock > 0 ? "Add to Cart" : "Out of Stock"}
                    </button>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, logout } = useAuth();
  const [page, setPage] = useState<Page>("home");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const viewDetail = (p: Product) => { setSelectedProduct(p); setPage("product"); };

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
      alert("Checkout flow coming with stripe integration!");
    }
  };

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div style={styles.app}>
      <TopBar
        cartCount={cartCount}
        isAuthenticated={isAuthenticated}
        onCartOpen={() => setShowCart(true)}
        onAuthOpen={() => setShowAuth(true)}
        onLogout={logout}
      />

      <div style={styles.body}>
        <Sidebar
          page={page}
          setPage={setPage}
          isAuthenticated={isAuthenticated}
          onAuthOpen={() => setShowAuth(true)}
        />
        <main style={styles.main}>
          {page === "home" ? <HomePage onNavigate={setPage} onAddToCart={addToCart} onViewDetail={viewDetail} /> : null}
          {page === "products" ? <Products onAddToCart={addToCart} onViewDetail={viewDetail} /> : null}
          {page === "orders" && isAuthenticated ? <Orders /> : null}
          {page === "product" && selectedProduct ? (
            <ProductDetail product={selectedProduct} onBack={() => setPage("products")} onAddToCart={addToCart} />
          ) : null}
        </main>
      </div>

      {showCart ? (
        <CartDrawer
          cart={cart}
          onClose={() => setShowCart(false)}
          onRemove={removeFromCart}
          onCheckout={handleCheckout}
        />
      ) : null}

      {showAuth ? <AuthModal onClose={() => setShowAuth(false)} /> : null}
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

const brand = {
  navy: "oklch(14% 0.04 255)",
  red: "oklch(56% 0.2 15)",
  bg: "oklch(98% 0.004 255)",
  bgCard: "oklch(99.5% 0.003 255)",
  bgSkeleton: "oklch(92% 0.005 255)",
  white: "oklch(97% 0.005 255)",
  mutedWhite: "oklch(72% 0.02 255)",
  textPrimary: "oklch(14% 0.04 255)",
  textSecondary: "oklch(50% 0.01 255)",
  border: "oklch(93% 0.005 255)",
  sidebarBorder: "rgba(255,255,255,0.08)",
};

const styles: Record<string, React.CSSProperties> = {
  app: {
    display: "flex", flexDirection: "column", minHeight: "100vh",
    fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    background: brand.bg,
  },

  // Top bar
  topBar: {
    height: 56, background: brand.navy, display: "flex", alignItems: "center",
    justifyContent: "flex-end", padding: "0 24px", flexShrink: 0,
    boxShadow: "0 1px 0 rgba(255,255,255,0.06)",
  },
  topBarRight: { display: "flex", alignItems: "center", gap: 12 },
  cartBtn: {
    display: "flex", alignItems: "center", gap: 6,
    background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
    color: brand.white, padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13,
  },
  cartCount: {
    background: brand.red, color: brand.white, borderRadius: 10,
    padding: "1px 6px", fontSize: 11, fontWeight: 700,
  },
  profileWrapper: { position: "relative" },
  avatarBtn: {
    background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex",
  },
  avatar: {
    width: 32, height: 32, borderRadius: "50%",
    background: brand.red, color: brand.white,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 14, fontWeight: 700, userSelect: "none",
  },
  profileDropdown: {
    position: "absolute", top: "calc(100% + 10px)", right: 0,
    background: "#fff", borderRadius: 10, minWidth: 200,
    boxShadow: "0 4px 24px rgba(0,0,0,0.14), 0 1px 4px rgba(0,0,0,0.06)",
    zIndex: 200, overflow: "hidden",
  },
  profileEmail: {
    margin: 0, padding: "14px 16px 12px",
    fontSize: 13, color: brand.textSecondary,
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  },
  profileDivider: { height: 1, background: brand.border, margin: "0" },
  profileLogout: {
    width: "100%", padding: "12px 16px", background: "none", border: "none",
    textAlign: "left", fontSize: 14, color: brand.textPrimary,
    cursor: "pointer", fontWeight: 500,
  },
  loginBtn: {
    background: brand.red, border: "none", color: brand.white,
    padding: "6px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600,
  },

  // Body
  body: { display: "flex", flex: 1 },

  // Sidebar
  sidebar: {
    width: 220, background: brand.navy, color: brand.white,
    display: "flex", flexDirection: "column", flexShrink: 0,
  },
  sidebarLogo: {
    padding: "24px 24px 20px", fontWeight: 800, fontSize: 18, letterSpacing: "-0.01em",
    color: brand.white, borderBottom: `1px solid ${brand.sidebarBorder}`,
  },
  sidebarNav: { display: "flex", flexDirection: "column", padding: "16px 12px", gap: 2 },
  sidebarLink: {
    background: "none", border: "none", color: brand.mutedWhite, cursor: "pointer",
    fontSize: 14, textAlign: "left", padding: "10px 14px", borderRadius: 8,
  },
  sidebarLinkActive: {
    background: "rgba(255,255,255,0.10)", border: "none", color: brand.white, cursor: "pointer",
    fontSize: 14, textAlign: "left", padding: "10px 14px", borderRadius: 8, fontWeight: 600,
  },

  // Main content
  main: { flex: 1, minWidth: 0 },

  // Home page
  homePage: { background: brand.bg },

  homeHero: {
    background: brand.navy,
    padding: "80px 48px",
    display: "flex",
    justifyContent: "center",
  },
  homeHeroInner: { maxWidth: 560, textAlign: "center" },
  homeTitle: {
    fontSize: 52, fontWeight: 800, color: brand.white,
    margin: "0 0 20px", lineHeight: 1.1, letterSpacing: "-0.025em",
  },
  homeSubtitle: {
    fontSize: 18, color: brand.mutedWhite,
    margin: "0 0 40px", lineHeight: 1.6, maxWidth: 420,
  },
  homeBtn: {
    background: brand.red, color: brand.white, border: "none",
    padding: "14px 36px", borderRadius: 10, fontSize: 15, fontWeight: 700,
    cursor: "pointer", letterSpacing: "-0.01em",
  },

  featuredSection: { padding: "52px 48px" },
  featuredHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 32,
  },
  featuredTitle: {
    fontSize: 22, fontWeight: 700, color: brand.textPrimary,
    margin: 0, letterSpacing: "-0.01em",
  },
  viewAllBtn: {
    background: "none", border: "none", color: brand.red,
    fontSize: 14, fontWeight: 600, cursor: "pointer", padding: 0,
  },
  featuredGrid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 24,
  },
  featuredCard: {
    border: "none", borderRadius: 12, overflow: "hidden",
    background: brand.bgCard,
    boxShadow: "0 1px 3px rgba(0,0,0,0.07), 0 4px 12px rgba(0,0,0,0.04)",
    display: "flex", flexDirection: "column",
  },
  featuredImage: { width: "100%", height: 200, objectFit: "cover" as const },
  featuredImagePlaceholder: { width: "100%", height: 200, background: brand.bgSkeleton },
  featuredCardBody: { padding: "18px 20px 12px", flex: 1 },
  featuredCategory: {
    fontSize: 11, fontWeight: 600, textTransform: "uppercase" as const,
    letterSpacing: "0.07em", color: brand.red, display: "block", marginBottom: 8,
  },
  featuredName: {
    margin: 0, fontSize: 16, fontWeight: 600,
    color: brand.textPrimary, lineHeight: 1.35,
  },
  featuredCardFooter: {
    borderTop: `1px solid ${brand.border}`,
    padding: "14px 20px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
  },
  featuredPrice: { fontWeight: 800, fontSize: 22, color: brand.textPrimary, letterSpacing: "-0.02em" },
  addBtn: {
    padding: "8px 16px", background: brand.navy, color: brand.white,
    border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600,
  },
  disabledBtn: {
    padding: "8px 16px", background: brand.bgSkeleton, color: brand.textSecondary,
    border: "none", borderRadius: 8, fontSize: 13,
  },

  // Skeleton
  skeletonImage: { width: "100%", height: 200, background: brand.bgSkeleton },
  skeletonLine: { height: 12, borderRadius: 6, background: brand.bgSkeleton },

  // Overlays
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
  checkoutBtn: { width: "100%", padding: "12px", background: brand.navy, color: brand.white, border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer" },
};
