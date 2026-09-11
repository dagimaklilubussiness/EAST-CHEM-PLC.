/* =========================================================
   EAST CHEM PLC — social links & farmer stories
   Exported/replaced from the admin panel the same way as
   products-data.js and categories-data.js.
   ========================================================= */

const SOCIAL_PLATFORMS = ["telegram","email","facebook","tiktok","instagram"];

const DEFAULT_SOCIAL_LINKS = {
  telegram: "", email: "", facebook: "", tiktok: "", instagram: ""
};

function getSocialLinks(){
  let stored = {};
  try{ stored = JSON.parse(localStorage.getItem("ec_social_v1") || "{}"); }catch(e){ stored = {}; }
  const out = {};
  SOCIAL_PLATFORMS.forEach(p => out[p] = (stored[p] !== undefined ? stored[p] : DEFAULT_SOCIAL_LINKS[p]) || "");
  return out;
}

/* ---------- farmer stories / testimonials ---------- */
const DEFAULT_TESTIMONIALS = [];

function getAllTestimonials(){
  let stored = [];
  try{ stored = JSON.parse(localStorage.getItem("ec_testimonials_v1") || "[]"); }catch(e){ stored = []; }
  const map = new Map();
  DEFAULT_TESTIMONIALS.forEach(x => map.set(x.id, x));
  stored.forEach(x => map.set(x.id, x));
  return Array.from(map.values()).filter(x => !x._deleted);
}
