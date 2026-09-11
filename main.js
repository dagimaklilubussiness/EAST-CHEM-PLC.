/* =========================================================
   EAST CHEM PLC — shared site behaviour
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  applyI18n();
  initNav();
  initLangSwitch();
  initCounters();
  initAdvisor();
  renderCategoryGrid();
  initProductGrids();
  initModal();
  initContactForm();
  renderSocialIcons();
  renderTestimonials();
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
    const lang = getLang();
    const concern = form.concern.value;
    const catId = ADVISOR_MAP[concern] || "fertilizer";
    const cat = getCategory(catId);
    result.classList.remove("empty");
    result.innerHTML = `
      <h4>${t("adv_result_t")} ${catField(cat,"name",lang)}</h4>
      <p>${catField(cat,"desc",lang)}</p>
      <a class="btn btn-primary btn-sm" href="products.html?cat=${catId}">${t("strip_view")}</a>
    `;
  });
}

/* ---------- product rendering ---------- */
function productField(p, field, lang){
  if(!p[field]) return "";
  return p[field][lang] || p[field].en || "";
}

function productCardHTML(p, lang){
  const cat = getCategory(p.category);
  const badge = p.badge && p.badge !== "none"
    ? `<span class="tag" style="background:${p.badge === 'new' ? 'var(--canopy)' : 'var(--orange)'}">${t(p.badge === "new" ? "badge_new" : "badge_popular")}</span>`
    : "";
  const img = p.image
    ? `<div class="img-slot product-card-img-wrap"><img src="${p.image}" alt="" onerror="this.parentElement.classList.add('img-missing')"><div class="img-slot-hint"><span>—</span></div></div>`
    : "";
  return `
    <article class="product-card" data-id="${p.id}" tabindex="0" role="button" aria-haspopup="dialog" style="border-top-color:${cat.color}">
      ${badge}
      ${img}
      <span class="cat" style="color:${cat.color}">${catField(cat,"name",lang)}</span>
      <h3>${productField(p,"name",lang)}</h3>
      <p>${productField(p,"desc",lang)}</p>
      <div class="meta"><span>${productField(p,"pack",lang)}</span></div>
    </article>
  `;
}

/* ---------- homepage category photo grid (fully dynamic) ---------- */
function renderCategoryGrid(){
  const wrap = document.getElementById("category-grid");
  if(!wrap) return;
  const lang = getLang();
  const cats = getAllCategories();
  wrap.innerHTML = cats.map(cat => `
    <a href="products.html?cat=${cat.id}" class="cat-photo-card">
      <div class="img-slot" data-slot="cat-${cat.id}.jpg" style="aspect-ratio:4/3">
        <img src="cat-${cat.id}.jpg" alt="" onerror="this.parentElement.classList.add('img-missing')">
        <div class="img-slot-hint"><b>cat-${cat.id}.jpg</b><span>${t("slot_cat_" + cat.id) !== "slot_cat_" + cat.id ? t("slot_cat_" + cat.id) : t("slot_cat_generic")}</span></div>
      </div>
      <div class="cat-photo-label">
        <h3 style="color:${cat.color}">${catField(cat,"name",lang)}</h3>
        <span data-i18n="strip_view">View products</span>
      </div>
    </a>
  `).join("");
}

