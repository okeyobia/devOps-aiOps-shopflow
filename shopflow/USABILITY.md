# ShopFlow Usability Guide

## Overview

ShopFlow is an e-commerce platform for browsing and purchasing products. The application follows a straightforward flow: **browse → explore → add to cart → authenticate → checkout**, with a dedicated order history view for signed-in users.

---

## Navigation

The layout consists of a **left sidebar** and a **top bar** that are always visible.

| Element | Location | Purpose |
|---|---|---|
| ShopFlow logo | Sidebar (top) | Clickable — returns to home from anywhere |
| Home | Sidebar | Featured products landing page |
| Products | Sidebar | Full product catalog |
| Orders | Sidebar | Order history (requires sign-in) |
| Cart button | Top bar (right) | Opens cart drawer; badge shows item count |
| Sign In / Profile | Top bar (right) | Auth entry point or logged-in user menu |

---

## Pages

### Home (`/`)

The landing page displays a hero section and a featured grid of six products.

- Each product card shows: image, category, name, price, stock status, and an **Add to Cart** button.
- Clicking **Browse All Products** navigates to the full catalog.
- Cards show skeleton placeholders while data loads.

### Products (`/products`)

The full product catalog with category filtering.

- **Filter by category** using the buttons at the top — dynamically built from available products.
- The grid adapts to screen width (minimum 260 px per card).
- Out-of-stock products display a disabled **Add to Cart** button.

### Product Detail (`/product/:id`)

A dedicated page for a single product.

- Shows the full image, description, price, and stock level.
- Three collapsible info sections: **Product Details**, **What's Included**, **Shipping & Returns**.
  - Free shipping on orders over $50.
  - 30-day return window.
- **Add to Cart** is disabled when stock is zero.
- **Back** button returns to the Products page.

### Orders (`/orders`) — sign-in required

Displays the authenticated user's complete order history.

- Each order shows: product name, quantity, unit price, total, order date, and a colour-coded status badge.

| Status | Colour |
|---|---|
| Pending | Yellow |
| Confirmed | Blue |
| Shipped | Purple |
| Delivered | Green |
| Cancelled | Red |

- Clicking **Orders** while signed out opens the sign-in modal automatically.

---

## Cart

The cart is a slide-in drawer from the right side of the screen.

- **Open:** click the Cart button in the top bar.
- **Remove items:** click the remove icon next to any line item.
- **Total** is calculated in real time.
- Cart state is held in memory — it resets on page refresh (persistence is planned).
- Clicking **Checkout** while signed out opens the sign-in modal. Once authenticated, checkout proceeds.

> **Note:** Full Stripe payment integration is in progress. The checkout button currently shows a confirmation placeholder.

---

## Authentication

Authentication is handled via a modal overlay — no separate login page.

### Sign In

1. Click **Sign In** in the top bar (or attempt to access Orders/Checkout).
2. Enter email and password.
3. Click **Sign In** — a JWT token is issued and stored locally.
4. The modal closes and the UI switches to the authenticated state (profile avatar replaces Sign In).

### Create Account

1. Open the auth modal and click **Create Account**.
2. Enter email and password (minimum 6 characters).
3. Submit — the account is created and you are logged in automatically.
4. Duplicate emails are rejected with an inline error.

### Sign Out

1. Click the profile avatar in the top bar.
2. A dropdown shows your email address and a **Logout** button.
3. Click **Logout** — session is cleared and the UI returns to the unauthenticated state.

### Session Persistence

The session token is stored in `localStorage` and survives page refreshes. Sessions expire after **60 minutes** of inactivity and require a fresh sign-in.

---

## User Flows

### Browse and Buy (Guest)

```
Home → Products → Product Detail → Add to Cart → Cart Drawer
```

No sign-in required to browse or add items to the cart.

### Checkout (Authenticated)

```
Cart Drawer → Checkout → [Sign In if needed] → Order Confirmed
```

### View Order History

```
Sidebar: Orders → [Sign In if needed] → Order list
```

---

## Error States

| Situation | Behaviour |
|---|---|
| Invalid login credentials | Inline error message below the form |
| Email already registered | Error displayed in registration form |
| Product out of stock | Add to Cart button disabled |
| Orders page while signed out | Auth modal opens automatically |
| Network/API error | Error message displayed in the relevant section |

---

## Accessibility

- Contrast ratios meet WCAG AA.
- Keyboard navigable throughout.
- No motion assumed by default.
- Skeleton loading states prevent layout shift during data fetches.

---

## API at a Glance

All client requests go through the API gateway (`/api`). Public endpoints require no token; protected endpoints require a `Bearer` token in the `Authorization` header.

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Sign in, receive token |
| GET | `/api/products` | — | List products (filter by `category`, paginate with `skip`/`limit`) |
| GET | `/api/products/:id` | — | Single product |
| POST | `/api/orders` | ✓ | Place order (`product_id`, `quantity`) |
| GET | `/api/orders` | ✓ | User's order history |
| GET | `/api/users/me` | ✓ | User profile |
| PUT | `/api/users/me` | ✓ | Update profile |

---

## Known Limitations

- **Cart is not persisted** — refreshing the page clears the cart.
- **Checkout is a placeholder** — Stripe integration is pending.
- **No quantity selector in cart** — items must be added individually from the product page.
- **Admin product management** (create/update/delete) has no UI — API-only for now.
