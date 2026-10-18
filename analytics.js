/* =========================================================
   EAST CHEM PLC — Sales analytics (owner view)
   Pure SVG charts, no external libraries.
   Used by erp.js:  EC_STATS.mount(container, () => ({ sales, inventory }))
   ========================================================= */
(function (root) {

  const C = { green: "#1E7A3E", gold: "#C99A2E", ink: "#23261E", soft: "#6B6E5E", grid: "#E3E6DD", red: "#C0392B", amber: "#E2A21F", leaf: "#7E9E3B", track: "#EEF2EA" };
  const MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const DOW = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const DOW_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Monday first

  /* ---------- small helpers ---------- */
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const num = (n) => Number(n) || 0;
  const money = (n) => num(n).toLocaleString("en-US", { maximumFractionDigits: 2 });
  const compact = (n) => {
    const a = Math.abs(n);
    if (a >= 1e6) return (n / 1e6).toFixed(a >= 1e7 ? 0 : 1).replace(/\.0$/, "") + "M";
    if (a >= 1e3) return (n / 1e3).toFixed(a >= 1e4 ? 0 : 1).replace(/\.0$/, "") + "K";
    return String(Math.round(n * 100) / 100);
  };
  const trunc = (s, n) => (String(s).length > n ? String(s).slice(0, n - 1) + "…" : String(s));
  const pad2 = (n) => String(n).padStart(2, "0");

  function parseD(s) { const p = String(s || "").split("-").map(Number); return new Date(p[0], (p[1] || 1) - 1, p[2] || 1); }
  function fmtD(d) { return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()); }
  function addDays(d, n) { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); return x; }
  function daysBetween(a, b) { return Math.round((b - a) / 86400000); }
  function todayLocal() { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); }
  function labelFor(key, group) {
    if (group === "year") return key;
    if (group === "month") { const p = key.split("-"); return MON[+p[1] - 1] + " " + p[0]; }
    const d = parseD(key); return d.getDate() + " " + MON[d.getMonth()];
  }
  function longDay(key) { const d = parseD(key); return DOW[d.getDay()].slice(0, 3) + " " + d.getDate() + " " + MON[d.getMonth()] + " " + d.getFullYear(); }
  function bucketKey(dateStr, group) {
    if (group === "year") return dateStr.slice(0, 4);
    if (group === "month") return dateStr.slice(0, 7);
    return dateStr;
  }

  /* ---------- SVG charts ---------- */
  function niceMax(max, integer) {
    if (max <= 0) return { max: integer ? 4 : 1, step: integer ? 1 : 0.25 };
    const exp = Math.pow(10, Math.floor(Math.log10(max)));
    const f = max / exp;
    const nf = f <= 1 ? 1 : f <= 2 ? 2 : f <= 4 ? 4 : f <= 5 ? 5 : 10;
    let m = nf * exp;
    if (integer && m < 4) m = 4;
    return { max: m, step: m / 4 };
  }

  function barChart(o) {
    const data = o.data, n = data.length;
    const W = 680, H = o.height || 270, ml = 50, mr = 12, mt = 18, mb = n > 8 ? 56 : 40;
    const pw = W - ml - mr, ph = H - mt - mb;
    const vmax = Math.max.apply(null, data.map((d) => d.value).concat([0]));
    const sc = niceMax(vmax, o.integer);
    const slot = pw / Math.max(n, 1), bw = Math.min(46, slot * 0.68);
    let maxIdx = -1; if (vmax > 0) maxIdx = data.findIndex((d) => d.value === vmax);
    let s = '<svg viewBox="0 0 ' + W + " " + H + '" width="100%" role="img" aria-label="' + esc(o.aria || "chart") + '" style="display:block;font-family:inherit">';
    for (let i = 0; i <= 4; i++) {
      const v = sc.step * i, y = mt + ph - (v / sc.max) * ph;
      s += '<line x1="' + ml + '" x2="' + (W - mr) + '" y1="' + y + '" y2="' + y + '" stroke="' + (i === 0 ? "#B9C0B0" : C.grid) + '" stroke-width="1"/>';
      s += '<text x="' + (ml - 8) + '" y="' + (y + 4) + '" text-anchor="end" font-size="11" fill="' + C.soft + '">' + esc(o.axisFmt ? o.axisFmt(v) : compact(v)) + "</text>";
    }
    const every = Math.max(1, Math.ceil(n / 12));
    data.forEach((d, i) => {
      const cx = ml + slot * i + slot / 2;
      const h = Math.max(d.value > 0 ? 2 : 0, (d.value / sc.max) * ph);
      const x = cx - bw / 2, y = mt + ph - h;
      const fill = i === maxIdx ? C.gold : C.green;
      s += "<g><title>" + esc(d.tip || d.label + ": " + (o.fmt ? o.fmt(d.value) : money(d.value))) + "</title>";
      s += '<rect x="' + x + '" y="' + y + '" width="' + bw + '" height="' + h + '" rx="3" fill="' + fill + '" opacity="' + (d.value > 0 ? 1 : 0.25) + '"/>';
      if (n <= 12 && d.value > 0) s += '<text x="' + cx + '" y="' + (y - 5) + '" text-anchor="middle" font-size="11" font-weight="600" fill="' + C.ink + '">' + esc(o.fmt ? o.fmt(d.value, true) : compact(d.value)) + "</text>";
      s += "</g>";
      if (i % every === 0 || i === n - 1) {
        const ly = mt + ph + 16;
        if (n > 8) s += '<text transform="translate(' + cx + "," + ly + ') rotate(-35)" text-anchor="end" font-size="11" fill="' + C.soft + '">' + esc(d.label) + "</text>";
        else s += '<text x="' + cx + '" y="' + ly + '" text-anchor="middle" font-size="12" fill="' + C.soft + '">' + esc(d.label) + "</text>";
      }
    });
    return s + "</svg>";
  }

  function hbarChart(o) {
    const data = o.data, n = data.length;
    const W = 680, rowH = o.rowH || 34, labelW = o.labelW || 165, valW = o.valW || 110;
    const H = Math.max(rowH * n + 8, 40);
    const barX = labelW + 8, barW = W - barX - valW;
    const vmax = Math.max.apply(null, data.map((d) => (d.pct != null ? 1 : d.value)).concat([0])) || 1;
    let s = '<svg viewBox="0 0 ' + W + " " + H + '" width="100%" role="img" aria-label="' + esc(o.aria || "chart") + '" style="display:block;font-family:inherit">';
    data.forEach((d, i) => {
      const y = i * rowH + 4, cy = y + rowH / 2;
      const frac = d.pct != null ? Math.max(0, Math.min(1, d.pct)) : d.value / vmax;
      const w = Math.max(frac > 0 ? 3 : 0, frac * barW);
      s += "<g><title>" + esc(d.tip || d.label) + "</title>";
      s += '<text x="' + labelW + '" y="' + (cy + 4) + '" text-anchor="end" font-size="12.5" fill="' + C.ink + '">' + esc(trunc(d.label, 21)) + "</text>";
      s += '<rect x="' + barX + '" y="' + (cy - 9) + '" width="' + barW + '" height="18" rx="4" fill="' + C.track + '"/>';
      s += '<rect x="' + barX + '" y="' + (cy - 9) + '" width="' + w + '" height="18" rx="4" fill="' + (d.color || (i === 0 && o.goldFirst ? C.gold : C.green)) + '"/>';
      s += '<text x="' + (barX + barW + 8) + '" y="' + (cy + 4) + '" font-size="12" font-weight="600" fill="' + C.ink + '">' + esc(d.valueText != null ? d.valueText : money(d.value)) + "</text>";
      s += "</g>";
    });
    return s + "</svg>";
  }

  /* ---------- data crunching ---------- */
  function rangeOf(state, sales) {
    const today = todayLocal();
    let start, end = today;
    if (state.range === "7d") start = addDays(today, -6);
    else if (state.range === "30d") start = addDays(today, -29);
    else if (state.range === "month") start = new Date(today.getFullYear(), today.getMonth(), 1);
    else if (state.range === "year") start = new Date(today.getFullYear(), 0, 1);
    else {
      const ds = sales.map((s) => s.date).filter(Boolean).sort();
      start = ds.length ? parseD(ds[0]) : today;
    }
    return { start, end };
  }

  function lineStats(sale, itemId) {
    const lines = (sale.items || []).filter((it) => itemId === "all" || it.productId === itemId);
    if (!lines.length) return null;
    const rev = lines.reduce((s, it) => s + (it.lineTotal != null ? num(it.lineTotal) : num(it.qty) * num(it.unitPrice)), 0);
    const qty = lines.reduce((s, it) => s + num(it.qty), 0);
    return { revenue: rev, qty, count: 1 };
  }

  function compute(data, st) {
    const sales = (data.sales || []).filter((s) => s.date);
    const inv = data.inventory || [];
    const { start, end } = rangeOf(st, sales);
    const inRange = (s, a, b) => s.date >= fmtD(a) && s.date <= fmtD(b);
    const cur = sales.filter((s) => inRange(s, start, end));
    const len = daysBetween(start, end) + 1;
    const prevEnd = addDays(start, -1), prevStart = addDays(prevEnd, -(len - 1));
    const prev = st.range === "all" ? [] : sales.filter((s) => inRange(s, prevStart, prevEnd));

    let group = st.group;
    if (group === "day" && len > 400) group = "month";
    // bucket skeleton (continuous timeline)
    const keys = [];
    if (group === "day") { for (let d = new Date(start); d <= end; d = addDays(d, 1)) keys.push(fmtD(d)); }
    else if (group === "month") { for (let y = start.getFullYear(), m = start.getMonth(); y < end.getFullYear() || (y === end.getFullYear() && m <= end.getMonth()); m++) { if (m > 11) { m = 0; y++; } keys.push(y + "-" + pad2(m + 1)); if (y === end.getFullYear() && m === end.getMonth()) break; } }
    else { for (let y = start.getFullYear(); y <= end.getFullYear(); y++) keys.push(String(y)); }
    const bucket = {}; keys.forEach((k) => (bucket[k] = { revenue: 0, qty: 0, count: 0 }));
    const weekday = {}; for (let i = 0; i < 7; i++) weekday[i] = { revenue: 0, qty: 0, count: 0 };
    const perDay = {}, perCustomer = {}, perItem = {};
    let totals = { revenue: 0, qty: 0, count: 0 };

    cur.forEach((s) => {
      const ls = lineStats(s, st.item);
      if (ls) {
        const k = bucketKey(s.date, group);
        if (bucket[k]) { bucket[k].revenue += ls.revenue; bucket[k].qty += ls.qty; bucket[k].count += 1; }
        const w = weekday[parseD(s.date).getDay()]; w.revenue += ls.revenue; w.qty += ls.qty; w.count += 1;
        totals.revenue += ls.revenue; totals.qty += ls.qty; totals.count += 1;
        const pd = perDay[s.date] || (perDay[s.date] = { revenue: 0, count: 0 }); pd.revenue += ls.revenue; pd.count += 1;
      }
      // items & customers always use the whole sale
      const nm = String(s.customerName || "").trim();
      const whole = lineStats(s, "all");
      if (nm && whole) { const key = nm.toLowerCase(); const c = perCustomer[key] || (perCustomer[key] = { name: nm, revenue: 0, count: 0 }); c.revenue += whole.revenue; c.count += 1; }
      (s.items || []).forEach((it) => {
        const key = it.productId || it.name;
        const o = perItem[key] || (perItem[key] = { id: it.productId, name: it.name, revenue: 0, qty: 0 });
        o.revenue += it.lineTotal != null ? num(it.lineTotal) : num(it.qty) * num(it.unitPrice); o.qty += num(it.qty);
      });
    });

    let prevTotals = { revenue: 0, count: 0 };
    prev.forEach((s) => { const ls = lineStats(s, st.item); if (ls) { prevTotals.revenue += ls.revenue; prevTotals.count += 1; } });

    // best month (all time, so the insight is stable)
    const perMonth = {};
    sales.forEach((s) => { const ls = lineStats(s, "all"); if (ls) { const k = s.date.slice(0, 7); perMonth[k] = (perMonth[k] || 0) + ls.revenue; } });

    return { start, end, len, group, keys, bucket, weekday, perDay, perCustomer, perItem, perMonth, totals, prevTotals, cur, inv };
  }

  function metricVal(o, metric) { return metric === "qty" ? o.qty : metric === "count" ? o.count : o.revenue; }
  const metricName = (m) => (m === "qty" ? "Quantity sold" : m === "count" ? "Number of sales" : "Revenue (ETB)");
  const metricFmt = (m) => (m === "revenue" ? (v) => money(v) : (v) => String(Math.round(v * 100) / 100));

  function pctChange(cur, prev) {
    if (!prev) return cur > 0 ? { text: "new", up: true } : null;
    const p = ((cur - prev) / prev) * 100;
    return { text: (p >= 0 ? "+" : "") + p.toFixed(0) + "% vs previous period", up: p >= 0 };
  }

  /* ---------- HTML ---------- */
  function html(data, st) {
    const inv = data.inventory || [];
    // Quantity needs a single item (units differ between items)
    if (st.metric === "qty" && st.item === "all") {
      const tmp = compute(data, Object.assign({}, st, { metric: "revenue" }));
      const top = Object.values(tmp.perItem).sort((a, b) => b.revenue - a.revenue)[0];
      if (top && top.id) st = Object.assign({}, st, { item: top.id });
    }
    const D = compute(data, st);
    const itemObj = st.item !== "all" ? inv.find((x) => x.id === st.item) : null;
    const unit = itemObj ? itemObj.unit : "";
    const mF = metricFmt(st.metric);
    const sel = (id, opts, val) => '<select id="' + id + '">' + opts.map((o) => '<option value="' + esc(o[0]) + '"' + (o[0] === val ? " selected" : "") + ">" + esc(o[1]) + "</option>").join("") + "</select>";

    let h = '<div class="st-controls">';
    h += '<label>Period' + sel("st-range", [["7d", "Last 7 days"], ["30d", "Last 30 days"], ["month", "This month"], ["year", "This year"], ["all", "All time"]], st.range) + "</label>";
    h += '<label>Group by' + sel("st-group", [["day", "Day"], ["month", "Month"], ["year", "Year"]], st.group) + "</label>";
    h += '<label>Show' + sel("st-metric", [["revenue", "Revenue (ETB)"], ["count", "Number of sales"], ["qty", "Quantity sold (one item)"]], st.metric) + "</label>";
    h += '<label>Item' + sel("st-item", [["all", "All items"]].concat(inv.map((x) => [x.id, x.name])), st.item) + "</label>";
    h += "</div>";

    if (!D.cur.length) {
      return h + '<div class="st-card"><p class="st-empty">No sales recorded in this period yet. Record a sale, or choose "All time".</p></div>';
    }

    // KPI cards
    const avg = D.totals.count ? D.totals.revenue / D.totals.count : 0;
    const bestDayKey = Object.keys(D.perDay).sort((a, b) => D.perDay[b].revenue - D.perDay[a].revenue)[0];
    const chRev = st.range === "all" ? null : pctChange(D.totals.revenue, D.prevTotals.revenue);
    const chCnt = st.range === "all" ? null : pctChange(D.totals.count, D.prevTotals.count);
    const card = (label, value, sub, ch) => '<div class="st-kpi"><div class="st-kpi-l">' + esc(label) + '</div><div class="st-kpi-v">' + esc(value) + "</div>" + (ch ? '<div class="st-kpi-c ' + (ch.up ? "up" : "down") + '">' + (ch.up ? "▲ " : "▼ ") + esc(ch.text) + "</div>" : sub ? '<div class="st-kpi-s">' + esc(sub) + "</div>" : "") + "</div>";
    h += '<div class="st-kpis">';
    h += card("Revenue" + (itemObj ? " · " + itemObj.name : ""), money(D.totals.revenue) + " ETB", "", chRev);
    h += card("Sales made", String(D.totals.count), "", chCnt);
    h += card("Average sale", money(avg) + " ETB", "per sale");
    h += card("Best day", bestDayKey ? money(D.perDay[bestDayKey].revenue) + " ETB" : "-", bestDayKey ? longDay(bestDayKey) : "");
    h += "</div>";

    // trend
    const gName = { day: "Day", month: "Month", year: "Year" }[D.group];
    const trendData = D.keys.map((k) => {
      const v = metricVal(D.bucket[k], st.metric);
      return { label: labelFor(k, D.group), value: v, tip: labelFor(k, D.group) + " — " + money(D.bucket[k].revenue) + " ETB, " + D.bucket[k].count + " sale(s)" + (itemObj ? ", " + D.bucket[k].qty + " " + unit : "") };
    });
    h += '<div class="st-card"><h3>' + esc(metricName(st.metric)) + (unit && st.metric === "qty" ? " (" + esc(unit) + ")" : "") + " by " + gName + (itemObj ? " · " + esc(itemObj.name) : "") + '</h3><p class="st-hint">Gold bar = the best ' + gName.toLowerCase() + ". Hover or tap a bar for details.</p>" +
      barChart({ data: trendData, integer: st.metric !== "revenue", fmt: (v, short) => (st.metric === "revenue" && short ? compact(v) : mF(v)), aria: metricName(st.metric) + " by " + gName }) + "</div>";

    // top items + top customers
    const items = Object.values(D.perItem).sort((a, b) => b.revenue - a.revenue).slice(0, 7).map((o) => {
      const u = (inv.find((x) => x.id === o.id) || {}).unit || "";
      return { label: o.name, value: o.revenue, valueText: money(o.revenue), tip: o.name + " — " + money(o.revenue) + " ETB, " + o.qty + " " + u + " sold" };
    });
    const custs = Object.values(D.perCustomer).sort((a, b) => b.revenue - a.revenue).slice(0, 7).map((o) => ({ label: o.name, value: o.revenue, valueText: money(o.revenue), tip: o.name + " — " + money(o.revenue) + " ETB in " + o.count + " purchase(s)" }));
    h += '<div class="st-grid">';
    h += '<div class="st-card"><h3>Best-selling items</h3><p class="st-hint">By revenue (ETB)</p>' + (items.length ? hbarChart({ data: items, goldFirst: true, aria: "Best selling items" }) : '<p class="st-empty">No data</p>') + "</div>";
    h += '<div class="st-card"><h3>Top customers</h3><p class="st-hint">By amount bought (ETB)</p>' + (custs.length ? hbarChart({ data: custs, goldFirst: true, aria: "Top customers" }) : '<p class="st-empty">No named customers in this period</p>') + "</div>";
    h += "</div>";

    // weekdays + stock
    const wdMetric = st.metric === "qty" ? "qty" : st.metric;
    const wd = DOW_ORDER.map((i) => ({ label: DOW[i].slice(0, 3), value: metricVal(D.weekday[i], wdMetric), tip: DOW[i] + " — " + money(D.weekday[i].revenue) + " ETB, " + D.weekday[i].count + " sale(s)" }));
    const stock = inv.map((it) => {
      const th = num(it.lowStockThreshold), q = num(it.stockQty);
      const ratio = th > 0 ? q / (th * 4) : q > 0 ? 1 : 0;
      const color = q <= th ? C.red : q <= th * 2 ? C.amber : C.green;
      return { label: it.name, pct: Math.max(0, Math.min(1, ratio)), color, valueText: q + " " + (it.unit || ""), tip: it.name + ": " + q + " " + (it.unit || "") + " in stock (alert at " + th + ")", sort: th > 0 ? q / th : 99 };
    }).sort((a, b) => a.sort - b.sort).slice(0, 8);
    h += '<div class="st-grid">';
    h += '<div class="st-card"><h3>Best days of the week</h3><p class="st-hint">' + esc(metricName(wdMetric)) + "</p>" + barChart({ data: wd, height: 230, integer: wdMetric !== "revenue", fmt: (v, short) => (wdMetric === "revenue" && short ? compact(v) : metricFmt(wdMetric)(v)), aria: "Best days of the week" }) + "</div>";
    h += '<div class="st-card"><h3>Stock on hand</h3><p class="st-hint"><span class="st-dot" style="background:' + C.red + '"></span>at/below alert &nbsp;<span class="st-dot" style="background:' + C.amber + '"></span>getting low &nbsp;<span class="st-dot" style="background:' + C.green + '"></span>healthy</p>' + (stock.length ? hbarChart({ data: stock, aria: "Stock on hand" }) : '<p class="st-empty">No items</p>') + "</div>";
    h += "</div>";

    // insights
    const ins = [];
    if (bestDayKey) ins.push("<b>Best day:</b> " + longDay(bestDayKey) + " — " + money(D.perDay[bestDayKey].revenue) + " ETB from " + D.perDay[bestDayKey].count + " sale(s).");
    const bm = Object.keys(D.perMonth).sort((a, b) => D.perMonth[b] - D.perMonth[a])[0];
    if (bm) ins.push("<b>Best month (all time):</b> " + labelFor(bm, "month") + " — " + money(D.perMonth[bm]) + " ETB.");
    const ti = Object.values(D.perItem).sort((a, b) => b.revenue - a.revenue)[0];
    if (ti) ins.push("<b>Top item:</b> " + esc(ti.name) + " — " + money(ti.revenue) + " ETB (" + ti.qty + " " + esc((inv.find((x) => x.id === ti.id) || {}).unit || "") + " sold).");
    const tc = Object.values(D.perCustomer).sort((a, b) => b.revenue - a.revenue)[0];
    if (tc) ins.push("<b>Top customer:</b> " + esc(tc.name) + " — " + money(tc.revenue) + " ETB in " + tc.count + " purchase(s).");
    const bw = DOW_ORDER.slice().sort((a, b) => D.weekday[b].revenue - D.weekday[a].revenue)[0];
    if (D.weekday[bw].revenue > 0) ins.push("<b>Busiest weekday:</b> " + DOW[bw] + " — " + money(D.weekday[bw].revenue) + " ETB across " + D.weekday[bw].count + " sale(s).");
    ins.push("<b>Average per day:</b> " + money(D.totals.revenue / D.len) + " ETB over " + D.len + " day(s).");
    const sold = {}; Object.values(D.perItem).forEach((o) => { if (o.id) sold[o.id] = 1; });
    const idle = inv.filter((x) => !sold[x.id] && num(x.stockQty) > 0).map((x) => x.name);
    if (idle.length) ins.push("<b>Not sold in this period:</b> " + esc(idle.slice(0, 6).join(", ")) + (idle.length > 6 ? " and " + (idle.length - 6) + " more" : "") + ".");
    const low = inv.filter((x) => num(x.stockQty) <= num(x.lowStockThreshold)).map((x) => x.name);
    if (low.length) ins.push("<b>Restock soon:</b> " + esc(low.slice(0, 6).join(", ")) + ".");
    h += '<div class="st-card"><h3>Insights</h3><ul class="st-ins">' + ins.map((t) => "<li>" + t + "</li>").join("") + "</ul></div>";
    return h;
  }

  /* ---------- mount (events) ---------- */
  const state = { range: "30d", group: "day", metric: "revenue", item: "all" };
  let host = null, getData = null;

  function render() {
    if (!host) return;
    const d = getData();
    // keep item filter valid
    if (state.item !== "all" && !(d.inventory || []).some((x) => x.id === state.item)) state.item = "all";
    host.innerHTML = html(d, state);
    const bind = (id, key, after) => { const el = host.querySelector("#" + id); if (el) el.addEventListener("change", () => { state[key] = el.value; if (after) after(); render(); }); };
    bind("st-range", "range", () => { state.group = state.range === "year" || state.range === "all" ? "month" : "day"; });
    bind("st-group", "group");
    bind("st-metric", "metric");
    bind("st-item", "item");
  }

  const api = {
    html, compute, barChart, hbarChart, state,
    mount(el, fn) { host = el; getData = fn; render(); },
    refresh() { render(); }
  };
  root.EC_STATS = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;

})(typeof window !== "undefined" ? window : globalThis);
