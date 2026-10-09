/**
 * Islamic historical places (ziyārah) around Makkah, Madinah and beyond.
 *
 * Every religious statement carries its source (Qur'an / hadith with sunnah.com numbering).
 * Where a site's link to an event is tradition rather than a hadith, the text says so.
 * Coordinates: Wikipedia / OpenStreetMap (checked 2026-10-09). Photos: Wikimedia Commons,
 * credited with author and licence. Fares: published tariffs, dated.
 */
import type { GText } from "./travel";

export type ZRegion = "makkah" | "madinah" | "other";
export type ZRef = { label: string; detail?: GText; url?: string };
export type ZImage = { src: string; page: string; author: string; license: string };

export type ZPlace = {
  id: string;
  region: ZRegion;
  /** For "other": the town it is in or near. */
  area?: GText;
  emoji: string;
  name: GText;
  arabic: string;
  lat: number;
  lon: number;
  /** One line for the card. */
  short: GText;
  /** History and why it matters. */
  about: GText;
  /** Authentic texts about the place or the event (Qur'an, hadith). */
  refs: ZRef[];
  /** Practical: what is there today, best time, etiquette. */
  visit: GText;
  /** Getting there beyond taxi (bus route, walking…). */
  transport?: GText;
  image?: ZImage;
  /** Further reading (encyclopaedic / official). */
  more: { label: string; url: string }[];
};

const W = (path: string) => `https://upload.wikimedia.org/wikipedia/commons/thumb/${path}`;

export const ZIYARAH_CHECKED = "2026-10-09";

/** General guidance shown on the page (applies to every place). */
export const ETIQUETTE: { text: GText; refs: ZRef[] }[] = [
  {
    text: {
      en: "Visiting these places is not a part of Umrah or Hajj and has no special rites. Travelling with the intention of worship is only for the three mosques; other places are visited to learn and remember.",
      bn: "এসব জায়গা দেখা উমরাহ বা হজের অংশ নয় এবং এর কোনো বিশেষ আমল নেই। ইবাদতের নিয়তে সফর শুধু তিন মসজিদের জন্য; অন্য জায়গাগুলো শেখা ও স্মরণের জন্য দেখা হয়।",
      ur: "ان مقامات کی زیارت عمرہ یا حج کا حصہ نہیں اور اس کا کوئی خاص عمل نہیں۔ عبادت کی نیت سے سفر صرف تین مساجد کے لیے ہے؛ باقی مقامات سیکھنے اور یاد کرنے کے لیے دیکھے جاتے ہیں۔",
    },
    refs: [{ label: "Sahih al-Bukhari 1189", detail: { en: "“Do not set out on a journey except for three mosques…”", bn: "“তিনটি মসজিদ ছাড়া (ইবাদতের উদ্দেশ্যে) সফর করো না…”" } }],
  },
  {
    text: {
      en: "Do not touch walls, rocks or graves for blessing, and do not pray towards graves. At cemeteries, greet the dead and make dua for them as the Prophet ﷺ taught.",
      bn: "বরকতের আশায় দেয়াল, পাথর বা কবর স্পর্শ করবেন না এবং কবরের দিকে নামাজ পড়বেন না। কবরস্থানে নবী ﷺ-এর শেখানো পদ্ধতিতে সালাম দিন ও দোয়া করুন।",
      ur: "برکت کے لیے دیواروں، پتھروں یا قبروں کو نہ چھوئیں اور قبروں کی طرف نماز نہ پڑھیں۔ قبرستان میں نبی ﷺ کے سکھائے طریقے سے سلام اور دعا کریں۔",
    },
    refs: [
      { label: "Sahih Muslim 972", detail: { en: "“Do not pray towards graves, nor sit on them.”", bn: "“কবরের দিকে নামাজ পড়ো না এবং কবরের ওপর বসো না।”" } },
      { label: "Sahih Muslim 974", detail: { en: "the greeting for the people of al-Baqi", bn: "বাকির অধিবাসীদের সালাম" } },
    ],
  },
];

/**
 * Coordinates were checked against OpenStreetMap on 2026-10-09 (the feature itself: cave entrance,
 * mosque or cemetery outline; Al-Balad → Naseef House; Badr → the martyrs' cemetery).
 * Mina is a whole valley; its point is the Wikipedia coordinate for the area.
 */
