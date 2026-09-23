/* ==========================================================================
   NANA MINI MART — product.js
   Powers product.html: reads ?id=, renders full details, quantity selector,
   Add to Cart, Buy Now, WhatsApp order, wishlist, related products.
   ========================================================================== */

function initProductPage() {
  const container = document.getElementById("productDetailContainer");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));
  const product = getProductById(id);

  if (!product) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="bi bi-exclamation-triangle"></i>
        <h4>Product not found</h4>
        <p class="text-muted">The product you're looking for doesn't exist or was removed.</p>
        <a href="shop.html" class="btn btn-nana mt-2">Back to Shop</a>
      </div>`;
    return;
  }

  document.title = `${product.name} — NANA MINI MART`;
  document.getElementById("pdBreadcrumbTitle").textContent = product.name;
  document.getElementById("pdBreadcrumbActive").textContent = product.name;

  const wished = getWishlist().includes(product.id);

  container.innerHTML = `
    <div class="row g-5">
      <div class="col-lg-6 pd-gallery">
        <img src="${product.image}" alt="${product.name}" id="pdMainImage" onerror="this.src='https://placehold.co/600x600/adb5bd/ffffff?text=NANA+MART'">
      </div>
      <div class="col-lg-6">
        <span class="product-cat">${getCategoryName(product.category)}</span>
        <h1 class="mt-2 mb-2" style="font-size:1.8rem;">${product.name}</h1>
        <div class="d-flex align-items-center gap-3 mb-3">
          <div class="product-rating fs-6">${starsHtml(product.rating)} <span>(${product.rating} rating)</span></div>
          <span class="stock-badge ${product.stock > 0 ? "stock-in" : "stock-out"}">${product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}</span>
        </div>
        <div class="product-price mb-3">
          <span class="current-price fs-3">${formatPKR(product.price)}</span>
          ${product.oldPrice ? `<span class="old-price fs-6">${formatPKR(product.oldPrice)}</span> <span class="badge-discount position-relative" style="top:0;left:0;">-${product.discount}%</span>` : ""}
        </div>
        <p class="text-muted">${product.description}</p>

        <div class="pd-qty">
          <span class="fw-semibold">Quantity:</span>
          <div class="qty-control">
            <button id="pdQtyMinus" type="button" aria-label="Decrease quantity">-</button>
            <span id="pdQtyValue">1</span>
            <button id="pdQtyPlus" type="button" aria-label="Increase quantity">+</button>
          </div>
        </div>

        <div class="d-flex gap-2 flex-wrap mb-3">
          <button class="btn btn-nana" id="pdAddToCart" ${product.stock === 0 ? "disabled" : ""}><i class="bi bi-cart-plus"></i> Add to Cart</button>
          <button class="btn btn-orange" id="pdBuyNow" ${product.stock === 0 ? "disabled" : ""}><i class="bi bi-lightning-charge-fill"></i> Buy Now</button>
          <button class="btn btn-whatsapp" id="pdWhatsappOrder"><i class="bi bi-whatsapp"></i> Order on WhatsApp</button>
          <button class="btn btn-outline-nana wishlist-btn-pd ${wished ? "active" : ""}" id="pdWishlistBtn"><i class="bi bi-heart${wished ? "-fill" : ""}"></i></button>
        </div>

        <ul class="list-unstyled small text-muted mt-3">
          <li class="mb-1"><i class="bi bi-truck me-2"></i>Delivery within 30-60 minutes in Karachi.</li>
          <li class="mb-1"><i class="bi bi-arrow-repeat me-2"></i>Easy replacement for damaged items.</li>
          <li class="mb-1"><i class="bi bi-shield-check me-2"></i>100% quality checked before dispatch.</li>
        </ul>
      </div>
    </div>`;

  // Quantity selector
  let qty = 1;
  const qtyValueEl = document.getElementById("pdQtyValue");
  document.getElementById("pdQtyMinus").addEventListener("click", () => {
    if (qty > 1) { qty--; qtyValueEl.textContent = qty; }
  });
  document.getElementById("pdQtyPlus").addEventListener("click", () => {
    if (qty < product.stock) { qty++; qtyValueEl.textContent = qty; }
    else showToast("Reached available stock limit", "error");
  });

  document.getElementById("pdAddToCart").addEventListener("click", () => addToCart(product.id, qty));

  document.getElementById("pdBuyNow").addEventListener("click", () => {
    addToCart(product.id, qty);
    window.location.href = "checkout.html";
  });

  document.getElementById("pdWishlistBtn").addEventListener("click", (e) => {
    toggleWishlist(product.id);
    const nowWished = getWishlist().includes(product.id);
    e.currentTarget.classList.toggle("active", nowWished);
    e.currentTarget.querySelector("i").className = `bi bi-heart${nowWished ? "-fill" : ""}`;
  });

  document.getElementById("pdWhatsappOrder").addEventListener("click", () => {
    const message =
`Hello NANA MINI MART,

I want to place an order.

Product: ${product.name}
Quantity: ${qty}
Price: ${formatPKR(product.price)} x ${qty} = ${formatPKR(product.price * qty)}

Please confirm my order.`;
    openWhatsAppOrder(message);
  });

  // Related products
  renderProductGrid("relatedGrid", getRelated(product));
}

document.addEventListener("DOMContentLoaded", initProductPage);
