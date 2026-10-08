/**
 * Salat al-Janazah (funeral prayer) — step-by-step tutorial content.
 *
 * Every text below carries its source. Hadith texts were checked word-for-word
 * against the Arabic of the collections (sunnah.com numbering).
 * Where the schools differ, both practices are shown and labelled — nothing
 * is presented as the only valid way when the scholars differ.
 */
import type { GText } from "./travel";

export type JRef = { label: string; detail?: GText };

/** Which deceased the prayer is for: changes where the imam stands and which dua is shown. */
export type Deceased = "man" | "woman" | "child";
/** "haramain" = what the imams of Masjid al-Haram and Masjid an-Nabawi do (Hanbali). */
export type Method = "haramain" | "hanafi";

export type JText = {
  id: string;
  title: GText;
  arabic: string;
  translit: GText;
  meaning: GText;
  refs: JRef[];
  note?: GText;
  /** In-app link to the full text instead of (or as well as) reproducing it. */
  link?: string;
};

export const FATIHA: JText = {
  id: "fatiha",
  title: { en: "Surah al-Fatiha (silently)", bn: "সূরা ফাতিহা (নিঃশব্দে)", ur: "سورۃ الفاتحہ (آہستہ)" },
  arabic:
    "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝ الرَّحْمَٰنِ الرَّحِيمِ ۝ مَالِكِ يَوْمِ الدِّينِ ۝ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ۝ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
  translit: {
    en: "Bismi-llāhi-r-raḥmāni-r-raḥīm. Al-ḥamdu li-llāhi rabbi-l-ʿālamīn. Ar-raḥmāni-r-raḥīm. Māliki yawmi-d-dīn. Iyyāka naʿbudu wa iyyāka nastaʿīn. Ihdina-ṣ-ṣirāṭa-l-mustaqīm. Ṣirāṭa-lladhīna anʿamta ʿalayhim, ghayri-l-maghḍūbi ʿalayhim wa la-ḍ-ḍāllīn.",
    bn: "বিসমিল্লা-হির রাহমা-নির রাহীম। আলহামদু লিল্লা-হি রাব্বিল আ-লামীন। আর রাহমা-নির রাহীম। মা-লিকি ইয়াওমিদ দীন। ইয়্যা-কা না'বুদু ওয়া ইয়্যা-কা নাসতা'ঈন। ইহদিনাস সিরা-তাল মুসতাক্বীম। সিরা-তাল্লাযীনা আন'আমতা আলাইহিম, গাইরিল মাগদূবি আলাইহিম ওয়ালাদ দ্বা-ল্লীন।",
  },
  meaning: {
    en: "In the name of Allah, the Most Merciful, the Especially Merciful. All praise is for Allah, Lord of the worlds, the Most Merciful, the Especially Merciful, Master of the Day of Judgement. You alone we worship and You alone we ask for help. Guide us to the straight path — the path of those You have blessed, not of those who earned anger, nor of those who went astray.",
    bn: "পরম করুণাময়, অতি দয়ালু আল্লাহর নামে। সব প্রশংসা আল্লাহর, যিনি জগতসমূহের রব; পরম করুণাময়, অতি দয়ালু; বিচার দিনের মালিক। আমরা কেবল আপনারই ইবাদত করি এবং কেবল আপনারই সাহায্য চাই। আমাদের সরল পথ দেখান — তাদের পথ যাদের আপনি নিয়ামত দিয়েছেন; তাদের নয় যারা ক্রোধের শিকার, আর তাদেরও নয় যারা পথভ্রষ্ট।",
  },
  refs: [
    { label: "Qur'an 1:1–7" },
    { label: "Sahih al-Bukhari 1335", detail: { en: "Ibn ʿAbbas recited al-Fatiha in a funeral prayer and said: “so that they know it is the Sunnah.”", bn: "ইবনে আব্বাস (রা.) জানাযায় ফাতিহা পড়ে বললেন: “যাতে তারা জানে এটি সুন্নাহ।”" } },
    { label: "Sunan an-Nasa'i 1989", detail: { en: "Abu Umamah: the Sunnah is to recite Umm al-Qur'an quietly after the first takbir, then three takbirs, and the salam after the last.", bn: "আবু উমামা (রা.): সুন্নাহ হলো প্রথম তাকবিরের পর নিঃশব্দে উম্মুল কুরআন পড়া, তারপর আরও তিন তাকবির, আর শেষেরটির পর সালাম।" } },
  ],
  link: "/quran/surah/1",
};

