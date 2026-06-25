/* ===========================================================
   JerseySphere — product detail page
   =========================================================== */

let unsavedCustomization = false;
let activeSize = null;
let reviewSort = "recent";

function getProductIdFromURL() {
  return new URLSearchParams(window.location.search).get("id");
}

function deliveryEstimateText() {
  return "Estimated delivery: 5–7 business days. Returns accepted within 14 days of delivery.";
}

function renderNotFound() {
  document.getElementById("product-root").innerHTML = emptyState({
    title: "We couldn't find that jersey",
    body: "It may have been removed, or the link is incorrect.",
    ctaLabel: "Back to shop",
    ctaHref: "shop.html",
  });
}

function renderProduct(product) {
  const c = club(product.clubId);
  const root = document.getElementById("product-root");

  root.innerHTML = `
  <p class="text-xs font-mono text-muted mb-6">
    <a href="shop.html" class="hover:text-gold">Shop</a> /
    <a href="shop.html?club=${c.id}" class="hover:text-gold">${c.name}</a> /
    <span class="text-ecru">${product.name}</span>
  </p>

  <div class="grid lg:grid-cols-2 gap-10">
    <!-- GALLERY -->
    <div>
      <div class="bg-surface border border-line rounded-2xl aspect-square flex items-center justify-center relative" data-gallery-main>
        ${kitTag({ clubTag: c.tag, season: product.season, type: product.type })}
      </div>
      <div class="flex gap-3 mt-3">
        <button data-gallery-tab="front" class="gallery-tab flex-1 border border-line rounded-lg py-2 text-xs font-mono uppercase text-ecru">Front</button>
        <button data-gallery-tab="back" class="gallery-tab flex-1 border border-line rounded-lg py-2 text-xs font-mono uppercase text-ecru">Back print</button>
        <button data-gallery-tab="badge" class="gallery-tab flex-1 border border-line rounded-lg py-2 text-xs font-mono uppercase text-ecru">Badge close-up</button>
      </div>
    </div>

    <!-- INFO -->
    <div>
      <div class="flex items-center gap-2 mb-3">
        <span class="font-mono text-[11px] uppercase px-2.5 py-1 rounded-full border ${product.type === "retro" ? "border-retro text-retro" : "border-pitch text-pitch"}">${product.type === "retro" ? "Retro · " + product.season : "2026 season"}</span>
        ${product.unisex ? `<span class="font-mono text-[11px] uppercase px-2.5 py-1 rounded-full border border-line text-muted">Unisex fit</span>` : ""}
      </div>
      <h1 class="font-display text-3xl sm:text-4xl text-ecru leading-tight">${product.name}</h1>
      <p class="font-mono text-sm text-gold mt-1">${c.name} · ${product.kit} kit</p>

      <div class="flex items-center gap-3 mt-3" id="rating-summary"></div>

      <p class="font-display text-3xl text-ecru mt-5" id="price-display">${formatMoney(product.price)}</p>
      <p class="text-muted text-sm mt-3 leading-relaxed max-w-md">${product.desc}</p>

      ${product.note ? `<div class="mt-4 bg-surface2 border border-line rounded-xl p-4">
        <p class="font-mono text-[11px] uppercase text-retro mb-1">From the archive</p>
        <p class="text-sm text-muted leading-relaxed">${product.note}</p>
      </div>` : ""}

      <p class="text-xs text-muted mt-4">${deliveryEstimateText()}</p>

      <!-- SIZE -->
      <div class="mt-6">
        <div class="flex items-center justify-between mb-2">
          <p class="font-mono text-xs uppercase text-muted">Size</p>
          <button data-open-size-guide class="font-mono text-xs uppercase text-gold hover:underline">Size guide</button>
        </div>
        <div class="flex flex-wrap gap-2" id="size-options"></div>
        <p id="notify-msg" class="text-xs text-pitch mt-2 hidden">We'll email you when this size is back in stock.</p>
      </div>

      <!-- CUSTOMIZE -->
      <div class="mt-6 bg-surface border border-line rounded-2xl p-4">
        <label class="flex items-center gap-2 text-sm text-ecru cursor-pointer">
          <input type="checkbox" id="customize-toggle" class="w-4 h-4 rounded border-line bg-surface2 text-gold focus:ring-gold" />
        Add a name and squad number (+৳300)
        </label>
        <div id="customize-fields" class="hidden mt-4 space-y-3">
          <div>
            <label class="block text-xs font-mono uppercase text-muted mb-1">Name on back (max 12 characters)</label>
            <input id="custom-name" maxlength="12" placeholder="e.g. RASHFORD" class="w-full bg-surface2 border border-line rounded-lg px-3 py-2 text-sm text-ecru uppercase focus:outline-none focus:ring-2 focus:ring-gold" />
          </div>
          <div>
            <label class="block text-xs font-mono uppercase text-muted mb-1">Squad number (1–99)</label>
            <input id="custom-number" type="number" min="1" max="99" placeholder="10" class="w-full bg-surface2 border border-line rounded-lg px-3 py-2 text-sm text-ecru focus:outline-none focus:ring-2 focus:ring-gold" />
          </div>
          <p class="text-xs text-retro leading-relaxed">Customized jerseys cannot be returned or exchanged once printed.</p>
        </div>
      </div>

      <!-- ADD TO CART -->
      <div class="flex items-center gap-3 mt-6">
        <button id="add-to-cart" class="flex-1 bg-gold text-[#16130A] font-mono text-sm uppercase tracking-wide px-6 py-3.5 rounded-full hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed">Add to cart</button>
        <span id="wishlist-slot"></span>
      </div>
      <p id="select-size-hint" class="text-xs text-retro mt-2 hidden">Choose a size first.</p>
    </div>
  </div>

  <!-- RELATED -->
  <section class="mt-16">
    <h2 class="font-display text-2xl text-ecru mb-5">You may also like</h2>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4" id="related-grid"></div>
  </section>

  <!-- REVIEWS -->
  <section class="mt-16 max-w-3xl">
    <div class="flex items-center justify-between mb-1">
      <h2 class="font-display text-2xl text-ecru">Ratings &amp; reviews</h2>
    </div>
    <div class="flex items-center gap-3 mb-6" id="review-summary"></div>

    <div class="flex items-center justify-between mb-4">
      <p class="font-mono text-xs uppercase text-muted" id="review-count-label"></p>
      <select id="review-sort" class="bg-surface border border-line rounded-full px-3 py-1.5 text-xs font-mono text-ecru focus:outline-none focus:ring-2 focus:ring-gold">
        <option value="recent">Most recent</option>
        <option value="high">Highest rated</option>
        <option value="low">Lowest rated</option>
      </select>
    </div>

    <div id="review-list" class="space-y-4 mb-8"></div>

    <div class="bg-surface border border-line rounded-2xl p-5">
      <p class="font-mono text-xs uppercase text-gold mb-3">Write a review</p>
      <div class="flex gap-1 mb-3" id="review-star-input"></div>
      <input id="review-title" maxlength="80" placeholder="Review title" class="w-full bg-surface2 border border-line rounded-lg px-3 py-2 text-sm text-ecru mb-3 focus:outline-none focus:ring-2 focus:ring-gold" />
      <textarea id="review-body" rows="3" maxlength="500" placeholder="Share your experience (20–500 characters)" class="w-full bg-surface2 border border-line rounded-lg px-3 py-2 text-sm text-ecru focus:outline-none focus:ring-2 focus:ring-gold"></textarea>
      <p class="text-[11px] text-muted mt-1" id="review-char-count">0 / 500</p>
      <button id="submit-review" class="mt-3 bg-gold text-[#16130A] font-mono text-xs uppercase tracking-wide px-5 py-2.5 rounded-full hover:opacity-90">Submit review</button>
    </div>
  </section>
  `;

  wireGallery(product, c);
  renderSizeOptions(product);
  wireCustomizer(product);
  wireAddToCart(product);
  document.getElementById("wishlist-slot").innerHTML = heartButton(product.id, true);
  wireSizeGuideModal();
  renderRelated(product);
  wireReviews(product);
}

