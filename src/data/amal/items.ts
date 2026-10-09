import type { GText } from "@/data/guides/travel";

/**
 * Daily deeds ("amal") for the tracker. Every item carries the text it is based on.
 * Items whose evidence is weak are marked `grade: "weak"` and explained — never presented as established.
 */
export type AmalSlot = "fajr" | "morning" | "dhuhr" | "asr" | "maghrib" | "isha" | "night" | "day";
export type AmalKind = "fard" | "sunnah" | "nafl" | "adhkar" | "dua" | "quran";
export type AmalPrayer = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";
export type AmalRef = { label: string; url?: string };

/** How an item can tick itself from other parts of the app. */
export type AmalAuto =
  | { type: "plan"; prayer: AmalPrayer } // after-salah zikr plan finished
  | { type: "adhan"; prayer: AmalPrayer; part: "answer" | "dua" } // adhan guide (home card)
  | { type: "surah"; chapter: number; fromAyah: number } // Qur'an reader reached the end
  | { type: "count"; counter: AmalCounter }; // zikr counter / Qur'an ayahs

export type AmalCounter = "istighfar" | "durood" | "ayahs";

export type AmalItem = {
  id: string;
  slot: AmalSlot;
  kind: AmalKind;
  /** Points towards the day's score (fard counts most). */
  weight: number;
  title: GText;
  /** Short line under the title (rak'ahs, time). */
  sub?: GText;
  /** Why it matters, in one sentence, with `refs`. Used for recommendations. */
  virtue: GText;
  refs: AmalRef[];
  grade?: "weak";
  /** Shown only on Fridays (Riyadh date). */
  friday?: boolean;
  /** Hidden on Fridays (e.g. replaced by a Friday version). */
  notFriday?: boolean;
  /** Can be switched off in settings (all non-fard items can). */
  auto?: AmalAuto;
  /** Count-based items: done when the day's count reaches the goal (user-adjustable). */
  goal?: number;
  /** Where to do it in the app. */
  href?: string;
  /** Off by default (user can switch on). */
  optional?: boolean;
  /** When it becomes possible to do on its day (prayer time, plus minutes). No value = any time of the day. */
  opens?: AmalOpens;
};

export type AmalOpens = { at: "fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha"; plusMin?: number };

const bukhari = (n: number): AmalRef => ({ label: `Sahih al-Bukhari ${n}`, url: `https://sunnah.com/bukhari:${n}` });
const muslim = (n: number): AmalRef => ({ label: `Sahih Muslim ${n}`, url: `https://sunnah.com/muslim:${n}` });
const tirmidhi = (n: number): AmalRef => ({ label: `Jami' at-Tirmidhi ${n}`, url: `https://sunnah.com/tirmidhi:${n}` });
const abudawud = (n: number): AmalRef => ({ label: `Sunan Abi Dawud ${n}`, url: `https://sunnah.com/abudawud:${n}` });
const quran = (s: number, a: string): AmalRef => ({ label: `Qur'an ${s}:${a}`, url: `https://quran.com/${s}/${a.split("–")[0]}` });

