/* ===========================================================
   JerseySphere — checkout logic
   =========================================================== */

let selectedPayment = null;

const PAYMENT_METHODS = [
  { id: "card", label: "Credit / debit card" },
  { id: "bkash", label: "bKash" },
  { id: "nagad", label: "Nagad" },
  { id: "cod", label: "Cash on delivery" },
];

function goToStep(n) {
  document.querySelectorAll("[data-step]").forEach((el) => el.classList.toggle("hidden", el.dataset.step !== String(n)));
  document.querySelectorAll("[data-step-num]").forEach((el) => {
    const i = +el.dataset.stepNum;
    el.classList.remove("active", "done");
    if (i === n) el.classList.add("active");
    if (i < n) el.classList.add("done");
  });
  if (n === 3) fillReview();
}

function renderPaymentOptions() {
  document.getElementById("payment-options").innerHTML = PAYMENT_METHODS.map((m) => `
    <label class="flex items-center gap-3 border border-line rounded-lg px-3 py-2.5 cursor-pointer">
      <input type="radio" name="payment" value="${m.id}" class="text-gold focus:ring-gold" />
      <span class="text-sm text-ecru">${m.label}</span>
    </label>`).join("");

  document.querySelectorAll('input[name="payment"]').forEach((r) => {
    r.addEventListener("change", () => {
      selectedPayment = r.value;
      document.getElementById("card-fields").classList.toggle("hidden", r.value !== "card");
      document.getElementById("payment-error").classList.add("hidden");
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
  const address = `${val("ship-name")}<br>${val("ship-address")}<br>${val("ship-city")} ${val("ship-postal")}<br>${val("ship-phone")}`;
  document.getElementById("review-address").innerHTML = address;
  const method = PAYMENT_METHODS.find((m) => m.id === selectedPayment);
  document.getElementById("review-payment").textContent = method ? method.label : "—";

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
      }
      if (next === 3 && !selectedPayment) {
        document.getElementById("payment-error").classList.remove("hidden");
        return;
      }
      goToStep(next);
    });
  });
  document.querySelectorAll("[data-back]").forEach((btn) => btn.addEventListener("click", () => goToStep(+btn.dataset.back)));
}

function placeOrderFlow() {
  document.getElementById("place-order").addEventListener("click", () => {
    const cart = getCart();
    const subtotal = cart.reduce((s, line) => s + lineTotal(line, getProduct(line.productId)), 0);
    const total = subtotal + SHIPPING_FLAT;
    const user = currentUser();
    const order = placeOrder({
      userId: user ? user.id : null,
      items: cart,
      address: { name: val("ship-name"), address: val("ship-address"), city: val("ship-city"), postal: val("ship-postal"), phone: val("ship-phone") },
      payment: selectedPayment,
      total,
    });
    clearCart();
    document.getElementById("checkout-flow").classList.add("hidden");
    document.getElementById("checkout-confirmation").classList.remove("hidden");
    document.getElementById("conf-id").textContent = order.id;
    document.getElementById("conf-eta").textContent = formatDate(order.eta);
    document.getElementById("conf-total").textContent = formatMoney(order.total);
  });
}

document.addEventListener("DOMContentLoaded", () => {
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
