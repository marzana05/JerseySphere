/* ===========================================================
   JerseySphere — account dashboard
   =========================================================== */

function activeTab() {
  return new URLSearchParams(window.location.search).get("tab") || "orders";
}

function renderAccountShell() {
  const user = currentUser();
  const root = document.getElementById("account-root");

  if (!user) {
    root.innerHTML = emptyState({
      title: "Log in to view your account",
      body: "Orders, tracking and your wishlist all live here once you're logged in.",
      ctaLabel: "Log in",
      ctaHref: "login.html",
    });
    return;
  }

  const tab = activeTab();
  root.innerHTML = `
  <div class="flex items-center justify-between mb-2">
    <div>
      <h1 class="font-display text-3xl text-ecru">Welcome, ${user.firstName}</h1>
      <p class="text-muted text-sm">${user.email}</p>
    </div>
    <button id="logout-btn" class="font-mono text-xs uppercase text-muted hover:text-retro">Log out</button>
  </div>

  ${!user.verified ? `
  <div class="bg-surface2 border border-gold/40 rounded-xl p-4 mt-5 flex items-center justify-between gap-4 flex-wrap">
    <p class="text-sm text-ecru">Please verify your email to fully activate your account.</p>
    <button id="verify-now" class="font-mono text-xs uppercase text-gold border border-gold rounded-full px-4 py-2 hover:bg-gold/10">Verify now</button>
  </div>` : ""}

  <div class="flex gap-6 border-b border-line mt-8 mb-8 font-mono text-xs uppercase">
    <button data-tab="orders" class="account-tab pb-3 ${tab === "orders" ? "text-gold border-b-2 border-gold" : "text-muted"}">Orders</button>
    <button data-tab="wishlist" class="account-tab pb-3 ${tab === "wishlist" ? "text-gold border-b-2 border-gold" : "text-muted"}">Wishlist</button>
    <button data-tab="profile" class="account-tab pb-3 ${tab === "profile" ? "text-gold border-b-2 border-gold" : "text-muted"}">Profile</button>
  </div>

  <div id="tab-content"></div>
  `;

  document.getElementById("logout-btn").addEventListener("click", () => { clearSession(); toast("Logged out"); window.location.href = "index.html"; });
  const verifyBtn = document.getElementById("verify-now");
  if (verifyBtn) verifyBtn.addEventListener("click", () => { verifyCurrentUserEmail(); toast("Email verified"); renderAccountShell(); });

  document.querySelectorAll(".account-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      history.replaceState(null, "", "account.html?tab=" + btn.dataset.tab);
      renderAccountShell();
    });
  });

  if (tab === "orders") renderOrdersTab(user);
  else if (tab === "wishlist") renderWishlistTab();
  else renderProfileTab(user);
}

function renderOrdersTab(user) {
  const orders = getOrdersForUser(user.id);
  const wrap = document.getElementById("tab-content");
  if (!orders.length) {
    wrap.innerHTML = emptyState({ title: "No orders yet", body: "Once you place an order it'll show up here with live tracking.", ctaLabel: "Shop jerseys", ctaHref: "shop.html" });
    return;
  }
  wrap.innerHTML = orders.map((o) => orderCardHTML(o)).join("");
  orders.forEach((o) => {
    const btn = document.querySelector(`[data-advance="${o.id}"]`);
    if (btn) btn.addEventListener("click", () => { advanceOrderStage(o.id); renderOrdersTab(user); });
  });
}

