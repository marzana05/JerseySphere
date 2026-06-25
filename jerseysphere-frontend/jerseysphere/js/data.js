/* ===========================================================
   JerseySphere — mock data layer
   No backend here. Everything the UI needs lives in this file.
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

/* Each product: id, clubId, name, league[], season, type(2026|retro),
   kit(Home|Away|Third), price, sizes{}, unisex, customizable,
   rating, reviewCount, note (retro history blurb), desc */
const PRODUCTS = [
  {
    id: "p01", clubId: "real-madrid", name: "Real Madrid 2026 Home Kit", league: ["La Liga", "UCL"],
    season: "2026", type: "2026", kit: "Home", price: 3800, unisex: true, customizable: true,
    rating: 4.8, reviewCount: 132,
    desc: "The 2026 home shirt in classic all-white with a fine gold trim across the collar and cuffs.",
    image: "assets/images/real-madrid-2026-home.webp",
    stock: { XS: 6, S: 14, M: 22, L: 18, XL: 9, "2XL": 4, "3XL": 0 },
  },
  {
    id: "p02", clubId: "real-madrid", name: "Real Madrid 2026 Away Kit", league: ["La Liga", "UCL"],
    season: "2026", type: "2026", kit: "Away", price: 3800, unisex: true, customizable: true,
    rating: 4.6, reviewCount: 58,
    desc: "Deep navy away kit with a subtle geometric weave pattern across the chest.",
    image: "assets/images/real-madrid-2026-away.webp",
    stock: { XS: 5, S: 10, M: 16, L: 14, XL: 7, "2XL": 5, "3XL": 2 },
  },
  {
    id: "p03", clubId: "real-madrid", name: "Real Madrid Retro 1998–99 Home", league: ["La Liga", "UCL"],
    season: "1998–99", type: "retro", kit: "Home", price: 4800, unisex: true, customizable: true,
    rating: 4.9, reviewCount: 76,
    note: "Worn during the side's seventh European Cup triumph, this kit is remembered for its understated purple trim breaking up the famous white.",
    desc: "A faithful recreation of the late-90s home shirt, including the woven crest of the era.",
    image: "assets/images/real-madrid-retro-1998.webp",
    stock: { XS: 3, S: 6, M: 9, L: 8, XL: 4, "2XL": 2, "3XL": 0 },
  },
  {
    id: "p04", clubId: "barcelona", name: "Barcelona 2026 Home Kit", league: ["La Liga", "UCL"],
    season: "2026", type: "2026", kit: "Home", price: 3800, unisex: true, customizable: true,
    rating: 4.7, reviewCount: 121,
    desc: "The blaugrana stripes return in a sharper, narrower cut for 2026, finished with a deep blue collar.",
    image: "assets/images/barcelona-2026-home.jpg",
    stock: { XS: 7, S: 15, M: 20, L: 17, XL: 8, "2XL": 3, "3XL": 1 },
  },
  {
    id: "p05", clubId: "barcelona", name: "Barcelona 2026 Third Kit", league: ["La Liga", "UCL"],
    season: "2026", type: "2026", kit: "Third", price: 3800, unisex: true, customizable: true,
    rating: 4.4, reviewCount: 33,
    desc: "A clean off-pitch third kit in soft ecru with maroon detailing on the sleeve cuffs.",
    image: "assets/images/barcelona-2026-third.jpg",
    stock: { XS: 4, S: 9, M: 13, L: 11, XL: 6, "2XL": 2, "3XL": 0 },
  },
  {
    id: "p06", clubId: "barcelona", name: "Barcelona Retro 1992 Home", league: ["La Liga", "UCL"],
    season: "1992", type: "retro", kit: "Home", price: 4800, unisex: true, customizable: true,
    rating: 4.9, reviewCount: 64,
    note: "The shirt worn on the run to the club's first ever European Cup, lifted at Wembley in 1992.",
    desc: "Recreated from the original pattern, right down to the boxy 90s collar.",
    image: "assets/images/barcelona-retro-1992.jpg",
    stock: { XS: 2, S: 5, M: 7, L: 6, XL: 3, "2XL": 1, "3XL": 0 },
  },
  {
    id: "p07", clubId: "liverpool", name: "Liverpool 2026 Home Kit", league: ["Premier League", "UCL"],
    season: "2026", type: "2026", kit: "Home", price: 3500, unisex: true, customizable: true,
    rating: 4.8, reviewCount: 145,
    desc: "All-red home kit with a tonal pinstripe and a soft gold badge surround.",
    image: "assets/images/liverpool-2026-home.jpg",
    stock: { XS: 6, S: 16, M: 24, L: 20, XL: 10, "2XL": 5, "3XL": 1 },
  },
  {
    id: "p08", clubId: "liverpool", name: "Liverpool Retro 1984 European Cup Home", league: ["Premier League", "UCL"],
    season: "1984", type: "retro", kit: "Home", price: 5500, unisex: true, customizable: true,
    rating: 5.0, reviewCount: 41,
    note: "Worn in the 1984 European Cup final in Rome — one of four European Cups lifted by the club in the era.",
    desc: "Crew-neck recreation with the classic embroidered crest, no sponsor across the chest.",
    image: "assets/images/liverpool-retro-1984.webp",
    stock: { XS: 2, S: 4, M: 6, L: 5, XL: 3, "2XL": 1, "3XL": 0 },
  },
  {
    id: "p09", clubId: "man-city", name: "Manchester City 2026 Home Kit", league: ["Premier League", "UCL"],
    season: "2026", type: "2026", kit: "Home", price: 3500, unisex: true, customizable: true,
    rating: 4.6, reviewCount: 98,
    desc: "Sky blue home shirt with a deeper navy yoke across the shoulders.",
    image: "assets/images/man-city-2026-home.jpg",
    stock: { XS: 5, S: 12, M: 19, L: 16, XL: 8, "2XL": 4, "3XL": 0 },
  },
  {
    id: "p10", clubId: "man-city", name: "Manchester City Retro 2011–12 Home", league: ["Premier League", "UCL"],
    season: "2011–12", type: "retro", kit: "Home", price: 4500, unisex: true, customizable: true,
    rating: 4.7, reviewCount: 29,
    note: "The shirt worn in the club's first Premier League title-winning season, settled in the final minute of the season.",
    desc: "Faithful reissue of the 2011–12 home shirt with the period-correct sponsor placement left blank.",
    image: "assets/images/man-city-retro-2011.webp",
    stock: { XS: 3, S: 6, M: 8, L: 7, XL: 4, "2XL": 1, "3XL": 0 },
  },
  {
    id: "p11", clubId: "chelsea", name: "Chelsea 2026 Home Kit", league: ["Premier League", "UCL"],
    season: "2026", type: "2026", kit: "Home", price: 3500, unisex: true, customizable: true,
    rating: 4.5, reviewCount: 87,
    desc: "Royal blue home kit with a tonal chevron knit and white trim.",
    image: "assets/images/chelsea-2026-home.webp",
    stock: { XS: 4, S: 11, M: 17, L: 15, XL: 7, "2XL": 3, "3XL": 0 },
  },
  {
    id: "p12", clubId: "chelsea", name: "Chelsea Retro 1997 FA Cup Home", league: ["Premier League", "UCL"],
    season: "1997", type: "retro", kit: "Home", price: 4800, unisex: true, customizable: true,
    rating: 4.8, reviewCount: 22,
    note: "Worn during the club's first major trophy in 26 years, breaking a long wait for silverware.",
    desc: "Reissued with the original wide collar and centred crest placement.",
    image: "assets/images/chelsea-retro-1997.avif",
    stock: { XS: 2, S: 4, M: 6, L: 5, XL: 2, "2XL": 1, "3XL": 0 },
  },
  {
    id: "p13", clubId: "inter-milan", name: "Inter Milan 2026 Home Kit", league: ["UCL"],
    season: "2026", type: "2026", kit: "Home", price: 3500, unisex: true, customizable: true,
    rating: 4.7, reviewCount: 54,
    desc: "The famous navy and black stripes, narrowed for 2026 with a tonal gold thread running through.",
    image: "assets/images/inter-milan-2026-home.webp",
    stock: { XS: 3, S: 9, M: 14, L: 12, XL: 6, "2XL": 2, "3XL": 0 },
  },
  {
    id: "p14", clubId: "inter-milan", name: "Inter Milan Retro 1998 Home", league: ["UCL"],
    season: "1998", type: "retro", kit: "Home", price: 4800, unisex: true, customizable: true,
    rating: 4.8, reviewCount: 19,
    note: "Worn during the club's UEFA Cup-winning campaign of 1997–98.",
    desc: "Bold block stripes with the period crest, recreated true to the original cut.",
    image: "assets/images/inter-milan-retro-1998.avif",
    stock: { XS: 2, S: 5, M: 7, L: 6, XL: 3, "2XL": 1, "3XL": 0 },
  },
  {
    id: "p15", clubId: "inter-miami", name: "Inter Miami CF 2026 Home Kit", league: ["MLS"],
    season: "2026", type: "2026", kit: "Home", price: 3200, unisex: true, customizable: true,
    rating: 4.6, reviewCount: 67,
    desc: "Pink and black home kit with a heron motif woven into the inner collar.",
    image: "assets/images/inter-miami-2026-home.jpg",
    stock: { XS: 6, S: 13, M: 18, L: 15, XL: 7, "2XL": 3, "3XL": 1 },
  },
  {
    id: "p16", clubId: "inter-miami", name: "Inter Miami CF 2026 Away Kit", league: ["MLS"],
    season: "2026", type: "2026", kit: "Away", price: 3200, unisex: true, customizable: true,
    rating: 4.4, reviewCount: 25,
    desc: "Clean black away kit with pink trim across the sleeve cuffs.",
    image: "assets/images/inter-miami-2026-away.jpeg",
    stock: { XS: 4, S: 8, M: 12, L: 10, XL: 5, "2XL": 2, "3XL": 0 },
  },
];

function getProduct(id) { return PRODUCTS.find((p) => p.id === id); }
function getClubFor(product) { return club(product.clubId); }

/* Seed reviews — keyed by product id. Users can add their own at runtime;
   those are merged in from localStorage at render time (see product.js). */
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
