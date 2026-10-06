import type { LText } from "@/types/content";

/**
 * Responding to the adhan and the dua after it — authentic narrations only.
 *  - Say what the muezzin says (Bukhari 611, Muslim 383), except at the two
 *    "ḥayya ʿalā…" lines say "lā ḥawla wa lā quwwata illā billāh" (Muslim 385).
 *  - After the adhan: send salawat, then ask for al-wasīlah (Muslim 384) with
 *    the wording in Bukhari 614.
 * Popular additions without a sound basis (e.g. "ṣadaqta wa bararta",
 * "wad-darajatar-rafīʿah") are intentionally not included.
 */
export type AdhanLine = {
  id: string;
  /** What the muezzin says. */
  arabic: string;
  translit: LText;
  meaning: LText;
  /** How many times the muezzin says it. */
  times: number;
  /** Your reply; omitted → repeat the same words. */
  reply?: { arabic: string; translit: LText; meaning: LText; ref: string };
  fajrOnly?: boolean;
};

const LA_HAWLA = {
  arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
  translit: { bn: "লা- হাওলা ওয়ালা- কুওয়্যাতা ইল্লা- বিল্লা-হ", en: "Lā ḥawla wa lā quwwata illā billāh" },
  meaning: { bn: "আল্লাহর সাহায্য ছাড়া কোনো শক্তি ও সামর্থ্য নেই।", en: "There is no might and no power except with Allah." },
  ref: "Sahih Muslim 385",
};

export const ADHAN_LINES: AdhanLine[] = [
  {
    id: "takbir-1",
    arabic: "اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ",
    translit: { bn: "আল্লা-হু আকবার, আল্লা-হু আকবার", en: "Allāhu akbar, Allāhu akbar" },
    meaning: { bn: "আল্লাহ সর্বশ্রেষ্ঠ, আল্লাহ সর্বশ্রেষ্ঠ।", en: "Allah is the Greatest, Allah is the Greatest." },
    times: 2,
  },
  {
    id: "shahada-1",
    arabic: "أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ",
    translit: { bn: "আশহাদু আল লা- ইলা-হা ইল্লাল্লা-হ", en: "Ashhadu an lā ilāha illā-llāh" },
    meaning: { bn: "আমি সাক্ষ্য দিচ্ছি, আল্লাহ ছাড়া কোনো সত্য উপাস্য নেই।", en: "I bear witness that there is no god but Allah." },
    times: 2,
  },
  {
    id: "shahada-2",
    arabic: "أَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللَّهِ",
    translit: { bn: "আশহাদু আন্না মুহাম্মাদার রাসূলুল্লা-হ", en: "Ashhadu anna Muḥammadan rasūlu-llāh" },
    meaning: { bn: "আমি সাক্ষ্য দিচ্ছি, মুহাম্মাদ আল্লাহর রাসূল।", en: "I bear witness that Muhammad is the Messenger of Allah." },
    times: 2,
  },
  {
    id: "hayya-salah",
    arabic: "حَيَّ عَلَى الصَّلَاةِ",
    translit: { bn: "হাইয়া আলাস সালা-হ", en: "Ḥayya ʿalaṣ-ṣalāh" },
    meaning: { bn: "নামাজের দিকে এসো।", en: "Come to prayer." },
    times: 2,
    reply: LA_HAWLA,
  },
  {
    id: "hayya-falah",
    arabic: "حَيَّ عَلَى الْفَلَاحِ",
    translit: { bn: "হাইয়া আলাল ফালা-হ", en: "Ḥayya ʿalal-falāḥ" },
    meaning: { bn: "কল্যাণের দিকে এসো।", en: "Come to success." },
    times: 2,
    reply: LA_HAWLA,
  },
  {
    id: "tathwib",
    arabic: "الصَّلَاةُ خَيْرٌ مِنَ النَّوْمِ",
    translit: { bn: "আস-সালা-তু খাইরুম মিনান নাওম", en: "Aṣ-ṣalātu khayrun minan-nawm" },
    meaning: { bn: "ঘুমের চেয়ে নামাজ উত্তম।", en: "Prayer is better than sleep." },
    times: 2,
    fajrOnly: true,
  },
  {
    id: "takbir-2",
    arabic: "اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ",
    translit: { bn: "আল্লা-হু আকবার, আল্লা-হু আকবার", en: "Allāhu akbar, Allāhu akbar" },
    meaning: { bn: "আল্লাহ সর্বশ্রেষ্ঠ, আল্লাহ সর্বশ্রেষ্ঠ।", en: "Allah is the Greatest, Allah is the Greatest." },
    times: 1,
  },
  {
    id: "tahlil",
    arabic: "لَا إِلَٰهَ إِلَّا اللَّهُ",
    translit: { bn: "লা- ইলা-হা ইল্লাল্লা-হ", en: "Lā ilāha illā-llāh" },
    meaning: { bn: "আল্লাহ ছাড়া কোনো সত্য উপাস্য নেই।", en: "There is no god but Allah." },
    times: 1,
  },
];

export type AdhanDua = { id: string; title: LText; arabic: string; translit: LText; meaning: LText; ref: string; note?: LText };

