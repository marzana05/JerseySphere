/* ===========================================================
   Jersey Universe — data layer
   Products are fetched from WordPress REST API.
   Club colors, logos and league data stay here since
   they don't change often and don't need a database.
   =========================================================== */

const CLUBS = [
  { id: "real-madrid", name: "Real Madrid", leagues: ["La Liga", "UCL"], primary: "#FFFFFF", secondary: "#D9A441", tag: "RMA", logo: "assets/images/real-madrid-logo.webp" },
  { id: "barcelona", name: "FC Barcelona", leagues: ["La Liga", "UCL"], primary: "#A50044", secondary: "#004D98", tag: "FCB", logo: "assets/images/barcelona-logo.webp" },
  { id: "liverpool", name: "Liverpool", leagues: ["Premier League", "UCL"], primary: "#C8102E", secondary: "#F3EFE3", tag: "LFC", logo: "assets/images/liverpool-logo.webp" },
  { id: "man-city", name: "Manchester City", leagues: ["Premier League", "UCL"], primary: "#6CABDD", secondary: "#1C2C5B", tag: "MCFC", logo: "assets/images/man-city-logo.webp" },
  { id: "chelsea", name: "Chelsea", leagues: ["Premier League", "UCL"], primary: "#034694", secondary: "#F3EFE3", tag: "CFC", logo: "assets/images/chelsea-logo.webp" },
  { id: "inter-milan", name: "Inter Milan", leagues: ["UCL"], primary: "#0E1E40", secondary: "#F3EFE3", tag: "INT", logo: "assets/images/inter-milan-logo.webp" },
  { id: "inter-miami", name: "Inter Miami CF", leagues: ["MLS"], primary: "#F7B5CD", secondary: "#231F20", tag: "IMCF", logo: "assets/images/inter-miami-logo.webp" },
];

const LEAGUES = ["La Liga", "Premier League", "UCL", "MLS"];
const SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];

function club(id) { return CLUBS.find((c) => c.id === id); }

/* -------------------------------------------------------
   PRODUCTS — fetched from WordPress
   Empty at first, filled by loadProducts() below
------------------------------------------------------- */
let PRODUCTS = [];
let _productsLoaded = false;

/* Maps a WordPress API response item into the format
   the rest of the frontend already expects */
function mapWordPressProduct(item) {
  /* Stock comes back as a plain object from WordPress
     e.g. { XS: "6", S: "14", M: "22" ... }
     We convert each value to a real number */
  var rawStock = item.stock || {};
  var stock = {};
  SIZES.forEach(function(size) {
    stock[size] = parseInt(rawStock[size]) || 0;
  });

  /* League comes back as a plain string from WordPress
     e.g. "La Liga, UCL"
     We split it into an array the way the frontend expects */
  var leagueRaw = item.league || "";
  var leagueArray = leagueRaw
    ? leagueRaw.split(",").map(function(l) { return l.trim(); })
    : [];

  /* Featured image — now returned directly as front_image field
     No longer depends on _embedded which had permission issues */
  var image = item.front_image || null;

  /* Back view and close up images from custom fields */
  var backImage    = item.back_image    || null;
  var closeupImage = item.closeup_image || null;

  return {
    id:           item.slug,
    clubId:       item.club        || "",
    name:         item.title.rendered,
    league:       leagueArray,
    season:       item.season      || "",
    type:         item.type        || "2026",
    kit:          item.kit         || "Home",
    price:            parseFloat(item.price) || 0,
    customizationFee: parseFloat(item.customization_fee) || 300,
    unisex:       true,
    customizable: true,
    desc:         item.desc        || "",
    note:         item.note        || null,
    image:        image,
    backImage:    backImage,
    closeupImage: closeupImage,
    stock:        stock,
    rating:       0,
    reviewCount:  0,
  };
}

async function loadProducts() {
  if (_productsLoaded) return PRODUCTS;

  try {
    var response = await fetch(
      "https://jerseyuniverse.shop/wp-json/wp/v2/jersey?per_page=100"
    );

    if (!response.ok) {
      throw new Error("WordPress API returned " + response.status);
    }

    var items = await response.json();
    PRODUCTS = items.map(mapWordPressProduct);
    _productsLoaded = true;

  } catch (err) {
    console.error("Could not load products from WordPress:", err.message);
    console.warn("Could not reach jerseyuniverse.shop — check your internet connection.");
    PRODUCTS = [];
  }

  return PRODUCTS;
}

function getProduct(id) { return PRODUCTS.find((p) => p.id === id); }
function getClubFor(product) { return club(product.clubId); }

/* Seed reviews — these stay hardcoded since reviews
   are not yet stored in WordPress */
const SEED_REVIEWS = {
  p01: [
    { name: "Tahmid R.", rating: 5, title: "Fits true to size", body: "Ordered a medium and it sits exactly like the official kit. Customization print is sharp and didn't crack after a wash.", verified: true, date: "2026-05-02" },
    { name: "Ayesha K.", rating: 4, title: "Great shirt, slow restock on XL", body: "Lovely fabric and the gold trim looks premium in person. Just wish XL hadn't been out of stock for a week.", verified: true, date: "2026-04-18" },
  ],
  p03: [
    { name: "Imran H.", rating: 5, title: "Exactly the kit I remembered", body: "Grew up watching this team in this shirt. The retro print and collar shape are spot on.", verified: true, date: "2026-03-11" },
  ],
  p07: [
    { name: "Sadia P.", rating: 5, title: "Comfortable for matchday", body: "Light, breathable, and the pinstripe only shows up properly in direct light which is a nice detail.", verified: true, date: "2026-05-20" },
    { name: "Rafiq A.", rating: 4, title: "Good but runs slightly large", body: "Sized down to a small from my usual medium and it fits better now.", verified: false, date: "2026-05-09" },
  ],
};