/* ---------- Gallery ---------- */
function wireGallery(product, c) {
  const tabs = document.querySelectorAll("[data-gallery-tab]");
  function draw(tab) {
    const main = document.querySelector("[data-gallery-main]");
    const tagHTML = kitTag({ clubTag: c.tag, season: product.season, type: product.type });
    if (tab === "front") {
  main.innerHTML = tagHTML + (product.image
    ? `<img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover rounded-2xl" />`
    : jerseySVG({ primary: c.primary, secondary: c.secondary, retro: product.type === "retro", size: 260 }));
} else if (tab === "back") {
      const name = document.getElementById("custom-name")?.value || "";
      const number = document.getElementById("custom-number")?.value || "";
      main.innerHTML = tagHTML + jerseySVG({ primary: c.primary, secondary: c.secondary, retro: product.type === "retro", name, number, size: 260 });
    } else {
      main.innerHTML = tagHTML + `
        <div class="flex flex-col items-center gap-3">
          <span class="w-32 h-32 rounded-full border-4" style="background:${c.primary};border-color:${c.secondary}"></span>
          <p class="font-mono text-sm text-ecru">${c.tag} · ${product.season}</p>
        </div>`;
    }
    tabs.forEach((t) => t.classList.toggle("border-gold", t.dataset.galleryTab === tab));
    tabs.forEach((t) => t.classList.toggle("text-gold", t.dataset.galleryTab === tab));
  }
  tabs.forEach((t) => t.addEventListener("click", () => draw(t.dataset.galleryTab)));
  draw("front");
  window._redrawGalleryBack = () => { if (document.querySelector(".gallery-tab.text-gold")?.dataset.galleryTab === "back") draw("back"); };
}

