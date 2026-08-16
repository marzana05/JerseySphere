const { loadScript } = require("./helpers/loadScript");

beforeAll(() => {
  loadScript("storage.js");
});

beforeEach(() => {
  window.localStorage.clear();
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

/* ---------------------------- Cart ---------------------------- */
describe("cart", () => {
  test("getCart() starts empty", () => {
    expect(getCart()).toEqual([]);
  });

  test("addToCart() adds a new line for a new product/size/customization combo", () => {
    addToCart({ productId: "p01", size: "M", qty: 1, customization: null });
    expect(getCart()).toHaveLength(1);
    expect(getCart()[0].qty).toBe(1);
  });

  test("addToCart() merges quantity into an existing identical line instead of duplicating it", () => {
    addToCart({ productId: "p01", size: "M", qty: 1, customization: null });
    addToCart({ productId: "p01", size: "M", qty: 2, customization: null });
    const cart = getCart();
    expect(cart).toHaveLength(1);
    expect(cart[0].qty).toBe(3);
  });

  test("addToCart() keeps lines separate when size differs", () => {
    addToCart({ productId: "p01", size: "M", qty: 1, customization: null });
    addToCart({ productId: "p01", size: "L", qty: 1, customization: null });
    expect(getCart()).toHaveLength(2);
  });

  test("addToCart() keeps lines separate when customization differs", () => {
    addToCart({ productId: "p01", size: "M", qty: 1, customization: { name: "Faraz", number: "10", fee: 300 } });
    addToCart({ productId: "p01", size: "M", qty: 1, customization: { name: "Kaisan", number: "7", fee: 300 } });
    expect(getCart()).toHaveLength(2);
  });

  test("removeCartLine() removes only the targeted line", () => {
    addToCart({ productId: "p01", size: "M", qty: 1, customization: null });
    addToCart({ productId: "p02", size: "L", qty: 1, customization: null });
    removeCartLine(0);
    const cart = getCart();
    expect(cart).toHaveLength(1);
    expect(cart[0].productId).toBe("p02");
  });

  test("updateCartQty() updates the quantity of an existing line", () => {
    addToCart({ productId: "p01", size: "M", qty: 1, customization: null });
    updateCartQty(0, 5);
    expect(getCart()[0].qty).toBe(5);
  });

  test("updateCartQty() never lets quantity drop below 1", () => {
    addToCart({ productId: "p01", size: "M", qty: 1, customization: null });
    updateCartQty(0, -3);
    expect(getCart()[0].qty).toBe(1);
  });

  test("updateCartQty() is a no-op for an out-of-range index", () => {
    addToCart({ productId: "p01", size: "M", qty: 1, customization: null });
    expect(() => updateCartQty(5, 3)).not.toThrow();
    expect(getCart()).toHaveLength(1);
  });

  test("clearCart() empties the cart", () => {
    addToCart({ productId: "p01", size: "M", qty: 1, customization: null });
    clearCart();
    expect(getCart()).toEqual([]);
  });

  test("cartCount() sums quantities across all lines", () => {
    addToCart({ productId: "p01", size: "M", qty: 2, customization: null });
    addToCart({ productId: "p02", size: "L", qty: 3, customization: null });
    expect(cartCount()).toBe(5);
  });

  test("cartCount() is 0 for an empty cart", () => {
    expect(cartCount()).toBe(0);
  });
});

/* -------------------------- Wishlist --------------------------- */
describe("wishlist", () => {
  test("isWishlisted() is false for a product never added", () => {
    expect(isWishlisted("p01")).toBe(false);
  });

  test("toggleWishlist() adds a product and returns true", () => {
    const result = toggleWishlist("p01");
    expect(result).toBe(true);
    expect(isWishlisted("p01")).toBe(true);
  });

  test("toggleWishlist() removes an already-wishlisted product and returns false", () => {
    toggleWishlist("p01");
    const result = toggleWishlist("p01");
    expect(result).toBe(false);
    expect(isWishlisted("p01")).toBe(false);
  });

  test("wishlist can hold multiple distinct products independently", () => {
    toggleWishlist("p01");
    toggleWishlist("p02");
    expect(getWishlist().sort()).toEqual(["p01", "p02"]);
  });
});

/* ---------------------- Recent searches ------------------------ */
describe("recent searches", () => {
  test("pushRecentSearch() adds a term to the front of the list", () => {
    pushRecentSearch("real madrid");
    expect(getRecentSearches()).toEqual(["real madrid"]);
  });

  test("pushRecentSearch() ignores empty or whitespace-only terms", () => {
    pushRecentSearch("   ");
    pushRecentSearch("");
    expect(getRecentSearches()).toEqual([]);
  });

  test("pushRecentSearch() de-duplicates case-insensitively and moves the term to the front", () => {
    pushRecentSearch("Barcelona");
    pushRecentSearch("Liverpool");
    pushRecentSearch("barcelona");
    expect(getRecentSearches()).toEqual(["barcelona", "Liverpool"]);
  });

  test("pushRecentSearch() caps the list at 6 entries", () => {
    ["a", "b", "c", "d", "e", "f", "g"].forEach(pushRecentSearch);
    const recents = getRecentSearches();
    expect(recents).toHaveLength(6);
    expect(recents[0]).toBe("g"); // most recent first
    expect(recents).not.toContain("a"); // oldest dropped
  });
});

/* ----------------------------- Auth ----------------------------- */
describe("registerUser()", () => {
  test("stores the returned user as the session on success", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ user: { id: 1, firstName: "Kaisan" } }),
    });
    const result = await registerUser({ firstName: "Kaisan", lastName: "Faraz", email: "k@example.com", password: "pw" });
    expect(result.ok).toBe(true);
    expect(currentUser().firstName).toBe("Kaisan");
  });

  test("returns the server's error message on failure and does not create a session", async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: async () => ({ message: "Email already registered." }),
    });
    const result = await registerUser({ firstName: "Kaisan", lastName: "Faraz", email: "k@example.com", password: "pw" });
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Email already registered.");
    expect(currentUser()).toBeNull();
  });

  test("returns a friendly error when the request itself fails (server unreachable)", async () => {
    global.fetch.mockRejectedValue(new Error("network down"));
    const result = await registerUser({ firstName: "K", lastName: "F", email: "k@example.com", password: "pw" });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/could not connect/i);
  });
});

