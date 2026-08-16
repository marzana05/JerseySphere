const { loadScript } = require("./helpers/loadScript");

beforeAll(() => {
  loadScript("main.js");
});

describe("formatMoney()", () => {
  test("prefixes the amount with 'Tk '", () => {
    expect(formatMoney(1500)).toBe("Tk 1,500");
  });

  test("rounds decimal amounts to the nearest whole number", () => {
    expect(formatMoney(1499.5)).toBe("Tk 1,500");
    expect(formatMoney(1499.4)).toBe("Tk 1,499");
  });

  test("formats zero correctly", () => {
    expect(formatMoney(0)).toBe("Tk 0");
  });

  test("adds thousands separators for large totals", () => {
    expect(formatMoney(1234567)).toBe("Tk 1,234,567");
  });
});

describe("formatDate()", () => {
  test("formats a timestamp as 'Mon D, YYYY'", () => {
    const ts = new Date(2026, 4, 20).getTime(); // May 20, 2026
    expect(formatDate(ts)).toBe("May 20, 2026");
  });
});
