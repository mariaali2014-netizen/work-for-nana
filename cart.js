/* ==========================================================================
   NANA MINI MART — cart.js
   Powers cart.html: line items, qty +/-, remove, clear, totals, LocalStorage
   persistence, wishlist section, and the WhatsApp order flow.
   ========================================================================== */

function cartLineItemHtml(item, product) {
  const lineTotal = product.price * item.qty;
  return `
  <div class="cart-item" data-id="${product.id}">
    <img src="${product.image}" alt="${product.name}" onerror="this.src='https://placehold.co/200x200/adb5bd/ffffff?text=NANA'">
    <div class="flex-grow-1">
      <a href="product.html?id=${product.id}" class="fw-semibold text-dark">${product.name}</a>
      <div class="text-muted small">${getCategoryName(product.category)}</div>
      <div class="fw-bold" style="color:var(--nana-green-dark);">${formatPKR(product.price)}</div>
    </div>
    <div class="qty-control cart-qty-control" data-id="${product.id}">
      <button type="button" class="qty-minus">-</button>
      <span>${item.qty}</span>
      <button type="button" class="qty-plus">+</button>
    </div>
    <div class="fw-bold text-end" style="min-width:90px;">${formatPKR(lineTotal)}</div>
    <button class="btn btn-sm text-danger cart-remove-btn" data-id="${product.id}" aria-label="Remove item"><i class="bi bi-trash3-fill fs-5"></i></button>
  </div>`;
}

function renderCartPage() {
  const listEl = document.getElementById("cartItemsList");
  if (!listEl) return;

  const cart = getCart();
  const emptyState = document.getElementById("cartEmptyState");
  const summaryCard = document.getElementById("cartSummaryCard");

  if (cart.length === 0) {
    listEl.innerHTML = "";
    emptyState.style.display = "block";
    summaryCard.style.display = "none";
    return;
  }
  emptyState.style.display = "none";
  summaryCard.style.display = "block";

  let subtotal = 0, totalItems = 0;
  listEl.innerHTML = cart.map(item => {
    const product = getProductById(item.id);
    if (!product) return "";
    subtotal += product.price * item.qty;
    totalItems += item.qty;
    return cartLineItemHtml(item, product);
  }).join("");

  const delivery = subtotal >= FREE_DELIVERY_THRESHOLD || subtotal === 0 ? 0 : DELIVERY_FEE;
  const grandTotal = subtotal + delivery;

  document.getElementById("sumItems").textContent = totalItems;
  document.getElementById("sumSubtotal").textContent = formatPKR(subtotal);
  document.getElementById("sumDelivery").textContent = delivery === 0 ? "FREE" : formatPKR(delivery);
  document.getElementById("sumTotal").textContent = formatPKR(grandTotal);
}

function changeQty(productId, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  const product = getProductById(productId);
  item.qty += delta;
  if (item.qty <= 0) {
    saveCart(cart.filter(i => i.id !== productId));
  } else if (item.qty > product.stock) {
    showToast("Reached available stock limit", "error");
    item.qty = product.stock;
    saveCart(cart);
  } else {
    saveCart(cart);
  }
  renderCartPage();
}

function removeFromCart(productId) {
  const cart = getCart().filter(i => i.id !== productId);
  saveCart(cart);
  renderCartPage();
  showToast("Item removed from cart", "info");
}

function renderWishlistSection() {
  const grid = document.getElementById("wishlistGrid");
  if (!grid) return;
  const ids = getWishlist();
  const products = ids.map(id => getProductById(id)).filter(Boolean);
  document.getElementById("wishlistEmptyState").style.display = products.length === 0 ? "block" : "none";
  grid.innerHTML = products.map(productCardHtml).join("");
}

function buildWhatsAppMessageFromCart(customerName, customerPhone, customerAddress) {
  const cart = getCart();
  let subtotal = 0;
  const lines = cart.map((item, idx) => {
    const product = getProductById(item.id);
    const lineTotal = product.price * item.qty;
    subtotal += lineTotal;
    return `${idx + 1}. ${product.name} × ${item.qty} = Rs. ${lineTotal.toLocaleString("en-PK")}`;
  }).join("\n");

  const delivery = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + delivery;

  return `Hello NANA MINI MART,

I want to place an order.

Customer Name: ${customerName}
Phone: ${customerPhone}
Address: ${customerAddress}

Order:
${lines}

Subtotal: Rs. ${subtotal.toLocaleString("en-PK")}
Delivery: ${delivery === 0 ? "FREE" : "Rs. " + delivery.toLocaleString("en-PK")}
Total: Rs. ${total.toLocaleString("en-PK")}

Please confirm my order.`;
}

function initCartPage() {
  const listEl = document.getElementById("cartItemsList");
  if (!listEl) return;

  renderCartPage();
  renderWishlistSection();

  listEl.addEventListener("click", (e) => {
    const minus = e.target.closest(".qty-minus");
    const plus = e.target.closest(".qty-plus");
    const remove = e.target.closest(".cart-remove-btn");
    if (minus) changeQty(Number(minus.closest(".cart-qty-control").dataset.id), -1);
    if (plus) changeQty(Number(plus.closest(".cart-qty-control").dataset.id), 1);
    if (remove) removeFromCart(Number(remove.dataset.id));
  });

  document.getElementById("clearCartBtn").addEventListener("click", () => {
    if (getCart().length === 0) return;
    if (confirm("Are you sure you want to clear your entire cart?")) {
      saveCart([]);
      renderCartPage();
      showToast("Cart cleared", "info");
    }
  });

  document.getElementById("cartWhatsappBtn").addEventListener("click", () => {
    const cart = getCart();
    if (cart.length === 0) {
      showToast("Your cart is empty. Add products before ordering.", "error");
      return;
    }
    const name = prompt("Please enter your full name:");
    if (!name) { showToast("Order cancelled — name is required", "error"); return; }
    const phone = prompt("Please enter your phone number:");
    if (!phone) { showToast("Order cancelled — phone number is required", "error"); return; }
    const address = prompt("Please enter your delivery address:");
    if (!address) { showToast("Order cancelled — address is required", "error"); return; }

    const message = buildWhatsAppMessageFromCart(name, phone, address);
    openWhatsAppOrder(message);
  });

  // If arriving with #wishlist hash, smooth scroll there
  if (window.location.hash === "#wishlist") {
    setTimeout(() => {
      document.getElementById("wishlist").scrollIntoView({ behavior: "smooth" });
    }, 200);
  }
}

document.addEventListener("DOMContentLoaded", initCartPage);