export const PLACES: ZPlace[] = [
  // ───────────────────────────── Makkah ─────────────────────────────
  {
    id: "hira",
    region: "makkah",
    emoji: "⛰️",
    name: { en: "Jabal al-Nour & the Cave of Hira", bn: "জাবালে নূর ও হেরা গুহা", ur: "جبلِ نور اور غارِ حرا" },
    arabic: "جبل النور · غار حراء",
    lat: 21.457371,
    lon: 39.859196,
    short: { en: "Where the first revelation came down", bn: "যেখানে প্রথম ওহি নাজিল হয়", ur: "جہاں پہلی وحی نازل ہوئی" },
    about: {
      en: "Before prophethood, the Prophet ﷺ would retreat to the Cave of Hira near the top of this mountain to worship for nights at a time. There the angel Jibril brought the first verses of the Qur'an: “Read in the name of your Lord who created” (al-‘Alaq 96:1–5).",
      bn: "নবুওয়াতের আগে নবী ﷺ এই পাহাড়ের চূড়ার কাছে হেরা গুহায় একাধিক রাত ইবাদতে কাটাতেন। সেখানেই জিবরাইল (আ.) কুরআনের প্রথম আয়াত নিয়ে আসেন: “পড়ো তোমার রবের নামে, যিনি সৃষ্টি করেছেন” (আল-আলাক ৯৬:১–৫)।",
    },
    refs: [
      { label: "Sahih al-Bukhari 3", detail: { en: "how the revelation began in the Cave of Hira", bn: "হেরা গুহায় ওহি শুরুর বিবরণ" } },
      { label: "Qur'an 96:1–5" },
    ],
    visit: {
      en: "The climb to the cave is steep: about 1–2 hours up on uneven steps (≈640 m high). Go after Fajr or in the evening, carry water and avoid midday heat. Climbing it is not an act of worship.",
      bn: "গুহা পর্যন্ত ওঠা খাড়া: অসমান সিঁড়িতে প্রায় ১–২ ঘণ্টা (উচ্চতা ≈৬৪০ মি)। ফজরের পর বা বিকেলে যান, পানি নিন, দুপুরের রোদ এড়ান। পাহাড়ে ওঠা কোনো ইবাদত নয়।",
    },
    transport: {
      en: "Taxi or ride-hailing to the foot of the mountain (Hira Cultural District).",
      bn: "ট্যাক্সি বা রাইড-অ্যাপে পাহাড়ের পাদদেশে (হেরা কালচারাল ডিস্ট্রিক্ট)।",
    },
    image: { src: W("5/57/Jabbal_An-Nour_%282024%29.jpg/960px-Jabbal_An-Nour_%282024%29.jpg"), page: "https://commons.wikimedia.org/wiki/File:Jabbal_An-Nour_(2024).jpg", author: "Kaliper1", license: "CC BY-SA 4.0" },
    more: [{ label: "Wikipedia: Jabal al-Nour", url: "https://en.wikipedia.org/wiki/Jabal_al-Nour" }],
  },
  {
    id: "thawr",
    region: "makkah",
    emoji: "🕳️",
    name: { en: "Jabal Thawr & the Cave of Thawr", bn: "জাবালে সাওর ও সাওর গুহা", ur: "جبلِ ثور اور غارِ ثور" },
    arabic: "جبل ثور · غار ثور",
    lat: 21.377119,
    lon: 39.849816,
    short: { en: "The Hijrah hiding place of the Prophet ﷺ and Abu Bakr", bn: "হিজরতের সময় নবী ﷺ ও আবু বকরের আশ্রয়", ur: "ہجرت میں نبی ﷺ اور ابو بکرؓ کی پناہ گاہ" },
    about: {
      en: "On the Hijrah to Madinah, the Prophet ﷺ and Abu Bakr hid for three nights in a cave on this mountain south of Makkah while the Quraysh searched for them. The Qur'an recalls it: “…when he said to his companion, ‘Do not grieve; Allah is with us.’”",
      bn: "মদিনায় হিজরতের সময় নবী ﷺ ও আবু বকর (রা.) মক্কার দক্ষিণের এই পাহাড়ের একটি গুহায় তিন রাত লুকিয়ে ছিলেন, যখন কুরাইশরা তাঁদের খুঁজছিল। কুরআন বলে: “…যখন তিনি তাঁর সঙ্গীকে বললেন, ‘চিন্তা করো না, নিশ্চয়ই আল্লাহ আমাদের সঙ্গে আছেন।’”",
    },
    refs: [
      { label: "Qur'an 9:40" },
      { label: "Sahih al-Bukhari 3653", detail: { en: "“What do you think of two whose third is Allah?”", bn: "“সেই দুজন সম্পর্কে তোমার কী ধারণা, যাদের তৃতীয়জন আল্লাহ?”" } },
    ],
    visit: {
      en: "Thawr is higher and harder than Hira (≈750 m): allow 2–3 hours up. Only for fit walkers, early morning, with water and good shoes.",
      bn: "সাওর হেরার চেয়ে উঁচু ও কঠিন (≈৭৫০ মি): উঠতে ২–৩ ঘণ্টা ধরুন। শুধু শারীরিকভাবে সক্ষমদের জন্য, ভোরে, পানি ও ভালো জুতা নিয়ে।",
    },
    image: { src: W("1/1a/Jabele_thor_-_panoramio.jpg/960px-Jabele_thor_-_panoramio.jpg"), page: "https://commons.wikimedia.org/wiki/File:Jabele_thor_-_panoramio.jpg", author: "Abdul Razzaq Phulpoto", license: "CC BY-SA 3.0" },
    more: [{ label: "Wikipedia: Jabal Thawr", url: "https://en.wikipedia.org/wiki/Jabal_Thawr" }],
  },
  {
    id: "mualla",
    region: "makkah",
    emoji: "🪦",
    name: { en: "Jannat al-Mu'alla cemetery", bn: "জান্নাতুল মুআল্লা কবরস্থান", ur: "جنت المعلّیٰ قبرستان" },
    arabic: "مقبرة المعلاة",
    lat: 21.435132,
    lon: 39.828807,
    short: { en: "Makkah's historic cemetery, resting place of Khadijah", bn: "মক্কার ঐতিহাসিক কবরস্থান, খাদিজা (রা.)-র কবর", ur: "مکہ کا تاریخی قبرستان، حضرت خدیجہؓ کی آرام گاہ" },
    about: {
      en: "The old cemetery of Makkah, north of the Haram on the road to al-Hajun. Historians record that Khadijah bint Khuwaylid, the first wife of the Prophet ﷺ, is buried here, along with many of the Prophet's family and later scholars.",
      bn: "মক্কার পুরোনো কবরস্থান, হারামের উত্তরে আল-হাজুনের পথে। ঐতিহাসিকরা লিখেছেন, নবী ﷺ-এর প্রথম স্ত্রী খাদিজা বিনতে খুয়াইলিদ (রা.) এখানে সমাহিত, সঙ্গে নবী-পরিবারের অনেকে ও পরবর্তী আলেমগণ।",
    },
    refs: [{ label: "Sahih Muslim 975", detail: { en: "the greeting and dua when visiting graves", bn: "কবর জিয়ারতের সালাম ও দোয়া" } }],
    visit: {
      en: "About 1.5 km from the Haram (≈20 min walk). Men may enter at set times; greet the dead and make dua. Graves are unmarked by design.",
      bn: "হারাম থেকে প্রায় ১.৫ কিমি (≈২০ মিনিট হাঁটা)। পুরুষরা নির্দিষ্ট সময়ে প্রবেশ করতে পারেন; সালাম দিন ও দোয়া করুন। কবরগুলো ইচ্ছাকৃতভাবে চিহ্নহীন।",
    },
    transport: { en: "Walk north along al-Masjid al-Haram Road, or Makkah Bus towards al-Hajun.", bn: "মসজিদুল হারাম রোড ধরে উত্তরে হাঁটুন, বা আল-হাজুনগামী মক্কা বাস।" },
    image: { src: W("0/05/Jannat_ul_Mualla_Cemetery.jpg/960px-Jannat_ul_Mualla_Cemetery.jpg"), page: "https://commons.wikimedia.org/wiki/File:Jannat_ul_Mualla_Cemetery.jpg", author: "Tubi719", license: "CC BY-SA 4.0" },
    more: [{ label: "Wikipedia: Jannat al-Mu'alla", url: "https://en.wikipedia.org/wiki/Jannat_al-Mu%27alla" }],
  },
  {
    id: "jinn",
    region: "makkah",
    emoji: "🕌",
    name: { en: "Masjid al-Jinn", bn: "মসজিদে জিন", ur: "مسجد الجن" },
    arabic: "مسجد الجن",
    lat: 21.433389,
    lon: 39.828944,
    short: { en: "Traditionally where jinn heard the Qur'an", bn: "ঐতিহ্যগতভাবে যেখানে জিনেরা কুরআন শুনেছিল", ur: "روایتی طور پر جہاں جنات نے قرآن سنا" },
    about: {
      en: "A mosque near al-Mu'alla, traditionally identified as the place where a group of jinn listened to the Prophet ﷺ reciting the Qur'an and believed — the event of Surah al-Jinn. The exact spot is a matter of tradition.",
      bn: "আল-মুআল্লার কাছের একটি মসজিদ, ঐতিহ্যগতভাবে সেই জায়গা হিসেবে পরিচিত যেখানে একদল জিন নবী ﷺ-এর কুরআন তিলাওয়াত শুনে ঈমান এনেছিল — সূরা আল-জিনের ঘটনা। সঠিক স্থানটি ঐতিহ্যভিত্তিক।",
    },
    refs: [{ label: "Qur'an 72:1–2" }, { label: "Qur'an 46:29–31" }, { label: "Sahih Muslim 450", detail: { en: "the night of the jinn", bn: "জিনদের রাতের ঘটনা" } }],
    visit: { en: "An active mosque — visit at prayer times. Next to al-Mu'alla, so both fit in one short trip.", bn: "চালু মসজিদ — নামাজের সময় যান। আল-মুআল্লার পাশেই, তাই দুটো একসঙ্গে দেখা যায়।" },
    image: { src: W("c/c7/Mosque_of_the_Jinn_03.jpg/960px-Mosque_of_the_Jinn_03.jpg"), page: "https://commons.wikimedia.org/wiki/File:Mosque_of_the_Jinn_03.jpg", author: "Sadrettin", license: "CC BY-SA 4.0" },
    more: [{ label: "Wikipedia: Mosque of the Jinn", url: "https://en.wikipedia.org/wiki/Mosque_of_the_Jinn" }],
  },
  {
    id: "aisha",
    region: "makkah",
    emoji: "🕌",
    name: { en: "Masjid Aisha (al-Tan'im)", bn: "মসজিদে আয়েশা (তানঈম)", ur: "مسجد عائشہ (تنعیم)" },
    arabic: "مسجد التنعيم · مسجد عائشة",
    lat: 21.4677,
    lon: 39.8013,
    short: { en: "The nearest place to enter ihram for Umrah from Makkah", bn: "মক্কা থেকে উমরাহর ইহরামের নিকটতম স্থান", ur: "مکہ سے عمرہ کے احرام کی قریب ترین جگہ" },
    about: {
      en: "At al-Tan'im, just outside the Haram boundary, Aisha entered ihram for an Umrah during the Farewell Hajj, at the Prophet's ﷺ instruction, with her brother Abd al-Rahman. Today people staying in Makkah go here to put on ihram for another Umrah.",
      bn: "হারামের সীমানার ঠিক বাইরে তানঈমে বিদায় হজের সময় নবী ﷺ-এর নির্দেশে আয়েশা (রা.) তাঁর ভাই আবদুর রহমানের সঙ্গে উমরাহর ইহরাম বাঁধেন। আজ মক্কায় অবস্থানকারীরা আরেকটি উমরাহর জন্য এখানে ইহরাম বাঁধতে আসেন।",
    },
    refs: [{ label: "Sahih al-Bukhari 1784" }, { label: "Sahih Muslim 1211" }],
    visit: {
      en: "Open around the clock with large wudu and changing areas for ihram. Busy after Isha and at night in Ramadan.",
      bn: "সারাক্ষণ খোলা, ইহরামের জন্য বড় অজু ও পোশাক বদলের জায়গা আছে। এশার পর ও রমজানের রাতে ভিড় বেশি।",
    },
    transport: { en: "Makkah Bus runs between the Haram area and al-Tan'im; taxis are plentiful.", bn: "হারাম এলাকা ও তানঈমের মধ্যে মক্কা বাস চলে; ট্যাক্সিও প্রচুর।" },
    image: { src: W("c/cc/Masjid_Aisha_%281%29.jpg/960px-Masjid_Aisha_%281%29.jpg"), page: "https://commons.wikimedia.org/wiki/File:Masjid_Aisha_(1).jpg", author: "Imam Khairul Annas", license: "CC BY-SA 4.0" },
    more: [{ label: "Wikipedia: Masjid at-Taneem", url: "https://en.wikipedia.org/wiki/Masjid_at-Taneem" }],
  },
  {
    id: "mina",
    region: "makkah",
    emoji: "⛺",
    name: { en: "Mina, the Jamarat & Masjid al-Khayf", bn: "মিনা, জামারাত ও মসজিদে খাইফ", ur: "منیٰ، جمرات اور مسجد خیف" },
    arabic: "منى · الجمرات · مسجد الخيف",
    lat: 21.413333,
    lon: 39.893333,
    short: { en: "The valley of tents where pilgrims stay and stone the Jamarat", bn: "তাঁবুর উপত্যকা, যেখানে হাজিরা থাকেন ও জামারাতে কংকর মারেন", ur: "خیموں کی وادی جہاں حاجی ٹھہرتے اور رمی کرتے ہیں" },
    about: {
      en: "Mina is where pilgrims spend the days of Tashreeq and stone the three Jamarat, following the Prophet ﷺ in the Farewell Hajj. Masjid al-Khayf in Mina is where he prayed during Hajj.",
      bn: "মিনায় হাজিরা আইয়ামে তাশরীক কাটান এবং বিদায় হজে নবী ﷺ-এর অনুসরণে তিন জামারাতে কংকর নিক্ষেপ করেন। মিনার মসজিদে খাইফে তিনি হজের সময় নামাজ পড়েছিলেন।",
    },
    refs: [{ label: "Qur'an 2:203" }, { label: "Sahih Muslim 1218", detail: { en: "Jabir's description of the Prophet's Hajj", bn: "নবী ﷺ-এর হজের বিবরণ (জাবির রা.)" } }],
    visit: {
      en: "Outside Hajj the tent city is empty and you can drive through it. During Hajj, access is only with a Hajj permit.",
      bn: "হজের বাইরে তাঁবুর শহর খালি থাকে, গাড়িতে ঘুরে দেখা যায়। হজের সময় শুধু হজ অনুমতিপত্র নিয়ে প্রবেশ।",
    },
    image: { src: W("6/6a/Mina_Overview.JPG/960px-Mina_Overview.JPG"), page: "https://commons.wikimedia.org/wiki/File:Mina_Overview.JPG", author: "Mubeen Rahman", license: "CC BY 3.0" },
    more: [
      { label: "Wikipedia: Mina", url: "https://en.wikipedia.org/wiki/Mina,_Saudi_Arabia" },
      { label: "Wikipedia: Jamaraat Bridge", url: "https://en.wikipedia.org/wiki/Jamaraat_Bridge" },
    ],
  },
  {
    id: "muzdalifah",
    region: "makkah",
    emoji: "🌙",
    name: { en: "Muzdalifah & al-Mash'ar al-Haram", bn: "মুজদালিফা ও মাশআরুল হারাম", ur: "مزدلفہ اور مشعر الحرام" },
    arabic: "مزدلفة · المشعر الحرام",
    lat: 21.386111,
    lon: 39.912222,
    short: { en: "Where pilgrims spend the night after Arafah", bn: "আরাফার পর হাজিরা যেখানে রাত কাটান", ur: "عرفہ کے بعد حاجی جہاں رات گزارتے ہیں" },
    about: {
      en: "Between Arafat and Mina. Pilgrims pray Maghrib and Isha here on the night after Arafah, sleep in the open and remember Allah at al-Mash'ar al-Haram until the sky brightens, as Allah commands.",
      bn: "আরাফাত ও মিনার মাঝে। আরাফার পরের রাতে হাজিরা এখানে মাগরিব ও এশা পড়েন, খোলা আকাশের নিচে ঘুমান এবং আল্লাহর নির্দেশ অনুযায়ী ভোর আলো হওয়া পর্যন্ত মাশআরুল হারামে জিকির করেন।",
    },
    refs: [{ label: "Qur'an 2:198" }, { label: "Sahih Muslim 1218" }],
    visit: { en: "Outside Hajj it is an open plain with the mosque; worth a drive-through on the way to Arafat.", bn: "হজের বাইরে মসজিদসহ খোলা প্রান্তর; আরাফাতে যাওয়ার পথে গাড়িতে দেখা যায়।" },
    image: { src: W("3/35/Fajr_in_Muzdalifah.jpg/960px-Fajr_in_Muzdalifah.jpg"), page: "https://commons.wikimedia.org/wiki/File:Fajr_in_Muzdalifah.jpg", author: "Arisdp", license: "CC BY-SA 4.0" },
    more: [{ label: "Wikipedia: Muzdalifah", url: "https://en.wikipedia.org/wiki/Muzdalifah" }],
  },
  {
    id: "arafat",
    region: "makkah",
    emoji: "🏔️",
    name: { en: "Arafat, Jabal al-Rahmah & Masjid Namirah", bn: "আরাফাত, জাবালে রহমত ও মসজিদে নামিরা", ur: "عرفات، جبلِ رحمت اور مسجد نمرہ" },
    arabic: "عرفات · جبل الرحمة · مسجد نمرة",
    lat: 21.3548,
    lon: 39.984102,
    short: { en: "The standing of Arafah — the heart of Hajj", bn: "আরাফার অবস্থান — হজের মূল", ur: "وقوفِ عرفہ — حج کا رکنِ اعظم" },
    about: {
      en: "On the 9th of Dhul-Hijjah pilgrims stand at Arafat in dua until sunset — “Hajj is Arafah.” The Prophet ﷺ delivered his Farewell Sermon here, and Masjid Namirah stands near where he stayed. Climbing Jabal al-Rahmah is not part of Hajj.",
      bn: "৯ জিলহজ হাজিরা সূর্যাস্ত পর্যন্ত আরাফাতে দোয়ায় অবস্থান করেন — “হজ হলো আরাফা।” নবী ﷺ এখানে বিদায় হজের ভাষণ দেন, আর তিনি যেখানে অবস্থান করেছিলেন তার কাছেই মসজিদে নামিরা। জাবালে রহমতে ওঠা হজের অংশ নয়।",
    },
    refs: [
      { label: "Jami' at-Tirmidhi 889", detail: { en: "“Hajj is Arafah”", bn: "“হজ হলো আরাফা”" } },
      { label: "Sahih Muslim 1218", detail: { en: "the sermon at Arafah and staying at Namirah", bn: "আরাফার ভাষণ ও নামিরায় অবস্থান" } },
    ],
    visit: { en: "Outside Hajj you can visit freely; it is hot and exposed — go early or late. The plain is about 20 km from the Haram.", bn: "হজের বাইরে স্বাধীনভাবে যাওয়া যায়; গরম ও খোলা — সকালে বা বিকেলে যান। প্রান্তরটি হারাম থেকে প্রায় ২০ কিমি।" },
    image: { src: W("f/f7/Masjid_al-Namira.jpg/960px-Masjid_al-Namira.jpg"), page: "https://commons.wikimedia.org/wiki/File:Masjid_al-Namira.jpg", author: "Ilhamnobi", license: "CC BY-SA 4.0" },
    more: [
      { label: "Wikipedia: Mount Arafat", url: "https://en.wikipedia.org/wiki/Mount_Arafat" },
      { label: "Wikipedia: Masjid al-Namirah", url: "https://en.wikipedia.org/wiki/Masjid_al-Namirah" },
    ],
  },
  {
    id: "exhibition",
    region: "makkah",
    emoji: "🏛️",
    name: { en: "Two Holy Mosques Architecture Exhibition", bn: "দুই পবিত্র মসজিদের স্থাপত্য প্রদর্শনী", ur: "حرمین شریفین کی تعمیراتی نمائش" },
    arabic: "معرض عمارة الحرمين الشريفين",
    lat: 21.433808,
    lon: 39.754299,
    short: { en: "Old Kaaba door, Maqam cover and the history of both Harams", bn: "কাবার পুরোনো দরজা, মাকামের আবরণ ও দুই হারামের ইতিহাস", ur: "کعبہ کا پرانا دروازہ، مقام کا غلاف اور دونوں حرموں کی تاریخ" },
    about: {
      en: "A museum in Umm al-Joud, next to the Kiswa factory, opened in 2000. It shows original pieces from the two Harams — old Kaaba doors, a wooden Maqam Ibrahim cover, Zamzam well fittings, columns and manuscripts — and models of the expansions.",
      bn: "উম্মুল জুদে কিসওয়া কারখানার পাশে ২০০০ সালে চালু হওয়া জাদুঘর। এখানে দুই হারামের আসল নিদর্শন — কাবার পুরোনো দরজা, মাকামে ইবরাহিমের কাঠের আবরণ, জমজম কূপের সরঞ্জাম, স্তম্ভ ও পাণ্ডুলিপি — এবং সম্প্রসারণের মডেল দেখানো হয়।",
    },
    refs: [],
    visit: { en: "Opening hours change by season; check before going. Free entry has usually applied, but confirm locally.", bn: "খোলার সময় মৌসুম অনুযায়ী বদলায়; যাওয়ার আগে জেনে নিন। সাধারণত বিনামূল্যে প্রবেশ, তবে স্থানীয়ভাবে নিশ্চিত হোন।" },
    image: { src: W("f/f7/The_Two_Holy_Mosques_Architecture_Exhibition.jpg/960px-The_Two_Holy_Mosques_Architecture_Exhibition.jpg"), page: "https://commons.wikimedia.org/wiki/File:The_Two_Holy_Mosques_Architecture_Exhibition.jpg", author: "Yasser.Bakhsh", license: "CC BY-SA 4.0" },
    more: [{ label: "Wikipedia: The Two Holy Mosques Architecture Exhibition", url: "https://en.wikipedia.org/wiki/The_Two_Holy_Mosques_Architecture_Exhibition" }],
  },

  // ───────────────────────────── Madinah ─────────────────────────────
  {
    id: "quba",
    region: "madinah",
    emoji: "🕌",
    name: { en: "Masjid Quba", bn: "মসজিদে কুবা", ur: "مسجد قبا" },
    arabic: "مسجد قباء",
    lat: 24.439167,
    lon: 39.617222,
    short: { en: "The first mosque — a prayer here is like an Umrah", bn: "প্রথম মসজিদ — এখানে নামাজ উমরাহর মতো", ur: "پہلی مسجد — یہاں نماز عمرہ کے برابر" },
    about: {
      en: "Founded by the Prophet ﷺ when he arrived at Quba on the Hijrah — the first mosque built in Islam. The Qur'an praises “a mosque founded on piety from the first day.” He used to visit it every Saturday, walking or riding.",
      bn: "হিজরতে কুবায় পৌঁছে নবী ﷺ এটি প্রতিষ্ঠা করেন — ইসলামের প্রথম নির্মিত মসজিদ। কুরআন প্রশংসা করেছে “প্রথম দিন থেকেই তাকওয়ার ওপর প্রতিষ্ঠিত মসজিদ”-এর। তিনি প্রতি শনিবার হেঁটে বা বাহনে এখানে আসতেন।",
    },
    refs: [
      { label: "Qur'an 9:108" },
      { label: "Sunan Ibn Majah 1412", detail: { en: "purify at home, then pray in Quba: reward like an Umrah", bn: "ঘরে পবিত্র হয়ে কুবায় নামাজ পড়লে উমরাহর সওয়াব" } },
      { label: "Jami' at-Tirmidhi 324" },
      { label: "Sahih al-Bukhari 1193", detail: { en: "he visited Quba every Saturday", bn: "তিনি প্রতি শনিবার কুবায় যেতেন" } },
      { label: "Sahih Muslim 1399" },
    ],
    visit: {
      en: "Make wudu before leaving your hotel and pray two rak'ahs there (not at a forbidden time). Open day and night; quieter mid-morning.",
      bn: "হোটেল থেকে অজু করে বের হন এবং সেখানে দুই রাকাত পড়ুন (নিষিদ্ধ সময় ছাড়া)। দিন-রাত খোলা; সকালের মাঝামাঝি ভিড় কম।",
    },
    transport: {
      en: "≈3.5 km from Masjid an-Nabawi along the Quba Walkway (≈45 min on foot), or Madinah Bus line 401 (SAR 3.45).",
      bn: "মসজিদে নববী থেকে কুবা ওয়াকওয়ে ধরে ≈৩.৫ কিমি (হেঁটে ≈৪৫ মিনিট), অথবা মদিনা বাস লাইন ৪০১ (৩.৪৫ রিয়াল)।",
    },
    image: { src: W("a/af/Masjid_Quba_Mosque.jpg/960px-Masjid_Quba_Mosque.jpg"), page: "https://commons.wikimedia.org/wiki/File:Masjid_Quba_Mosque.jpg", author: "Muhammad Mahdi Karim", license: "GFDL 1.2" },
    more: [{ label: "Wikipedia: Quba Mosque", url: "https://en.wikipedia.org/wiki/Quba_Mosque" }],
  },
  {
    id: "qiblatayn",
    region: "madinah",
    emoji: "🧭",
    name: { en: "Masjid al-Qiblatayn", bn: "মসজিদে কিবলাতাইন", ur: "مسجد قبلتین" },
    arabic: "مسجد القبلتين",
    lat: 24.484157,
    lon: 39.578811,
    short: { en: "The mosque of the two qiblas", bn: "দুই কিবলার মসজিদ", ur: "دو قبلوں والی مسجد" },
    about: {
      en: "For sixteen or seventeen months after the Hijrah, Muslims prayed towards Jerusalem until Allah turned the qibla to the Ka'bah. This mosque of Banu Salimah is traditionally where a prayer was completed facing the new qibla, hence its name.",
      bn: "হিজরতের পর ষোলো বা সতেরো মাস মুসলমানরা বায়তুল মাকদিসের দিকে নামাজ পড়তেন, তারপর আল্লাহ কিবলা কাবার দিকে ফিরিয়ে দেন। বনু সালিমার এই মসজিদে ঐতিহ্যগতভাবে নতুন কিবলার দিকে ফিরে একটি নামাজ সম্পন্ন হয়েছিল বলে এর নাম।",
    },
    refs: [{ label: "Qur'an 2:144" }, { label: "Sahih al-Bukhari 4486", detail: { en: "praying towards Jerusalem for 16 or 17 months", bn: "১৬ বা ১৭ মাস বায়তুল মাকদিসমুখী নামাজ" } }],
    visit: { en: "Open for all prayers; tour groups stop here with Quba and the Seven Mosques.", bn: "সব নামাজে খোলা; কুবা ও সাত মসজিদের সঙ্গে ট্যুর দলগুলো এখানে থামে।" },
    image: { src: W("b/bc/Masjid_al-Qiblatain.jpg/960px-Masjid_al-Qiblatain.jpg"), page: "https://commons.wikimedia.org/wiki/File:Masjid_al-Qiblatain.jpg", author: "Aiman titi", license: "CC BY-SA 3.0" },
    more: [{ label: "Wikipedia: Masjid al-Qiblatayn", url: "https://en.wikipedia.org/wiki/Masjid_al-Qiblatayn" }],
  },
  {
    id: "uhud",
    region: "madinah",
    emoji: "⛰️",
    name: { en: "Mount Uhud & the martyrs' cemetery", bn: "উহুদ পাহাড় ও শহীদদের কবরস্থান", ur: "جبلِ احد اور شہدا کا قبرستان" },
    arabic: "جبل أحد · مقبرة شهداء أحد",
    lat: 24.5038,
    lon: 39.6118,
    short: { en: "“A mountain that loves us and we love it”", bn: "“এই পাহাড় আমাদের ভালোবাসে, আমরাও একে ভালোবাসি”", ur: "“یہ پہاڑ ہم سے محبت کرتا ہے اور ہم اس سے”" },
    about: {
      en: "Site of the Battle of Uhud (3 AH). Seventy Muslims were martyred, among them Hamzah, the Prophet's ﷺ uncle, and they are buried at its foot. Opposite is the small Jabal al-Rumāh, where the archers were posted.",
      bn: "উহুদ যুদ্ধের স্থান (৩ হিজরি)। সত্তরজন মুসলমান শহীদ হন, তাঁদের মধ্যে নবী ﷺ-এর চাচা হামজা (রা.), এবং তাঁরা পাহাড়ের পাদদেশে সমাহিত। সামনে ছোট জাবালে রুমাত, যেখানে তীরন্দাজরা নিযুক্ত ছিলেন।",
    },
    refs: [
      { label: "Sahih al-Bukhari 4084", detail: { en: "“This is a mountain that loves us and we love it.”", bn: "“এ পাহাড় আমাদের ভালোবাসে, আমরাও একে ভালোবাসি।”" } },
      { label: "Qur'an 3:121–175", detail: { en: "Surah Al Imran on the Battle of Uhud", bn: "উহুদ যুদ্ধ নিয়ে সূরা আলে ইমরান" } },
    ],
    visit: {
      en: "Greet the martyrs from outside the cemetery fence and make dua for them. Sayyid al-Shuhada Mosque is beside it. Best early morning.",
      bn: "কবরস্থানের বেড়ার বাইরে থেকে শহীদদের সালাম দিন ও দোয়া করুন। পাশেই সাইয়্যিদুশ শুহাদা মসজিদ। ভোরে যাওয়া ভালো।",
    },
    transport: { en: "≈5 km north of Masjid an-Nabawi. Madinah Bus line 403 starts at Sayyid al-Shuhada Square (SAR 3.45).", bn: "মসজিদে নববীর ≈৫ কিমি উত্তরে। মদিনা বাস লাইন ৪০৩ সাইয়্যিদুশ শুহাদা স্কয়ার থেকে ছাড়ে (৩.৪৫ রিয়াল)।" },
    image: { src: W("e/e3/Jabal-e-Uhud.jpg/960px-Jabal-e-Uhud.jpg"), page: "https://commons.wikimedia.org/wiki/File:Jabal-e-Uhud.jpg", author: "Bintladen", license: "CC BY-SA 4.0" },
    more: [{ label: "Wikipedia: Mount Uhud", url: "https://en.wikipedia.org/wiki/Mount_Uhud" }],
  },
  {
    id: "baqi",
    region: "madinah",
    emoji: "🪦",
    name: { en: "Al-Baqi' cemetery", bn: "জান্নাতুল বাকি", ur: "جنت البقیع" },
    arabic: "بقيع الغرقد",
    lat: 24.4669,
    lon: 39.6164,
    short: { en: "Resting place of thousands of Companions", bn: "হাজারো সাহাবির শেষ বিশ্রামস্থল", ur: "ہزاروں صحابہ کی آرام گاہ" },
    about: {
      en: "Madinah's first Islamic cemetery, beside Masjid an-Nabawi. Many of the Prophet's ﷺ family and Companions are buried here. He would go out to al-Baqi' at night, greet its people and ask forgiveness for them.",
      bn: "মদিনার প্রথম ইসলামি কবরস্থান, মসজিদে নববীর পাশে। নবী ﷺ-এর পরিবার ও সাহাবিদের অনেকে এখানে সমাহিত। তিনি রাতে বাকিতে গিয়ে এর অধিবাসীদের সালাম দিতেন ও তাঁদের জন্য ক্ষমা চাইতেন।",
    },
    refs: [{ label: "Sahih Muslim 974", detail: { en: "“Peace be upon you, abode of believing people…”", bn: "“আসসালামু আলাইকুম, হে মুমিনদের আবাস…”" } }],
    visit: { en: "Men can enter after Fajr and after Asr (times can change). Women greet from outside. A 2-minute walk from the mosque's east side.", bn: "পুরুষরা ফজর ও আসরের পর প্রবেশ করতে পারেন (সময় বদলাতে পারে)। নারীরা বাইরে থেকে সালাম দেন। মসজিদের পূর্ব দিক থেকে ২ মিনিট হাঁটা।" },
    image: { src: W("e/eb/Al-Baqi_Cemetery_2021.jpg/960px-Al-Baqi_Cemetery_2021.jpg"), page: "https://commons.wikimedia.org/wiki/File:Al-Baqi_Cemetery_2021.jpg", author: "Saleh Al Hussain", license: "CC BY 4.0" },
    more: [{ label: "Wikipedia: Al-Baqi Cemetery", url: "https://en.wikipedia.org/wiki/Al-Baqi_Cemetery" }],
  },
  {
    id: "seven",
    region: "madinah",
    emoji: "🛡️",
    name: { en: "The Seven Mosques (Khandaq)", bn: "সাত মসজিদ (খন্দক)", ur: "مساجدِ سبعہ (خندق)" },
    arabic: "المساجد السبعة",
    lat: 24.4771,
    lon: 39.595105,
    short: { en: "Where the trench was dug in the Battle of the Confederates", bn: "আহযাব যুদ্ধে যেখানে খন্দক খোঁড়া হয়েছিল", ur: "جنگِ احزاب میں جہاں خندق کھودی گئی" },
    about: {
      en: "Small mosques at the foot of Mount Sal', along the line of the trench dug in 5 AH when the Confederates besieged Madinah. The largest, Masjid al-Fath, stands where tradition places the Prophet's ﷺ tent and dua.",
      bn: "সাল' পাহাড়ের পাদদেশে ছোট ছোট মসজিদ, ৫ হিজরিতে আহযাব বাহিনী মদিনা অবরোধ করলে যে খন্দক খোঁড়া হয়েছিল তার রেখা বরাবর। সবচেয়ে বড়টি মসজিদে ফাতহ, ঐতিহ্য অনুযায়ী যেখানে নবী ﷺ-এর তাঁবু ও দোয়ার স্থান।",
    },
    refs: [{ label: "Qur'an 33:9–27", detail: { en: "Surah al-Ahzab", bn: "সূরা আল-আহযাব" } }, { label: "Sahih al-Bukhari 4099", detail: { en: "digging the trench", bn: "খন্দক খোঁড়া" } }],
    visit: { en: "Open area with a newer large mosque; combine with Qiblatayn (≈2 km).", bn: "খোলা এলাকা ও নতুন বড় মসজিদ; কিবলাতাইনের সঙ্গে মিলিয়ে দেখুন (≈২ কিমি)।" },
    image: { src: W("e/ec/Sab%27u_Masajid.jpg/960px-Sab%27u_Masajid.jpg"), page: "https://commons.wikimedia.org/wiki/File:Sab%27u_Masajid.jpg", author: "Imam Khairul Annas", license: "CC BY-SA 3.0" },
    more: [{ label: "Wikipedia: The Seven Mosques", url: "https://en.wikipedia.org/wiki/The_Seven_Mosques" }],
  },
  {
    id: "ghamama",
    region: "madinah",
    emoji: "☁️",
    name: { en: "Masjid al-Ghamamah", bn: "মসজিদে গামামা", ur: "مسجد غمامہ" },
    arabic: "مسجد الغمامة",
    lat: 24.465778,
    lon: 39.606972,
    short: { en: "The Prophet's ﷺ Eid prayer ground", bn: "নবী ﷺ-এর ঈদের নামাজের মাঠ", ur: "نبی ﷺ کی عید گاہ" },
    about: {
      en: "About 500 m west of Masjid an-Nabawi, on the place known as the Prophet's ﷺ musalla where he prayed the Eid prayers. Its name (“cloud”) comes from the tradition of the rain prayer held there.",
      bn: "মসজিদে নববীর প্রায় ৫০০ মিটার পশ্চিমে, নবী ﷺ-এর মুসাল্লা নামে পরিচিত জায়গায়, যেখানে তিনি ঈদের নামাজ পড়তেন। নাম (“মেঘ”) এসেছে সেখানে বৃষ্টির নামাজের ঐতিহ্য থেকে।",
    },
    refs: [{ label: "Sahih al-Bukhari 956", detail: { en: "he went out to the musalla for Eid", bn: "ঈদে তিনি মুসাল্লায় যেতেন" } }],
    visit: { en: "A 7-minute walk from the mosque's west gates; often opened at prayer times only.", bn: "মসজিদের পশ্চিম গেট থেকে ৭ মিনিট হাঁটা; প্রায়ই শুধু নামাজের সময় খোলা।" },
    image: { src: W("e/eb/Mosque_of_Al-Ghamama_2026-05-13.jpg/960px-Mosque_of_Al-Ghamama_2026-05-13.jpg"), page: "https://commons.wikimedia.org/wiki/File:Mosque_of_Al-Ghamama_2026-05-13.jpg", author: "FaysaLBinDaruL", license: "CC BY 4.0" },
    more: [{ label: "Wikipedia: Mosque of Al-Ghamama", url: "https://en.wikipedia.org/wiki/Mosque_of_Al-Ghamama" }],
  },
  {
    id: "ijabah",
    region: "madinah",
    emoji: "🤲",
    name: { en: "Masjid al-Ijabah", bn: "মসজিদে ইজাবা", ur: "مسجد اجابہ" },
    arabic: "مسجد الإجابة · مسجد بني معاوية",
    lat: 24.472,
    lon: 39.618444,
    short: { en: "Where the Prophet ﷺ made three duas", bn: "যেখানে নবী ﷺ তিনটি দোয়া করেছিলেন", ur: "جہاں نبی ﷺ نے تین دعائیں کیں" },
    about: {
      en: "The mosque of Banu Mu'awiyah, north of al-Baqi'. The Prophet ﷺ prayed here and asked his Lord for three things: two were granted and one was withheld — that his ummah would not fight among themselves.",
      bn: "বনু মুআবিয়ার মসজিদ, বাকির উত্তরে। নবী ﷺ এখানে নামাজ পড়ে রবের কাছে তিনটি জিনিস চেয়েছিলেন: দুটি দেওয়া হয়, একটি দেওয়া হয়নি — তাঁর উম্মত যেন পরস্পরে লড়াই না করে।",
    },
    refs: [{ label: "Sahih Muslim 2890" }],
    visit: { en: "About 600 m from the Haram's north-east side — an easy walk with al-Baqi'.", bn: "হারামের উত্তর-পূর্ব দিক থেকে প্রায় ৬০০ মিটার — বাকির সঙ্গে সহজে হেঁটে যাওয়া যায়।" },
    image: { src: W("f/fa/Masjid_Ijabah_Imam_Khairul_Annas.JPG/960px-Masjid_Ijabah_Imam_Khairul_Annas.JPG"), page: "https://commons.wikimedia.org/wiki/File:Masjid_Ijabah_Imam_Khairul_Annas.JPG", author: "Imam Khairul Annas", license: "CC BY-SA 3.0" },
    more: [{ label: "Visit Madinah: Al-Ijabah Mosque", url: "https://visitmadinahsa.com/en/Details/1096" }],
  },
  {
    id: "miqat",
    region: "madinah",
    emoji: "🧳",
    name: { en: "Dhul-Hulayfah (Abyar Ali) — the Madinah miqat", bn: "যুলহুলাইফা (আবইয়ারে আলি) — মদিনার মিকাত", ur: "ذوالحلیفہ (ابیارِ علی) — مدینہ کی میقات" },
    arabic: "ذو الحليفة · آبار علي",
    lat: 24.413717,
    lon: 39.542432,
    short: { en: "Where pilgrims from Madinah put on ihram", bn: "মদিনা থেকে আসা হাজিরা যেখানে ইহরাম বাঁধেন", ur: "مدینہ سے آنے والے یہاں احرام باندھتے ہیں" },
    about: {
      en: "The miqat set by the Prophet ﷺ for the people of Madinah. He entered ihram here for his Umrahs and for the Farewell Hajj. Anyone travelling from Madinah to Makkah for Umrah must enter ihram here (or before).",
      bn: "মদিনাবাসীর জন্য নবী ﷺ-এর নির্ধারিত মিকাত। তিনি উমরাহ ও বিদায় হজের জন্য এখানে ইহরাম বাঁধেন। মদিনা থেকে উমরাহর জন্য মক্কাগামী যে কাউকে এখানে (বা এর আগে) ইহরাম বাঁধতে হবে।",
    },
    refs: [{ label: "Sahih al-Bukhari 1524", detail: { en: "the miqats", bn: "মিকাতসমূহ" } }, { label: "Sahih Muslim 1181" }],
    visit: { en: "Large mosque with washrooms for ihram, on the road to Makkah; buses and taxis stop here.", bn: "মক্কার পথে ইহরামের জন্য গোসলখানাসহ বড় মসজিদ; বাস ও ট্যাক্সি এখানে থামে।" },
    image: { src: W("0/06/Abiar_Ali.jpg/960px-Abiar_Ali.jpg"), page: "https://commons.wikimedia.org/wiki/File:Abiar_Ali.jpg", author: "Aiman titi", license: "CC BY-SA 3.0" },
    more: [{ label: "Wikipedia: Miqat Dhu al-Hulayfah", url: "https://en.wikipedia.org/wiki/Miqat_Dhu_al-Hulayfah" }],
  },

  // ───────────────────────────── Beyond ─────────────────────────────
  {
    id: "taif",
    region: "other",
    area: { en: "Taif", bn: "তায়েফ", ur: "طائف" },
    emoji: "🌹",
    name: { en: "Taif & the Abdullah ibn Abbas Mosque", bn: "তায়েফ ও আবদুল্লাহ ইবনে আব্বাস মসজিদ", ur: "طائف اور مسجد عبداللہ بن عباس" },
    arabic: "الطائف · مسجد عبد الله بن عباس",
    lat: 21.2704,
    lon: 40.4085,
    short: { en: "The Prophet's ﷺ hardest day, and his patience", bn: "নবী ﷺ-এর কঠিনতম দিন ও তাঁর ধৈর্য", ur: "نبی ﷺ کا سخت ترین دن اور آپ کا صبر" },
    about: {
      en: "In the year of sorrow the Prophet ﷺ went to Taif to call its people to Islam and was driven out and stoned. When the angel of the mountains offered to crush them, he said he hoped Allah would bring from their descendants people who worship Him alone. The Companion Abdullah ibn Abbas is buried in the cemetery beside the old mosque named after him.",
      bn: "শোকের বছরে নবী ﷺ তায়েফবাসীকে ইসলামের দাওয়াত দিতে গেলে তাঁকে তাড়িয়ে দেওয়া ও পাথর মারা হয়। পাহাড়ের ফেরেশতা তাদের পিষে ফেলার প্রস্তাব দিলে তিনি বলেন, তিনি আশা করেন আল্লাহ তাদের বংশধরদের মধ্য থেকে এমন মানুষ আনবেন যারা শুধু তাঁর ইবাদত করবে। সাহাবি আবদুল্লাহ ইবনে আব্বাস (রা.) তাঁর নামের পুরোনো মসজিদের পাশের কবরস্থানে সমাহিত।",
    },
    refs: [{ label: "Sahih al-Bukhari 3231", detail: { en: "the day of al-‘Aqabah and the angel of the mountains", bn: "আকাবার দিন ও পাহাড়ের ফেরেশতা" } }],
    visit: {
      en: "Taif is ≈90 km from Makkah, cooler and green, reached over the Al-Hada mountain road. It is also the miqat area of Qarn al-Manazil (as-Sayl al-Kabir).",
      bn: "তায়েফ মক্কা থেকে ≈৯০ কিমি, ঠান্ডা ও সবুজ, আল-হাদা পাহাড়ি রাস্তা দিয়ে যাওয়া যায়। এখানেই কারনুল মানাজিল (আস-সাইলুল কাবির) মিকাত এলাকা।",
    },
    transport: { en: "Taxi or private car for the day (agree the price first); intercity buses also run from Makkah.", bn: "দিনের জন্য ট্যাক্সি বা প্রাইভেট গাড়ি (আগে দাম ঠিক করুন); মক্কা থেকে আন্তঃনগর বাসও চলে।" },
    image: { src: W("f/fc/%D9%85%D8%B3%D8%AC%D8%AF_%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D9%84%D9%87_%D8%A8%D9%86_%D8%B9%D8%A8%D8%A7%D8%B3.jpg/960px-%D9%85%D8%B3%D8%AC%D8%AF_%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D9%84%D9%87_%D8%A8%D9%86_%D8%B9%D8%A8%D8%A7%D8%B3.jpg"), page: "https://commons.wikimedia.org/wiki/File:%D9%85%D8%B3%D8%AC%D8%AF_%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D9%84%D9%87_%D8%A8%D9%86_%D8%B9%D8%A8%D8%A7%D8%B3.jpg", author: "Muhammad Sobri", license: "CC BY-SA 4.0" },
    more: [
      { label: "Wikipedia: Taif", url: "https://en.wikipedia.org/wiki/Taif" },
      { label: "Wikipedia: Abd Allah ibn al-Abbas Mosque", url: "https://en.wikipedia.org/wiki/Abd_Allah_ibn_al-Abbas_Mosque" },
    ],
  },
  {
    id: "badr",
    region: "other",
    area: { en: "Badr", bn: "বদর", ur: "بدر" },
    emoji: "⚔️",
    name: { en: "Badr — the battlefield and martyrs' cemetery", bn: "বদর — যুদ্ধক্ষেত্র ও শহীদদের কবরস্থান", ur: "بدر — میدانِ جنگ اور شہدا کا قبرستان" },
    arabic: "بدر · مقبرة شهداء بدر",
    lat: 23.771984,
    lon: 38.788554,
    short: { en: "Yawm al-Furqan — the first great battle (2 AH)", bn: "ইয়াওমুল ফুরকান — প্রথম বড় যুদ্ধ (২ হিজরি)", ur: "یوم الفرقان — پہلا بڑا معرکہ (۲ ہجری)" },
    about: {
      en: "On 17 Ramadan 2 AH about 313 Muslims met a far larger Quraysh army at the wells of Badr and Allah granted victory: “Allah had already given you victory at Badr while you were few.” Fourteen martyrs are buried in a walled cemetery there.",
      bn: "২ হিজরির ১৭ রমজান প্রায় ৩১৩ জন মুসলমান বদরের কূপের কাছে অনেক বড় কুরাইশ বাহিনীর মুখোমুখি হন এবং আল্লাহ বিজয় দেন: “আল্লাহ বদরে তোমাদের সাহায্য করেছিলেন, যখন তোমরা ছিলে দুর্বল।” চৌদ্দজন শহীদ সেখানে প্রাচীরঘেরা কবরস্থানে সমাহিত।",
    },
    refs: [{ label: "Qur'an 3:123" }, { label: "Qur'an 8:9–12" }],
    visit: { en: "≈150 km south-west of Madinah (≈2 hours by car). A day trip; there is little shade.", bn: "মদিনার ≈১৫০ কিমি দক্ষিণ-পশ্চিমে (গাড়িতে ≈২ ঘণ্টা)। এক দিনের ভ্রমণ; ছায়া কম।" },
    transport: { en: "Private car or taxi hired for the day from Madinah (agree the price first).", bn: "মদিনা থেকে দিনের জন্য প্রাইভেট গাড়ি বা ট্যাক্সি (আগে দাম ঠিক করুন)।" },
    image: { src: W("d/d4/Badr_city.jpg/960px-Badr_city.jpg"), page: "https://commons.wikimedia.org/wiki/File:Badr_city.jpg", author: "Myrat", license: "CC BY 4.0" },
    more: [{ label: "Wikipedia: Battle of Badr", url: "https://en.wikipedia.org/wiki/Battle_of_Badr" }],
  },
  {
    id: "khaybar",
    region: "other",
    area: { en: "Khaybar", bn: "খাইবার", ur: "خیبر" },
    emoji: "🏰",
    name: { en: "Khaybar", bn: "খাইবার", ur: "خیبر" },
    arabic: "خيبر",
    lat: 25.701105,
    lon: 39.285976,
    short: { en: "The oasis and forts conquered in 7 AH", bn: "৭ হিজরিতে বিজিত মরূদ্যান ও দুর্গ", ur: "۷ ہجری میں فتح ہونے والا نخلستان اور قلعے" },
    about: {
      en: "An oasis of palm groves and forts about 150 km north of Madinah, conquered in 7 AH. The Prophet ﷺ said the banner would be given to a man who loves Allah and His Messenger, and gave it to Ali ibn Abi Talib.",
      bn: "মদিনার প্রায় ১৫০ কিমি উত্তরে খেজুর বাগান ও দুর্গের মরূদ্যান, ৭ হিজরিতে বিজিত। নবী ﷺ বলেছিলেন পতাকা দেওয়া হবে এমন একজনকে যিনি আল্লাহ ও তাঁর রাসুলকে ভালোবাসেন, এবং তিনি তা আলি ইবনে আবি তালিব (রা.)-কে দেন।",
    },
    refs: [{ label: "Sahih al-Bukhari 4210" }, { label: "Qur'an 48:18–21" }],
    visit: { en: "Old Khaybar's mud houses and forts are a heritage site; a long day trip (≈2 hours each way).", bn: "পুরোনো খাইবারের মাটির ঘর ও দুর্গ ঐতিহ্যবাহী স্থান; দীর্ঘ দিনের ভ্রমণ (প্রতি দিকে ≈২ ঘণ্টা)।" },
    image: { src: W("a/ae/Khaybar_-_deserted_houses.jpg/960px-Khaybar_-_deserted_houses.jpg"), page: "https://commons.wikimedia.org/wiki/File:Khaybar_-_deserted_houses.jpg", author: "Hardscarf", license: "CC BY-SA 4.0" },
    more: [{ label: "Wikipedia: Khaybar", url: "https://en.wikipedia.org/wiki/Khaybar" }],
  },
  {
    id: "balad",
    region: "other",
    area: { en: "Jeddah", bn: "জেদ্দা", ur: "جدہ" },
    emoji: "🏘️",
    name: { en: "Al-Balad — historic Jeddah", bn: "আল-বালাদ — ঐতিহাসিক জেদ্দা", ur: "البلد — تاریخی جدہ" },
    arabic: "جدة التاريخية · البلد",
    lat: 21.483964,
    lon: 39.187668,
    short: { en: "The old port town of the pilgrims (UNESCO)", bn: "হাজিদের পুরোনো বন্দর শহর (ইউনেস্কো)", ur: "حاجیوں کا پرانا بندرگاہی شہر (یونیسکو)" },
    about: {
      en: "For centuries most pilgrims reached Makkah through Jeddah's port. Its old quarter, with coral-stone houses and wooden roshan balconies and the old Shafi'i mosque, is a UNESCO World Heritage site.",
      bn: "শতাব্দীর পর শতাব্দী বেশিরভাগ হাজি জেদ্দা বন্দর হয়ে মক্কায় পৌঁছাতেন। প্রবাল-পাথরের বাড়ি, কাঠের রোশান বারান্দা ও পুরোনো শাফেয়ি মসজিদসহ এর পুরোনো এলাকা ইউনেস্কো বিশ্ব ঐতিহ্য।",
    },
    refs: [],
    visit: { en: "Best in the evening; ≈80 km from Makkah. A heritage visit, not a religious one.", bn: "সন্ধ্যায় সবচেয়ে ভালো; মক্কা থেকে ≈৮০ কিমি। ঐতিহ্য দেখা, ধর্মীয় কোনো আমল নয়।" },
    transport: { en: "Haramain train Makkah → Jeddah, then taxi to al-Balad.", bn: "হারামাইন ট্রেনে মক্কা → জেদ্দা, তারপর ট্যাক্সিতে আল-বালাদ।" },
    image: { src: W("d/db/Old_Jeddah_%28Al_Balad%29_architecture_3_Feb_2022.jpg/960px-Old_Jeddah_%28Al_Balad%29_architecture_3_Feb_2022.jpg"), page: "https://commons.wikimedia.org/wiki/File:Old_Jeddah_(Al_Balad)_architecture_3_Feb_2022.jpg", author: "Francisco Anzola", license: "CC BY 2.0" },
    more: [
      { label: "UNESCO: Historic Jeddah", url: "https://whc.unesco.org/en/list/1361/" },
      { label: "Wikipedia: Al-Balad", url: "https://en.wikipedia.org/wiki/Al-Balad,_Jeddah" },
    ],
  },
];

