/* =========================================================
   EAST CHEM PLC — shared site behaviour
   Loads all data from Firestore once (falling back to the
   built-in sample data if Firebase isn't configured yet),
   caches it, then renders every page from that cache.
   ========================================================= */

var PRODUCTS_CACHE = [];
var CATEGORIES_CACHE = [];
var TESTIMONIALS_CACHE = [];
var SOCIAL_CACHE = {};
var CONTENT_CACHE = {};

document.addEventListener("DOMContentLoaded", async () => {
  applyI18n();
  initNav();
  initLangSwitch();
  await loadSiteData();

  renderHeroText();
  renderHeroStats();
  renderContactInfo();
  renderAboutContent();
  initAdvisor();
  renderCategoryGrid();
  initProductGrids();
  initModal();
  initContactForm();
  renderSocialIcons();
});

async function loadSiteData(){
  const [products, categories, testimonials, social, content] = await Promise.all([
    fetchProducts(), fetchCategories(), fetchTestimonials(), fetchSocialLinks(), fetchContent()
  ]);
  PRODUCTS_CACHE = products;
  CATEGORIES_CACHE = categories;
  TESTIMONIALS_CACHE = testimonials;
  SOCIAL_CACHE = social;
  CONTENT_CACHE = content;
}

/* ---------- translations (static interface chrome) ---------- */
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

/* ---------- dynamic content (admin-editable via Firestore) ---------- */
function renderHeroText(){
  const lang = getLang();
  const h = CONTENT_CACHE.hero;
  if(!h) return;
  const set = (id, obj) => { const el = document.getElementById(id); if(el && obj) el.textContent = obj[lang] || obj.en; };
  set("hero-eyebrow", h.eyebrow);
  set("hero-title", h.title);
  set("hero-subtitle", h.subtitle);
}

function parseStatNumber(str){
  const m = String(str||"0").match(/^([\d,]+)(.*)$/);
  if(!m) return { value: 0, suffix: str||"" };
  return { value: parseInt(m[1].replace(/,/g,""),10) || 0, suffix: m[2] || "" };
}

function renderHeroStats(){
  const wrap = document.getElementById("hero-stats-card");
  if(!wrap || !CONTENT_CACHE.stats) return;
  const lang = getLang();
  wrap.innerHTML = CONTENT_CACHE.stats.map(s => {
    const { value, suffix } = parseStatNumber(s.number);
    const label = (s.label && (s.label[lang] || s.label.en)) || "";
    return `<div class="stat"><b data-count="${value}" data-suffix="${suffix}">0</b><span>${label}</span></div>`;
  }).join("");
  initCounters();
}

function renderContactInfo(){
  const c = CONTENT_CACHE.contact;
  if(!c) return;
  const lang = getLang();
  const set = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };
  set("contact-address", (c.address && (c.address[lang] || c.address.en)) || "");
  set("contact-phone", c.phone || "");
  set("contact-email", c.email || "");
  set("contact-hours", (c.hours && (c.hours[lang] || c.hours.en)) || "");
}

function renderAboutContent(){
  const a = CONTENT_CACHE.about;
  if(!a) return;
  const lang = getLang();
  const set = (id, obj) => { const el = document.getElementById(id); if(el && obj) el.textContent = obj[lang] || obj.en; };
  set("ab-lede", a.lede);
  set("ab-mission-title", a.missionTitle);
  set("ab-mission-text", a.missionText);
  set("ab-story-heading", a.storyHeading);
  (a.timeline || []).forEach((item, i) => {
    set("ab-t" + (i+1) + "-year", item.year);
    set("ab-t" + (i+1) + "-text", item.text);
  });
  set("ab-values-heading", a.valuesHeading);
  (a.values || []).forEach((item, i) => {
    set("ab-v" + (i+1) + "-title", item.title);
    set("ab-v" + (i+1) + "-text", item.text);
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
    const catId = ADVISOR_MAP[concern] || "fertilizer";
    const cat = getCategory(catId);
    const lang = getLang();
    result.classList.remove("empty");
    result.innerHTML = `
      <h4>${t("adv_result_t")} ${catField(cat,"name",lang)}</h4>
      <p>${catField(cat,"desc",lang)}</p>
      <a class="btn btn-primary btn-sm" href="products.html?cat=${catId}">${t("strip_view")}</a>
    `;
  });
}