export const THANA: JText = {
  id: "thana",
  title: { en: "Thana (Hanafi practice)", bn: "সানা (হানাফি নিয়ম)", ur: "ثنا (حنفی طریقہ)" },
  arabic: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَى جَدُّكَ، وَلَا إِلَهَ غَيْرُكَ",
  translit: {
    en: "Subḥānaka-llāhumma wa bi-ḥamdika, wa tabāraka-smuka, wa taʿālā jadduka, wa lā ilāha ghayruk.",
    bn: "সুবহা-নাকাল্লা-হুম্মা ওয়া বিহামদিকা, ওয়া তাবা-রাকাসমুকা, ওয়া তা'আ-লা- জাদ্দুকা, ওয়া লা- ইলা-হা গাইরুক।",
  },
  meaning: {
    en: "Glory be to You, O Allah, and all praise; blessed is Your name, exalted is Your majesty, and there is no god besides You.",
    bn: "হে আল্লাহ, আপনি পবিত্র, সব প্রশংসা আপনার; আপনার নাম বরকতময়, আপনার মর্যাদা সমুচ্চ, আর আপনি ছাড়া কোনো ইলাহ নেই।",
  },
  refs: [{ label: "Sunan Abi Dawud 776" }, { label: "Jami' at-Tirmidhi 243" }],
  note: {
    en: "In the Hanafi school, Thana is read after the first takbir instead of al-Fatiha. Both practices are followed by major schools.",
    bn: "হানাফি মাযহাবে প্রথম তাকবিরের পর ফাতিহার বদলে সানা পড়া হয়। দুটি নিয়মই প্রসিদ্ধ মাযহাবে অনুসৃত।",
  },
};

export const DUROOD: JText = {
  id: "durood",
  title: { en: "Salat al-Ibrahimiyyah (Durood)", bn: "দরুদে ইবরাহিম", ur: "درودِ ابراہیمی" },
  arabic:
    "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ",
  translit: {
    en: "Allāhumma ṣalli ʿalā Muḥammadin wa ʿalā āli Muḥammad, kamā ṣallayta ʿalā Ibrāhīma wa ʿalā āli Ibrāhīm, innaka ḥamīdun majīd. Allāhumma bārik ʿalā Muḥammadin wa ʿalā āli Muḥammad, kamā bārakta ʿalā Ibrāhīma wa ʿalā āli Ibrāhīm, innaka ḥamīdun majīd.",
    bn: "আল্লা-হুম্মা সাল্লি আলা- মুহাম্মাদিওঁ ওয়া আলা- আ-লি মুহাম্মাদ, কামা- সাল্লাইতা আলা- ইবরা-হীমা ওয়া আলা- আ-লি ইবরা-হীম, ইন্নাকা হামীদুম মাজীদ। আল্লা-হুম্মা বা-রিক আলা- মুহাম্মাদিওঁ ওয়া আলা- আ-লি মুহাম্মাদ, কামা- বা-রাকতা আলা- ইবরা-হীমা ওয়া আলা- আ-লি ইবরা-হীম, ইন্নাকা হামীদুম মাজীদ।",
  },
  meaning: {
    en: "O Allah, send blessings upon Muhammad and the family of Muhammad, as You sent blessings upon Ibrahim and the family of Ibrahim; You are Praiseworthy, Glorious. O Allah, bless Muhammad and the family of Muhammad, as You blessed Ibrahim and the family of Ibrahim; You are Praiseworthy, Glorious.",
    bn: "হে আল্লাহ, মুহাম্মাদ ও তাঁর পরিবারের উপর রহমত বর্ষণ করুন, যেমন ইবরাহিম ও তাঁর পরিবারের উপর করেছেন; নিশ্চয়ই আপনি প্রশংসিত, মহিমান্বিত। হে আল্লাহ, মুহাম্মাদ ও তাঁর পরিবারের উপর বরকত দিন, যেমন ইবরাহিম ও তাঁর পরিবারের উপর দিয়েছেন; নিশ্চয়ই আপনি প্রশংসিত, মহিমান্বিত।",
  },
  refs: [{ label: "Sahih al-Bukhari 3370" }],
};

