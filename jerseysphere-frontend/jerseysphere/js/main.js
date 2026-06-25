/* ===========================================================
   JerseySphere — shared chrome (header + footer) and site-wide wiring
   Every page has empty <div id="site-header"> and <div id="site-footer">
   placeholders; this file fills them in so markup isn't duplicated
   eight times across the site.
   =========================================================== */

const HEADER_HTML = `
<div class="bg-[#0A140F] text-[11px] tracking-[0.18em] uppercase text-[#9CA89E] border-b border-[#2A3B30]">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center gap-6 overflow-x-auto whitespace-nowrap">
    <span class="text-[#D9A441]">On the rail now</span>
    <span>La Liga</span><span class="opacity-40">/</span>
    <span>Premier League</span><span class="opacity-40">/</span>
    <span>UCL</span><span class="opacity-40">/</span>
    <span>MLS</span>
  </div>
</div>
<header class="sticky top-0 z-40 bg-[#0E1A14]/95 backdrop-blur border-b border-[#2A3B30]">
  <div class="max-w-7xl mx-auto px-4 sm:px-6">
    <div class="flex items-center justify-between h-16 gap-4">
      <a href="index.html" class="flex items-center gap-2 shrink-0">
        <span class="font-display text-xl sm:text-2xl text-[#F3EFE3] tracking-tight">JERSEY<span class="text-[#D9A441]">SPHERE</span></span>
      </a>

      <nav class="hidden lg:flex items-center gap-7 font-mono text-[12px] uppercase tracking-wide text-[#CBD3C9]" data-nav>
        <a href="index.html" data-page="index" class="nav-link">Home</a>
        <a href="shop.html" data-page="shop" class="nav-link">Shop</a>
        <a href="shop.html?type=retro" data-page="retro" class="nav-link">Retro kits</a>
        <a href="account.html?tab=wishlist" data-page="wishlist" class="nav-link">Wishlist</a>
      </nav>

      <form data-search-form class="hidden md:flex flex-1 max-w-xs relative">
        <input data-search-input type="search" autocomplete="off" placeholder="Search club, league, season…"
          class="w-full bg-[#16241C] border border-[#2A3B30] rounded-full py-2 pl-4 pr-9 text-sm text-[#F3EFE3] placeholder:text-[#6E7A70] focus:outline-none focus:ring-2 focus:ring-[#D9A441]" />
        <button type="submit" aria-label="Search" class="absolute right-2 top-1/2 -translate-y-1/2 text-[#9CA89E]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </button>
        <div data-search-suggest class="hidden absolute top-full mt-2 left-0 right-0 bg-[#16241C] border border-[#2A3B30] rounded-xl shadow-xl overflow-hidden z-50"></div>
      </form>

      <div class="flex items-center gap-4">
        <a href="account.html" class="hidden sm:inline-flex items-center gap-1.5 text-[#CBD3C9] hover:text-[#F3EFE3] text-sm font-mono" data-account-label>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>
          <span data-account-text>Account</span>
        </a>
        <a href="cart.html" class="relative text-[#CBD3C9] hover:text-[#F3EFE3]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>
          <span data-cart-count class="hidden absolute -top-2 -right-2 bg-[#D9A441] text-[#16130A] text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">0</span>
        </a>
        <button data-mobile-toggle class="lg:hidden text-[#F3EFE3]" aria-label="Open menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      </div>
    </div>
  </div>

  <div data-mobile-menu class="hidden lg:hidden border-t border-[#2A3B30] bg-[#0E1A14] px-4 sm:px-6 py-4 space-y-3">
    <form data-search-form-mobile class="flex relative mb-2">
      <input data-search-input type="search" autocomplete="off" placeholder="Search club, league, season…"
        class="w-full bg-[#16241C] border border-[#2A3B30] rounded-full py-2 pl-4 pr-9 text-sm text-[#F3EFE3] placeholder:text-[#6E7A70] focus:outline-none focus:ring-2 focus:ring-[#D9A441]" />
    </form>
    <a href="index.html" data-page="index" class="block nav-link-mobile">Home</a>
    <a href="shop.html" data-page="shop" class="block nav-link-mobile">Shop</a>
    <a href="shop.html?type=retro" data-page="retro" class="block nav-link-mobile">Retro kits</a>
    <a href="account.html?tab=wishlist" data-page="wishlist" class="block nav-link-mobile">Wishlist</a>
    <a href="account.html" data-page="account" class="block nav-link-mobile">Account</a>
  </div>
</header>
`;

