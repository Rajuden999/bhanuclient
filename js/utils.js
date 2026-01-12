export function parseCSV(csv) {
  return csv
    .split(/\r?\n/)
    .slice(1)
    .filter(l => l.trim())
    .map(line => {
      const out = [];
      let cur = "", q = false;

      for (let c of line) {
        if (c === '"') q = !q;
        else if (c === "," && !q) {
          out.push(cur);
          cur = "";
        } else cur += c;
      }
      out.push(cur);
      return out.map(v => v.replace(/^"|"$/g, "").trim());
    });
}

export function titleCase(text) {
  return text.replace(/\w\S*/g, w =>
    w.charAt(0).toUpperCase() + w.slice(1)
  );
}

export function safeId(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}