const FORGIVE_ALL: JText = {
  id: "dua-all",
  title: { en: "Dua for all — the living and the dead", bn: "সবার জন্য দোয়া — জীবিত ও মৃত", ur: "سب کے لیے دعا — زندہ اور مردہ" },
  arabic:
    "اللَّهُمَّ اغْفِرْ لِحَيِّنَا وَمَيِّتِنَا وَصَغِيرِنَا وَكَبِيرِنَا وَذَكَرِنَا وَأُنْثَانَا وَشَاهِدِنَا وَغَائِبِنَا، اللَّهُمَّ مَنْ أَحْيَيْتَهُ مِنَّا فَأَحْيِهِ عَلَى الإِيمَانِ، وَمَنْ تَوَفَّيْتَهُ مِنَّا فَتَوَفَّهُ عَلَى الإِسْلاَمِ، اللَّهُمَّ لاَ تَحْرِمْنَا أَجْرَهُ وَلاَ تُضِلَّنَا بَعْدَهُ",
  translit: {
    en: "Allāhumma-ghfir li-ḥayyinā wa mayyitinā, wa ṣaghīrinā wa kabīrinā, wa dhakarinā wa unthānā, wa shāhidinā wa ghāʾibinā. Allāhumma man aḥyaytahu minnā fa-aḥyihi ʿala-l-īmān, wa man tawaffaytahu minnā fa-tawaffahu ʿala-l-islām. Allāhumma lā taḥrimnā ajrahu wa lā tuḍillanā baʿdah.",
    bn: "আল্লা-হুম্মাগফির লিহাইয়িনা- ওয়া মাইয়িতিনা-, ওয়া সাগীরিনা- ওয়া কাবীরিনা-, ওয়া যাকারিনা- ওয়া উনসা-না-, ওয়া শা-হিদিনা- ওয়া গা-য়িবিনা-। আল্লা-হুম্মা মান আহইয়াইতাহূ মিন্না- ফাআহয়িহী আলাল ঈমা-ন, ওয়া মান তাওয়াফফাইতাহূ মিন্না- ফাতাওয়াফফাহূ আলাল ইসলা-ম। আল্লা-হুম্মা লা- তাহরিমনা- আজরাহূ ওয়া লা- তুদ্বিল্লানা- বা'দাহ।",
  },
  meaning: {
    en: "O Allah, forgive our living and our dead, our young and our old, our males and our females, those present and those absent. O Allah, whoever of us You keep alive, keep him alive upon faith; and whoever of us You take, take him upon Islam. O Allah, do not deprive us of his reward, and do not let us go astray after him.",
    bn: "হে আল্লাহ, আমাদের জীবিত ও মৃত, ছোট ও বড়, পুরুষ ও নারী, উপস্থিত ও অনুপস্থিত সবাইকে ক্ষমা করুন। হে আল্লাহ, আমাদের মধ্যে যাকে আপনি জীবিত রাখেন তাকে ঈমানের উপর জীবিত রাখুন, আর যাকে মৃত্যু দেন তাকে ইসলামের উপর মৃত্যু দিন। হে আল্লাহ, আমাদেরকে তার সওয়াব থেকে বঞ্চিত করবেন না এবং তার পরে আমাদের পথভ্রষ্ট করবেন না।",
  },
  refs: [{ label: "Sunan Abi Dawud 3201", detail: { en: "Abu Hurayrah; graded sahih by al-Albani", bn: "আবু হুরায়রা (রা.); আলবানি সহিহ বলেছেন" } }],
  note: {
    en: "This dua is general (it covers everyone), so it can be read for a man, a woman, a child, or several deceased at once.",
    bn: "এই দোয়াটি সবার জন্য, তাই পুরুষ, নারী, শিশু বা একাধিক মৃতের জন্য একই রকম পড়া যায়।",
  },
};