describe("loginUser()", () => {
  test("stores the returned user as the session on success", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ user: { id: 2, firstName: "Nusrat" } }),
    });
    const result = await loginUser({ email: "n@example.com", password: "pw" });
    expect(result.ok).toBe(true);
    expect(currentUser().firstName).toBe("Nusrat");
  });

  test("returns an error and no session on bad credentials", async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: async () => ({ message: "Email or password is incorrect." }),
    });
    const result = await loginUser({ email: "n@example.com", password: "wrong" });
    expect(result.ok).toBe(false);
    expect(currentUser()).toBeNull();
  });
});

describe("session helpers", () => {
  test("clearSession() removes the logged-in user", async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ user: { id: 1 } }) });
    await loginUser({ email: "a@example.com", password: "pw" });
    clearSession();
    expect(currentUser()).toBeNull();
  });

  test("verifyCurrentUserEmail() marks the session user verified", async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ user: { id: 1, verified: false } }) });
    await loginUser({ email: "a@example.com", password: "pw" });
    verifyCurrentUserEmail();
    expect(currentUser().verified).toBe(true);
  });

  test("verifyCurrentUserEmail() is a safe no-op when nobody is logged in", () => {
    expect(() => verifyCurrentUserEmail()).not.toThrow();
    expect(currentUser()).toBeNull();
  });
});

