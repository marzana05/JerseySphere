const { loadScript } = require("./helpers/loadScript");

beforeAll(() => {
  loadScript("jersey.js");
});

describe("jerseySVG()", () => {
  test("returns an <svg> element sized to the given size", () => {
    const svg = jerseySVG({ primary: "#111111", secondary: "#222222", size: 100 });
    expect(svg).toContain("<svg");
    expect(svg).toContain('width="100"');
    const height = parseFloat(svg.match(/height="([\d.]+)"/)[1]);
    expect(height).toBeCloseTo(100 * 1.1, 5); // size * 1.1
  });

  test("defaults to size 240 when no size is given", () => {
    const svg = jerseySVG({});
    expect(svg).toContain('width="240"');
    const height = parseFloat(svg.match(/height="([\d.]+)"/)[1]);
    expect(height).toBeCloseTo(240 * 1.1, 5);
  });

  test("uppercases and prints the customization name and number when provided", () => {
    const svg = jerseySVG({ name: "faraz", number: "10" });
    expect(svg).toContain("FARAZ");
    expect(svg).toContain(">10<");
  });

  test("omits the print text block entirely when no name or number is given", () => {
    const svg = jerseySVG({});
    expect(svg).not.toContain("<text");
  });

  test("truncates an overly long customization name to 12 characters", () => {
    const svg = jerseySVG({ name: "ThisNameIsWayTooLongForAJersey" });
    expect(svg).toContain("THISNAMEISWA"); // first 12 chars, uppercased
    expect(svg).not.toContain("THISNAMEISWAYTOO");
  });

  test("truncates the customization number to 2 characters", () => {
    const svg = jerseySVG({ number: "12345" });
    expect(svg).toContain(">12<");
  });

  test("draws the retro pinstripe line only when retro is true", () => {
    const retro = jerseySVG({ retro: true });
    const notRetro = jerseySVG({ retro: false });
    expect(retro).toContain('x1="58" y1="40"');
    expect(notRetro).not.toContain('x1="58" y1="40"');
  });

  test("uses the given primary/secondary colors in the fill and stroke", () => {
    const svg = jerseySVG({ primary: "#A50044", secondary: "#004D98" });
    expect(svg).toContain('fill="#A50044"');
    expect(svg).toContain('stroke="#004D98"');
  });
});

describe("kitTag()", () => {
  test("shows RETRO for retro-type products regardless of season", () => {
    const html = kitTag({ clubTag: "RMA", season: "2026", type: "retro" });
    expect(html).toContain("RMA");
    expect(html).toContain("RETRO");
    expect(html).not.toContain("2026");
  });

  test("shows the season for non-retro products", () => {
    const html = kitTag({ clubTag: "FCB", season: "2026", type: "2026" });
    expect(html).toContain("FCB");
    expect(html).toContain("2026");
  });
});
