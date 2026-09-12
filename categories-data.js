/* =========================================================
   EAST CHEM PLC — product categories
   Backed by Firestore (collection "categories") once Firebase
   is configured; DEFAULT_CATEGORIES is the fallback/seed data
   used before that, and what "Reset to sample data" restores.
   ========================================================= */

const DEFAULT_CATEGORIES = [
  {
    id: "fertilizer", color: "#7E9E3B",
    name: { en:"Fertilizers", am:"ማዳበሪያዎች", om:"Xaa'oo", ti:"ድኹዒ" },
    desc: {
      en:"NPK blends, urea and DAP for every soil and crop cycle.",
      am:"ለየሰብሉና ለየአፈሩ የሚስማሙ NPK፣ ዩሪያና DAP ማዳበሪያዎች።",
      om:"NPK, Uriyaa fi DAP gosa biyyee fi midhaan hundaaf ta'an.",
      ti:"NPK፣ ዩርያን DAPን ንነፍሲ ወከፍ ዓፈርን ኣዝርእትን ዝሰማማዕ።"
    }
  },
  {
    id: "herbicide", color: "#8B4A2B",
    name: { en:"Herbicides", am:"አረም ማጥፊያዎች", om:"Summii Farra Marga", ti:"ናይ ኣረም መከላኸሊ" },
    desc: {
      en:"Selective and broad-spectrum weed control.",
      am:"መራጭና ሰፊ አገልግሎት ያላቸው አረም መቆጣጠሪያዎች።",
      om:"Marga baala balʼaa midhaan qamadii keessatti to'achuuf kan filatamee itti fayyadamu.",
      ti:"መሪጽካ ትጥቀመሉ ወይ ሰፊሕ ኣገልግሎት ዘለዎ ናይ ኣረም ቁጽጽር።"
    }
  },
  {
    id: "pesticide", color: "#7A5AA8",
    name: { en:"Pesticides", am:"ፀረ-ተባይ መድሃኒቶች", om:"Summii Farra Ilbiisaa", ti:"ፀረ-ተመን መድሃኒት" },
    desc: {
      en:"Insect and pest control for field and store.",
      am:"በእርሻና በመጋዘን ውስጥ ለሚከሰቱ ተባዮች መከላከያ።",
      om:"Ittisa ilbiisota lafa qonnaa fi mankuusaa keessaa.",
      ti:"ኣብ ግራትን መኽዘንን ንዝርከቡ ተመናት መከላኸሊ።"
    }
  },
  {
    id: "fungicide", color: "#C99A2E",
    name: { en:"Fungicides", am:"ፀረ-ፈንገስ", om:"Summii Farra Fangasii", ti:"ፀረ-ፈንገስ" },
    desc: {
      en:"Disease protection for grain, root and vegetable crops.",
      am:"ለእህል፣ ለስራ-ሥርና ለአትክልት ሰብሎች የበሽታ መከላከያ።",
      om:"Ittisa dhukkuba midhaan, hidda fi biqiltuu muraasaaf.",
      ti:"ንእክልን ሱሩን ኣትክልትን ሕማም መከላኸሊ።"
    }
  },
  {
    id: "seed", color: "#1E7A3E",
    name: { en:"Seed treatments", am:"የዘር ህክምናዎች", om:"Wal'aansa Sanyii", ti:"ናይ ዘርኢ ሕክምና" },
    desc: {
      en:"Fungicide-insecticide seed dressings that protect germination.",
      am:"ማብቀልን የሚከላከሉ ፀረ-ፈንገስና ፀረ-ተባይ የዘር ልብሶች።",
      om:"Uffata sanyii kan biqiltuu ittisu, fangasii fi ilbiisa irraa.",
      ti:"ንብቊል ዝከላኸል ፀረ-ፈንገስን ፀረ-ተመንን ክዳን ዘርኢ።"
    }
  }
];

async function fetchCategories(){
  if(!FIREBASE_READY) return DEFAULT_CATEGORIES;
  try{
    const snap = await db.collection("categories").get();
    if(snap.empty) return DEFAULT_CATEGORIES;
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }catch(e){ console.error(e); return DEFAULT_CATEGORIES; }
}
async function writeCategory(cat){
  if(!FIREBASE_READY) throw new Error("Firebase isn't configured yet — see README.");
  const { id, ...data } = cat;
  await db.collection("categories").doc(id).set(data);
}
async function removeCategory(id){
  if(!FIREBASE_READY) throw new Error("Firebase isn't configured yet — see README.");
  await db.collection("categories").doc(id).delete();
}
async function resetCategories(){
  if(!FIREBASE_READY) throw new Error("Firebase isn't configured yet — see README.");
  const snap = await db.collection("categories").get();
  const batch = db.batch();
  snap.docs.forEach(d => batch.delete(d.ref));
  DEFAULT_CATEGORIES.forEach(c => {
    const { id, ...data } = c;
    batch.set(db.collection("categories").doc(id), data);
  });
  await batch.commit();
}

/* ---------- sync helpers that read from main.js's in-memory cache ---------- */
function getCategory(id){
  const list = (typeof CATEGORIES_CACHE !== "undefined" && CATEGORIES_CACHE.length) ? CATEGORIES_CACHE : DEFAULT_CATEGORIES;
  return list.find(c => c.id === id) || { id, color:"#999", name:{en:id,am:id,om:id,ti:id}, desc:{en:"",am:"",om:"",ti:""} };
}
function catField(cat, field, lang){
  if(!cat[field]) return "";
  return cat[field][lang] || cat[field].en || "";
}