function orderCardHTML(order) {
  const shipped = order.stageIndex >= 2;
  return `
  <div class="bg-surface border border-line rounded-2xl p-5 mb-5">
    <div class="flex flex-wrap items-center justify-between gap-2 mb-4">
      <div>
        <p class="font-mono text-sm text-gold">${order.id}</p>
        <p class="text-xs text-muted">Placed ${formatDate(order.createdAt)} · Estimated delivery ${formatDate(order.eta)}</p>
      </div>
      <p class="font-mono text-sm text-ecru">${formatMoney(order.total)}</p>
    </div>

    <div class="flex items-center gap-1 mb-4">
      ${ORDER_STAGES.map((label, i) => `
        <div class="flex-1 flex flex-col items-center">
          <span class="w-3 h-3 rounded-full ${i <= order.stageIndex ? "bg-pitch" : "bg-line"}"></span>
          <span class="text-[10px] font-mono uppercase mt-1.5 text-center ${i <= order.stageIndex ? "text-ecru" : "text-muted"}">${label}</span>
        </div>
        ${i < ORDER_STAGES.length - 1 ? `<span class="flex-1 h-px ${i < order.stageIndex ? "bg-pitch" : "bg-line"} -mt-4"></span>` : ""}
      `).join("")}
    </div>

    ${shipped ? `<p class="text-xs text-muted mb-3">Tracking <span class="text-ecru font-mono">${order.tracking}</span> via ${order.courier}</p>` : ""}

    <div class="divide-y divide-line">
      ${order.items.map((line) => {
        const p = getProduct(line.productId);
        return `<div class="py-2 flex justify-between text-sm"><span class="text-ecru">${p.name} (${line.size}) × ${line.qty}</span><span class="font-mono text-muted">${formatMoney(lineTotal(line, p))}</span></div>`;
      }).join("")}
    </div>

    ${order.stageIndex < ORDER_STAGES.length - 1 ? `<button data-advance="${order.id}" class="mt-4 font-mono text-xs uppercase text-gold border border-gold rounded-full px-4 py-2 hover:bg-gold/10">Simulate next status update</button>` : `<p class="mt-4 text-xs text-pitch font-mono uppercase">Delivered</p>`}
  </div>`;
}

function renderWishlistTab() {
  const ids = getWishlist();
  const wrap = document.getElementById("tab-content");
  if (!ids.length) {
    wrap.innerHTML = emptyState({ title: "Your wishlist is empty", body: "Tap the heart on any jersey to save it here for later.", ctaLabel: "Shop jerseys", ctaHref: "shop.html" });
    return;
  }
  const products = ids.map(getProduct).filter(Boolean);
  wrap.innerHTML = `<div class="grid grid-cols-2 sm:grid-cols-4 gap-4">${products.map((p) => wishlistCardHTML(p)).join("")}</div>`;

  wrap.querySelectorAll("[data-quick-add]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const p = getProduct(btn.dataset.quickAdd);
      const size = SIZES.find((s) => (p.stock[s] || 0) > 0);
      if (!size) { toast("This jersey is currently out of stock"); return; }
      addToCart({ productId: p.id, size, qty: 1, customization: null });
      toast(`Added to cart in size ${size}`);
    });
  });
  wrap.querySelectorAll("[data-quick-remove]").forEach((btn) => {
    btn.addEventListener("click", (e) => { e.preventDefault(); toggleWishlist(btn.dataset.quickRemove); renderWishlistTab(); });
  });
}

function wishlistCardHTML(p) {
  const c = club(p.clubId);
  return `
  <div class="bg-surface border border-line rounded-2xl overflow-hidden relative">
    ${kitTag({ clubTag: c.tag, season: p.season, type: p.type })}
    <button data-quick-remove="${p.id}" class="absolute top-2 right-2 z-10 bg-night/70 rounded-full p-2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D9A441" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
    <a href="product.html?id=${p.id}" class="block aspect-square flex items-center justify-center bg-surface2/60 p-6">${jerseySVG({ primary: c.primary, secondary: c.secondary, retro: p.type === "retro", size: 110 })}</a>
    <div class="p-3 border-t border-line">
      <p class="text-xs text-ecru leading-snug">${p.name}</p>
      <p class="font-mono text-sm text-ecru mt-1">${formatMoney(p.price)}</p>
      <button data-quick-add="${p.id}" class="w-full mt-2 bg-gold text-[#16130A] font-mono text-[11px] uppercase px-3 py-2 rounded-full hover:opacity-90">Move to cart</button>
    </div>
  </div>`;
}

function renderProfileTab(user) {
  document.getElementById("tab-content").innerHTML = `
  <div class="bg-surface border border-line rounded-2xl p-6 max-w-md space-y-4">
    <div><p class="text-xs font-mono uppercase text-muted">First name</p><p class="text-ecru">${user.firstName}</p></div>
    <div><p class="text-xs font-mono uppercase text-muted">Last name</p><p class="text-ecru">${user.lastName}</p></div>
    <div><p class="text-xs font-mono uppercase text-muted">Email</p><p class="text-ecru">${user.email}</p></div>
    <div><p class="text-xs font-mono uppercase text-muted">Email status</p><p class="text-ecru">${user.verified ? "Verified" : "Not verified yet"}</p></div>
  </div>`;
}

document.addEventListener("DOMContentLoaded", renderAccountShell);
