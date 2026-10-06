import type { GuideStep } from "@/types/content";

/**
 * Umrah guide — 13 steps. Every step cites its sources; points of scholarly
 * difference are listed in `differences` and always labelled in the UI.
 * Must be reviewed by a qualified scholar before publication.
 */
export const UMRAH_STEPS: GuideStep[] = [
  {
    id: "before-ihram",
    title: { bn: "ইহরামের আগে প্রস্তুতি", en: "Before Ihram" },
    summary: { bn: "শরীর ও মন প্রস্তুত করুন।", en: "Prepare body and heart." },
    whatToDo: [
      { bn: "নখ কাটা, অবাঞ্ছিত লোম পরিষ্কার করা ইত্যাদি পরিচ্ছন্নতা সেরে নিন।", en: "Trim nails and attend to personal grooming." },
      { bn: "গোসল করুন — ইহরামের আগে গোসল করা সুন্নাহ।", en: "Take a bath (ghusl) — it is Sunnah before ihram." },
      { bn: "পুরুষরা শরীরে (কাপড়ে নয়) সুগন্ধি লাগাতে পারেন।", en: "Men may apply perfume to the body (not the ihram cloth)." },
      { bn: "উমরাহর ধাপগুলো আগে থেকে শিখে নিন এবং নিয়ত খাঁটি করুন।", en: "Learn the steps beforehand and make your intention sincere." },
    ],
    notes: [
      { bn: "বিমানে গেলে মীকাত অতিক্রমের আগেই ইহরাম বাঁধতে হবে — তাই বিমানে ওঠার আগে প্রস্তুতি সেরে নিন।", en: "If flying, ihram must begin before the plane crosses the miqat — so prepare before boarding." },
    ],
    references: [{ label: "Jami' at-Tirmidhi 830", detail: "ghusl for ihram" }, { label: "Sahih al-Bukhari 1539", detail: "perfume before ihram" }],
  },
  {
    id: "miqat",
    title: { bn: "মীকাত", en: "Miqat" },
    summary: { bn: "ইহরাম ছাড়া যে সীমা অতিক্রম করা যায় না।", en: "The boundary that may not be crossed without ihram." },
    whatToDo: [
      { bn: "নবী ﷺ নির্ধারিত মীকাতসমূহ: যুল-হুলাইফা, জুহফা, কারনুল মানাযিল, ইয়ালামলাম (এবং যাতু ইরক)।", en: "The miqats: Dhul-Hulayfah, al-Juhfah, Qarn al-Manazil, Yalamlam (and Dhat 'Irq)." },
      { bn: "আপনার পথে যে মীকাত পড়ে, তার আগে বা বরাবর ইহরাম বাঁধুন।", en: "Enter ihram at or before the miqat on your route." },
    ],
    mistakes: [{ bn: "ইহরাম ছাড়া মীকাত পার হয়ে জেদ্দায় গিয়ে ইহরাম বাঁধা।", en: "Crossing the miqat without ihram and entering ihram in Jeddah." }],
    differences: [
      {
        bn: "যারা বিমানে মীকাত অতিক্রম করে জেদ্দায় নামেন, জেদ্দা থেকে ইহরাম বাঁধা বৈধ কি না — এ নিয়ে সমসাময়িক আলেমদের মতভেদ আছে। অধিকাংশের মত: মীকাতের বরাবর ইহরাম বাঁধতে হবে।",
        en: "Contemporary scholars differ on whether those flying over a miqat may enter ihram in Jeddah. The majority view: enter ihram when parallel to the miqat.",
      },
    ],
    references: [{ label: "Sahih al-Bukhari 1524" }, { label: "Sahih al-Bukhari 1531", detail: "Dhat 'Irq" }],
  },
  {
    id: "ihram",
    title: { bn: "ইহরাম", en: "Ihram" },
    summary: { bn: "ইহরামের পোশাক ও নিষেধাজ্ঞা।", en: "Ihram clothing and restrictions." },
    whatToDo: [
      { bn: "পুরুষ: সেলাইবিহীন দুটি সাদা চাদর (ইজার ও রিদা) এবং গোড়ালি খোলা চপ্পল।", en: "Men: two unstitched sheets (izar and rida) and sandals that leave the ankles uncovered." },
      { bn: "নারী: শালীন স্বাভাবিক পোশাক; নিকাব ও হাতমোজা পরবেন না।", en: "Women: normal modest clothing; no niqab or gloves." },
    ],
    donts: [
      { bn: "চুল বা নখ কাটা", en: "Cutting hair or nails" },
      { bn: "সুগন্ধি ব্যবহার", en: "Using perfume" },
      { bn: "শিকার করা", en: "Hunting" },
      { bn: "স্বামী-স্ত্রীর মিলন ও এর আনুষঙ্গিক বিষয়", en: "Marital relations and their preliminaries" },
      { bn: "পুরুষের জন্য সেলাই করা পোশাক ও মাথা ঢাকা", en: "Men: stitched garments and covering the head" },
      { bn: "ঝগড়া-বিবাদ ও অশ্লীলতা", en: "Arguing and obscene speech" },
    ],
    differences: [
      {
        bn: "ইহরামের জন্য আলাদা দুই রাকাত নামাজ আছে কি না — এ নিয়ে মতভেদ আছে। অনেকে বলেন, ফরজ নামাজের পর ইহরাম বাঁধা উত্তম।",
        en: "Scholars differ on whether there is a specific two-rak'ah prayer for ihram; many say it is best to enter ihram after an obligatory prayer.",
      },
    ],
    references: [{ label: "Sahih al-Bukhari 1542", detail: "garments forbidden in ihram" }, { label: "Sahih al-Bukhari 1838", detail: "women: niqab and gloves" }, { label: "Quran 2:197" }],
  },
  {
    id: "niyyah",
    title: { bn: "নিয়ত", en: "Niyyah (Intention)" },
    summary: { bn: "উমরাহর সংকল্প করুন।", en: "Make the intention for Umrah." },
    whatToDo: [
      { bn: "অন্তরে উমরাহর নিয়ত করুন এবং মুখে ‘লাব্বাইকা ‘উমরাতান’ বলুন।", en: "Intend Umrah in your heart and say “Labbayka ʿumratan”." },
      { bn: "বাধার আশঙ্কা থাকলে শর্তযুক্ত নিয়ত করতে পারেন।", en: "If you fear an obstacle, you may make a conditional intention." },
    ],
    whatToSay: [{ duaId: "niyyah-umrah" }, { duaId: "ishtirat" }],
    references: [{ label: "Sahih Muslim 1251" }, { label: "Sahih Muslim 1207" }],
  },
  {
    id: "talbiyah",
    title: { bn: "তালবিয়াহ", en: "Talbiyah" },
    summary: { bn: "ইহরামের পর থেকে বারবার তালবিয়া পড়ুন।", en: "Recite the Talbiyah repeatedly after ihram." },
    whatToDo: [
      { bn: "পুরুষরা উচ্চস্বরে, নারীরা নিচুস্বরে পড়বেন।", en: "Men raise their voices; women recite quietly." },
      { bn: "উমরাহয় তাওয়াফ শুরু করার সময় তালবিয়া বন্ধ করুন।", en: "In Umrah, stop the Talbiyah when you begin Tawaf." },
    ],
    whatToSay: [{ duaId: "talbiyah" }],
    mistakes: [{ bn: "সমস্বরে দলবদ্ধভাবে একজনের পেছনে পেছনে তালবিয়া পড়া।", en: "Reciting in a synchronised chorus behind a leader." }],
    references: [{ label: "Sahih al-Bukhari 1549" }, { label: "Jami' at-Tirmidhi 919", detail: "when to stop the Talbiyah in Umrah" }],
  },
  {
    id: "enter-haram",
    title: { bn: "মসজিদুল হারামে প্রবেশ", en: "Entering Masjid al-Haram" },
    summary: { bn: "আদবের সাথে প্রবেশ করে তাওয়াফের দিকে যান।", en: "Enter with good manners and proceed to Tawaf." },
    whatToDo: [
      { bn: "মসজিদে প্রবেশের দোয়া পড়ে প্রবেশ করুন।", en: "Enter reciting the dua for entering the masjid." },
      { bn: "শান্ত থাকুন, ভিড়ে কাউকে কষ্ট দেবেন না।", en: "Stay calm and do not harm anyone in the crowd." },
      { bn: "উমরাহকারী সরাসরি তাওয়াফ দিয়ে শুরু করবেন।", en: "The pilgrim for Umrah begins directly with Tawaf." },
    ],
    whatToSay: [{ duaId: "masjid-enter" }],
    dos: [{ bn: "জুতা নির্দিষ্ট স্থানে রাখুন এবং দরজার নম্বর মনে রাখুন।", en: "Keep shoes in the racks and remember your gate number." }],
    references: [{ label: "Sahih Muslim 713" }],
  },
  {
    id: "tawaf",
    title: { bn: "তাওয়াফ", en: "Tawaf" },
    summary: { bn: "কাবার চারপাশে সাত চক্কর।", en: "Seven circuits around the Ka'bah." },
    whatToDo: [
      { bn: "হাজরে আসওয়াদের বরাবর থেকে শুরু করুন, কাবা বাম পাশে রাখুন।", en: "Start in line with the Black Stone, keeping the Ka'bah on your left." },
      { bn: "পুরুষরা তাওয়াফে ইদতিবা করবেন — ডান কাঁধ খোলা রেখে চাদর ডান বগলের নিচ দিয়ে বাম কাঁধে।", en: "Men do idtiba' during Tawaf — the right shoulder uncovered." },
      { bn: "পুরুষরা প্রথম তিন চক্করে রমল (ছোট ছোট দ্রুত পদক্ষেপ) করবেন, সম্ভব হলে।", en: "Men walk briskly (raml) in the first three circuits, if possible." },
      { bn: "সম্ভব হলে হাজরে আসওয়াদ স্পর্শ/চুম্বন করুন, না হলে ডান হাত দিয়ে ইশারা করে তাকবির বলুন।", en: "Touch or kiss the Black Stone if possible; otherwise point with the right hand and say the takbir." },
      { bn: "সম্ভব হলে রুকনে ইয়ামানি হাত দিয়ে স্পর্শ করুন (চুম্বন নয়, ইশারাও নয়)।", en: "Touch the Yemeni Corner by hand if possible (no kissing, no pointing)." },
    ],
    whatToSay: [{ duaId: "tawaf-takbir" }, { duaId: "rabbana-atina" }],
    notes: [
      { bn: "প্রতি চক্করের জন্য নির্দিষ্ট কোনো সহিহ দোয়া নেই। যেকোনো ভাষায় দোয়া, জিকির ও তিলাওয়াত করুন।", en: "There is no authentic fixed dua for each circuit. Make dua, dhikr and recitation in any language." },
      { bn: "হিজরে ইসমাইল (হাতিম) কাবার অংশ — তাওয়াফ এর বাইরে দিয়ে করতে হবে।", en: "Hijr Isma'il (Hatim) is part of the Ka'bah — Tawaf must go outside it." },
    ],
    mistakes: [
      { bn: "হাজরে আসওয়াদ চুম্বনের জন্য ধাক্কাধাক্কি করা।", en: "Pushing and hurting others to kiss the Black Stone." },
      { bn: "প্রতি চক্করের জন্য বই থেকে নির্দিষ্ট দোয়া পড়া জরুরি মনে করা।", en: "Believing specific printed duas per circuit are required." },
      { bn: "হাজরে আসওয়াদের দিকে নামাজের মতো দুই হাত তোলা।", en: "Raising both hands towards the Black Stone as in prayer." },
      { bn: "পুরো ইহরাম অবস্থায় ইদতিবা করে রাখা — এটি শুধু তাওয়াফে।", en: "Keeping the shoulder uncovered for the whole ihram — idtiba' is only during Tawaf." },
    ],
    differences: [
      {
        bn: "তাওয়াফের জন্য অজু শর্ত — অধিকাংশ আলেমের মত; হানাফি মাযহাবে এটি ওয়াজিব, শর্ত নয়।",
        en: "Wudu is a condition for Tawaf according to the majority; in the Hanafi school it is obligatory (wajib) but not a condition of validity.",
      },
    ],
    references: [
      { label: "Sahih al-Bukhari 1603", detail: "raml" },
      { label: "Sunan Abi Dawud 1884", detail: "idtiba'" },
      { label: "Sahih al-Bukhari 1609", detail: "touching the two Yemeni corners" },
      { label: "Sahih al-Bukhari 1612", detail: "pointing to the Stone" },
      { label: "Sahih Muslim 1218" },
    ],
    counter: "tawaf",
  },
  {
    id: "after-tawaf",
    title: { bn: "তাওয়াফের পর", en: "After Tawaf" },
    summary: { bn: "কাঁধ ঢেকে মাকামে ইবরাহিমের দিকে যান।", en: "Cover the shoulder and head to Maqam Ibrahim." },
    whatToDo: [
      { bn: "পুরুষরা ডান কাঁধ ঢেকে নিন (ইদতিবা শেষ)।", en: "Men cover the right shoulder (idtiba' ends)." },
      { bn: "মাকামে ইবরাহিমের দিকে যেতে যেতে আয়াতটি পড়ুন।", en: "Recite the verse while approaching Maqam Ibrahim." },
    ],
    whatToSay: [{ duaId: "maqam-ibrahim" }],
    references: [{ label: "Sahih Muslim 1218" }],
  },
  {
    id: "maqam",
    title: { bn: "মাকামে ইবরাহিম", en: "Maqam Ibrahim" },
    summary: { bn: "দুই রাকাত নামাজ।", en: "Two rak'ahs of prayer." },
    whatToDo: [
      { bn: "সম্ভব হলে মাকামে ইবরাহিমের পেছনে দুই রাকাত পড়ুন; ভিড় থাকলে মসজিদের যেকোনো স্থানে।", en: "Pray two rak'ahs behind Maqam Ibrahim if possible; if crowded, anywhere in the masjid." },
      { bn: "প্রথম রাকাতে সূরা কাফিরুন, দ্বিতীয়তে সূরা ইখলাস পড়া সুন্নাহ।", en: "Reciting al-Kafirun in the first and al-Ikhlas in the second is Sunnah." },
    ],
    donts: [{ bn: "তাওয়াফকারীদের পথে দাঁড়িয়ে নামাজ পড়ে ভিড় সৃষ্টি করা।", en: "Praying in the path of those doing Tawaf and blocking them." }],
    references: [{ label: "Sahih Muslim 1218" }, { label: "Quran 2:125" }],
  },
  {
    id: "zamzam",
    title: { bn: "জমজম", en: "Zamzam" },
    summary: { bn: "জমজমের পানি পান করুন।", en: "Drink Zamzam water." },
    whatToDo: [
      { bn: "জমজমের পানি পান করুন এবং দোয়া করুন।", en: "Drink Zamzam and make dua." },
      { bn: "সম্ভব ও সহজ হলে সাঈর আগে আবার হাজরে আসওয়াদ স্পর্শ করুন।", en: "If easy, touch the Black Stone again before Sa'i." },
    ],
    notes: [
      {
        bn: "‘জমজম যে উদ্দেশ্যে পান করা হয়, তার জন্যই’ — এই হাদিসের মান নিয়ে মুহাদ্দিসদের মধ্যে ভিন্নমত আছে।",
        en: "“Zamzam is for whatever it is drunk for” — hadith scholars differ on the grading of this narration.",
      },
    ],
    references: [{ label: "Sahih al-Bukhari 1637" }, { label: "Sunan Ibn Majah 3062" }, { label: "Sahih Muslim 1218" }],
  },
  {
    id: "sai",
    title: { bn: "সাঈ", en: "Sa'i" },
    summary: { bn: "সাফা ও মারওয়ার মাঝে সাত বার।", en: "Seven lengths between Safa and Marwah." },
    whatToDo: [
      { bn: "সাফায় উঠে কাবার দিকে মুখ করুন, তাকবির-তাহলিল পড়ে দোয়া করুন।", en: "Climb Safa, face the Ka'bah, say the takbir and tahlil and make dua." },
      { bn: "সাফা থেকে মারওয়া এক বার, মারওয়া থেকে সাফা দ্বিতীয় বার — এভাবে সাত বার, শেষ মারওয়ায়।", en: "Safa to Marwah is one length, back to Safa is the second — seven in total, ending at Marwah." },
      { bn: "পুরুষরা সবুজ বাতির মাঝে দ্রুত হাঁটবেন; নারীরা স্বাভাবিকভাবে হাঁটবেন।", en: "Men hasten between the green lights; women walk normally." },
    ],
    whatToSay: [{ duaId: "safa-verse" }, { duaId: "safa-marwah-dhikr" }],
    notes: [{ bn: "সাঈর জন্য অজু শর্ত নয়, তবে উত্তম।", en: "Wudu is not a condition for Sa'i, though it is better." }],
    mistakes: [{ bn: "সাঈকে সাতটি পূর্ণ আসা-যাওয়া (১৪ বার) মনে করা।", en: "Counting Sa'i as seven full round trips (14 lengths)." }],
    references: [{ label: "Quran 2:158" }, { label: "Sahih Muslim 1218" }],
    counter: "sai",
  },
  {
    id: "halq",
    title: { bn: "হলক / কসর", en: "Halq / Qasr" },
    summary: { bn: "মাথা মুণ্ডন বা চুল ছোট করা।", en: "Shave or shorten the hair." },
    whatToDo: [
      { bn: "পুরুষ: মাথা মুণ্ডন (হলক) উত্তম, অথবা পুরো মাথা থেকে চুল ছোট করা (কসর)।", en: "Men: shaving (halq) is better, or shortening hair from the whole head (qasr)." },
      { bn: "নারী: চুলের অগ্রভাগ থেকে আঙুলের এক কর পরিমাণ কাটবেন; মুণ্ডন করবেন না।", en: "Women: cut a fingertip's length from the ends; women do not shave." },
    ],
    differences: [
      {
        bn: "কসরে কতটুকু চুল কাটতে হবে — মাযহাবগুলোর মধ্যে মতভেদ আছে (পুরো মাথা, মাথার এক-চতুর্থাংশ, বা কয়েকটি চুল)।",
        en: "The madhhabs differ on how much must be cut for qasr (whole head, a quarter of the head, or a few hairs).",
      },
    ],
    references: [{ label: "Sahih al-Bukhari 1727" }, { label: "Sunan Abi Dawud 1985", detail: "women shorten, not shave" }],
  },
  {
    id: "complete",
    title: { bn: "সমাপ্তি", en: "Completion" },
    summary: { bn: "উমরাহ সম্পন্ন — ইহরামের নিষেধাজ্ঞা শেষ।", en: "Umrah complete — ihram restrictions are lifted." },
    whatToDo: [
      { bn: "আল্লাহর শোকর আদায় করুন এবং কবুলের দোয়া করুন।", en: "Thank Allah and ask Him to accept it." },
      { bn: "এখন ইহরামের সব নিষেধাজ্ঞা উঠে গেছে।", en: "All ihram restrictions are now lifted." },
    ],
    references: [{ label: "Sahih Muslim 1218" }],
  },
];