const FORGIVE_HIM: JText = {
  id: "dua-awf",
  title: { en: "Dua for the deceased", bn: "মৃত ব্যক্তির জন্য দোয়া", ur: "میت کے لیے دعا" },
  arabic:
    "اللَّهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ وَاعْفُ عَنْهُ وَعَافِهِ، وَأَكْرِمْ نُزُلَهُ، وَوَسِّعْ مُدْخَلَهُ، وَاغْسِلْهُ بِمَاءٍ وَثَلْجٍ وَبَرَدٍ، وَنَقِّهِ مِنَ الْخَطَايَا كَمَا يُنَقَّى الثَّوْبُ الأَبْيَضُ مِنَ الدَّنَسِ، وَأَبْدِلْهُ دَارًا خَيْرًا مِنْ دَارِهِ، وَأَهْلاً خَيْرًا مِنْ أَهْلِهِ، وَزَوْجًا خَيْرًا مِنْ زَوْجِهِ، وَقِهِ فِتْنَةَ الْقَبْرِ وَعَذَابَ النَّارِ",
  translit: {
    en: "Allāhumma-ghfir lahu wa-rḥamhu wa-ʿfu ʿanhu wa ʿāfihi, wa akrim nuzulahu, wa wassiʿ mudkhalahu, wa-ghsilhu bi-māʾin wa thaljin wa barad, wa naqqihi mina-l-khaṭāyā kamā yunaqqa-th-thawbu-l-abyaḍu mina-d-danas, wa abdilhu dāran khayran min dārihi, wa ahlan khayran min ahlihi, wa zawjan khayran min zawjihi, wa qihi fitnata-l-qabri wa ʿadhāba-n-nār.",
    bn: "আল্লা-হুম্মাগফির লাহূ ওয়ারহামহু ওয়া'ফু আনহু ওয়া আ-ফিহী, ওয়া আকরিম নুযুলাহূ, ওয়া ওয়াসসি' মুদখালাহূ, ওয়াগসিলহু বিমা-ইন ওয়া সালজিন ওয়া বারাদ, ওয়া নাক্কিহী মিনাল খাতা-ইয়া- কামা- ইউনাক্কাস সাওবুল আবইয়াদু মিনাদ দানাস, ওয়া আবদিলহু দা-রান খাইরান মিন দা-রিহী, ওয়া আহলান খাইরান মিন আহলিহী, ওয়া যাওজান খাইরান মিন যাওজিহী, ওয়া ক্বিহী ফিতনাতাল ক্বাবরি ওয়া আযা-বান না-র।",
  },
  meaning: {
    en: "O Allah, forgive him, have mercy on him, pardon him and grant him well-being. Make his reception honourable and his entrance spacious. Wash him with water, snow and hail, and cleanse him of sins as a white garment is cleansed of dirt. Give him a home better than his home, a family better than his family and a spouse better than his spouse, and protect him from the trial of the grave and the punishment of the Fire.",
    bn: "হে আল্লাহ, তাকে ক্ষমা করুন, তার প্রতি দয়া করুন, তাকে মাফ করুন ও নিরাপত্তা দিন। তার আতিথেয়তা সম্মানজনক করুন, তার প্রবেশস্থল প্রশস্ত করুন। তাকে পানি, বরফ ও শিলা দিয়ে ধুয়ে দিন এবং গুনাহ থেকে এমনভাবে পরিষ্কার করুন যেমন সাদা কাপড় ময়লা থেকে পরিষ্কার করা হয়। তাকে তার ঘরের চেয়ে উত্তম ঘর, তার পরিবারের চেয়ে উত্তম পরিবার এবং তার জীবনসঙ্গীর চেয়ে উত্তম সঙ্গী দান করুন, আর তাকে কবরের ফিতনা ও জাহান্নামের আযাব থেকে রক্ষা করুন।",
  },
  refs: [{ label: "Sahih Muslim 963", detail: { en: "ʿAwf ibn Malik heard the Prophet ﷺ say this in a funeral prayer", bn: "আওফ ইবনে মালিক (রা.) নবী ﷺ-কে জানাযায় এটি বলতে শুনেছেন" } }],
};

const FEMININE_NOTE: GText = {
  en: "For a woman, scholars teach changing the pronoun “-hu” (him) to “-hā” (her): اللَّهُمَّ اغْفِرْ لَهَا وَارْحَمْهَا وَاعْفُ عَنْهَا وَعَافِهَا … — Allāhumma-ghfir lahā wa-rḥamhā …",
  bn: "নারীর জন্য আলেমগণ সর্বনাম “হু” (তার—পুরুষ) বদলে “হা” (তার—নারী) বলতে শেখান: اللَّهُمَّ اغْفِرْ لَهَا وَارْحَمْهَا وَاعْفُ عَنْهَا وَعَافِهَا … — আল্লা-হুম্মাগফির লাহা- ওয়ারহামহা- …",
};

