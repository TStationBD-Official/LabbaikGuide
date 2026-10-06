import type { HajjStage, LText, Reference } from "@/types/content";
import type { HajjType } from "@/stores/rituals-store";

export const HAJJ_TYPES: { id: HajjType; title: LText; description: LText; hady: boolean }[] = [
  {
    id: "tamattu",
    title: { bn: "তামাত্তু", en: "Tamattu'" },
    description: {
      bn: "হজের মাসগুলোতে প্রথমে উমরাহ করে ইহরাম খুলে ফেলা, তারপর ৮ যিলহজ নতুন করে হজের ইহরাম বাঁধা। হাদি (কুরবানি) ওয়াজিব।",
      en: "Perform Umrah in the Hajj months, exit ihram, then enter a new ihram for Hajj on 8 Dhul-Hijjah. A sacrifice (hady) is required.",
    },
    hady: true,
  },
  {
    id: "qiran",
    title: { bn: "কিরান", en: "Qiran" },
    description: {
      bn: "একই ইহরামে উমরাহ ও হজ একসাথে; কুরবানির দিন পর্যন্ত ইহরাম থাকে। হাদি ওয়াজিব।",
      en: "Umrah and Hajj together in a single ihram, which stays until the Day of Sacrifice. A sacrifice (hady) is required.",
    },
    hady: true,
  },
  {
    id: "ifrad",
    title: { bn: "ইফরাদ", en: "Ifrad" },
    description: {
      bn: "শুধু হজের ইহরাম; উমরাহ নেই। হাদি ওয়াজিব নয়।",
      en: "Ihram for Hajj only, without Umrah. No sacrifice is required.",
    },
    hady: false,
  },
];

export const HAJJ_TYPE_REFS: Reference[] = [{ label: "Sahih al-Bukhari 1562" }, { label: "Quran 2:196" }];

