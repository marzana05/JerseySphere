/* ===========================================================
   JerseySphere — shop page logic
   Reads initial state from the URL (?club=, ?league=, ?type=,
   ?search=), renders filter controls, and re-filters the grid
   on every change without a full page reload.
   =========================================================== */

const state = {
  clubs: new Set(),
  leagues: new Set(),
  types: new Set(),
  kits: new Set(),
  search: "",
  sort: "featured",
};

function readInitialStateFromURL() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("club")) state.clubs.add(params.get("club"));
  if (params.get("league")) state.leagues.add(params.get("league"));
  if (params.get("type")) state.types.add(params.get("type"));
  if (params.get("search")) state.search = params.get("search");
}

function buildFilterControls() {
  document.getElementById("filter-type").innerHTML = ["2026", "retro"].map((t) => checkboxRow("types", t, t === "2026" ? "2026 club kits" : "Retro / vintage")).join("");
  document.getElementById("filter-league").innerHTML = LEAGUES.map((l) => checkboxRow("leagues", l, l)).join("");
  document.getElementById("filter-club").innerHTML = CLUBS.map((c) => checkboxRow("clubs", c.id, c.name)).join("");
  document.getElementById("filter-kit").innerHTML = ["Home", "Away", "Third"].map((k) => checkboxRow("kits", k, k)).join("");

  document.querySelectorAll("[data-filter-input]").forEach((input) => {
    const group = input.dataset.group, value = input.dataset.value;
    input.checked = state[group].has(value);
    input.addEventListener("change", () => {
      input.checked ? state[group].add(value) : state[group].delete(value);
      syncAndRender();
    });
  });
}

function checkboxRow(group, value, label) {
  return `
  <label class="flex items-center gap-2 text-sm text-ecru cursor-pointer">
    <input type="checkbox" data-filter-input data-group="${group}" data-value="${value}"
      class="w-4 h-4 rounded border-line bg-surface2 text-gold focus:ring-gold focus:ring-offset-0" />
    ${label}
  </label>`;
}

function filteredProducts() {
  let list = PRODUCTS.filter((p) => {
    if (state.clubs.size && !state.clubs.has(p.clubId)) return false;
    if (state.leagues.size && !p.league.some((l) => state.leagues.has(l))) return false;
    if (state.types.size && !state.types.has(p.type)) return false;
    if (state.kits.size && !state.kits.has(p.kit)) return false;
    if (state.search) {
      const c = club(p.clubId);
      const hay = [p.name, c.name, p.season, p.type, p.kit, ...p.league].join(" ").toLowerCase();
      if (!hay.includes(state.search.toLowerCase())) return false;
    }
    return true;
  });

  if (state.sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
  if (state.sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
  if (state.sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
  return list;
}

function renderActiveTags() {
  const tags = [];
  state.clubs.forEach((id) => tags.push({ label: club(id).name, clear: () => state.clubs.delete(id) }));
  state.leagues.forEach((l) => tags.push({ label: l, clear: () => state.leagues.delete(l) }));
  state.types.forEach((t) => tags.push({ label: t === "2026" ? "2026 kits" : "Retro", clear: () => state.types.delete(t) }));
  state.kits.forEach((k) => tags.push({ label: k, clear: () => state.kits.delete(k) }));
  if (state.search) tags.push({ label: `"${state.search}"`, clear: () => { state.search = ""; document.querySelectorAll("[data-search-input]").forEach((i) => i.value = ""); } });

  const el = document.getElementById("active-tags");
  if (!tags.length) { el.innerHTML = ""; return; }
  el.innerHTML = tags.map((t, i) => `
    <button data-tag-clear="${i}" class="inline-flex items-center gap-1.5 bg-surface border border-line text-ecru text-xs font-mono px-3 py-1.5 rounded-full hover:border-gold">
      ${t.label} <span class="text-muted">✕</span>
    </button>`).join("");
  el.querySelectorAll("[data-tag-clear]").forEach((btn) => {
    btn.addEventListener("click", () => { tags[+btn.dataset.tagClear].clear(); syncAndRender(); });
  });
}

function renderGrid() {
  const list = filteredProducts();
  document.getElementById("result-count").textContent = `${list.length} jersey${list.length === 1 ? "" : "s"} found`;
  const grid = document.getElementById("product-grid");
  if (!list.length) {
    grid.className = "";
    grid.innerHTML = emptyState({
      title: "No jerseys found",
      body: "Try clearing a filter, or browse a few popular categories below.",
      ctaLabel: "Clear all filters",
      ctaHref: "shop.html",
    });
  } else {
    grid.className = "grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5";
    grid.innerHTML = list.map(productCardHTML).join("");
  }
}

function syncAndRender() {
  renderActiveTags();
  renderGrid();
  buildFilterControls(); // re-checks boxes to match state after a tag is cleared
}

function wireFilterToggleMobile() {
  const btn = document.querySelector("[data-filter-toggle]");
  const panel = document.querySelector("[data-filter-panel]");
  if (!btn || !panel) return;
  btn.addEventListener("click", () => panel.classList.toggle("hidden"));
}

function wireSort() {
  const sel = document.getElementById("sort-select");
  sel.value = state.sort;
  sel.addEventListener("change", () => { state.sort = sel.value; renderGrid(); });
}

function wireClearAll() {
  document.getElementById("clear-filters").addEventListener("click", () => {
    state.clubs.clear(); state.leagues.clear(); state.types.clear(); state.kits.clear(); state.search = "";
    document.querySelectorAll("[data-search-input]").forEach((i) => (i.value = ""));
    history.replaceState(null, "", "shop.html");
    syncAndRender();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  readInitialStateFromURL();
  buildFilterControls();
  wireFilterToggleMobile();
  wireSort();
  wireClearAll();
  renderActiveTags();
  renderGrid();

  const searchVal = state.search;
  if (searchVal) {
    document.querySelectorAll("[data-search-input]").forEach((i) => (i.value = searchVal));
  }
});