const CHILD: JText = {
  id: "dua-child",
  title: { en: "Dua for a child", bn: "শিশুর জন্য দোয়া", ur: "بچے کے لیے دعا" },
  arabic: "اللَّهُمَّ اجْعَلْهُ لَنَا فَرَطًا وَسَلَفًا وَأَجْرًا",
  translit: { en: "Allāhumma-jʿalhu lanā faraṭan wa salafan wa ajrā.", bn: "আল্লা-হুম্মাজ'আলহু লানা- ফারাতাওঁ ওয়া সালাফাওঁ ওয়া আজরা-।" },
  meaning: {
    en: "O Allah, make him for us a forerunner (who goes ahead of us), a precursor and a reward.",
    bn: "হে আল্লাহ, তাকে আমাদের জন্য অগ্রগামী (যে আগে গিয়ে অপেক্ষা করে), পূর্বসূরি ও প্রতিদান বানিয়ে দিন।",
  },
  refs: [
    {
      label: "Sahih al-Bukhari, Book of Funerals",
      detail: {
        en: "chapter “Reciting al-Fatiha over the deceased” — saying of al-Hasan al-Basri (a Tabiʿi), quoted by al-Bukhari without a chain",
        bn: "অধ্যায় “জানাযায় ফাতিহা পড়া” — হাসান বসরি (তাবেয়ি)-র উক্তি, বুখারি সনদ ছাড়া উল্লেখ করেছেন",
      },
    },
  ],
  note: {
    en: "This is the statement of a Tabiʿi, not a hadith of the Prophet ﷺ. For a girl say اجْعَلْهَا (ijʿalhā). The general dua above also covers children (“our young”).",
    bn: "এটি একজন তাবেয়ির উক্তি, নবী ﷺ-এর হাদিস নয়। মেয়েশিশুর জন্য বলুন اجْعَلْهَا (ইজ'আলহা)। উপরের সাধারণ দোয়াতেও শিশুরা অন্তর্ভুক্ত (“আমাদের ছোটরা”)।",
  },
};

export const SALAM: JText = {
  id: "salam",
  title: { en: "Salam", bn: "সালাম", ur: "سلام" },
  arabic: "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ",
  translit: { en: "As-salāmu ʿalaykum wa raḥmatu-llāh", bn: "আসসালা-মু আলাইকুম ওয়া রাহমাতুল্লা-হ" },
  meaning: { en: "Peace be upon you and the mercy of Allah.", bn: "আপনাদের উপর শান্তি ও আল্লাহর রহমত বর্ষিত হোক।" },
  refs: [{ label: "Sunan an-Nasa'i 1989", detail: { en: "“…and the salam after the last (takbir)”", bn: "“…আর শেষ তাকবিরের পর সালাম”" } }],
};

/** Duas for the third takbir, depending on who the prayer is for. */
export function duasFor(d: Deceased): { texts: JText[]; note?: GText } {
  if (d === "child") return { texts: [FORGIVE_ALL, CHILD] };
  return { texts: [FORGIVE_HIM, FORGIVE_ALL], note: d === "woman" ? FEMININE_NOTE : undefined };
}

/** Animation poses of a figure. */
export type Pose = "stand" | "raise" | "fold" | "salamR" | "salamL";

export type JStep = {
  id: string;
  /** 0 = intention, 1–4 = takbir number. */
  takbir: 0 | 1 | 2 | 3 | 4;
  title: GText;
  body: GText;
  /** How long the step plays in the animation (ms). */
  ms: number;
};

