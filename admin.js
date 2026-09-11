/* =========================================================
   EAST CHEM PLC — admin panel
   Change ACCESS_CODE below to whatever you like before you
   publish the site. This is a friction gate for one shared
   team login, not real user security — don't reuse a
   sensitive password here, and don't rely on it to keep
   the page truly private (anyone who knows the code, or
   reads this file, can get in).
   ========================================================= */

const ACCESS_CODE = "26pass26";
let editingId = null;
let editingCategoryId = null;
let editingTestimonialId = null;
let testimonialPhotoData = null;

document.addEventListener("DOMContentLoaded", () => {
  initGate();
  initLangTabs();

  document.getElementById("add-product-btn")?.addEventListener("click", () => openForm(null));
  document.getElementById("cancel-form-btn")?.addEventListener("click", closeForm);
  document.getElementById("product-form")?.addEventListener("submit", saveProduct);
  document.getElementById("f-img-upload")?.addEventListener("change", handleProductImageUpload);

  document.getElementById("add-category-btn")?.addEventListener("click", () => openCategoryForm(null));
  document.getElementById("cancel-category-btn")?.addEventListener("click", closeCategoryForm);
  document.getElementById("category-form")?.addEventListener("submit", saveCategory);

  document.getElementById("add-testimonial-btn")?.addEventListener("click", () => openTestimonialForm(null));
  document.getElementById("cancel-testimonial-btn")?.addEventListener("click", closeTestimonialForm);
  document.getElementById("testimonial-form")?.addEventListener("submit", saveTestimonial);
  document.getElementById("ts-media")?.addEventListener("change", toggleTestimonialMediaFields);
  document.getElementById("ts-photo-upload")?.addEventListener("change", handleTestimonialPhotoUpload);

  document.getElementById("social-form")?.addEventListener("submit", saveSocialForm);

  document.getElementById("export-btn")?.addEventListener("click", exportProducts);
  document.getElementById("export-cat-btn")?.addEventListener("click", exportCategories);
  document.getElementById("export-extras-btn")?.addEventListener("click", exportExtras);
  document.getElementById("import-btn")?.addEventListener("click", importProducts);
  document.getElementById("reset-btn")?.addEventListener("click", resetProducts);
});

/* ---------- gate ---------- */
function initGate(){
  const gate = document.getElementById("admin-gate");
  const wrap = document.getElementById("admin-wrap");
  const form = document.getElementById("gate-form");

  function unlock(){
    gate.style.display = "none";
    wrap.classList.add("open");
    renderTable();
    renderCategoryTable();
    renderTestimonialTable();
    populateSocialForm();
  }

  if(sessionStorage.getItem("ec_admin_ok") === "1"){ unlock(); return; }
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if(form.code.value === ACCESS_CODE){
      sessionStorage.setItem("ec_admin_ok", "1");
      unlock();
    } else {
      document.getElementById("gate-error").hidden = false;
    }
  });
  document.getElementById("logout-btn")?.addEventListener("click", () => {
    sessionStorage.removeItem("ec_admin_ok");
    location.reload();
  });
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

/* ---------- image helper: resize + compress before storing as base64 ---------- */
function resizeImageToBase64(file, maxDim, quality){
  maxDim = maxDim || 900; quality = quality || 0.75;
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      let w = img.width, h = img.height;
      if(w > h){ if(w > maxDim){ h = Math.round(h * maxDim / w); w = maxDim; } }
      else { if(h > maxDim){ w = Math.round(w * maxDim / h); h = maxDim; } }
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("image load failed")); };
    img.src = url;
  });
}

/* =====================================================================
   PRODUCTS
   ===================================================================== */
function getOverrides(){
  try{ return JSON.parse(localStorage.getItem("ec_products_v1") || "[]"); }catch(e){ return []; }
}
function saveOverrides(list){ localStorage.setItem("ec_products_v1", JSON.stringify(list)); }

function populateCategorySelect(selectedId){
  const sel = document.getElementById("f-cat");
  if(!sel) return;
  const lang = getLang();
  sel.innerHTML = getAllCategories().map(c => `<option value="${c.id}">${catField(c,"name",lang)}</option>`).join("");
  if(selectedId) sel.value = selectedId;
}

function renderTable(){
  const products = getAllProducts();
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
  tbody.querySelectorAll("[data-del]").forEach(b => b.addEventListener("click", () => deleteProduct(b.dataset.del)));
}

