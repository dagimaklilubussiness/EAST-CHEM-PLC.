/* =========================================================
   EAST CHEM PLC — admin panel
   Signs in with Firebase Authentication (email/password).
   Create your one admin account in the Firebase console under
   Authentication → Users → Add user — no code needed for that.
   See README for full setup steps.
   ========================================================= */

let editingId = null;
let editingCategoryId = null;
let editingTestimonialId = null;

document.addEventListener("DOMContentLoaded", async () => {
  await loadSiteData();
  initGate();
  initLangTabs();

  document.getElementById("add-product-btn")?.addEventListener("click", () => openForm(null));
  document.getElementById("cancel-form-btn")?.addEventListener("click", closeForm);
  document.getElementById("product-form")?.addEventListener("submit", saveProduct);

  document.getElementById("add-category-btn")?.addEventListener("click", () => openCategoryForm(null));
  document.getElementById("cancel-category-btn")?.addEventListener("click", closeCategoryForm);
  document.getElementById("category-form")?.addEventListener("submit", saveCategory);

  document.getElementById("add-testimonial-btn")?.addEventListener("click", () => openTestimonialForm(null));
  document.getElementById("cancel-testimonial-btn")?.addEventListener("click", closeTestimonialForm);
  document.getElementById("testimonial-form")?.addEventListener("submit", saveTestimonial);

  document.getElementById("social-form")?.addEventListener("submit", saveSocialForm);
  document.getElementById("content-hero-form")?.addEventListener("submit", saveHeroStatsForm);
  document.getElementById("content-contact-form")?.addEventListener("submit", saveContactContentForm);
  document.getElementById("content-about-form")?.addEventListener("submit", saveAboutContentForm);

  document.getElementById("adv-crop-form")?.addEventListener("submit", saveAdvisorCrop);
  document.getElementById("adv-concern-form")?.addEventListener("submit", saveAdvisorConcern);
  document.getElementById("adv-soil-form")?.addEventListener("submit", saveAdvisorSoil);

  document.getElementById("reset-btn")?.addEventListener("click", resetProductsHandler);
});

/* ---------- auth gate ---------- */
function initGate(){
  const gate = document.getElementById("admin-gate");
  const wrap = document.getElementById("admin-wrap");
  const form = document.getElementById("gate-form");
  const notConfigured = document.getElementById("gate-not-configured");

  if(!FIREBASE_READY){
    form.style.display = "none";
    notConfigured.hidden = false;
    return;
  }

  auth.onAuthStateChanged(user => {
    if(user){
      gate.style.display = "none";
      wrap.classList.add("open");
      renderEverything();
    } else {
      gate.style.display = "block";
      wrap.classList.remove("open");
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const errEl = document.getElementById("gate-error");
    errEl.hidden = true;
    auth.signInWithEmailAndPassword(form.email.value.trim(), form.password.value)
      .catch(err => { errEl.hidden = false; errEl.textContent = err.message; });
  });

  document.getElementById("logout-btn")?.addEventListener("click", () => auth.signOut());
}

function renderEverything(){
  renderTable();
  renderCategoryTable();
  renderTestimonialTable();
  populateCategorySelect();
  populateSocialForm();
  populateHeroStatsForm();
  populateContactContentForm();
  populateAboutForm();
  renderAdvisorCropsTable();
  renderAdvisorConcernsTable();
  renderAdvisorSoilsTable();
  populateAdvisorConcernCategorySelect();
}

async function refreshAndRerender(){
  await loadSiteData();
  renderEverything();
}

/* ---------- language tabs (works for any lang-tab-bar + its next sibling pane wrap) ---------- */
function initLangTabs(){
  document.querySelectorAll(".lang-tab-bar").forEach(bar => {
    const panesWrap = bar.nextElementSibling;
    if(!panesWrap) return;
    const tabs = bar.querySelectorAll(".lang-tab");
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.toggle("active", t === tab));
        panesWrap.querySelectorAll(".lang-pane").forEach(p => p.classList.toggle("active", p.dataset.lang === tab.dataset.lang));
      });
    });
  });
}

