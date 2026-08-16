const { loadScript } = require("./helpers/loadScript");

beforeAll(() => {
  loadScript("auth.js");
});

describe("isValidPassword()", () => {
  test("accepts a password with 8+ chars, a digit, and a symbol", () => {
    expect(isValidPassword("Passw0rd!")).toBe(true);
  });

  test("rejects a password shorter than 8 characters", () => {
    expect(isValidPassword("Pw0!")).toBe(false);
  });

  test("rejects a password with no digit", () => {
    expect(isValidPassword("Password!")).toBe(false);
  });

  test("rejects a password with no symbol", () => {
    expect(isValidPassword("Password0")).toBe(false);
  });

  test("rejects a password that is letters only", () => {
    expect(isValidPassword("PasswordOnly")).toBe(false);
  });
});

describe("parseJwt()", () => {
  function makeFakeJwt(payload) {
    const header = Buffer.from(JSON.stringify({ alg: "none" })).toString("base64");
    const body = Buffer.from(JSON.stringify(payload)).toString("base64");
    return `${header}.${body}.signature`;
  }

  test("decodes the payload portion of a well-formed JWT", () => {
    const token = makeFakeJwt({ email: "kaisan@example.com", name: "Kaisan Faraz" });
    const payload = parseJwt(token);
    expect(payload.email).toBe("kaisan@example.com");
    expect(payload.name).toBe("Kaisan Faraz");
  });

  test("returns null for a malformed token instead of throwing", () => {
    expect(parseJwt("not-a-real-token")).toBeNull();
  });

  test("returns null for an empty string", () => {
    expect(parseJwt("")).toBeNull();
  });
});
