/* =========================================================
   EAST CHEM PLC — editable site content (hero, stats, contact, about)
   Stored in Firestore doc settings/content. Admin edits these from
   the owner panel; DEFAULT_CONTENT below is the fallback/seed used
   before Firebase is configured, or if a field was never set.
   ========================================================= */

const DEFAULT_CONTENT = {
  hero: {
    eyebrow: { en:"Ethiopian-owned, farm-tested", am:"በኢትዮጵያ ባለቤትነት የተያዘ፣ በእርሻ የተፈተነ", om:"Kan Itoophiyaanotaan qabame, qonnaa irratti qorame", ti:"ብኢትዮጵያውያን ዝውነን፣ ኣብ ሕርሻ ዝተፈተነ" },
    title: { en:"Grown from the soil up.", am:"ከመሬት ተነስቶ የሚያድግ።", om:"Biyyee jalaa ka'ee guddate.", ti:"ካብ መሬት ዝጅምር ዕቤት።" },
    subtitle: { en:"East Chem PLC supplies fertilizers, crop-protection chemicals and seed treatments to farmers and distributors across Ethiopia — with clear guidance on what to use, and how.", am:"ኢስት ኬም ኃ.የተ.ግ.ማ ማዳበሪያዎችን፣ የሰብል መከላከያ ኬሚካሎችንና የዘር ህክምና ግብዓቶችን ለገበሬዎችና አከፋፋዮች በመላው ኢትዮጵያ ያቀርባል — አጠቃቀማቸውን በግልጽ በማስረዳት።", om:"Ist Keem PLC xaa'oo, kemikaala ittisa midhaanii fi wal'aansa sanyii qonnaan bultootaa fi dhiyeessitootaaf Itoophiyaa maratti ni dhiyeessa — akkasumas itti fayyadama isaanii ifatti ni ibsa.", ti:"ኢስት ኬም ኃ.የተ.ግ.ማ ድኹዕ፣ ናይ ኣዝርእቲ መከላኸሊ ኬሚካላትን ናይ ዘርኢ ሕክምናን ንሓረስቶትን ኣከፋፈልትን ኣብ መላእ ኢትዮጵያ የቕርብ — ብንጹር መምርሒ ኣጠቓቕማ ሓቢሩ።" }
  },
  stats: [
    { number: "12+", label: { en:"years in the field", am:"ዓመታት በዘርፉ", om:"waggoota dalagaa keessatti", ti:"ዓመታት ኣብ ዘርፉ" } },
    { number: "40+", label: { en:"districts supplied", am:"የተደረሰባቸው ወረዳዎች", om:"aanaawwan tajaajilaman", ti:"ዝተሓገዛ ወረዳታት" } },
    { number: "6,000+", label: { en:"farmers reached", am:"የደረሱ ገበሬዎች", om:"qonnaan bultoota ga'aman", ti:"ዝበጽሑ ሓረስቶት" } }
  ],
  contact: {
    phone: "+251 9xx xxx xxx",
    email: "info@eastchem.example",
    address: { en:"Add your office address here", am:"የቢሮዎን አድራሻ እዚህ ያክሉ", om:"Teessoo waajjira keessanii asitti dabalaa", ti:"ኣድራሻ ቤት ጽሕፈትካ ኣብዚ ወስኽ" },
    hours: { en:"Monday – Saturday, 8:00 – 17:00", am:"ሰኞ – ቅዳሜ፣ 8:00 – 17:00", om:"Wiixata – Sanbata, 8:00 – 17:00", ti:"ሶኑይ – ቀዳም፣ 8:00 – 17:00" }
  },
  about: {
    lede: { en:"We started East Chem to close the gap between what's on the agro-shop shelf and what farmers actually know how to do with it.", am:"ኢስት ኬምን የጀመርነው በግብርና መደብር መደርደሪያ ላይ ባለው ምርትና ገበሬዎች እንዴት እንደሚጠቀሙበት በሚያውቁት መካከል ያለውን ክፍተት ለመሙላት ነው።", om:"Ist Keem kan jalqabne bakka oomishni tuggee irratti argamuu fi qonnaan bultoonni akkamitti itti fayyadamuu akka danda'an gidduu jiru duwwaa cufuudhaaf.", ti:"ኢስት ኬም ዝጀመርናዮ ኣብ መደብር ሕርሻ ዘሎ ፍርያትን ሓረስቶት ብኸመይ ከምዝጥቀሙሉ ዝፈልጡዎን ኣብ መንጎ ዘሎ ክፍተት ንምዕጻው እዩ።" },
    missionTitle: { en:"Our mission", am:"ተልእኳችን", om:"Ergama Keenya", ti:"ተልእኾና" },
    missionText: { en:"Supply genuine, well-matched agricultural inputs — and make sure the person buying them understands exactly how to use them safely and effectively.", am:"ትክክለኛና ተስማሚ የግብርና ግብዓቶችን ማቅረብ — እና ገዢው በደህንነትና በትክክል እንዴት እንደሚጠቀምበት በእርግጠኝነት እንዲረዳ ማድረግ።", om:"Galtee qonnaa dhugaa fi sirrii ta'e dhiyeessuu — bituttoonnis akkaataa nagaa fi bu'a qabeessa ta'een itti fayyadamuu akka hubatan mirkaneessuu.", ti:"ሓቀኛን ዝሰማማዕን ናይ ሕርሻ ግብኣት ምቕራብ — እቲ ገዛኢ ብድሕንነትን ብትኽክልን ብኸመይ ከምዝጥቀመሉ ርግጸኛ ምዃን።" },
    storyHeading: { en:"How we got here", am:"እዚህ እንዴት እንደደረስን", om:"Akkamitti asiin geenye", ti:"ናብዚ ብኸመይ በጻሕና" },
    timeline: [
      { year: { en:"Founded", am:"የተመሰረተበት", om:"Hundeeffame", ti:"ዝተመስረተሉ" }, text: { en:"East Chem PLC registered to serve agro-dealers and cooperatives with fertilizer and crop-protection supply.", am:"ኢስት ኬም ኃ.የተ.ግ.ማ ለግብርና ነጋዴዎችና ህብረት ስራ ማህበራት ማዳበሪያና የሰብል መከላከያ ግብዓት ለማቅረብ ተመዘገበ።", om:"Ist Keem PLC daldaltoota qonnaa fi waldaalee hojii gamtaa xaa'oo fi kemikaala ittisa midhaaniin tajaajiluuf galmaa'e.", ti:"ኢስት ኬም ኃ.የተ.ግ.ማ ንነጋዶ ሕርሻን ማሕበራት ሽርክነትን ድኹዕን መከላኸሊ ኣዝርእትን ንምቕራብ ተመዝጊቡ።" } },
      { year: { en:"Expanded reach", am:"ስርጭት መስፋፋት", om:"Bal'ina Raabsaa", ti:"ዝተስፍሐ ዕደላ" }, text: { en:"Grew distribution beyond regional capitals into woreda-level agro-dealers.", am:"ስርጭታችንን ከክልል ዋና ከተሞች አልፎ እስከ ወረዳ ደረጃ አድርሰናል።", om:"Raabsa keenya magaalota bulchiinsa naannootii darbee hanga aanaatti balʼifne.", ti:"ዕደላና ካብ ርእሰ ከተማታት ዞባ ሓሊፉ ክሳብ ደረጃ ወረዳ ኣስፊሕናዮ።" } },
      { year: { en:"Added guidance", am:"መመሪያ መጨመር", om:"Qajeelfama Dabaluu", ti:"መምርሒ ምውሳኽ" }, text: { en:"Began pairing every product line with plain-language usage and safety instructions.", am:"እያንዳንዱን ምርት በቀላል ቋንቋ ከተጻፈ የአጠቃቀምና የደህንነት መመሪያ ጋር ማቅረብ ጀመርን።", om:"Sanyii oomisha hundaa qajeelfama itti fayyadamaa fi nageenyaa afaan salphaan barreeffame waliin dhiyeessuu jalqabne.", ti:"ንነፍሲ ወከፍ ፍርያት ብቐሊል ቋንቋ ዝተጻሕፈ ናይ ኣጠቓቕማን ድሕንነትን መምርሒ ሰሪዕና ክንህብ ጀሚርና።" } },
      { year: { en:"Today", am:"አሁን", om:"Har'a", ti:"ሎሚ" }, text: { en:"Serving farmers and distributors with a growing product catalog and multilingual support.", am:"ገበሬዎችንና አከፋፋዮችን በማደግ ላይ ባለ ምርትና በብዙ ቋንቋ ድጋፍ እያገለገልን ነው።", om:"Qonnaan bultootaa fi dhiyeessitoota kataalogii oomishaa guddataa fi deeggarsa afaan hedduun tajaajilaa jirra.", ti:"ንሓረስቶትን ኣከፋፈልትን ብዛማዲ ዝዓቢ ካታሎግ ፍርያትን ብዙሕ-ቋንቋ ደገፍን የገልግል ኣሎ።" } }
    ],
    valuesHeading: { en:"What guides us", am:"የሚመሩን እሴቶች", om:"Wanti nu qajeelchu", ti:"ዝመርሑና ዕላማታት" },
    values: [
      { title: { en:"Safety first", am:"ደህንነት መጀመሪያ", om:"Nageenya Duraan Dursa", ti:"ድሕንነት ቀዳምነት" }, text: { en:"Correct dosage protects both the harvest and the person applying it.", am:"ትክክለኛ መጠን ምርትንም ተጠቃሚንም ይጠብቃል።", om:"Hammaan sirrii ta'e oomisha isaa fi nama itti fayyadamu eega.", ti:"ትኽክለኛ መጠን ንፍርያትን ንተጠቃማይን ይከላኸል።" } },
      { title: { en:"Straight talk", am:"ቀጥተኛ ንግግር", om:"Haasaa Qajeelaa", ti:"ቀጥታዊ ዘተ" }, text: { en:"We explain trade-offs plainly, in the language you're comfortable in.", am:"ግልጽ ልዩነቶችን በሚመችዎት ቋንቋ እናስረዳለን።", om:"Filannoowwan ifatti, afaan isin itti mijataniin ibsina.", ti:"ፍልልያት ብንጹር፣ ብእትፈትዎ ቋንቋ ንገልጽ።" } },
      { title: { en:"Reliability", am:"አስተማማኝነት", om:"Amanamummaa", ti:"ኣስተማማንነት" }, text: { en:"Stock that's there when planting season needs it to be.", am:"የመዝሪያ ወቅት ሲደርስ ያለ ክምችት።", om:"Kuusaan yeroo facaasaa isin barbaachisu jira.", ti:"ወቕቲ ዘርኢ ኣብ ዘድልየሉ እዋን ዝርከብ ክምችት።" } }
    ]
  }
};

/* ---------- Firestore-backed read/write (falls back to DEFAULT_CONTENT) ---------- */
async function fetchContent(){
  if(!FIREBASE_READY) return DEFAULT_CONTENT;
  try{
    const doc = await db.collection("settings").doc("content").get();
    if(!doc.exists) return DEFAULT_CONTENT;
    const data = doc.data();
    // shallow-merge so any field the owner hasn't saved yet still has a default
    return {
      hero: { ...DEFAULT_CONTENT.hero, ...(data.hero||{}) },
      stats: data.stats || DEFAULT_CONTENT.stats,
      contact: { ...DEFAULT_CONTENT.contact, ...(data.contact||{}) },
      about: { ...DEFAULT_CONTENT.about, ...(data.about||{}) }
    };
  }catch(e){ console.error(e); return DEFAULT_CONTENT; }
}
async function writeContent(section, value){
  if(!FIREBASE_READY) throw new Error("Firebase isn't configured yet — see README.");
  await db.collection("settings").doc("content").set({ [section]: value }, { merge: true });
}