/* ---------- shared field helpers ---------- */
function buildLangObj(form, prefix){
  const obj = {};
  SUPPORTED_LANGS.forEach(l => obj[l] = form.querySelector(`[name="${prefix}_${l}"]`).value.trim());
  return obj;
}
function setLangObj(form, prefix, obj){
  SUPPORTED_LANGS.forEach(l => {
    const el = form.querySelector(`[name="${prefix}_${l}"]`);
    if(el) el.value = (obj && obj[l]) || "";
  });
}

/* =====================================================================
   PRODUCTS
   ===================================================================== */
function populateCategorySelect(selectedId){
  const sel = document.getElementById("f-cat");
  if(!sel) return;
  const lang = getLang();
  sel.innerHTML = CATEGORIES_CACHE.map(c => `<option value="${c.id}">${catField(c,"name",lang)}</option>`).join("");
  if(selectedId) sel.value = selectedId;
}

function renderTable(){
  const products = PRODUCTS_CACHE;
  const lang = getLang();
  const tbody = document.getElementById("admin-tbody");
  if(!tbody) return;
  tbody.innerHTML = products.map(p => `
    <tr>
      <td>${productField(p,"name","en")}</td>
      <td>${catField(getCategory(p.category),"name",lang)}</td>
      <td>
        <button class="btn btn-outline btn-sm" data-edit="${p.id}">${t("ad_edit")}</button>
        <button class="btn btn-danger btn-sm" data-del="${p.id}">${t("ad_delete")}</button>
      </td>
    </tr>
  `).join("");
  tbody.querySelectorAll("[data-edit]").forEach(b => b.addEventListener("click", () => openForm(products.find(p => p.id === b.dataset.edit))));
  tbody.querySelectorAll("[data-del]").forEach(b => b.addEventListener("click", () => deleteProductHandler(b.dataset.del)));
}

function openForm(product){
  editingId = product ? product.id : null;
  document.getElementById("form-title").textContent = product ? t("ad_form_edit") : t("ad_form_new");
  const form = document.getElementById("product-form");
  form.reset();
  document.getElementById("f-img-status")?.style && (document.getElementById("f-img-status").style.display = "none");
  SUPPORTED_LANGS.forEach(l => {
    form.querySelector(`[name="name_${l}"]`).value = product ? (product.name?.[l] || "") : "";
    form.querySelector(`[name="desc_${l}"]`).value = product ? (product.desc?.[l] || "") : "";
    form.querySelector(`[name="material_${l}"]`).value = product ? (product.material?.[l] || "") : "";
    form.querySelector(`[name="usage_${l}"]`).value = product ? (product.usage?.[l] || "") : "";
    form.querySelector(`[name="pack_${l}"]`).value = product ? (product.pack?.[l] || "") : "";
  });
  populateCategorySelect(product ? product.category : (CATEGORIES_CACHE[0]?.id));
  form.badge.value = product ? (product.badge || "none") : "none";
  form.image.value = product ? (product.image || "") : "";
  document.getElementById("admin-form-panel").style.display = "block";
  document.getElementById("admin-form-panel").scrollIntoView({ behavior: "smooth" });
}
function closeForm(){
  document.getElementById("admin-form-panel").style.display = "none";
  editingId = null;
}

async function saveProduct(e){
  e.preventDefault();
  const form = e.target;
  const product = {
    id: editingId || ("p" + Date.now()),
    category: form.category.value,
    badge: form.badge.value,
    image: form.image.value.trim(),
    name: buildLangObj(form,"name"),
    desc: buildLangObj(form,"desc"),
    material: buildLangObj(form,"material"),
    usage: buildLangObj(form,"usage"),
    pack: buildLangObj(form,"pack")
  };
  try{
    await writeProduct(product);
    closeForm();
    await refreshAndRerender();
  }catch(err){ alert(err.message); }
}

async function deleteProductHandler(id){
  if(!confirm(t("ad_confirm_delete"))) return;
  try{ await removeProduct(id); await refreshAndRerender(); }
  catch(err){ alert(err.message); }
}