/* ---------- category grid (homepage) ---------- */
function renderCategoryGrid(){
  const wrap = document.getElementById("category-grid");
  if(!wrap) return;
  const lang = getLang();
  wrap.innerHTML = CATEGORIES_CACHE.map(cat => `
    <a href="products.html?cat=${cat.id}" class="cat-photo-card">
      <div class="img-slot" data-slot="cat-${cat.id}.jpg" style="border-top:5px solid ${cat.color}">
        <img src="cat-${cat.id}.jpg" alt="" onerror="this.parentElement.classList.add('img-missing')">
        <div class="img-slot-hint"><b>cat-${cat.id}.jpg</b><span>${t("slot_cat_generic")}</span></div>
      </div>
      <div class="cat-photo-label">
        <h3>${catField(cat,"name",lang)}</h3>
        <span style="color:${cat.color}">${t("strip_view")}</span>
      </div>
    </a>
  `).join("");
}

/* ---------- product rendering ---------- */
function productField(p, field, lang){
  if(!p[field]) return "";
  return p[field][lang] || p[field].en || "";
}

function productCardHTML(p, lang){
  const cat = getCategory(p.category);
  const hasBadge = p.badge && p.badge !== "none";
  const badgeHTML = hasBadge ? `<span class="tag tag-${p.badge}">${t("badge_" + p.badge)}</span>` : "";
  const img = p.image ? `
    <div class="img-slot product-card-img-wrap">
      <img src="${p.image}" alt="" onerror="this.parentElement.classList.add('img-missing')">
      <div class="img-slot-hint"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-4 4-3-3-6 6"/></svg></div>
      ${hasBadge ? `<span class="tag tag-on-image tag-${p.badge}">${t("badge_" + p.badge)}</span>` : ""}
    </div>` : "";
  return `
    <article class="product-card" data-id="${p.id}" tabindex="0" role="button" aria-haspopup="dialog" style="border-top-color:${cat.color}">
      ${img}
      ${(!p.image && hasBadge) ? badgeHTML : ""}
      <span class="cat" style="color:${cat.color}">${catField(cat,"name",lang)}</span>
      <h3>${productField(p,"name",lang)}</h3>
      <p>${productField(p,"desc",lang)}</p>
      <div class="meta"><span>${productField(p,"pack",lang)}</span></div>
    </article>
  `;
}