/** Said on hearing the muezzin's testimony (Muslim 386). */
export const SHAHADA_RESPONSE: AdhanDua = {
  id: "shahada-response",
  title: { bn: "মুয়াজ্জিনের শাহাদাহ শুনে", en: "On hearing the muezzin's testimony" },
  arabic:
    "أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ، رَضِيتُ بِاللَّهِ رَبًّا، وَبِمُحَمَّدٍ رَسُولًا، وَبِالْإِسْلَامِ دِينًا",
  translit: {
    bn: "আশহাদু আল লা- ইলা-হা ইল্লাল্লা-হু ওয়াহদাহু লা- শারীকা লাহু, ওয়া আন্না মুহাম্মাদান আবদুহু ওয়া রাসূলুহু, রাদীতু বিল্লা-হি রাব্বা, ওয়া বিমুহাম্মাদিন রাসূলা, ওয়া বিল ইসলা-মি দীনা",
    en: "Ashhadu an lā ilāha illā-llāhu waḥdahū lā sharīka lah, wa anna Muḥammadan ʿabduhū wa rasūluh, raḍītu billāhi rabban, wa bi-Muḥammadin rasūlan, wa bil-islāmi dīnā",
  },
  meaning: {
    bn: "আমি সাক্ষ্য দিচ্ছি যে আল্লাহ ছাড়া কোনো সত্য উপাস্য নেই, তিনি এক, তাঁর কোনো শরিক নেই, এবং মুহাম্মাদ তাঁর বান্দা ও রাসূল। আমি আল্লাহকে রব, মুহাম্মাদকে রাসূল এবং ইসলামকে দ্বীন হিসেবে সন্তুষ্টচিত্তে গ্রহণ করেছি।",
    en: "I bear witness that there is no god but Allah alone, without partner, and that Muhammad is His servant and Messenger. I am pleased with Allah as Lord, with Muhammad as Messenger and with Islam as religion.",
  },
  ref: "Sahih Muslim 386",
};

/** After the adhan: salawat, then the dua for al-wasīlah. */
export const AFTER_ADHAN: AdhanDua[] = [
  {
    id: "salawat",
    title: { bn: "১. দরুদ পড়ুন", en: "1. Send salawat on the Prophet ﷺ" },
    arabic:
      "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ",
    translit: {
      bn: "আল্লা-হুম্মা সাল্লি আলা- মুহাম্মাদিওঁ ওয়া আলা- আ-লি মুহাম্মাদ, কামা- সাল্লাইতা আলা- ইবরা-হীমা ওয়া আলা- আ-লি ইবরা-হীম, ইন্নাকা হামীদুম মাজীদ",
      en: "Allāhumma ṣalli ʿalā Muḥammadin wa ʿalā āli Muḥammad, kamā ṣallayta ʿalā Ibrāhīma wa ʿalā āli Ibrāhīm, innaka Ḥamīdun Majīd",
    },
    meaning: {
      bn: "হে আল্লাহ, মুহাম্মাদ ও মুহাম্মাদের পরিবারের উপর রহমত বর্ষণ করুন, যেমন আপনি ইবরাহিম ও ইবরাহিমের পরিবারের উপর রহমত বর্ষণ করেছেন। নিশ্চয়ই আপনি প্রশংসিত, মহিমান্বিত।",
      en: "O Allah, send blessings upon Muhammad and the family of Muhammad, as You sent blessings upon Ibrahim and the family of Ibrahim; You are Praiseworthy, Glorious.",
    },
    ref: "Sahih Muslim 384 · wording: Sahih al-Bukhari 3370",
  },
  {
    id: "wasilah",
    title: { bn: "২. আযানের পরের দোয়া", en: "2. Dua after the adhan" },
    arabic:
      "اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلَاةِ الْقَائِمَةِ، آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ",
    translit: {
      bn: "আল্লা-হুম্মা রাব্বা হা-যিহিদ দা‘ওয়াতিত তা-ম্মাহ, ওয়াস সালা-তিল ক্বা-য়িমাহ, আ-তি মুহাম্মাদানিল ওয়াসীলাতা ওয়াল ফাদীলাহ, ওয়াব‘আসহু মাক্বা-মাম মাহমূদানিল্লাযী ওয়া‘আত্তাহ",
      en: "Allāhumma rabba hādhihid-daʿwatit-tāmmah, waṣ-ṣalātil-qāʾimah, āti Muḥammadanil-wasīlata wal-faḍīlah, wabʿathhu maqāman maḥmūdanil-ladhī waʿadtah",
    },
    meaning: {
      bn: "হে আল্লাহ! এই পরিপূর্ণ আহ্বান ও প্রতিষ্ঠিত সালাতের রব! মুহাম্মাদকে ওয়াসিলা ও মর্যাদা দান করুন এবং তাঁকে সেই প্রশংসিত স্থানে পৌঁছে দিন, যার প্রতিশ্রুতি আপনি তাঁকে দিয়েছেন।",
      en: "O Allah, Lord of this perfect call and the prayer to be established, grant Muhammad al-wasīlah and excellence, and raise him to the praised station You have promised him.",
    },
    ref: "Sahih al-Bukhari 614",
    note: {
      bn: "যে ব্যক্তি আযান শুনে এই দোয়া পড়ে, কিয়ামতের দিন তার জন্য নবী ﷺ-এর শাফায়াত অবধারিত হবে।",
      en: "Whoever says this after hearing the call, the Prophet's ﷺ intercession becomes due for him on the Day of Resurrection.",
    },
  },
];

/** Window around each adhan in which the guide is shown on Home. */
export const ADHAN_WINDOW = { beforeMs: 5 * 60_000, afterMs: 10 * 60_000 };
/** Rough length of the adhan at the Haramain; after this the "dua" tab is suggested. */
export const ADHAN_DURATION_MS = { fajr: 5 * 60_000, other: 4 * 60_000 };