const FOOTER_HTML = `
<footer class="bg-[#0A140F] border-t border-[#2A3B30] mt-20">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-2 sm:grid-cols-4 gap-8 text-sm">
    <div class="col-span-2 sm:col-span-1">
      <span class="font-display text-lg text-[#F3EFE3]">JERSEY<span class="text-[#D9A441]">SPHERE</span></span>
      <p class="text-[#8E9A90] mt-3 leading-relaxed">Club kits and retro jerseys, printed to order. A demo storefront — no real payments are processed.</p>
    </div>
    <div>
      <p class="font-mono text-[11px] uppercase tracking-wide text-[#D9A441] mb-3">Shop</p>
      <ul class="space-y-2 text-[#8E9A90]">
        <li><a href="shop.html" class="hover:text-[#F3EFE3]">All jerseys</a></li>
        <li><a href="shop.html?type=2026" class="hover:text-[#F3EFE3]">2026 club kits</a></li>
        <li><a href="shop.html?type=retro" class="hover:text-[#F3EFE3]">Retro kits</a></li>
      </ul>
    </div>
    <div>
      <p class="font-mono text-[11px] uppercase tracking-wide text-[#D9A441] mb-3">Leagues</p>
      <ul class="space-y-2 text-[#8E9A90]">
        <li><a href="shop.html?league=La%20Liga" class="hover:text-[#F3EFE3]">La Liga</a></li>
        <li><a href="shop.html?league=Premier%20League" class="hover:text-[#F3EFE3]">Premier League</a></li>
        <li><a href="shop.html?league=UCL" class="hover:text-[#F3EFE3]">UCL</a></li>
      </ul>
    </div>
    <div>
      <p class="font-mono text-[11px] uppercase tracking-wide text-[#D9A441] mb-3">Account</p>
      <ul class="space-y-2 text-[#8E9A90]">
        <li><a href="account.html" class="hover:text-[#F3EFE3]">Orders &amp; tracking</a></li>
        <li><a href="account.html?tab=wishlist" class="hover:text-[#F3EFE3]">Wishlist</a></li>
        <li><a href="login.html" class="hover:text-[#F3EFE3]">Log in</a></li>
      </ul>
    </div>
  </div>
  <div class="border-t border-[#2A3B30] py-5 text-center text-[11px] text-[#5F6B61] font-mono">© 2026 JerseySphere — demo build, not a real store</div>
</footer>
`;

function injectChrome() {
  const h = document.getElementById("site-header");
  const f = document.getElementById("site-footer");
  if (h) h.innerHTML = HEADER_HTML;
  if (f) f.innerHTML = FOOTER_HTML;
}

function wireMobileMenu() {
  const toggle = document.querySelector("[data-mobile-toggle]");
  const menu = document.querySelector("[data-mobile-menu]");
  if (!toggle || !menu) return;
  toggle.addEventListener("click", () => menu.classList.toggle("hidden"));
}

function markActiveNav() {
  const page = document.body.dataset.page;
  document.querySelectorAll("[data-page]").forEach((el) => {
    if (el.dataset.page === page) {
      el.classList.add("text-[#D9A441]");
    }
  });
}

function wireSearch() {
  document.querySelectorAll("[data-search-form], [data-search-form-mobile]").forEach((form) => {
    const input = form.querySelector("[data-search-input]");
    const suggest = form.querySelector("[data-search-suggest]");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const term = input.value.trim();
      if (!term) return;
      pushRecentSearch(term);
      window.location.href = "shop.html?search=" + encodeURIComponent(term);
    });

    if (!suggest) return;
    input.addEventListener("focus", () => renderSuggest());
    input.addEventListener("input", () => renderSuggest());
    document.addEventListener("click", (e) => {
      if (!form.contains(e.target)) suggest.classList.add("hidden");
    });

    function renderSuggest() {
      const recents = getRecentSearches();
      if (!recents.length) { suggest.classList.add("hidden"); return; }
      suggest.innerHTML = recents.map(
        (t) => `<button type="button" data-term="${t}" class="block w-full text-left px-4 py-2 text-sm text-[#CBD3C9] hover:bg-[#1E2F25]">${t}</button>`
      ).join("");
      suggest.classList.remove("hidden");
      suggest.querySelectorAll("button").forEach((b) => {
        b.addEventListener("click", () => { input.value = b.dataset.term; form.requestSubmit(); });
      });
    }
  });
}

function wireAccountLabel() {
  const user = currentUser();
  const label = document.querySelector("[data-account-text]");
  if (label) label.textContent = user ? user.firstName : "Account";
}

function toast(message) {
  let el = document.querySelector("[data-toast]");
  if (!el) {
    el = document.createElement("div");
    el.setAttribute("data-toast", "");
    el.className = "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1E2F25] border border-[#3A4F41] text-[#F3EFE3] text-sm px-4 py-3 rounded-xl shadow-2xl transition-opacity duration-300 opacity-0 pointer-events-none";
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.remove("opacity-0");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.add("opacity-0"), 2400);
}

function formatMoney(n) { return "Tk " + Math.round(n).toLocaleString(); }
function formatDate(ts) { return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }); }

document.addEventListener("DOMContentLoaded", () => {
  injectChrome();
  wireMobileMenu();
  markActiveNav();
  wireSearch();
  wireAccountLabel();
  updateCartBadge();
});
