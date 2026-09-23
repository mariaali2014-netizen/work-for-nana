/* ==========================================================================
   NANA MINI MART — products.js
   Central product catalog + category data + helper/query functions.
   Every other page-specific JS file reads from PRODUCTS / CATEGORIES here.
   ========================================================================== */

/* ---------- Categories ---------- */
const CATEGORIES = [
  { id: "grocery",       name: "Grocery",        icon: "bi-basket3",      color: "#2f9e44" },
  { id: "beverages",     name: "Beverages",      icon: "bi-cup-straw",    color: "#1c7ed6" },
  { id: "snacks",        name: "Snacks",         icon: "bi-cookie",       color: "#e8590c" },
  { id: "dairy",         name: "Dairy",          icon: "bi-cup-hot",      color: "#f08c00" },
  { id: "fruits",        name: "Fruits",         icon: "bi-apple",        color: "#e03131" },
  { id: "vegetables",    name: "Vegetables",     icon: "bi-flower1",      color: "#2b8a3e" },
  { id: "bakery",        name: "Bakery",         icon: "bi-egg-fried",    color: "#c2410c" },
  { id: "personal-care", name: "Personal Care",  icon: "bi-droplet",      color: "#ae3ec9" },
  { id: "household",     name: "Household",      icon: "bi-house-heart",  color: "#0c8599" },
  { id: "frozen",        name: "Frozen Food",    icon: "bi-snow",         color: "#4263eb" },
];

/* ---------- Helper to build a placeholder product image (always resolves, never broken) ---------- */
function productImg(name, hex) {
  const label = encodeURIComponent(name);
  return `https://placehold.co/500x500/${hex}/ffffff?text=${label}&font=roboto`;
}

/* ---------- Star rating renderer (used across pages) ---------- */
function starsHtml(rating) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  let html = "";
  for (let i = 0; i < full; i++) html += '<i class="bi bi-star-fill"></i>';
  if (half) html += '<i class="bi bi-star-half"></i>';
  for (let i = full + (half ? 1 : 0); i < 5; i++) html += '<i class="bi bi-star"></i>';
  return html;
}

function formatPKR(n) {
  return "Rs. " + Number(n).toLocaleString("en-PK");
}

