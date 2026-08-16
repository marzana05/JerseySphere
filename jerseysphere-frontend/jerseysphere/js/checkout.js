/* ===========================================================
   Jersey Universe — checkout logic
   =========================================================== */

let selectedPayment = "cod"; // Cash on Delivery is the default and only active option

function goToStep(n) {
  document.querySelectorAll("[data-step]").forEach((el) => el.classList.toggle("hidden", el.dataset.step !== String(n)));
  document.querySelectorAll("[data-step-num]").forEach((el) => {
    const i = +el.dataset.stepNum;
    el.classList.remove("active", "done");
    if (i === n) el.classList.add("active");
    if (i < n) el.classList.add("done");
  });
  if (n === 2) fillReview();
}

function renderPaymentOptions() {
  // Payment options are now hardcoded in checkout.html
  // COD is pre-selected by default
  selectedPayment = "cod";

  // Listen if user selects a different option in future
  document.querySelectorAll('input[name="payment"]').forEach((r) => {
    r.addEventListener("change", () => {
      selectedPayment = r.value;
    });
  });
}

function renderSummarySidebar() {
  const cart = getCart();
  document.getElementById("checkout-summary-items").innerHTML = cart.map((line) => {
    const p = getProduct(line.productId);
    return `<div class="flex justify-between"><span>${p.name} × ${line.qty}</span><span class="font-mono text-ecru">${formatMoney(lineTotal(line, p))}</span></div>`;
  }).join("");
  const subtotal = cart.reduce((s, line) => s + lineTotal(line, getProduct(line.productId)), 0);
  document.getElementById("co-subtotal").textContent = formatMoney(subtotal);
  document.getElementById("co-shipping").textContent = formatMoney(SHIPPING_FLAT);
  document.getElementById("co-total").textContent = formatMoney(subtotal + SHIPPING_FLAT);
}

function fillReview() {
  const address = `${val("ship-name")}<br>${val("ship-email")}<br>${val("ship-address")}<br>${val("ship-city")} ${val("ship-postal")}<br>${val("ship-phone")}`;
  document.getElementById("review-address").innerHTML = address;

  const paymentLabels = {
    "cod": "Cash on Delivery",
    "sslcommerz": "SSLCommerz Online Payment",
  };
  document.getElementById("review-payment").textContent = paymentLabels[selectedPayment] || selectedPayment;

  const cart = getCart();
  document.getElementById("review-items").innerHTML = cart.map((line) => {
    const p = getProduct(line.productId);
    return `<div class="py-2 flex justify-between text-sm"><span class="text-ecru">${p.name} (${line.size}) × ${line.qty}</span><span class="font-mono text-muted">${formatMoney(lineTotal(line, p))}</span></div>`;
  }).join("");
}

function val(id) { return document.getElementById(id).value.trim(); }

function wireStepButtons() {
  document.querySelectorAll("[data-next]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const next = +btn.dataset.next;
      if (next === 2) {
        const required = ["ship-name", "ship-address", "ship-city", "ship-postal", "ship-phone"];
        if (required.some((id) => !val(id))) {
          document.getElementById("ship-error").classList.remove("hidden");
          return;
        }
        document.getElementById("ship-error").classList.add("hidden");
        selectedPayment = "cod";
      }
      goToStep(next);
    });
  });
  document.querySelectorAll("[data-back]").forEach((btn) => btn.addEventListener("click", () => goToStep(+btn.dataset.back)));
}

function placeOrderFlow() {
  document.getElementById("place-order").addEventListener("click", async () => {
    const btn = document.getElementById("place-order");
    btn.disabled = true;
    btn.textContent = "Placing order…";

    const cart = getCart();
    const subtotal = cart.reduce((s, line) => s + lineTotal(line, getProduct(line.productId)), 0);
    const total = subtotal + SHIPPING_FLAT;
    const user = currentUser();

    try {
      const order = await placeOrder({
        userId: user ? user.id : null,
        items: cart,
        address: { name: val("ship-name"), email: val("ship-email"), address: val("ship-address"), city: val("ship-city"), postal: val("ship-postal"), phone: val("ship-phone") },
        payment: selectedPayment,
        total,
      });
      clearCart();
      document.getElementById("checkout-flow").classList.add("hidden");
      document.getElementById("checkout-confirmation").classList.remove("hidden");
      document.getElementById("conf-id").textContent = order.id;
      document.getElementById("conf-eta").textContent = formatDate(order.eta);
      document.getElementById("conf-total").textContent = formatMoney(order.total);
    } catch (err) {
      toast("Something went wrong placing your order. Please try again.");
      btn.disabled = false;
      btn.textContent = "Place order";
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadProducts();
  if (!getCart().length) {
    document.getElementById("checkout-root").innerHTML = "";
    document.getElementById("checkout-root").appendChild(
      Object.assign(document.createElement("div"), {
        innerHTML: emptyState({ title: "Nothing to check out", body: "Add a jersey to your cart first.", ctaLabel: "Shop jerseys", ctaHref: "shop.html" }),
      })
    );
    return;
  }
  renderPaymentOptions();
  renderSummarySidebar();
  wireStepButtons();
  placeOrderFlow();
  goToStep(1);
});