function initProductGrids(){
  const lang = getLang();
  const products = PRODUCTS_CACHE;

  /* featured strip on homepage: any product with a badge (Popular or New) */
  const featuredWrap = document.getElementById("featured-grid");
  if(featuredWrap){
    const featured = products.filter(p => p.badge && p.badge !== "none").slice(0,4);
    featuredWrap.innerHTML = featured.map(p => productCardHTML(p, lang)).join("");
    attachCardOpeners(featuredWrap, products);
  }

  /* full catalog on products page */
  const grid = document.getElementById("product-grid");
  if(!grid) return;

  const params = new URLSearchParams(location.search);
  let activeCat = params.get("cat") || "all";
  const searchInput = document.getElementById("product-search");
  const filterBar = document.querySelector(".filter-bar");

  if(filterBar){
    const chipHTML = [`<button class="filter-chip" data-cat="all">${t("pp_all")}</button>`]
      .concat(CATEGORIES_CACHE.map(c => `<button class="filter-chip" data-cat="${c.id}">${catField(c,"name",lang)}</button>`))
      .join("");
    filterBar.innerHTML = chipHTML;
  }
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
function productTestimonialsHTML(productId){
  const lang = getLang();
  const items = TESTIMONIALS_CACHE.filter(x => x.productId === productId);
  if(!items.length) return "";
  const cards = items.map(x => {
    const media = x.mediaType === "video"
      ? `<video src="${x.filename}" controls playsinline onerror="this.parentElement.classList.add('img-missing')"></video>`
      : `<img src="${x.filename}" alt="" onerror="this.parentElement.classList.add('img-missing')">`;
    const quote = (x.quote && (x.quote[lang] || x.quote.en)) || "";
    return `
      <div class="testimonial-card">
        <div class="img-slot testimonial-media">
          ${x.filename ? media : ""}
          <div class="img-slot-hint"><b>${x.filename || ""}</b></div>
        </div>
        <p class="testimonial-quote">"${quote}"</p>
        <p class="testimonial-name">— ${x.name || ""}</p>
      </div>
    `;
  }).join("");
  return `<div class="modal-section"><h4>${t("pp_testimonials")}</h4><div class="testimonial-grid">${cards}</div></div>`;
}

function openProductModal(p){
  const backdrop = document.getElementById("product-modal");
  if(!backdrop || !p) return;
  const lang = getLang();
  const cat = getCategory(p.category);
  const img = p.image ? `<img src="${p.image}" alt="" style="width:100%;border-radius:8px;margin-bottom:16px;max-height:260px;object-fit:cover">` : "";
  backdrop.querySelector(".modal-body").innerHTML = `
    ${img}
    <span class="cat" style="color:${cat.color}">${catField(cat,"name",lang)}</span>
    <h2>${productField(p,"name",lang)}</h2>
    <p>${productField(p,"desc",lang)}</p>
    <div class="modal-section"><h4>${t("pp_material")}</h4><p>${productField(p,"material",lang)}</p></div>
    <div class="modal-section"><h4>${t("pp_usage")}</h4><p>${productField(p,"usage",lang)}</p></div>
    <div class="modal-section"><h4>${t("pp_pack")}</h4><p>${productField(p,"pack",lang)}</p></div>
    ${productTestimonialsHTML(p.id)}
    <div class="modal-section">
      <a class="btn btn-primary" href="contact.html?product=${encodeURIComponent(productField(p,"name","en"))}">${t("pp_inquire")}</a>
    </div>
  `;
  backdrop.classList.add("open");
}
function closeProductModal(){
  document.getElementById("product-modal")?.classList.remove("open");
}

/* ---------- social icons (footer, every page) ---------- */
const SOCIAL_ICONS = {
  telegram: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.9 4.6 18.7 20c-.2 1-.9 1.3-1.8.8l-5-3.7-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9.1-8.2c.4-.3-.1-.5-.6-.2L6.5 12.9l-5-1.6c-1-.3-1-1 .2-1.5L20.6 3.4c.9-.3 1.6.2 1.3 1.2Z"/></svg>',
  email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v16H4z"/><path d="m22 6-10 7L2 6"/></svg>',
  facebook: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-7.5h2.5l.4-3H13.5V8.4c0-.9.2-1.5 1.5-1.5h1.6V4.3C16.3 4.2 15.2 4 14 4c-2.5 0-4.2 1.5-4.2 4.3v2.2H7.3v3h2.5V21h3.7Z"/></svg>',
  tiktok: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 3c.4 2 1.7 3.6 3.9 4v3c-1.5 0-2.9-.4-4-1.2v6.4a5.7 5.7 0 1 1-5.7-5.7c.3 0 .6 0 .9.1v3.1a2.6 2.6 0 1 0 1.8 2.5V3h3.1Z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>'
};
function socialHref(platform, value){
  if(!value) return "";
  if(platform === "email") return value.includes("@") ? ("mailto:" + value) : value;
  return value;
}
function renderSocialIcons(){
  const wrap = document.getElementById("social-icons");
  if(!wrap) return;
  const links = SOCIAL_CACHE || {};
  const html = SOCIAL_PLATFORMS
    .filter(p => links[p])
    .map(p => `<a href="${socialHref(p, links[p])}" target="_blank" rel="noopener" class="social-icon" aria-label="${p}">${SOCIAL_ICONS[p]}</a>`)
    .join("");
  wrap.innerHTML = html;
  wrap.style.display = html ? "flex" : "none";
}

/* ---------- contact form (mailto fallback — no backend needed for messages) ---------- */
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
    const toAddress = (CONTENT_CACHE.contact && CONTENT_CACHE.contact.email) || "info@eastchem.example";
    const subject = encodeURIComponent(`Website inquiry from ${name || "a customer"}`);
    const body = encodeURIComponent(`${message}\n\n— ${name}\nPhone: ${phone}\nEmail: ${email}`);
    window.location.href = `mailto:${toAddress}?subject=${subject}&body=${body}`;
    document.getElementById("contact-sent").hidden = false;
  });
}