function openForm(product){
  editingId = product ? product.id : null;
  document.getElementById("form-title").textContent = product ? t("ad_form_edit") : t("ad_form_new");
  const form = document.getElementById("product-form");
  form.reset();
  document.getElementById("f-img-status").style.display = "none";
  SUPPORTED_LANGS.forEach(l => {
    form.querySelector(`[name="name_${l}"]`).value = product ? (product.name?.[l] || "") : "";
    form.querySelector(`[name="desc_${l}"]`).value = product ? (product.desc?.[l] || "") : "";
    form.querySelector(`[name="material_${l}"]`).value = product ? (product.material?.[l] || "") : "";
    form.querySelector(`[name="usage_${l}"]`).value = product ? (product.usage?.[l] || "") : "";
    form.querySelector(`[name="pack_${l}"]`).value = product ? (product.pack?.[l] || "") : "";
  });
  populateCategorySelect(product ? product.category : (getAllCategories()[0]?.id));
  form.badge.value = product ? (product.badge || "none") : "none";
  form.image.value = product ? (product.image || "") : "";
  document.getElementById("admin-form-panel").style.display = "block";
  document.getElementById("admin-form-panel").scrollIntoView({ behavior: "smooth" });
}
function closeForm(){
  document.getElementById("admin-form-panel").style.display = "none";
  editingId = null;
}

async function handleProductImageUpload(e){
  const file = e.target.files[0];
  if(!file) return;
  try{
    const dataUrl = await resizeImageToBase64(file);
    document.getElementById("f-img").value = dataUrl;
    document.getElementById("f-img-status").style.display = "block";
  }catch(err){ alert("Could not read that image — try a different photo."); }
}

function saveProduct(e){
  e.preventDefault();
  const form = e.target;
  const build = (prefix) => {
    const obj = {};
    SUPPORTED_LANGS.forEach(l => obj[l] = form.querySelector(`[name="${prefix}_${l}"]`).value.trim());
    return obj;
  };
  const id = editingId || ("p" + Date.now());
  const product = {
    id,
    category: form.category.value,
    badge: form.badge.value,
    image: form.image.value.trim(),
    name: build("name"),
    desc: build("desc"),
    material: build("material"),
    usage: build("usage"),
    pack: build("pack")
  };
  const overrides = getOverrides().filter(p => p.id !== id);
  overrides.push(product);
  saveOverrides(overrides);
  closeForm();
  renderTable();
}

function deleteProduct(id){
  if(!confirm(t("ad_confirm_delete"))) return;
  const isDefault = DEFAULT_PRODUCTS.some(p => p.id === id);
  const overrides = getOverrides().filter(p => p.id !== id);
  if(isDefault) overrides.push({ id, _deleted: true });
  saveOverrides(overrides);
  renderTable();
}

function exportProducts(){
  const products = getAllProducts();
  const body = products.map(p => "  " + JSON.stringify(p, null, 2).split("\n").join("\n  ")).join(",\n");
  const code = `/* EAST CHEM PLC — product catalog (exported from admin panel) */\n\nconst DEFAULT_PRODUCTS = [\n${body}\n];\n\nfunction getAllProducts(){\n  let stored = [];\n  try{ stored = JSON.parse(localStorage.getItem("ec_products_v1") || "[]"); }catch(e){ stored = []; }\n  const map = new Map();\n  DEFAULT_PRODUCTS.forEach(p => map.set(p.id, p));\n  stored.forEach(p => map.set(p.id, p));\n  return Array.from(map.values()).filter(p => !p._deleted);\n}\n`;
  downloadFile("products-data.js", code, () => { document.getElementById("export-box").value = code; document.getElementById("export-box").hidden = false; });
}

function resetProducts(){
  if(!confirm(t("ad_confirm_delete") + " (" + t("ad_reset_btn") + ")")) return;
  localStorage.removeItem("ec_products_v1");
  renderTable();
}

function importProducts(){
  const box = document.getElementById("export-box");
  box.hidden = false;
  box.focus();
  try{
    const parsed = JSON.parse(box.value);
    if(Array.isArray(parsed)){ saveOverrides(parsed); renderTable(); alert("Imported."); }
  }catch(e){
    alert("Paste a valid JSON array of products into the box first, then click Import again.");
  }
}

/* =====================================================================
   CATEGORIES
   ===================================================================== */
function getCategoryOverrides(){
  try{ return JSON.parse(localStorage.getItem("ec_categories_v1") || "[]"); }catch(e){ return []; }
}
function saveCategoryOverrides(list){ localStorage.setItem("ec_categories_v1", JSON.stringify(list)); }

function slugifyCategory(name){
  let base = (name || "category").toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/(^-+|-+$)/g,"");
  if(!base) base = "category";
  const existing = new Set(getAllCategories().map(c => c.id));
  let id = base, n = 2;
  while(existing.has(id)){ id = base + "-" + n; n++; }
  return id;
}