export const PRAYERS: AmalPrayer[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

const PRAYER_NAME: Record<AmalPrayer, GText> = {
  fajr: { en: "Fajr", bn: "ফজর", ur: "فجر" },
  dhuhr: { en: "Dhuhr", bn: "যোহর", ur: "ظہر" },
  asr: { en: "Asr", bn: "আসর", ur: "عصر" },
  maghrib: { en: "Maghrib", bn: "মাগরিব", ur: "مغرب" },
  isha: { en: "Isha", bn: "এশা", ur: "عشاء" },
};
const FARD_RAKAH: Record<AmalPrayer, number> = { fajr: 2, dhuhr: 4, asr: 4, maghrib: 3, isha: 4 };
const N_BN = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
const bnNum = (n: number) => String(n).replace(/\d/g, (d) => N_BN[+d]);
const N_UR = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
const urNum = (n: number) => String(n).replace(/\d/g, (d) => N_UR[+d]);
const rakah = (n: number): GText => ({ en: `${n} rak'ahs`, bn: `${bnNum(n)} রাকাত`, ur: `${urNum(n)} رکعات` });

function prayerItems(p: AmalPrayer): AmalItem[] {
  const name = PRAYER_NAME[p];
  const items: AmalItem[] = [
    {
      id: `${p}-answer`,
      slot: p,
      opens: { at: p },
      kind: "dua",
      weight: 2,
      title: { en: `Answer the ${name.en} adhan`, bn: `${name.bn}-এর আজানের জবাব`, ur: `${name.ur} کی اذان کا جواب` },
      sub: { en: "Repeat after the muadhin", bn: "মুয়াজ্জিনের সাথে সাথে বলুন", ur: "مؤذن کے ساتھ دہرائیں" },
      virtue: {
        en: "Say what the muadhin says, then send blessings on the Prophet ﷺ — Allah sends ten blessings on you.",
        bn: "মুয়াজ্জিন যা বলে তা-ই বলুন, তারপর নবী ﷺ-এর ওপর দরুদ পড়ুন — আল্লাহ আপনার ওপর দশটি রহমত পাঠান।",
        ur: "جو مؤذن کہے وہی کہیں، پھر نبی ﷺ پر درود بھیجیں — اللہ آپ پر دس رحمتیں بھیجتا ہے۔",
      },
      refs: [muslim(384), muslim(385)],
      auto: { type: "adhan", prayer: p, part: "answer" },
      href: "/prayer#adhan",
    },
    {
      id: `${p}-adhan-dua`,
      slot: p,
      opens: { at: p },
      kind: "dua",
      weight: 2,
      title: { en: `Dua after the ${name.en} adhan`, bn: `${name.bn}-এর আজানের পরের দোয়া`, ur: `${name.ur} کی اذان کے بعد کی دعا` },
      sub: { en: "Allāhumma rabba hādhihi-d-da'wati-t-tāmmah…", bn: "আল্লাহুম্মা রব্বা হাযিহিদ দাওয়াতিত তাম্মাহ…", ur: "اللّٰہم ربّ ہذہ الدعوۃ التامۃ…" },
      virtue: {
        en: "Whoever says it after hearing the adhan, the Prophet's ﷺ intercession becomes due for him on the Day of Resurrection.",
        bn: "আজান শুনে যে এই দোয়া পড়ে, কিয়ামতের দিন তার জন্য নবী ﷺ-এর শাফাআত অবধারিত হয়।",
        ur: "جو اذان سن کر یہ دعا پڑھے، قیامت کے دن اس کے لیے نبی ﷺ کی شفاعت واجب ہو جاتی ہے۔",
      },
      refs: [bukhari(614)],
      auto: { type: "adhan", prayer: p, part: "dua" },
      href: "/prayer#adhan",
    },
  ];

  if (p === "fajr")
    items.push({
      id: "fajr-sunnah",
      slot: p,
      opens: { at: p },
      kind: "sunnah",
      weight: 4,
      title: { en: "2 sunnah before Fajr", bn: "ফজরের আগে ২ রাকাত সুন্নাত", ur: "فجر سے پہلے ۲ سنتیں" },
      sub: { en: "Sunnah mu'akkadah", bn: "সুন্নাতে মুয়াক্কাদা", ur: "سنتِ مؤکدہ" },
      virtue: {
        en: "The two rak'ahs of Fajr are better than this world and everything in it.",
        bn: "ফজরের দুই রাকাত (সুন্নাত) দুনিয়া ও তার সবকিছুর চেয়ে উত্তম।",
        ur: "فجر کی دو رکعتیں دنیا اور جو کچھ اس میں ہے اس سے بہتر ہیں۔",
      },
      refs: [muslim(725), tirmidhi(415)],
    });
  if (p === "dhuhr")
    items.push({
      id: "dhuhr-sunnah-before",
      slot: p,
      opens: { at: p },
      kind: "sunnah",
      weight: 4,
      notFriday: true,
      title: { en: "4 sunnah before Dhuhr", bn: "যোহরের আগে ৪ রাকাত সুন্নাত", ur: "ظہر سے پہلے ۴ سنتیں" },
      sub: { en: "Part of the 12 daily sunnah rak'ahs", bn: "দৈনিক ১২ রাকাত সুন্নাতের অংশ", ur: "روزانہ ۱۲ سنتوں کا حصہ" },
      virtue: {
        en: "Whoever prays twelve sunnah rak'ahs in a day and night, a house is built for him in Paradise.",
        bn: "যে দিনে-রাতে বারো রাকাত সুন্নাত পড়ে, তার জন্য জান্নাতে একটি ঘর নির্মাণ করা হয়।",
        ur: "جو دن رات میں بارہ سنتیں پڑھے، اس کے لیے جنت میں ایک گھر بنایا جاتا ہے۔",
      },
      refs: [muslim(728), tirmidhi(415)],
    });
  if (p === "asr")
    items.push({
      id: "asr-sunnah-before",
      slot: p,
      opens: { at: p },
      kind: "nafl",
      weight: 2,
      title: { en: "4 rak'ahs before Asr", bn: "আসরের আগে ৪ রাকাত", ur: "عصر سے پہلے ۴ رکعتیں" },
      sub: { en: "Sunnah ghayr mu'akkadah", bn: "সুন্নাতে গায়রে মুয়াক্কাদা", ur: "سنتِ غیر مؤکدہ" },
      virtue: {
        en: "“May Allah have mercy on a person who prays four rak'ahs before Asr.”",
        bn: "“আল্লাহ সেই ব্যক্তির ওপর রহম করুন, যে আসরের আগে চার রাকাত পড়ে।”",
        ur: "“اللہ اس شخص پر رحم کرے جو عصر سے پہلے چار رکعتیں پڑھے۔”",
      },
      refs: [abudawud(1271), tirmidhi(430)],
    });

  items.push({
    id: `${p}-fard`,
    slot: p,
    opens: { at: p },
    kind: "fard",
    weight: 10,
    title: { en: `${name.en} — fard`, bn: `${name.bn} — ফরজ`, ur: `${name.ur} — فرض` },
    sub: rakah(FARD_RAKAH[p]),
    virtue: {
      en: "Prayer at its proper times is prescribed for the believers, and it is one of the five pillars of Islam.",
      bn: "নির্ধারিত সময়ে সালাত মুমিনদের ওপর ফরজ, আর এটি ইসলামের পাঁচ স্তম্ভের একটি।",
      ur: "مقررہ اوقات میں نماز مومنوں پر فرض ہے، اور یہ اسلام کے پانچ ستونوں میں سے ہے۔",
    },
    refs: [quran(4, "103"), bukhari(8)],
  });

  if (p === "dhuhr" || p === "maghrib" || p === "isha")
    items.push({
      id: `${p}-sunnah-after`,
      slot: p,
      opens: { at: p },
      kind: "sunnah",
      weight: 4,
      title: { en: `2 sunnah after ${name.en}`, bn: `${name.bn}-এর পরে ২ রাকাত সুন্নাত`, ur: `${name.ur} کے بعد ۲ سنتیں` },
      sub: { en: "Part of the 12 daily sunnah rak'ahs", bn: "দৈনিক ১২ রাকাত সুন্নাতের অংশ", ur: "روزانہ ۱۲ سنتوں کا حصہ" },
      virtue: {
        en: "Whoever prays twelve sunnah rak'ahs in a day and night, a house is built for him in Paradise.",
        bn: "যে দিনে-রাতে বারো রাকাত সুন্নাত পড়ে, তার জন্য জান্নাতে একটি ঘর নির্মাণ করা হয়।",
        ur: "جو دن رات میں بارہ سنتیں پڑھے، اس کے لیے جنت میں ایک گھر بنایا جاتا ہے۔",
      },
      refs: [muslim(728), tirmidhi(415)],
    });

  items.push({
    id: `${p}-adhkar`,
    slot: p,
    opens: { at: p },
    kind: "adhkar",
    weight: 3,
    title: { en: `Adhkar after ${name.en}`, bn: `${name.bn}-এর পরের জিকির`, ur: `${name.ur} کے بعد کے اذکار` },
    sub: {
      en: "Istighfar ×3 · Subhanallah, Alhamdulillah, Allahu akbar ×33 · Ayat al-Kursi",
      bn: "ইস্তিগফার ×৩ · সুবহানাল্লাহ, আলহামদুলিল্লাহ, আল্লাহু আকবার ×৩৩ · আয়াতুল কুরসি",
      ur: "استغفار ×۳ · سبحان اللہ، الحمد للہ، اللہ اکبر ×۳۳ · آیت الکرسی",
    },
    virtue: {
      en: "Whoever glorifies Allah 33 times, praises Him 33 and magnifies Him 33 after each prayer and completes the hundred with the tahlil, his sins are forgiven even if like the foam of the sea.",
      bn: "যে প্রতি সালাতের পর ৩৩ বার সুবহানাল্লাহ, ৩৩ বার আলহামদুলিল্লাহ, ৩৩ বার আল্লাহু আকবার বলে এবং তাহলিল দিয়ে একশ পূর্ণ করে, তার গুনাহ সমুদ্রের ফেনার মতো হলেও ক্ষমা করা হয়।",
      ur: "جو ہر نماز کے بعد ۳۳ بار سبحان اللہ، ۳۳ بار الحمد للہ، ۳۳ بار اللہ اکبر کہے اور تہلیل سے سو پورے کرے، اس کے گناہ معاف ہو جاتے ہیں خواہ سمندر کی جھاگ کے برابر ہوں۔",
    },
    refs: [muslim(591), muslim(597), { label: "an-Nasa'i, as-Sunan al-Kubra (Ayat al-Kursi; Abu Umamah) — sahih per al-Albani, as-Silsilah as-Sahihah 972" }],
    auto: { type: "plan", prayer: p },
    href: `/zikr?plan=salah-${p}`,
  });
  return items;
}

const OTHER: AmalItem[] = [
  {
    id: "morning-adhkar",
    opens: { at: "fajr" },
    slot: "morning",
    kind: "adhkar",
    weight: 3,
    title: { en: "Morning adhkar", bn: "সকালের জিকির", ur: "صبح کے اذکار" },
    sub: { en: "After Fajr, before the sun is high", bn: "ফজরের পর, সূর্য ওপরে ওঠার আগে", ur: "فجر کے بعد، سورج بلند ہونے سے پہلے" },
    virtue: {
      en: "Sayyid al-istighfar: whoever says it in the day with certainty and dies before evening is among the people of Paradise.",
      bn: "সাইয়্যিদুল ইস্তিগফার: যে দৃঢ় বিশ্বাসে দিনে তা পড়ে এবং সন্ধ্যার আগে মারা যায়, সে জান্নাতি।",
      ur: "سید الاستغفار: جو یقین کے ساتھ دن میں پڑھے اور شام سے پہلے فوت ہو جائے، وہ جنتی ہے۔",
    },
    refs: [quran(33, "41–42"), bukhari(6306), muslim(2723)],
    href: "/zikr",
  },
  {
    id: "yasin",
    opens: { at: "fajr" },
    slot: "morning",
    kind: "quran",
    weight: 2,
    grade: "weak",
    title: { en: "Surah Ya-Sin after Fajr", bn: "ফজরের পর সূরা ইয়াসিন", ur: "فجر کے بعد سورۂ یٰسین" },
    sub: { en: "Qur'an 36", bn: "কুরআন ৩৬", ur: "قرآن ۳۶" },
    virtue: {
      en: "The reports promising ease for the day to whoever reads Ya-Sin in the morning have weak chains. Reading it is good Qur'an recitation, but no specific reward is established.",
      bn: "সকালে ইয়াসিন পড়লে দিন সহজ হওয়ার বর্ণনাগুলোর সনদ দুর্বল। এটি পড়া উত্তম তিলাওয়াত, তবে নির্দিষ্ট কোনো সওয়াব প্রমাণিত নয়।",
      ur: "صبح یٰسین پڑھنے پر دن آسان ہونے کی روایات کی سند ضعیف ہے۔ اس کی تلاوت اچھی ہے، مگر کوئی خاص ثواب ثابت نہیں۔",
    },
    refs: [{ label: "Sunan ad-Darimi (Ibn 'Abbas; and 'Ata ibn Abi Rabah, mursal) — weak chains" }],
    auto: { type: "surah", chapter: 36, fromAyah: 83 },
    href: "/quran/surah/36",
  },
  {
    id: "duha",
    opens: { at: "sunrise", plusMin: 15 },
    slot: "morning",
    kind: "nafl",
    weight: 2,
    title: { en: "Duha prayer", bn: "চাশত / দুহার সালাত", ur: "نمازِ چاشت (ضحیٰ)" },
    sub: { en: "At least 2 rak'ahs, after sunrise until before Dhuhr", bn: "কমপক্ষে ২ রাকাত, সূর্য ওঠার পর থেকে যোহরের আগ পর্যন্ত", ur: "کم از کم ۲ رکعتیں، طلوع کے بعد سے ظہر سے پہلے تک" },
    virtue: {
      en: "Every joint of yours owes a charity each morning, and two rak'ahs of Duha suffice for it all.",
      bn: "প্রতিদিন সকালে আপনার প্রতিটি জোড়ার জন্য সদকা আবশ্যক, আর দুহার দুই রাকাত সেই সবের জন্য যথেষ্ট।",
      ur: "ہر صبح آپ کے ہر جوڑ پر صدقہ ہے، اور چاشت کی دو رکعتیں ان سب کے لیے کافی ہیں۔",
    },
    refs: [muslim(720), bukhari(1178)],
  },
  {
    id: "evening-adhkar",
    opens: { at: "asr" },
    slot: "asr",
    kind: "adhkar",
    weight: 3,
    title: { en: "Evening adhkar", bn: "সন্ধ্যার জিকির", ur: "شام کے اذکار" },
    sub: { en: "After Asr until Maghrib (or after Maghrib)", bn: "আসরের পর থেকে মাগরিব পর্যন্ত (বা মাগরিবের পর)", ur: "عصر کے بعد سے مغرب تک (یا مغرب کے بعد)" },
    virtue: {
      en: "Sayyid al-istighfar: whoever says it at night with certainty and dies before morning is among the people of Paradise.",
      bn: "সাইয়্যিদুল ইস্তিগফার: যে দৃঢ় বিশ্বাসে রাতে তা পড়ে এবং সকালের আগে মারা যায়, সে জান্নাতি।",
      ur: "سید الاستغفار: جو یقین کے ساتھ رات کو پڑھے اور صبح سے پہلے فوت ہو جائے، وہ جنتی ہے۔",
    },
    refs: [quran(50, "39"), bukhari(6306), muslim(2723)],
    href: "/zikr",
  },
  {
    id: "mulk",
    opens: { at: "maghrib" },
    slot: "isha",
    kind: "quran",
    weight: 3,
    title: { en: "Surah al-Mulk at night", bn: "রাতে সূরা আল-মুলক", ur: "رات کو سورۂ ملک" },
    sub: { en: "Qur'an 67 · 30 verses", bn: "কুরআন ৬৭ · ৩০ আয়াত", ur: "قرآن ۶۷ · ۳۰ آیات" },
    virtue: {
      en: "A surah of thirty verses interceded for a man until he was forgiven: Tabarak alladhi biyadihil-mulk.",
      bn: "ত্রিশ আয়াতের একটি সূরা এক ব্যক্তির জন্য সুপারিশ করেছে, শেষে তাকে ক্ষমা করা হয়েছে: তাবারাকাল্লাযী বিয়াদিহিল মুলক।",
      ur: "تیس آیات کی ایک سورت نے ایک شخص کی شفاعت کی یہاں تک کہ اسے بخش دیا گیا: تبارک الذی بیدہ الملک۔",
    },
    refs: [tirmidhi(2891), tirmidhi(2892)],
    auto: { type: "surah", chapter: 67, fromAyah: 30 },
    href: "/quran/surah/67",
  },
  {
    id: "sajdah",
    opens: { at: "maghrib" },
    slot: "isha",
    kind: "quran",
    weight: 2,
    title: { en: "Surah as-Sajdah at night", bn: "রাতে সূরা আস-সাজদা", ur: "رات کو سورۂ سجدہ" },
    sub: { en: "Qur'an 32 · 30 verses", bn: "কুরআন ৩২ · ৩০ আয়াত", ur: "قرآن ۳۲ · ۳۰ آیات" },
    virtue: {
      en: "The Prophet ﷺ would not sleep until he had recited Alif-Lam-Mim Tanzil (as-Sajdah) and Tabarak (al-Mulk).",
      bn: "নবী ﷺ আলিফ-লাম-মীম তানযীল (আস-সাজদা) ও তাবারাক (আল-মুলক) না পড়ে ঘুমাতেন না।",
      ur: "نبی ﷺ الم تنزیل (سجدہ) اور تبارک (ملک) پڑھے بغیر نہیں سوتے تھے۔",
    },
    refs: [tirmidhi(2892)],
    auto: { type: "surah", chapter: 32, fromAyah: 30 },
    href: "/quran/surah/32",
    optional: true,
  },
  {
    id: "baqarah-end",
    opens: { at: "maghrib" },
    slot: "isha",
    kind: "quran",
    weight: 2,
    title: { en: "Last two verses of al-Baqarah", bn: "সূরা বাকারার শেষ দুই আয়াত", ur: "سورۂ بقرہ کی آخری دو آیات" },
    sub: { en: "Qur'an 2:285–286, at night", bn: "কুরআন ২:২৮৫–২৮৬, রাতে", ur: "قرآن ۲:۲۸۵–۲۸۶، رات کو" },
    virtue: {
      en: "Whoever recites the last two verses of Surah al-Baqarah at night, they will suffice him.",
      bn: "যে রাতে সূরা বাকারার শেষ দুই আয়াত পড়ে, তা তার জন্য যথেষ্ট হয়।",
      ur: "جو رات کو سورۂ بقرہ کی آخری دو آیات پڑھے، وہ اس کے لیے کافی ہوں گی۔",
    },
    refs: [bukhari(5009)],
    auto: { type: "surah", chapter: 2, fromAyah: 286 },
    href: "/quran/surah/2?ayah=285",
  },
  {
    id: "witr",
    opens: { at: "isha" },
    slot: "night",
    kind: "sunnah",
    weight: 5,
    title: { en: "Witr", bn: "বিতর", ur: "وتر" },
    sub: {
      en: "After Isha, before Fajr · wajib in the Hanafi school, sunnah mu'akkadah in others",
      bn: "এশার পর, ফজরের আগে · হানাফি মাযহাবে ওয়াজিব, অন্যদের মতে সুন্নাতে মুয়াক্কাদা",
      ur: "عشاء کے بعد، فجر سے پہلے · حنفی مسلک میں واجب، دوسروں کے ہاں سنتِ مؤکدہ",
    },
    virtue: { en: "“Make Witr the last of your prayer at night.”", bn: "“তোমাদের রাতের সালাতের শেষটি বিতর বানাও।”", ur: "“رات کی اپنی آخری نماز وتر بناؤ۔”" },
    refs: [bukhari(998), abudawud(1416)],
  },
  {
    id: "sleep-adhkar",
    opens: { at: "maghrib" },
    slot: "night",
    kind: "adhkar",
    weight: 2,
    title: { en: "Before sleep: Ayat al-Kursi & the three Quls", bn: "ঘুমের আগে: আয়াতুল কুরসি ও তিন কুল", ur: "سونے سے پہلے: آیت الکرسی اور تینوں قل" },
    sub: { en: "Blow into the hands and wipe over the body, three times", bn: "হাতে ফুঁ দিয়ে শরীরে মুছে নিন, তিনবার", ur: "ہاتھوں میں پھونک کر جسم پر پھیریں، تین بار" },
    virtue: {
      en: "Whoever recites Ayat al-Kursi in bed has a guardian from Allah through the night, and no devil comes near him until morning.",
      bn: "যে বিছানায় আয়াতুল কুরসি পড়ে, সারা রাত আল্লাহর পক্ষ থেকে একজন প্রহরী থাকে এবং সকাল পর্যন্ত শয়তান কাছে আসে না।",
      ur: "جو بستر پر آیت الکرسی پڑھے، رات بھر اللہ کی طرف سے اس پر ایک نگہبان رہتا ہے اور صبح تک شیطان قریب نہیں آتا۔",
    },
    refs: [bukhari(2311), bukhari(5017)],
  },
  {
    id: "tahajjud",
    opens: { at: "isha" },
    slot: "night",
    kind: "nafl",
    weight: 3,
    title: { en: "Tahajjud (night prayer)", bn: "তাহাজ্জুদ", ur: "تہجد" },
    sub: { en: "Any number of rak'ahs in pairs, ideally the last third of the night", bn: "জোড়ায় জোড়ায় যত রাকাত ইচ্ছা, উত্তম রাতের শেষ তৃতীয়াংশে", ur: "جوڑوں میں جتنی رکعتیں چاہیں، بہتر رات کا آخری تہائی" },
    virtue: {
      en: "The best prayer after the obligatory prayers is the prayer at night.",
      bn: "ফরজ সালাতের পর সর্বোত্তম সালাত হলো রাতের সালাত।",
      ur: "فرض نمازوں کے بعد سب سے افضل نماز رات کی نماز ہے۔",
    },
    refs: [muslim(1163)],
  },
  {
    id: "istighfar",
    slot: "day",
    kind: "adhkar",
    weight: 2,
    goal: 100,
    title: { en: "Istighfar", bn: "ইস্তিগফার", ur: "استغفار" },
    sub: { en: "Astaghfirullah — counted in the Zikr counter", bn: "আস্তাগফিরুল্লাহ — জিকির কাউন্টারে গণনা হয়", ur: "استغفر اللہ — ذکر کاؤنٹر میں گنا جاتا ہے" },
    virtue: {
      en: "The Prophet ﷺ said: “I seek Allah's forgiveness a hundred times a day.”",
      bn: "নবী ﷺ বলেছেন: “আমি দিনে একশ বার আল্লাহর কাছে ক্ষমা চাই।”",
      ur: "نبی ﷺ نے فرمایا: “میں دن میں سو بار اللہ سے مغفرت مانگتا ہوں۔”",
    },
    refs: [muslim(2702), bukhari(6307)],
    auto: { type: "count", counter: "istighfar" },
    href: "/zikr?tab=free&z=astaghfirullah",
  },
  {
    id: "durood",
    slot: "day",
    kind: "adhkar",
    weight: 2,
    goal: 10,
    title: { en: "Durood (salawat)", bn: "দরুদ শরিফ", ur: "درود شریف" },
    sub: { en: "Your daily goal — counted in the Zikr counter", bn: "আপনার দৈনিক লক্ষ্য — জিকির কাউন্টারে গণনা হয়", ur: "آپ کا روزانہ ہدف — ذکر کاؤنٹر میں گنا جاتا ہے" },
    virtue: {
      en: "Whoever sends one blessing on the Prophet ﷺ, Allah sends ten blessings on him.",
      bn: "যে নবী ﷺ-এর ওপর একবার দরুদ পড়ে, আল্লাহ তার ওপর দশটি রহমত পাঠান।",
      ur: "جو نبی ﷺ پر ایک بار درود بھیجے، اللہ اس پر دس رحمتیں بھیجتا ہے۔",
    },
    refs: [muslim(408)],
    auto: { type: "count", counter: "durood" },
    href: "/zikr?tab=free&z=durood",
  },
  {
    id: "quran-daily",
    slot: "day",
    kind: "quran",
    weight: 3,
    goal: 10,
    title: { en: "Read the Qur'an", bn: "কুরআন তিলাওয়াত", ur: "قرآن کی تلاوت" },
    sub: { en: "Verses read in the app today", bn: "আজ অ্যাপে পড়া আয়াত", ur: "آج ایپ میں پڑھی گئی آیات" },
    virtue: {
      en: "Read the Qur'an, for it will come on the Day of Resurrection as an intercessor for its companions.",
      bn: "কুরআন পড়ো, কারণ কিয়ামতের দিন তা তার পাঠকদের জন্য সুপারিশকারী হয়ে আসবে।",
      ur: "قرآن پڑھو، کیونکہ یہ قیامت کے دن اپنے پڑھنے والوں کا سفارشی بن کر آئے گا۔",
    },
    refs: [muslim(804)],
    auto: { type: "count", counter: "ayahs" },
    href: "/quran",
  },
  // ── Friday ──
  {
    id: "jumuah-ghusl",
    opens: { at: "fajr" },
    slot: "morning",
    kind: "sunnah",
    weight: 2,
    friday: true,
    title: { en: "Ghusl for Jumu'ah", bn: "জুমার গোসল", ur: "جمعہ کا غسل" },
    sub: { en: "Before going to the Friday prayer", bn: "জুমার সালাতে যাওয়ার আগে", ur: "جمعہ کی نماز کو جانے سے پہلے" },
    virtue: { en: "“When one of you comes to the Jumu'ah, let him take a bath.”", bn: "“তোমাদের কেউ জুমায় এলে সে যেন গোসল করে।”", ur: "“جب تم میں سے کوئی جمعہ کو آئے تو غسل کرے۔”" },
    refs: [bukhari(877)],
  },
  {
    id: "kahf",
    slot: "morning",
    kind: "quran",
    weight: 3,
    friday: true,
    title: { en: "Surah al-Kahf", bn: "সূরা আল-কাহফ", ur: "سورۂ کہف" },
    sub: { en: "From Thursday sunset until Friday sunset · Qur'an 18", bn: "বৃহস্পতিবার সূর্যাস্ত থেকে শুক্রবার সূর্যাস্ত পর্যন্ত · কুরআন ১৮", ur: "جمعرات کے غروب سے جمعہ کے غروب تک · قرآن ۱۸" },
    virtue: {
      en: "Whoever reads Surah al-Kahf on Friday, a light will shine for him between the two Fridays.",
      bn: "যে জুমার দিন সূরা কাহফ পড়ে, দুই জুমার মাঝে তার জন্য নূর আলোকিত থাকে।",
      ur: "جو جمعہ کے دن سورۂ کہف پڑھے، دو جمعوں کے درمیان اس کے لیے نور روشن رہتا ہے۔",
    },
    refs: [{ label: "al-Hakim, al-Mustadrak 2/399; al-Bayhaqi 3/249 — sahih per al-Albani, Sahih al-Jami' 6470", url: "https://islamqa.info/en/answers/10700" }],
    auto: { type: "surah", chapter: 18, fromAyah: 110 },
    href: "/quran/surah/18",
  },
  {
    id: "jumuah-early",
    opens: { at: "sunrise" },
    slot: "dhuhr",
    kind: "sunnah",
    weight: 2,
    friday: true,
    title: { en: "Go early to Jumu'ah", bn: "আগেভাগে জুমায় যাওয়া", ur: "جمعہ کے لیے جلدی جانا" },
    sub: { en: "Listen to the khutbah attentively", bn: "মনোযোগ দিয়ে খুতবা শুনুন", ur: "خطبہ توجہ سے سنیں" },
    virtue: {
      en: "Whoever goes in the first hour is like one who offered a camel; the angels stop recording when the imam comes out.",
      bn: "যে প্রথম ঘণ্টায় যায় সে যেন একটি উট কুরবানি করল; ইমাম বের হলে ফেরেশতারা লেখা বন্ধ করে খুতবা শোনেন।",
      ur: "جو پہلی گھڑی میں جائے گویا اس نے اونٹ قربان کیا؛ امام کے آنے پر فرشتے لکھنا بند کر کے خطبہ سنتے ہیں۔",
    },
    refs: [bukhari(881)],
  },
  {
    id: "friday-hour",
    opens: { at: "asr" },
    slot: "asr",
    kind: "dua",
    weight: 2,
    friday: true,
    title: { en: "Dua in the last hour of Friday", bn: "জুমার দিনের শেষ প্রহরে দোয়া", ur: "جمعہ کی آخری گھڑی میں دعا" },
    sub: { en: "After Asr until Maghrib", bn: "আসরের পর থেকে মাগরিব পর্যন্ত", ur: "عصر کے بعد سے مغرب تک" },
    virtue: {
      en: "On Friday there is an hour in which a Muslim asks Allah for good and He gives it — seek it in the last hour after Asr.",
      bn: "জুমার দিনে এমন একটি সময় আছে, তখন মুসলিম আল্লাহর কাছে কল্যাণ চাইলে তিনি দেন — আসরের পরের শেষ সময়ে তা খোঁজো।",
      ur: "جمعہ میں ایک گھڑی ہے جس میں مسلمان اللہ سے خیر مانگے تو وہ عطا کرتا ہے — اسے عصر کے بعد آخری گھڑی میں تلاش کرو۔",
    },
    refs: [bukhari(935), abudawud(1048)],
  },
  {
    id: "friday-durood",
    slot: "day",
    kind: "adhkar",
    weight: 2,
    friday: true,
    goal: 100,
    title: { en: "Abundant durood on Friday", bn: "জুমার দিনে বেশি বেশি দরুদ", ur: "جمعہ کو کثرت سے درود" },
    sub: { en: "Your Friday goal — counted in the Zikr counter", bn: "আপনার জুমার লক্ষ্য — জিকির কাউন্টারে গণনা হয়", ur: "آپ کا جمعہ کا ہدف — ذکر کاؤنٹر میں گنا جاتا ہے" },
    virtue: {
      en: "“Send much blessing on me on Friday, for your blessings are presented to me.”",
      bn: "“জুমার দিনে আমার ওপর বেশি বেশি দরুদ পড়ো, কারণ তোমাদের দরুদ আমার কাছে পেশ করা হয়।”",
      ur: "“جمعہ کے دن مجھ پر کثرت سے درود بھیجو، کیونکہ تمہارا درود مجھ پر پیش کیا جاتا ہے۔”",
    },
    refs: [abudawud(1047)],
    auto: { type: "count", counter: "durood" },
    href: "/zikr?tab=free&z=durood",
  },
];

export const AMAL_ITEMS: AmalItem[] = [...PRAYERS.flatMap(prayerItems), ...OTHER];
export const AMAL_BY_ID = new Map(AMAL_ITEMS.map((i) => [i.id, i]));

/** Friday: Dhuhr is replaced by the Jumu'ah prayer (2 rak'ahs with the khutbah; those not attending pray Dhuhr). */
export const JUMUAH_TITLE: GText = { en: "Jumu'ah (or Dhuhr) — fard", bn: "জুমা (অথবা যোহর) — ফরজ", ur: "جمعہ (یا ظہر) — فرض" };
export const JUMUAH_SUB: GText = {
  en: "2 rak'ahs with the khutbah; those who don't attend pray 4 of Dhuhr",
  bn: "খুতবাসহ ২ রাকাত; যারা জুমায় যান না তারা যোহরের ৪ রাকাত পড়বেন",
  ur: "خطبے کے ساتھ ۲ رکعتیں؛ جو جمعہ میں نہ جائیں وہ ظہر کی ۴ پڑھیں",
};

/** Order of the day on the tracker. */
export const SLOTS: AmalSlot[] = ["fajr", "morning", "dhuhr", "asr", "maghrib", "isha", "night", "day"];

/** The surah whose last verse marks the reading as complete (Qur'an reader). */
export const SURAH_ITEMS = AMAL_ITEMS.filter((i) => i.auto?.type === "surah") as (AmalItem & { auto: { type: "surah"; chapter: number; fromAyah: number } })[];

/** Zikr ids from the Zikr counter that count towards a counter. */
export const ZIKR_COUNTERS: Record<string, AmalCounter> = {
  astaghfirullah: "istighfar",
  durood: "durood",
  "salat-ibrahimiyyah": "durood",
};
