import { parseCSV } from "./utils.js";

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vR0cxY8q0h6DTn8bReKw37zohNTm02f2XzzsnSBCI8irCvAgr_OwvYWQPYr3QvS3PqlFRgXzPv3ZVtV/pub?gid=0&single=true&output=csv&t=" +
  Date.now();

const id = new URLSearchParams(location.hash.replace("#", "?")).get("id");

const productNameEl = document.getElementById("productName");
const productPrice = document.getElementById("productPrice");
const productOffer = document.getElementById("productOffer");
const productDesc = document.getElementById("productDesc");
const imageContainer = document.getElementById("imageContainer");

let currentName = "";
let currentPrice = "";

fetch(CSV_URL)
  .then(r => r.text())
  .then(csv => {
    let found = false;

    parseCSV(csv).forEach(c => {
      const status = (c[7] || "").toLowerCase().trim();
      if (status === "inactive") return;
      if (c[0] !== id) return;

      found = true;

      const images = c[3].split("||");
      const price = Number(c[4]);
      const offer = Number(c[5]) || 0;

      currentName = c[1];

      let final = price;
      let priceHTML = `₹${price}`;

      if (offer) {
        final = Math.round(price - (price * offer) / 100);
        priceHTML = `<span class="strike">₹${price}</span>
                     <span class="final">₹${final}</span>`;
        productOffer.innerText = offer + "% OFF";
      }

      currentPrice = final;
      productNameEl.innerText = currentName;
      productPrice.innerHTML = priceHTML;
      productDesc.innerText = c[6] || "";

      imageContainer.innerHTML = "";
      images.forEach(u => {
        imageContainer.innerHTML += `<img loading="lazy" src="${u.trim()}">`;
      });

      /* ✅ SOLD OUT HANDLING (CORRECT PLACE) */
      if (status === "soldout") {
        const buyBtn = document.querySelector(".buy-btn");
        buyBtn.innerText = "Sold Out";
        buyBtn.disabled = true;
        buyBtn.style.opacity = "0.6";
        buyBtn.style.cursor = "not-allowed";
      }
    });

    if (!found) {
      document.body.innerHTML =
        "<h2 style='text-align:center'>Product not found</h2>";
    }
  });

window.openPopup = () => {
  document.getElementById("orderPopup").style.display = "flex";
};

window.closePopup = () => {
  document.getElementById("orderPopup").style.display = "none";
};

window.sendWhatsAppOrder = () => {
  const name = custName.value.trim();
  const phone = custPhone.value.trim();
  const address = custAddress.value.trim();

  /* PHONE VALIDATION */
  if (!/^[0-9]{10}$/.test(phone)) {
    alert("Please enter a valid 10-digit mobile number");
    custPhone.focus();
    return;
  }

  if (!name || !address) {
    alert("Please fill all details");
    return;
  }

  /* ORDER DATE & NUMBER */
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

  const todayKey = today.toISOString().slice(0, 10);
  const saved = JSON.parse(localStorage.getItem("rv_orders") || "{}");

  if (saved.date !== todayKey) {
    saved.date = todayKey;
    saved.count = 1;
  } else {
    saved.count += 1;
  }

  localStorage.setItem("rv_orders", JSON.stringify(saved));

  const orderNumber = saved.count;

  const msg = `
🧵 New Order – Resha Vastra

📅 Date: ${dateStr}
🧾 Order No: ${orderNumber}

Product: ${currentName}
Price: ₹${currentPrice}

Customer Name: ${name}
Phone: ${phone}
Address:
${address}
  `.trim();

  window.open(
    "https://wa.me/917989639187?text=" + encodeURIComponent(msg),
    "_blank"
  );
};