function initProductGrids(){
  const lang = getLang();
  const products = (typeof getAllProducts === "function") ? getAllProducts() : [];

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

  /* build filter chips dynamically from current categories */
  const chipBar = document.querySelector(".filter-bar");
  if(chipBar){
    const cats = getAllCategories();
    chipBar.innerHTML = `<button class="filter-chip" data-cat="all">${t("pp_all")}</button>` +
      cats.map(c => `<button class="filter-chip" data-cat="${c.id}">${catField(c,"name",lang)}</button>`).join("");
  }
  const chips = document.querySelectorAll(".filter-chip");
  const searchInput = document.getElementById("product-search");

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
function openProductModal(p){
  const backdrop = document.getElementById("product-modal");
  if(!backdrop || !p) return;
  const lang = getLang();
  const cat = getCategory(p.category);
  const img = p.image
    ? `<div class="img-slot" style="aspect-ratio:16/10;margin-bottom:16px"><img src="${p.image}" alt="" onerror="this.parentElement.classList.add('img-missing')"><div class="img-slot-hint"><span>—</span></div></div>`
    : "";
  backdrop.querySelector(".modal-body").innerHTML = `
    ${img}
    <span class="cat" style="color:${cat.color}">${catField(cat,"name",lang)}</span>
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

/* ---------- social icons (footer) ---------- */
const SOCIAL_ICONS = {
  telegram: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.9 4.5 2.7 12.1c-1 .4-1 1.6.1 1.9l4.7 1.5 1.8 5.6c.3.9 1.4 1.1 2 .4l2.6-2.9 4.8 3.6c.8.6 1.9.2 2.1-.8l3-14.3c.2-1-.8-1.8-1.9-1.6zM8.6 14.9l8.7-6.8c.3-.2.6.2.3.4l-7.2 7.3-.3 3.5-1.5-4.4z"/></svg>',
  email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v16H4z"/><path d="m22 6-10 7L2 6"/></svg>',
  facebook: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-7.5H16l.4-3H13.5V8.4c0-.9.2-1.5 1.6-1.5H16.5V4.2C16.2 4.2 15.2 4 14 4c-2.4 0-4 1.5-4 4.1v2.4H7.5v3H10V21h3.5z"/></svg>',
  tiktok: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14.5 3h2.6c.2 1.6 1.3 3 3.4 3.3v2.6c-1.3 0-2.5-.4-3.4-1v6.4a5 5 0 1 1-5-5c.2 0 .5 0 .7.1v2.7a2.4 2.4 0 1 0 1.7 2.3V3z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>'
};
function renderSocialIcons(){
  const wrap = document.getElementById("social-icons");
  if(!wrap) return;
  const links = getSocialLinks();
  const labelKeys = { telegram:"social_telegram", email:"social_email", facebook:"social_facebook", tiktok:"social_tiktok", instagram:"social_instagram" };
  wrap.innerHTML = SOCIAL_PLATFORMS.map(p => {
    const has = !!links[p];
    const url = has ? (p === "email" ? ("mailto:" + links[p]) : links[p]) : "#";
    const target = has ? ' target="_blank" rel="noopener"' : "";
    const label = t(labelKeys[p]);
    return `<a href="${url}"${target} class="social-icon" title="${label}" aria-label="${label}">${SOCIAL_ICONS[p]}</a>`;
  }).join("");
}

/* ---------- farmer story testimonials (home page) ---------- */
function renderTestimonials(){
  const wrap = document.getElementById("testimonials-grid");
  if(!wrap) return;
  const section = wrap.closest("section");
  const items = (typeof getAllTestimonials === "function") ? getAllTestimonials() : [];
  if(!items.length){ if(section) section.style.display = "none"; return; }
  if(section) section.style.display = "";
  const lang = getLang();
  wrap.innerHTML = items.map(item => {
    const isVideo = item.mediaType === "video";
    const mediaTag = isVideo
      ? `<video src="${item.filename || ''}" controls playsinline onerror="this.parentElement.classList.add('img-missing')"></video>`
      : `<img src="${item.filename || ''}" alt="" onerror="this.parentElement.classList.add('img-missing')">`;
    const quote = (item.quote && (item.quote[lang] || item.quote.en)) || "";
    return `
      <div class="testimonial-card">
        <div class="img-slot" style="aspect-ratio:4/3">
          ${mediaTag}
          <div class="img-slot-hint"><b>${item.filename || "—"}</b><span>${isVideo ? t("ad_test_video") : t("ad_test_photo")}</span></div>
        </div>
        <p class="testimonial-quote">${quote}</p>
        <p class="testimonial-name">${item.name || ""}</p>
      </div>
    `;
  }).join("");
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
