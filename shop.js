/* ==========================================================================
   NANA MINI MART — shop.js
   Powers shop.html: category filter list, search, price/rating/stock
   filters, sorting, URL query params (?search=, ?category=).
   ========================================================================== */

let shopState = {
  search: "",
  category: "all",
  maxPrice: 3000,
  minRating: 0,
  inStockOnly: false,
  sort: "popular",
};

function renderCategoryFilterList() {
  const container = document.getElementById("categoryFilterList");
  if (!container) return;
  let html = `
    <div class="form-check">
      <input class="form-check-input category-filter" type="radio" name="categoryFilter" id="catAll" value="all" checked>
      <label class="form-check-label" for="catAll">All Categories</label>
    </div>`;
  CATEGORIES.forEach(cat => {
    html += `
    <div class="form-check">
      <input class="form-check-input category-filter" type="radio" name="categoryFilter" id="cat-${cat.id}" value="${cat.id}">
      <label class="form-check-label" for="cat-${cat.id}">${cat.name}</label>
    </div>`;
  });
  container.innerHTML = html;
  container.querySelectorAll(".category-filter").forEach(input => {
    input.addEventListener("change", (e) => {
      shopState.category = e.target.value;
      applyShopFilters();
    });
  });
}

function applyShopFilters() {
  let results = PRODUCTS.slice();

  if (shopState.search.trim()) {
    results = searchProducts(shopState.search);
  }
  if (shopState.category !== "all") {
    results = results.filter(p => p.category === shopState.category);
  }
  results = results.filter(p => p.price <= shopState.maxPrice);
  results = results.filter(p => p.rating >= shopState.minRating);
  if (shopState.inStockOnly) {
    results = results.filter(p => p.stock > 0);
  }

  switch (shopState.sort) {
    case "price-low": results.sort((a, b) => a.price - b.price); break;
    case "price-high": results.sort((a, b) => b.price - a.price); break;
    case "name-az": results.sort((a, b) => a.name.localeCompare(b.name)); break;
    case "name-za": results.sort((a, b) => b.name.localeCompare(a.name)); break;
    case "newest": results.sort((a, b) => (b.newArrival === a.newArrival) ? b.id - a.id : (b.newArrival ? 1 : -1)); break;
    default: results.sort((a, b) => (b.bestseller === a.bestseller) ? 0 : (b.bestseller ? 1 : -1));
  }

  document.getElementById("resultCount").textContent = `${results.length} product${results.length !== 1 ? "s" : ""} found`;
  renderProductGrid("shopGrid", results);
}

function initShopPage() {
  if (!document.getElementById("shopGrid")) return;

  renderCategoryFilterList();

  // Read URL params
  const params = new URLSearchParams(window.location.search);
  const urlSearch = params.get("search");
  const urlCategory = params.get("category");
  if (urlSearch) {
    shopState.search = urlSearch;
    document.getElementById("shopSearchInput").value = urlSearch;
  }
  if (urlCategory) {
    shopState.category = urlCategory;
    const radio = document.getElementById(`cat-${urlCategory}`);
    if (radio) radio.checked = true;
  }

  document.getElementById("shopSearchInput").addEventListener("input", (e) => {
    shopState.search = e.target.value;
    applyShopFilters();
  });

  document.getElementById("priceRange").addEventListener("input", (e) => {
    shopState.maxPrice = Number(e.target.value);
    document.getElementById("priceRangeValue").textContent = formatPKR(e.target.value);
    applyShopFilters();
  });

  document.querySelectorAll(".rating-filter").forEach(input => {
    input.addEventListener("change", (e) => {
      shopState.minRating = Number(e.target.value);
      applyShopFilters();
    });
  });

  document.getElementById("inStockOnly").addEventListener("change", (e) => {
    shopState.inStockOnly = e.target.checked;
    applyShopFilters();
  });

  document.getElementById("sortSelect").addEventListener("change", (e) => {
    shopState.sort = e.target.value;
    applyShopFilters();
  });

  document.getElementById("clearFiltersBtn").addEventListener("click", () => {
    shopState = { search: "", category: "all", maxPrice: 3000, minRating: 0, inStockOnly: false, sort: "popular" };
    document.getElementById("shopSearchInput").value = "";
    document.getElementById("priceRange").value = 3000;
    document.getElementById("priceRangeValue").textContent = "Rs. 3000";
    document.getElementById("catAll").checked = true;
    document.getElementById("rateAll").checked = true;
    document.getElementById("inStockOnly").checked = false;
    document.getElementById("sortSelect").value = "popular";
    applyShopFilters();
  });

  applyShopFilters();
}

document.addEventListener("DOMContentLoaded", initShopPage);
