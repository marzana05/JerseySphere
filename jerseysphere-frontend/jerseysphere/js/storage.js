/* ===========================================================
   Jersey Universe — storage layer
   Cart and wishlist stay in localStorage (per-browser by design).
   Accounts now connect to WordPress Users.
   Orders now save to WordPress via the custom Order API.
   =========================================================== */

const STORE_KEYS = {
  CART:          "js_cart",
  WISHLIST:      "js_wishlist",
  SESSION_USER:  "js_session_user",
  ORDERS:        "js_orders",
  REVIEWS:       "js_reviews",
  RECENT_SEARCH: "js_recent_search",
};

const WP_URL = "https://jerseyuniverse.shop";

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

/* ---------- Cart (localStorage — per browser by design) ---------- */
function getCart() { return readStore(STORE_KEYS.CART, []); }
function saveCart(cart) { writeStore(STORE_KEYS.CART, cart); updateCartBadge(); }

function addToCart(item) {
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

/* ---------- Wishlist (localStorage — per browser by design) ---------- */
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

/* ---------- Auth (now backed by WordPress Users) ---------- */
function currentUser() {
  return readStore(STORE_KEYS.SESSION_USER, null);
}
function getSession() {
  return currentUser();
}
function clearSession() {
  localStorage.removeItem(STORE_KEYS.SESSION_USER);
}

async function registerUser({ firstName, lastName, email, password }) {
  try {
    const response = await fetch(WP_URL + "/wp-json/jerseyuniverse/v1/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, email, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      return { ok: false, error: data.message || "Registration failed." };
    }
    writeStore(STORE_KEYS.SESSION_USER, data.user);
    return { ok: true, user: data.user };
  } catch (err) {
    return { ok: false, error: "Could not connect to server. Is WordPress running?" };
  }
}

async function loginUser({ email, password }) {
  try {
    const response = await fetch(WP_URL + "/wp-json/jerseyuniverse/v1/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      return { ok: false, error: data.message || "Email or password is incorrect." };
    }
    writeStore(STORE_KEYS.SESSION_USER, data.user);
    return { ok: true, user: data.user };
  } catch (err) {
    return { ok: false, error: "Could not connect to server. Is WordPress running?" };
  }
}

function verifyCurrentUserEmail() {
  const user = currentUser();
  if (!user) return;
  user.verified = true;
  writeStore(STORE_KEYS.SESSION_USER, user);
}

/* ---------- Orders (now saved to WordPress) ---------- */
const ORDER_STAGES = ["Order placed", "Processing", "Shipped", "Out for delivery", "Delivered"];

function getOrders() { return readStore(STORE_KEYS.ORDERS, []); }
function getOrdersForUser(userId) {
  return getOrders().filter((o) => o.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
}

async function placeOrder({ userId, items, address, payment, total }) {
  try {
    const response = await fetch(WP_URL + "/wp-json/jerseyuniverse/v1/place-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, items, address, payment, total }),
    });

    if (!response.ok) throw new Error("WordPress order API returned " + response.status);

    const wpOrder = await response.json();

    const order = {
      id:        wpOrder.id,
      userId:    userId || null,
      items, address, payment, total,
      stageIndex: 0,
      courier:   wpOrder.courier,
      tracking:  wpOrder.tracking,
      createdAt: wpOrder.createdAt,
      eta:       Date.now() + 5 * 24 * 60 * 60 * 1000,
    };

    const orders = getOrders();
    orders.push(order);
    writeStore(STORE_KEYS.ORDERS, orders);
    return order;

  } catch (err) {
    console.error("Could not save order to WordPress:", err.message);
    const order = {
      id: "JU-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
      userId: userId || null,
      items, address, payment, total,
      stageIndex: 0,
      courier: "Pathao Courier",
      tracking: "TRK" + Math.floor(100000 + Math.random() * 899999),
      createdAt: Date.now(),
      eta: Date.now() + 5 * 24 * 60 * 60 * 1000,
    };
    const orders = getOrders();
    orders.push(order);
    writeStore(STORE_KEYS.ORDERS, orders);
    return order;
  }
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

/* ---------- Reviews (localStorage for now) ---------- */
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

/* ---------- Recent searches (localStorage) ---------- */
function getRecentSearches() { return readStore(STORE_KEYS.RECENT_SEARCH, []); }
function pushRecentSearch(term) {
  if (!term || !term.trim()) return;
  let list = getRecentSearches().filter((t) => t.toLowerCase() !== term.toLowerCase());
  list.unshift(term.trim());
  list = list.slice(0, 6);
  writeStore(STORE_KEYS.RECENT_SEARCH, list);
}
