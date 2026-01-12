console.log("HOME JS LOADED");

import { parseCSV, titleCase, safeId } from "./utils.js";

const PRODUCT_CSV =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vR0cxY8q0h6DTn8bReKw37zohNTm02f2XzzsnSBCI8irCvAgr_OwvYWQPYr3QvS3PqlFRgXzPv3ZVtV/pub?gid=0&single=true&output=csv&t=" +
  Date.now();

/* =====================
   DOM REFERENCES
===================== */
const categoryGrid = document.getElementById("categoryGrid");
const categorySections = document.getElementById("allProducts");
const allProductsGrid = document.getElementById("allProductsGrid");
const specialOffers = document.getElementById("special-offers");
const searchInput = document.getElementById("searchInput");
const priceSort = document.getElementById("priceSort");

/* =====================
   DATA STORES
===================== */
const categoryMap = {};
let allProductsData = [];

/* =====================
   LOAD CSV
===================== */
fetch(PRODUCT_CSV)
  .then(r => r.text())
  .then(csv => {
    parseCSV(csv).forEach(c => {
     const status = (c[7] || "").toLowerCase().trim();
if (status === "inactive") return;

      if (!c[2]) return;

      const price = Number(c[4]);
      const offer = c[5] ? Number(c[5]) : null;

      const finalPrice = offer
        ? Math.round(price - (price * offer) / 100)
        : price;

      const product = {
        id: c[0],
        name: c[1],
        category: c[2].toLowerCase().trim(),
        image: c[3].split("||")[0],
        price,
        offer,
        finalPrice,
        status:status
      };

      allProductsData.push(product);

      if (!categoryMap[product.category]) {
        categoryMap[product.category] = [];
      }
      categoryMap[product.category].push(product);
    });

    buildCategoryGrid();
    buildCategorySections();
    buildAllProducts(allProductsData);
    buildSpecialOffers();
    enableSearch();
    enablePriceSort();
  });

/* =====================
   CATEGORY GRID
===================== */
function buildCategoryGrid() {
  Object.keys(categoryMap).forEach(cat => {
    const div = document.createElement("div");
    div.className = "category-card";
    div.onclick = () =>
      document.getElementById(safeId(cat))
        ?.scrollIntoView({ behavior: "smooth" });

    div.innerHTML = `
      <img src="${categoryMap[cat][0].image}">
      <h4>${titleCase(cat)}</h4>
    `;
    categoryGrid.appendChild(div);
  });
}

/* =====================
   CATEGORY SECTIONS
===================== */
function buildCategorySections() {
  Object.keys(categoryMap).forEach(cat => {
    const section = document.createElement("section");
    section.id = safeId(cat);
    section.dataset.category = normalize(cat);

    section.innerHTML = `
      <h2 class="section-title">${titleCase(cat)}</h2>
      <div class="products"></div>
    `;

    const grid = section.querySelector(".products");
    // Make only one category horizontal
if (cat === "wow deals") {
  grid.classList.add("horizontal-scroll","auto-scroll");
}

    categoryMap[cat].forEach(p => grid.appendChild(productCard(p)));

    categorySections.appendChild(section);
  });
}

/* =====================
   ALL PRODUCTS (MAIN)
===================== */
function buildAllProducts(list) {
  allProductsGrid.innerHTML = "";
  list.forEach(p => {
    allProductsGrid.appendChild(productCard(p));
  });
}

/* =====================
   SPECIAL OFFERS
===================== */
function buildSpecialOffers() {
  allProductsData
    .filter(p => p.offer)
    .forEach(p => specialOffers.appendChild(productCard(p)));
}

/* =====================
   PRODUCT CARD
===================== */
function productCard(p) {
  const div = document.createElement("div");
  div.className = "product-card";

  div.onclick = () =>
    (location.href = `product.html#id=${p.id}`);

  let priceHTML = `₹${p.price}`;
  if (p.offer) {
    priceHTML = `
      <span class="strike">₹${p.price}</span>
      <span class="final">₹${p.finalPrice}</span>
    `;
  }

  div.innerHTML = `
    <img src="${p.image}">
    <h3>${p.name}</h3>
    <p class="price">${priceHTML}</p>
    ${p.offer ? `<p class="offer">${p.offer}% OFF</p>` : ""}
  `;
  return div;
}

/* =====================
   SEARCH (NO REFRESH)
===================== */
function enableSearch() {
  searchInput.addEventListener("input", () => {
    const q = normalize(searchInput.value);

    if (!q) {
      buildAllProducts(allProductsData);
      return;
    }

    /* CATEGORY MATCH FIRST */
    const categorySection = [...document.querySelectorAll("section[data-category]")]
      .find(sec => sec.dataset.category.includes(q));

    if (categorySection) {
      categorySection.scrollIntoView({ behavior: "smooth" });
      return;
    }

    /* PRODUCT FILTER */
    const filtered = allProductsData.filter(p =>
      normalize(p.name + " " + p.category).includes(q)
    );

    buildAllProducts(filtered);

    document
      .getElementById("all-products-view")
      .scrollIntoView({ behavior: "smooth" });
  });
}

/* =====================
   PRICE SORT (FINAL PRICE)
===================== */
function enablePriceSort() {
  priceSort.addEventListener("change", () => {
    const value = priceSort.value;
    if (!value) return;

    const sorted = [...allProductsData];

    if (value === "low") {
      sorted.sort((a, b) => a.finalPrice - b.finalPrice);
    }

    if (value === "high") {
      sorted.sort((a, b) => b.finalPrice - a.finalPrice);
    }

    buildAllProducts(sorted);

    document
      .getElementById("all-products-view")
      .scrollIntoView({ behavior: "smooth" });
  });
}

/* =====================
   HELPER
===================== */
function normalize(text) {
  return text
    .toLowerCase()
    .replace(/sarees/g, "saree")
    .replace(/\s+/g, " ")
    .trim();
}