export const STEPS: JStep[] = [
  {
    id: "niyyah",
    takbir: 0,
    title: { en: "Stand in rows & make the intention", bn: "কাতারে দাঁড়ান ও নিয়ত করুন", ur: "صف میں کھڑے ہوں اور نیت کریں" },
    body: {
      en: "Be in wudu and face the qibla. The imam stands by the bier, the people in rows behind him. Make the intention in your heart to pray the funeral prayer for this deceased — no special words need to be said aloud. There is no adhan or iqamah.",
      bn: "অজু অবস্থায় কিবলামুখী হোন। ইমাম খাটিয়ার পাশে দাঁড়ান, মুসল্লিরা তাঁর পেছনে কাতারে। মনে মনে এই মৃতের জানাযার নামাজ পড়ার নিয়ত করুন — মুখে নির্দিষ্ট কোনো শব্দ বলা জরুরি নয়। এতে আজান বা ইকামত নেই।",
      ur: "باوضو قبلہ رُخ ہوں۔ امام جنازے کے پاس اور لوگ اس کے پیچھے صفوں میں کھڑے ہوں۔ دل میں اس میت کی نمازِ جنازہ کی نیت کریں — زبان سے خاص الفاظ کہنا ضروری نہیں۔ اس میں اذان یا اقامت نہیں۔",
    },
    ms: 5000,
  },
  {
    id: "takbir-1",
    takbir: 1,
    title: { en: "1st takbir → al-Fatiha", bn: "১ম তাকবির → সূরা ফাতিহা", ur: "پہلی تکبیر ← سورۃ الفاتحہ" },
    body: {
      en: "The imam says “Allāhu akbar” aloud; you say it quietly, raise your hands to the shoulders or ears, then fold them on the chest. Recite al-Fatiha silently (Hanafi: Thana).",
      bn: "ইমাম জোরে “আল্লাহু আকবার” বলেন; আপনি নিঃশব্দে বলুন, দুই হাত কাঁধ বা কান পর্যন্ত তুলুন, তারপর বুকে বাঁধুন। নিঃশব্দে সূরা ফাতিহা পড়ুন (হানাফি: সানা)।",
      ur: "امام بلند آواز سے “اللہ اکبر” کہے؛ آپ آہستہ کہیں، ہاتھ کندھوں یا کانوں تک اٹھائیں، پھر سینے پر باندھیں۔ آہستہ سورۃ الفاتحہ پڑھیں (حنفی: ثنا)۔",
    },
    ms: 9000,
  },
  {
    id: "takbir-2",
    takbir: 2,
    title: { en: "2nd takbir → Durood Ibrahim", bn: "২য় তাকবির → দরুদে ইবরাহিম", ur: "دوسری تکبیر ← درودِ ابراہیمی" },
    body: {
      en: "Follow the imam's second takbir and send blessings on the Prophet ﷺ — the same Durood as in the tashahhud of salah.",
      bn: "ইমামের দ্বিতীয় তাকবিরের সাথে তাকবির বলুন এবং নবী ﷺ-এর উপর দরুদ পড়ুন — নামাজের তাশাহহুদের পরের দরুদে ইবরাহিম।",
      ur: "امام کی دوسری تکبیر کے ساتھ تکبیر کہیں اور نبی ﷺ پر درود پڑھیں — وہی درودِ ابراہیمی جو نماز میں پڑھتے ہیں۔",
    },
    ms: 9000,
  },
  {
    id: "takbir-3",
    takbir: 3,
    title: { en: "3rd takbir → dua for the deceased", bn: "৩য় তাকবির → মৃতের জন্য দোয়া", ur: "تیسری تکبیر ← میت کے لیے دعا" },
    body: {
      en: "After the third takbir, make sincere dua for the deceased. This is the heart of the prayer — use the authentic duas below, or any good dua if you don't know them.",
      bn: "তৃতীয় তাকবিরের পর আন্তরিকভাবে মৃতের জন্য দোয়া করুন। এটিই জানাযার মূল অংশ — নিচের সহিহ দোয়াগুলো পড়ুন, না জানলে যেকোনো ভালো দোয়া করুন।",
      ur: "تیسری تکبیر کے بعد میت کے لیے خلوص سے دعا کریں۔ یہی نماز کا اصل حصہ ہے — نیچے دی گئی صحیح دعائیں پڑھیں، یاد نہ ہوں تو کوئی بھی اچھی دعا کریں۔",
    },
    ms: 10000,
  },
  {
    id: "takbir-4",
    takbir: 4,
    title: { en: "4th takbir → salam", bn: "৪র্থ তাকবির → সালাম", ur: "چوتھی تکبیر ← سلام" },
    body: {
      en: "After the fourth takbir pause briefly, then end with salam. The imams of the Haramain give one salam to the right; in the Hanafi school two salams are given, right then left. There is no ruku, sujud or tashahhud in this prayer.",
      bn: "চতুর্থ তাকবিরের পর সামান্য থামুন, তারপর সালাম ফিরিয়ে শেষ করুন। হারামাইনের ইমামরা ডানদিকে এক সালাম দেন; হানাফি মাযহাবে দুই সালাম — প্রথমে ডানে, পরে বামে। এই নামাজে রুকু, সিজদা বা তাশাহহুদ নেই।",
      ur: "چوتھی تکبیر کے بعد ذرا ٹھہریں، پھر سلام پھیریں۔ حرمین کے امام دائیں طرف ایک سلام پھیرتے ہیں؛ حنفی مسلک میں دو سلام — پہلے دائیں پھر بائیں۔ اس نماز میں رکوع، سجدہ یا تشہد نہیں۔",
    },
    ms: 10000,
  },
];

