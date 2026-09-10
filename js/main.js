/* =========================================================
   EAST CHEM PLC — shared site behaviour
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  applyI18n();
  initNav();
  initLangSwitch();
  initCounters();
  initAdvisor();
  initProductGrids();
  initModal();
  initContactForm();
});

/* ---------- translations ---------- */
function applyI18n(){
  document.documentElement.lang = getLang();
  document.querySelectorAll("[data-i18n]").forEach(el => {
    el.textContent = t(el.getAttribute("data-i18n"));
  });
  document.querySelectorAll("[data-i18n-ph]").forEach(el => {
    el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph")));
  });
  const page = document.body.dataset.page;
  document.querySelectorAll(".nav-links a[data-page]").forEach(a => {
    a.classList.toggle("active", a.dataset.page === page);
  });
}

/* ---------- nav ---------- */
function initNav(){
  const burger = document.querySelector(".hamburger");
  const links = document.querySelector(".nav-links");
  if(burger && links){
    burger.addEventListener("click", () => links.classList.toggle("open"));
    links.querySelectorAll("a").forEach(a => a.addEventListener("click", () => links.classList.remove("open")));
  }
}

/* ---------- language switch ---------- */
function initLangSwitch(){
  const btn = document.querySelector(".lang-btn");
  const menu = document.querySelector(".lang-menu");
  if(!btn || !menu) return;
  const current = getLang();
  menu.innerHTML = "";
  SUPPORTED_LANGS.forEach(l => {
    const b = document.createElement("button");
    b.textContent = I18N[l].lang_names[l];
    b.setAttribute("aria-current", String(l === current));
    b.addEventListener("click", () => { setLang(l); location.reload(); });
    menu.appendChild(b);
  });
  btn.querySelector(".lang-current").textContent = I18N[current]._label.slice(0,2).toUpperCase();
  btn.addEventListener("click", (e) => { e.stopPropagation(); menu.classList.toggle("open"); });
  document.addEventListener("click", () => menu.classList.remove("open"));
}

