# Jersey Universe — Unit Tests

Unit tests for the pure logic in the Jersey Universe frontend, using **Jest**
+ **jsdom**. Your real source files are never modified or copied — the test
suite loads them straight out of `jerseyuniverse_frontend/js/` at run time,
the same way a `<script>` tag would in a browser.

## What's covered (82 tests)

| File           | What's tested |
|----------------|---------------|
| `storage.js`   | cart (add/remove/qty/merge/count), wishlist toggle, recent searches, register/login (mocked WordPress API), order placement incl. the offline fallback, order stage progression, delivered-product check, reviews |
| `components.js`| `lineTotal()` price math, `isOutOfStockEverywhere()`, `SHIPPING_FLAT`, `starRow()` |
| `data.js`      | `club()` lookup, `mapWordPressProduct()` — the WordPress REST → frontend product mapping (stock parsing, league split, image fallbacks, price/fee defaults) |
| `jersey.js`    | `jerseySVG()` markup/sizing/truncation, `kitTag()` retro vs. season label |
| `main.js`      | `formatMoney()`, `formatDate()` |
| `auth.js`      | `isValidPassword()` rules, `parseJwt()` Google token decoding |

Things like `renderCart()`, `renderProduct()`, `wireLoginForm()`, etc. are
DOM-wiring/rendering functions, not logic — they're intentionally left out
here since testing them meaningfully needs a different approach (DOM
snapshot or e2e testing, e.g. Playwright against the live/staging site).
Happy to add that layer too if you want it.

## How it works

`test/helpers/loadScript.js` reads a given `.js` file from
`jerseyuniverse_frontend/js/` and runs it via **indirect eval**, which
executes in the same global scope Jest's jsdom environment provides —
so `function`s the file declares (and top-level `const`/`let`, exposed by a
small helper) become directly callable in the test, exactly like they'd be
callable from any other `<script>` on the same page.

No `module.exports` was added to your source files — this was a deliberate
choice so nothing about how the site runs in the browser or on WordPress
changes.

## Running the tests

```bash
npm install
npm test
```

## Notes

- `storage.js` tests mock `window.fetch`, so no real network calls hit
  `jerseyuniverse.shop` — safe to run anytime, doesn't touch your live data.
- The few `console.error(...)` lines you'll see during the run are your own
  code logging the WordPress-unreachable fallback path in `placeOrder()` —
  that's the test *intentionally* simulating a network failure, not a
  failure of the test itself.
- Code-coverage tooling (istanbul) can't instrument code loaded via `eval`,
  so `--coverage` won't produce a useful report here — that's a limitation
  of testing script-tag-style code, not of the tests.