async function resetProductsHandler(){
  if(!confirm(t("ad_confirm_delete") + " (" + t("ad_reset_btn") + ")")) return;
  try{ await resetProducts(); await refreshAndRerender(); }
  catch(err){ alert(err.message); }
}

/* =====================================================================
   CATEGORIES
   ===================================================================== */
function slugifyCategory(name){
  let base = (name || "category").toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/(^-+|-+$)/g,"");
  if(!base) base = "category";
  const existing = new Set(CATEGORIES_CACHE.map(c => c.id));
  let id = base, n = 2;
  while(existing.has(id)){ id = base + "-" + n; n++; }
  return id;
}

function renderCategoryTable(){
  const tbody = document.getElementById("category-tbody");
  if(!tbody) return;
  const lang = getLang();
  const cats = CATEGORIES_CACHE;
  tbody.innerHTML = cats.map(c => `
    <tr>
      <td><span style="display:inline-block;width:20px;height:20px;border-radius:5px;background:${c.color};border:1px solid var(--cream-deep)"></span></td>
      <td>${catField(c,"name",lang)}</td>
      <td>
        <button class="btn btn-outline btn-sm" data-cat-edit="${c.id}">${t("ad_edit")}</button>
        <button class="btn btn-danger btn-sm" data-cat-del="${c.id}">${t("ad_delete")}</button>
      </td>
    </tr>
  `).join("");
  tbody.querySelectorAll("[data-cat-edit]").forEach(b => b.addEventListener("click", () => openCategoryForm(cats.find(c => c.id === b.dataset.catEdit))));
  tbody.querySelectorAll("[data-cat-del]").forEach(b => b.addEventListener("click", () => deleteCategoryHandler(b.dataset.catDel)));
}

function openCategoryForm(cat){
  editingCategoryId = cat ? cat.id : null;
  const form = document.getElementById("category-form");
  form.reset();
  form.color.value = cat ? cat.color : "#7E9E3B";
  setLangObj(form, "cname", cat ? cat.name : null);
  document.getElementById("category-form-panel").style.display = "block";
  document.getElementById("category-form-panel").scrollIntoView({ behavior: "smooth" });
}
function closeCategoryForm(){
  document.getElementById("category-form-panel").style.display = "none";
  editingCategoryId = null;
}

async function saveCategory(e){
  e.preventDefault();
  const form = e.target;
  const name = buildLangObj(form, "cname");
  const id = editingCategoryId || slugifyCategory(name.en);
  const category = { id, color: form.color.value, name, desc: { en:"", am:"", om:"", ti:"" } };
  try{
    await writeCategory(category);
    closeCategoryForm();
    await refreshAndRerender();
  }catch(err){ alert(err.message); }
}

async function deleteCategoryHandler(id){
  if(!confirm(t("ad_cat_delete_confirm"))) return;
  try{ await removeCategory(id); await refreshAndRerender(); }
  catch(err){ alert(err.message); }
}

/* =====================================================================
   FARMER STORIES (testimonials)
   ===================================================================== */
function populateTestimonialProductSelect(selectedId){
  const sel = document.getElementById("ts-product");
  if(!sel) return;
  const lang = getLang();
  sel.innerHTML = PRODUCTS_CACHE.map(p => `<option value="${p.id}">${productField(p,"name",lang)}</option>`).join("");
  if(selectedId) sel.value = selectedId;
}

function productNameById(id){
  const lang = getLang();
  const p = PRODUCTS_CACHE.find(p => p.id === id);
  return p ? productField(p,"name",lang) : "—";
}

