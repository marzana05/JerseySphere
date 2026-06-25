/* ===========================================================
   JerseySphere — storage layer
   Wraps localStorage so every page reads/writes the same shape.
   This is a static demo: there is no real server, so "account",
   "orders" and "payment" are all simulated client-side.
   =========================================================== */

const STORE_KEYS = {
  CART: "js_cart",
  WISHLIST: "js_wishlist",
  USERS: "js_users",
  SESSION: "js_session",
  ORDERS: "js_orders",
  REVIEWS: "js_reviews",
  RECENT_SEARCH: "js_recent_search",
};

function readStore(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}
function writeStore(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/* ---------- Cart ---------- */
function getCart() { return readStore(STORE_KEYS.CART, []); }
function saveCart(cart) { writeStore(STORE_KEYS.CART, cart); updateCartBadge(); }

function addToCart(item) {
  // item: { productId, size, qty, customization: {name, number, fee} | null }
  const cart = getCart();
  const sameLine = cart.find((c) =>
    c.productId === item.productId &&
    c.size === item.size &&
    JSON.stringify(c.customization) === JSON.stringify(item.customization)
  );
  if (sameLine) {
    sameLine.qty += item.qty;
  } else {
    cart.push(item);
  }
  saveCart(cart);
}
function removeCartLine(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
}
function updateCartQty(index, qty) {
  const cart = getCart();
  if (!cart[index]) return;
  cart[index].qty = Math.max(1, qty);
  saveCart(cart);
}
function clearCart() { saveCart([]); }
function cartCount() { return getCart().reduce((n, c) => n + c.qty, 0); }
function updateCartBadge() {
  document.querySelectorAll("[data-cart-count]").forEach((el) => {
    const n = cartCount();
    el.textContent = n;
    el.classList.toggle("hidden", n === 0);
  });
}

/* ---------- Wishlist ---------- */
function getWishlist() { return readStore(STORE_KEYS.WISHLIST, []); }
function isWishlisted(productId) { return getWishlist().includes(productId); }
function toggleWishlist(productId) {
  let list = getWishlist();
  if (list.includes(productId)) {
    list = list.filter((id) => id !== productId);
  } else {
    list.push(productId);
  }
  writeStore(STORE_KEYS.WISHLIST, list);
  return list.includes(productId);
}

/* ---------- Auth (mock) ---------- */
function getUsers() { return readStore(STORE_KEYS.USERS, []); }
function getSession() { return readStore(STORE_KEYS.SESSION, null); }
function setSession(userId) { writeStore(STORE_KEYS.SESSION, userId); }
function clearSession() { localStorage.removeItem(STORE_KEYS.SESSION); }
function currentUser() {
  const id = getSession();
  if (!id) return null;
  return getUsers().find((u) => u.id === id) || null;
}
function registerUser({ firstName, lastName, email, password }) {
  const users = getUsers();
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return { ok: false, error: "An account with this email already exists." };
  }
  const user = {
    id: "u_" + Date.now().toString(36),
    firstName, lastName, email,
    password, // demo only — never store plain passwords in a real app
    verified: false,
  };
  users.push(user);
  writeStore(STORE_KEYS.USERS, users);
  setSession(user.id);
  return { ok: true, user };
}
function verifyCurrentUserEmail() {
  const id = getSession();
  const users = getUsers();
  const user = users.find((u) => u.id === id);
  if (!user) return;
  user.verified = true;
  writeStore(STORE_KEYS.USERS, users);
}
function loginUser({ email, password }) {
  const user = getUsers().find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  if (!user) return { ok: false, error: "Email or password is incorrect." };
  setSession(user.id);
  return { ok: true, user };
}

/* ---------- Orders ---------- */
const ORDER_STAGES = ["Order placed", "Processing", "Shipped", "Out for delivery", "Delivered"];

function getOrders() { return readStore(STORE_KEYS.ORDERS, []); }
function getOrdersForUser(userId) {
  return getOrders().filter((o) => o.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
}
function placeOrder({ userId, items, address, payment, total }) {
  const orders = getOrders();
  const order = {
    id: "JS-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
    userId: userId || null,
    items, address, payment, total,
    stageIndex: 0,
    courier: "Pathao Courier",
    tracking: "TRK" + Math.floor(100000 + Math.random() * 899999),
    createdAt: Date.now(),
    eta: Date.now() + 5 * 24 * 60 * 60 * 1000,
  };
  orders.push(order);
  writeStore(STORE_KEYS.ORDERS, orders);
  return order;
}
function advanceOrderStage(orderId) {
  const orders = getOrders();
  const order = orders.find((o) => o.id === orderId);
  if (!order) return null;
  order.stageIndex = Math.min(order.stageIndex + 1, ORDER_STAGES.length - 1);
  writeStore(STORE_KEYS.ORDERS, orders);
  return order;
}
function userHasDelivered(userId, productId) {
  return getOrders().some(
    (o) => o.userId === userId &&
      o.stageIndex === ORDER_STAGES.length - 1 &&
      o.items.some((it) => it.productId === productId)
  );
}

/* ---------- Reviews (user-submitted, merged with seed data) ---------- */
function getUserReviews() { return readStore(STORE_KEYS.REVIEWS, {}); }
function addReview(productId, review) {
  const all = getUserReviews();
  if (!all[productId]) all[productId] = [];
  all[productId].unshift(review);
  writeStore(STORE_KEYS.REVIEWS, all);
}
function getReviewsFor(productId) {
  const seeded = (typeof SEED_REVIEWS !== "undefined" && SEED_REVIEWS[productId]) || [];
  const userAdded = getUserReviews()[productId] || [];
  return [...userAdded, ...seeded];
}

/* ---------- Recent searches ---------- */
function getRecentSearches() { return readStore(STORE_KEYS.RECENT_SEARCH, []); }
function pushRecentSearch(term) {
  if (!term || !term.trim()) return;
  let list = getRecentSearches().filter((t) => t.toLowerCase() !== term.toLowerCase());
  list.unshift(term.trim());
  list = list.slice(0, 6);
  writeStore(STORE_KEYS.RECENT_SEARCH, list);
}
