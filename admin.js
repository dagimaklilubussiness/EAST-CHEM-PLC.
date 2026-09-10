/* =========================================================
   EAST CHEM PLC — admin panel
   Change ACCESS_CODE below to whatever you like before you
   publish the site. This is a friction gate for one shared
   team login, not real user security — don't reuse a
   sensitive password here, and don't rely on it to keep
   the page truly private (anyone who knows the code, or
   reads this file, can get in).
   ========================================================= */

const ACCESS_CODE = "eastchem2026";
const STORE_KEY = "ec_products_v1";
let editingId = null;

document.addEventListener("DOMContentLoaded", () => {
  initGate();
  initLangTabs();
  document.getElementById("add-product-btn")?.addEventListener("click", () => openForm(null));
  document.getElementById("cancel-form-btn")?.addEventListener("click", closeForm);
  document.getElementById("product-form")?.addEventListener("submit", saveProduct);
  document.getElementById("export-btn")?.addEventListener("click", exportProducts);
  document.getElementById("reset-btn")?.addEventListener("click", resetProducts);
  document.getElementById("import-btn")?.addEventListener("click", importProducts);
});

/* ---------- gate ---------- */
function initGate(){
  const gate = document.getElementById("admin-gate");
  const wrap = document.getElementById("admin-wrap");
  const form = document.getElementById("gate-form");
  if(sessionStorage.getItem("ec_admin_ok") === "1"){
    gate.style.display = "none";
    wrap.classList.add("open");
    renderTable();
    return;
  }
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if(form.code.value === ACCESS_CODE){
      sessionStorage.setItem("ec_admin_ok", "1");
      gate.style.display = "none";
      wrap.classList.add("open");
      renderTable();
    } else {
      document.getElementById("gate-error").hidden = false;
    }
  });
  document.getElementById("logout-btn")?.addEventListener("click", () => {
    sessionStorage.removeItem("ec_admin_ok");
    location.reload();
  });
}

/* ---------- language tabs inside the form ---------- */
function initLangTabs(){
  const tabs = document.querySelectorAll(".lang-tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.toggle("active", t === tab));
      document.querySelectorAll(".lang-pane").forEach(p => {
        p.classList.toggle("active", p.dataset.lang === tab.dataset.lang);
      });
    });
  });
}

/* ---------- storage helpers ---------- */
function getOverrides(){
  try{ return JSON.parse(localStorage.getItem(STORE_KEY) || "[]"); }catch(e){ return []; }
}
function saveOverrides(list){
  localStorage.setItem(STORE_KEY, JSON.stringify(list));
}

/* ---------- table ---------- */
function renderTable(){
  const products = getAllProducts();
  const tbody = document.getElementById("admin-tbody");
  tbody.innerHTML = products.map(p => `
    <tr>
      <td>${productField(p,"name","en")}</td>
      <td>${t(catLabelKey(p.category))}</td>
      <td>
        <button class="btn btn-outline btn-sm" data-edit="${p.id}">${t("ad_edit")}</button>
        <button class="btn btn-danger btn-sm" data-del="${p.id}">${t("ad_delete")}</button>
      </td>
    </tr>
  `).join("");
  tbody.querySelectorAll("[data-edit]").forEach(b => b.addEventListener("click", () => openForm(products.find(p => p.id === b.dataset.edit))));
  tbody.querySelectorAll("[data-del]").forEach(b => b.addEventListener("click", () => deleteProduct(b.dataset.del, products)));
}

/* ---------- form ---------- */
function openForm(product){
  editingId = product ? product.id : null;
  document.getElementById("form-title").textContent = product ? t("ad_form_edit") : t("ad_form_new");
  const form = document.getElementById("product-form");
  form.reset();
  SUPPORTED_LANGS.forEach(l => {
    form.querySelector(`[name="name_${l}"]`).value = product ? (product.name?.[l] || "") : "";
    form.querySelector(`[name="desc_${l}"]`).value = product ? (product.desc?.[l] || "") : "";
    form.querySelector(`[name="material_${l}"]`).value = product ? (product.material?.[l] || "") : "";
    form.querySelector(`[name="usage_${l}"]`).value = product ? (product.usage?.[l] || "") : "";
    form.querySelector(`[name="pack_${l}"]`).value = product ? (product.pack?.[l] || "") : "";
  });
  form.category.value = product ? product.category : "fertilizer";
  form.image.value = product ? (product.image || "") : "";
  form.featured.checked = !!(product && product.featured);
  document.getElementById("admin-form-panel").style.display = "block";
  document.getElementById("admin-form-panel").scrollIntoView({ behavior: "smooth" });
}
function closeForm(){
  document.getElementById("admin-form-panel").style.display = "none";
  editingId = null;
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
    featured: form.featured.checked,
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

function deleteProduct(id, currentList){
  if(!confirm(t("ad_confirm_delete"))) return;
  const isDefault = DEFAULT_PRODUCTS.some(p => p.id === id);
  const overrides = getOverrides().filter(p => p.id !== id);
  if(isDefault){
    overrides.push({ id, _deleted: true });
  }
  saveOverrides(overrides);
  renderTable();
}

/* ---------- export / import / reset ---------- */
function exportProducts(){
  const products = getAllProducts();
  const body = products.map(p => "  " + JSON.stringify(p, null, 2).split("\n").join("\n  ")).join(",\n");
  const code = `/* EAST CHEM PLC — product catalog (exported from admin panel) */\n\nconst DEFAULT_PRODUCTS = [\n${body}\n];\n\nfunction getAllProducts(){\n  let stored = [];\n  try{ stored = JSON.parse(localStorage.getItem("ec_products_v1") || "[]"); }catch(e){ stored = []; }\n  const map = new Map();\n  DEFAULT_PRODUCTS.forEach(p => map.set(p.id, p));\n  stored.forEach(p => map.set(p.id, p));\n  return Array.from(map.values()).filter(p => !p._deleted);\n}\n`;
  const box = document.getElementById("export-box");
  box.value = code;
  box.hidden = false;
  const blob = new Blob([code], { type: "text/javascript" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "products-data.js";
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function resetProducts(){
  if(!confirm(t("ad_confirm_delete") + " (" + t("ad_reset_btn") + ")")) return;
  localStorage.removeItem(STORE_KEY);
  renderTable();
}

function importProducts(){
  const box = document.getElementById("export-box");
  box.hidden = false;
  box.focus();
  try{
    const parsed = JSON.parse(box.value);
    if(Array.isArray(parsed)){
      saveOverrides(parsed);
      renderTable();
      alert("Imported.");
    }
  }catch(e){
    alert("Paste a valid JSON array of products into the box first, then click Import again.");
  }
}