/* ---------- Product catalog (60 products) ---------- */
const PRODUCTS = [
  // GROCERY
  p(1,"Basmati Rice 5kg","grocery",1450,1650,"2b8a3e",4.6,"Premium long-grain basmati rice, aged for perfect aroma and taste.",true,false),
  p(2,"Wheat Flour (Atta) 10kg","grocery",1250,null,"2b8a3e",4.5,"Stone-ground whole wheat flour for soft, fresh rotis daily.",true,false),
  p(3,"White Sugar 1kg","grocery",180,200,"2b8a3e",4.3,"Refined white sugar, pure and finely granulated.",false,false),
  p(4,"Cooking Oil 5L","grocery",2650,2950,"2b8a3e",4.7,"Light, healthy cooking oil suitable for daily frying and cooking.",true,false),
  p(5,"Mixed Pulses (Daal) 1kg","grocery",320,360,"2b8a3e",4.4,"High quality mixed lentils, rich in protein and fiber.",false,true),
  p(6,"Red Chili Powder 200g","grocery",240,null,"2b8a3e",4.2,"Freshly ground red chili powder with rich color and heat.",false,true),
  p(7,"Iodized Salt 800g","grocery",90,null,"2b8a3e",4.1,"Fine iodized table salt for everyday cooking needs.",false,false),
  p(8,"Green Tea Leaves 200g","grocery",480,540,"2b8a3e",4.5,"Aromatic loose-leaf tea for a refreshing morning cup.",true,false),

  // BEVERAGES
  p(9,"Cola Soft Drink 1.5L","beverages",180,200,"1c7ed6",4.4,"Classic fizzy cola, best served chilled.",true,false),
  p(10,"Orange Juice 1L","beverages",320,350,"1c7ed6",4.3,"100% real orange juice with no added preservatives.",true,true),
  p(11,"Mineral Water 1.5L (Pack of 6)","beverages",540,600,"1c7ed6",4.6,"Purified mineral water, hygienically bottled.",true,false),
  p(12,"Black Tea Bags (100pcs)","beverages",650,720,"1c7ed6",4.7,"Rich, strong black tea bags for the perfect cup.",true,false),
  p(13,"Instant Coffee 200g","beverages",980,1080,"1c7ed6",4.5,"Smooth instant coffee granules, rich aroma.",false,true),
  p(14,"Energy Drink 250ml","beverages",210,240,"1c7ed6",4.0,"Boosts energy and focus, best enjoyed chilled.",false,true),

  // SNACKS
  p(15,"Potato Chips 150g","snacks",150,170,"e8590c",4.3,"Crispy, crunchy potato chips with classic salted flavor.",true,false),
  p(16,"Chocolate Chip Biscuits 300g","snacks",260,290,"e8590c",4.4,"Buttery biscuits loaded with real chocolate chips.",true,false),
  p(17,"Milk Chocolate Bar 100g","snacks",220,null,"e8590c",4.6,"Smooth, creamy milk chocolate bar.",true,false),
  p(18,"Nimco Mix 400g","snacks",380,420,"e8590c",4.2,"Traditional spicy and crunchy snack mix.",false,true),
  p(19,"Cream Cookies 200g","snacks",190,210,"e8590c",4.1,"Delicious cream-filled cookies, perfect with tea.",false,false),
  p(20,"Salted Peanuts 250g","snacks",210,null,"e8590c",4.0,"Roasted and lightly salted peanuts.",false,true),

  // DAIRY
  p(21,"Fresh Milk 1L","dairy",230,null,"f08c00",4.6,"Fresh, pasteurized full-cream milk.",true,false),
  p(22,"Natural Yogurt 500g","dairy",180,200,"f08c00",4.5,"Thick, creamy natural yogurt made fresh daily.",true,false),
  p(23,"Butter 250g","dairy",520,560,"f08c00",4.7,"Rich, creamy butter perfect for cooking and baking.",true,false),
  p(24,"Cheddar Cheese Slices 200g","dairy",480,null,"f08c00",4.4,"Delicious melt-in-mouth cheddar cheese slices.",false,true),
  p(25,"Fresh Cream 200ml","dairy",260,null,"f08c00",4.2,"Thick fresh cream for desserts and cooking.",false,false),

  // FRUITS
  p(26,"Fresh Apples 1kg","fruits",320,null,"e03131",4.5,"Juicy, crisp red apples sourced fresh from the farm.",true,false),
  p(27,"Bananas 1 Dozen","fruits",160,null,"e03131",4.4,"Sweet, ripe bananas rich in potassium.",true,false),
  p(28,"Oranges 1kg","fruits",210,240,"e03131",4.3,"Juicy, tangy-sweet oranges packed with vitamin C.",false,true),
  p(29,"Mangoes 1kg","fruits",380,420,"e03131",4.8,"Sweet, aromatic mangoes — the king of fruits.",true,true),
  p(30,"Grapes 500g","fruits",280,null,"e03131",4.2,"Fresh seedless grapes, sweet and juicy.",false,false),

  // VEGETABLES
  p(31,"Tomatoes 1kg","vegetables",120,null,"2b8a3e",4.1,"Fresh, ripe red tomatoes for everyday cooking.",true,false),
  p(32,"Potatoes 1kg","vegetables",100,null,"2b8a3e",4.2,"Farm-fresh potatoes, perfect for all recipes.",true,false),
  p(33,"Onions 1kg","vegetables",110,null,"2b8a3e",4.0,"Fresh onions with strong flavor, kitchen essential.",true,false),
  p(34,"Carrots 500g","vegetables",90,null,"2b8a3e",4.1,"Crisp, sweet carrots rich in vitamin A.",false,true),
  p(35,"Cucumbers 500g","vegetables",80,null,"2b8a3e",4.0,"Fresh, crunchy cucumbers, great for salads.",false,false),

  // BAKERY
  p(36,"White Bread Loaf","bakery",150,null,"c2410c",4.3,"Soft, fresh white bread baked daily.",true,false),
  p(37,"Burger Buns (Pack of 6)","bakery",220,null,"c2410c",4.2,"Soft, fluffy buns perfect for burgers.",false,true),
  p(38,"Chocolate Cake Slice","bakery",280,320,"c2410c",4.6,"Rich, moist chocolate cake, freshly baked.",true,false),
  p(39,"Butter Croissants (Pack of 4)","bakery",380,420,"c2410c",4.5,"Flaky, buttery croissants baked fresh every morning.",false,true),

  // PERSONAL CARE
  p(40,"Herbal Shampoo 400ml","personal-care",450,500,"ae3ec9",4.4,"Nourishing herbal shampoo for healthy, shiny hair.",true,false),
  p(41,"Bathing Soap (Pack of 3)","personal-care",280,null,"ae3ec9",4.2,"Gentle, moisturizing soap for soft skin.",true,false),
  p(42,"Toothpaste 150g","personal-care",220,null,"ae3ec9",4.3,"Fluoride toothpaste for complete oral care.",true,false),
  p(43,"Face Wash 100ml","personal-care",380,420,"ae3ec9",4.1,"Deep-cleansing face wash for fresh, glowing skin.",false,true),
  p(44,"Body Lotion 200ml","personal-care",420,null,"ae3ec9",4.0,"Long-lasting moisturizing body lotion.",false,false),

  // HOUSEHOLD
  p(45,"Washing Powder 1kg","household",380,420,"0c8599",4.3,"Powerful stain-removing washing powder.",true,false),
  p(46,"Dishwashing Liquid 500ml","household",250,null,"0c8599",4.2,"Grease-cutting dishwashing liquid, gentle on hands.",true,false),
  p(47,"Tissue Paper Box","household",180,null,"0c8599",4.1,"Soft, absorbent tissue paper for everyday use.",false,true),
  p(48,"Floor Cleaner 1L","household",320,360,"0c8599",4.0,"Disinfectant floor cleaner with long-lasting fragrance.",false,false),
  p(49,"Toilet Cleaner 500ml","household",260,null,"0c8599",4.1,"Powerful toilet cleaner that kills 99.9% germs.",false,true),

  // FROZEN FOOD
  p(50,"Frozen Chicken Nuggets 500g","frozen",480,530,"4263eb",4.4,"Crispy, ready-to-cook chicken nuggets.",true,false),
  p(51,"Frozen French Fries 1kg","frozen",380,420,"4263eb",4.5,"Crispy golden fries, ready in minutes.",true,true),
  p(52,"Frozen Mixed Vegetables 500g","frozen",280,null,"4263eb",4.2,"Convenient mixed vegetables, flash-frozen fresh.",false,false),
  p(53,"Frozen Paratha (Pack of 5)","frozen",320,350,"4263eb",4.3,"Ready-to-cook layered parathas, soft and flaky.",false,true),

  // Extra items across categories to comfortably exceed 50 + fill Best Seller / New Arrival rows
  p(54,"Brown Rice 2kg","grocery",620,680,"2b8a3e",4.2,"Nutritious whole-grain brown rice.",false,false),
  p(55,"Apple Juice 1L","beverages",300,null,"1c7ed6",4.1,"Refreshing pure apple juice.",false,false),
  p(56,"Vanilla Ice Cream 1L","frozen",450,500,"4263eb",4.6,"Creamy vanilla ice cream, a family favorite.",true,false),
  p(57,"Strawberry Yogurt 4-Pack","dairy",320,360,"f08c00",4.3,"Delicious fruit-flavored yogurt cups.",false,true),
  p(58,"Multigrain Bread","bakery",190,null,"c2410c",4.4,"Healthy multigrain bread loaf.",false,true),
  p(59,"Hand Sanitizer 250ml","personal-care",260,null,"ae3ec9",4.0,"Kills 99.9% germs, moisturizing formula.",false,false),
  p(60,"Air Freshener Spray","household",300,330,"0c8599",4.0,"Long-lasting fragrance for a fresh home.",false,false),
];