/** What a figure is doing `t` ms into a step. Followers act `lag` ms after the imam. */
export function poseAt(step: JStep, t: number, method: Method): { pose: Pose; saying: "takbir" | "salam" | null } {
  if (step.takbir === 0) return { pose: "stand", saying: null };
  // Hands are raised at every takbir in the Haramain; Hanafis raise only at the first.
  const raises = method === "haramain" || step.takbir === 1;
  const startPose: Pose = step.takbir === 1 ? "stand" : "fold";
  if (t < 600) return { pose: startPose, saying: null };
  if (t < 2200) return { pose: raises ? "raise" : "fold", saying: "takbir" };
  if (step.takbir < 4) return { pose: "fold", saying: null };
  // 4th takbir: brief pause, then salam.
  if (t < 4600) return { pose: "fold", saying: null };
  if (t < 6800) return { pose: "salamR", saying: "salam" };
  if (method === "hanafi" && t < 8800) return { pose: "salamL", saying: "salam" };
  return { pose: "stand", saying: null };
}

/** Rules & virtues, each with its source. */
export const RULINGS: { id: string; text: GText; refs: JRef[] }[] = [
  {
    id: "four",
    text: {
      en: "The funeral prayer has four takbirs, all said standing — no ruku, no sujud.",
      bn: "জানাযার নামাজে চারটি তাকবির, সবই দাঁড়িয়ে — রুকু-সিজদা নেই।",
      ur: "نمازِ جنازہ میں چار تکبیریں ہیں، سب کھڑے ہو کر — رکوع اور سجدہ نہیں۔",
    },
    refs: [{ label: "Sahih al-Bukhari 1245" }, { label: "Sahih Muslim 951" }],
  },
  {
    id: "order",
    text: {
      en: "Order taught by the Hanafi, Shafiʿi and Hanbali schools: 1st takbir — al-Fatiha (Hanafi: Thana); 2nd — Durood; 3rd — dua for the deceased; 4th — salam.",
      bn: "হানাফি, শাফেয়ি ও হাম্বলি মাযহাবে শেখানো ক্রম: ১ম তাকবির — ফাতিহা (হানাফি: সানা); ২য় — দরুদ; ৩য় — মৃতের জন্য দোয়া; ৪র্থ — সালাম।",
      ur: "حنفی، شافعی اور حنبلی مسالک کی ترتیب: پہلی تکبیر — فاتحہ (حنفی: ثنا)؛ دوسری — درود؛ تیسری — میت کے لیے دعا؛ چوتھی — سلام۔",
    },
    refs: [{ label: "Sunan an-Nasa'i 1989" }, { label: "Sahih al-Bukhari 1335" }],
  },
  {
    id: "position",
    text: {
      en: "The imam stands level with the head of a man and the middle of a woman.",
      bn: "ইমাম পুরুষের মাথা বরাবর এবং নারীর মাঝ বরাবর দাঁড়ান।",
      ur: "امام مرد کے سر کے برابر اور عورت کے درمیان کے برابر کھڑا ہو۔",
    },
    refs: [
      { label: "Sunan Abi Dawud 3194", detail: { en: "Anas stood level with a man's head", bn: "আনাস (রা.) পুরুষের মাথা বরাবর দাঁড়িয়েছিলেন" } },
      { label: "Sahih al-Bukhari 1332", detail: { en: "the Prophet ﷺ stood at the middle of a woman", bn: "নবী ﷺ নারীর মাঝ বরাবর দাঁড়িয়েছিলেন" } },
      { label: "Sahih Muslim 964" },
    ],
  },
  {
    id: "hands",
    text: {
      en: "Hands: in the Haramain (Hanbali, Shafiʿi) they are raised at every takbir; in the Hanafi school only at the first. Follow your school — both are valid.",
      bn: "হাত তোলা: হারামাইনে (হাম্বলি, শাফেয়ি) প্রতি তাকবিরে হাত তোলা হয়; হানাফি মাযহাবে শুধু প্রথম তাকবিরে। নিজের মাযহাব অনুসরণ করুন — দুটোই গ্রহণযোগ্য।",
      ur: "ہاتھ اٹھانا: حرمین میں (حنبلی، شافعی) ہر تکبیر پر؛ حنفی مسلک میں صرف پہلی تکبیر پر۔ اپنے مسلک پر عمل کریں — دونوں درست ہیں۔",
    },
    refs: [],
  },
  {
    id: "late",
    text: {
      en: "Joined late? Say the takbir and follow the imam. According to most scholars, after the imam's salam you complete the takbirs you missed before giving salam.",
      bn: "দেরিতে যোগ দিলে? তাকবির বলে ইমামের অনুসরণ করুন। অধিকাংশ আলেমের মতে ইমামের সালামের পর ছুটে যাওয়া তাকবিরগুলো পূরণ করে তারপর সালাম দিন।",
      ur: "دیر سے شامل ہوئے؟ تکبیر کہہ کر امام کی پیروی کریں۔ اکثر علما کے نزدیک امام کے سلام کے بعد چھوٹی ہوئی تکبیریں پوری کر کے سلام پھیریں۔",
    },
    refs: [],
  },
  {
    id: "reward",
    text: {
      en: "Reward: whoever attends until the prayer is offered gets one qirat; whoever stays until the burial gets two — each like a great mountain.",
      bn: "সওয়াব: যে নামাজ পর্যন্ত উপস্থিত থাকে সে এক কিরাত পায়; যে দাফন পর্যন্ত থাকে সে দুই কিরাত — প্রতিটি বিশাল পাহাড়ের মতো।",
      ur: "اجر: جو نماز تک شریک رہے اسے ایک قیراط، اور جو دفن تک رہے اسے دو قیراط — ہر ایک بڑے پہاڑ کی مانند۔",
    },
    refs: [{ label: "Sahih al-Bukhari 1325" }, { label: "Sahih Muslim 945" }],
  },
];