function renderTestimonialTable(){
  const tbody = document.getElementById("testimonial-tbody");
  if(!tbody) return;
  const items = TESTIMONIALS_CACHE;
  tbody.innerHTML = items.map(x => `
    <tr>
      <td>${x.name || ""}</td>
      <td>${productNameById(x.productId)}</td>
      <td>
        <button class="btn btn-outline btn-sm" data-ts-edit="${x.id}">${t("ad_edit")}</button>
        <button class="btn btn-danger btn-sm" data-ts-del="${x.id}">${t("ad_delete")}</button>
      </td>
    </tr>
  `).join("");
  tbody.querySelectorAll("[data-ts-edit]").forEach(b => b.addEventListener("click", () => openTestimonialForm(items.find(x => x.id === b.dataset.tsEdit))));
  tbody.querySelectorAll("[data-ts-del]").forEach(b => b.addEventListener("click", () => deleteTestimonialHandler(b.dataset.tsDel)));
}

function openTestimonialForm(item){
  editingTestimonialId = item ? item.id : null;
  const form = document.getElementById("testimonial-form");
  form.reset();
  populateTestimonialProductSelect(item ? item.productId : (PRODUCTS_CACHE[0]?.id));
  form.tname.value = item ? (item.name || "") : "";
  form.mediaType.value = item ? (item.mediaType || "photo") : "photo";
  form.filename.value = item ? (item.filename || "") : "";
  setLangObj(form, "quote", item ? item.quote : null);
  document.getElementById("testimonial-form-panel").style.display = "block";
  document.getElementById("testimonial-form-panel").scrollIntoView({ behavior: "smooth" });
}
function closeTestimonialForm(){
  document.getElementById("testimonial-form-panel").style.display = "none";
  editingTestimonialId = null;
}

async function saveTestimonial(e){
  e.preventDefault();
  const form = e.target;
  const item = {
    id: editingTestimonialId || undefined,
    productId: form.productId.value,
    name: form.tname.value.trim(),
    mediaType: form.mediaType.value,
    filename: form.filename.value.trim(),
    quote: buildLangObj(form, "quote")
  };
  try{
    await writeTestimonial(item);
    closeTestimonialForm();
    await refreshAndRerender();
  }catch(err){ alert(err.message); }
}

async function deleteTestimonialHandler(id){
  if(!confirm(t("ad_confirm_delete"))) return;
  try{ await removeTestimonial(id); await refreshAndRerender(); }
  catch(err){ alert(err.message); }
}

/* =====================================================================
   SOCIAL LINKS
   ===================================================================== */
function populateSocialForm(){
  const form = document.getElementById("social-form");
  if(!form) return;
  const links = SOCIAL_CACHE;
  SOCIAL_PLATFORMS.forEach(p => { if(form[p]) form[p].value = links[p] || ""; });
}
async function saveSocialForm(e){
  e.preventDefault();
  const form = e.target;
  const links = {};
  SOCIAL_PLATFORMS.forEach(p => links[p] = form[p].value.trim());
  try{
    await writeSocialLinks(links);
    await refreshAndRerender();
    if(typeof renderSocialIcons === "function") renderSocialIcons();
    alert(t("ad_content_saved") + " ✓");
  }catch(err){ alert(err.message); }
}

/* =====================================================================
   SITE CONTENT — hero/stats, contact info, about page
   ===================================================================== */
function populateHeroStatsForm(){
  const form = document.getElementById("content-hero-form");
  if(!form) return;
  const h = CONTENT_CACHE.hero || {};
  setLangObj(form, "hero_eyebrow", h.eyebrow);
  setLangObj(form, "hero_title", h.title);
  setLangObj(form, "hero_subtitle", h.subtitle);
  const stats = CONTENT_CACHE.stats || [];
  [0,1,2].forEach(i => {
    const s = stats[i] || {};
    const numEl = form.querySelector(`[name="stat${i+1}_num"]`);
    if(numEl) numEl.value = s.number || "";
    setLangObj(form, `stat${i+1}_label`, s.label);
  });
  const gallery = CONTENT_CACHE.gallery || [];
  [0,1,2].forEach(i => {
    const el = form.querySelector(`[name="gallery_${i+1}"]`);
    if(el) el.value = gallery[i] || "";
  });
}
async function saveHeroStatsForm(e){
  e.preventDefault();
  const form = e.target;
  const hero = {
    eyebrow: buildLangObj(form,"hero_eyebrow"),
    title: buildLangObj(form,"hero_title"),
    subtitle: buildLangObj(form,"hero_subtitle")
  };
  const stats = [1,2,3].map(i => ({
    number: form.querySelector(`[name="stat${i}_num"]`).value.trim(),
    label: buildLangObj(form, `stat${i}_label`)
  }));
  const gallery = [1,2,3].map(i => form.querySelector(`[name="gallery_${i}"]`).value.trim());
  try{
    await writeContent("hero", hero);
    await writeContent("stats", stats);
    await writeContent("gallery", gallery);
    await refreshAndRerender();
    alert(t("ad_content_saved") + " ✓");
  }catch(err){ alert(err.message); }
}

