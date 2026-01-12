console.log("SETTINGS JS LOADED");

const SETTINGS_CSV =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRQy_IyUbEkJlGmp-0V3UEPNxaCCYdeEL0tNiSHO5v7tYy_hxHv_XnoEh1OrdHeQdLYgs6o0nAqI3VY/pub?gid=0&single=true&output=csv&t=" +
  Date.now();

/* SAFE HELPERS */
function setText(id, value) {
  const el = document.getElementById(id);
  if (el && value) el.innerText = value;
}

function setAttr(id, attr, value) {
  const el = document.getElementById(id);
  if (el && value) el[attr] = value;
}

fetch(SETTINGS_CSV)
  .then(res => res.text())
  .then(csv => {
    const rows = csv.split("\n").slice(1);
    const settings = {};

    rows.forEach(row => {
      const firstComma = row.indexOf(",");
      if (firstComma === -1) return;
      const key = row.slice(0, firstComma).trim().toLowerCase();
      const value = row.slice(firstComma + 1).trim();
      settings[key] = value;
    });

    /* HEADER */
    setAttr("siteLogo", "src", settings.logo);
    setText("siteName", settings.sitename);

    /* BANNER */
    const banner = document.getElementById("banner");
    if (banner && settings.banner_image) {
      banner.style.backgroundImage = `url(${settings.banner_image})`;
    }

    /* FOOTER */
    if (settings.whatsapp) {
      setAttr("footerWhatsapp", "href", "https://wa.me/91" + settings.whatsapp);
    }
    setAttr("footerInstagram", "href", settings.instagram);
    setAttr("footerEmail", "href", settings.email);

    /* =====================
       WATERMARK (OVERLAY – GUARANTEED)
    ===================== */
    if (settings.watermark) {
      const wm = document.createElement("div");
      wm.id = "site-watermark";

      wm.style.position = "fixed";
      wm.style.inset = "0";
      wm.style.backgroundImage = `url(${settings.watermark})`;
      wm.style.backgroundRepeat = "no-repeat";
      wm.style.backgroundPosition = "center";
      wm.style.backgroundSize = "280px";
      wm.style.opacity = "0.05";
      wm.style.pointerEvents = "none";
      wm.style.zIndex = "999";

      document.body.appendChild(wm);
    }
  })
  .catch(err => console.error("Settings load failed", err));
