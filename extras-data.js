/* =========================================================
   EAST CHEM PLC — social links & farmer stories
   Backed by Firestore (doc settings/social, collection
   "testimonials") once Firebase is configured.
   ========================================================= */

const SOCIAL_PLATFORMS = ["telegram","email","facebook","tiktok","instagram"];

const DEFAULT_SOCIAL_LINKS = {
  telegram: "", email: "", facebook: "", tiktok: "", instagram: ""
};

async function fetchSocialLinks(){
  if(!FIREBASE_READY) return DEFAULT_SOCIAL_LINKS;
  try{
    const doc = await db.collection("settings").doc("social").get();
    if(!doc.exists) return DEFAULT_SOCIAL_LINKS;
    const data = doc.data();
    const out = {};
    SOCIAL_PLATFORMS.forEach(p => out[p] = data[p] || "");
    return out;
  }catch(e){ console.error(e); return DEFAULT_SOCIAL_LINKS; }
}
async function writeSocialLinks(links){
  if(!FIREBASE_READY) throw new Error("Firebase isn't configured yet — see README.");
  await db.collection("settings").doc("social").set(links);
}

/* ---------- farmer stories / testimonials ---------- */
const DEFAULT_TESTIMONIALS = [];

async function fetchTestimonials(){
  if(!FIREBASE_READY) return DEFAULT_TESTIMONIALS;
  try{
    const snap = await db.collection("testimonials").get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }catch(e){ console.error(e); return DEFAULT_TESTIMONIALS; }
}
async function writeTestimonial(item){
  if(!FIREBASE_READY) throw new Error("Firebase isn't configured yet — see README.");
  let id = item.id;
  const { id: _drop, ...data } = item;
  if(!id) id = db.collection("testimonials").doc().id;
  await db.collection("testimonials").doc(id).set(data);
}
async function removeTestimonial(id){
  if(!FIREBASE_READY) throw new Error("Firebase isn't configured yet — see README.");
  await db.collection("testimonials").doc(id).delete();
}

/* ---------- media upload (Firebase Storage) — photo or video ---------- */
async function uploadTestimonialMedia(file){
  if(!FIREBASE_READY) throw new Error("Firebase isn't configured yet — see README.");
  const isVideo = file.type.startsWith("video/");
  const path = "testimonials/" + Date.now() + "_" + file.name.replace(/[^a-zA-Z0-9.]/g,"_");
  const ref = storage.ref().child(path);
  if(isVideo){
    await ref.put(file);
  } else {
    const blob = await resizeImageToBlob(file, 1000, 0.8);
    await ref.put(blob);
  }
  const url = await ref.getDownloadURL();
  return { url, mediaType: isVideo ? "video" : "photo" };
}