/** Practical tips for the Haramain, where a funeral prayer follows most obligatory prayers. */
export const HARAM_TIPS: GText[] = [
  {
    en: "In Masjid al-Haram and Masjid an-Nabawi a funeral prayer is often announced straight after the obligatory prayer — stay standing in your place and join.",
    bn: "মসজিদুল হারাম ও মসজিদে নববীতে প্রায়ই ফরজ নামাজের পরপরই জানাযার ঘোষণা হয় — নিজের জায়গায় দাঁড়িয়ে থাকুন ও শরিক হোন।",
    ur: "مسجد الحرام اور مسجد نبوی میں اکثر فرض نماز کے فوراً بعد جنازے کا اعلان ہوتا ہے — اپنی جگہ کھڑے رہیں اور شامل ہوں۔",
  },
  {
    en: "Men and women can both join from wherever they are praying; you do not need to see the bier.",
    bn: "পুরুষ ও নারী উভয়েই যেখানে নামাজ পড়ছেন সেখান থেকেই শরিক হতে পারেন; খাটিয়া দেখা জরুরি নয়।",
    ur: "مرد اور عورتیں دونوں جہاں نماز پڑھ رہے ہوں وہیں سے شامل ہو سکتے ہیں؛ جنازہ دیکھنا ضروری نہیں۔",
  },
  {
    en: "Listen for the imam's “Allāhu akbar” — there are only four, and the salam comes right after the fourth. Don't go down for ruku or sujud.",
    bn: "ইমামের “আল্লাহু আকবার” মনোযোগ দিয়ে শুনুন — মাত্র চারটি, চতুর্থটির পরেই সালাম। রুকু বা সিজদায় যাবেন না।",
    ur: "امام کی “اللہ اکبر” غور سے سنیں — صرف چار ہیں، اور چوتھی کے بعد سلام۔ رکوع یا سجدے میں نہ جائیں۔",
  },
];
