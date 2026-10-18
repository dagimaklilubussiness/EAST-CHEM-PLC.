/* =========================================================
   EAST CHEM PLC — Sales invoice PDF (bilingual Amharic / English)
   Used by erp.js ("Download PDF" button in the Sales table).
   Needs jsPDF (loaded from cdnjs in erp.html), the font file
   NotoSansEthiopic-Invoice.ttf (a small subset of Noto Sans Ethiopic, SIL Open Font License) and logo.png in the same folder.

   >>> Fill in your company details in INVOICE_CONFIG below. <<<
   ========================================================= */
(function (root) {

  const INVOICE_CONFIG = {
    companyName: "EAST CHEM PLC",
    tagline: "Agro-chemicals & Fertilizers",
    address: "Bole Medhaniyalem, Next to Abyssinia Building, Impress Hotel 1st Floor, Office No. 104, Addis Ababa, Ethiopia",
    phone: "",            // e.g. "+251 911 000 000"
    email: "",            // e.g. "info@yourdomain.com"
    tin: "",              // Taxpayer Identification Number (TIN)
    vatRegNo: "",         // VAT registration number (if VAT-registered)
    vatRate: 0,           // 0 = no VAT shown. Use 0.15 for 15% VAT.
    pricesIncludeVat: true, // true: entered prices already include VAT; false: VAT is added on top
    footerNote: "Thank you for your business."
  };

  /* ---------- Ethiopian calendar ---------- */
  const ET_MONTHS = ["መስከረም","ጥቅምት","ኅዳር","ታኅሣሥ","ጥር","የካቲት","መጋቢት","ሚያዝያ","ግንቦት","ሰኔ","ሐምሌ","ነሐሴ","ጳጉሜ"];

  function gregorianToJDN(y, m, d) {
    const a = Math.floor((14 - m) / 12);
    const yy = y + 4800 - a, mm = m + 12 * a - 3;
    return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
  }
  function toEthiopian(y, m, d) {
    const jdn = gregorianToJDN(y, m, d);
    const r = (jdn - 1723856) % 1461;
    const n = (r % 365) + 365 * Math.floor(r / 1460);
    return {
      year: 4 * Math.floor((jdn - 1723856) / 1461) + Math.floor(r / 365) - Math.floor(r / 1460),
      month: Math.floor(n / 30) + 1,
      day: (n % 30) + 1
    };
  }

  /* ---------- amount in words (English) ---------- */
  const ONES = ["Zero","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const TENS = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  function below1000(n) {
    let s = "";
    if (n >= 100) { s += ONES[Math.floor(n / 100)] + " Hundred"; n %= 100; if (n) s += " "; }
    if (n >= 20) { s += TENS[Math.floor(n / 10)]; if (n % 10) s += "-" + ONES[n % 10]; }
    else if (n > 0 || s === "") { if (n > 0 || s === "") s += (n === 0 && s ? "" : ONES[n]); }
    return s;
  }
  function numToWords(n) {
    if (n === 0) return "Zero";
    const scales = ["", " Thousand", " Million", " Billion", " Trillion"];
    const parts = []; let i = 0;
    while (n > 0) { const chunk = n % 1000; if (chunk) parts.unshift(below1000(chunk) + scales[i]); n = Math.floor(n / 1000); i++; }
    return parts.join(" ");
  }
  function amountInWords(total) {
    let birr = Math.floor(total + 1e-9);
    let santim = Math.round((total - birr) * 100);
    if (santim === 100) { birr += 1; santim = 0; }
    let s = numToWords(birr) + " Birr";
    if (santim) s += " and " + numToWords(santim) + " Santim";
    return s + " only";
  }

  /* ---------- helpers ---------- */
  const fmt = (n) => (Number(n) || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const pad2 = (n) => String(n).padStart(2, "0");

  function invoiceNumber(sale) {
    const d = String(sale.date || "").replace(/-/g, "");
    const tail = String(sale.id || "").slice(-4).toUpperCase();
    return "INV-" + d + "-" + tail;
  }

  /* ---------- the PDF ---------- */
  function build(jsPDF, assets, sale, cfgOverride) {
    const cfg = Object.assign({}, INVOICE_CONFIG, cfgOverride || {});
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const PW = 210, PH = 297, M = 15, CW = PW - 2 * M;
    const GREEN = [30, 122, 62], DARK = [34, 34, 34], GREY = [110, 110, 110], LINE = [190, 200, 192], SOFT = [238, 245, 239];
    const hasAm = !!(assets && assets.fontB64);
    if (hasAm) {
      doc.addFileToVFS("NotoSansEthiopic-Invoice.ttf", assets.fontB64);
      doc.addFont("NotoSansEthiopic-Invoice.ttf", "NotoEth", "normal");
    }

    // Draw a run of mixed Amharic/English parts: [["am","ቀን"],["en"," / Date"]]
    function draw(parts, x, y, o) {
      o = o || {};
      const size = o.size || 9;
      // Break every part into runs: Ethiopic letters use the Amharic font, everything else (digits, dots, Latin) uses Helvetica
      const segs = [];
      parts.forEach(p => {
        if (p[0] === "am" && !hasAm) return;
        String(p[1]).split(/([\u1200-\u139F]+)/).forEach(run => {
          if (!run) return;
          segs.push([/[\u1200-\u139F]/.test(run) && hasAm ? "am" : "en", run]);
        });
      });
      const setF = (kind) => {
        if (kind === "am") doc.setFont("NotoEth", "normal");
        else doc.setFont("helvetica", o.bold ? "bold" : "normal");
        doc.setFontSize(size);
      };
      let total = 0;
      segs.forEach(p => { setF(p[0]); total += doc.getTextWidth(p[1]); });
      let cx = o.align === "right" ? x - total : o.align === "center" ? x - total / 2 : x;
      doc.setTextColor.apply(doc, o.color || DARK);
      segs.forEach(p => { setF(p[0]); doc.text(p[1], cx, y); cx += doc.getTextWidth(p[1]); });
      return total;
    }
    const L = (am, en) => [["am", am], ["en", " / " + en]];
    const T = (s) => [["en", String(s)]];

    /* ----- header ----- */
    let y = 14;
    let textX = M;
    if (assets && assets.logoDataUrl) {
      const lh = 20, lw = lh * 600 / 527;
      doc.addImage(assets.logoDataUrl, "PNG", M, y - 2, lw, lh);
      textX = M + lw + 4;
    }
    draw(T(cfg.companyName), textX, y + 4, { size: 15, bold: true, color: GREEN });
    draw(T(cfg.tagline), textX, y + 9.5, { size: 8.5, color: GREY });
    let cy = y + 14.5;
    const addrLines = doc.splitTextToSize(cfg.address || "", 82);
    doc.setFont("helvetica", "normal"); doc.setFontSize(8);
    addrLines.slice(0, 3).forEach(l => { draw(T(l), textX, cy, { size: 8, color: GREY }); cy += 3.8; });
    const contact = [cfg.phone && ("Tel: " + cfg.phone), cfg.email].filter(Boolean).join("   ");
    if (contact) { draw(T(contact), textX, cy, { size: 8, color: GREY }); cy += 3.8; }

    // right: title + meta
    draw([["am", "የሽያጭ ደረሰኝ"]], PW - M, y + 5, { size: 17, align: "right", color: GREEN });
    draw(T("SALES INVOICE"), PW - M, y + 11.5, { size: 11, bold: true, align: "right", color: DARK });

    const parts = String(sale.date || "").split("-").map(Number);
    let gc = "-", ecParts = null;
    if (parts.length === 3 && parts[0]) {
      gc = pad2(parts[2]) + "/" + pad2(parts[1]) + "/" + parts[0];
      const e = toEthiopian(parts[0], parts[1], parts[2]);
      ecParts = [["en", e.day + " "], ["am", ET_MONTHS[e.month - 1]], ["en", " " + e.year + " "], ["am", "ዓ.ም"]];
    }
    let my = y + 19;
    draw(L("ደረሰኝ ቁጥር", "Invoice No.").concat([["en", ":  " + invoiceNumber(sale)]]), PW - M, my, { size: 8.5, align: "right" }); my += 4.6;
    if (ecParts) { draw(L("ቀን", "Date (E.C.)").concat([["en", ":  "]]).concat(ecParts), PW - M, my, { size: 8.5, align: "right" }); my += 4.6; }
    draw(L("ቀን", "Date (G.C.)").concat([["en", ":  " + gc]]), PW - M, my, { size: 8.5, align: "right" }); my += 4.6;

    y = Math.max(cy, my) + 3;
    // seller tax ids
    const dots = "............................";
    draw(L("ግብር ከፋይ መለያ ቁጥር", "TIN").concat([["en", ":  " + (cfg.tin || dots)]]), M, y, { size: 8.5 });
    draw(L("ተ.እ.ታ ምዝገባ ቁጥር", "VAT Reg. No.").concat([["en", ":  " + (cfg.vatRegNo || dots)]]), PW - M, y, { size: 8.5, align: "right" });
    y += 3.5;
    doc.setDrawColor.apply(doc, GREEN); doc.setLineWidth(0.7); doc.line(M, y, PW - M, y);
    y += 6;

    /* ----- customer ----- */
    doc.setFillColor.apply(doc, SOFT); doc.setDrawColor.apply(doc, LINE); doc.setLineWidth(0.25);
    doc.roundedRect(M, y, CW, 20, 1.5, 1.5, "FD");
    draw(L("ደንበኛ", "Customer"), M + 4, y + 5.5, { size: 8.5, bold: true, color: GREEN });
    draw(L("ስም", "Name").concat([["en", ":  " + (sale.customerName || "-")]]), M + 4, y + 11, { size: 9 });
    draw(L("ስልክ", "Phone").concat([["en", ":  " + (sale.customerPhone || "-").replace(/[,\s]+$/, "")]]), M + 4, y + 16, { size: 9 });
    draw(L("የደንበኛ TIN", "Customer TIN").concat([["en", ":  " + (sale.customerTin || "-")]]), M + CW / 2 + 4, y + 11, { size: 9 });
    y += 26;

    /* ----- items table ----- */
    const cols = [
      { w: 10, al: "center", am: "ተ.ቁ", en: "No." },
      { w: 70, al: "left", am: "ዝርዝር", en: "Description" },
      { w: 18, al: "center", am: "መለኪያ", en: "Unit" },
      { w: 22, al: "right", am: "ብዛት", en: "Qty" },
      { w: 30, al: "right", am: "ነጠላ ዋጋ", en: "Unit Price" },
      { w: 30, al: "right", am: "ጠቅላላ", en: "Amount" }
    ];
    const colX = []; { let a = M; cols.forEach(c => { colX.push(a); a += c.w; }); }
    function cellX(i) { const c = cols[i]; return c.al === "left" ? colX[i] + 2 : c.al === "right" ? colX[i] + c.w - 2 : colX[i] + c.w / 2; }

    function tableHeader() {
      doc.setFillColor.apply(doc, GREEN); doc.rect(M, y, CW, 10, "F");
      cols.forEach((c, i) => {
        draw([["am", c.am]], cellX(i), y + 4, { size: 7.5, align: c.al, color: [255, 255, 255] });
        draw(T(c.en), cellX(i), y + 8, { size: 7.5, bold: true, align: c.al, color: [255, 255, 255] });
      });
      y += 10;
    }
    tableHeader();

    const items = sale.items || [];
    items.forEach((it, idx) => {
      const nameLines = doc.splitTextToSize(String(it.name || ""), cols[1].w - 4);
      doc.setFont("helvetica", "normal"); doc.setFontSize(9);
      const rowH = Math.max(8, 4.2 * nameLines.length + 3.6);
      if (y + rowH > PH - 62) { doc.addPage(); y = 18; tableHeader(); }
      if (idx % 2 === 1) { doc.setFillColor(247, 250, 247); doc.rect(M, y, CW, rowH, "F"); }
      const ty = y + 5.4;
      draw(T(idx + 1), cellX(0), ty, { size: 9, align: "center" });
      nameLines.forEach((l, k) => draw(T(l), cellX(1), ty + k * 4.2, { size: 9 }));
      draw(T(it.unit || "-"), cellX(2), ty, { size: 9, align: "center" });
      draw(T((Number(it.qty) || 0).toLocaleString("en-US", { maximumFractionDigits: 3 })), cellX(3), ty, { size: 9, align: "right" });
      draw(T(fmt(it.unitPrice)), cellX(4), ty, { size: 9, align: "right" });
      draw(T(fmt(it.lineTotal != null ? it.lineTotal : (it.qty * it.unitPrice))), cellX(5), ty, { size: 9, align: "right" });
      doc.setDrawColor.apply(doc, LINE); doc.setLineWidth(0.2); doc.line(M, y + rowH, PW - M, y + rowH);
      y += rowH;
    });
    doc.setDrawColor.apply(doc, GREEN); doc.setLineWidth(0.5); doc.line(M, y, PW - M, y);
    y += 7;

    /* ----- totals ----- */
    const total = Number(sale.total) || 0;
    let subtotal = total, vat = 0, grand = total;
    if (cfg.vatRate > 0) {
      if (cfg.pricesIncludeVat) { subtotal = total / (1 + cfg.vatRate); vat = total - subtotal; grand = total; }
      else { subtotal = total; vat = total * cfg.vatRate; grand = total + vat; }
    }
    const tx = PW - M - 78, tw = 78;
    function totalRow(am, en, val, bold) {
      draw(L(am, en), tx, y, { size: 9, bold });
      draw(T(val), PW - M, y, { size: 9, bold, align: "right" });
      y += 5.6;
    }
    if (cfg.vatRate > 0) {
      totalRow("ድምር", "Subtotal", fmt(subtotal));
      totalRow("ተ.እ.ታ " + Math.round(cfg.vatRate * 100) + "%", "VAT " + Math.round(cfg.vatRate * 100) + "%", fmt(vat));
    }
    doc.setFillColor.apply(doc, GREEN); doc.roundedRect(tx - 2, y - 4.6, tw + 4, 9, 1.2, 1.2, "F");
    draw(L("ጠቅላላ ድምር", "Grand Total (ETB)"), tx + 1, y + 1.2, { size: 9.5, bold: true, color: [255, 255, 255] });
    draw(T(fmt(grand)), PW - M - 1.5, y + 1.2, { size: 10.5, bold: true, align: "right", color: [255, 255, 255] });
    y += 12;

    // amount in words
    const words = amountInWords(grand);
    draw(L("በፊደል", "Amount in words").concat([["en", ":"]]), M, y, { size: 8.5, bold: true, color: GREEN });
    const wl = doc.splitTextToSize(words, CW);
    wl.forEach((l, k) => draw(T(l), M, y + 5 + k * 4.4, { size: 9.5 }));
    y += 5 + wl.length * 4.4 + 3;

    if (sale.notes) {
      draw(L("ማስታወሻ", "Notes").concat([["en", ":"]]), M, y, { size: 8.5, bold: true, color: GREEN });
      const nl = doc.splitTextToSize(String(sale.notes), CW);
      nl.slice(0, 3).forEach((l, k) => draw(T(l), M, y + 5 + k * 4.2, { size: 9 }));
      y += 5 + Math.min(3, nl.length) * 4.2 + 3;
    }

    /* ----- signatures ----- */
    let sy = Math.max(y + 14, PH - 50);
    if (sy > PH - 28) { doc.addPage(); sy = 40; }
    const boxW = (CW - 16) / 3;
    const sigs = [
      { am: "አዘጋጅ", en: "Prepared by", name: sale.recordedByName || "" },
      { am: "ያጸደቀ", en: "Approved by", name: "" },
      { am: "ተቀባይ", en: "Received by (Customer)", name: "" }
    ];
    sigs.forEach((s, i) => {
      const bx = M + i * (boxW + 8);
      doc.setDrawColor.apply(doc, DARK); doc.setLineWidth(0.3); doc.line(bx, sy, bx + boxW, sy);
      draw(L(s.am, s.en), bx + boxW / 2, sy + 4.5, { size: 8, align: "center", color: GREY });
      if (s.name) draw(T(s.name), bx + boxW / 2, sy - 2, { size: 8.5, align: "center" });
      draw(L("ፊርማ", "Signature / Date"), bx + boxW / 2, sy + 8.5, { size: 7, align: "center", color: GREY });
    });
    draw(L("ማህተም", "Stamp"), PW - M, sy - 15, { size: 8, align: "right", color: GREY });
    doc.setDrawColor.apply(doc, LINE); doc.setLineDashPattern([1.2, 1.2], 0);
    doc.circle(PW - M - 14, sy - 31, 10); doc.setLineDashPattern([], 0);

    /* ----- footer on every page ----- */
    const pages = doc.getNumberOfPages();
    for (let p = 1; p <= pages; p++) {
      doc.setPage(p);
      doc.setDrawColor.apply(doc, LINE); doc.setLineWidth(0.25); doc.line(M, PH - 14, PW - M, PH - 14);
      draw([["am", "ስለ ትብብርዎ እናመሰግናለን"], ["en", "  /  " + (cfg.footerNote || "")]], M, PH - 9.5, { size: 8, color: GREY });
      draw(T("Page " + p + " of " + pages), PW - M, PH - 9.5, { size: 8, align: "right", color: GREY });
    }
    return doc;
  }

  /* ---------- browser download ---------- */
  let assetCache = null;
  async function loadAssets() {
    if (assetCache) return assetCache;
    const a = {};
    try {
      const buf = await (await fetch("NotoSansEthiopic-Invoice.ttf")).arrayBuffer();
      const bytes = new Uint8Array(buf); let bin = "";
      for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
      a.fontB64 = btoa(bin);
    } catch (e) { console.warn("Amharic font not loaded", e); }
    try {
      const blob = await (await fetch("logo-invoice.png")).blob();
      a.logoDataUrl = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(blob); });
    } catch (e) { console.warn("Logo not loaded", e); }
    assetCache = a;
    return a;
  }

  async function download(sale) {
    const jsPDF = root.jspdf && root.jspdf.jsPDF;
    if (!jsPDF) throw new Error("PDF library could not be loaded. Check your internet connection and refresh the page.");
    const assets = await loadAssets();
    const doc = build(jsPDF, assets, sale);
    const who = String(sale.customerName || "").trim().replace(/[^\w\-]+/g, "_").slice(0, 24);
    doc.save(invoiceNumber(sale) + (who ? "-" + who : "") + ".pdf");
  }

  const api = { config: INVOICE_CONFIG, build, download, toEthiopian, amountInWords, invoiceNumber, ET_MONTHS };
  root.EC_INVOICE = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;

})(typeof window !== "undefined" ? window : globalThis);
