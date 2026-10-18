/* =========================================================
   EAST CHEM PLC — internal ERP (Stage 1)
   Inventory + Sales + Staff roles. Separate from the public
   website and its data — uses its own Firestore collections:
   staff/{uid}, inventory/{autoId}, sales/{autoId}.

   Setup (one-time, by the owner):
   1. Create your own login in Firebase Console →
      Authentication → Users → Add user.
   2. In Firestore → Data, create collection "staff", document
      ID = your User UID (copy from the Users list), fields:
      name (string), role ("owner"), active (true).
   3. Update Firestore rules — see README.
   ========================================================= */

let CURRENT_UID = null, CURRENT_ROLE = null, CURRENT_NAME = null;
let INVENTORY_CACHE = [], SALES_CACHE = [], STAFF_CACHE = [];
let SUPPLIERS_CACHE = [], PO_CACHE = [];
let CUSTOMERS_CACHE = [];
let selectedSaleCustomerId = "";
let editingItemId = null, editingCustomerId = null, editingSupplierId = null;

document.addEventListener("DOMContentLoaded", () => {
  initGate();
  initHandlers();
});


function friendlyError(err){
  const m = (err && err.message) || String(err);
  if(err && err.code === "permission-denied" || /insufficient permissions/i.test(m))
    return "Permission denied. Make sure your staff record has role \"owner\" and active = true, and that the Firestore rules are published.";
  return m;
}