function renderCategoryTable(){
  const tbody = document.getElementById("category-tbody");
  if(!tbody) return;
  const lang = getLang();
  const cats = getAllCategories();
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
  tbody.querySelectorAll("[data-cat-del]").forEach(b => b.addEventListener("click", () => deleteCategory(b.dataset.catDel)));
}

function openCategoryForm(cat){
  editingCategoryId = cat ? cat.id : null;
  const form = document.getElementById("category-form");
  form.reset();
  form.color.value = cat ? cat.color : "#7E9E3B";
  SUPPORTED_LANGS.forEach(l => {
    form.querySelector(`[name="cname_${l}"]`).value = cat ? (cat.name?.[l] || "") : "";
  });
  document.getElementById("category-form-panel").style.display = "block";
  document.getElementById("category-form-panel").scrollIntoView({ behavior: "smooth" });
}
function closeCategoryForm(){
  document.getElementById("category-form-panel").style.display = "none";
  editingCategoryId = null;
}

function saveCategory(e){
  e.preventDefault();
  const form = e.target;
  const name = {};
  SUPPORTED_LANGS.forEach(l => name[l] = form.querySelector(`[name="cname_${l}"]`).value.trim());
  const id = editingCategoryId || slugifyCategory(name.en);
  const category = { id, color: form.color.value, name, desc: { en:"", am:"", om:"", ti:"" } };
  const overrides = getCategoryOverrides().filter(c => c.id !== id);
  overrides.push(category);
  saveCategoryOverrides(overrides);
  closeCategoryForm();
  renderCategoryTable();
  populateCategorySelect();
}

function deleteCategory(id){
  if(!confirm(t("ad_cat_delete_confirm"))) return;
  const isDefault = DEFAULT_CATEGORIES.some(c => c.id === id);
  const overrides = getCategoryOverrides().filter(c => c.id !== id);
  if(isDefault) overrides.push({ id, _deleted: true });
  saveCategoryOverrides(overrides);
  renderCategoryTable();
  populateCategorySelect();
}

function exportCategories(){
  const cats = getAllCategories();
  const body = cats.map(c => "  " + JSON.stringify(c, null, 2).split("\n").join("\n  ")).join(",\n");
  const code = `/* EAST CHEM PLC — product categories (exported from admin panel) */\n\nconst DEFAULT_CATEGORIES = [\n${body}\n];\n\nfunction getAllCategories(){\n  let stored = [];\n  try{ stored = JSON.parse(localStorage.getItem("ec_categories_v1") || "[]"); }catch(e){ stored = []; }\n  const map = new Map();\n  DEFAULT_CATEGORIES.forEach(c => map.set(c.id, c));\n  stored.forEach(c => map.set(c.id, c));\n  return Array.from(map.values()).filter(c => !c._deleted);\n}\nfunction getCategory(id){\n  return getAllCategories().find(c => c.id === id) || { id, color:"#999", name:{en:id,am:id,om:id,ti:id}, desc:{en:"",am:"",om:"",ti:""} };\n}\nfunction catField(cat, field, lang){\n  if(!cat[field]) return "";\n  return cat[field][lang] || cat[field].en || "";\n}\n`;
  downloadFile("categories-data.js", code);
}

/* =====================================================================
   FARMER STORIES (testimonials)
   ===================================================================== */
function getTestimonialOverrides(){
  try{ return JSON.parse(localStorage.getItem("ec_testimonials_v1") || "[]"); }catch(e){ return []; }
}
function saveTestimonialOverrides(list){ localStorage.setItem("ec_testimonials_v1", JSON.stringify(list)); }

function toggleTestimonialMediaFields(){
  const isVideo = document.getElementById("ts-media").value === "video";
  document.getElementById("ts-photo-wrap").style.display = isVideo ? "none" : "block";
  document.getElementById("ts-filename-wrap").style.display = isVideo ? "block" : "none";
}

async function handleTestimonialPhotoUpload(e){
  const file = e.target.files[0];
  if(!file) return;
  try{ testimonialPhotoData = await resizeImageToBase64(file, 800, 0.75); }
  catch(err){ alert("Could not read that image — try a different photo."); }
}

function renderTestimonialTable(){
  const tbody = document.getElementById("testimonial-tbody");
  if(!tbody) return;
  const items = getAllTestimonials();
  tbody.innerHTML = items.map(x => `
    <tr>
      <td>${x.name || ""}</td>
      <td>
        <button class="btn btn-outline btn-sm" data-ts-edit="${x.id}">${t("ad_edit")}</button>
        <button class="btn btn-danger btn-sm" data-ts-del="${x.id}">${t("ad_delete")}</button>
      </td>
    </tr>
  `).join("");
  tbody.querySelectorAll("[data-ts-edit]").forEach(b => b.addEventListener("click", () => openTestimonialForm(items.find(x => x.id === b.dataset.tsEdit))));
  tbody.querySelectorAll("[data-ts-del]").forEach(b => b.addEventListener("click", () => deleteTestimonial(b.dataset.tsDel)));
}