/* ---------- Size selector ---------- */
function renderSizeOptions(product) {
  const wrap = document.getElementById("size-options");
  wrap.innerHTML = SIZES.map((s) => {
    const stock = product.stock[s] ?? 0;
    const out = stock === 0;
    return `<button data-size="${s}" data-out="${out}" class="size-btn border rounded-lg px-3.5 py-2 text-sm font-mono ${out ? "border-line text-muted/60 cursor-pointer" : "border-line text-ecru hover:border-gold"}">${s}${out ? " ·" : ""}</button>`;
  }).join("");

  wrap.querySelectorAll(".size-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const out = btn.dataset.out === "true";
      const notify = document.getElementById("notify-msg");
      if (out) {
        notify.classList.remove("hidden");
        toast("We'll notify you by email when " + btn.dataset.size + " is restocked");
        return;
      }
      notify.classList.add("hidden");
      activeSize = btn.dataset.size;
      wrap.querySelectorAll(".size-btn").forEach((b) => b.classList.remove("border-gold", "text-gold"));
      btn.classList.add("border-gold", "text-gold");
      document.getElementById("select-size-hint").classList.add("hidden");
    });
  });
}

/* ---------- Customizer ---------- */
function wireCustomizer(product) {
  const toggle = document.getElementById("customize-toggle");
  const fields = document.getElementById("customize-fields");
  const price = document.getElementById("price-display");
  const nameInput = document.getElementById("custom-name");
  const numberInput = document.getElementById("custom-number");

  toggle.addEventListener("change", () => {
    fields.classList.toggle("hidden", !toggle.checked);
    price.textContent = formatMoney(product.price + (toggle.checked ? 300 : 0));
    updateUnsavedFlag();
  });

  [nameInput, numberInput].forEach((input) => {
    input.addEventListener("input", () => {
      updateUnsavedFlag();
      window._redrawGalleryBack && window._redrawGalleryBack();
    });
  });

  function updateUnsavedFlag() {
    unsavedCustomization = toggle.checked && (nameInput.value.trim() || numberInput.value.trim());
  }
}

