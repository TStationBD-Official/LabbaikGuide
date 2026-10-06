import type { Dua } from "@/types/content";

/**
 * Dua library. Every entry cites its Quran or hadith source. Arabic wording
 * follows the cited source; pronunciation and meaning are aids, not replacements.
 * Content should be reviewed by a qualified scholar before publication.
 */
export const DUAS: Dua[] = [
  {
    id: "talbiyah",
    categories: ["umrah", "hajj"],
    title: { bn: "তালবিয়াহ", en: "Talbiyah" },
    arabic:
      "لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لَا شَرِيكَ لَكَ",
    pronunciation: {
      bn: "লাব্বাইকা আল্লা-হুম্মা লাব্বাইক, লাব্বাইকা লা- শারীকা লাকা লাব্বাইক, ইন্নাল হামদা ওয়ান নি‘মাতা লাকা ওয়াল মুলক, লা- শারীকা লাক",
      en: "Labbayka-llāhumma labbayk, labbayka lā sharīka laka labbayk, inna-l-ḥamda wa-n-niʿmata laka wa-l-mulk, lā sharīka lak",
    },
    meaning: {
      bn: "আমি হাজির, হে আল্লাহ, আমি হাজির। আমি হাজির, আপনার কোনো শরিক নেই, আমি হাজির। নিশ্চয়ই সকল প্রশংসা, নিয়ামত ও রাজত্ব আপনারই, আপনার কোনো শরিক নেই।",
      en: "Here I am, O Allah, here I am. Here I am, You have no partner, here I am. Surely all praise, blessings and dominion are Yours. You have no partner.",
    },
    references: [{ label: "Sahih al-Bukhari 1549" }, { label: "Sahih Muslim 1184" }],
    note: {
      bn: "ইহরামের নিয়তের পর থেকে উমরাহয় তাওয়াফ শুরুর আগ পর্যন্ত পড়া হয়। পুরুষরা উচ্চস্বরে, নারীরা নিচুস্বরে।",
      en: "Recited after making the intention of ihram until starting Tawaf in Umrah. Men raise their voices; women recite quietly.",
    },
  },
  {
    id: "masjid-enter",
    categories: ["masjid", "umrah"],
    title: { bn: "মসজিদে প্রবেশের দোয়া", en: "Entering the masjid" },
    arabic: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
    pronunciation: { bn: "আল্লা-হুম্মাফ তাহ লী আবওয়া-বা রাহমাতিক", en: "Allāhumma-ftaḥ lī abwāba raḥmatik" },
    meaning: { bn: "হে আল্লাহ, আমার জন্য আপনার রহমতের দরজাগুলো খুলে দিন।", en: "O Allah, open for me the doors of Your mercy." },
    references: [{ label: "Sahih Muslim 713" }],
  },
  {
    id: "masjid-exit",
    categories: ["masjid"],
    title: { bn: "মসজিদ থেকে বের হওয়ার দোয়া", en: "Leaving the masjid" },
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ",
    pronunciation: { bn: "আল্লা-হুম্মা ইন্নী আসআলুকা মিন ফাদলিক", en: "Allāhumma innī asʾaluka min faḍlik" },
    meaning: { bn: "হে আল্লাহ, আমি আপনার কাছে আপনার অনুগ্রহ প্রার্থনা করি।", en: "O Allah, I ask You of Your bounty." },
    references: [{ label: "Sahih Muslim 713" }],
  },
  {
    id: "tawaf-takbir",
    categories: ["tawaf", "umrah", "hajj"],
    title: { bn: "হাজরে আসওয়াদের বরাবর তাকবির", en: "Takbir at the Black Stone" },
    arabic: "اللَّهُ أَكْبَرُ",
    pronunciation: { bn: "আল্লা-হু আকবার", en: "Allāhu akbar" },
    meaning: { bn: "আল্লাহ সর্বশ্রেষ্ঠ", en: "Allah is the Greatest" },
    references: [{ label: "Sahih al-Bukhari 1613" }],
    note: {
      bn: "প্রতি চক্করে হাজরে আসওয়াদের বরাবর এসে ইশারা করে তাকবির বলুন। কিছু বর্ণনায় শুরুতে ‘বিসমিল্লাহ’ যোগ করার কথা এসেছে।",
      en: "Say the takbir each time you pass the Black Stone, pointing towards it. Some narrations add “Bismillah” at the start.",
    },
  },
  {
    id: "rabbana-atina",
    categories: ["tawaf", "quranic", "umrah", "hajj"],
    title: { bn: "রুকনে ইয়ামানি ও হাজরে আসওয়াদের মাঝে", en: "Between the Yemeni Corner and the Black Stone" },
    arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    pronunciation: {
      bn: "রাব্বানা- আ-তিনা- ফিদ দুনইয়া- হাসানাতাওঁ ওয়া ফিল আ-খিরাতি হাসানাতাওঁ ওয়া কিনা- আযা-বান না-র",
      en: "Rabbanā ātinā fi-d-dunyā ḥasanatan wa fi-l-ākhirati ḥasanatan wa qinā ʿadhāba-n-nār",
    },
    meaning: {
      bn: "হে আমাদের রব, আমাদের দুনিয়াতে কল্যাণ দিন, আখিরাতে কল্যাণ দিন এবং আমাদের জাহান্নামের আযাব থেকে রক্ষা করুন।",
      en: "Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.",
    },
    references: [{ label: "Quran 2:201" }, { label: "Sunan Abi Dawud 1892" }],
  },
  {
    id: "maqam-ibrahim",
    categories: ["tawaf", "umrah", "hajj", "quranic"],
    title: { bn: "মাকামে ইবরাহিমের দিকে যাওয়ার সময়", en: "Approaching Maqam Ibrahim" },
    arabic: "وَاتَّخِذُوا مِن مَّقَامِ إِبْرَاهِيمَ مُصَلًّى",
    pronunciation: { bn: "ওয়াত্তাখিযূ মিম মাকা-মি ইবরা-হীমা মুসাল্লা", en: "Wattakhidhū min maqāmi Ibrāhīma muṣallā" },
    meaning: { bn: "আর তোমরা মাকামে ইবরাহিমকে নামাজের স্থান বানাও।", en: "And take the standing place of Ibrahim as a place of prayer." },
    references: [{ label: "Quran 2:125" }, { label: "Sahih Muslim 1218" }],
    note: {
      bn: "এরপর দুই রাকাত নামাজ। নবী ﷺ এতে সূরা কাফিরুন ও সূরা ইখলাস পড়েছেন (মুসলিম ১২১৮)।",
      en: "Then pray two rak'ahs. The Prophet ﷺ recited Surah al-Kafirun and Surah al-Ikhlas in them (Muslim 1218).",
    },
  },
  {
    id: "safa-verse",
    categories: ["sai", "umrah", "hajj", "quranic"],
    title: { bn: "সাফার কাছে পৌঁছে", en: "On approaching Safa" },
    arabic: "إِنَّ الصَّفَا وَالْمَرْوَةَ مِن شَعَائِرِ اللَّهِ — أَبْدَأُ بِمَا بَدَأَ اللَّهُ بِهِ",
    pronunciation: {
      bn: "ইন্নাস সাফা- ওয়াল মারওয়াতা মিন শা‘আ-ইরিল্লা-হ — আবদাউ বিমা- বাদাআল্লা-হু বিহ",
      en: "Inna-ṣ-Ṣafā wa-l-Marwata min shaʿāʾiri-llāh — Abdaʾu bimā badaʾa-llāhu bih",
    },
    meaning: {
      bn: "নিশ্চয়ই সাফা ও মারওয়া আল্লাহর নিদর্শনসমূহের অন্তর্ভুক্ত। — আমি শুরু করছি যা দিয়ে আল্লাহ শুরু করেছেন।",
      en: "Indeed Safa and Marwah are among the symbols of Allah. — I begin with what Allah began with.",
    },
    references: [{ label: "Quran 2:158" }, { label: "Sahih Muslim 1218" }],
    note: {
      bn: "এটি শুধু প্রথমবার সাফায় পৌঁছানোর সময় পড়া হয়।",
      en: "Recited only when first approaching Safa at the start of Sa'i.",
    },
  },
  {
    id: "safa-marwah-dhikr",
    categories: ["sai", "umrah", "hajj"],
    title: { bn: "সাফা ও মারওয়ার উপরে", en: "On Safa and Marwah" },
    arabic:
      "اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ، أَنْجَزَ وَعْدَهُ، وَنَصَرَ عَبْدَهُ، وَهَزَمَ الْأَحْزَابَ وَحْدَهُ",
    pronunciation: {
      bn: "আল্লা-হু আকবার (৩ বার), লা- ইলা-হা ইল্লাল্লা-হু ওয়াহদাহূ লা- শারীকা লাহ, লাহুল মুলকু ওয়া লাহুল হামদু ওয়া হুওয়া আলা- কুল্লি শাইয়িন কাদীর, লা- ইলা-হা ইল্লাল্লা-হু ওয়াহদাহ, আনজাযা ওয়া‘দাহ, ওয়া নাসারা ‘আবদাহ, ওয়া হাযামাল আহযা-বা ওয়াহদাহ",
      en: "Allāhu akbar (×3), lā ilāha illa-llāhu waḥdahū lā sharīka lah, lahu-l-mulku wa lahu-l-ḥamdu wa huwa ʿalā kulli shayʾin qadīr, lā ilāha illa-llāhu waḥdah, anjaza waʿdah, wa naṣara ʿabdah, wa hazama-l-aḥzāba waḥdah",
    },
    meaning: {
      bn: "আল্লাহ ছাড়া কোনো উপাস্য নেই, তিনি একক, তাঁর কোনো শরিক নেই। রাজত্ব ও প্রশংসা তাঁরই, তিনি সবকিছুর উপর ক্ষমতাবান। আল্লাহ ছাড়া কোনো উপাস্য নেই, তিনি একক; তিনি তাঁর প্রতিশ্রুতি পূর্ণ করেছেন, তাঁর বান্দাকে সাহায্য করেছেন এবং একাই সম্মিলিত বাহিনীকে পরাজিত করেছেন।",
      en: "There is no god but Allah alone, without partner. His is the dominion and His is the praise, and He is over all things capable. There is no god but Allah alone; He fulfilled His promise, aided His servant and alone defeated the confederates.",
    },
    references: [{ label: "Sahih Muslim 1218" }],
    note: {
      bn: "কিবলামুখী হয়ে এটি তিনবার বলুন এবং মাঝে নিজের ভাষায় দোয়া করুন। মারওয়াতেও একই।",
      en: "Face the Qibla, say it three times and make your own dua in between. The same is done on Marwah.",
    },
  },
  {
    id: "arafah",
    categories: ["arafah", "hajj"],
    title: { bn: "আরাফার দিনের শ্রেষ্ঠ দোয়া", en: "Best supplication of the Day of Arafah" },
    arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    pronunciation: {
      bn: "লা- ইলা-হা ইল্লাল্লা-হু ওয়াহদাহূ লা- শারীকা লাহ, লাহুল মুলকু ওয়া লাহুল হামদু ওয়া হুওয়া আলা- কুল্লি শাইয়িন কাদীর",
      en: "Lā ilāha illa-llāhu waḥdahū lā sharīka lah, lahu-l-mulku wa lahu-l-ḥamdu wa huwa ʿalā kulli shayʾin qadīr",
    },
    meaning: {
      bn: "আল্লাহ ছাড়া কোনো উপাস্য নেই, তিনি একক, তাঁর কোনো শরিক নেই। রাজত্ব ও প্রশংসা তাঁরই এবং তিনি সবকিছুর উপর ক্ষমতাবান।",
      en: "There is no god but Allah alone, without partner. His is the dominion and His is the praise, and He is over all things capable.",
    },
    references: [{ label: "Jami' at-Tirmidhi 3585" }],
  },
  {
    id: "mashar-haram",
    categories: ["muzdalifah", "hajj"],
    title: { bn: "মাশআরুল হারামে জিকির", en: "Remembrance at al-Mash'ar al-Haram" },
    arabic: "اللَّهُ أَكْبَرُ · لَا إِلَهَ إِلَّا اللَّهُ",
    pronunciation: { bn: "আল্লা-হু আকবার · লা- ইলা-হা ইল্লাল্লা-হ", en: "Allāhu akbar · Lā ilāha illa-llāh" },
    meaning: { bn: "আল্লাহ সর্বশ্রেষ্ঠ · আল্লাহ ছাড়া কোনো উপাস্য নেই", en: "Allah is the Greatest · There is no god but Allah" },
    references: [{ label: "Quran 2:198" }, { label: "Sahih Muslim 1218" }],
    note: {
      bn: "এখানে নির্দিষ্ট শব্দের কোনো দোয়া বর্ণিত নেই। নবী ﷺ ফজরের পর কিবলামুখী হয়ে আকাশ ভালোভাবে ফর্সা হওয়া পর্যন্ত দোয়া, তাকবির ও তাহলিল করেছেন।",
      en: "No fixed wording is narrated here. After Fajr the Prophet ﷺ faced the Qibla and made dua, takbir and tahlil until it was very bright.",
    },
  },
  {
    id: "ramy-takbir",
    categories: ["mina", "hajj"],
    title: { bn: "জামরায় প্রতিটি কংকর নিক্ষেপে", en: "With each pebble at the Jamarat" },
    arabic: "اللَّهُ أَكْبَرُ",
    pronunciation: { bn: "আল্লা-হু আকবার", en: "Allāhu akbar" },
    meaning: { bn: "আল্লাহ সর্বশ্রেষ্ঠ", en: "Allah is the Greatest" },
    references: [{ label: "Sahih al-Bukhari 1751" }],
    note: {
      bn: "প্রথম ও দ্বিতীয় জামরার পর কিবলামুখী হয়ে দীর্ঘ দোয়া করা সুন্নাহ; তৃতীয়টির (জামরাতুল আকাবা) পর দাঁড়াতেন না।",
      en: "After the first and second Jamrah, stand facing the Qibla and make a long dua; the Prophet ﷺ did not stop after the third (Jamrat al-Aqabah).",
    },
  },
  {
    id: "travel",
    categories: ["travel", "umrah", "hajj"],
    title: { bn: "সফরের দোয়া", en: "Dua for travel" },
    arabic:
      "اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ، اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى، وَمِنَ الْعَمَلِ مَا تَرْضَى، اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَذَا وَاطْوِ عَنَّا بُعْدَهُ، اللَّهُمَّ أَنْتَ الصَّاحِبُ فِي السَّفَرِ، وَالْخَلِيفَةُ فِي الْأَهْلِ، اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ وَعْثَاءِ السَّفَرِ، وَكَآبَةِ الْمَنْظَرِ، وَسُوءِ الْمُنْقَلَبِ فِي الْمَالِ وَالْأَهْلِ",
    pronunciation: {
      bn: "আল্লা-হু আকবার (৩ বার), সুবহা-নাল্লাযী সাখখারা লানা- হা-যা- ওয়ামা- কুন্না- লাহূ মুকরিনীন, ওয়া ইন্না- ইলা- রাব্বিনা- লামুনকালিবূন। আল্লা-হুম্মা ইন্না- নাসআলুকা ফী সাফারিনা- হা-যাল বিররা ওয়াত তাকওয়া, ওয়া মিনাল ‘আমালি মা- তারদা-। আল্লা-হুম্মা হাওয়িন ‘আলাইনা- সাফারানা- হা-যা- ওয়াতউয়ি ‘আন্না- বু‘দাহ। আল্লা-হুম্মা আনতাস সা-হিবু ফিস সাফার, ওয়াল খালীফাতু ফিল আহল। আল্লা-হুম্মা ইন্নী আ‘ঊযু বিকা মিন ওয়া‘সা-ইস সাফার, ওয়া কাআ-বাতিল মানযার, ওয়া সূইল মুনকালাবি ফিল মা-লি ওয়াল আহল",
      en: "Allāhu akbar (×3), subḥāna-lladhī sakhkhara lanā hādhā wa mā kunnā lahū muqrinīn, wa innā ilā rabbinā la-munqalibūn. Allāhumma innā nasʾaluka fī safarinā hādha-l-birra wa-t-taqwā, wa mina-l-ʿamali mā tarḍā. Allāhumma hawwin ʿalaynā safaranā hādhā wa-ṭwi ʿannā buʿdah. Allāhumma anta-ṣ-ṣāḥibu fi-s-safar, wa-l-khalīfatu fi-l-ahl. Allāhumma innī aʿūdhu bika min waʿthāʾi-s-safar, wa kaʾābati-l-manẓar, wa sūʾi-l-munqalabi fi-l-māli wa-l-ahl",
    },
    meaning: {
      bn: "পবিত্র তিনি, যিনি একে আমাদের বশীভূত করেছেন, অথচ আমরা একে বশ করতে সক্ষম ছিলাম না; আর নিশ্চয়ই আমরা আমাদের রবের কাছে ফিরে যাব। হে আল্লাহ, এই সফরে আমরা আপনার কাছে নেকি, তাকওয়া এবং আপনার পছন্দনীয় আমল চাই। হে আল্লাহ, এই সফর আমাদের জন্য সহজ করুন এবং এর দূরত্ব কমিয়ে দিন। হে আল্লাহ, আপনিই সফরের সঙ্গী এবং পরিবারের তত্ত্বাবধায়ক। হে আল্লাহ, আমি সফরের কষ্ট, দুঃখজনক দৃশ্য এবং সম্পদ ও পরিবারে মন্দ প্রত্যাবর্তন থেকে আপনার আশ্রয় চাই।",
      en: "Glory be to Him who has subjected this to us, and we could not have done so ourselves, and to our Lord we will surely return. O Allah, we ask You on this journey for righteousness and piety, and deeds that please You. O Allah, make this journey easy for us and shorten its distance. O Allah, You are the Companion on the journey and the Guardian of the family. O Allah, I seek refuge in You from the hardships of travel, distressing sights, and an ill return to wealth and family.",
    },
    references: [{ label: "Sahih Muslim 1342" }, { label: "Quran 43:13–14" }],
  },
  {
    id: "sayyid-istighfar",
    categories: ["forgiveness"],
    title: { bn: "সাইয়্যিদুল ইস্তিগফার", en: "Sayyid al-Istighfar" },
    arabic:
      "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
    pronunciation: {
      bn: "আল্লা-হুম্মা আনতা রাব্বী লা- ইলা-হা ইল্লা- আনতা, খালাকতানী ওয়া আনা ‘আবদুকা, ওয়া আনা ‘আলা- ‘আহদিকা ওয়া ওয়া‘দিকা মাস্তাতা‘তু, আ‘ঊযু বিকা মিন শাররি মা- সানা‘তু, আবূউ লাকা বিনি‘মাতিকা ‘আলাইয়্যা, ওয়া আবূউ লাকা বিযামবী ফাগফির লী, ফাইন্নাহূ লা- ইয়াগফিরুয যুনূবা ইল্লা- আনতা",
      en: "Allāhumma anta rabbī lā ilāha illā ant, khalaqtanī wa ana ʿabduk, wa ana ʿalā ʿahdika wa waʿdika masṭaṭaʿt, aʿūdhu bika min sharri mā ṣanaʿt, abūʾu laka bi-niʿmatika ʿalayya, wa abūʾu laka bi-dhanbī fa-ghfir lī, fa-innahū lā yaghfiru-dh-dhunūba illā ant",
    },
    meaning: {
      bn: "হে আল্লাহ, আপনি আমার রব, আপনি ছাড়া কোনো উপাস্য নেই। আপনি আমাকে সৃষ্টি করেছেন এবং আমি আপনার বান্দা। আমি সাধ্যমতো আপনার অঙ্গীকার ও প্রতিশ্রুতির উপর আছি। আমার কৃতকর্মের মন্দ থেকে আপনার আশ্রয় চাই। আমার উপর আপনার নিয়ামত স্বীকার করছি এবং আমার গুনাহ স্বীকার করছি; অতএব আমাকে ক্ষমা করুন, কেননা আপনি ছাড়া কেউ গুনাহ ক্ষমা করে না।",
      en: "O Allah, You are my Lord; there is no god but You. You created me and I am Your servant, and I keep Your covenant and promise as best I can. I seek refuge in You from the evil of what I have done. I acknowledge Your favour upon me and I acknowledge my sin, so forgive me, for none forgives sins but You.",
    },
    references: [{ label: "Sahih al-Bukhari 6306" }],
  },
  {
    id: "rabbana-zalamna",
    categories: ["forgiveness", "quranic"],
    title: { bn: "আদম (আ.)-এর দোয়া", en: "Dua of Adam (as)" },
    arabic: "رَبَّنَا ظَلَمْنَا أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ",
    pronunciation: {
      bn: "রাব্বানা- যালামনা- আনফুসানা- ওয়া ইল্লাম তাগফির লানা- ওয়া তারহামনা- লানাকূনান্না মিনাল খা-সিরীন",
      en: "Rabbanā ẓalamnā anfusanā wa in lam taghfir lanā wa tarḥamnā la-nakūnanna mina-l-khāsirīn",
    },
    meaning: {
      bn: "হে আমাদের রব, আমরা নিজেদের উপর জুলুম করেছি। আপনি যদি আমাদের ক্ষমা না করেন ও দয়া না করেন, তবে আমরা অবশ্যই ক্ষতিগ্রস্তদের অন্তর্ভুক্ত হব।",
      en: "Our Lord, we have wronged ourselves. If You do not forgive us and have mercy on us, we will surely be among the losers.",
    },
    references: [{ label: "Quran 7:23" }],
  },
  {
    id: "la-tuakhidhna",
    categories: ["forgiveness", "quranic"],
    title: { bn: "ভুলত্রুটি থেকে ক্ষমা", en: "Do not take us to task" },
    arabic: "رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا",
    pronunciation: { bn: "রাব্বানা- লা- তুআ-খিযনা- ইন নাসীনা- আও আখতা’না-", en: "Rabbanā lā tuʾākhidhnā in nasīnā aw akhṭaʾnā" },
    meaning: {
      bn: "হে আমাদের রব, আমরা যদি ভুলে যাই বা ভুল করি, তবে আমাদের পাকড়াও করবেন না।",
      en: "Our Lord, do not take us to task if we forget or make a mistake.",
    },
    references: [{ label: "Quran 2:286" }],
  },
  {
    id: "parents-mercy",
    categories: ["parents", "quranic"],
    title: { bn: "পিতা-মাতার জন্য রহমতের দোয়া", en: "Mercy for parents" },
    arabic: "رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
    pronunciation: { bn: "রাব্বির হামহুমা- কামা- রাব্বাইয়া-নী সাগীরা-", en: "Rabbi-rḥamhumā kamā rabbayānī ṣaghīrā" },
    meaning: { bn: "হে আমার রব, তাঁদের প্রতি দয়া করুন, যেমন তাঁরা শৈশবে আমাকে লালন-পালন করেছেন।", en: "My Lord, have mercy on them as they raised me when I was small." },
    references: [{ label: "Quran 17:24" }],
  },
  {
    id: "parents-forgive",
    categories: ["parents", "forgiveness", "quranic"],
    title: { bn: "নিজের, পিতা-মাতা ও মুমিনদের জন্য ক্ষমা", en: "Forgiveness for self, parents and believers" },
    arabic: "رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ",
    pronunciation: {
      bn: "রাব্বানাগ ফিরলী ওয়া লিওয়া-লিদাইয়্যা ওয়া লিলমু’মিনীনা ইয়াওমা ইয়াকূমুল হিসা-ব",
      en: "Rabbana-ghfir lī wa li-wālidayya wa li-l-muʾminīna yawma yaqūmu-l-ḥisāb",
    },
    meaning: {
      bn: "হে আমাদের রব, যেদিন হিসাব প্রতিষ্ঠিত হবে, সেদিন আমাকে, আমার পিতা-মাতাকে এবং মুমিনদের ক্ষমা করুন।",
      en: "Our Lord, forgive me, my parents and the believers on the Day the reckoning is established.",
    },
    references: [{ label: "Quran 14:41" }],
  },
  {
    id: "family",
    categories: ["family", "quranic"],
    title: { bn: "পরিবার ও সন্তানের জন্য", en: "For spouse and children" },
    arabic: "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا",
    pronunciation: {
      bn: "রাব্বানা- হাব লানা- মিন আযওয়া-জিনা- ওয়া যুররিইয়্যা-তিনা- কুররাতা আ‘ইউনিওঁ ওয়াজ‘আলনা- লিলমুত্তাকীনা ইমা-মা-",
      en: "Rabbanā hab lanā min azwājinā wa dhurriyyātinā qurrata aʿyunin wa-jʿalnā li-l-muttaqīna imāmā",
    },
    meaning: {
      bn: "হে আমাদের রব, আমাদের স্ত্রী ও সন্তানদের আমাদের চোখের শীতলতা বানিয়ে দিন এবং আমাদের মুত্তাকিদের জন্য আদর্শ বানান।",
      en: "Our Lord, grant us from our spouses and offspring comfort to our eyes, and make us leaders for the righteous.",
    },
    references: [{ label: "Quran 25:74" }],
  },
  {
    id: "rizq-ilm",
    categories: ["rizq"],
    title: { bn: "উপকারী জ্ঞান ও হালাল রিজিক", en: "Beneficial knowledge and pure provision" },
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا",
    pronunciation: {
      bn: "আল্লা-হুম্মা ইন্নী আসআলুকা ‘ইলমান না-ফি‘আ, ওয়া রিযকান তাইয়্যিবা, ওয়া ‘আমালাম মুতাকাব্বালা",
      en: "Allāhumma innī asʾaluka ʿilman nāfiʿā, wa rizqan ṭayyibā, wa ʿamalan mutaqabbalā",
    },
    meaning: {
      bn: "হে আল্লাহ, আমি আপনার কাছে উপকারী জ্ঞান, পবিত্র রিজিক ও কবুলযোগ্য আমল প্রার্থনা করি।",
      en: "O Allah, I ask You for beneficial knowledge, pure provision and accepted deeds.",
    },
    references: [{ label: "Sunan Ibn Majah 925" }],
  },
  {
    id: "rizq-musa",
    categories: ["rizq", "quranic"],
    title: { bn: "মূসা (আ.)-এর দোয়া", en: "Dua of Musa (as)" },
    arabic: "رَبِّ إِنِّي لِمَا أَنزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ",
    pronunciation: { bn: "রাব্বি ইন্নী লিমা- আনযালতা ইলাইয়্যা মিন খাইরিন ফাকীর", en: "Rabbi innī limā anzalta ilayya min khayrin faqīr" },
    meaning: { bn: "হে আমার রব, আপনি আমার প্রতি যে কল্যাণই নাযিল করবেন, আমি তার মুখাপেক্ষী।", en: "My Lord, I am in need of whatever good You send down to me." },
    references: [{ label: "Quran 28:24" }],
  },
  {
    id: "health",
    categories: ["health"],
    title: { bn: "সুস্থতার দোয়া", en: "Dua for well-being" },
    arabic: "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي",
    pronunciation: {
      bn: "আল্লা-হুম্মা ‘আ-ফিনী ফী বাদানী, আল্লা-হুম্মা ‘আ-ফিনী ফী সাম‘ঈ, আল্লা-হুম্মা ‘আ-ফিনী ফী বাসারী",
      en: "Allāhumma ʿāfinī fī badanī, Allāhumma ʿāfinī fī samʿī, Allāhumma ʿāfinī fī baṣarī",
    },
    meaning: {
      bn: "হে আল্লাহ, আমার শরীরে সুস্থতা দিন। হে আল্লাহ, আমার শ্রবণশক্তিতে সুস্থতা দিন। হে আল্লাহ, আমার দৃষ্টিশক্তিতে সুস্থতা দিন।",
      en: "O Allah, grant me well-being in my body. O Allah, grant me well-being in my hearing. O Allah, grant me well-being in my sight.",
    },
    references: [{ label: "Sunan Abi Dawud 5090" }],
  },
  {
    id: "protection",
    categories: ["protection", "travel"],
    title: { bn: "সকল অনিষ্ট থেকে সুরক্ষা", en: "Protection from all harm" },
    arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    pronunciation: {
      bn: "বিসমিল্লা-হিল্লাযী লা- ইয়াদুররু মা‘আসমিহী শাইউন ফিল আরদি ওয়ালা- ফিস সামা-ই ওয়া হুওয়াস সামী‘উল ‘আলীম",
      en: "Bismi-llāhi-lladhī lā yaḍurru maʿa-smihī shayʾun fi-l-arḍi wa lā fi-s-samāʾi wa huwa-s-samīʿu-l-ʿalīm",
    },
    meaning: {
      bn: "আল্লাহর নামে, যাঁর নামের সাথে আসমান ও জমিনে কোনো কিছুই ক্ষতি করতে পারে না; তিনি সর্বশ্রোতা, সর্বজ্ঞ।",
      en: "In the name of Allah, with whose name nothing on earth or in the heavens can cause harm, and He is the All-Hearing, the All-Knowing.",
    },
    references: [{ label: "Sunan Abi Dawud 5088" }, { label: "Jami' at-Tirmidhi 3388" }],
    note: {
      bn: "সকাল ও সন্ধ্যায় তিনবার পড়ার কথা হাদিসে এসেছে।",
      en: "The hadith mentions reciting it three times in the morning and evening.",
    },
  },
  {
    id: "jannah",
    categories: ["jannah"],
    title: { bn: "জান্নাত প্রার্থনা ও জাহান্নাম থেকে আশ্রয়", en: "Asking for Paradise, refuge from the Fire" },
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْجَنَّةَ، وَأَعُوذُ بِكَ مِنَ النَّارِ",
    pronunciation: { bn: "আল্লা-হুম্মা ইন্নী আসআলুকাল জান্নাহ, ওয়া আ‘ঊযু বিকা মিনান না-র", en: "Allāhumma innī asʾaluka-l-jannah, wa aʿūdhu bika mina-n-nār" },
    meaning: { bn: "হে আল্লাহ, আমি আপনার কাছে জান্নাত চাই এবং জাহান্নাম থেকে আপনার আশ্রয় চাই।", en: "O Allah, I ask You for Paradise and seek refuge in You from the Fire." },
    references: [{ label: "Sunan Abi Dawud 792" }],
  },
  {
    id: "jannah-house",
    categories: ["jannah", "quranic"],
    title: { bn: "জান্নাতে একটি ঘর", en: "A house in Paradise" },
    arabic: "رَبِّ ابْنِ لِي عِندَكَ بَيْتًا فِي الْجَنَّةِ",
    pronunciation: { bn: "রাব্বিবনি লী ‘ইনদাকা বাইতান ফিল জান্নাহ", en: "Rabbi-bni lī ʿindaka baytan fi-l-jannah" },
    meaning: { bn: "হে আমার রব, আপনার কাছে জান্নাতে আমার জন্য একটি ঘর নির্মাণ করুন।", en: "My Lord, build for me near You a house in Paradise." },
    references: [{ label: "Quran 66:11" }],
  },
  {
    id: "steadfast-heart",
    categories: ["quranic"],
    title: { bn: "হৃদয়ের দৃঢ়তা", en: "Steadfastness of the heart" },
    arabic: "رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً ۚ إِنَّكَ أَنتَ الْوَهَّابُ",
    pronunciation: {
      bn: "রাব্বানা- লা- তুযিগ কুলূবানা- বা‘দা ইয হাদাইতানা- ওয়া হাব লানা- মিল্লাদুনকা রাহমাহ, ইন্নাকা আনতাল ওয়াহ্‌হা-ব",
      en: "Rabbanā lā tuzigh qulūbanā baʿda idh hadaytanā wa hab lanā min ladunka raḥmah, innaka anta-l-wahhāb",
    },
    meaning: {
      bn: "হে আমাদের রব, হেদায়েত দেওয়ার পর আমাদের অন্তরকে বক্র করবেন না এবং আপনার পক্ষ থেকে আমাদের রহমত দান করুন। নিশ্চয়ই আপনি মহাদাতা।",
      en: "Our Lord, do not let our hearts deviate after You have guided us, and grant us mercy from Yourself. Indeed, You are the Bestower.",
    },
    references: [{ label: "Quran 3:8" }],
  },
  {
    id: "knowledge",
    categories: ["quranic"],
    title: { bn: "জ্ঞান বৃদ্ধির দোয়া", en: "Increase in knowledge" },
    arabic: "رَّبِّ زِدْنِي عِلْمًا",
    pronunciation: { bn: "রাব্বি যিদনী ‘ইলমা-", en: "Rabbi zidnī ʿilmā" },
    meaning: { bn: "হে আমার রব, আমার জ্ঞান বৃদ্ধি করে দিন।", en: "My Lord, increase me in knowledge." },
    references: [{ label: "Quran 20:114" }],
  },
  {
    id: "niyyah-umrah",
    categories: ["umrah"],
    title: { bn: "উমরাহর নিয়ত (তালবিয়া দিয়ে)", en: "Intention for Umrah (with Talbiyah)" },
    arabic: "لَبَّيْكَ عُمْرَةً",
    pronunciation: { bn: "লাব্বাইকা ‘উমরাতান", en: "Labbayka ʿumratan" },
    meaning: { bn: "হে আল্লাহ, উমরাহর জন্য আমি হাজির।", en: "Here I am, O Allah, for Umrah." },
    references: [{ label: "Sahih Muslim 1251", detail: "form “labbayka ʿumratan” used by the Prophet ﷺ" }],
    note: {
      bn: "নিয়ত মূলত অন্তরের সংকল্প। মুখে এই শব্দগুলো বলে তালবিয়া শুরু করা হয়।",
      en: "The intention is essentially in the heart; these words are said aloud to begin the Talbiyah.",
    },
  },
  {
    id: "ishtirat",
    categories: ["umrah", "hajj"],
    title: { bn: "শর্তযুক্ত নিয়ত (বাধার আশঙ্কা থাকলে)", en: "Conditional intention (if an obstacle is feared)" },
    arabic: "اللَّهُمَّ مَحِلِّي حَيْثُ حَبَسْتَنِي",
    pronunciation: { bn: "আল্লা-হুম্মা মাহিল্লী হাইসু হাবাসতানী", en: "Allāhumma maḥillī ḥaythu ḥabastanī" },
    meaning: {
      bn: "হে আল্লাহ, আপনি যেখানে আমাকে আটকে দেবেন, সেখানেই আমার ইহরাম শেষ।",
      en: "O Allah, my place of exiting ihram is wherever You hold me back.",
    },
    references: [{ label: "Sahih al-Bukhari 5089" }, { label: "Sahih Muslim 1207" }],
    note: {
      bn: "অসুস্থতা বা বাধার আশঙ্কা থাকলে নিয়তের সময় বলা যায়। প্রয়োগে আলেমদের মতভেদ আছে।",
      en: "May be said at the time of intention by someone who fears illness or obstruction. Scholars differ on its application.",
    },
  },
];

export const DUA_BY_ID = new Map(DUAS.map((d) => [d.id, d]));
