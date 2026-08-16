const { loadScript } = require("./helpers/loadScript");

beforeAll(() => {
  // components.js calls club()/jerseySVG()/formatMoney()/toast() from other
  // files, and toggleWishlistUI() relies on storage.js — load the same set
  // of scripts a real page would.
  loadScript("data.js");
  loadScript("jersey.js");
  loadScript("main.js");
  loadScript("storage.js");
  loadScript("components.js");
});

beforeEach(() => {
  window.localStorage.clear();
});

describe("lineTotal()", () => {
  const product = { price: 3500 };

  test("multiplies price by quantity when there is no customization", () => {
    const line = { qty: 2, customization: null };
    expect(lineTotal(line, product)).toBe(7000);
  });

  test("adds the customization fee per unit before multiplying by quantity", () => {
    const line = { qty: 2, customization: { name: "Faraz", number: "10", fee: 300 } };
    // (3500 + 300) * 2
    expect(lineTotal(line, product)).toBe(7600);
  });

  test("treats qty 1 as a simple price passthrough with no customization", () => {
    const line = { qty: 1, customization: null };
    expect(lineTotal(line, product)).toBe(3500);
  });
});

describe("isOutOfStockEverywhere()", () => {
  test("returns true when every size has 0 stock", () => {
    const product = { stock: { S: 0, M: 0, L: 0 } };
    expect(isOutOfStockEverywhere(product)).toBe(true);
  });

  test("returns false when at least one size is in stock", () => {
    const product = { stock: { S: 0, M: 4, L: 0 } };
    expect(isOutOfStockEverywhere(product)).toBe(false);
  });

  test("returns true for a product with no sizes at all", () => {
    const product = { stock: {} };
    expect(isOutOfStockEverywhere(product)).toBe(true);
  });
});

describe("SHIPPING_FLAT", () => {
  test("is a fixed flat rate of Tk 100", () => {
    expect(SHIPPING_FLAT).toBe(100);
  });
});

describe("starRow()", () => {
  test("renders 5 stars", () => {
    const html = starRow(3.6, 12);
    expect((html.match(/<svg/g) || []).length).toBe(5);
  });

  test("includes the review count when provided", () => {
    const html = starRow(4, 8);
    expect(html).toContain("(8)");
  });

  test("omits the count text when count is undefined", () => {
    const html = starRow(4, undefined);
    expect(html).not.toMatch(/\(\d+\)/);
  });
});