/* ---------------------------- Orders ---------------------------- */
describe("placeOrder()", () => {
  const orderInput = { userId: 1, items: [{ productId: "p01" }], address: {}, payment: {}, total: 3800 };

  test("saves the WordPress-issued order id/courier/tracking on success", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: "WP-100", courier: "Pathao Courier", tracking: "TRK123456", createdAt: 1700000000000 }),
    });
    const order = await placeOrder(orderInput);
    expect(order.id).toBe("WP-100");
    expect(order.courier).toBe("Pathao Courier");
    expect(getOrders()).toHaveLength(1);
  });

  test("falls back to a locally generated order when the WordPress API is unreachable", async () => {
    global.fetch.mockRejectedValue(new Error("network down"));
    const order = await placeOrder(orderInput);
    expect(order.id).toMatch(/^JU-/);
    expect(order.tracking).toMatch(/^TRK\d+$/);
    expect(getOrders()).toHaveLength(1);
  });

  test("falls back to a locally generated order when the WordPress API returns a non-OK status", async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 500 });
    const order = await placeOrder(orderInput);
    expect(order.id).toMatch(/^JU-/);
    expect(getOrders()).toHaveLength(1);
  });

  test("every new order starts at stage index 0 (Order placed)", async () => {
    global.fetch.mockRejectedValue(new Error("offline"));
    const order = await placeOrder(orderInput);
    expect(order.stageIndex).toBe(0);
  });
});

describe("advanceOrderStage()", () => {
  test("moves an order to the next stage", async () => {
    global.fetch.mockRejectedValue(new Error("offline"));
    const order = await placeOrder({ userId: 1, items: [], address: {}, payment: {}, total: 0 });
    const advanced = advanceOrderStage(order.id);
    expect(advanced.stageIndex).toBe(1);
  });

  test("never advances past the final stage (Delivered)", async () => {
    global.fetch.mockRejectedValue(new Error("offline"));
    const order = await placeOrder({ userId: 1, items: [], address: {}, payment: {}, total: 0 });
    for (let i = 0; i < 10; i++) advanceOrderStage(order.id);
    expect(order ? getOrders()[0].stageIndex : null).toBe(ORDER_STAGES.length - 1);
  });

  test("returns null for an order id that doesn't exist", () => {
    expect(advanceOrderStage("does-not-exist")).toBeNull();
  });
});

describe("userHasDelivered()", () => {
  test("is true only once an order containing that product has reached the final stage", async () => {
    global.fetch.mockRejectedValue(new Error("offline"));
    const order = await placeOrder({ userId: 42, items: [{ productId: "p01" }], address: {}, payment: {}, total: 3500 });

    expect(userHasDelivered(42, "p01")).toBe(false);

    for (let i = 0; i < ORDER_STAGES.length; i++) advanceOrderStage(order.id);
    expect(userHasDelivered(42, "p01")).toBe(true);
  });

  test("is false for a different user or a different product", async () => {
    global.fetch.mockRejectedValue(new Error("offline"));
    const order = await placeOrder({ userId: 42, items: [{ productId: "p01" }], address: {}, payment: {}, total: 3500 });
    for (let i = 0; i < ORDER_STAGES.length; i++) advanceOrderStage(order.id);

    expect(userHasDelivered(999, "p01")).toBe(false);
    expect(userHasDelivered(42, "p99")).toBe(false);
  });
});

/* --------------------------- Reviews ----------------------------- */
describe("reviews", () => {
  test("addReview() stores a review under its product id", () => {
    addReview("p01", { name: "Kaisan", rating: 5, body: "Great fit." });
    expect(getUserReviews()["p01"]).toHaveLength(1);
  });

  test("getReviewsFor() puts newly-added reviews before seeded ones", () => {
    global.SEED_REVIEWS = { p01: [{ name: "Seed reviewer", rating: 4 }] };
    addReview("p01", { name: "Kaisan", rating: 5 });
    const reviews = getReviewsFor("p01");
    expect(reviews[0].name).toBe("Kaisan");
    expect(reviews[1].name).toBe("Seed reviewer");
    delete global.SEED_REVIEWS;
  });

  test("getReviewsFor() returns an empty array for a product with no reviews", () => {
    expect(getReviewsFor("no-reviews-product")).toEqual([]);
  });
});