/* ---------- hero stat counters ---------- */
function initCounters(){
  const stats = document.querySelectorAll(".stat b[data-count]");
  if(!stats.length) return;
  stats.forEach(el => {
    const target = parseInt(el.getAttribute("data-count"), 10);
    const suffix = el.getAttribute("data-suffix") || "";
    let cur = 0;
    const step = Math.max(1, Math.round(target / 40));
    const tick = () => {
      cur = Math.min(target, cur + step);
      el.textContent = cur.toLocaleString() + suffix;
      if(cur < target) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

/* ---------- crop & soil advisor (home page) ---------- */
const ADVISOR_MAP = {
  weeds: "herbicide",
  insects: "pesticide",
  fungal: "fungicide",
  fertility: "fertilizer",
  seedborne: "seed"
};
function initAdvisor(){
  const form = document.getElementById("advisor-form");
  if(!form) return;
  const result = document.getElementById("advisor-result");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const concern = form.concern.value;
    const cat = ADVISOR_MAP[concern] || "fertilizer";
    const titleKey = "cat_" + (cat === "fertilizer" ? "fert" : cat) + "_t";
    const descKey = "cat_" + (cat === "fertilizer" ? "fert" : cat) + "_d";
    result.classList.remove("empty");
    result.innerHTML = `
      <h4>${t("adv_result_t")} ${t(titleKey)}</h4>
      <p>${t(descKey)}</p>
      <a class="btn btn-primary btn-sm" href="products.html?cat=${cat}">${t("strip_view")}</a>
    `;
  });
}

/* ---------- product rendering ---------- */
function productField(p, field, lang){
  if(!p[field]) return "";
  return p[field][lang] || p[field].en || "";
}

function productCardHTML(p, lang){
  const catClass = "c-" + p.category;
  const img = p.image ? `<img src="${p.image}" alt="" class="product-card-img">` : "";
  return `
    <article class="product-card ${catClass}" data-id="${p.id}" tabindex="0" role="button" aria-haspopup="dialog">
      ${p.featured ? `<span class="tag">${t("badge_popular")}</span>` : ""}
      ${img}
      <span class="cat" data-i18n-cat="${p.category}"></span>
      <h3>${productField(p,"name",lang)}</h3>
      <p>${productField(p,"desc",lang)}</p>
      <div class="meta"><span>${productField(p,"pack",lang)}</span></div>
    </article>
  `;
}

function catLabelKey(cat){
  const map = { fertilizer:"cat_fert_t", herbicide:"cat_herb_t", pesticide:"cat_pest_t", fungicide:"cat_fung_t", seed:"cat_seed_t" };
  return map[cat] || "cat_fert_t";
}

function initProductGrids(){
  const lang = getLang();
  const products = (typeof getAllProducts === "function") ? getAllProducts() : [];

  /* featured strip on homepage */
  const featuredWrap = document.getElementById("featured-grid");
  if(featuredWrap){
    const featured = products.filter(p => p.featured).slice(0,4);
    featuredWrap.innerHTML = featured.map(p => productCardHTML(p, lang)).join("");
    featuredWrap.querySelectorAll("[data-i18n-cat]").forEach(el => el.textContent = t(catLabelKey(el.dataset.i18nCat)));
    attachCardOpeners(featuredWrap, products);
  }

  /* full catalog on products page */
  const grid = document.getElementById("product-grid");
  if(!grid) return;

  const params = new URLSearchParams(location.search);
  let activeCat = params.get("cat") || "all";
  const searchInput = document.getElementById("product-search");
  const chips = document.querySelectorAll(".filter-chip");

  function render(){
    const term = (searchInput?.value || "").trim().toLowerCase();
    const filtered = products.filter(p => {
      const catOk = activeCat === "all" || p.category === activeCat;
      if(!catOk) return false;
      if(!term) return true;
      const hay = (productField(p,"name",lang) + " " + productField(p,"name","en") + " " + productField(p,"desc",lang)).toLowerCase();
      return hay.includes(term);
    });
    grid.innerHTML = filtered.length
      ? filtered.map(p => productCardHTML(p, lang)).join("")
      : `<p>${t("pp_empty")}</p>`;
    grid.querySelectorAll("[data-i18n-cat]").forEach(el => el.textContent = t(catLabelKey(el.dataset.i18nCat)));
    attachCardOpeners(grid, products);
  }

  chips.forEach(chip => {
    if(chip.dataset.cat === activeCat) chip.classList.add("active"); else chip.classList.remove("active");
    chip.addEventListener("click", () => {
      activeCat = chip.dataset.cat;
      chips.forEach(c => c.classList.toggle("active", c === chip));
      render();
    });
  });
  if(searchInput) searchInput.addEventListener("input", render);
  render();
}

/* ---------- product detail modal ---------- */
function attachCardOpeners(container, products){
  container.querySelectorAll(".product-card").forEach(card => {
    const open = () => openProductModal(products.find(p => p.id === card.dataset.id));
    card.addEventListener("click", open);
    card.addEventListener("keypress", (e) => { if(e.key === "Enter") open(); });
  });
}

function initModal(){
  const backdrop = document.getElementById("product-modal");
  if(!backdrop) return;
  backdrop.addEventListener("click", (e) => { if(e.target === backdrop) closeProductModal(); });
  backdrop.querySelector(".modal-close")?.addEventListener("click", closeProductModal);
  document.addEventListener("keydown", (e) => { if(e.key === "Escape") closeProductModal(); });
}
function openProductModal(p){
  const backdrop = document.getElementById("product-modal");
  if(!backdrop || !p) return;
  const lang = getLang();
  const img = p.image ? `<img src="${p.image}" alt="" style="width:100%;border-radius:8px;margin-bottom:16px;max-height:260px;object-fit:cover">` : "";
  backdrop.querySelector(".modal-body").innerHTML = `
    ${img}
    <span class="cat">${t(catLabelKey(p.category))}</span>
    <h2>${productField(p,"name",lang)}</h2>
    <p>${productField(p,"desc",lang)}</p>
    <div class="modal-section"><h4>${t("pp_material")}</h4><p>${productField(p,"material",lang)}</p></div>
    <div class="modal-section"><h4>${t("pp_usage")}</h4><p>${productField(p,"usage",lang)}</p></div>
    <div class="modal-section"><h4>${t("pp_pack")}</h4><p>${productField(p,"pack",lang)}</p></div>
    <div class="modal-section">
      <a class="btn btn-primary" href="contact.html?product=${encodeURIComponent(productField(p,"name","en"))}">${t("pp_inquire")}</a>
    </div>
  `;
  backdrop.classList.add("open");
}
function closeProductModal(){
  document.getElementById("product-modal")?.classList.remove("open");
}

/* ---------- contact form (mailto fallback — no backend on a free static site) ---------- */
function initContactForm(){
  const form = document.getElementById("contact-form");
  if(!form) return;

  const params = new URLSearchParams(location.search);
  const productParam = params.get("product");
  if(productParam && form.message){
    form.message.value = `Hello, I'd like to ask about: ${productParam}\n\n`;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    const phone = form.phone.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();
    const subject = encodeURIComponent(`Website inquiry from ${name || "a customer"}`);
    const body = encodeURIComponent(`${message}\n\n— ${name}\nPhone: ${phone}\nEmail: ${email}`);
    window.location.href = `mailto:info@eastchem.example?subject=${subject}&body=${body}`;
    document.getElementById("contact-sent").hidden = false;
  });
}
