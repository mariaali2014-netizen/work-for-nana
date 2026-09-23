/* ==========================================================================
   NANA MINI MART — app.js
   Site-wide: navbar, footer, mobile menu, toasts, cart/wishlist counters,
   shared product-card rendering, newsletter validation, auth navbar state.
   ========================================================================== */

const WHATSAPP_NUMBER = "923181016900";
const DELIVERY_FEE = 150;
const FREE_DELIVERY_THRESHOLD = 3000;

/* ---------- LocalStorage keys ---------- */
const LS_CART = "nana_cart";
const LS_WISHLIST = "nana_wishlist";
const LS_USER = "nana_current_user";
const LS_USERS = "nana_users";

/* ---------- Cart / Wishlist basic storage helpers (shared by every page) ---------- */
function getCart() {
  return JSON.parse(localStorage.getItem(LS_CART) || "[]");
}
function saveCart(cart) {
  localStorage.setItem(LS_CART, JSON.stringify(cart));
  updateCartCounter();
}
function getWishlist() {
  return JSON.parse(localStorage.getItem(LS_WISHLIST) || "[]");
}
function saveWishlist(list) {
  localStorage.setItem(LS_WISHLIST, JSON.stringify(list));
  updateWishlistCounter();
}
function updateCartCounter() {
  const count = getCart().reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll(".cart-counter").forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? "inline-flex" : "none";
  });
}
function updateWishlistCounter() {
  const count = getWishlist().length;
  document.querySelectorAll(".wishlist-counter").forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? "inline-flex" : "none";
  });
}

/* ---------- Toast notifications ---------- */
function showToast(message, type = "success") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = `nana-toast nana-toast-${type}`;
  const icon = type === "success" ? "bi-check-circle-fill" : type === "error" ? "bi-x-circle-fill" : "bi-info-circle-fill";
  toast.innerHTML = `<i class="bi ${icon}"></i><span>${message}</span>`;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 2600);
}

/* ---------- Add to cart (shared) ---------- */
function addToCart(productId, qty = 1) {
  const product = getProductById(productId);
  if (!product) return;
  const cart = getCart();
  const existing = cart.find(i => i.id === productId);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id: productId, qty });
  }
  saveCart(cart);
  showToast(`${product.name} added to cart`);
}
function toggleWishlist(productId) {
  const product = getProductById(productId);
  let list = getWishlist();
  if (list.includes(productId)) {
    list = list.filter(id => id !== productId);
    showToast(`${product.name} removed from wishlist`, "info");
  } else {
    list.push(productId);
    showToast(`${product.name} added to wishlist`);
  }
  saveWishlist(list);
  document.querySelectorAll(`.wishlist-btn[data-id="${productId}"]`).forEach(btn => {
    btn.classList.toggle("active", list.includes(productId));
  });
}

/* ---------- Shared product card markup ---------- */
function productCardHtml(product) {
  const wished = getWishlist().includes(product.id);
  const oldPriceHtml = product.oldPrice ? `<span class="old-price">${formatPKR(product.oldPrice)}</span>` : "";
  const badgeHtml = product.discount > 0 ? `<span class="badge-discount">-${product.discount}%</span>` : (product.newArrival ? `<span class="badge-new">NEW</span>` : "");
  const stockHtml = product.stock > 0 ? "" : `<span class="badge-outofstock">Out of stock</span>`;
  return `
  <div class="product-card" data-id="${product.id}" data-category="${product.category}" data-price="${product.price}" data-rating="${product.rating}" data-name="${product.name.toLowerCase()}" data-newarrival="${product.newArrival}">
    ${badgeHtml}${stockHtml}
    <button class="wishlist-btn ${wished ? "active" : ""}" data-id="${product.id}" title="Add to wishlist" aria-label="Add to wishlist">
      <i class="bi bi-heart-fill"></i>
    </button>
    <a href="product.html?id=${product.id}" class="product-img-link">
      <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='https://placehold.co/500x500/adb5bd/ffffff?text=NANA+MART'">
    </a>
    <button class="quickview-btn" data-id="${product.id}"><i class="bi bi-eye"></i> Quick View</button>
    <div class="product-card-body">
      <span class="product-cat">${getCategoryName(product.category)}</span>
      <h3 class="product-name"><a href="product.html?id=${product.id}">${product.name}</a></h3>
      <div class="product-rating">${starsHtml(product.rating)} <span>(${product.rating})</span></div>
      <div class="product-price">
        <span class="current-price">${formatPKR(product.price)}</span>
        ${oldPriceHtml}
      </div>
      <button class="btn btn-add-cart" data-id="${product.id}" ${product.stock === 0 ? "disabled" : ""}>
        <i class="bi bi-cart-plus"></i> Add to Cart
      </button>
    </div>
  </div>`;
}

/* ---------- Shared category card renderer (used on Home + Categories pages) ---------- */
function categoryCardHtml(cat, colClass = "col-lg-2 col-md-3 col-6") {
  return `
  <div class="${colClass} fade-up">
    <a href="shop.html?category=${cat.id}" class="category-card d-block text-decoration-none">
      <div class="category-icon" style="background:${cat.color};"><i class="bi ${cat.icon}"></i></div>
      <h6>${cat.name}</h6>
    </a>
  </div>`;
}
function renderCategoryGrid(containerId, colClass) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = CATEGORIES.map(cat => categoryCardHtml(cat, colClass)).join("");
}

function renderProductGrid(containerId, products) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (products.length === 0) {
    el.innerHTML = `<div class="no-products"><i class="bi bi-emoji-frown"></i><p>Sorry, no products found.</p></div>`;
    return;
  }
  el.innerHTML = products.map(productCardHtml).join("");
}