// ───────────────────────────── trip estimates ─────────────────────────────

/**
 * Taxi meter tariff set by the Transport General Authority (Saudi Gazette, 13 Mar 2022):
 * SAR 6.4 start + SAR 2.1 per km, minimum SAR 10; waiting SAR 0.9/min. Ride-hailing apps are similar.
 */
export const TAXI = { start: 6.4, perKm: 2.1, min: 10, source: { label: "Saudi Gazette, 13 Mar 2022 — TGA taxi tariff", url: "https://saudigazette.com.sa/article/618085" } };
/** City buses (flat fare per ride). */
export const BUS = {
  makkah: { fare: 4, source: { label: "Gulf News, 19 Sep 2024 — Makkah Bus fares", url: "https://gulfnews.com/living-in-uae/ask-us/budget-travel-in-makkah-how-umrah-pilgrims-can-save-with-the-public-bus-system-1.1726744962597" } },
  madinah: { fare: 3.45, source: { label: "KSA Expats, Jan 2025 — Madinah Bus fares", url: "https://ksaexpats.com/madinah-buses-routes-schedules-ticket-prices/" } },
};

/** Roads wind: the drive is usually ~30% longer than the straight line (more in the mountains). */
export const ROAD_FACTOR = 1.3;

/** Free-flow road minutes (router) plus a traffic allowance: heavy near the Harams, light on highways. */
export function withTraffic(roadKm: number, freeMin: number): number {
  return Math.max(1, Math.round(freeMin * (roadKm < 15 ? 1.5 : roadKm < 40 ? 1.25 : 1.1)));
}