export const HAJJ_STAGES: (HajjStage & { onlyFor?: HajjType[] })[] = [
  {
    id: "ihram",
    title: { bn: "ইহরাম ও মীকাত", en: "Ihram & Miqat" },
    when: { bn: "৮ যিলহজ (তামাত্তু); কিরান ও ইফরাদে মীকাত থেকেই", en: "8 Dhul-Hijjah (Tamattu'); for Qiran and Ifrad, from the miqat" },
    where: { bn: "মক্কায় নিজের অবস্থানস্থল / মীকাত", en: "Your residence in Makkah / the miqat" },
    summary: { bn: "হজের নিয়ত করে ইহরাম বাঁধুন।", en: "Enter ihram with the intention of Hajj." },
    whatToDo: [
      { bn: "গোসল, সুগন্ধি (শরীরে) ও ইহরামের পোশাক — উমরাহর মতোই।", en: "Ghusl, perfume on the body, ihram clothing — as for Umrah." },
      { bn: "নিয়ত করে তালবিয়া শুরু করুন: ‘লাব্বাইকা হাজ্জান’।", en: "Make the intention and begin the Talbiyah: “Labbayka ḥajjan”." },
    ],
    whatToSay: [{ duaId: "talbiyah" }, { duaId: "ishtirat" }],
    restrictions: [
      { bn: "ইহরামের সব নিষেধাজ্ঞা প্রযোজ্য।", en: "All ihram restrictions apply." },
    ],
    checklist: [
      { bn: "ইহরামের কাপড়", en: "Ihram garments" },
      { bn: "চপ্পল, ছোট ব্যাগ, পানির বোতল", en: "Sandals, small bag, water bottle" },
      { bn: "প্রয়োজনীয় ওষুধ ও পরিচয়পত্র", en: "Essential medicines and ID card" },
    ],
    references: [{ label: "Sahih Muslim 1218" }],
  },
  {
    id: "mina-tarwiyah",
    title: { bn: "মিনা (তারবিয়ার দিন)", en: "Mina (Day of Tarwiyah)" },
    when: { bn: "৮ যিলহজ", en: "8 Dhul-Hijjah" },
    where: { bn: "মিনা", en: "Mina" },
    summary: { bn: "মিনায় রাত্রিযাপন।", en: "Stay the night in Mina." },
    whatToDo: [
      { bn: "যোহর, আসর, মাগরিব, ইশা ও পরদিনের ফজর মিনায় পড়ুন — চার রাকাতের নামাজ দুই রাকাত, তবে একত্র না করে নিজ নিজ ওয়াক্তে।", en: "Pray Dhuhr, Asr, Maghrib, Isha and next day's Fajr in Mina — four-rak'ah prayers shortened to two, each in its own time." },
      { bn: "বেশি বেশি তালবিয়া ও জিকির করুন।", en: "Recite the Talbiyah and dhikr abundantly." },
    ],
    references: [{ label: "Sahih Muslim 1218" }],
  },
  {
    id: "arafah",
    title: { bn: "আরাফাহ", en: "Arafah" },
    when: { bn: "৯ যিলহজ — সূর্য হেলে পড়া থেকে সূর্যাস্ত পর্যন্ত", en: "9 Dhul-Hijjah — from midday until sunset" },
    where: { bn: "আরাফার সীমানার ভেতরে", en: "Within the boundaries of Arafah" },
    summary: { bn: "হজের প্রধান রুকন — আরাফায় অবস্থান।", en: "The essential pillar of Hajj — standing at Arafah." },
    whatToDo: [
      { bn: "সূর্যোদয়ের পর আরাফার দিকে যান।", en: "Proceed to Arafah after sunrise." },
      { bn: "যোহর ও আসর একসাথে, সংক্ষিপ্ত করে যোহরের ওয়াক্তে পড়ুন।", en: "Pray Dhuhr and Asr combined and shortened at the time of Dhuhr." },
      { bn: "সূর্যাস্ত পর্যন্ত কিবলামুখী হয়ে দোয়া, জিকির ও ইস্তিগফারে মগ্ন থাকুন।", en: "Until sunset, face the Qibla and devote yourself to dua, dhikr and seeking forgiveness." },
    ],
    whatToSay: [{ duaId: "arafah" }],
    notes: [
      { bn: "নিশ্চিত হোন যে আপনি আরাফার সীমানার ভেতরে আছেন (উরানা উপত্যকা সীমানার বাইরে)।", en: "Make sure you are inside Arafah's boundaries (Wadi 'Uranah is outside)." },
      { bn: "হাজিদের জন্য আরাফার দিনে রোজা না রাখা সুন্নাহ।", en: "It is Sunnah for pilgrims not to fast on the Day of Arafah." },
    ],
    mistakes: [
      { bn: "সূর্যাস্তের আগে আরাফা ত্যাগ করা।", en: "Leaving Arafah before sunset." },
      { bn: "জাবালে রহমতে ওঠা জরুরি মনে করা।", en: "Believing it necessary to climb Jabal ar-Rahmah." },
    ],
    references: [{ label: "Jami' at-Tirmidhi 889", detail: "“Hajj is Arafah”" }, { label: "Sahih al-Bukhari 1988" }, { label: "Sahih Muslim 1218" }],
  },
  {
    id: "muzdalifah",
    title: { bn: "মুযদালিফা", en: "Muzdalifah" },
    when: { bn: "৯ যিলহজের দিবাগত রাত (১০ তারিখের রাত)", en: "The night after Arafah (eve of 10 Dhul-Hijjah)" },
    where: { bn: "মুযদালিফা", en: "Muzdalifah" },
    summary: { bn: "রাত্রিযাপন ও ফজরের পর জিকির।", en: "Spend the night; remembrance after Fajr." },
    whatToDo: [
      { bn: "মাগরিব ও ইশা একসাথে পড়ুন (ইশা দুই রাকাত)।", en: "Pray Maghrib and Isha together (Isha shortened to two)." },
      { bn: "রাত্রিযাপন করুন, ফজর পড়ে সূর্যোদয়ের আগ পর্যন্ত দোয়া-জিকির করুন।", en: "Spend the night; after Fajr make dua and dhikr until shortly before sunrise." },
      { bn: "কংকর মুযদালিফা বা মিনা যেকোনো জায়গা থেকে সংগ্রহ করা যায়।", en: "Pebbles may be collected in Muzdalifah or Mina." },
    ],
    whatToSay: [{ duaId: "mashar-haram" }],
    notes: [{ bn: "দুর্বল, বয়স্ক ও নারীদের জন্য মধ্যরাতের পর মিনায় চলে যাওয়ার অনুমতি আছে।", en: "The weak, elderly and women are permitted to leave for Mina after midnight." }],
    differences: [
      {
        bn: "মুযদালিফায় রাত্রিযাপনের বিধান (ওয়াজিব না সুন্নাহ) ও ন্যূনতম সময় নিয়ে মাযহাবগুলোর মধ্যে মতভেদ আছে।",
        en: "The madhhabs differ on whether staying at Muzdalifah is obligatory or Sunnah, and on its minimum duration.",
      },
    ],
    references: [{ label: "Quran 2:198" }, { label: "Sahih Muslim 1218" }, { label: "Sahih al-Bukhari 1676" }],
  },
  {
    id: "ramy-aqabah",
    title: { bn: "জামরাতুল আকাবায় রমি", en: "Ramy of Jamrat al-Aqabah" },
    when: { bn: "১০ যিলহজ (ঈদের দিন)", en: "10 Dhul-Hijjah (Day of Eid)" },
    where: { bn: "মিনা — বড় জামরা", en: "Mina — the large Jamrah" },
    summary: { bn: "সাতটি কংকর নিক্ষেপ।", en: "Throw seven pebbles." },
    whatToDo: [
      { bn: "শুধু জামরাতুল আকাবায় একটি একটি করে সাতটি কংকর নিক্ষেপ করুন, প্রতিটিতে তাকবির।", en: "Throw seven pebbles one by one at Jamrat al-Aqabah only, with takbir for each." },
      { bn: "রমি শুরু করলে তালবিয়া বন্ধ করুন।", en: "Stop the Talbiyah when you begin this Ramy." },
    ],
    whatToSay: [{ duaId: "ramy-takbir" }],
    mistakes: [
      { bn: "জুতা বা বড় পাথর ছোড়া, রাগ নিয়ে নিক্ষেপ করা।", en: "Throwing shoes or large stones, or throwing in anger." },
      { bn: "সাতটি কংকর একসাথে ছোড়া।", en: "Throwing all seven pebbles at once." },
    ],
    references: [{ label: "Sahih Muslim 1218" }, { label: "Sahih al-Bukhari 1751" }],
  },
  {
    id: "hady",
    title: { bn: "হাদি (কুরবানি)", en: "Hady (Sacrifice)" },
    when: { bn: "১০ থেকে ১৩ যিলহজ", en: "10–13 Dhul-Hijjah" },
    where: { bn: "হারামের সীমানার ভেতরে (সাধারণত অনুমোদিত ব্যাংক/কুপনের মাধ্যমে)", en: "Within the Haram boundaries (usually via authorised bank/coupon)" },
    summary: { bn: "তামাত্তু ও কিরান হাজিদের জন্য ওয়াজিব।", en: "Required for Tamattu' and Qiran pilgrims." },
    whatToDo: [
      { bn: "কুরবানি করুন বা অনুমোদিত মাধ্যমে ব্যবস্থা করুন।", en: "Offer the sacrifice or arrange it through an authorised channel." },
      { bn: "সামর্থ্য না থাকলে হজে ৩ দিন ও বাড়ি ফিরে ৭ দিন রোজা।", en: "If unable, fast 3 days during Hajj and 7 on returning home." },
    ],
    references: [{ label: "Quran 2:196" }],
    onlyFor: ["tamattu", "qiran"],
  },
  {
    id: "halq",
    title: { bn: "হলক / কসর", en: "Halq / Qasr" },
    when: { bn: "১০ যিলহজ, রমির পর", en: "10 Dhul-Hijjah, after Ramy" },
    where: { bn: "মিনা বা মক্কা", en: "Mina or Makkah" },
    summary: { bn: "প্রথম হালাল (তাহাল্লুল)।", en: "First release from ihram (tahallul)." },
    whatToDo: [
      { bn: "পুরুষ মুণ্ডন (উত্তম) বা চুল ছোট করবেন; নারী আঙুলের এক কর পরিমাণ কাটবেন।", en: "Men shave (better) or shorten; women cut a fingertip's length." },
      { bn: "এরপর স্বামী-স্ত্রীর মিলন ছাড়া ইহরামের অন্যান্য নিষেধাজ্ঞা উঠে যায়।", en: "After this, all ihram restrictions are lifted except marital relations." },
    ],
    differences: [
      {
        bn: "১০ তারিখের কাজগুলোর (রমি, কুরবানি, হলক, তাওয়াফ) ক্রম রক্ষা ওয়াজিব কি না, তা নিয়ে মতভেদ আছে; হাদিসে আগে-পরে করায় ‘কোনো অসুবিধা নেই’ বলা হয়েছে।",
        en: "Scholars differ on whether the order of the Day-10 rites (Ramy, sacrifice, shaving, Tawaf) is obligatory; the Prophet ﷺ said “no harm” to those who changed the order.",
      },
    ],
    references: [{ label: "Sahih al-Bukhari 1727" }, { label: "Sahih al-Bukhari 1736" }],
  },
  {
    id: "ifadah",
    title: { bn: "তাওয়াফে ইফাদা ও সাঈ", en: "Tawaf al-Ifadah & Sa'i" },
    when: { bn: "১০ যিলহজ বা তার পরে", en: "10 Dhul-Hijjah or after" },
    where: { bn: "মসজিদুল হারাম", en: "Masjid al-Haram" },
    summary: { bn: "হজের রুকন তাওয়াফ, প্রযোজ্য হলে সাঈ।", en: "The pillar Tawaf of Hajj, then Sa'i where applicable." },
    whatToDo: [
      { bn: "সাধারণ পোশাকে সাত চক্কর তাওয়াফ (রমল ও ইদতিবা নেই)।", en: "Seven circuits in normal clothes (no raml or idtiba')." },
      { bn: "তামাত্তু: হজের সাঈ করুন। কিরান/ইফরাদ: তাওয়াফে কুদুমের পর সাঈ না করে থাকলে এখন করুন।", en: "Tamattu': perform the Sa'i of Hajj. Qiran/Ifrad: perform Sa'i now if not done after Tawaf al-Qudum." },
      { bn: "এরপর পূর্ণ হালাল।", en: "After this, the release from ihram is complete." },
    ],
    whatToSay: [{ duaId: "rabbana-atina" }, { duaId: "safa-marwah-dhikr" }],
    references: [{ label: "Quran 22:29" }, { label: "Sahih Muslim 1218" }],
    counter: "tawaf",
  },
  {
    id: "tashreeq",
    title: { bn: "আইয়ামে তাশরিক — মিনা ও তিন জামরায় রমি", en: "Days of Tashreeq — Mina & Ramy of the three Jamarat" },
    when: { bn: "১১, ১২ (ও ইচ্ছা করলে ১৩) যিলহজ, সূর্য হেলে পড়ার পর", en: "11, 12 (and optionally 13) Dhul-Hijjah, after midday" },
    where: { bn: "মিনা", en: "Mina" },
    summary: { bn: "মিনায় রাত্রিযাপন ও প্রতিদিন তিন জামরায় রমি।", en: "Nights in Mina and daily Ramy at the three Jamarat." },
    whatToDo: [
      { bn: "ছোট, মাঝারি, তারপর বড় জামরায় সাতটি করে কংকর, প্রতিটিতে তাকবির।", en: "Seven pebbles each at the small, middle, then large Jamrah, with takbir." },
      { bn: "প্রথম ও দ্বিতীয় জামরার পর কিবলামুখী হয়ে দীর্ঘ দোয়া করুন।", en: "After the first and second Jamrah, face the Qibla and make a long dua." },
      { bn: "তাড়া থাকলে ১২ তারিখে সূর্যাস্তের আগে মিনা ত্যাগ করা যায়।", en: "If in haste, you may leave Mina on the 12th before sunset." },
    ],
    whatToSay: [{ duaId: "ramy-takbir" }],
    references: [{ label: "Quran 2:203" }, { label: "Sahih al-Bukhari 1751" }],
  },
  {
    id: "wada",
    title: { bn: "তাওয়াফে বিদা", en: "Tawaf al-Wada' (Farewell)" },
    when: { bn: "মক্কা ত্যাগের ঠিক আগে", en: "Just before leaving Makkah" },
    where: { bn: "মসজিদুল হারাম", en: "Masjid al-Haram" },
    summary: { bn: "মক্কা থেকে বিদায়ের তাওয়াফ।", en: "The farewell Tawaf before leaving Makkah." },
    whatToDo: [
      { bn: "সাত চক্কর তাওয়াফ; এটি মক্কায় শেষ কাজ হওয়া উচিত।", en: "Seven circuits; it should be your last act in Makkah." },
      { bn: "ঋতুমতী নারীদের জন্য এটি মাফ।", en: "Menstruating women are excused from it." },
    ],
    differences: [
      { bn: "অধিকাংশ আলেমের মতে ওয়াজিব; মালিকি মাযহাবে সুন্নাহ।", en: "Obligatory (wajib) according to the majority; Sunnah in the Maliki school." },
    ],
    references: [{ label: "Sahih al-Bukhari 1755" }, { label: "Sahih Muslim 1327" }],
    counter: "tawaf",
  },
];
