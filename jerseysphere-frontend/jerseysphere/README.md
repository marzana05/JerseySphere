# JerseySphere — frontend demo

A complete, multi-page front end for a club-kit and retro-jersey store, built with
plain HTML, Tailwind CSS (via CDN) and vanilla JavaScript. No build step, no
framework, no server required.

## How to run it

1. Unzip the folder.
2. Double-click `index.html` (or open it from your browser with `File > Open`).
3. You need an internet connection the first time each page loads, because
   Tailwind, Google Fonts and the icon strokes are pulled from a CDN. Once
   loaded, everything else (cart, wishlist, login, orders) works fully offline
   using your browser's local storage.

There is nothing to `npm install` and no dev server to start.

## What's in here

```
index.html        Home page — hero, leagues, clubs, 2026 vs retro, featured kits
shop.html         Full catalog with filters, search results and sorting
product.html      Product detail — gallery, size guide, customizer, reviews
cart.html         Cart with quantity controls and order summary
checkout.html     3-step checkout (shipping → payment → review) + confirmation
login.html        Login form (+ a demo "Continue with Google" button)
register.html     Registration form with a simulated email-verification step
account.html      Dashboard: orders & tracking, wishlist, profile
css/style.css     The handful of styles Tailwind utilities can't express
js/data.js        Mock product, club and review data
js/storage.js     localStorage helpers (cart, wishlist, accounts, orders)
js/jersey.js      The generic jersey illustration used on every card
js/components.js  Shared product card / rating / empty-state markup
js/main.js        Shared header, footer, mobile menu, search, toasts
js/shop.js        Shop page filtering, sorting, active-filter tags
js/product.js     Product page logic (size guide, customizer, reviews)
js/cart.js        Cart logic
js/checkout.js    Checkout step flow + order placement
js/auth.js        Login / register logic
js/account.js     Orders, tracking timeline, wishlist, profile tabs
```

## What's real vs simulated

This is a front-end-only build, so a few things are intentionally mocked:

- **Accounts, cart, wishlist and orders** are stored in your browser's
  `localStorage`, not a real database. Clearing your browser data resets them.
- **"Continue with Google"** is a placeholder button — there's no real OAuth
  connection here. Wiring up real Google sign-in needs a backend.
- **Email verification** can't send a real email from a static site, so
  registration shows a "simulate clicking the verification link" button
  instead of an actual email.
- **Payments** (card, bKash, Nagad, COD) are UI only — no real transaction is
  processed.
- **Order tracking** has a "simulate next status update" button on each order
  so you can see the tracking timeline move through its stages, since there's
  no real courier feeding it live updates.

## Hooking up a real backend later

Every place that currently reads/writes `localStorage` (in `js/storage.js`) is
where you'd swap in real API calls — `placeOrder()`, `registerUser()`,
`addToCart()` and so on are already isolated in one file, so a backend
integration mainly means rewriting that file rather than touching every page.

## Customizing the look

Colors and fonts are defined once per page in the `tailwind.config` script
block in each HTML file's `<head>`, and in `css/style.css`. Change the hex
values there to retheme the whole site.