export type TripEstimate = {
  straightKm: number;
  roadKm: number;
  walkMin: number | null;
  driveMin: number;
  taxi: [number, number];
};

/**
 * Estimate a trip from a straight-line distance (km). When a real road route is known
 * (OpenStreetMap car route: km and free-flow minutes), its distance is used for the fare and
 * its time gets a traffic allowance near the Harams.
 */
export function estimateTrip(straightKm: number, road?: { km: number; min: number } | null): TripEstimate {
  const roadKm = road ? road.km : straightKm * ROAD_FACTOR;
  // City traffic near the Harams averages ~25 km/h; open highway ~85 km/h.
  const speed = roadKm < 15 ? 25 : roadKm < 40 ? 45 : 85;
  const driveMin = road
    ? Math.max(5, withTraffic(roadKm, road.min))
    : Math.max(5, Math.round((roadKm / speed) * 60));
  const meter = Math.max(TAXI.min, TAXI.start + TAXI.perKm * roadKm);
  // Upper end: traffic waiting time (≈ a fifth of the trip at SAR 0.9/min) and app surge.
  const high = Math.max(TAXI.min + 5, meter + 0.9 * driveMin * 0.2) * 1.25;
  const round5 = (n: number) => Math.max(5, Math.round(n / 5) * 5);
  return {
    straightKm,
    roadKm,
    walkMin: straightKm <= 3 ? Math.round((straightKm * 1.25 * 1000) / 1.1 / 60) : null,
    driveMin,
    taxi: [round5(meter), round5(high)],
  };
}