function populateContactContentForm(){
  const form = document.getElementById("content-contact-form");
  if(!form) return;
  const c = CONTENT_CACHE.contact || {};
  form.querySelector('[name="contact_phone"]').value = c.phone || "";
  form.querySelector('[name="contact_email"]').value = c.email || "";
  setLangObj(form, "contact_address", c.address);
  setLangObj(form, "contact_hours", c.hours);
}
async function saveContactContentForm(e){
  e.preventDefault();
  const form = e.target;
  const contact = {
    phone: form.querySelector('[name="contact_phone"]').value.trim(),
    email: form.querySelector('[name="contact_email"]').value.trim(),
    address: buildLangObj(form,"contact_address"),
    hours: buildLangObj(form,"contact_hours")
  };
  try{
    await writeContent("contact", contact);
    await refreshAndRerender();
    alert(t("ad_content_saved") + " ✓");
  }catch(err){ alert(err.message); }
}

function populateAboutForm(){
  const form = document.getElementById("content-about-form");
  if(!form) return;
  const a = CONTENT_CACHE.about || {};
  setLangObj(form, "ab_lede", a.lede);
  setLangObj(form, "ab_mission_title", a.missionTitle);
  setLangObj(form, "ab_mission_text", a.missionText);
  setLangObj(form, "ab_story_heading", a.storyHeading);
  const tl = a.timeline || [];
  [0,1,2,3].forEach(i => {
    const item = tl[i] || {};
    setLangObj(form, `ab_t${i+1}_year`, item.year);
    setLangObj(form, `ab_t${i+1}_text`, item.text);
  });
  setLangObj(form, "ab_values_heading", a.valuesHeading);
  const vals = a.values || [];
  [0,1,2].forEach(i => {
    const item = vals[i] || {};
    setLangObj(form, `ab_v${i+1}_title`, item.title);
    setLangObj(form, `ab_v${i+1}_text`, item.text);
  });
}
async function saveAboutContentForm(e){
  e.preventDefault();
  const form = e.target;
  const about = {
    lede: buildLangObj(form,"ab_lede"),
    missionTitle: buildLangObj(form,"ab_mission_title"),
    missionText: buildLangObj(form,"ab_mission_text"),
    storyHeading: buildLangObj(form,"ab_story_heading"),
    timeline: [1,2,3,4].map(i => ({
      year: buildLangObj(form, `ab_t${i}_year`),
      text: buildLangObj(form, `ab_t${i}_text`)
    })),
    valuesHeading: buildLangObj(form,"ab_values_heading"),
    values: [1,2,3].map(i => ({
      title: buildLangObj(form, `ab_v${i}_title`),
      text: buildLangObj(form, `ab_v${i}_text`)
    }))
  };
  try{
    await writeContent("about", about);
    await refreshAndRerender();
    alert(t("ad_content_saved") + " ✓");
  }catch(err){ alert(err.message); }
}

/* =====================================================================
   HOMEPAGE ADVISOR — crop / issue / soil options (add + delete, 4 langs)
   ===================================================================== */
function populateAdvisorConcernCategorySelect(){
  const sel = document.getElementById("advc-category");
  if(!sel) return;
  const lang = getLang();
  sel.innerHTML = CATEGORIES_CACHE.map(c => `<option value="${c.id}">${catField(c,"name",lang)}</option>`).join("");
}

