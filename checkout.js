/* ==========================================================================
   NANA MINI MART — checkout.js
   Powers checkout.html: order summary, delivery/payment selection,
   full form validation, and the WhatsApp order-confirmation flow.
   ========================================================================== */

let checkoutDeliveryFee = 150;
let checkoutDeliveryLabel = "Standard Delivery";
let checkoutPaymentLabel = "Cash on Delivery";

function renderCheckoutSummary() {
  const cart = getCart();
  const listEl = document.getElementById("checkoutItemsList");
  let subtotal = 0;
  listEl.innerHTML = cart.map(item => {
    const product = getProductById(item.id);
    const lineTotal = product.price * item.qty;
    subtotal += lineTotal;
    return `<div class="d-flex justify-content-between small mb-2">
      <span>${product.name} × ${item.qty}</span>
      <span class="fw-semibold">${formatPKR(lineTotal)}</span>
    </div>`;
  }).join("");

  document.getElementById("coSubtotal").textContent = formatPKR(subtotal);
  document.getElementById("coDelivery").textContent = formatPKR(checkoutDeliveryFee);
  document.getElementById("coTotal").textContent = formatPKR(subtotal + checkoutDeliveryFee);
  return subtotal;
}

function initCheckoutPage() {
  const form = document.getElementById("checkoutForm");
  if (!form) return;

  const cart = getCart();
  if (cart.length === 0) {
    document.getElementById("checkoutEmptyState").style.display = "block";
    document.getElementById("checkoutContent").style.display = "none";
    return;
  }

  renderCheckoutSummary();

  // Delivery option selection
  document.querySelectorAll(".delivery-option").forEach(opt => {
    opt.addEventListener("click", () => {
      document.querySelectorAll(".delivery-option").forEach(o => o.classList.remove("active"));
      opt.classList.add("active");
      opt.querySelector(".delivery-radio").checked = true;
      checkoutDeliveryFee = Number(opt.dataset.fee);
      checkoutDeliveryLabel = opt.dataset.value;
      renderCheckoutSummary();
    });
  });

  // Payment option selection
  document.querySelectorAll(".pay-option").forEach(opt => {
    opt.addEventListener("click", () => {
      document.querySelectorAll(".pay-option").forEach(o => o.classList.remove("active"));
      opt.classList.add("active");
      opt.querySelector(".pay-radio").checked = true;
      checkoutPaymentLabel = opt.dataset.value;
    });
  });

  document.getElementById("confirmWhatsappBtn").addEventListener("click", () => {
    const fields = {
      custName: "Full name",
      custPhone: "Phone number",
      custEmail: "Email",
      custAddress: "Address",
      custCity: "City",
      custArea: "Area",
    };

    let valid = true;
    let firstInvalid = null;

    Object.keys(fields).forEach(id => {
      const input = document.getElementById(id);
      const value = input.value.trim();
      let fieldValid = value.length > 0;

      if (id === "custEmail" && fieldValid) {
        fieldValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      }
      if (id === "custPhone" && fieldValid) {
        fieldValid = /^(03\d{9}|\+92\d{10})$/.test(value.replace(/[\s-]/g, ""));
      }

      input.classList.toggle("is-invalid", !fieldValid);
      if (!fieldValid) {
        valid = false;
        if (!firstInvalid) firstInvalid = input;
      }
    });

    if (!valid) {
      showToast("Please fill all required fields correctly", "error");
      if (firstInvalid) firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const name = document.getElementById("custName").value.trim();
    const phone = document.getElementById("custPhone").value.trim();
    const email = document.getElementById("custEmail").value.trim();
    const address = document.getElementById("custAddress").value.trim();
    const city = document.getElementById("custCity").value.trim();
    const area = document.getElementById("custArea").value.trim();

    const cartNow = getCart();
    let subtotal = 0;
    const lines = cartNow.map((item, idx) => {
      const product = getProductById(item.id);
      const lineTotal = product.price * item.qty;
      subtotal += lineTotal;
      return `${idx + 1}. ${product.name} × ${item.qty} = Rs. ${lineTotal.toLocaleString("en-PK")}`;
    }).join("\n");

    const total = subtotal + checkoutDeliveryFee;

    const message = `Hello NANA MINI MART,

I want to place an order.

Customer Name: ${name}
Phone: ${phone}
Email: ${email}
Address: ${address}, ${area}, ${city}

Order:
${lines}

Subtotal: Rs. ${subtotal.toLocaleString("en-PK")}
Delivery (${checkoutDeliveryLabel}): Rs. ${checkoutDeliveryFee.toLocaleString("en-PK")}
Total: Rs. ${total.toLocaleString("en-PK")}

Payment Method: ${checkoutPaymentLabel}

Please confirm my order.`;

    openWhatsAppOrder(message);
    showToast("Order sent! Complete confirmation on WhatsApp.");
  });
}

document.addEventListener("DOMContentLoaded", initCheckoutPage);
