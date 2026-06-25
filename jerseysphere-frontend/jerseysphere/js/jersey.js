/* ===========================================================
   JerseySphere — jersey illustration
   A simplified jersey silhouette so every product has a visual
   without using any real club crests or photography.
   =========================================================== */

function jerseySVG({ primary = "#16241C", secondary = "#D9A441", name = "", number = "", retro = false, size = 240 }) {
  const printName = (name || "").toUpperCase().slice(0, 12);
  const printNumber = (number || "").toString().slice(0, 2);
  const hasPrint = printName || printNumber;

  return `
  <svg viewBox="0 0 200 220" width="${size}" height="${size * 1.1}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Jersey preview">
    <path d="M50,20 L90,20 L100,34 L110,20 L150,20 L180,55 L163,82 L150,72 L150,202 L50,202 L50,72 L37,82 L20,55 Z"
      fill="${primary}" stroke="rgba(0,0,0,0.25)" stroke-width="2"/>
    <path d="M50,20 L90,20 L100,34 L110,20 L150,20" fill="none" stroke="${secondary}" stroke-width="4" stroke-linecap="round"/>
    <rect x="20" y="55" width="20" height="9" fill="${secondary}" opacity="0.85"/>
    <rect x="160" y="55" width="20" height="9" fill="${secondary}" opacity="0.85"/>
    ${retro ? `<line x1="58" y1="40" x2="142" y2="40" stroke="${secondary}" stroke-width="1.5" opacity="0.5"/>` : ""}
    ${
      hasPrint
        ? `<text x="100" y="100" text-anchor="middle" font-family="'Anton', sans-serif" font-size="13" letter-spacing="1" fill="${secondary}">${printName}</text>
           <text x="100" y="150" text-anchor="middle" font-family="'Anton', sans-serif" font-size="44" fill="${secondary}">${printNumber}</text>`
        : ""
    }
  </svg>`;
}

/* Small woven-label corner tag used on every card — the site's signature element */
function kitTag({ clubTag, season, type }) {
  const label = type === "retro" ? "RETRO" : season;
  return `<span class="kit-tag">${clubTag} <span class="kit-tag-dot">·</span> ${label}</span>`;
}