function openTestimonialForm(item){
  editingTestimonialId = item ? item.id : null;
  testimonialPhotoData = (item && item.mediaType !== "video") ? (item.filename || null) : null;
  const form = document.getElementById("testimonial-form");
  form.reset();
  form.tname.value = item ? (item.name || "") : "";
  form.mediaType.value = item ? (item.mediaType || "photo") : "photo";
  form.filename.value = (item && item.mediaType === "video") ? (item.filename || "") : "";
  SUPPORTED_LANGS.forEach(l => {
    form.querySelector(`[name="quote_${l}"]`).value = item ? (item.quote?.[l] || "") : "";
  });
  toggleTestimonialMediaFields();
  document.getElementById("testimonial-form-panel").style.display = "block";
  document.getElementById("testimonial-form-panel").scrollIntoView({ behavior: "smooth" });
}
function closeTestimonialForm(){
  document.getElementById("testimonial-form-panel").style.display = "none";
  editingTestimonialId = null;
  testimonialPhotoData = null;
}

function saveTestimonial(e){
  e.preventDefault();
  const form = e.target;
  const quote = {};
  SUPPORTED_LANGS.forEach(l => quote[l] = form.querySelector(`[name="quote_${l}"]`).value.trim());
  const isVideo = form.mediaType.value === "video";
  const id = editingTestimonialId || ("t" + Date.now());
  const item = {
    id,
    name: form.tname.value.trim(),
    mediaType: form.mediaType.value,
    filename: isVideo ? form.filename.value.trim() : (testimonialPhotoData || ""),
    quote
  };
  const overrides = getTestimonialOverrides().filter(x => x.id !== id);
  overrides.push(item);
  saveTestimonialOverrides(overrides);
  closeTestimonialForm();
  renderTestimonialTable();
}

function deleteTestimonial(id){
  if(!confirm(t("ad_confirm_delete"))) return;
  const overrides = getTestimonialOverrides().filter(x => x.id !== id);
  overrides.push({ id, _deleted: true });
  saveTestimonialOverrides(overrides);
  renderTestimonialTable();
}

/* =====================================================================
   SOCIAL LINKS
   ===================================================================== */
function populateSocialForm(){
  const form = document.getElementById("social-form");
  if(!form) return;
  const links = getSocialLinks();
  SOCIAL_PLATFORMS.forEach(p => { if(form[p]) form[p].value = links[p] || ""; });
}
function saveSocialForm(e){
  e.preventDefault();
  const form = e.target;
  const links = {};
  SOCIAL_PLATFORMS.forEach(p => links[p] = form[p].value.trim());
  localStorage.setItem("ec_social_v1", JSON.stringify(links));
  if(typeof renderSocialIcons === "function") renderSocialIcons();
  alert(t("ad_social_save") + " ✓");
}

function exportExtras(){
  const links = getSocialLinks();
  const items = getAllTestimonials();
  const linksCode = JSON.stringify(links, null, 2).split("\n").join("\n  ");
  const itemsBody = items.map(x => "  " + JSON.stringify(x, null, 2).split("\n").join("\n  ")).join(",\n");
  const code = `/* EAST CHEM PLC — social links & farmer stories (exported from admin panel) */\n\nconst SOCIAL_PLATFORMS = ["telegram","email","facebook","tiktok","instagram"];\n\nconst DEFAULT_SOCIAL_LINKS = ${linksCode};\n\nfunction getSocialLinks(){\n  let stored = {};\n  try{ stored = JSON.parse(localStorage.getItem("ec_social_v1") || "{}"); }catch(e){ stored = {}; }\n  const out = {};\n  SOCIAL_PLATFORMS.forEach(p => out[p] = (stored[p] !== undefined ? stored[p] : DEFAULT_SOCIAL_LINKS[p]) || "");\n  return out;\n}\n\nconst DEFAULT_TESTIMONIALS = [\n${itemsBody}\n];\n\nfunction getAllTestimonials(){\n  let stored = [];\n  try{ stored = JSON.parse(localStorage.getItem("ec_testimonials_v1") || "[]"); }catch(e){ stored = []; }\n  const map = new Map();\n  DEFAULT_TESTIMONIALS.forEach(x => map.set(x.id, x));\n  stored.forEach(x => map.set(x.id, x));\n  return Array.from(map.values()).filter(x => !x._deleted);\n}\n`;
  downloadFile("extras-data.js", code);
}

/* ---------- shared download helper ---------- */
function downloadFile(filename, content, afterFn){
  const blob = new Blob([content], { type: "text/javascript" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
  if(afterFn) afterFn();
}