function renderAdvisorCropsTable(){
  const tbody = document.getElementById("adv-crop-tbody");
  if(!tbody) return;
  const lang = getLang();
  tbody.innerHTML = ADVISOR_CACHE.crops.map((c,i) => `
    <tr>
      <td>${advisorLabel(c,lang)}</td>
      <td><button class="btn btn-danger btn-sm" data-adv-del="crops" data-adv-idx="${i}">${t("ad_delete")}</button></td>
    </tr>
  `).join("");
  wireAdvisorDeleteButtons(tbody);
}
function renderAdvisorConcernsTable(){
  const tbody = document.getElementById("adv-concern-tbody");
  if(!tbody) return;
  const lang = getLang();
  tbody.innerHTML = ADVISOR_CACHE.concerns.map((c,i) => `
    <tr>
      <td>${advisorLabel(c,lang)}</td>
      <td>${catField(getCategory(c.categoryId),"name",lang)}</td>
      <td><button class="btn btn-danger btn-sm" data-adv-del="concerns" data-adv-idx="${i}">${t("ad_delete")}</button></td>
    </tr>
  `).join("");
  wireAdvisorDeleteButtons(tbody);
}
function renderAdvisorSoilsTable(){
  const tbody = document.getElementById("adv-soil-tbody");
  if(!tbody) return;
  const lang = getLang();
  tbody.innerHTML = ADVISOR_CACHE.soils.map((c,i) => `
    <tr>
      <td>${advisorLabel(c,lang)}</td>
      <td><button class="btn btn-danger btn-sm" data-adv-del="soils" data-adv-idx="${i}">${t("ad_delete")}</button></td>
    </tr>
  `).join("");
  wireAdvisorDeleteButtons(tbody);
}
function wireAdvisorDeleteButtons(tbody){
  tbody.querySelectorAll("[data-adv-del]").forEach(b => {
    b.addEventListener("click", async () => {
      if(!confirm(t("ad_confirm_delete"))) return;
      const list = b.dataset.advDel;
      const idx = parseInt(b.dataset.advIdx, 10);
      ADVISOR_CACHE[list].splice(idx, 1);
      try{
        await writeAdvisorOptions(ADVISOR_CACHE);
        await refreshAndRerender();
      }catch(err){ alert(err.message); }
    });
  });
}
function slugify(text){
  return (text || "opt").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"") || ("opt" + Date.now());
}
async function saveAdvisorCrop(e){
  e.preventDefault();
  const form = e.target;
  const label = buildLangObj(form, "advcrop_label");
  if(!label.en){ alert(t("ad_adv_need_en")); return; }
  ADVISOR_CACHE.crops.push({ id: slugify(label.en) + "-" + Date.now().toString(36), label });
  try{
    await writeAdvisorOptions(ADVISOR_CACHE);
    form.reset();
    await refreshAndRerender();
  }catch(err){ alert(err.message); }
}
async function saveAdvisorConcern(e){
  e.preventDefault();
  const form = e.target;
  const label = buildLangObj(form, "advconcern_label");
  if(!label.en){ alert(t("ad_adv_need_en")); return; }
  const categoryId = form.categoryId.value;
  ADVISOR_CACHE.concerns.push({ id: slugify(label.en) + "-" + Date.now().toString(36), categoryId, label });
  try{
    await writeAdvisorOptions(ADVISOR_CACHE);
    form.reset();
    await refreshAndRerender();
  }catch(err){ alert(err.message); }
}
async function saveAdvisorSoil(e){
  e.preventDefault();
  const form = e.target;
  const label = buildLangObj(form, "advsoil_label");
  if(!label.en){ alert(t("ad_adv_need_en")); return; }
  ADVISOR_CACHE.soils.push({ id: slugify(label.en) + "-" + Date.now().toString(36), label });
  try{
    await writeAdvisorOptions(ADVISOR_CACHE);
    form.reset();
    await refreshAndRerender();
  }catch(err){ alert(err.message); }
}