/* ---------- auth + role gate ---------- */
function initGate(){
  const gate = document.getElementById("erp-gate");
  const wrap = document.getElementById("erp-wrap");
  const form = document.getElementById("gate-form");
  const notConfigured = document.getElementById("gate-not-configured");
  const noAccess = document.getElementById("gate-no-access");
  const logoutBtn = document.getElementById("logout-btn");

  if(!FIREBASE_READY){
    form.style.display = "none";
    notConfigured.hidden = false;
    return;
  }

  auth.onAuthStateChanged(async user => {
    noAccess.hidden = true;
    if(!user){
      gate.style.display = "block";
      wrap.classList.remove("open");
      logoutBtn.style.display = "none";
      return;
    }
    try{
      const doc = await db.collection("staff").doc(user.uid).get();
      if(!doc.exists || doc.data().active === false){
        noAccess.hidden = false;
        gate.style.display = "block";
        wrap.classList.remove("open");
        logoutBtn.style.display = "none";
        auth.signOut();
        return;
      }
      CURRENT_UID = user.uid;
      CURRENT_ROLE = doc.data().role || "staff";
      CURRENT_NAME = doc.data().name || user.email;
      gate.style.display = "none";
      wrap.classList.add("open");
      logoutBtn.style.display = "inline-flex";
      try{ await boot(); }
      catch(err){ console.error(err); alert(friendlyError(err)); }
    }catch(err){
      noAccess.hidden = false;
      gate.style.display = "block";
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const errEl = document.getElementById("gate-error");
    errEl.hidden = true;
    auth.signInWithEmailAndPassword(form.email.value.trim(), form.password.value)
      .catch(err => { errEl.hidden = false; errEl.textContent = err.message; });
  });

  logoutBtn.addEventListener("click", () => auth.signOut());
}

/* ---------- boot after successful login ---------- */
async function boot(){
  renderTabs();
  const loads = [loadInventory(), loadSales(), loadCustomers()];
  if(CURRENT_ROLE === "owner") loads.push(loadStaff(), loadSuppliers(), loadPurchaseOrders());
  const results = await Promise.all(loads);
  INVENTORY_CACHE = results[0];
  SALES_CACHE = results[1];
  CUSTOMERS_CACHE = results[2];
  if(CURRENT_ROLE === "owner"){
    STAFF_CACHE = results[3];
    SUPPLIERS_CACHE = results[4];
    PO_CACHE = results[5];
  }

  document.getElementById("cost-col-h").style.display = CURRENT_ROLE === "owner" ? "" : "none";
  document.getElementById("cost-price-field").style.display = CURRENT_ROLE === "owner" ? "" : "none";

  renderInventoryTable();
  populateAdjustSelect();
  renderSalesTable();
  renderCustomerTable();
  populateSaleCustomerSelect();
  if(CURRENT_ROLE === "owner"){
    renderStaffTable();
    renderDashboard();
    renderSupplierTable();
    populateSupplierSelect();
    renderPOTable();
    const now = new Date();
    document.getElementById("report-from").value = now.toISOString().slice(0,8) + "01";
    document.getElementById("report-to").value = now.toISOString().slice(0,10);
    runSalesReport();
    renderInventoryReport();
  }
}

function renderTabs(){
  const wrap = document.getElementById("erp-tabs");
  const tabs = [
    { id:"dashboard", label:"Dashboard", ownerOnly:true },
    { id:"inventory", label:"Inventory" },
    { id:"purchasing", label:"Purchasing", ownerOnly:true },
    { id:"sales", label:"Sales" },
    { id:"customers", label:"Customers" },
    { id:"reports", label:"Reports", ownerOnly:true },
    { id:"staff", label:"Staff", ownerOnly:true }
  ].filter(t => !t.ownerOnly || CURRENT_ROLE === "owner");

  wrap.innerHTML = tabs.map((t,i) => `<button class="filter-chip${i===0?' active':''}" data-tab="${t.id}">${t.label}</button>`).join("");
  document.querySelectorAll(".erp-tab").forEach(sec => sec.style.display = "none");
  if(tabs[0]) document.getElementById("tab-" + tabs[0].id).style.display = "block";

  wrap.querySelectorAll("[data-tab]").forEach(btn => {
    btn.addEventListener("click", () => {
      wrap.querySelectorAll("[data-tab]").forEach(b => b.classList.toggle("active", b === btn));
      document.querySelectorAll(".erp-tab").forEach(sec => sec.style.display = "none");
      document.getElementById("tab-" + btn.dataset.tab).style.display = "block";
    });
  });
}

/* ---------- data loaders ---------- */
async function loadInventory(){
  const snap = await db.collection("inventory").orderBy("name").get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
async function loadSales(){
  const snap = await db.collection("sales").orderBy("createdAt", "desc").limit(100).get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
async function loadStaff(){
  const snap = await db.collection("staff").get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
async function loadCustomers(){
  const snap = await db.collection("customers").orderBy("name").get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
async function loadSuppliers(){
  const snap = await db.collection("suppliers").orderBy("name").get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
async function loadPurchaseOrders(){
  const snap = await db.collection("purchaseOrders").orderBy("createdAt", "desc").limit(100).get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/* =====================================================================
   INVENTORY
   ===================================================================== */
function renderInventoryTable(){
  const tbody = document.getElementById("inventory-tbody");
  tbody.innerHTML = INVENTORY_CACHE.map(it => {
    const low = it.stockQty <= (it.lowStockThreshold || 0);
    const costCell = CURRENT_ROLE === "owner" ? `<td>${it.costPrice != null ? it.costPrice : "-"}</td>` : "";
    const actions = CURRENT_ROLE === "owner"
      ? `<button class="btn btn-outline btn-sm" data-edit-item="${it.id}">Edit</button> <button class="btn btn-danger btn-sm" data-del-item="${it.id}">Delete</button>`
      : "";
    return `<tr${low ? ' style="background:#FBE3DC"' : ''}>
      <td>${it.name}${low ? ' ⚠️' : ''}</td>
      <td>${it.stockQty}</td>
      <td>${it.unit}</td>
      ${costCell}
      <td>${actions}</td>
    </tr>`;
  }).join("");
  if(CURRENT_ROLE === "owner"){
    tbody.querySelectorAll("[data-del-item]").forEach(b => b.addEventListener("click", () => deleteItem(b.dataset.delItem)));
    tbody.querySelectorAll("[data-edit-item]").forEach(b => b.addEventListener("click", () => openItemForm(INVENTORY_CACHE.find(x => x.id === b.dataset.editItem))));
  }
}

function openItemForm(item){
  editingItemId = item ? item.id : null;
  const form = document.getElementById("item-form");
  form.reset();
  document.getElementById("item-form-title").textContent = item ? "Edit Item" : "New Item";
  document.getElementById("stock-qty-field").style.display = item ? "none" : "block";
  document.getElementById("stock-qty-note").style.display = item ? "block" : "none";
  form.querySelector('[name="stockQty"]').required = !item;
  if(item){
    form.elements.name.value = item.name || "";
    form.unit.value = item.unit || "";
    form.lowStockThreshold.value = item.lowStockThreshold != null ? item.lowStockThreshold : 5;
    form.costPrice.value = item.costPrice != null ? item.costPrice : "";
  }
  document.getElementById("item-form-panel").style.display = "block";
  document.getElementById("item-form-panel").scrollIntoView({ behavior: "smooth" });
  form.elements.name.focus();
}

function populateAdjustSelect(){
  const sel = document.getElementById("adjust-item");
  if(!INVENTORY_CACHE.length){
    sel.innerHTML = '<option value="">No items yet. Click "Add New Item" first.</option>';
    sel.disabled = true;
    return;
  }
  sel.disabled = false;
  sel.innerHTML = INVENTORY_CACHE.map(it => `<option value="${it.id}">${it.name} (${it.stockQty} ${it.unit})</option>`).join("");
}

async function refreshInventory(){
  INVENTORY_CACHE = await loadInventory();
  renderInventoryTable();
  populateAdjustSelect();
  if(CURRENT_ROLE === "owner") renderDashboard();
}

async function deleteItem(id){
  if(!confirm("Delete this item?")) return;
  try{ await db.collection("inventory").doc(id).delete(); await refreshInventory(); }
  catch(err){ alert(friendlyError(err)); }
}

/* =====================================================================
   SALES
   ===================================================================== */
function addSaleLine(){
  const wrap = document.getElementById("sale-lines");
  const div = document.createElement("div");
  div.className = "grid2";
  div.setAttribute("data-line", "1");
  div.innerHTML = `
    <div class="field">
      <label>Item</label>
      <select class="line-item" required>
        <option value="">-- Select --</option>
        ${INVENTORY_CACHE.map(it => `<option value="${it.id}">${it.name} (${it.stockQty} ${it.unit})</option>`).join("")}
      </select>
    </div>
    <div class="field">
      <label>Quantity and price</label>
      <div style="display:flex;gap:8px">
        <input type="number" step="any" class="line-qty" placeholder="Qty" required style="width:50%">
        <input type="number" step="any" class="line-price" placeholder="Price" required style="width:50%">
      </div>
    </div>
  `;
  wrap.appendChild(div);
  div.querySelectorAll(".line-qty, .line-price").forEach(el => el.addEventListener("input", updateSaleTotal));
}

function updateSaleTotal(){
  let total = 0;
  document.querySelectorAll("#sale-lines [data-line]").forEach(div => {
    const qty = parseFloat(div.querySelector(".line-qty").value) || 0;
    const price = parseFloat(div.querySelector(".line-price").value) || 0;
    total += qty * price;
  });
  document.getElementById("sale-total-display").textContent = "Total: " + total.toLocaleString();
}

function renderSalesTable(){
  const tbody = document.getElementById("sales-tbody");
  tbody.innerHTML = SALES_CACHE.map(s => {
    const itemsSummary = (s.items || []).map(it => `${it.name} ×${it.qty}`).join(", ");
    const delBtn = CURRENT_ROLE === "owner" ? `<button class="btn btn-danger btn-sm" data-del-sale="${s.id}">Delete</button>` : "";
    return `<tr>
      <td>${s.date || ""}</td>
      <td>${itemsSummary}</td>
      <td>${(s.total || 0).toLocaleString()}</td>
      <td>${s.customerName || "-"}</td>
      <td>${s.recordedByName || ""}</td>
      <td>${delBtn}</td>
    </tr>`;
  }).join("");
  if(CURRENT_ROLE === "owner"){
    tbody.querySelectorAll("[data-del-sale]").forEach(b => b.addEventListener("click", () => deleteSale(b.dataset.delSale)));
  }
}

async function refreshAfterSale(){
  const results = await Promise.all([loadInventory(), loadSales()]);
  INVENTORY_CACHE = results[0];
  SALES_CACHE = results[1];
  renderInventoryTable();
  populateAdjustSelect();
  renderSalesTable();
  if(CURRENT_ROLE === "owner") renderDashboard();
}

async function deleteSale(id){
  if(!confirm("Delete this sale? The stock will be restored.")) return;
  try{
    await db.runTransaction(async tx => {
      const saleRef = db.collection("sales").doc(id);
      const saleDoc = await tx.get(saleRef);
      if(!saleDoc.exists) return;
      const items = saleDoc.data().items || [];
      const refs = items.map(it => db.collection("inventory").doc(it.productId));
      const docs = [];
      for(const r of refs) docs.push(await tx.get(r));
      docs.forEach((doc, i) => {
        if(doc.exists){
          const newQty = (doc.data().stockQty || 0) + items[i].qty;
          tx.update(refs[i], { stockQty: newQty, updatedAt: new Date().toISOString() });
        }
      });
      tx.delete(saleRef);
    });
    await refreshAfterSale();
  }catch(err){ alert(friendlyError(err)); }
}

/* =====================================================================
   DASHBOARD
   ===================================================================== */
function renderDashboard(){
  const now = new Date();
  const ym = now.toISOString().slice(0,7);
  const monthSales = SALES_CACHE.filter(s => (s.date || "").startsWith(ym));
  const revenue = monthSales.reduce((sum, s) => sum + (s.total || 0), 0);
  const lowItems = INVENTORY_CACHE.filter(it => it.stockQty <= (it.lowStockThreshold || 0));

  // estimated profit this month (uses each item's CURRENT cost price,
  // not the cost at the time of that sale — a close estimate, not exact accounting)
  let profit = 0;
  monthSales.forEach(s => {
    (s.items || []).forEach(it => {
      const inv = INVENTORY_CACHE.find(x => x.id === it.productId);
      const cost = (inv && inv.costPrice != null) ? inv.costPrice : 0;
      profit += (it.unitPrice - cost) * it.qty;
    });
  });

  document.getElementById("dash-stats").innerHTML = `
    <div class="stat"><b>${monthSales.length}</b><span>Sales this month</span></div>
    <div class="stat"><b>${revenue.toLocaleString()}</b><span>Revenue this month</span></div>
    <div class="stat"><b>${profit.toLocaleString()}</b><span>Estimated profit this month</span></div>
    <div class="stat"><b>${lowItems.length}</b><span>Low-stock items</span></div>
  `;

  // top customers, all-time, by total spend
  const customerTotals = {};
  SALES_CACHE.forEach(s => {
    if(s.customerId) customerTotals[s.customerId] = (customerTotals[s.customerId] || 0) + (s.total || 0);
  });
  const topCustomers = Object.entries(customerTotals)
    .sort((a,b) => b[1] - a[1]).slice(0,5)
    .map(([id,total]) => ({ name: (CUSTOMERS_CACHE.find(c => c.id === id) || {}).name || "Unknown customer", total }));

  // top products, all-time, by quantity sold
  const productTotals = {};
  SALES_CACHE.forEach(s => {
    (s.items || []).forEach(it => {
      if(!productTotals[it.productId]) productTotals[it.productId] = { name: it.name, qty: 0, revenue: 0 };
      productTotals[it.productId].qty += it.qty;
      productTotals[it.productId].revenue += it.lineTotal;
    });
  });
  const topProducts = Object.values(productTotals).sort((a,b) => b.qty - a.qty).slice(0,5);

  document.getElementById("dash-top-customers").innerHTML = topCustomers.length
    ? `<h3>Top customers</h3><ol>${topCustomers.map(c => `<li>${c.name} — ${c.total.toLocaleString()}</li>`).join("")}</ol>`
    : `<h3>Top customers</h3><p class="note-box">No sales with customers recorded yet.</p>`;

  document.getElementById("dash-top-products").innerHTML = topProducts.length
    ? `<h3>Top-selling items</h3><ol>${topProducts.map(p => `<li>${p.name} — ${p.qty} sold (${p.revenue.toLocaleString()})</li>`).join("")}</ol>`
    : `<h3>Top-selling items</h3><p class="note-box">No sales recorded yet.</p>`;

  document.getElementById("dash-lowstock").innerHTML = lowItems.length
    ? `<h3>Low stock warning</h3><ul>${lowItems.map(it => `<li>${it.name} — ${it.stockQty} ${it.unit} left</li>`).join("")}</ul>`
    : "";
}

/* =====================================================================
   CUSTOMERS
   ===================================================================== */
function customerTotalSpent(customerId){
  return SALES_CACHE
    .filter(s => s.customerId === customerId)
    .reduce((sum, s) => sum + (s.total || 0), 0);
}

function renderCustomerTable(){
  const tbody = document.getElementById("customer-tbody");
  const term = (document.getElementById("customer-search")?.value || "").trim().toLowerCase();
  const list = CUSTOMERS_CACHE.filter(c => !term || (c.name||"").toLowerCase().includes(term) || (c.phone||"").includes(term));
  const delCell = CURRENT_ROLE === "owner";
  tbody.innerHTML = list.map(c => `
    <tr>
      <td>${c.name || ""}</td>
      <td>${c.phone || "-"}</td>
      <td>${customerTotalSpent(c.id).toLocaleString()}</td>
      <td>
        <button class="btn btn-outline btn-sm" data-history-customer="${c.id}">History</button>
        <button class="btn btn-outline btn-sm" data-edit-customer="${c.id}">Edit</button>
        ${delCell ? `<button class="btn btn-danger btn-sm" data-del-customer="${c.id}">Delete</button>` : ""}
      </td>
    </tr>
  `).join("");
  tbody.querySelectorAll("[data-history-customer]").forEach(b => b.addEventListener("click", () => showCustomerHistory(b.dataset.historyCustomer)));
  tbody.querySelectorAll("[data-edit-customer]").forEach(b => b.addEventListener("click", () => openCustomerForm(CUSTOMERS_CACHE.find(x => x.id === b.dataset.editCustomer))));
  if(delCell){
    tbody.querySelectorAll("[data-del-customer]").forEach(b => b.addEventListener("click", () => deleteCustomer(b.dataset.delCustomer)));
  }
}

function openCustomerForm(customer){
  editingCustomerId = customer ? customer.id : null;
  const form = document.getElementById("customer-form");
  form.reset();
  if(customer){
    form.elements.name.value = customer.name || "";
    form.phone.value = customer.phone || "";
    form.address.value = customer.address || "";
  }
  document.getElementById("customer-form-panel").style.display = "block";
  document.getElementById("customer-form-panel").scrollIntoView({ behavior: "smooth" });
}

function showCustomerHistory(customerId){
  const c = CUSTOMERS_CACHE.find(x => x.id === customerId);
  if(!c) return;
  const sales = SALES_CACHE.filter(s => s.customerId === customerId);
  document.getElementById("customer-history-title").textContent = (c.name || "") + " — Purchase history";
  document.getElementById("customer-history-tbody").innerHTML = sales.length
    ? sales.map(s => `<tr><td>${s.date||""}</td><td>${(s.items||[]).map(it=>`${it.name} ×${it.qty}`).join(", ")}</td><td>${(s.total||0).toLocaleString()}</td></tr>`).join("")
    : `<tr><td colspan="3">No purchases recorded.</td></tr>`;
  document.getElementById("customer-history-panel").style.display = "block";
  document.getElementById("customer-history-panel").scrollIntoView({ behavior: "smooth" });
}

function populateSaleCustomerSelect(){
  const sel = document.getElementById("sale-customer-select");
  if(!sel) return;
  sel.innerHTML = `<option value="">-- or type freely below --</option>` +
    CUSTOMERS_CACHE.map(c => `<option value="${c.id}">${c.name}${c.phone ? " ("+c.phone+")" : ""}</option>`).join("");
}

async function refreshCustomers(){
  CUSTOMERS_CACHE = await loadCustomers();
  renderCustomerTable();
  populateSaleCustomerSelect();
}

async function deleteCustomer(id){
  if(!confirm("Delete this customer?")) return;
  try{ await db.collection("customers").doc(id).delete(); await refreshCustomers(); }
  catch(err){ alert(friendlyError(err)); }
}

/* =====================================================================
   PURCHASING — suppliers + purchase orders (owner only)
   ===================================================================== */
function renderSupplierTable(){
  const tbody = document.getElementById("supplier-tbody");
  tbody.innerHTML = SUPPLIERS_CACHE.map(s => `
    <tr>
      <td>${s.name || ""}</td>
      <td>${s.phone || "-"}</td>
      <td>${s.address || "-"}</td>
      <td>
        <button class="btn btn-outline btn-sm" data-edit-supplier="${s.id}">Edit</button>
        <button class="btn btn-danger btn-sm" data-del-supplier="${s.id}">Delete</button>
      </td>
    </tr>
  `).join("");
  tbody.querySelectorAll("[data-del-supplier]").forEach(b => b.addEventListener("click", () => deleteSupplier(b.dataset.delSupplier)));
  tbody.querySelectorAll("[data-edit-supplier]").forEach(b => b.addEventListener("click", () => openSupplierForm(SUPPLIERS_CACHE.find(x => x.id === b.dataset.editSupplier))));
}

function openSupplierForm(supplier){
  editingSupplierId = supplier ? supplier.id : null;
  const form = document.getElementById("supplier-form");
  form.reset();
  if(supplier){
    form.elements.name.value = supplier.name || "";
    form.phone.value = supplier.phone || "";
    form.address.value = supplier.address || "";
  }
  document.getElementById("supplier-form-panel").style.display = "block";
  document.getElementById("supplier-form-panel").scrollIntoView({ behavior: "smooth" });
}
function populateSupplierSelect(){
  document.getElementById("po-supplier").innerHTML = SUPPLIERS_CACHE.map(s => `<option value="${s.id}">${s.name}</option>`).join("");
}
async function refreshSuppliers(){
  SUPPLIERS_CACHE = await loadSuppliers();
  renderSupplierTable();
  populateSupplierSelect();
}
async function deleteSupplier(id){
  if(!confirm("Delete this supplier?")) return;
  try{ await db.collection("suppliers").doc(id).delete(); await refreshSuppliers(); }
  catch(err){ alert(friendlyError(err)); }
}

function addPOLine(){
  const wrap = document.getElementById("po-lines");
  const div = document.createElement("div");
  div.className = "grid2";
  div.setAttribute("data-po-line", "1");
  div.innerHTML = `
    <div class="field">
      <label>Item</label>
      <select class="po-line-item" required>
        <option value="">-- Select --</option>
        ${INVENTORY_CACHE.map(it => `<option value="${it.id}">${it.name} (${it.stockQty} ${it.unit})</option>`).join("")}
      </select>
    </div>
    <div class="field">
      <label>Quantity and purchase cost</label>
      <div style="display:flex;gap:8px">
        <input type="number" step="any" class="po-line-qty" placeholder="Qty" required style="width:50%">
        <input type="number" step="any" class="po-line-cost" placeholder="Price" required style="width:50%">
      </div>
    </div>
  `;
  wrap.appendChild(div);
  div.querySelectorAll(".po-line-qty, .po-line-cost").forEach(el => el.addEventListener("input", updatePOTotal));
}
function updatePOTotal(){
  let total = 0;
  document.querySelectorAll("#po-lines [data-po-line]").forEach(div => {
    const qty = parseFloat(div.querySelector(".po-line-qty").value) || 0;
    const cost = parseFloat(div.querySelector(".po-line-cost").value) || 0;
    total += qty * cost;
  });
  document.getElementById("po-total-display").textContent = "Total: " + total.toLocaleString();
}

function renderPOTable(){
  const tbody = document.getElementById("po-tbody");
  tbody.innerHTML = PO_CACHE.map(po => {
    const itemsSummary = (po.items || []).map(it => `${it.name} ×${it.qty}`).join(", ");
    const statusLabel = po.status === "received" ? "Received ✓" : "Pending";
    const receiveBtn = po.status !== "received" ? `<button class="btn btn-primary btn-sm" data-receive-po="${po.id}">Mark as Received</button>` : "";
    return `<tr>
      <td>${(po.createdAt || "").slice(0,10)}</td>
      <td>${po.supplierName || ""}</td>
      <td>${itemsSummary}</td>
      <td>${(po.total || 0).toLocaleString()}</td>
      <td>${statusLabel}</td>
      <td>${receiveBtn}</td>
    </tr>`;
  }).join("");
  tbody.querySelectorAll("[data-receive-po]").forEach(b => b.addEventListener("click", () => receivePO(b.dataset.receivePo)));
}

async function refreshAfterPO(){
  const results = await Promise.all([loadInventory(), loadPurchaseOrders()]);
  INVENTORY_CACHE = results[0];
  PO_CACHE = results[1];
  renderInventoryTable();
  populateAdjustSelect();
  populateSupplierSelect();
  renderPOTable();
}

/* Marking a PO "received": increases stock for each line item and
   updates that item's cost as a weighted average of old stock+cost
   and the newly received qty+cost — same idea Kaliber uses. */
async function receivePO(poId){
  if(!confirm("Mark this purchase order as received? Stock will increase automatically.")) return;
  try{
    await db.runTransaction(async (tx) => {
      const poRef = db.collection("purchaseOrders").doc(poId);
      const poDoc = await tx.get(poRef);
      if(!poDoc.exists) throw new Error("Order not found.");
      const po = poDoc.data();
      if(po.status === "received") throw new Error("This order is already marked as received.");
      const items = po.items || [];
      const refs = items.map(it => db.collection("inventory").doc(it.productId));
      const docs = [];
      for(const r of refs) docs.push(await tx.get(r));
      docs.forEach((doc, i) => {
        if(!doc.exists) return;
        const oldQty = doc.data().stockQty || 0;
        const oldCost = doc.data().costPrice || 0;
        const addQty = items[i].qty;
        const addCost = items[i].unitCost;
        const newQty = oldQty + addQty;
        const newCost = newQty > 0 ? ((oldQty * oldCost) + (addQty * addCost)) / newQty : addCost;
        tx.update(refs[i], { stockQty: newQty, costPrice: Math.round(newCost * 100) / 100, updatedAt: new Date().toISOString() });
      });
      tx.update(poRef, { status: "received", receivedAt: new Date().toISOString() });
    });
    await refreshAfterPO();
  }catch(err){ alert(friendlyError(err)); }
}

/* =====================================================================
   REPORTS (owner only)
   ===================================================================== */
function csvEscape(val){
  const s = String(val == null ? "" : val);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
function downloadCSV(filename, rows){
  const csv = rows.map(row => row.map(csvEscape).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function filteredReportSales(){
  const from = document.getElementById("report-from").value;
  const to = document.getElementById("report-to").value;
  return SALES_CACHE.filter(s => {
    const d = s.date || "";
    if(from && d < from) return false;
    if(to && d > to) return false;
    return true;
  });
}

function runSalesReport(){
  const sales = filteredReportSales();
  const revenue = sales.reduce((sum, s) => sum + (s.total || 0), 0);
  let profit = 0;
  sales.forEach(s => (s.items || []).forEach(it => {
    const inv = INVENTORY_CACHE.find(x => x.id === it.productId);
    const cost = (inv && inv.costPrice != null) ? inv.costPrice : 0;
    profit += (it.unitPrice - cost) * it.qty;
  }));

  document.getElementById("sales-report-summary").innerHTML = `
    <div class="stat"><b>${sales.length}</b><span>Number of sales</span></div>
    <div class="stat"><b>${revenue.toLocaleString()}</b><span>Total revenue</span></div>
    <div class="stat"><b>${profit.toLocaleString()}</b><span>Estimated profit</span></div>
  `;
  document.getElementById("sales-report-tbody").innerHTML = sales.map(s => `
    <tr>
      <td>${s.date || ""}</td>
      <td>${(s.items || []).map(it => `${it.name} ×${it.qty}`).join(", ")}</td>
      <td>${(s.total || 0).toLocaleString()}</td>
      <td>${s.customerName || "-"}</td>
      <td>${s.recordedByName || ""}</td>
    </tr>
  `).join("");
}

function exportSalesCSV(){
  const sales = filteredReportSales();
  const rows = [["Date","Items","Total","Customer","Recorded by"]];
  sales.forEach(s => rows.push([
    s.date || "",
    (s.items || []).map(it => `${it.name} x${it.qty}`).join("; "),
    s.total || 0,
    s.customerName || "",
    s.recordedByName || ""
  ]));
  downloadCSV("sales-report.csv", rows);
}

function renderInventoryReport(){
  const totalValue = INVENTORY_CACHE.reduce((sum, it) => sum + (it.stockQty || 0) * (it.costPrice || 0), 0);
  document.getElementById("inventory-value-total").textContent = "Total inventory value: " + totalValue.toLocaleString();
  document.getElementById("inventory-report-tbody").innerHTML = INVENTORY_CACHE.map(it => `
    <tr>
      <td>${it.name}</td>
      <td>${it.stockQty}</td>
      <td>${it.unit}</td>
      <td>${it.costPrice != null ? it.costPrice : "-"}</td>
      <td>${((it.stockQty || 0) * (it.costPrice || 0)).toLocaleString()}</td>
    </tr>
  `).join("");
}

function exportInventoryCSV(){
  const rows = [["Name","Inventory","Unit","Purchase cost","Total value"]];
  INVENTORY_CACHE.forEach(it => rows.push([
    it.name, it.stockQty, it.unit, it.costPrice != null ? it.costPrice : "", (it.stockQty || 0) * (it.costPrice || 0)
  ]));
  downloadCSV("inventory-report.csv", rows);
}

/* =====================================================================
   STAFF (owner only)
   ===================================================================== */
function renderStaffTable(){
  const tbody = document.getElementById("staff-tbody");
  tbody.innerHTML = STAFF_CACHE.map(s => `
    <tr>
      <td>${s.name || ""}</td>
      <td>${s.role === "owner" ? "Owner" : "Staff"}</td>
      <td>${s.active === false ? "Inactive" : "Active"}</td>
      <td><button class="btn btn-outline btn-sm" data-toggle-staff="${s.id}">${s.active === false ? "Activate" : "Deactivate"}</button></td>
    </tr>
  `).join("");
  tbody.querySelectorAll("[data-toggle-staff]").forEach(b => b.addEventListener("click", () => toggleStaffActive(b.dataset.toggleStaff)));
}

async function toggleStaffActive(uid){
  const s = STAFF_CACHE.find(x => x.id === uid);
  if(!s) return;
  try{
    await db.collection("staff").doc(uid).update({ active: s.active === false ? true : false });
    STAFF_CACHE = await loadStaff();
    renderStaffTable();
  }catch(err){ alert(friendlyError(err)); }
}

/* ---------- all form/button wiring, registered once ---------- */
function initHandlers(){
  document.getElementById("add-item-btn").addEventListener("click", () => openItemForm(null));
  document.getElementById("cancel-item-btn").addEventListener("click", () => {
    document.getElementById("item-form-panel").style.display = "none";
  });
  document.getElementById("item-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target;
    const data = {
      name: f.elements.name.value.trim(),
      unit: f.unit.value.trim(),
      lowStockThreshold: parseFloat(f.lowStockThreshold.value) || 0,
      costPrice: (CURRENT_ROLE === "owner" && f.costPrice.value) ? parseFloat(f.costPrice.value) : null,
      updatedAt: new Date().toISOString()
    };
    try{
      if(editingItemId){
        await db.collection("inventory").doc(editingItemId).update(data);
      } else {
        data.stockQty = parseFloat(f.stockQty.value) || 0;
        await db.collection("inventory").add(data);
      }
      document.getElementById("item-form-panel").style.display = "none";
      await refreshInventory();
    }catch(err){ alert(friendlyError(err)); }
  });

  document.getElementById("adjust-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target;
    const itemId = f.itemId.value;
    const delta = parseFloat(f.delta.value);
    if(!itemId){ alert("Please add an item first."); return; }
    if(isNaN(delta)) return;
    try{
      await db.runTransaction(async (tx) => {
        const ref = db.collection("inventory").doc(itemId);
        const doc = await tx.get(ref);
        if(!doc.exists) throw new Error("Item not found.");
        const newQty = (doc.data().stockQty || 0) + delta;
        tx.update(ref, { stockQty: newQty, updatedAt: new Date().toISOString() });
      });
      f.reset();
      await refreshInventory();
    }catch(err){ alert(friendlyError(err)); }
  });

  document.getElementById("add-sale-btn").addEventListener("click", () => {
    if(!INVENTORY_CACHE.length){ alert("Please register an item in the Inventory tab first."); return; }
    document.getElementById("sale-form").reset();
    document.getElementById("sale-lines").innerHTML = "";
    selectedSaleCustomerId = "";
    addSaleLine();
    updateSaleTotal();
    document.getElementById("sale-form-panel").style.display = "block";
  });
  document.getElementById("cancel-sale-btn").addEventListener("click", () => {
    document.getElementById("sale-form-panel").style.display = "none";
  });
  document.getElementById("add-line-btn").addEventListener("click", addSaleLine);
  document.getElementById("sale-customer-select")?.addEventListener("change", (e) => {
    selectedSaleCustomerId = e.target.value;
    const c = CUSTOMERS_CACHE.find(x => x.id === selectedSaleCustomerId);
    document.getElementById("sale-customer-name").value = c ? (c.name || "") : "";
    document.getElementById("sale-customer-phone").value = c ? (c.phone || "") : "";
  });

  document.getElementById("sale-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target;
    const items = [];
    document.querySelectorAll("#sale-lines [data-line]").forEach(div => {
      const sel = div.querySelector(".line-item");
      const opt = sel.selectedOptions[0];
      const qty = parseFloat(div.querySelector(".line-qty").value) || 0;
      const price = parseFloat(div.querySelector(".line-price").value) || 0;
      if(sel.value && qty > 0){
        items.push({ productId: sel.value, name: opt.textContent, qty, unitPrice: price, lineTotal: qty * price });
      }
    });
    if(!items.length){ alert("Select at least one item."); return; }
    const total = items.reduce((s, x) => s + x.lineTotal, 0);
    const sale = {
      date: new Date().toISOString().slice(0,10),
      items, total,
      customerId: selectedSaleCustomerId || null,
      customerName: f.customerName.value.trim(),
      customerPhone: f.customerPhone.value.trim(),
      notes: f.notes.value.trim(),
      recordedByName: CURRENT_NAME,
      recordedByUid: CURRENT_UID,
      createdAt: new Date().toISOString()
    };
    try{
      await db.runTransaction(async (tx) => {
        const refs = items.map(it => db.collection("inventory").doc(it.productId));
        const docs = [];
        for(const r of refs) docs.push(await tx.get(r));
        docs.forEach((doc, i) => {
          if(!doc.exists) throw new Error("Item not found: " + items[i].name);
          const newQty = (doc.data().stockQty || 0) - items[i].qty;
          tx.update(refs[i], { stockQty: newQty, updatedAt: new Date().toISOString() });
        });
        const saleRef = db.collection("sales").doc();
        tx.set(saleRef, sale);
      });
      document.getElementById("sale-form-panel").style.display = "none";
      await refreshAfterSale();
    }catch(err){ alert(friendlyError(err)); }
  });

  document.getElementById("add-customer-btn")?.addEventListener("click", () => openCustomerForm(null));
  document.getElementById("cancel-customer-btn")?.addEventListener("click", () => {
    document.getElementById("customer-form-panel").style.display = "none";
  });
  document.getElementById("customer-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target;
    const data = { name: f.elements.name.value.trim(), phone: f.phone.value.trim(), address: f.address.value.trim() };
    try{
      if(editingCustomerId){
        await db.collection("customers").doc(editingCustomerId).update(data);
      } else {
        data.createdAt = new Date().toISOString();
        await db.collection("customers").add(data);
      }
      document.getElementById("customer-form-panel").style.display = "none";
      await refreshCustomers();
    }catch(err){ alert(friendlyError(err)); }
  });
  document.getElementById("customer-search")?.addEventListener("input", renderCustomerTable);
  document.getElementById("close-history-btn")?.addEventListener("click", () => {
    document.getElementById("customer-history-panel").style.display = "none";
  });

  document.getElementById("add-supplier-btn")?.addEventListener("click", () => openSupplierForm(null));
  document.getElementById("cancel-supplier-btn")?.addEventListener("click", () => {
    document.getElementById("supplier-form-panel").style.display = "none";
  });
  document.getElementById("supplier-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target;
    const data = { name: f.elements.name.value.trim(), phone: f.phone.value.trim(), address: f.address.value.trim() };
    try{
      if(editingSupplierId){
        await db.collection("suppliers").doc(editingSupplierId).update(data);
      } else {
        await db.collection("suppliers").add(data);
      }
      document.getElementById("supplier-form-panel").style.display = "none";
      await refreshSuppliers();
    }catch(err){ alert(friendlyError(err)); }
  });

  document.getElementById("add-po-btn")?.addEventListener("click", () => {
    if(!SUPPLIERS_CACHE.length){ alert("Please register at least one supplier first."); return; }
    if(!INVENTORY_CACHE.length){ alert("Please register an item in the Inventory tab first."); return; }
    document.getElementById("po-form").reset();
    document.getElementById("po-lines").innerHTML = "";
    addPOLine();
    updatePOTotal();
    document.getElementById("po-form-panel").style.display = "block";
  });
  document.getElementById("cancel-po-btn")?.addEventListener("click", () => {
    document.getElementById("po-form-panel").style.display = "none";
  });
  document.getElementById("add-po-line-btn")?.addEventListener("click", addPOLine);

  document.getElementById("po-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target;
    const items = [];
    document.querySelectorAll("#po-lines [data-po-line]").forEach(div => {
      const sel = div.querySelector(".po-line-item");
      const opt = sel.selectedOptions[0];
      const qty = parseFloat(div.querySelector(".po-line-qty").value) || 0;
      const unitCost = parseFloat(div.querySelector(".po-line-cost").value) || 0;
      if(sel.value && qty > 0){
        items.push({ productId: sel.value, name: opt.textContent, qty, unitCost, lineTotal: qty * unitCost });
      }
    });
    if(!items.length){ alert("Select at least one item."); return; }
    const supplierOpt = f.supplierId.selectedOptions[0];
    const total = items.reduce((s, x) => s + x.lineTotal, 0);
    try{
      await db.collection("purchaseOrders").add({
        supplierId: f.supplierId.value,
        supplierName: supplierOpt ? supplierOpt.textContent : "",
        items, total,
        status: "pending",
        notes: f.notes.value.trim(),
        createdByName: CURRENT_NAME,
        createdByUid: CURRENT_UID,
        createdAt: new Date().toISOString()
      });
      document.getElementById("po-form-panel").style.display = "none";
      PO_CACHE = await loadPurchaseOrders();
      renderPOTable();
    }catch(err){ alert(friendlyError(err)); }
  });

  document.getElementById("run-sales-report-btn")?.addEventListener("click", runSalesReport);
  document.getElementById("export-sales-csv-btn")?.addEventListener("click", exportSalesCSV);
  document.getElementById("export-inventory-csv-btn")?.addEventListener("click", exportInventoryCSV);
  document.getElementById("print-report-btn")?.addEventListener("click", () => window.print());

  document.getElementById("add-staff-btn")?.addEventListener("click", () => {
    document.getElementById("staff-form").reset();
    document.getElementById("staff-form-panel").style.display = "block";
  });
  document.getElementById("cancel-staff-btn")?.addEventListener("click", () => {
    document.getElementById("staff-form-panel").style.display = "none";
  });
  document.getElementById("staff-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target;
    const uid = f.uid.value.trim();
    if(!uid) return;
    try{
      await db.collection("staff").doc(uid).set({ name: f.elements.name.value.trim(), role: f.role.value, active: true });
      document.getElementById("staff-form-panel").style.display = "none";
      STAFF_CACHE = await loadStaff();
      renderStaffTable();
    }catch(err){ alert(friendlyError(err)); }
  });
}