function p(id,name,category,price,oldPrice,hex,rating,description,bestseller,newArrival){
  const discount = oldPrice ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
  return {
    id, name, category, price, oldPrice: oldPrice || null, discount,
    image: productImg(name, hex), rating,
    stock: Math.floor(Math.random() * 40) + 10,
    description, bestseller: !!bestseller, newArrival: !!newArrival,
  };
}

/* ---------- Query helpers ---------- */
function getProductById(id) {
  return PRODUCTS.find(pr => pr.id === Number(id));
}
function getCategoryName(catId) {
  const c = CATEGORIES.find(c => c.id === catId);
  return c ? c.name : catId;
}
function getBestSellers(limit = 8) {
  return PRODUCTS.filter(pr => pr.bestseller).slice(0, limit);
}
function getNewArrivals(limit = 8) {
  return PRODUCTS.filter(pr => pr.newArrival).slice(0, limit);
}
function getFeatured(limit = 12) {
  return PRODUCTS.slice(0, limit);
}
function getDiscounted(limit = 100) {
  return PRODUCTS.filter(pr => pr.discount > 0).slice(0, limit);
}
function getRelated(product, limit = 4) {
  return PRODUCTS.filter(pr => pr.category === product.category && pr.id !== product.id).slice(0, limit);
}
function searchProducts(query) {
  const q = query.trim().toLowerCase();
  if (!q) return PRODUCTS;
  return PRODUCTS.filter(pr =>
    pr.name.toLowerCase().includes(q) ||
    pr.category.toLowerCase().includes(q) ||
    pr.description.toLowerCase().includes(q) ||
    getCategoryName(pr.category).toLowerCase().includes(q)
  );
}