window.addEventListener("beforeunload", (e) => {
  if (unsavedCustomization) {
    e.preventDefault();
    e.returnValue = "";
  }
});

/* ---------- Add to cart ---------- */
function wireAddToCart(product) {
  const btn = document.getElementById("add-to-cart");
  if (isOutOfStockEverywhere(product)) {
    btn.disabled = true;
    btn.textContent = "Out of stock";
    return;
  }
  btn.addEventListener("click", () => {
    if (!activeSize) {
      document.getElementById("select-size-hint").classList.remove("hidden");
      return;
    }
    const toggle = document.getElementById("customize-toggle");
    const customization = toggle.checked
      ? { name: document.getElementById("custom-name").value.trim().toUpperCase(), number: document.getElementById("custom-number").value.trim(), fee: 300 }
      : null;
    addToCart({ productId: product.id, size: activeSize, qty: 1, customization });
    unsavedCustomization = false;
    toast("Added to cart");
  });
}

/* ---------- Size guide modal ---------- */
const SIZE_TABLE = {
  XS: { chestCm: 86, chestIn: 34, lenCm: 66, lenIn: 26, shCm: 42, shIn: 16.5 },
  S: { chestCm: 91, chestIn: 36, lenCm: 68, lenIn: 27, shCm: 44, shIn: 17.3 },
  M: { chestCm: 97, chestIn: 38, lenCm: 70, lenIn: 27.5, shCm: 46, shIn: 18.1 },
  L: { chestCm: 102, chestIn: 40, lenCm: 72, lenIn: 28.3, shCm: 48, shIn: 18.9 },
  XL: { chestCm: 109, chestIn: 43, lenCm: 74, lenIn: 29.1, shCm: 50, shIn: 19.7 },
  "2XL": { chestCm: 117, chestIn: 46, lenCm: 76, lenIn: 29.9, shCm: 52, shIn: 20.5 },
  "3XL": { chestCm: 124, chestIn: 49, lenCm: 78, lenIn: 30.7, shCm: 54, shIn: 21.3 },
};
function wireSizeGuideModal() {
  document.getElementById("size-guide-rows").innerHTML = SIZES.map((s) => {
    const r = SIZE_TABLE[s];
    return `<tr class="border-b border-line/60"><td class="py-2 pr-3 font-mono">${s}</td><td class="py-2 pr-3">${r.chestCm} / ${r.chestIn}</td><td class="py-2 pr-3">${r.lenCm} / ${r.lenIn}</td><td class="py-2">${r.shCm} / ${r.shIn}</td></tr>`;
  }).join("");

  const modal = document.querySelector("[data-size-modal]");
  document.querySelector("[data-open-size-guide]").addEventListener("click", () => modal.classList.remove("hidden"));
  document.querySelector("[data-size-modal-close]").addEventListener("click", () => modal.classList.add("hidden"));
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.add("hidden"); });
}

/* ---------- Related products ---------- */
function renderRelated(product) {
  let related = PRODUCTS.filter((p) => p.id !== product.id && p.clubId === product.clubId);
  if (related.length < 4) {
    related = related.concat(PRODUCTS.filter((p) => p.id !== product.id && !related.includes(p) && p.league.some((l) => product.league.includes(l))));
  }
  document.getElementById("related-grid").innerHTML = related.slice(0, 4).map(productCardHTML).join("");
}

/* ---------- Reviews ---------- */
let draftRating = 5;

