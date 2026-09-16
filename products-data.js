/* =========================================================
   EAST CHEM PLC — product catalog
   Backed by Firestore (collection "products") once Firebase is
   configured; DEFAULT_PRODUCTS is the fallback/seed data used
   before that, and what "Reset to sample data" restores.
   ========================================================= */

const DEFAULT_PRODUCTS = [
  {
    id: "p001", category: "fertilizer", badge: "popular", image: "",
    name: { en:"NPS Fertilizer", am:"የNPS ማዳበሪያ", om:"Xaa'oo NPS", ti:"ድኹዒ NPS" },
    desc: {
      en:"Blended fertilizer supplying nitrogen, phosphorus and sulfur for planting-time application.",
      am:"በመትከያ ወቅት የሚውል ናይትሮጅን፣ ፎስፎረስና ሰልፈር ያካተተ ድብልቅ ማዳበሪያ።",
      om:"Xaa'oo makaa nitrojinii, foosforasii fi sulfarii kan yeroo dhaabuutti fayyadu.",
      ti:"ኣብ ግዜ ምትካል ዝውዕል ናይትሮጅን፣ ፎስፎረስን ሰልፈርን ዝሓዘ ዝተሓወሰ ድኹዒ።"
    },
    material: { en:"N-P-S compound blend", am:"የN-P-S ውህድ ድብልቅ", om:"Wal-makaa N-P-S", ti:"ውሁድ ሕዋስ N-P-S" },
    usage: {
      en:"Apply at planting, placed close to the seed row and lightly covered with soil. Follow the district agronomist's rate for your crop.",
      am:"በመትከያ ወቅት ከዘር ረድፍ አጠገብ በማድረግ በአፈር ቀለል ብሎ ይሸፍኑ። ለሰብልዎ የሚስማማውን መጠን ከወረዳው ግብርና ባለሙያ ጋር ያረጋግጡ።",
      om:"Yeroo facaasaa, sararaa sanyii cinatti kaawwadhaa, biyyeen suphaa haguugaa. Hamma sirrii ta'e ogeessa qonnaa aanaa keessaniin mirkaneeffadhaa.",
      ti:"ኣብ ግዜ ምትካል፣ ጥቓ መስመር ዘርኢ ብምግባር ብቐሊሉ ብዓፈር ሽፈኖ። ነቲ ዝሰማማዕ መጠን ምስ ክኢላ ሕርሻ ወረዳኻ ኣረጋግጽ።"
    },
    pack: { en:"25kg, 50kg", am:"25ኪግ፣ 50ኪግ", om:"25kg, 50kg", ti:"25ኪግ፣ 50ኪግ" }
  },
  {
    id: "p002", category: "fertilizer", badge: "popular", image: "",
    name: { en:"Urea (46% N)", am:"ዩሪያ (46% N)", om:"Uriyaa (46% N)", ti:"ዩርያ (46% N)" },
    desc: {
      en:"High-nitrogen top-dressing fertilizer for vigorous vegetative growth.",
      am:"ለጠንካራ ቅጠላዊ እድገት የሚያገለግል ከፍተኛ ናይትሮጅን ያለው የመጨመሪያ ማዳበሪያ።",
      om:"Xaa'oo nitrojinii ol'aanaa qabu, guddina biqiltuu jabaa jajjabeessuuf.",
      ti:"ንሓያል ቅጠላዊ ዕቤት ዘገልግል ልዑል ናይትሮጅን ዘለዎ ናይ ወሰኽ ድኹዒ።"
    },
    material: { en:"Urea 46% N", am:"ዩሪያ 46% N", om:"Uriyaa 46% N", ti:"ዩርያ 46% N" },
    usage: {
      en:"Side-dress 3–5 weeks after emergence, away from direct stem contact, then irrigate or apply before expected rain.",
      am:"ችግኙ ከበቀለ ከ3-5 ሳምንት በኋላ ከግንዱ በመራቅ ይረጩ፣ ከዚያም ውሃ ያጠጡ ወይም ዝናብ ከመምጣቱ በፊት ይጨምሩ።",
      om:"Biqilaa erga biqilee torban 3-5 booda, jirma irraa fageessuun kaawwadhaa, ergasii bishaan obaasaa ykn roobni osoo hin roobin dura kaa'aa.",
      ti:"ቡቊል ድሕሪ 3-5 ሰሙን ካብ ግንዲ ርሒቕካ ርስሓ፣ ብድሕሪኡ ማይ ኣስትዩ ወይ ቅድሚ ዝናብ ግበሮ።"
    },
    pack: { en:"25kg, 50kg", am:"25ኪግ፣ 50ኪግ", om:"25kg, 50kg", ti:"25ኪግ፣ 50ኪግ" }
  },
  {
    id: "p003", category: "fertilizer", badge: "none", image: "",
    name: { en:"DAP (Di-Ammonium Phosphate)", am:"ዲኤፒ (DAP)", om:"DAP (Dai-Ammoniyeem Foosfeet)", ti:"DAP (ዳይ-ኣሞንየም ፎስፌት)" },
    desc: {
      en:"Phosphorus-rich starter fertilizer that supports strong early root development.",
      am:"ጠንካራ የመጀመሪያ ደረጃ ስር እድገትን የሚደግፍ በፎስፎረስ የበለጸገ ማዳበሪያ።",
      om:"Xaa'oo foosforasiin badhaadhe, guddina hidda jalqabaa jabaa deeggaru.",
      ti:"ብፎስፎረስ ዝማዕበለ ናይ መጀመርታ ጽኑዕ ስሚ ስሩ ዘተባብዕ ድኹዒ።"
    },
    material: { en:"18-46-0 (N-P-K)", am:"18-46-0 (N-P-K)", om:"18-46-0 (N-P-K)", ti:"18-46-0 (N-P-K)" },
    usage: {
      en:"Band-place at planting, 5cm below and to the side of the seed to avoid root burn.",
      am:"ስርን ላለማቃጠል ከዘሩ 5 ሴ.ሜ ራቅ ብሎና ወደ ታች በማድረግ በመትከያ ወቅት ይጠቀሙ።",
      om:"Hidda gubuu dhiisuuf, yeroo facaasaa sanyii jalaa fi cinaa 5cm irraa fageessuun kaawwadhaa.",
      ti:"ስሩ ንኸይነድድ፣ ካብ ዘርኢ 5 ሴ.ሜ ንታሕቲን ንጎድንን ብምግባር ኣብ ግዜ ምትካል ግበሮ።"
    },
    pack: { en:"25kg, 50kg", am:"25ኪግ፣ 50ኪግ", om:"25kg, 50kg", ti:"25ኪግ፣ 50ኪግ" }
  },
  {
    id: "p004", category: "herbicide", badge: "popular", image: "",
    name: { en:"2,4-D Amine 720SL", am:"2,4-ዲ አሚን 720SL", om:"2,4-D Aamiin 720SL", ti:"2,4-ዲ ኣሚን 720SL" },
    desc: {
      en:"Selective post-emergence herbicide for broadleaf weed control in cereal crops.",
      am:"በእህል ሰብሎች ላይ ሰፊ ቅጠል ያላቸውን አረሞች ለመቆጣጠር የሚያገለግል መራጭ ኬሚካል።",
      om:"Marga baala balʼaa midhaan qamadii keessatti to'achuuf kan filatamee itti fayyadamu.",
      ti:"ኣብ ኣእካል ዝርከቡ ሰፋሕቲ ቆጵላ ዘለዎም ኣረም ንምቁጽጻር ዘገልግል መሪጺ ኬሚካል።"
    },
    material: { en:"2,4-D Dimethylamine salt 720g/L", am:"2,4-ዲ ዳይሜቲልአሚን ጨው 720ግ/ሊ", om:"2,4-D Daayimetiilaamiin 720g/L", ti:"2,4-ዲ ዳይመቲልኣሚን ጨው 720ግ/ሊ" },
    usage: {
      en:"Spray 3–5 weeks after crop emergence when weeds are small and actively growing. Avoid drift onto broadleaf crops nearby.",
      am:"አረሞቹ ትንንሽና ንቁ ሆነው ባሉበት፣ ችግኙ ከበቀለ ከ3-5 ሳምንት በኋላ ይረጩ። ወደ አጠገብ ወዳሉ ሰፊ ቅጠል ሰብሎች እንዳይተን ይጠንቀቁ።",
      om:"Marga xixiqqaa fi guddachaa jiru irratti, biqilaa erga biqilee torban 3-5 booda facaasaa. Gara midhaan baala balʼaa ollaa jiruutti akka hin bittinoofne of eeggannoo godhaa.",
      ti:"ኣረም ንእሽቶን ንጡፍ ኮይኑ ኣብ ዘሎሉ፣ ቡቊል ድሕሪ 3-5 ሰሙን ንስኦ። ናብ ጥቓኡ ዘለዉ ሰፋሕቲ ቆጵላ ኣዝርእቲ ከይበጽሕ ተጠንቀቕ።"
    },
    pack: { en:"1L, 5L, 20L", am:"1ሊ፣ 5ሊ፣ 20ሊ", om:"1L, 5L, 20L", ti:"1ሊ፣ 5ሊ፣ 20ሊ" }
  },
  {
    id: "p005", category: "herbicide", badge: "none", image: "",
    name: { en:"Glyphosate 41% SL", am:"ግላይፎሴት 41% SL", om:"Glaayfoseet 41% SL", ti:"ግላይፎሴት 41% SL" },
    desc: {
      en:"Non-selective, systemic herbicide for pre-planting land preparation and fallow control.",
      am:"ከመትከል በፊት ለሚደረግ የመሬት ዝግጅትና ለክፍት መሬት አረም ቁጥጥር የሚያገለግል ሰፊ ኬሚካል።",
      om:"Marga hunda ajjeesu, qopheessa lafaa dura-dhaabbii fi lafa boollaa to'achuuf.",
      ti:"ንዝግጅት ምድሪ ቅድሚ ምትካልን ንክፉት ምድሪ ምቁጽጻር ኣረምን ዘገልግል ሰፊሕ ኬሚካል።"
    },
    material: { en:"Glyphosate (isopropylamine salt) 41%", am:"ግላይፎሴት (isopropylamine ጨው) 41%", om:"Glaayfoseet (isopropylamine) 41%", ti:"ግላይፎሴት (isopropylamine ጨው) 41%" },
    usage: {
      en:"Spray on actively growing weeds at least 2 weeks before planting. Keep off any crop you intend to keep.",
      am:"ከመትከል 2 ሳምንት በፊት በንቁ እድገት ላይ ባሉ አረሞች ላይ ይረጩ። መቆየት በሚፈልጉት ሰብል ላይ እንዳይደርስ ይጠንቀቁ።",
      om:"Yeroo dhaabbii dura torban 2 dursanii marga guddachaa jiru irratti facaasaa. Midhaan turfachuu barbaaddan irraa fageessaa.",
      ti:"ቅድሚ ምትካል ን2 ሰሙን ኣብ ንጡፍ ዕቤት ዘሎ ኣረም ንስኦ። ካብቲ ክትሕዞ እትደሊ ኣዝመራ ኣርሕቖ።"
    },
    pack: { en:"1L, 5L, 20L", am:"1ሊ፣ 5ሊ፣ 20ሊ", om:"1L, 5L, 20L", ti:"1ሊ፣ 5ሊ፣ 20ሊ" }
  },
  {
    id: "p006", category: "pesticide", badge: "popular", image: "",
    name: { en:"Malathion 50% EC", am:"ማላቲዮን 50% EC", om:"Maalaatiyoon 50% EC", ti:"ማላትዮን 50% EC" },
    desc: {
      en:"Broad-spectrum insecticide for aphids, thrips and stored-grain pests.",
      am:"ለቅማልና ትሪፕስ እንዲሁም ለተከማቸ እህል ተባዮች የሚያገለግል ሰፊ ፀረ-ተባይ።",
      om:"Ilbiisa akkoo, thrips fi ilbiisa midhaan kuufame irratti argamuuf kan itti fayyadamu.",
      ti:"ንቁማልን ትሪፕስን ከምኡውን ንዝተኸዘነ እክሊ ዝጎድእ ተመናት ዘገልግል ሰፊሕ ፀረ-ተመን።"
    },
    material: { en:"Malathion 50%", am:"ማላቲዮን 50%", om:"Maalaatiyoon 50%", ti:"ማላትዮን 50%" },
    usage: {
      en:"Spray at first sign of infestation, covering both leaf surfaces. Observe the pre-harvest interval on the label.",
      am:"ተባይ የመታየት የመጀመሪያ ምልክት ላይ ሁለቱንም የቅጠል ገጽታ በሚሸፍን መልኩ ይረጩ። በምልክቱ ላይ ያለውን ከምርት በፊት ጊዜ ገደብ ያክብሩ።",
      om:"Mallattoo jalqabaa argameen facaasaa, lachuu baala haguuguun. Yeroo hafteen dura sassaabbii label irratti ibsame eeguu.",
      ti:"ናይ መጀመርታ ምልክት ተመን ምስ ተራእየ፣ ንክልቲኡገጽ ቆጵላ ብዝሽፍን መገዲ ንስኦ። ኣብ ሌብል ዘሎ ናይ ቅድሚ ምህርቲ ግዜ ኸበሮ።"
    },
    pack: { en:"1L, 5L", am:"1ሊ፣ 5ሊ", om:"1L, 5L", ti:"1ሊ፣ 5ሊ" }
  },
  {
    id: "p007", category: "pesticide", badge: "none", image: "",
    name: { en:"Diazinon 60% EC", am:"ዲያዚኖን 60% EC", om:"Diyaazinoon 60% EC", ti:"ድያዚኖን 60% EC" },
    desc: {
      en:"Soil and foliar insecticide effective against a wide range of chewing and sucking pests.",
      am:"ለተለያዩ የመንከስና የመምጠጥ ተባዮች ውጤታማ የሆነ በአፈርና በቅጠል የሚውል ፀረ-ተባይ።",
      om:"Ilbiisa hamma tokko cininnaa fi xuuxuu irratti bu'aa qabeessa ta'e, biyyee fi baala irratti fayyadu.",
      ti:"ንብዙሓት ዝነኽሱ ኮነ ዝመጹ ተመናት ዉጽኢታዊ ዝኾነ ኣብ ዓፈርን ቆጵላን ዝውዕል ፀረ-ተመን።"
    },
    material: { en:"Diazinon 60%", am:"ዲያዚኖን 60%", om:"Diyaazinoon 60%", ti:"ድያዚኖን 60%" },
    usage: {
      en:"Apply as directed for the target pest and crop; always use recommended protective equipment during mixing and spraying.",
      am:"ለታለመው ተባይና ሰብል በተጠቀሰው መጠን ይጠቀሙ፤ በሚደባለቁበትና በሚረጩበት ጊዜ የሚመከረውን መከላከያ ልብስ ይልበሱ።",
      om:"Ilbiisaa fi midhaan xiyyeeffatameef akka ibsametti fayyadamaa; yeroo makaa fi facaasaa uffata ittisaa gorfame uffadhaa.",
      ti:"ነቲ ዝተሓስበሉ ተመንን ኣዝመራን ከምቲ ዝተገልጸ ተጠቐም፤ ኣብ ግዜ ምሕዋስን ምንስናስን እቲ ዝምከር ናይ ምክልኻል ክዳን ልበስ።"
    },
    pack: { en:"1L, 5L", am:"1ሊ፣ 5ሊ", om:"1L, 5L", ti:"1ሊ፣ 5ሊ" }
  },
  {
    id: "p008", category: "fungicide", badge: "popular", image: "",
    name: { en:"Mancozeb 80% WP", am:"ማንኮዜብ 80% WP", om:"Maankozeeb 80% WP", ti:"ማንኮዜብ 80% WP" },
    desc: {
      en:"Protective, broad-spectrum fungicide for blight and leaf-spot diseases on vegetables and cereals.",
      am:"ለአትክልትና ለእህል ሰብሎች ብላይትና የቅጠል ነጠብጣብ በሽታዎችን ለመከላከል የሚያገለግል ሰፊ ፀረ-ፈንገስ።",
      om:"Dhukkuba biraayitii fi tuqaa baalaa ittisuuf, biqiltuu fi midhaan qamadii irratti kan fayyadu.",
      ti:"ንኣትክልትን ኣእካልን ናይ ብላይትን ናይ ቆጵላ ነጠብጣብን ሕማም ንምክልኻል ዘገልግል ሰፊሕ ፀረ-ፈንገስ።"
    },
    material: { en:"Mancozeb 80%", am:"ማንኮዜብ 80%", om:"Maankozeeb 80%", ti:"ማንኮዜብ 80%" },
    usage: {
      en:"Begin spraying preventively before disease appears, and repeat every 7–10 days during humid weather.",
      am:"በሽታው ከመታየቱ በፊት በመከላከል ደረጃ መርጨት ይጀምሩ፣ በእርጥበት ወቅት በየ7-10 ቀናት ይድገሙ።",
      om:"Dhukkubni utuu hin mul'atin dursanii facaasaa jalqabaa, yeroo jiidhinnaa guyyaa 7-10tti irra deebi'aa.",
      ti:"ሕማም ቅድሚ ምርኣዩ ኣብ ደረጃ ምክልኻል ምንስናስ ጀምር፣ ኣብ ግዜ ልሕልሕ ኩነታት ኣየር በብ7-10 መዓልቲ ደግሞ።"
    },
    pack: { en:"1kg, 5kg", am:"1ኪግ፣ 5ኪግ", om:"1kg, 5kg", ti:"1ኪግ፣ 5ኪግ" }
  },
  {
    id: "p009", category: "seed", badge: "none", image: "",
    name: { en:"Apron Star 42WS Seed Treatment", am:"አፕሮን ስታር 42WS የዘር ህክምና", om:"Wal'aansa Sanyii Apron Star 42WS", ti:"ናይ ዘርኢ ሕክምና Apron Star 42WS" },
    desc: {
      en:"Combined fungicide-insecticide seed dressing that protects germinating seed from soil-borne disease and early pests.",
      am:"በቀላ ስር ላይ ከሚከሰቱ በሽታዎችና ከመጀመሪያ ተባዮች ችግኙን የሚከላከል የተዋሃደ ፀረ-ፈንገስና ፀረ-ተባይ የዘር ልብስ።",
      om:"Uffata sanyii walitti qabame kan dhukkuba biyyee keessaa fi ilbiisa jalqabaa irraa biqiltuu ittisu.",
      ti:"ካብ ናይ ዓፈር ሕማምን ናይ መጀመርታ ተመናትን ንዝበቊል ዘርኢ ዝከላኸል ዝተዋሃሃደ ፀረ-ፈንገስን ፀረ-ተመንን ክዳን ዘርኢ።"
    },
    material: { en:"Metalaxyl-M + Fludioxonil + Thiamethoxam", am:"ሜታላክሲል-ኤም + ፍሉዲኦክሶኒል + ቲያሜቶክሳም", om:"Metaalaaksil-M + Fluudiyoksoniil + Tiyaametooksaam", ti:"ሜታላክሲል-ኤም + ፍሉድዮክሶኒል + ትያመቶክሳም" },
    usage: {
      en:"Mix with a small amount of water and coat seed evenly before sowing; allow to dry in shade before planting.",
      am:"ከጥቂት ውሃ ጋር በመቀላቀል ዘሩን በእኩል ልክ ከመዝራት በፊት ይለብሱ፤ ከመትከልዎ በፊት በጥላ ውስጥ ያድርቁ።",
      om:"Bishaan xiqqoo waliin makuun sanyii walqixa haguugaa osoo hin facaasin dura; osoo hin dhaabin dura gaaddisaan gogsaa.",
      ti:"ምስ ውሑድ ማይ ብምሕዋስ ዘርኢ ማዕረ ኺድና ቅድሚ ምዝራእካ ልበሶ፤ ቅድሚ ምትካልካ ኣብ ጽላል ኣንቅጾ።"
    },
    pack: { en:"100g, 500g", am:"100ግ፣ 500ግ", om:"100g, 500g", ti:"100ግ፣ 500ግ" }
  },
  {
    id: "p010", category: "fertilizer", badge: "none", image: "",
    name: { en:"NPK 15-15-15", am:"NPK 15-15-15", om:"NPK 15-15-15", ti:"NPK 15-15-15" },
    desc: {
      en:"Balanced all-purpose fertilizer suited to vegetables and mixed-crop plots.",
      am:"ለአትክልትና ለተቀላቀሉ ሰብሎች የሚስማማ ሚዛናዊ የበርካታ አገልግሎት ማዳበሪያ።",
      om:"Xaa'oo madaalaawaa hojii hedduuf ta'u, biqiltuu fi lafa midhaan makaaf mijataa.",
      ti:"ንኣትክልትን ዝተሓዋወሰ ኣዝመራን ዝሰማማዕ ሚዛናዊ ናይ ብዙሕ ዕላማ ድኹዒ።"
    },
    material: { en:"N-P-K 15-15-15", am:"N-P-K 15-15-15", om:"N-P-K 15-15-15", ti:"N-P-K 15-15-15" },
    usage: {
      en:"Work into soil before planting or side-dress during early growth; adjust rate to soil test results where available.",
      am:"ከመትከል በፊት ከአፈር ጋር ይቀላቅሉ ወይም በእድገት መጀመሪያ ላይ ይጨምሩ፤ ካለ የአፈር ምርመራ ውጤት ጋር መጠኑን ያስተካክሉ።",
      om:"Osoo hin dhaabin dura biyyee waliin makaa ykn guddina jalqabaatti dabalaa; yoo qormaanni biyyee jiraate hamma sana waliin walsimsiisaa.",
      ti:"ቅድሚ ምትካል ምስ ዓፈር ሓውሶ ወይ ኣብ መጀመርታ ዕቤት ወስኸሉ፤ እንተሎ ውጽኢት ናይ ምርመራ ዓፈር ምስቲ መጠን ኣወሃህዶ።"
    },
    pack: { en:"25kg, 50kg", am:"25ኪግ፣ 50ኪግ", om:"25kg, 50kg", ti:"25ኪግ፣ 50ኪግ" }
  }
];

async function fetchProducts(){
  if(!FIREBASE_READY) return DEFAULT_PRODUCTS;
  try{
    const snap = await db.collection("products").get();
    if(snap.empty) return DEFAULT_PRODUCTS;
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }catch(e){ console.error(e); return DEFAULT_PRODUCTS; }
}
async function writeProduct(p){
  if(!FIREBASE_READY) throw new Error("Firebase isn't configured yet — see README.");
  const { id, ...data } = p;
  await db.collection("products").doc(id).set(data);
}
async function removeProduct(id){
  if(!FIREBASE_READY) throw new Error("Firebase isn't configured yet — see README.");
  await db.collection("products").doc(id).delete();
}
async function resetProducts(){
  if(!FIREBASE_READY) throw new Error("Firebase isn't configured yet — see README.");
  const snap = await db.collection("products").get();
  const batch = db.batch();
  snap.docs.forEach(d => batch.delete(d.ref));
  DEFAULT_PRODUCTS.forEach(p => {
    const { id, ...data } = p;
    batch.set(db.collection("products").doc(id), data);
  });
  await batch.commit();
}
