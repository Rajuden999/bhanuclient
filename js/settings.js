console.log("SETTINGS JS LOADED");
window.onerror = (m, s, l) => console.error("JS ERROR:", m, s, l);

const SETTINGS_CSV =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRQy_IyUbEkJlGmp-0V3UEPNxaCCYdeEL0tNiSHO5v7tYy_hxHv_XnoEh1OrdHeQdLYgs6o0nAqI3VY/pub?gid=0&single=true&output=csv&t=" +
  Date.now();

/* SAFE HELPER */
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
      const [key, value] = row.split(",");
      if (key && value) {
        settings[key.trim().toLowerCase()] = value.trim();
      }
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
      setAttr(
        "footerWhatsapp",
        "href",
        "https://wa.me/91" + settings.whatsapp
      );
    }

    setAttr("footerInstagram", "href", settings.instagram);
    setAttr("footerEmail", "href", settings.email);
  })
  .catch(err => {
    console.error("Settings load failed", err);
  });