function wireReviews(product) {
  document.getElementById("rating-summary").innerHTML = ratingSummaryHTML(product);
  renderReviewsBlock(product);

  document.getElementById("review-sort").addEventListener("change", (e) => {
    reviewSort = e.target.value;
    renderReviewsBlock(product);
  });

  drawStarInput();
  document.getElementById("review-body").addEventListener("input", (e) => {
    document.getElementById("review-char-count").textContent = `${e.target.value.length} / 500`;
  });

  document.getElementById("submit-review").addEventListener("click", () => {
    const title = document.getElementById("review-title").value.trim();
    const body = document.getElementById("review-body").value.trim();
    if (body.length < 20) { toast("Reviews need at least 20 characters"); return; }
    const user = currentUser();
    addReview(product.id, {
      name: user ? user.firstName + " " + user.lastName[0] + "." : "Guest reviewer",
      rating: draftRating,
      title: title || "No title",
      body,
      verified: user ? userHasDelivered(user.id, product.id) : false,
      date: new Date().toISOString(),
      userId: user ? user.id : null,
    });
    document.getElementById("review-title").value = "";
    document.getElementById("review-body").value = "";
    document.getElementById("review-char-count").textContent = "0 / 500";
    toast("Review submitted — it will appear after a quick moderation check");
    renderReviewsBlock(product);
  });
}

function ratingSummaryHTML(product) {
  const userReviews = getUserReviews()[product.id] || [];
  const totalCount = product.reviewCount + userReviews.length;
  const totalScore = product.rating * product.reviewCount + userReviews.reduce((s, r) => s + r.rating, 0);
  const avg = totalCount ? totalScore / totalCount : 0;
  return `${starRow(avg)}<span class="font-mono text-sm text-ecru">${avg.toFixed(1)}</span><span class="text-xs text-muted">(${totalCount} reviews)</span>`;
}

function drawStarInput() {
  const wrap = document.getElementById("review-star-input");
  function draw() {
    wrap.innerHTML = [1, 2, 3, 4, 5].map((i) => `
      <button type="button" data-star="${i}" class="p-0.5">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="${i <= draftRating ? "#D9A441" : "none"}" stroke="#D9A441" stroke-width="1.5"><polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9"/></svg>
      </button>`).join("");
    wrap.querySelectorAll("[data-star]").forEach((b) => b.addEventListener("click", () => { draftRating = +b.dataset.star; draw(); }));
  }
  draw();
}

function renderReviewsBlock(product) {
  let list = getReviewsFor(product.id).slice();
  if (reviewSort === "high") list.sort((a, b) => b.rating - a.rating);
  else if (reviewSort === "low") list.sort((a, b) => a.rating - b.rating);
  else list.sort((a, b) => new Date(b.date) - new Date(a.date));

  document.getElementById("review-count-label").textContent = `${list.length} review${list.length === 1 ? "" : "s"}`;
  const session = getSession();

  document.getElementById("review-list").innerHTML = list.length
    ? list.map((r) => `
      <div class="bg-surface border border-line rounded-xl p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-sm text-ecru font-medium">${r.name}</span>
            ${r.verified ? `<span class="font-mono text-[10px] uppercase text-pitch border border-pitch/40 rounded-full px-2 py-0.5">Verified purchase</span>` : ""}
          </div>
          <span class="text-[11px] text-muted">${formatDate(new Date(r.date).getTime())}</span>
        </div>
        <div class="mt-1">${starRow(r.rating)}</div>
        <p class="text-sm text-ecru mt-2 font-medium">${r.title}</p>
        <p class="text-sm text-muted mt-1 leading-relaxed">${r.body}</p>
        ${r.userId && r.userId === session ? `<button data-delete-review="${r.date}" class="text-[11px] font-mono uppercase text-retro mt-2 hover:underline">Delete review</button>` : ""}
      </div>`).join("")
    : `<p class="text-sm text-muted">No reviews yet — be the first to share your experience.</p>`;

  document.querySelectorAll("[data-delete-review]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const all = getUserReviews();
      all[product.id] = (all[product.id] || []).filter((r) => r.date !== btn.dataset.deleteReview);
      writeStore(STORE_KEYS.REVIEWS, all);
      renderReviewsBlock(product);
      document.getElementById("rating-summary").innerHTML = ratingSummaryHTML(product);
    });
  });
}

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const product = getProduct(getProductIdFromURL());
  if (!product) { renderNotFound(); return; }
  document.title = product.name + " — JerseySphere";
  renderProduct(product);
});
