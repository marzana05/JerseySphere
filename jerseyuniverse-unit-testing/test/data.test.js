const { loadScript } = require("./helpers/loadScript");

beforeAll(() => {
  loadScript("data.js");
});

describe("club()", () => {
  test("finds a club by id", () => {
    expect(club("real-madrid").name).toBe("Real Madrid");
    expect(club("barcelona").tag).toBe("FCB");
  });

  test("returns undefined for an unknown club id", () => {
    expect(club("not-a-real-club")).toBeUndefined();
  });
});

describe("mapWordPressProduct()", () => {
  const wpItem = {
    slug: "real-madrid-2026-home",
    club: "real-madrid",
    title: { rendered: "Real Madrid 2026 Home Kit" },
    league: "La Liga, UCL",
    season: "2026/27",
    type: "2026",
    kit: "Home",
    price: "3500",
    customization_fee: "300",
    desc: "Official-style home kit.",
    front_image: "https://jerseyuniverse.shop/img/front.jpg",
    back_image: "https://jerseyuniverse.shop/img/back.jpg",
    closeup_image: "https://jerseyuniverse.shop/img/closeup.jpg",
    stock: { XS: "3", S: "10", M: "22", L: "0", XL: "5", "2XL": "", "3XL": "1" },
  };

  test("maps core WordPress fields to the shape the frontend expects", () => {
    const p = mapWordPressProduct(wpItem);
    expect(p.id).toBe("real-madrid-2026-home");
    expect(p.clubId).toBe("real-madrid");
    expect(p.name).toBe("Real Madrid 2026 Home Kit");
    expect(p.price).toBe(3500);
    expect(p.customizationFee).toBe(300);
  });

  test("splits the comma-separated league string into an array", () => {
    const p = mapWordPressProduct(wpItem);
    expect(p.league).toEqual(["La Liga", "UCL"]);
  });

  test("returns an empty league array when league is missing", () => {
    const p = mapWordPressProduct({ ...wpItem, league: "" });
    expect(p.league).toEqual([]);
  });

  test("converts every size's stock string to a number, defaulting missing/blank values to 0", () => {
    const p = mapWordPressProduct(wpItem);
    expect(p.stock).toEqual({ XS: 3, S: 10, M: 22, L: 0, XL: 5, "2XL": 0, "3XL": 1 });
  });

  test("defaults customizationFee to 300 when WordPress doesn't provide one", () => {
    const { customization_fee, ...rest } = wpItem;
    const p = mapWordPressProduct(rest);
    expect(p.customizationFee).toBe(300);
  });

  test("defaults price to 0 when WordPress sends a non-numeric price", () => {
    const p = mapWordPressProduct({ ...wpItem, price: "not-a-number" });
    expect(p.price).toBe(0);
  });

  test("maps front/back/closeup images, falling back to null when absent", () => {
    const p = mapWordPressProduct(wpItem);
    expect(p.image).toBe(wpItem.front_image);
    expect(p.backImage).toBe(wpItem.back_image);
    expect(p.closeupImage).toBe(wpItem.closeup_image);

    const { front_image, back_image, closeup_image, ...rest } = wpItem;
    const p2 = mapWordPressProduct(rest);
    expect(p2.image).toBeNull();
    expect(p2.backImage).toBeNull();
    expect(p2.closeupImage).toBeNull();
  });
});
