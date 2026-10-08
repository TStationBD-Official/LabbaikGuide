import type { LText } from "@/types/content";

/**
 * Practical travel guide for pilgrims (mainly from Bangladesh).
 * Every item carries its sources and the date it was checked. Prices and rules
 * change often: where sources disagree or a figure moves with the season, the
 * text says so instead of picking a number.
 */
export const TRAVEL_GUIDE_CHECKED = "2026-10-08";

export type GuideSource = { label: string; url: string; date?: string };
export type GuideTable = { head: LText[]; rows: (string | LText)[][]; note?: LText };
export type GuideItem = {
  id: string;
  title: LText;
  /** Paragraphs; lines starting with "• " render as a list. */
  body: LText;
  table?: GuideTable;
  /** Shown highlighted: important warning or "check before you go". */
  warn?: LText;
  sources: GuideSource[];
};
export type GuideSection = { id: string; icon: string; title: LText; summary: LText; items: GuideItem[] };

export const TRAVEL_GUIDE: GuideSection[] = [
  {
    id: "sim",
    icon: "📱",
    title: { bn: "সিম, ইন্টারনেট ও রোমিং", en: "SIM, internet & roaming" },
    summary: { bn: "সৌদি সিম কোথায় ও কীভাবে কিনবেন, ই-সিম, বাংলাদেশি রোমিং", en: "Where and how to buy a Saudi SIM, eSIM, roaming from Bangladesh" },
    items: [
      {
        id: "sim-where",
        title: { bn: "সৌদি সিম কোথায় কিনবেন", en: "Where to buy a Saudi SIM" },
        body: {
          bn: "জেদ্দা বিমানবন্দরের (KAIA) মূল আগমন হলে, ট্রেন স্টেশনের দিকে যাওয়ার পথে stc, Mobily ও Zain-এর দোকান আছে। মক্কা-মদিনা শহরেও অপারেটরদের নিজস্ব শাখা আছে।\n• stc-এর ভিজিটর নম্বর অনলাইনে বা mystc অ্যাপে আগে বুক করা যায়, তবে চালু করতে পৌঁছে stc শাখায় যেতে হয় (বুক করা নম্বর ৩০ দিন রাখা হয়)।\n• পাসপোর্ট ও ভিসা সঙ্গে রাখুন — সিম নিবন্ধনে আঙুলের ছাপ (বায়োমেট্রিক) লাগে; যাচাই না হলে সিমের সেবা বন্ধ হয়ে যায়।",
          en: "At Jeddah airport (KAIA), stc, Mobily and Zain have shops in the main arrivals hall, on the way to the train station exit. The operators also have their own branches in Makkah and Madinah.\n• stc visitor numbers can be booked online or in the mystc app, but you must visit an stc branch after arrival to activate (a booked number is held for 30 days).\n• Carry your passport and visa — SIM registration needs your fingerprints (biometric); an unverified SIM has its service suspended.",
        },
        sources: [
          { label: "stc – Sawa Visitor", url: "https://www.stc.com.sa/content/stc/sa/en/personal/mobile/packages/sawa-ziyara.html" },
          { label: "CST – unverified SIM suspension", url: "https://www.cst.gov.sa/en/media-center/news/CITC-announces-the-commencement-of-service-suspension-for-unverified-SIM-cards", date: "2016" },
          { label: "TravelTomTom – Jeddah airport SIM", url: "https://www.traveltomtom.net/destinations/middle-east/saudi-arabia/sim-card-jeddah-airport", date: "2026" },
        ],
      },
      {
        id: "sim-stc",
        title: { bn: "stc ভিজিটর প্যাকেজ (দাম ভ্যাটসহ)", en: "stc visitor packages (prices incl. VAT)" },
        body: { bn: "stc-এর অফিসিয়াল পাতায় প্রকাশিত সাওয়া ভিজিটর প্যাকেজ:", en: "stc's Sawa Visitor packages as published on its official page:" },
        table: {
          head: [{ bn: "প্যাকেজ", en: "Package" }, { bn: "দাম (রিয়াল)", en: "Price (SAR)" }, { bn: "ডেটা", en: "Data" }, { bn: "কল", en: "Calls" }, { bn: "মেয়াদ", en: "Validity" }],
          rows: [
            ["Visitor 26", "31", "6 GB", { bn: "১ ঘণ্টা", en: "1 h" }, { bn: "২ সপ্তাহ", en: "2 weeks" }],
            ["Visitor 47", "55", "21 GB", { bn: "২ ঘণ্টা", en: "2 h" }, { bn: "২ সপ্তাহ", en: "2 weeks" }],
            ["Visitor 65", "75", "33 GB", { bn: "৩ ঘণ্টা", en: "3 h" }, { bn: "৩ সপ্তাহ", en: "3 weeks" }],
            ["Visitor 86", "100", "51 GB", { bn: "৫ ঘণ্টা", en: "5 h" }, { bn: "৪ সপ্তাহ", en: "4 weeks" }],
            ["Visitor 130", "150", "72 GB", { bn: "৬ ঘণ্টা", en: "6 h" }, { bn: "৪ সপ্তাহ", en: "4 weeks" }],
            ["Visitor 165", "190", "100 GB", { bn: "১০ ঘণ্টা", en: "10 h" }, { bn: "৪ সপ্তাহ", en: "4 weeks" }],
          ],
          note: { bn: "অফারের মেয়াদ ও দাম বদলায় — কেনার আগে দোকানে বা অ্যাপে মিলিয়ে নিন।", en: "Offers and prices change — confirm at the shop or in the app before buying." },
        },
        sources: [{ label: "stc – Sawa Visitor (official)", url: "https://www.stc.com.sa/content/stc/sa/en/personal/mobile/packages/sawa-ziyara.html", date: "2026" }],
      },
      {
        id: "sim-mobily",
        title: { bn: "Mobily ভিজিটর প্যাকেজ (দাম ভ্যাটসহ)", en: "Mobily visitor packages (prices incl. VAT)" },
        body: {
          bn: "রিচার্জ: ১৪০০-তে কল করুন বা *1400*কার্ড নম্বর# ডায়াল করুন। ব্যালেন্স: *1411*1#। গ্রাহকসেবা: ১১০০।",
          en: "Recharge: call 1400 or dial *1400*card number#. Balance: *1411*1#. Customer care: 1100.",
        },
        table: {
          head: [{ bn: "প্যাকেজ", en: "Package" }, { bn: "দাম (রিয়াল)", en: "Price (SAR)" }, { bn: "ডেটা", en: "Data" }, { bn: "মিনিট", en: "Minutes" }, { bn: "মেয়াদ", en: "Validity" }],
          rows: [
            ["Visitor 30", "34.50", "5 GB", "60", { bn: "১৪ দিন", en: "14 days" }],
            ["Visitor 50", "57.50", "15 GB", "120", { bn: "১৪ দিন", en: "14 days" }],
            ["Visitor 90", "103.50", "48 GB", "300", { bn: "৩০ দিন", en: "30 days" }],
            ["Visitor 100", "115", { bn: "২৫ GB + আনলিমিটেড সোশ্যাল", en: "25 GB + unlimited social" }, "400", { bn: "১৪ দিন", en: "14 days" }],
            ["Visitor 150", "173", { bn: "৪০ GB + আনলিমিটেড সোশ্যাল", en: "40 GB + unlimited social" }, "600", { bn: "৩০ দিন", en: "30 days" }],
          ],
        },
        sources: [{ label: "Mobily – Visitor (official)", url: "https://mobily.com.sa/wps/portal/web/personal/mobily-plans/visitor" }],
      },
      {
        id: "sim-esim",
        title: { bn: "ই-সিম (দোকানে না গিয়ে)", en: "eSIM (no shop visit)" },
        body: {
          bn: "সৌদি যোগাযোগ কর্তৃপক্ষ (CST) জানিয়েছে, আন্তর্জাতিক হাজিরা অপারেটরের অ্যাপে ই-সিম চাইতে পারেন; আবশির অ্যাপে মুখ/আঙুলের ছাপ যাচাই করে দূর থেকেই চালু হয়। এটি উমরাহর সময়েও চালু আছে কি না নিশ্চিত নয় — অপারেটরের অ্যাপে দেখে নিন।\n• আন্তর্জাতিক ই-সিম (যেমন Airalo, Zain নেটওয়ার্ক): সাধারণত শুধু ডেটা, সৌদি ফোন নম্বর থাকে না — যেসব সেবায় সৌদি নম্বরে ওটিপি লাগে তাতে কাজ নাও করতে পারে।",
          en: "Saudi Arabia's communications authority (CST) announced that international pilgrims can request an eSIM in an operator's app, activated remotely after a face/fingerprint check in the Absher app. Whether this also runs in the Umrah season is unconfirmed — check the operator's app.\n• International eSIMs (e.g. Airalo, on the Zain network) are usually data-only with no Saudi number — services that send an OTP to a Saudi number may not work.",
        },
        sources: [
          { label: "CST – eSIM for pilgrims", url: "https://www.cst.gov.sa/en/media-center/news/N2025052101", date: "21 May 2025" },
          { label: "Airalo – Saudi Arabia", url: "https://www.airalo.com/Saudi-Arabia-esim", date: "2026" },
        ],
      },
      {
        id: "roaming",
        title: { bn: "বাংলাদেশি সিমে রোমিং", en: "Roaming on your Bangladeshi SIM" },
        body: {
          bn: "যাওয়ার আগেই দেশে রোমিং চালু করুন — চালু হতে ২৪ ঘণ্টা পর্যন্ত লাগতে পারে। প্যাক না নিয়ে ডেটা চালালে খরচ ডলারে কাটে এবং অনেক বেশি হয় — ডেটা রোমিং বন্ধ রেখে প্যাক কিনুন।\n• গ্রামীণফোন: MyGP অ্যাপের “Roaming (Taka)” অংশে সৌদি প্যাক। হজ ২০২৬-এ প্রকাশিত ৪৫ দিনের প্যাক: ২০ GB ২,৪৯৯ টাকা; ১৫ GB + ৭৫ মিনিট ২,৯৯৯ টাকা; শুধু ১০০ মিনিট ১,৬৯৯ টাকা। পাসপোর্ট, ভিসা ও টিকিট লাগে। হেল্পলাইন (বিদেশ থেকে): +৮৮০১৭০০১০০১২১।\n• বাংলালিংক: MyBL অ্যাপে হজ রোমিং প্যাক, ৫৯৪ টাকা থেকে শুরু।\n• রবি ও টেলিটক: সর্বশেষ প্যাক অপারেটরের অ্যাপ/হেল্পলাইনে জেনে নিন (রবি: ১২১)।\n• বাংলাদেশ ব্যাংকের সীমা: টাকায় রোমিং প্যাক কেনা যায় প্রতি সফরে ৬,০০০ টাকা ও বছরে ৩০,০০০ টাকা পর্যন্ত — সব নম্বর ও অপারেটর মিলিয়ে।\n• ব্যাংকের ওটিপি পেতে বাংলাদেশি সিম চালু রাখুন; প্যাকে মিনিট বা ডলার ব্যালেন্স না থাকলে কল আসা-যাওয়া নাও হতে পারে।",
          en: "Turn on roaming at home before you fly — activation can take up to 24 hours. Using data without a pack is charged in USD and gets very expensive — keep data roaming off and buy a pack.\n• Grameenphone: Saudi packs in the MyGP app under “Roaming (Taka)”. 45-day packs published for Hajj 2026: 20 GB Tk 2,499; 15 GB + 75 min Tk 2,999; 100 min only Tk 1,699. Passport, visa and ticket required. Helpline (from abroad): +8801700100121.\n• Banglalink: Hajj roaming packs in the MyBL app, from Tk 594.\n• Robi and Teletalk: ask the operator's app/helpline for current packs (Robi: 121).\n• Bangladesh Bank limit: taka roaming packs up to Tk 6,000 per trip and Tk 30,000 per year — across all your numbers and operators.\n• Keep your Bangladeshi SIM on to receive bank OTPs; without minutes or USD balance in your pack, calls may not go through.",
        },
        warn: {
          bn: "এই প্যাকগুলো হজ মৌসুমের জন্য প্রকাশিত হয়েছিল — এখন উমরাহর সময় চালু আছে কি না অপারেটরের অ্যাপে দেখে নিন।",
          en: "These packs were published for the Hajj season — check in the operator's app whether they are offered now for Umrah.",
        },
        sources: [
          { label: "Grameenphone – Hajj roaming packs", url: "https://www.grameenphone.com/hajj-roaming-pack", date: "2026" },
          { label: "Grameenphone – Stay connected during Hajj", url: "https://www.grameenphone.com/personal/plans-offers/offers/stay-connected-during-hajj", date: "2026" },
          { label: "TBS News – Banglalink Hajj roaming", url: "https://www.tbsnews.net/economy/corporates/banglalink-introduces-countrys-first-5g-hajj-roaming-packs-1412971", date: "16 Apr 2026" },
        ],
      },
      {
        id: "net-tips",
        title: { bn: "ওয়াই-ফাই, হোয়াটসঅ্যাপ কল ও পাওয়ার ব্যাংক", en: "Wi-Fi, WhatsApp calls & power banks" },
        body: {
          bn: "• মক্কা-মদিনায় মোবাইল নেটওয়ার্ক খুব ভালো (৯৯%-এর বেশি এলাকায় 5G/4G, হজ মৌসুমে হাজার হাজার ওয়াই-ফাই পয়েন্ট)।\n• হোয়াটসঅ্যাপে মেসেজ চলে, কিন্তু ভয়েস/ভিডিও কল কাজ নাও করতে পারে — জরুরি হলে সাধারণ ফোন কল করুন।\n• বিমানে পাওয়ার ব্যাংক শুধু হ্যান্ড লাগেজে, সর্বোচ্চ দুটি; ফ্লাইটে সেটি দিয়ে চার্জ দেওয়া নিষেধ।",
          en: "• Mobile coverage in Makkah and Madinah is very good (5G/4G across more than 99% of areas, thousands of Wi-Fi points in the Hajj season).\n• WhatsApp messages work, but voice/video calls may not — use a normal phone call when it matters.\n• On flights, power banks go in hand luggage only, at most two, and charging from them during the flight is not allowed.",
        },
        sources: [
          { label: "CST – Hajj 2025 network readiness", url: "https://www.cst.gov.sa/en/media-center/news/CST-Announces-the-Readiness-of-its-Operational-Plans-for-the-2025-Hajj-Season-to-Serve-Pilgrims", date: "25 May 2025" },
          { label: "Arab News – internet calling apps", url: "https://www.arabnews.com/node/1164956", date: "2017" },
          { label: "Gulf News – power banks on Saudi flights", url: "https://gulfnews.com/amp/story/business%2Faviation%2Fsaudi-arabia-bans-charging-power-banks-onboard-flights-1.500550755", date: "May 2026" },
        ],
      },
    ],
  },
  {
    id: "visa",
    icon: "🛂",
    title: { bn: "ভিসা ও নুসুক পারমিট", en: "Visa & Nusuk permits" },
    summary: { bn: "উমরাহ ভিসা, মৌসুমের তারিখ, উমরাহ ও রওজার পারমিট", en: "Umrah visa, season dates, Umrah and Rawdah permits" },
    items: [
      {
        id: "visa-umrah",
        title: { bn: "উমরাহ ভিসা (বাংলাদেশি পাসপোর্ট)", en: "Umrah visa (Bangladeshi passport)" },
        body: {
          bn: "বাংলাদেশ সৌদি ট্যুরিস্ট ই-ভিসার তালিকায় নেই, তাই সাধারণত নুসুকের অনুমোদিত প্যাকেজ বা লাইসেন্সপ্রাপ্ত এজেন্সির মাধ্যমে উমরাহ ভিসা নিতে হয়।\n• জুলাই ২০২৬ থেকে মাল্টিপল-এন্ট্রি উমরাহ ভিসা: মেয়াদ ৩৬৫ দিন, সব সফর মিলিয়ে মোট ৯০ দিন থাকা যায়; প্রতিটি সফরের জন্য নুসুকে অনুমোদিত প্রতিষ্ঠানের প্যাকেজ ও আসার আগে উমরাহ পারমিট লাগে।\n• ১ জিলকদ থেকে ১৩ জিলহজ পর্যন্ত (হজের সময়) উমরাহ ভিসা চালু হয় না।\n• যেকোনো বৈধ সৌদি ভিসাধারী (ট্যুরিস্ট, ভিজিট, কাজ ইত্যাদি) নুসুক পারমিট নিয়ে উমরাহ করতে পারেন।",
          en: "Bangladesh is not on the Saudi tourist e-visa list, so Bangladeshi pilgrims normally get an Umrah visa through an approved Nusuk package or a licensed agency.\n• Since July 2026 there is a multiple-entry Umrah visa: valid 365 days, up to 90 days' stay in total across visits; each visit needs a package from an approved provider on Nusuk and an Umrah permit before arrival.\n• From 1 Dhu al-Qi'dah to 13 Dhu al-Hijjah (the Hajj period) the Umrah visa is not activated.\n• Holders of any valid Saudi visa (tourist, visit, work, etc.) may perform Umrah with a Nusuk permit.",
        },
        sources: [
          { label: "Visit Saudi – e-visa eligible countries", url: "https://visa.visitsaudi.com/" },
          { label: "SPA – multiple-entry Umrah visa", url: "https://www.spa.gov.sa/en/N2637600", date: "20 Jul 2026" },
          { label: "Arab News – Umrah on any visa", url: "https://www.arabnews.pk/node/2617968", date: "6 Oct 2025" },
        ],
      },
      {
        id: "visa-season",
        title: { bn: "১৪৪৮ হিজরি উমরাহ মৌসুমের তারিখ", en: "Umrah season 1448 AH — key dates" },
        body: {
          bn: "• ভিসা ইস্যু ও আগমন শুরু: ৩১ মে ২০২৬\n• নুসুক উমরাহ পারমিট ও মক্কায় প্রবেশ শুরু: ১ জুন ২০২৬\n• শেষ ভিসা ইস্যু: ৯ মার্চ ২০২৭\n• সৌদিতে শেষ প্রবেশ: ২৩ মার্চ ২০২৭\n• দেশ ছাড়ার শেষ দিন: ৭ এপ্রিল ২০২৭",
          en: "• Visa issuance and arrivals start: 31 May 2026\n• Nusuk Umrah permits and entry to Makkah start: 1 June 2026\n• Last visa issuance: 9 March 2027\n• Last entry into the Kingdom: 23 March 2027\n• Final departure deadline: 7 April 2027",
        },
        sources: [{ label: "Saudi Press Agency", url: "https://www.spa.gov.sa/en/N2587540", date: "17 May 2026" }],
      },
      {
        id: "permit-umrah",
        title: { bn: "নুসুক উমরাহ পারমিট", en: "Nusuk Umrah permit" },
        body: {
          bn: "উমরাহর জন্য নুসুক অ্যাপ থেকে পারমিট (নির্দিষ্ট সময়ের স্লট) নিতে হয়; হারামে কিউআর কোড স্ক্যান হয়। হজ ও উমরাহ মন্ত্রণালয়ের নির্দেশিকা: যাত্রার আগেই নুসুকে পারমিট নিন এবং নির্ধারিত সময় মেনে চলুন। পারমিট ছাড়া মসজিদুল হারামে ঢুকতে বাধা পেতে পারেন।",
          en: "Umrah needs a permit (a timed slot) from the Nusuk app; the QR code is scanned at the Haram. The Ministry of Hajj and Umrah's guide: issue the permit in Nusuk before you travel and keep strictly to its time. Without one you may be stopped at Masjid al-Haram.",
        },
        sources: [
          { label: "Nusuk (official)", url: "https://www.nusuk.sa/" },
          { label: "Ministry of Hajj and Umrah – Umrah guide (PDF)", url: "https://haj.gov.sa/-/media/Project/HAJJ/Awareness-Guides/Umrah-Guide-for-Domestic-Pilgrims/EN-Umrah-Guide-for-Domestic-Pilgrims.pdf", date: "1447 / 2026" },
          { label: "Wego – Umrah permit", url: "https://blog.wego.com/permit-for-umrah/", date: "Sep 2026" },
        ],
      },
      {
        id: "permit-rawdah",
        title: { bn: "রিয়াজুল জান্নাহ (রওজা) পারমিট", en: "Ar-Rawdah permit" },
        body: {
          bn: "নুসুক অ্যাপে পুরুষ ও মহিলা উভয়ের পারমিট লাগে — প্রতি ৩৬৫ দিনে একবার। প্রবেশ শুধু দক্ষিণ চত্বর দিয়ে, ৩৭ নম্বর গেটের বিপরীতে। কিউআর কোড নির্ধারিত সময়ের দুই ঘণ্টা আগে সক্রিয় হয়।\n• পুরুষ: রাত ২টা থেকে ফজর, এবং সকাল ১১:২০ থেকে ইশা\n• মহিলা: ফজরের পর থেকে সকাল ১১টা, এবং ইশার পর থেকে রাত ২টা\n• জুমাবারে সময় আলাদা। বয়স্করা হুইলচেয়ার ব্যবহার করতে পারেন।",
          en: "Men and women both need a permit in the Nusuk app — once every 365 days. Entry is only from the southern courtyards, opposite Gate 37. The QR code becomes active two hours before your slot.\n• Men: 2:00 am until Fajr, and 11:20 am until Isha\n• Women: after Fajr until 11:00 am, and after Isha until 2:00 am\n• Friday times differ. Elderly visitors may use wheelchairs.",
        },
        sources: [
          { label: "Saudi Press Agency", url: "https://spa.gov.sa/en/N2459265", date: "5 Dec 2025" },
          { label: "ProPakistani – schedule", url: "https://propakistani.pk/2026/05/25/saudi-arabia-announces-new-visiting-schedule-for-masjid-e-nabawi/", date: "25 May 2026" },
        ],
      },
    ],
  },
  {
    id: "transport",
    icon: "🚆",
    title: { bn: "যাতায়াত: ট্রেন, বাস, ট্যাক্সি", en: "Getting around: train, bus, taxi" },
    summary: { bn: "হারামাইন ট্রেন, মক্কা ও মদিনার বাস, উবার/কারিম, বিমানবন্দর থেকে", en: "Haramain train, Makkah & Madinah buses, Uber/Careem, from the airports" },
    items: [
      {
        id: "train",
        title: { bn: "হারামাইন হাই-স্পিড ট্রেন", en: "Haramain High Speed Railway" },
        body: {
          bn: "স্টেশন: মক্কা (রুসাইফা), জেদ্দা সুলাইমানিয়া, জেদ্দা বিমানবন্দর (টার্মিনাল ১-এর ভেতরে), কিং আবদুল্লাহ ইকোনমিক সিটি ও মদিনা।\n• সময়: মক্কা–মদিনা প্রায় ২ থেকে পৌনে ৩ ঘণ্টা; মক্কা–জেদ্দা বিমানবন্দর প্রায় ৩৫–৫০ মিনিট; বিমানবন্দর–মদিনা প্রায় ২ ঘণ্টা।\n• টিকিট: sar.hhr.sa ওয়েবসাইট, HHR Train অ্যাপ, স্টেশন কাউন্টার বা কিয়স্ক (কিয়স্কে শুধু কার্ড)। পাসপোর্ট নম্বর লাগে। গ্রাহকসেবা: ৯২০০০৪৪৩৩।\n• ভাড়া: মক্কা–মদিনা ইকোনমি মোটামুটি ১৫০ রিয়াল থেকে; তারিখ ও মৌসুম অনুযায়ী বদলায় — বুকিংয়ের সময় দেখে নিন। শিশু ও বিশেষ চাহিদাসম্পন্ন যাত্রীদের ছাড় আছে।\n• লাগেজ: জনপ্রতি একটি বড় ব্যাগ (সর্বোচ্চ ২৫ কেজি, ৬৫×৫৫×৩৫ সেমি) ও একটি হাতব্যাগ; সিল করা জমজমের বোতল এই ২৫ কেজির মধ্যেই।\n• প্রায় ৩০ মিনিট আগে পৌঁছান, পাসপোর্ট সঙ্গে রাখুন। হুইলচেয়ারের জায়গা শুধু বিজনেস ক্লাসে — বুকিংয়ে উল্লেখ করুন।\n• মক্কা স্টেশন হারাম থেকে প্রায় ৩–৩.৫ কিমি (ট্যাক্সিতে ১৫–২০ মিনিট; মক্কা বাসও যায়)। মদিনা স্টেশন মসজিদে নববী থেকে কয়েক কিলোমিটার দূরে — ট্যাক্সি বা অ্যাপে ১৫–২০ মিনিট।",
          en: "Stations: Makkah (Rusaifah), Jeddah Al-Sulaimaniyah, Jeddah airport (inside Terminal 1), King Abdullah Economic City and Madinah.\n• Times: Makkah–Madinah about 2 h to 2 h 45 min; Makkah–Jeddah airport about 35–50 min; airport–Madinah about 2 h.\n• Tickets: sar.hhr.sa, the HHR Train app, station counters or kiosks (cards only at kiosks). You need your passport number. Customer care: 920 004 433.\n• Fares: Makkah–Madinah economy from roughly SAR 150; they change by date and season — check when booking. Children and passengers with special needs get discounts.\n• Luggage: one large bag per passenger (max 25 kg, 65×55×35 cm) plus one hand item; sealed Zamzam bottles count within the 25 kg.\n• Arrive about 30 minutes early and carry your passport. Wheelchair spaces are in business class only — tick special needs when booking.\n• Makkah station is about 3–3.5 km from the Haram (15–20 min by taxi; Makkah Bus also runs there). Madinah station is several km from the Prophet's Mosque — 15–20 min by taxi or ride app.",
        },
        warn: { bn: "মৌসুমে টিকিট তাড়াতাড়ি শেষ হয় — অন্তত এক দিন আগে বুক করুন।", en: "Trains sell out in peak season — book at least a day ahead." },
        sources: [
          { label: "Haramain High Speed Railway (official)", url: "https://sar.hhr.sa/" },
          { label: "Gulf News – Haramain railway guide", url: "https://gulfnews.com/living-in-uae/transport/all-you-need-to-know-about-saudi-arabias-haramain-high-speed-rail-hhr-1.500224470", date: "Aug 2025" },
          { label: "Wego – Haramain railway", url: "https://blog.wego.com/haramain-high-speed-railway/", date: "Sep 2026" },
        ],
      },
      {
        id: "makkah-bus",
        title: { bn: "মক্কা বাস", en: "Makkah Bus" },
        body: {
          bn: "১২টি রুট, ৪০০-র বেশি বাস, ২৪ ঘণ্টা চলে; রুটগুলো হারামের কাছের স্টেশনে যায় (যেমন জাবাল ওমর, জাবাল আল-কাবা)।\n• সাধারণ একবারের ভাড়া প্রায় ৪ রিয়াল; ডে/উইক পাস অ্যাপে। টিকিট বাসে, মেশিনে বা “Makkah Bus” অ্যাপে — অ্যাপে লাইভ ম্যাপ ও রুট পরিকল্পনাও আছে।",
          en: "12 routes, 400+ buses, running 24/7; routes reach stations near the Haram (e.g. Jabal Omar, Jabal Al-Kaaba).\n• A regular single trip is about SAR 4; day/week passes in the app. Buy on the bus, at machines or in the “Makkah Bus” app — which also has a live map and route planner.",
        },
        warn: { bn: "পাসের দাম বিভিন্ন সূত্রে আলাদা — অ্যাপে দেখে নিন।", en: "Pass prices differ between sources — check the app." },
        sources: [
          { label: "Arab News – Makkah Bus network", url: "https://www.arabnews.pk/node/2628963", date: "Jan 2026" },
          { label: "Gulf News – Makkah Bus fares", url: "https://gulfnews.com/living-in-uae/ask-us/budget-travel-in-makkah-how-umrah-pilgrims-can-save-with-the-public-bus-system-1.1726744962597", date: "Sep 2024" },
          { label: "Makkah Bus app (App Store)", url: "https://apps.apple.com/us/app/makkah-bus/id1609922603" },
        ],
      },
      {
        id: "madinah-bus",
        title: { bn: "মদিনা বাস", en: "Madinah Bus" },
        body: {
          bn: "• রুট ৪০০: মদিনা বিমানবন্দর ↔ মসজিদে নববী, ২৪ ঘণ্টা।\n• রুট ৩০০: হারামাইন ট্রেন স্টেশন ↔ মসজিদে নববী।\n• অন্য রুটে মসজিদে নববী, কুবা, বিমানবন্দর ও স্টেশন যুক্ত। টিকিট বাসে বা অ্যাপে; সাধারণ রুট প্রায় ৩.৪৫ রিয়াল, ৩০০/৪০০ রুট প্রায় ১১.৫ রিয়াল।",
          en: "• Route 400: Madinah airport ↔ the Prophet's Mosque, 24 hours.\n• Route 300: Haramain train station ↔ the Prophet's Mosque.\n• Other routes link the Prophet's Mosque, Quba, the airport and the station. Tickets on the bus or in the app; regular routes about SAR 3.45, routes 300/400 about SAR 11.5.",
        },
        sources: [
          { label: "Madhyamam – Route 400", url: "https://originen.madhyamam.com/middle-east/saudi-arabia/madinahs-route-400-offers-24-hour-link-between-airport-and-prophets-mosque-1526823", date: "Jun 2026" },
          { label: "Visit Madinah – Madinah Bus", url: "https://visitmadinahsa.com/sa-en/destinations/Madinah-bus" },
          { label: "KSA Expats – Madinah bus fares", url: "https://ksaexpats.com/madinah-buses-routes-schedules-ticket-prices/", date: "Jan 2025" },
        ],
      },
      {
        id: "taxi",
        title: { bn: "ট্যাক্সি ও রাইড অ্যাপ", en: "Taxis & ride apps" },
        body: {
          bn: "• Uber ও Careem মক্কা, মদিনা ও জেদ্দায় চলে; Careem-এ নগদেও দেওয়া যায়। অ্যাপ চালাতে সৌদি সিমের ডেটা লাগে।\n• হারামের গেটের সামনে থেকে গাড়ি তুলতে পারে না — কাছাকাছি একটা জায়গা ঠিক করুন, নামাজের সময় ৫–১০ মিনিট বেশি ধরুন।\n• বিমানবন্দরে অফিসিয়াল সাদা ট্যাক্সি মিটারে চলে — উঠার আগে মিটার বা ভাড়া ঠিক করে নিন।",
          en: "• Uber and Careem work in Makkah, Madinah and Jeddah; Careem also takes cash. You need Saudi SIM data to use them.\n• Cars can't pick up right at the Haram gates — agree a nearby meeting point and allow 5–10 extra minutes at prayer times.\n• Official white airport taxis use the meter — agree the meter or fare before getting in.",
        },
        sources: [
          { label: "House of Saud – Uber & Careem in Saudi", url: "https://houseofsaud.com/travel/saudi-uber-careem/", date: "Apr 2026" },
          { label: "HalalBooking – Makkah transport", url: "https://halalbooking.com/umrah/makkah/transport" },
        ],
      },
      {
        id: "airports",
        title: { bn: "বিমানবন্দর থেকে হারামে", en: "From the airports to the Haram" },
        body: {
          bn: "• জেদ্দা: টার্মিনাল ১-এর ভেতরেই ট্রেন স্টেশন — মক্কা প্রায় ৩৫–৫০ মিনিট, মদিনা প্রায় ২ ঘণ্টা। নর্থ টার্মিনাল ও হজ টার্মিনাল থেকে ট্রেনে উঠতে আগে টার্মিনাল ১-এ যেতে হয় (২০–৩০ মিনিট বাড়তি)। সড়কে মক্কা প্রায় ৮৫–৯০ কিমি, ১–১.৫ ঘণ্টা।\n• মদিনা বিমানবন্দর: মসজিদে নববী প্রায় ১৫ কিমি — ট্যাক্সিতে ২০–৩৫ মিনিট (নামাজের সময় বেশি), বা ২৪ ঘণ্টার বাস রুট ৪০০। মদিনার ট্রেন স্টেশন বিমানবন্দরে নয়।",
          en: "• Jeddah: the train station is inside Terminal 1 — Makkah in about 35–50 min, Madinah in about 2 h. From the North Terminal or the Hajj Terminal you first get to Terminal 1 (allow 20–30 extra min). By road Makkah is about 85–90 km, 1–1.5 h.\n• Madinah airport: the Prophet's Mosque is about 15 km away — 20–35 min by taxi (longer at prayer times), or the 24-hour bus Route 400. Madinah's train station is not at the airport.",
        },
        sources: [
          { label: "House of Saud – Jeddah airport guide", url: "https://houseofsaud.com/travel/jeddah-airport-guide/", date: "Apr 2026" },
          { label: "HalalBooking – Madinah transport", url: "https://halalbooking.com/en/umrah/madinah/transport" },
        ],
      },
    ],
  },
  {
    id: "money",
    icon: "💰",
    title: { bn: "টাকা-পয়সা", en: "Money" },
    summary: { bn: "রিয়াল, কার্ড, এক্সচেঞ্জ, কাস্টমস ঘোষণা", en: "Riyal, cards, exchange, customs declaration" },
    items: [
      {
        id: "money-basics",
        title: { bn: "রিয়াল, কার্ড ও এক্সচেঞ্জ", en: "Riyal, cards & exchange" },
        body: {
          bn: "• মুদ্রা সৌদি রিয়াল (SAR); প্রায় সব কেনাকাটায় ১৫% ভ্যাট দামের মধ্যে থাকে।\n• টাকা বদলান বিমানবন্দরে, হারামের আশপাশের লাইসেন্সপ্রাপ্ত মানি এক্সচেঞ্জে বা ব্যাংকে — দোকানভেদে রেট আলাদা, তুলনা করে নিন।\n• কার্ড ও মোবাইল পেমেন্ট ব্যাপকভাবে চলে; সৌদির মাদা নেটওয়ার্কে Google Pay চালু হয়েছে। ছোট কেনাকাটা ও দানের জন্য কিছু নগদ রাখুন।",
          en: "• The currency is the Saudi riyal (SAR); 15% VAT is included in most prices.\n• Exchange money at the airport, at licensed exchangers around the Haram or at banks — rates differ, so compare.\n• Cards and mobile payments are widely accepted; Google Pay now runs on Saudi Arabia's mada network. Keep some cash for small purchases and charity.",
        },
        sources: [
          { label: "SAMA – Google Pay on mada", url: "https://www.sama.gov.sa/en-US/News/Pages/news-1100.aspx", date: "15 Sep 2025" },
          { label: "ZATCA – VAT 15%", url: "https://zatca.gov.sa/ar/HelpCenter/guidelines/Documents/VAT15.pdf" },
        ],
      },
      {
        id: "customs",
        title: { bn: "কাস্টমসে ঘোষণা (৪০,০০০ রিয়াল)", en: "Customs declaration (SAR 40,000)" },
        body: {
          bn: "নগদ টাকা, সোনা, মূল্যবান ধাতু, রত্ন বা গয়না মিলিয়ে ৪০,০০০ রিয়াল বা তার বেশি থাকলে প্রবেশ ও প্রস্থানে ঘোষণা দিতে হয় (আগে সীমা ছিল ৬০,০০০)। ঘোষণা ZATCA-র অনলাইন সেবায় করা যায়।",
          en: "If you carry SAR 40,000 or more in cash, gold, precious metals, gemstones or jewellery combined, you must declare it on entry and exit (the limit used to be SAR 60,000). You can declare through ZATCA's e-service.",
        },
        sources: [
          { label: "ZATCA – declaration e-service", url: "https://zatca.gov.sa/en/eServices/Pages/eservices-217.aspx" },
          { label: "Wego – SAR 40,000 threshold", url: "https://blog.wego.com/saudi-arabia-travellers-must-declare-cash-and-gold/", date: "Jun 2026" },
        ],
      },
    ],
  },
  {
    id: "health",
    icon: "🩺",
    title: { bn: "স্বাস্থ্য ও টিকা", en: "Health & vaccines" },
    summary: { bn: "বাধ্যতামূলক টিকা, ওষুধ নেওয়া, গরমে সাবধানতা", en: "Required vaccine, carrying medicines, heat safety" },
    items: [
      {
        id: "vaccine",
        title: { bn: "মেনিনজাইটিস টিকা — বাধ্যতামূলক", en: "Meningitis vaccine — required" },
        body: {
          bn: "সৌদি স্বাস্থ্য মন্ত্রণালয়ের ১৪৪৭ হিজরির নিয়ম অনুযায়ী সব উমরাহযাত্রীর মেনিনজোকক্কাল (ACYW) টিকা লাগে — পৌঁছানোর অন্তত ১০ দিন আগে দেওয়া। কনজুগেট টিকা ৫ বছর, পলিস্যাকারাইড টিকা ৩ বছর বৈধ; সার্টিফিকেটে ধরন না লেখা থাকলে ৩ বছর ধরা হয়।\n• বাংলাদেশিদের জন্য পোলিও বা ইয়েলো ফিভার টিকার শর্ত নেই।\n• কোভিড-১৯ ও মৌসুমি ফ্লুর টিকা সবার জন্য সুপারিশকৃত।",
          en: "Under the Saudi Ministry of Health's 1447 AH rules every Umrah traveller needs a meningococcal (ACYW) vaccine — given at least 10 days before arrival. Conjugate vaccine is valid 5 years, polysaccharide 3 years; if the certificate doesn't state the type, it counts as 3 years.\n• There is no polio or yellow fever requirement for travellers from Bangladesh.\n• COVID-19 and seasonal flu vaccines are recommended for everyone.",
        },
        sources: [{ label: "Saudi MoH – Health requirements for Umrah 1447H (PDF)", url: "https://www.moh.gov.sa/en/HealthAwareness/Pilgrims-Health/Documents/Health-Regulations-Umrah-EN.pdf", date: "2026" }],
      },
      {
        id: "medicines",
        title: { bn: "ওষুধ সঙ্গে নেওয়া", en: "Taking medicines" },
        body: {
          bn: "• নিয়মিত ওষুধ পুরো সফরের মতো নিন, মূল প্যাকেটে, সঙ্গে রোগের কাগজপত্র।\n• নিয়ন্ত্রিত (ঘুমের, মানসিক রোগের, ব্যথানাশক মাদক-জাতীয়) ওষুধের জন্য যাত্রার আগে সৌদি খাদ্য ও ওষুধ কর্তৃপক্ষের (SFDA) অনুমতি লাগে — cds.sfda.gov.sa-তে আবেদন; পাসপোর্ট, গত ৬ মাসের প্রেসক্রিপশন ও ওষুধের ছবি লাগে; সর্বোচ্চ ৩০ দিনের পরিমাণ।",
          en: "• Bring enough of your regular medicines for the whole trip, in original packaging, with documents about your condition.\n• Controlled medicines (some sleeping, psychiatric or narcotic pain medicines) need a Saudi Food and Drug Authority (SFDA) permit before travel — apply at cds.sfda.gov.sa with your passport, a prescription from the last 6 months and photos of the medicine; at most a 30-day supply.",
        },
        sources: [
          { label: "SFDA – controlled medicines for travellers", url: "https://www.sfda.gov.sa/en/news/5521869", date: "5 May 2026" },
          { label: "Saudi MoH – Umrah health requirements", url: "https://www.moh.gov.sa/en/HealthAwareness/Pilgrims-Health/Documents/Health-Regulations-Umrah-EN.pdf" },
        ],
      },
      {
        id: "heat",
        title: { bn: "গরমে সাবধান", en: "Heat safety" },
        body: {
          bn: "• সকাল ১০টা থেকে বিকেল ৪টা সরাসরি রোদ এড়িয়ে চলুন, ছাতা ব্যবহার করুন।\n• পিপাসা না পেলেও বারবার পানি পান করুন; হালকা, ঢিলা, হালকা রঙের কাপড় পরুন।\n• মাথাব্যথা, মাথা ঘোরা, অতিরিক্ত ঘাম বা বমিভাব হলে সঙ্গে সঙ্গে ছায়ায় যান ও শরীর ঠান্ডা করুন।\n• স্বাস্থ্য পরামর্শ: ৯৩৭ (২৪ ঘণ্টা)।",
          en: "• Avoid direct sun from 10:00 to 16:00 and use an umbrella.\n• Drink often even when not thirsty; wear light, loose, pale clothes.\n• With headache, dizziness, heavy sweating or nausea, get into the shade and cool down at once.\n• Health advice line: 937 (24/7).",
        },
        sources: [
          { label: "Saudi MoH – heat advice", url: "https://www.moh.gov.sa/en/ministry/mediacenter/news/pages/news-2025-06-3-001.aspx", date: "Jun 2025" },
          { label: "Saudi MoH – contact (937)", url: "https://www.moh.gov.sa/en/ministry/about/pages/contactus.aspx" },
        ],
      },
    ],
  },
  {
    id: "emergency",
    icon: "🆘",
    title: { bn: "জরুরি নম্বর ও সহায়তা", en: "Emergency numbers & help" },
    summary: { bn: "৯১১, হারানো-প্রাপ্তি, দূতাবাস, হজ অফিস", en: "911, lost & found, embassy, Hajj office" },
    items: [
      {
        id: "numbers",
        title: { bn: "জরুরি নম্বর", en: "Emergency numbers" },
        body: {
          bn: "• ৯১১ — মক্কা ও মদিনা অঞ্চলে একীভূত জরুরি নম্বর (পুলিশ, অ্যাম্বুলেন্স, অগ্নি)।\n• আলাদা নম্বরও আছে: ৯৯৭ অ্যাম্বুলেন্স (রেড ক্রিসেন্ট), ৯৯৮ সিভিল ডিফেন্স, ৯৯৯ পুলিশ, ৯৯৩ ট্রাফিক।\n• ৯৩৭ — স্বাস্থ্য মন্ত্রণালয়ের পরামর্শ, ২৪ ঘণ্টা।",
          en: "• 911 — the unified emergency number in the Makkah and Madinah regions (police, ambulance, fire).\n• Separate numbers also exist: 997 ambulance (Red Crescent), 998 civil defence, 999 police, 993 traffic.\n• 937 — Ministry of Health advice, 24/7.",
        },
        sources: [
          { label: "Saudi Press Agency – 911 regions", url: "https://www.spa.gov.sa/en/N2525906", date: "Mar 2026" },
          { label: "Gulf News – Saudi phone numbers", url: "https://gulfnews.com/living-in-uae/ask-us/saudi-arabia-19-telephone-numbers-every-tourist-and-resident-must-save-1.1681300190393", date: "2023" },
        ],
      },
      {
        id: "haram-help",
        title: { bn: "হারামে হারানো-প্রাপ্তি ও চিকিৎসা", en: "Lost & found and medical help at the Haram" },
        body: {
          bn: "• মসজিদুল হারাম: “গেস্ট কেয়ার সেন্টার” ২৪ ঘণ্টা খোলা — হারানো জিনিস, লাগেজ রাখা, এবং হারিয়ে যাওয়া নারী ও শিশুদের গ্রহণ করে।\n• হারামের করিডোরে জরুরি চিকিৎসা কেন্দ্র আছে; কাছে আজইয়াদ জরুরি হাসপাতাল (২৪ ঘণ্টা)।\n• সঙ্গীদের সঙ্গে আগে থেকে একটি দেখা করার নির্দিষ্ট গেট ঠিক করুন; শিশুদের পকেটে আপনার নাম, হোটেল ও ফোন নম্বর লিখে দিন।",
          en: "• Masjid al-Haram: the Guest Care Center is open 24 hours — lost property, luggage storage, and it receives lost women and children.\n• There are emergency medical centres in the Haram's corridors; Ajyad Emergency Hospital nearby is open 24 hours.\n• Agree a fixed gate as a meeting point with your group; put your name, hotel and phone number in your children's pockets.",
        },
        sources: [
          { label: "Saudi Press Agency – Guest Care Center", url: "https://www.spa.gov.sa/en/N2374461", date: "Aug 2025" },
          { label: "Saudi MoH – Grand Mosque medical centres", url: "https://www.moh.gov.sa/en/ministry/mediacenter/news/pages/news-2024-03-13-001.aspx", date: "Mar 2024" },
        ],
      },
      {
        id: "bangladesh",
        title: { bn: "বাংলাদেশ দূতাবাস ও হজ অফিস", en: "Bangladesh Embassy & Hajj office" },
        body: {
          bn: "• বাংলাদেশ দূতাবাস, রিয়াদ: +৯৬৬-১১-৪১৯-৫৩০০; ওয়েবসাইট bangladeshembassy.org.sa\n• জেদ্দার কনস্যুলেট জেনারেলের তথ্য অফিসিয়াল সাইট jeddah.mofa.gov.bd-তে দেখুন।\n• বাংলাদেশ হজ কল সেন্টার: দেশে ১৬১৩৬, বিদেশ থেকে +৮৮০৯৬০২৬৬৬৭০৭। মক্কা-মদিনার হজ অফিসের নম্বরগুলো শুধু হজ মৌসুমে চালু থাকে।",
          en: "• Bangladesh Embassy, Riyadh: +966-11-419-5300; website bangladeshembassy.org.sa\n• For the Consulate General in Jeddah, see its official site jeddah.mofa.gov.bd.\n• Bangladesh Hajj call centre: 16136 within Bangladesh, +8809602666707 from abroad. The Makkah/Madinah Hajj office numbers work only in the Hajj season.",
        },
        sources: [
          { label: "MoFA Bangladesh – Embassy Riyadh", url: "https://mofa.portal.gov.bd/site/page/20776e42-7e06-40ce-a091-05c76d38f9f3" },
          { label: "Bangladesh Hajj portal – contact", url: "https://www.hajj.gov.bd/contact" },
        ],
      },
    ],
  },
  {
    id: "haram",
    icon: "🕋",
    title: { bn: "দুই হারামে নিয়মকানুন", en: "Rules in the Two Holy Mosques" },
    summary: { bn: "মাতাফ, লাগেজ, হুইলচেয়ার, গল্ফ কার্ট, আচরণ", en: "Mataf, luggage, wheelchairs, carts, conduct" },
    items: [
      {
        id: "mataf",
        title: { bn: "মাতাফ ও তাওয়াফ", en: "Mataf & tawaf" },
        body: {
          bn: "• কাবার চারপাশের নিচতলার মাতাফ শুধু উমরাহকারীদের জন্য সংরক্ষিত; উপরের তলাতেও তাওয়াফ করা যায় (ভিড় অনুযায়ী)।\n• মাতাফে লাগেজ নেবেন না, তাওয়াফে কাউকে ধাক্কা দেবেন না।\n• কোন তলায় ভিড় কম, তা হারামাইন কর্তৃপক্ষের অনলাইন সেবায় দেখা যায়।",
          en: "• The ground-floor Mataf around the Ka'bah is reserved for Umrah performers; tawaf is also possible on the upper floors (subject to capacity).\n• Don't bring luggage into the Mataf, and don't push others during tawaf.\n• The Haramain authority's online service shows which floors are less crowded.",
        },
        sources: [
          { label: "Ministry of Hajj and Umrah – tawaf regulations", url: "https://haj.gov.sa/en/Media-Center/Ministry-News/2026/Ministry-of-Hajj-and-Umrah-Adherence-to-Tawaf-Regulations-Enhances-Movement-Flow", date: "10 Mar 2026" },
          { label: "Al-Haramain – crowd density", url: "https://alharamain.gov.sa/public/?module=module_794625" },
        ],
      },
      {
        id: "luggage",
        title: { bn: "লাগেজ ও ব্যাগ", en: "Luggage & bags" },
        body: {
          bn: "• মসজিদুল হারাম: বিনামূল্যে ২৪ ঘণ্টার লাগেজ রাখার ব্যবস্থা (কিউআর ট্যাগ ও রিস্টব্যান্ড) — মক্কা লাইব্রেরির কাছে, গেস্ট কেয়ার সেন্টারে ও আজইয়াদ সড়কের কিছু পয়েন্টে।\n• মসজিদে নববী: নামাজের জায়গায় স্যুটকেস ও ব্যাগ নিষিদ্ধ — চত্বরের লকার/সেফটি বক্স ব্যবহার করুন।",
          en: "• Masjid al-Haram: free 24-hour luggage storage (QR tag and wristband) — near Makkah Library, at the Guest Care Center and at points on Ajyad Street.\n• The Prophet's Mosque: suitcases and bags are not allowed in prayer areas — use the safety boxes in the courtyards.",
        },
        sources: [
          { label: "Saudi Press Agency – luggage storage", url: "https://www.spa.gov.sa/en/N2341787", date: "Jun 2025" },
          { label: "Arabian Business – bags at the Prophet's Mosque", url: "https://arabianbusiness.com/culture-society/saudi-arabia-bans-luggage-in-prophets-mosque" },
        ],
      },
      {
        id: "mobility",
        title: { bn: "হুইলচেয়ার ও গল্ফ কার্ট", en: "Wheelchairs & golf carts" },
        body: {
          bn: "• মসজিদুল হারাম: নির্ধারিত জায়গায় ২৪ ঘণ্টা বিনামূল্যে হুইলচেয়ার — যেমন বাবুস সালাম (১৯ নম্বর গেট) ও শুবাইকা ব্রিজ; মাসআর নিচতলা (১৪ নম্বর গেট) ইত্যাদিতে ভাড়ায়ও পাওয়া যায়।\n• ইলেকট্রিক/গল্ফ কার্ট শুধু বয়স্ক ও প্রতিবন্ধীদের জন্য — Tanaqol অ্যাপ বা carts.alharamain.gov.sa-তে আগে বুক করুন।\n• মসজিদে নববী: চত্বরে গল্ফ কার্ট চলে, প্রতিদিন হাজারখানেক হুইলচেয়ার দেওয়া হয়।",
          en: "• Masjid al-Haram: free wheelchairs 24 hours at designated points — e.g. Bab As-Salam (Gate 19) and Shubaika Bridge; paid ones too, e.g. on the Mas'a ground floor (Gate 14).\n• Electric/golf carts are for the elderly and people with disabilities only — book ahead in the Tanaqol app or at carts.alharamain.gov.sa.\n• The Prophet's Mosque: golf carts run in the courtyards and about a thousand wheelchairs are handed out daily.",
        },
        sources: [
          { label: "Saudi Press Agency – free wheelchairs", url: "https://spa.gov.sa/en/N2151450", date: "Aug 2024" },
          { label: "Gulf News – wheelchair points", url: "https://gulfnews.com/world/gulf/saudi/saudi-arabia-free-and-paid-wheelchair-rentals-at-grand-mosque-1.1723281407506", date: "Aug 2024" },
          { label: "Saudi Press Agency – golf carts", url: "https://www.spa.gov.sa/en/N2321376", date: "May 2025" },
          { label: "Saudi Press Agency – Prophet's Mosque mobility", url: "https://www.spa.gov.sa/en/N2070131", date: "Mar 2024" },
        ],
      },
      {
        id: "conduct",
        title: { bn: "আচরণ ও পোশাক", en: "Conduct & dress" },
        body: {
          bn: "• প্রবেশপথ, করিডোর ও জরুরি বহির্গমনে দাঁড়িয়ে বা বসে থাকবেন না।\n• ব্যস্ত নামাজের সময় ভিড়ের জায়গায় শিশুদের না নেওয়াই ভালো।\n• অস্ত্র, ধূমপান, ভিক্ষা ও অনুমতিহীন বিক্রি নিষিদ্ধ।\n• ইহরামে সুগন্ধিমুক্ত সাবান-ক্রিম ব্যবহার করুন; মোবাইল কম ব্যবহার করুন, অন্যের ইবাদতে ব্যাঘাত ঘটাবেন না।",
          en: "• Don't stand or sit in entrances, corridors or emergency exits.\n• Avoid bringing children into crowded areas at peak prayers.\n• Weapons, smoking, begging and unlicensed selling are prohibited.\n• In ihram use fragrance-free soap and creams; keep phone use to a minimum and don't disturb others' worship.",
        },
        sources: [
          { label: "Ministry of Hajj and Umrah – Umrah guide (PDF)", url: "https://haj.gov.sa/-/media/Project/HAJJ/Awareness-Guides/Umrah-Guide-for-Domestic-Pilgrims/EN-Umrah-Guide-for-Domestic-Pilgrims.pdf", date: "2026" },
          { label: "Gulf News – Ramadan 2026 guidelines", url: "https://gulfnews.com/world/gulf/saudi/ramadan-2026-new-guidelines-announced-for-umrah-pilgrims-in-saudi-arabia-1.500451116", date: "Feb 2026" },
        ],
      },
    ],
  },
  {
    id: "zamzam",
    icon: "💧",
    title: { bn: "জমজম দেশে নেওয়া", en: "Taking Zamzam home" },
    summary: { bn: "৫ লিটার সিল করা কার্টন, কোথা থেকে কিনবেন", en: "5-litre sealed carton, where to buy" },
    items: [
      {
        id: "zamzam-flight",
        title: { bn: "বিমানে জমজম", en: "Zamzam on flights" },
        body: {
          bn: "• সাধারণ নিয়ম: বিমানবন্দরের কাউন্টার থেকে কেনা কারখানায় সিল করা ৫ লিটারের একটি বোতল/কার্টন, চেক-ইনের সময় আলাদা করে জমা — স্যুটকেসের ভেতরে বা হাতব্যাগে নয়।\n• অনেক এয়ারলাইন এটিকে বাড়তি একটি ফ্রি পিস হিসেবে নেয়; flynas জনপ্রতি সর্বোচ্চ ৫ লিটার নেয়। বিমান বাংলাদেশসহ প্রতিটি এয়ারলাইনের নিয়ম আলাদা — টিকিটে বা এয়ারলাইনে জেনে নিন।\n• শুধু কিং আবদুল্লাহ জমজম প্রকল্প (কুদাই, মক্কা) বা এর অনুমোদিত বিক্রয়কেন্দ্র থেকে কিনুন।",
          en: "• The usual rule: one factory-sealed 5-litre bottle/carton bought at the airport counter, handed in separately at check-in — not inside a suitcase or in the cabin.\n• Many airlines take it as a free extra piece; flynas allows at most 5 litres per passenger. Rules differ by airline, Biman Bangladesh included — check your ticket or the airline.\n• Buy only from the King Abdullah Zamzam project (Kudai, Makkah) or its approved outlets.",
        },
        sources: [
          { label: "flynas – conditions of carriage (PDF)", url: "https://help.flynas.com/terms-and-conditions/EN-Terms-and-Conditions-of-Carriage.pdf", date: "Jun 2025" },
          { label: "Wego – Zamzam on flights", url: "https://blog.wego.com/zamzam-water-on-flights/", date: "May 2026" },
          { label: "Saudi Press Agency – Zamzam outlets", url: "https://www.spa.gov.sa/en/345dcac636x", date: "2023" },
        ],
      },
    ],
  },
  {
    id: "practical",
    icon: "🔌",
    title: { bn: "দরকারি টুকিটাকি", en: "Practical basics" },
    summary: { bn: "প্লাগ, সময়, আবহাওয়া, দরকারি অ্যাপ", en: "Plugs, time, weather, useful apps" },
    items: [
      {
        id: "plugs-time",
        title: { bn: "প্লাগ, বিদ্যুৎ ও সময়", en: "Plugs, power & time" },
        body: {
          bn: "• প্লাগ টাইপ G (তিন পিনের ব্রিটিশ), ২৩০ ভোল্ট — বাংলাদেশের দুই পিনের চার্জারের জন্য অ্যাডাপ্টার নিন।\n• সৌদি সময় বাংলাদেশের চেয়ে ৩ ঘণ্টা পিছিয়ে (UTC+3), ডেলাইট সেভিং নেই।",
          en: "• Plug type G (British 3-pin), 230 V — bring an adapter for two-pin Bangladeshi chargers.\n• Saudi time is 3 hours behind Bangladesh (UTC+3), with no daylight saving.",
        },
        sources: [{ label: "World Standards – Saudi Arabia", url: "https://www.worldstandards.eu/electricity/plug-voltage-by-country/saudi-arabia/", date: "Jul 2025" }],
      },
      {
        id: "weather",
        title: { bn: "আবহাওয়া (গড় সর্বোচ্চ/সর্বনিম্ন °সে)", en: "Weather (average high/low °C)" },
        body: { bn: "মক্কা সারা বছর গরম; মদিনায় শীতের রাত বেশ ঠান্ডা — হালকা গরম কাপড় নিন।", en: "Makkah is hot all year; winter nights in Madinah are noticeably cool — pack a light warm layer." },
        table: {
          head: [{ bn: "মাস", en: "Month" }, { bn: "মক্কা", en: "Makkah" }, { bn: "মদিনা", en: "Madinah" }],
          rows: [
            [{ bn: "জানুয়ারি", en: "January" }, "31 / 19", "24 / 12"],
            [{ bn: "এপ্রিল", en: "April" }, "39 / 25", "36 / 22"],
            [{ bn: "জুন", en: "June" }, "44 / 29", "43 / 29"],
            [{ bn: "আগস্ট", en: "August" }, "43 / 30", "44 / 31"],
            [{ bn: "অক্টোবর", en: "October" }, "40 / 27", "37 / 24"],
            [{ bn: "ডিসেম্বর", en: "December" }, "33 / 21", "26 / 14"],
          ],
          note: { bn: "১৯৯১–২০২০ সালের গড়।", en: "1991–2020 averages." },
        },
        sources: [
          { label: "Wikipedia – Mecca climate", url: "https://en.wikipedia.org/wiki/Mecca" },
          { label: "Wikipedia – Medina climate", url: "https://en.wikipedia.org/wiki/Medina" },
        ],
      },
      {
        id: "apps",
        title: { bn: "দরকারি অ্যাপ", en: "Useful apps" },
        body: {
          bn: "• নুসুক — উমরাহ পারমিট, রওজার পারমিট, প্যাকেজ।\n• HHR Train — হারামাইন ট্রেনের টিকিট।\n• Makkah Bus ও মদিনা বাস অ্যাপ — রুট ও টিকিট।\n• Uber / Careem — ট্যাক্সি।\n• Tanaqol — হারামে গল্ফ কার্ট বুকিং।\n• Tawakkalna — বাধ্যতামূলক নয়, তবে নুসুক পারমিট ও ডিজিটাল পরিচয় দেখায়।",
          en: "• Nusuk — Umrah permit, Rawdah permit, packages.\n• HHR Train — Haramain train tickets.\n• Makkah Bus and Madinah Bus apps — routes and tickets.\n• Uber / Careem — taxis.\n• Tanaqol — golf cart booking at the Haram.\n• Tawakkalna — not required, but shows Nusuk permits and a digital ID.",
        },
        sources: [
          { label: "Nusuk (official)", url: "https://www.nusuk.sa/" },
          { label: "Wego – Tawakkalna", url: "https://blog.wego.com/tawakkalna-app-saudi-arabia/", date: "May 2026" },
        ],
      },
    ],
  },
];