/* ---------- Delegate add-to-cart / wishlist / quickview clicks (works for dynamically rendered cards) ---------- */
document.addEventListener("click", (e) => {
  const addBtn = e.target.closest(".btn-add-cart");
  if (addBtn && !addBtn.disabled) {
    addToCart(Number(addBtn.dataset.id));
  }
  const wishBtn = e.target.closest(".wishlist-btn");
  if (wishBtn) {
    toggleWishlist(Number(wishBtn.dataset.id));
  }
  const quickBtn = e.target.closest(".quickview-btn");
  if (quickBtn) {
    openQuickView(Number(quickBtn.dataset.id));
  }
});

/* ---------- Quick View modal ---------- */
function openQuickView(productId) {
  const product = getProductById(productId);
  if (!product) return;
  let modal = document.getElementById("quickViewModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "quickViewModal";
    modal.className = "modal fade";
    modal.tabIndex = -1;
    modal.innerHTML = `<div class="modal-dialog modal-dialog-centered modal-lg"><div class="modal-content" id="quickViewContent"></div></div>`;
    document.body.appendChild(modal);
  }
  document.getElementById("quickViewContent").innerHTML = `
    <div class="modal-header border-0">
      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
    </div>
    <div class="modal-body">
      <div class="row g-4">
        <div class="col-md-6">
          <img src="${product.image}" class="img-fluid rounded-3" alt="${product.name}">
        </div>
        <div class="col-md-6">
          <span class="product-cat">${getCategoryName(product.category)}</span>
          <h3>${product.name}</h3>
          <div class="product-rating mb-2">${starsHtml(product.rating)} <span>(${product.rating})</span></div>
          <div class="product-price mb-3">
            <span class="current-price fs-4">${formatPKR(product.price)}</span>
            ${product.oldPrice ? `<span class="old-price">${formatPKR(product.oldPrice)}</span>` : ""}
          </div>
          <p class="text-muted">${product.description}</p>
          <p class="mb-3"><strong>${product.stock > 0 ? `In Stock (${product.stock} available)` : "Out of Stock"}</strong></p>
          <div class="d-flex gap-2 flex-wrap">
            <button class="btn btn-add-cart" data-id="${product.id}" ${product.stock === 0 ? "disabled" : ""}><i class="bi bi-cart-plus"></i> Add to Cart</button>
            <a href="product.html?id=${product.id}" class="btn btn-outline-nana">View Full Details</a>
          </div>
        </div>
      </div>
    </div>`;
  new bootstrap.Modal(modal).show();
}

/* ---------- Newsletter validation (used in footer, present on every page) ---------- */
function initNewsletterForm() {
  document.querySelectorAll(".newsletter-form-el").forEach(form => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = form.querySelector(".newsletter-email-el");
      const email = input.value.trim();
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(email)) {
        showToast("Please enter a valid email address", "error");
        input.classList.add("is-invalid");
        return;
      }
      input.classList.remove("is-invalid");
      showToast("Subscribed successfully! Thank you.");
      form.reset();
    });
  });
}

/* ---------- Auth navbar state ---------- */
function getCurrentUser() {
  return JSON.parse(localStorage.getItem(LS_USER) || "null");
}
function renderAuthNav() {
  const user = getCurrentUser();
  const slot = document.getElementById("authNavSlot");
  const slotMobile = document.getElementById("authNavSlotMobile");
  const html = (mobile) => user
    ? `<div class="dropdown">
         <a class="nav-icon-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
           <i class="bi bi-person-check-fill"></i>${mobile ? `<span class="ms-2">${user.name.split(" ")[0]}</span>` : ""}
         </a>
         <ul class="dropdown-menu dropdown-menu-end">
           <li><span class="dropdown-item-text fw-semibold">Hi, ${user.name.split(" ")[0]}</span></li>
           <li><hr class="dropdown-divider"></li>
           <li><button class="dropdown-item" id="logoutBtn">Logout</button></li>
         </ul>
       </div>`
    : `<a href="login.html" class="nav-icon-link"><i class="bi bi-person"></i>${mobile ? `<span class="ms-2">Login / Signup</span>` : ""}</a>`;
  if (slot) slot.innerHTML = html(false);
  if (slotMobile) slotMobile.innerHTML = html(true);
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem(LS_USER);
      showToast("You have been logged out");
      renderAuthNav();
    });
  }
}

/* ---------- Mobile menu + navbar shadow on scroll ---------- */
function initNavbarBehavior() {
  const navbar = document.getElementById("mainNavbar");
  if (navbar) {
    window.addEventListener("scroll", () => {
      navbar.classList.toggle("scrolled", window.scrollY > 10);
    });
  }
  // Highlight current page link
  const current = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-link[href]").forEach(link => {
    if (link.getAttribute("href") === current) link.classList.add("active");
  });
}

/* ---------- Navbar search ---------- */
function initNavSearch() {
  const pairs = [["navSearchForm", "navSearchInput"], ["navSearchFormMobile", "navSearchInputMobile"]];
  pairs.forEach(([formId, inputId]) => {
    const form = document.getElementById(formId);
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = document.getElementById(inputId).value.trim();
      window.location.href = `shop.html?search=${encodeURIComponent(q)}`;
    });
  });
}

/* ---------- WhatsApp helper ---------- */
function openWhatsAppOrder(message) {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

/* ---------- Run on every page load ---------- */
document.addEventListener("DOMContentLoaded", () => {
  updateCartCounter();
  updateWishlistCounter();
  initNewsletterForm();
  renderAuthNav();
  initNavbarBehavior();
  initNavSearch();
});
