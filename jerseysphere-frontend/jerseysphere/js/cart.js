/* ===========================================================
   JerseySphere — cart page logic
   =========================================================== */

function renderCart() {
  const cart = getCart();
  const wrap = document.getElementById("cart-lines");
  const checkoutLink = document.getElementById("checkout-link");

  if (!cart.length) {
    wrap.innerHTML = emptyState({
      title: "Your cart is empty",
      body: "Browse the shop and add a jersey to get started.",
      ctaLabel: "Shop jerseys",
      ctaHref: "shop.html",
    });
    document.getElementById("sum-subtotal").textContent = formatMoney(0);
    document.getElementById("sum-shipping").textContent = formatMoney(0);
    document.getElementById("sum-total").textContent = formatMoney(0);
    checkoutLink.classList.add("opacity-40", "pointer-events-none");
    return;
  }
  checkoutLink.classList.remove("opacity-40", "pointer-events-none");

  wrap.innerHTML = cart.map((line, i) => {
    const product = getProduct(line.productId);
    const c = club(product.clubId);
    return `
    <div class="bg-surface border border-line rounded-2xl p-4 flex gap-4">
      <div class="w-20 h-20 sm:w-24 sm:h-24 bg-surface2 rounded-xl flex items-center justify-center shrink-0">
        ${jerseySVG({ primary: c.primary, secondary: c.secondary, retro: product.type === "retro", name: line.customization?.name, number: line.customization?.number, size: 70 })}
      </div>
      <div class="flex-1 min-w-0">
        <p class="font-mono text-[10px] uppercase text-gold">${c.name}</p>
        <p class="text-sm text-ecru leading-snug">${product.name}</p>
        <p class="text-xs text-muted mt-1">Size ${line.size}${line.customization ? ` · ${line.customization.name} #${line.customization.number}` : ""}</p>
        <div class="flex items-center gap-3 mt-3">
          <div class="flex items-center border border-line rounded-full">
            <button data-qty-down="${i}" class="px-2.5 py-1 text-ecru">−</button>
            <span class="px-2 text-sm font-mono text-ecru">${line.qty}</span>
            <button data-qty-up="${i}" class="px-2.5 py-1 text-ecru">+</button>
          </div>
          <button data-remove="${i}" class="text-xs font-mono uppercase text-retro hover:underline">Remove</button>
        </div>
      </div>
      <p class="font-mono text-sm text-ecru shrink-0">${formatMoney(lineTotal(line, product))}</p>
    </div>`;
  }).join("");

  wrap.querySelectorAll("[data-qty-up]").forEach((b) => b.addEventListener("click", () => { updateCartQty(+b.dataset.qtyUp, getCart()[+b.dataset.qtyUp].qty + 1); renderCart(); }));
  wrap.querySelectorAll("[data-qty-down]").forEach((b) => b.addEventListener("click", () => {
    const idx = +b.dataset.qtyDown;
    const newQty = getCart()[idx].qty - 1;
    if (newQty < 1) { removeCartLine(idx); } else { updateCartQty(idx, newQty); }
    renderCart();
  }));
  wrap.querySelectorAll("[data-remove]").forEach((b) => b.addEventListener("click", () => { removeCartLine(+b.dataset.remove); renderCart(); toast("Removed from cart"); }));

  const subtotal = cart.reduce((s, line) => s + lineTotal(line, getProduct(line.productId)), 0);
  const shipping = SHIPPING_FLAT;
  document.getElementById("sum-subtotal").textContent = formatMoney(subtotal);
  document.getElementById("sum-shipping").textContent = formatMoney(shipping);
  document.getElementById("sum-total").textContent = formatMoney(subtotal + shipping);
}

document.addEventListener("DOMContentLoaded", renderCart);
