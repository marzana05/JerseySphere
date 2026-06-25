/* ===========================================================
   JerseySphere — shared UI components
   =========================================================== */

function starRow(rating, count) {
  const full = Math.round(rating);
  let stars = "";
  for (let i = 1; i <= 5; i++) {
    stars += `<svg width="13" height="13" viewBox="0 0 24 24" fill="${i <= full ? "#D9A441" : "none"}" stroke="#D9A441" stroke-width="1.5"><polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9"/></svg>`;
  }
  return `<span class="inline-flex items-center gap-1">${stars}${count !== undefined ? `<span class="text-[11px] text-muted ml-1">(${count})</span>` : ""}</span>`;
}

function isOutOfStockEverywhere(product) {
  return Object.values(product.stock).every((n) => n === 0);
}

function toggleWishlistUI(productId, btn) {
  const now = toggleWishlist(productId);
  btn.querySelector("svg").setAttribute("fill", now ? "#D9A441" : "none");
  toast(now ? "Added to wishlist" : "Removed from wishlist");
}

function heartButton(productId, inline) {
  const active = isWishlisted(productId);
  if (inline) {
    return `
    <button type="button" onclick="toggleWishlistUI('${productId}', this)"
      class="border border-line rounded-full p-3.5 hover:border-gold shrink-0">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="${active ? "#D9A441" : "none"}" stroke="#D9A441" stroke-width="1.8">
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>
      </svg>
    </button>`;
  }
  return `
  <button type="button" onclick="event.preventDefault(); toggleWishlistUI('${productId}', this)"
    class="absolute top-2 right-2 z-10 bg-night/70 backdrop-blur rounded-full p-2 hover:bg-night">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="${active ? "#D9A441" : "none"}" stroke="#D9A441" stroke-width="1.8">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>
    </svg>
  </button>`;
}

function productCardHTML(product) {
  const c = club(product.clubId);
  const outOfStock = isOutOfStockEverywhere(product);
  return `
  <a href="product.html?id=${product.id}" class="group block bg-surface border border-line rounded-2xl overflow-hidden card-lift relative">
    ${kitTag({ clubTag: c.tag, season: product.season, type: product.type })}
    ${heartButton(product.id)}
    <div class="aspect-square flex items-center justify-center bg-surface2/60 p-6">
  ${product.image
    ? `<img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover rounded-xl" />`
    : jerseySVG({ primary: c.primary, secondary: c.secondary, retro: product.type === "retro", size: 140 })}
</div>
    <div class="p-4 border-t border-line">
      <p class="font-mono text-[10px] uppercase tracking-wide text-gold">${c.name}</p>
      <h3 class="text-sm text-ecru mt-1 leading-snug">${product.name}</h3>
      <div class="flex items-center justify-between mt-2">
        <span class="font-mono text-sm text-ecru">${formatMoney(product.price)}</span>
        ${starRow(product.rating, product.reviewCount)}
      </div>
      ${outOfStock ? `<p class="text-[11px] text-retro mt-2 font-mono uppercase">Out of stock</p>` : ""}
    </div>
  </a>`;
}

const SHIPPING_FLAT = 100;

function lineTotal(line, product) {
  const fee = line.customization ? line.customization.fee : 0;
  return (product.price + fee) * line.qty;
}

function emptyState({ title, body, ctaLabel, ctaHref }) {
  return `
  <div class="text-center py-20 px-4">
    <p class="font-display text-2xl text-ecru mb-2">${title}</p>
    <p class="text-muted max-w-md mx-auto mb-6">${body}</p>
    ${ctaLabel ? `<a href="${ctaHref}" class="inline-block bg-gold text-[#16130A] font-mono text-sm uppercase tracking-wide px-5 py-2.5 rounded-full hover:opacity-90">${ctaLabel}</a>` : ""}
  </div>`;
}
