/* =========================================================
   EAST CHEM PLC — product categories
   Admin can add more from the owner panel; this file holds the
   defaults. Exported/replaced the same way as products-data.js.
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

function getAllCategories(){
  let stored = [];
  try{ stored = JSON.parse(localStorage.getItem("ec_categories_v1") || "[]"); }catch(e){ stored = []; }
  const map = new Map();
  DEFAULT_CATEGORIES.forEach(c => map.set(c.id, c));
  stored.forEach(c => map.set(c.id, c));
  return Array.from(map.values()).filter(c => !c._deleted);
}
function getCategory(id){
  return getAllCategories().find(c => c.id === id) || { id, color:"#999", name:{en:id,am:id,om:id,ti:id}, desc:{en:"",am:"",om:"",ti:""} };
}
function catField(cat, field, lang){
  if(!cat[field]) return "";
  return cat[field][lang] || cat[field].en || "";
}
