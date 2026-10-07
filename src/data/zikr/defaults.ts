import type { Zikr } from "@/types/content";

/**
 * Default zikr. Arabic wording follows the cited hadith. Target counts are
 * practical defaults the user can change — no reward numbers are claimed here.
 */
export const DEFAULT_ZIKR: Zikr[] = [
  {
    id: "subhanallah",
    kind: "default",
    name: { bn: "সুবহানাল্লাহ", en: "Subhan Allah" },
    arabic: "سُبْحَانَ اللَّهِ",
    pronunciation: { bn: "সুবহা-নাল্লা-হ", en: "Subḥāna-llāh" },
    meaning: { bn: "আল্লাহ পবিত্র", en: "Glory be to Allah" },
    target: 33,
    references: [{ label: "Sahih Muslim 597" }],
  },
  {
    id: "alhamdulillah",
    kind: "default",
    name: { bn: "আলহামদুলিল্লাহ", en: "Alhamdulillah" },
    arabic: "الْحَمْدُ لِلَّهِ",
    pronunciation: { bn: "আলহামদু লিল্লা-হ", en: "Al-ḥamdu lillāh" },
    meaning: { bn: "সমস্ত প্রশংসা আল্লাহর", en: "All praise is for Allah" },
    target: 33,
    references: [{ label: "Sahih Muslim 597" }],
  },
  {
    id: "allahuakbar",
    kind: "default",
    name: { bn: "আল্লাহু আকবার", en: "Allahu Akbar" },
    arabic: "اللَّهُ أَكْبَرُ",
    pronunciation: { bn: "আল্লা-হু আকবার", en: "Allāhu akbar" },
    meaning: { bn: "আল্লাহ সর্বশ্রেষ্ঠ", en: "Allah is the Greatest" },
    target: 33,
    references: [{ label: "Sahih Muslim 597" }],
  },
  {
    id: "tahlil",
    kind: "default",
    name: { bn: "লা ইলাহা ইল্লাল্লাহ", en: "La ilaha illallah" },
    arabic: "لَا إِلَٰهَ إِلَّا اللَّهُ",
    pronunciation: { bn: "লা- ইলা-হা ইল্লাল্লা-হ", en: "Lā ilāha illā-llāh" },
    meaning: { bn: "আল্লাহ ছাড়া কোনো সত্য উপাস্য নেই", en: "There is no god but Allah" },
    target: 100,
    references: [{ label: "Sunan at-Tirmidhi 3383" }],
  },
  {
    id: "astaghfirullah",
    kind: "default",
    name: { bn: "আস্তাগফিরুল্লাহ", en: "Astaghfirullah" },
    arabic: "أَسْتَغْفِرُ اللَّهَ",
    pronunciation: { bn: "আস্তাগফিরুল্লা-হ", en: "Astaghfiru-llāh" },
    meaning: { bn: "আমি আল্লাহর কাছে ক্ষমা চাই", en: "I seek Allah's forgiveness" },
    target: 100,
    references: [{ label: "Sahih Muslim 2702" }],
  },
  {
    id: "subhanallahi-wabihamdihi",
    kind: "default",
    name: { bn: "সুবহানাল্লাহি ওয়া বিহামদিহি", en: "Subhan Allahi wa bihamdihi" },
    arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    pronunciation: { bn: "সুবহা-নাল্লা-হি ওয়া বিহামদিহ", en: "Subḥāna-llāhi wa bi-ḥamdih" },
    meaning: { bn: "আল্লাহ পবিত্র এবং সকল প্রশংসা তাঁর", en: "Glory be to Allah and praise be to Him" },
    target: 100,
    references: [{ label: "Sahih al-Bukhari 6405" }, { label: "Sahih Muslim 2691" }],
  },
  {
    id: "hawqala",
    kind: "default",
    name: { bn: "লা হাওলা ওয়ালা কুওয়াতা ইল্লা বিল্লাহ", en: "La hawla wa la quwwata illa billah" },
    arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    pronunciation: { bn: "লা- হাওলা ওয়ালা- কুওয়াতা ইল্লা- বিল্লা-হ", en: "Lā ḥawla wa lā quwwata illā billāh" },
    meaning: { bn: "আল্লাহর সাহায্য ছাড়া কোনো শক্তি ও সামর্থ্য নেই", en: "There is no power and no strength except with Allah" },
    target: 100,
    references: [{ label: "Sahih al-Bukhari 6384" }, { label: "Sahih Muslim 2704" }],
  },
  {
    id: "durood",
    kind: "default",
    name: { bn: "দরুদ শরিফ", en: "Salawat (Durood)" },
    arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ",
    pronunciation: { bn: "আল্লা-হুম্মা সাল্লি আলা- মুহাম্মাদিওঁ ওয়া আলা- আ-লি মুহাম্মাদ", en: "Allāhumma ṣalli ʿalā Muḥammadin wa ʿalā āli Muḥammad" },
    meaning: {
      bn: "হে আল্লাহ, মুহাম্মাদ ও মুহাম্মাদের পরিবারের উপর রহমত বর্ষণ করুন",
      en: "O Allah, send blessings upon Muhammad and upon the family of Muhammad",
    },
    target: 100,
    references: [{ label: "Sahih al-Bukhari 3370", detail: "opening of the Salat al-Ibrahimiyyah" }],
  },
  {
    id: "subhanallahil-azim",
    kind: "default",
    name: {
      bn: "সুবহানাল্লাহি ওয়া বিহামদিহি, সুবহানাল্লাহিল আজিম",
      en: "Subhan Allahi wa bihamdihi, Subhan Allahil-Azim",
    },
    arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ",
    pronunciation: {
      bn: "সুবহা-নাল্লা-হি ওয়া বিহামদিহী, সুবহা-নাল্লা-হিল আযীম",
      en: "Subḥāna-llāhi wa bi-ḥamdihī, subḥāna-llāhil-ʿaẓīm",
    },
    meaning: {
      bn: "আল্লাহ পবিত্র এবং সকল প্রশংসা তাঁর; মহান আল্লাহ পবিত্র",
      en: "Glory be to Allah and praise be to Him; glory be to Allah the Magnificent",
    },
    target: 100,
    references: [
      { label: "Sahih al-Bukhari 6406" },
      { label: "Sahih Muslim 2694" },
    ],
  },
  {
    id: "subhanallahil-azim-wabihamdihi",
    kind: "default",
    name: {
      bn: "সুবহানাল্লাহিল আজিম ওয়া বিহামদিহি",
      en: "Subhan Allahil-Azim wa bihamdihi",
    },
    arabic: "سُبْحَانَ اللَّهِ الْعَظِيمِ وَبِحَمْدِهِ",
    pronunciation: {
      bn: "সুবহা-নাল্লা-হিল আযীমি ওয়া বিহামদিহ",
      en: "Subḥāna-llāhil-ʿaẓīmi wa bi-ḥamdih",
    },
    meaning: {
      bn: "মহান আল্লাহ পবিত্র এবং সকল প্রশংসা তাঁর",
      en: "Glory be to Allah the Magnificent, and praise be to Him",
    },
    target: 100,
    references: [{ label: "Sunan at-Tirmidhi 3464" }],
  },
  {
    id: "baqiyat-salihat",
    kind: "default",
    name: {
      bn: "সুবহানাল্লাহি ওয়াল হামদুলিল্লাহি…",
      en: "Subhan Allah, wal-hamdu lillah…",
    },
    arabic:
      "سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلَا إِلَٰهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ",
    pronunciation: {
      bn: "সুবহা-নাল্লা-হি, ওয়াল হামদু লিল্লা-হি, ওয়া লা- ইলা-হা ইল্লাল্লা-হু, ওয়াল্লা-হু আকবার",
      en: "Subḥāna-llāh, wal-ḥamdu lillāh, wa lā ilāha illā-llāh, wa-llāhu akbar",
    },
    meaning: {
      bn: "আল্লাহ পবিত্র, সকল প্রশংসা আল্লাহর, আল্লাহ ছাড়া কোনো সত্য উপাস্য নেই, আল্লাহ সর্বশ্রেষ্ঠ",
      en: "Glory be to Allah, praise be to Allah, there is no god but Allah, and Allah is the Greatest",
    },
    target: 33,
    references: [
      {
        label: "Sahih Muslim 2137",
        detail: "the four words most beloved to Allah",
      },
    ],
  },
  {
    id: "tahlil-wahdahu",
    kind: "default",
    name: {
      bn: "লা ইলাহা ইল্লাল্লাহু ওয়াহদাহু লা শারিকা লাহু…",
      en: "La ilaha illallahu wahdahu la sharika lah…",
    },
    arabic:
      "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ",
    pronunciation: {
      bn: "লা- ইলা-হা ইল্লাল্লা-হু ওয়াহদাহু লা- শারীকা লাহু, লাহুল মুলকু ওয়া লাহুল হামদু, ওয়া হুয়া আলা- কুল্লি শাইয়িন ক্বাদীর",
      en: "Lā ilāha illā-llāhu waḥdahū lā sharīka lah, lahul-mulku wa lahul-ḥamd, wa huwa ʿalā kulli shayʾin qadīr",
    },
    meaning: {
      bn: "আল্লাহ ছাড়া কোনো সত্য উপাস্য নেই, তিনি একক, তাঁর কোনো শরিক নেই; রাজত্ব তাঁরই, প্রশংসা তাঁরই, আর তিনি সব কিছুর উপর ক্ষমতাবান।",
      en: "There is no god but Allah alone, without partner. His is the dominion and His is the praise, and He is able to do all things.",
    },
    target: 100,
    references: [
      { label: "Sahih al-Bukhari 3293" },
      { label: "Sahih Muslim 2691" },
    ],
  },
  {
    id: "allahu-akbar-kabira",
    kind: "default",
    name: { bn: "আল্লাহু আকবার কাবিরা…", en: "Allahu akbar kabira…" },
    arabic:
      "اللَّهُ أَكْبَرُ كَبِيرًا، وَالْحَمْدُ لِلَّهِ كَثِيرًا، وَسُبْحَانَ اللَّهِ بُكْرَةً وَأَصِيلًا",
    pronunciation: {
      bn: "আল্লা-হু আকবারু কাবীরা, ওয়াল হামদু লিল্লা-হি কাসীরা, ওয়া সুবহা-নাল্লা-হি বুকরাতাওঁ ওয়া আসীলা",
      en: "Allāhu akbaru kabīrā, wal-ḥamdu lillāhi kathīrā, wa subḥāna-llāhi bukratan wa aṣīlā",
    },
    meaning: {
      bn: "আল্লাহ সর্বশ্রেষ্ঠ, অতি মহান; আল্লাহর জন্য অজস্র প্রশংসা; সকাল-সন্ধ্যা আল্লাহর পবিত্রতা ঘোষণা করি",
      en: "Allah is the Greatest, truly great; much praise is for Allah; and glory be to Allah morning and evening",
    },
    target: 33,
    references: [{ label: "Sahih Muslim 601" }],
  },
  {
    id: "tasbih-adada-khalqihi",
    kind: "default",
    name: {
      bn: "সুবহানাল্লাহি ওয়া বিহামদিহি আদাদা খালকিহি…",
      en: "Subhan Allahi wa bihamdihi, adada khalqihi…",
    },
    arabic:
      "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ",
    pronunciation: {
      bn: "সুবহা-নাল্লা-হি ওয়া বিহামদিহী, আদাদা খালক্বিহী, ওয়া রিদ্বা- নাফসিহী, ওয়া যিনাতা আরশিহী, ওয়া মিদা-দা কালিমা-তিহ",
      en: "Subḥāna-llāhi wa bi-ḥamdihī, ʿadada khalqihī, wa riḍā nafsihī, wa zinata ʿarshihī, wa midāda kalimātih",
    },
    meaning: {
      bn: "আল্লাহ পবিত্র এবং সকল প্রশংসা তাঁর — তাঁর সৃষ্টির সংখ্যা পরিমাণ, তাঁর সন্তুষ্টি পরিমাণ, তাঁর আরশের ওজন পরিমাণ এবং তাঁর বাণী লেখার কালি পরিমাণ",
      en: "Glory be to Allah and praise be to Him — as many times as the number of His creation, as much as pleases Him, the weight of His Throne, and the ink of His words",
    },
    target: 3,
    references: [{ label: "Sahih Muslim 2726" }],
  },
  {
    id: "istighfar-tawbah",
    kind: "default",
    name: {
      bn: "আস্তাগফিরুল্লাহা ওয়া আতুবু ইলাইহি",
      en: "Astaghfirullaha wa atubu ilayh",
    },
    arabic: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",
    pronunciation: {
      bn: "আস্তাগফিরুল্লা-হা ওয়া আতূবু ইলাইহ",
      en: "Astaghfiru-llāha wa atūbu ilayh",
    },
    meaning: {
      bn: "আমি আল্লাহর কাছে ক্ষমা চাই এবং তাঁর দিকে ফিরে আসি",
      en: "I seek Allah's forgiveness and turn to Him in repentance",
    },
    target: 100,
    references: [{ label: "Sahih al-Bukhari 6307" }],
  },
  {
    id: "tasbih-istighfar",
    kind: "default",
    name: {
      bn: "সুবহানাল্লাহি ওয়া বিহামদিহি, আস্তাগফিরুল্লাহা…",
      en: "Subhan Allahi wa bihamdihi, astaghfirullaha…",
    },
    arabic:
      "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",
    pronunciation: {
      bn: "সুবহা-নাল্লা-হি ওয়া বিহামদিহী, আস্তাগফিরুল্লা-হা ওয়া আতূবু ইলাইহ",
      en: "Subḥāna-llāhi wa bi-ḥamdihī, astaghfiru-llāha wa atūbu ilayh",
    },
    meaning: {
      bn: "আল্লাহ পবিত্র এবং সকল প্রশংসা তাঁর; আমি আল্লাহর কাছে ক্ষমা চাই এবং তাঁর দিকে ফিরে আসি",
      en: "Glory be to Allah and praise be to Him; I seek Allah's forgiveness and turn to Him in repentance",
    },
    target: 100,
    references: [{ label: "Sahih Muslim 484" }],
  },
  {
    id: "rabbighfir-li",
    kind: "default",
    name: {
      bn: "রাব্বিগফিরলি ওয়া তুব আলাইয়া…",
      en: "Rabbighfir li wa tub ʿalayya…",
    },
    arabic:
      "رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ، إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ",
    pronunciation: {
      bn: "রাব্বিগফির লী ওয়া তুব আলাইয়া, ইন্নাকা আন্তাত তাওওয়া-বুর রাহীম",
      en: "Rabbi-ghfir lī wa tub ʿalayya, innaka antat-tawwābur-raḥīm",
    },
    meaning: {
      bn: "হে আমার রব, আমাকে ক্ষমা করুন এবং আমার তওবা কবুল করুন; নিশ্চয়ই আপনি তওবা কবুলকারী, পরম দয়ালু",
      en: "My Lord, forgive me and accept my repentance; You are the Accepter of repentance, the Most Merciful",
    },
    target: 100,
    references: [{ label: "Sunan Abi Dawud 1516" }],
  },
  {
    id: "afuww",
    kind: "default",
    name: {
      bn: "আল্লাহুম্মা ইন্নাকা আফুউন…",
      en: "Allahumma innaka ʿafuwwun…",
    },
    arabic: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي",
    pronunciation: {
      bn: "আল্লা-হুম্মা ইন্নাকা আফুউউন তুহিব্বুল আফওয়া ফা'ফু আন্নী",
      en: "Allāhumma innaka ʿafuwwun tuḥibbul-ʿafwa faʿfu ʿannī",
    },
    meaning: {
      bn: "হে আল্লাহ, আপনি ক্ষমাশীল, ক্ষমা করতে ভালোবাসেন; অতএব আমাকে ক্ষমা করুন",
      en: "O Allah, You are Pardoning and love to pardon, so pardon me",
    },
    target: 33,
    references: [
      { label: "Sunan at-Tirmidhi 3513" },
      { label: "Sunan Ibn Majah 3850" },
    ],
  },
  {
    id: "dua-yunus",
    kind: "default",
    name: { bn: "দোয়া ইউনুস", en: "Dua of Yunus" },
    arabic:
      "لَا إِلَٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
    pronunciation: {
      bn: "লা- ইলা-হা ইল্লা- আন্তা সুবহা-নাকা ইন্নী কুনতু মিনায যোয়া-লিমীন",
      en: "Lā ilāha illā anta subḥānaka innī kuntu mina-ẓ-ẓālimīn",
    },
    meaning: {
      bn: "আপনি ছাড়া কোনো সত্য উপাস্য নেই; আপনি পবিত্র; নিশ্চয়ই আমি জালিমদের অন্তর্ভুক্ত ছিলাম",
      en: "There is no god but You; glory be to You; indeed I have been among the wrongdoers",
    },
    target: 33,
    references: [{ label: "Quran 21:87" }, { label: "Sunan at-Tirmidhi 3505" }],
  },
  {
    id: "hasbunallah",
    kind: "default",
    name: {
      bn: "হাসবুনাল্লাহু ওয়া নি'মাল ওয়াকিল",
      en: "Hasbunallahu wa niʿmal-wakil",
    },
    arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
    pronunciation: {
      bn: "হাসবুনাল্লা-হু ওয়া নি'মাল ওয়াকীল",
      en: "Ḥasbuna-llāhu wa niʿmal-wakīl",
    },
    meaning: {
      bn: "আল্লাহই আমাদের জন্য যথেষ্ট, আর তিনি কতই না উত্তম কর্মবিধায়ক",
      en: "Allah is sufficient for us, and He is the best Disposer of affairs",
    },
    target: 33,
    references: [{ label: "Quran 3:173" }, { label: "Sahih al-Bukhari 4563" }],
  },
  {
    id: "ya-hayyu-ya-qayyum",
    kind: "default",
    name: { bn: "ইয়া হাইয়ু ইয়া কাইয়ুম…", en: "Ya Hayyu ya Qayyum…" },
    arabic: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ",
    pronunciation: {
      bn: "ইয়া- হাইয়ু ইয়া- ক্বাইয়ূমু বিরাহমাতিকা আসতাগীস",
      en: "Yā Ḥayyu yā Qayyūmu bi-raḥmatika astaghīth",
    },
    meaning: {
      bn: "হে চিরঞ্জীব, হে চিরস্থায়ী! আপনার রহমতের উসিলায় সাহায্য চাই",
      en: "O Ever-Living, O Sustainer of all, by Your mercy I seek help",
    },
    target: 33,
    references: [{ label: "Sunan at-Tirmidhi 3524" }],
  },
  {
    id: "subhanal-malikil-quddus",
    kind: "default",
    name: { bn: "সুবহানাল মালিকিল কুদ্দুস", en: "Subhanal-Malikil-Quddus" },
    arabic: "سُبْحَانَ الْمَلِكِ الْقُدُّوسِ",
    pronunciation: {
      bn: "সুবহা-নাল মালিকিল কুদ্দূস",
      en: "Subḥānal-malikil-quddūs",
    },
    meaning: {
      bn: "পবিত্র সেই মহান অধিপতি, যিনি পরম পবিত্র",
      en: "Glory be to the King, the Most Holy",
    },
    target: 3,
    references: [
      { label: "Sunan Abi Dawud 1430", detail: "said after Witr" },
      { label: "Sunan an-Nasa'i 1699" },
    ],
  },
  {
    id: "rabbana-atina",
    kind: "default",
    name: { bn: "রাব্বানা আতিনা ফিদ্দুনিয়া…", en: "Rabbana atina fid-dunya…" },
    arabic:
      "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    pronunciation: {
      bn: "রাব্বানা- আ-তিনা- ফিদ্দুনইয়া- হাসানাতাওঁ ওয়া ফিল আ-খিরাতি হাসানাতাওঁ ওয়া ক্বিনা- আযা-বান না-র",
      en: "Rabbanā ātinā fid-dunyā ḥasanatan wa fil-ākhirati ḥasanatan wa qinā ʿadhāban-nār",
    },
    meaning: {
      bn: "হে আমাদের রব, আমাদের দুনিয়াতে কল্যাণ দিন, আখিরাতেও কল্যাণ দিন এবং জাহান্নামের আজাব থেকে রক্ষা করুন",
      en: "Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire",
    },
    target: 33,
    references: [{ label: "Quran 2:201" }, { label: "Sahih al-Bukhari 6389" }],
  },
  {
    id: "talbiyah",
    kind: "default",
    name: { bn: "তালবিয়া", en: "Talbiyah" },
    arabic:
      "لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لَا شَرِيكَ لَكَ",
    pronunciation: {
      bn: "লাব্বাইকা আল্লা-হুম্মা লাব্বাইক, লাব্বাইকা লা- শারীকা লাকা লাব্বাইক, ইন্নাল হামদা ওয়ান নি'মাতা লাকা ওয়াল মুলক, লা- শারীকা লাক",
      en: "Labbayka-llāhumma labbayk, labbayka lā sharīka laka labbayk, innal-ḥamda wan-niʿmata laka wal-mulk, lā sharīka lak",
    },
    meaning: {
      bn: "আমি হাজির, হে আল্লাহ, আমি হাজির; আমি হাজির, আপনার কোনো শরিক নেই, আমি হাজির; নিশ্চয়ই সকল প্রশংসা, নিয়ামত ও রাজত্ব আপনারই; আপনার কোনো শরিক নেই",
      en: "Here I am, O Allah, here I am. Here I am, You have no partner, here I am. All praise, grace and dominion are Yours. You have no partner.",
    },
    target: 33,
    references: [
      { label: "Sahih al-Bukhari 1549", detail: "said in the state of ihram" },
      { label: "Sahih Muslim 1184" },
    ],
  },
  {
    id: "salat-ibrahimiyyah",
    kind: "default",
    name: { bn: "দরুদে ইবরাহিম", en: "Salat al-Ibrahimiyyah" },
    arabic:
      "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ",
    pronunciation: {
      bn: "আল্লা-হুম্মা সাল্লি আলা- মুহাম্মাদিওঁ ওয়া আলা- আ-লি মুহাম্মাদ, কামা- সাল্লাইতা আলা- ইবরা-হীমা ওয়া আলা- আ-লি ইবরা-হীম, ইন্নাকা হামীদুম মাজীদ। আল্লা-হুম্মা বা-রিক আলা- মুহাম্মাদিওঁ ওয়া আলা- আ-লি মুহাম্মাদ, কামা- বা-রাকতা আলা- ইবরা-হীমা ওয়া আলা- আ-লি ইবরা-হীম, ইন্নাকা হামীদুম মাজীদ",
      en: "Allāhumma ṣalli ʿalā Muḥammadin wa ʿalā āli Muḥammad, kamā ṣallayta ʿalā Ibrāhīma wa ʿalā āli Ibrāhīm, innaka ḥamīdun majīd. Allāhumma bārik ʿalā Muḥammadin wa ʿalā āli Muḥammad, kamā bārakta ʿalā Ibrāhīma wa ʿalā āli Ibrāhīm, innaka ḥamīdun majīd",
    },
    meaning: {
      bn: "হে আল্লাহ, মুহাম্মাদ ও তাঁর পরিবারের উপর রহমত বর্ষণ করুন, যেমন ইবরাহিম ও তাঁর পরিবারের উপর করেছেন; নিশ্চয়ই আপনি প্রশংসিত, মহিমান্বিত। হে আল্লাহ, মুহাম্মাদ ও তাঁর পরিবারের উপর বরকত দিন, যেমন ইবরাহিম ও তাঁর পরিবারের উপর দিয়েছেন; নিশ্চয়ই আপনি প্রশংসিত, মহিমান্বিত",
      en: "O Allah, send blessings upon Muhammad and the family of Muhammad, as You sent blessings upon Ibrahim and the family of Ibrahim; You are Praiseworthy, Glorious. O Allah, bless Muhammad and the family of Muhammad, as You blessed Ibrahim and the family of Ibrahim; You are Praiseworthy, Glorious",
    },
    target: 10,
    references: [{ label: "Sahih al-Bukhari 3370" }],
  },
  {
    id: "sayyidul-istighfar",
    kind: "default",
    name: { bn: "সাইয়্যিদুল ইস্তিগফার", en: "Sayyid al-Istighfar" },
    arabic:
      "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
    pronunciation: {
      bn: "আল্লা-হুম্মা আন্তা রাব্বী লা- ইলা-হা ইল্লা- আন্তা, খালাক্বতানী ওয়া আনা- আবদুকা, ওয়া আনা- আলা- আহদিকা ওয়া ওয়া'দিকা মাসতাত্বা'তু, আঊযু বিকা মিন শাররি মা- সানা'তু, আবূউ লাকা বিনি'মাতিকা আলাইয়া, ওয়া আবূউ লাকা বিযামবী ফাগফির লী, ফাইন্নাহূ লা- ইয়াগফিরুয যুনূবা ইল্লা- আন্তা",
      en: "Allāhumma anta rabbī lā ilāha illā ant, khalaqtanī wa ana ʿabduk, wa ana ʿalā ʿahdika wa waʿdika mastaṭaʿt, aʿūdhu bika min sharri mā ṣanaʿt, abūʾu laka bi-niʿmatika ʿalayya, wa abūʾu laka bi-dhanbī faghfir lī, fa-innahū lā yaghfirudh-dhunūba illā ant",
    },
    meaning: {
      bn: "হে আল্লাহ, আপনি আমার রব, আপনি ছাড়া কোনো সত্য উপাস্য নেই। আপনি আমাকে সৃষ্টি করেছেন, আমি আপনার বান্দা; আমি সাধ্যমতো আপনার অঙ্গীকার ও প্রতিশ্রুতির উপর আছি। আমার কৃতকর্মের অনিষ্ট থেকে আপনার আশ্রয় চাই। আমার উপর আপনার নিয়ামত স্বীকার করি, আমার গুনাহও স্বীকার করি; অতএব আমাকে ক্ষমা করুন, কারণ আপনি ছাড়া কেউ গুনাহ ক্ষমা করতে পারে না।",
      en: "O Allah, You are my Lord; there is no god but You. You created me and I am Your servant, and I keep Your covenant and promise as far as I can. I seek refuge in You from the evil of what I have done. I acknowledge Your favour upon me and I acknowledge my sin, so forgive me, for none forgives sins but You.",
    },
    target: 1,
    references: [{ label: "Sahih al-Bukhari 6306", detail: "morning and evening" }],
  },
  {
    id: "istighfar-hayyul-qayyum",
    kind: "default",
    name: { bn: "আস্তাগফিরুল্লাহাল্লাযি লা ইলাহা ইল্লা হুয়াল হাইয়্যুল কাইয়্যুম…", en: "Astaghfirullahal-ladhi la ilaha illa huwal-Hayyul-Qayyum…" },
    arabic: "أَسْتَغْفِرُ اللَّهَ الَّذِي لَا إِلَٰهَ إِلَّا هُوَ الْحَيَّ الْقَيُّومَ وَأَتُوبُ إِلَيْهِ",
    pronunciation: {
      bn: "আস্তাগফিরুল্লা-হাল্লাযী লা- ইলা-হা ইল্লা- হুওয়াল হাইয়্যাল ক্বাইয়্যূমা ওয়া আতূবু ইলাইহ",
      en: "Astaghfiru-llāhal-ladhī lā ilāha illā huwal-ḥayyal-qayyūma wa atūbu ilayh",
    },
    meaning: {
      bn: "আমি আল্লাহর কাছে ক্ষমা চাই, যিনি ছাড়া কোনো সত্য উপাস্য নেই, যিনি চিরঞ্জীব, চিরস্থায়ী; এবং তাঁর দিকে ফিরে আসি",
      en: "I seek the forgiveness of Allah, besides whom there is no god, the Ever-Living, the Sustainer, and I turn to Him in repentance",
    },
    target: 3,
    references: [{ label: "Sunan Abi Dawud 1517" }, { label: "Sunan at-Tirmidhi 3577" }],
  },
  {
    id: "kaffaratul-majlis",
    kind: "default",
    name: { bn: "সুবহানাকা আল্লাহুম্মা ওয়া বিহামদিকা… (মজলিসের কাফফারা)", en: "Subhanakallahumma wa bihamdika… (end of a gathering)" },
    arabic: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا أَنْتَ، أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ",
    pronunciation: {
      bn: "সুবহা-নাকা আল্লা-হুম্মা ওয়া বিহামদিকা, আশহাদু আল লা- ইলা-হা ইল্লা- আন্তা, আস্তাগফিরুকা ওয়া আতূবু ইলাইক",
      en: "Subḥānaka-llāhumma wa bi-ḥamdik, ashhadu al-lā ilāha illā ant, astaghfiruka wa atūbu ilayk",
    },
    meaning: {
      bn: "হে আল্লাহ, আপনি পবিত্র, সকল প্রশংসা আপনার; আমি সাক্ষ্য দিই আপনি ছাড়া কোনো সত্য উপাস্য নেই; আপনার কাছে ক্ষমা চাই এবং আপনার দিকে ফিরে আসি",
      en: "Glory be to You, O Allah, and praise be to You. I bear witness that there is no god but You. I seek Your forgiveness and turn to You in repentance",
    },
    target: 1,
    references: [{ label: "Sunan at-Tirmidhi 3433" }, { label: "Sunan Abi Dawud 4859" }],
  },
  {
    id: "dua-karb",
    kind: "default",
    name: { bn: "বিপদের দোয়া (লা ইলাহা ইল্লাল্লাহুল আজিমুল হালিম…)", en: "Dua in distress (La ilaha illallahul-Azimul-Halim…)" },
    arabic:
      "لَا إِلَٰهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَٰهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لَا إِلَٰهَ إِلَّا اللَّهُ رَبُّ السَّمَاوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ",
    pronunciation: {
      bn: "লা- ইলা-হা ইল্লাল্লা-হুল আযীমুল হালীম, লা- ইলা-হা ইল্লাল্লা-হু রাব্বুল আরশিল আযীম, লা- ইলা-হা ইল্লাল্লা-হু রাব্বুস সামা-ওয়া-তি ওয়া রাব্বুল আরদ্বি ওয়া রাব্বুল আরশিল কারীম",
      en: "Lā ilāha illā-llāhul-ʿaẓīmul-ḥalīm, lā ilāha illā-llāhu rabbul-ʿarshil-ʿaẓīm, lā ilāha illā-llāhu rabbus-samāwāti wa rabbul-arḍi wa rabbul-ʿarshil-karīm",
    },
    meaning: {
      bn: "মহান, সহনশীল আল্লাহ ছাড়া কোনো সত্য উপাস্য নেই; মহান আরশের রব আল্লাহ ছাড়া কোনো সত্য উপাস্য নেই; আসমানসমূহের রব, জমিনের রব ও সম্মানিত আরশের রব আল্লাহ ছাড়া কোনো সত্য উপাস্য নেই",
      en: "There is no god but Allah, the Magnificent, the Forbearing. There is no god but Allah, Lord of the magnificent Throne. There is no god but Allah, Lord of the heavens, Lord of the earth and Lord of the noble Throne",
    },
    target: 3,
    references: [{ label: "Sahih al-Bukhari 6346" }, { label: "Sahih Muslim 2730" }],
  },
  {
    id: "bismillahil-ladhi",
    kind: "default",
    name: { bn: "বিসমিল্লাহিল্লাযি লা ইয়াদুররু…", en: "Bismillahil-ladhi la yadurru…" },
    arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    pronunciation: {
      bn: "বিসমিল্লা-হিল্লাযী লা- ইয়াদ্বুররু মা'আসমিহী শাইউন ফিল আরদ্বি ওয়ালা- ফিস সামা-ই, ওয়া হুওয়াস সামী'উল আলীম",
      en: "Bismi-llāhil-ladhī lā yaḍurru maʿa-smihī shayʾun fil-arḍi wa lā fis-samāʾ, wa huwas-samīʿul-ʿalīm",
    },
    meaning: {
      bn: "আল্লাহর নামে, যাঁর নামের সাথে আসমান ও জমিনের কোনো কিছুই ক্ষতি করতে পারে না; তিনি সর্বশ্রোতা, সর্বজ্ঞ",
      en: "In the name of Allah, with whose name nothing on earth or in the heavens can cause harm, and He is the All-Hearing, the All-Knowing",
    },
    target: 3,
    references: [{ label: "Sunan Abi Dawud 5088", detail: "three times, morning and evening" }, { label: "Sunan at-Tirmidhi 3388" }],
  },
  {
    id: "audhu-bikalimatillah",
    kind: "default",
    name: { bn: "আউযু বিকালিমাতিল্লাহিত তাম্মাত…", en: "Aʿudhu bikalimatillahit-tammat…" },
    arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
    pronunciation: { bn: "আঊযু বিকালিমা-তিল্লা-হিত তা-ম্মা-তি মিন শাররি মা- খালাক্ব", en: "Aʿūdhu bi-kalimāti-llāhit-tāmmāti min sharri mā khalaq" },
    meaning: { bn: "আল্লাহর পরিপূর্ণ বাণীসমূহের উসিলায় তাঁর সৃষ্টির অনিষ্ট থেকে আশ্রয় চাই", en: "I seek refuge in the perfect words of Allah from the evil of what He has created" },
    target: 3,
    references: [{ label: "Sahih Muslim 2708" }, { label: "Sahih Muslim 2709", detail: "said in the evening" }],
  },
  {
    id: "raditu-billahi",
    kind: "default",
    name: { bn: "রাদিতু বিল্লাহি রাব্বা…", en: "Raditu billahi rabba…" },
    arabic: "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ نَبِيًّا",
    pronunciation: {
      bn: "রাদ্বীতু বিল্লা-হি রাব্বাওঁ, ওয়া বিল ইসলা-মি দীনাওঁ, ওয়া বিমুহাম্মাদিন নাবিয়্যা",
      en: "Raḍītu billāhi rabbā, wa bil-islāmi dīnā, wa bi-Muḥammadin nabiyyā",
    },
    meaning: {
      bn: "আমি সন্তুষ্ট আল্লাহকে রব হিসেবে, ইসলামকে দ্বীন হিসেবে এবং মুহাম্মাদ ﷺ-কে নবী হিসেবে পেয়ে",
      en: "I am pleased with Allah as my Lord, with Islam as my religion and with Muhammad ﷺ as my Prophet",
    },
    target: 3,
    references: [{ label: "Sunan Abi Dawud 5072", detail: "three times, morning and evening" }],
  },
  {
    id: "hasbiyallah",
    kind: "default",
    name: { bn: "হাসবিয়াল্লাহু লা ইলাহা ইল্লা হুয়া…", en: "Hasbiyallahu la ilaha illa huwa…" },
    arabic: "حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ، عَلَيْهِ تَوَكَّلْتُ، وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
    pronunciation: {
      bn: "হাসবিয়াল্লা-হু লা- ইলা-হা ইল্লা- হুওয়া, আলাইহি তাওয়াক্কালতু, ওয়া হুওয়া রাব্বুল আরশিল আযীম",
      en: "Ḥasbiya-llāhu lā ilāha illā huw, ʿalayhi tawakkalt, wa huwa rabbul-ʿarshil-ʿaẓīm",
    },
    meaning: {
      bn: "আল্লাহই আমার জন্য যথেষ্ট, তিনি ছাড়া কোনো সত্য উপাস্য নেই; তাঁরই উপর ভরসা করেছি, আর তিনি মহান আরশের রব",
      en: "Allah is sufficient for me; there is no god but He. In Him I put my trust, and He is the Lord of the magnificent Throne",
    },
    target: 7,
    references: [{ label: "Quran 9:129" }, { label: "Sunan Abi Dawud 5081", detail: "seven times, morning and evening" }],
  },
  {
    id: "afiyah",
    kind: "default",
    name: { bn: "আল্লাহুম্মা ইন্নি আসআলুকাল আফওয়া ওয়াল আফিয়াহ…", en: "Allahumma inni asʾalukal-ʿafwa wal-ʿafiyah…" },
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ",
    pronunciation: {
      bn: "আল্লা-হুম্মা ইন্নী আসআলুকাল আফওয়া ওয়াল আ-ফিয়াতা ফিদ্দুনইয়া- ওয়াল আ-খিরাহ",
      en: "Allāhumma innī asʾalukal-ʿafwa wal-ʿāfiyata fid-dunyā wal-ākhirah",
    },
    meaning: {
      bn: "হে আল্লাহ, আমি আপনার কাছে দুনিয়া ও আখিরাতে ক্ষমা ও নিরাপত্তা চাই",
      en: "O Allah, I ask You for pardon and well-being in this world and the Hereafter",
    },
    target: 3,
    references: [{ label: "Sunan Abi Dawud 5074" }, { label: "Sunan Ibn Majah 3871" }],
  },
  {
    id: "aghfirli-warhamni",
    kind: "default",
    name: { bn: "আল্লাহুম্মাগফিরলি ওয়ারহামনি…", en: "Allahummaghfir li warhamni…" },
    arabic: "اللَّهُمَّ اغْفِرْ لِي، وَارْحَمْنِي، وَاهْدِنِي، وَعَافِنِي، وَارْزُقْنِي",
    pronunciation: {
      bn: "আল্লা-হুম্মাগফির লী, ওয়ারহামনী, ওয়াহদিনী, ওয়া আ-ফিনী, ওয়ারযুক্বনী",
      en: "Allāhumma-ghfir lī, warḥamnī, wahdinī, wa ʿāfinī, warzuqnī",
    },
    meaning: {
      bn: "হে আল্লাহ, আমাকে ক্ষমা করুন, দয়া করুন, হিদায়াত দিন, নিরাপত্তা দিন এবং রিজিক দিন",
      en: "O Allah, forgive me, have mercy on me, guide me, grant me well-being and provide for me",
    },
    target: 33,
    references: [{ label: "Sahih Muslim 2697" }],
  },
  {
    id: "huda-tuqa",
    kind: "default",
    name: { bn: "আল্লাহুম্মা ইন্নি আসআলুকাল হুদা…", en: "Allahumma inni asʾalukal-huda…" },
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَىٰ وَالتُّقَىٰ وَالْعَفَافَ وَالْغِنَىٰ",
    pronunciation: { bn: "আল্লা-হুম্মা ইন্নী আসআলুকাল হুদা- ওয়াত তুক্বা- ওয়াল আফা-ফা ওয়াল গিনা-", en: "Allāhumma innī asʾalukal-hudā wat-tuqā wal-ʿafāfa wal-ghinā" },
    meaning: { bn: "হে আল্লাহ, আমি আপনার কাছে হিদায়াত, তাকওয়া, পবিত্রতা ও অমুখাপেক্ষিতা চাই", en: "O Allah, I ask You for guidance, piety, chastity and self-sufficiency" },
    target: 33,
    references: [{ label: "Sahih Muslim 2721" }],
  },
  {
    id: "ainni-ala-dhikrika",
    kind: "default",
    name: { bn: "আল্লাহুম্মা আইন্নি আলা জিকরিকা…", en: "Allahumma aʿinni ʿala dhikrika…" },
    arabic: "اللَّهُمَّ أَعِنِّي عَلَىٰ ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ",
    pronunciation: { bn: "আল্লা-হুম্মা আইন্নী আলা- যিকরিকা ওয়া শুকরিকা ওয়া হুসনি ইবা-দাতিক", en: "Allāhumma aʿinnī ʿalā dhikrika wa shukrika wa ḥusni ʿibādatik" },
    meaning: { bn: "হে আল্লাহ, আপনার জিকির, আপনার শুকরিয়া এবং সুন্দরভাবে আপনার ইবাদত করতে আমাকে সাহায্য করুন", en: "O Allah, help me to remember You, to thank You and to worship You well" },
    target: 3,
    references: [{ label: "Sunan Abi Dawud 1522" }],
  },
  {
    id: "ya-muqallibal-qulub",
    kind: "default",
    name: { bn: "ইয়া মুকাল্লিবাল কুলুব…", en: "Ya Muqallibal-qulub…" },
    arabic: "يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَىٰ دِينِكَ",
    pronunciation: { bn: "ইয়া- মুক্বাল্লিবাল ক্বুলূব, সাব্বিত ক্বালবী আলা- দীনিক", en: "Yā muqallibal-qulūb, thabbit qalbī ʿalā dīnik" },
    meaning: { bn: "হে অন্তরসমূহের পরিবর্তনকারী, আমার অন্তরকে আপনার দ্বীনের উপর অবিচল রাখুন", en: "O Turner of hearts, keep my heart firm upon Your religion" },
    target: 33,
    references: [{ label: "Sunan at-Tirmidhi 2140" }],
  },
  {
    id: "hammi-hazan",
    kind: "default",
    name: { bn: "দুশ্চিন্তা ও দুঃখ থেকে আশ্রয়ের দোয়া", en: "Refuge from worry and grief" },
    arabic:
      "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ",
    pronunciation: {
      bn: "আল্লা-হুম্মা ইন্নী আঊযু বিকা মিনাল হাম্মি ওয়াল হাযানি, ওয়াল আজযি ওয়াল কাসালি, ওয়াল বুখলি ওয়াল জুবনি, ওয়া দ্বালা'ইদ দাইনি ওয়া গালাবাতির রিজা-ল",
      en: "Allāhumma innī aʿūdhu bika minal-hammi wal-ḥazan, wal-ʿajzi wal-kasal, wal-bukhli wal-jubn, wa ḍalaʿid-dayni wa ghalabatir-rijāl",
    },
    meaning: {
      bn: "হে আল্লাহ, আমি আপনার আশ্রয় চাই দুশ্চিন্তা ও দুঃখ থেকে, অক্ষমতা ও অলসতা থেকে, কৃপণতা ও ভীরুতা থেকে, ঋণের বোঝা ও মানুষের দাপট থেকে",
      en: "O Allah, I seek refuge in You from worry and grief, from incapacity and laziness, from miserliness and cowardice, from the burden of debt and from being overpowered by men",
    },
    target: 3,
    references: [{ label: "Sahih al-Bukhari 6369" }],
  },
  {
    id: "rabbi-zidni-ilma",
    kind: "default",
    name: { bn: "রাব্বি জিদনি ইলমা", en: "Rabbi zidni ʿilma" },
    arabic: "رَبِّ زِدْنِي عِلْمًا",
    pronunciation: { bn: "রাব্বি যিদনী ইলমা-", en: "Rabbi zidnī ʿilmā" },
    meaning: { bn: "হে আমার রব, আমার জ্ঞান বাড়িয়ে দিন", en: "My Lord, increase me in knowledge" },
    target: 33,
    references: [{ label: "Quran 20:114" }],
  },
  {
    id: "rabbishrah-li",
    kind: "default",
    name: { bn: "রাব্বিশরাহলি সাদরি…", en: "Rabbishrah li sadri…" },
    arabic: "رَبِّ اشْرَحْ لِي صَدْرِي، وَيَسِّرْ لِي أَمْرِي",
    pronunciation: { bn: "রাব্বিশরাহ লী সাদরী, ওয়া ইয়াসসির লী আমরী", en: "Rabbi-shraḥ lī ṣadrī, wa yassir lī amrī" },
    meaning: { bn: "হে আমার রব, আমার বক্ষ প্রশস্ত করে দিন এবং আমার কাজ সহজ করে দিন", en: "My Lord, expand my chest for me and ease my task for me" },
    target: 33,
    references: [{ label: "Quran 20:25–26" }],
  },
  {
    id: "rabbana-zalamna",
    kind: "default",
    name: { bn: "রাব্বানা জালামনা আনফুসানা…", en: "Rabbana zalamna anfusana…" },
    arabic: "رَبَّنَا ظَلَمْنَا أَنْفُسَنَا وَإِنْ لَمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ",
    pronunciation: {
      bn: "রাব্বানা- যোয়ালামনা- আনফুসানা- ওয়া ইল্লাম তাগফির লানা- ওয়া তারহামনা- লানাকূনান্না মিনাল খা-সিরীন",
      en: "Rabbanā ẓalamnā anfusanā wa il-lam taghfir lanā wa tarḥamnā lanakūnanna minal-khāsirīn",
    },
    meaning: {
      bn: "হে আমাদের রব, আমরা নিজেদের উপর জুলুম করেছি; আপনি যদি আমাদের ক্ষমা না করেন ও দয়া না করেন, তবে অবশ্যই আমরা ক্ষতিগ্রস্তদের অন্তর্ভুক্ত হব",
      en: "Our Lord, we have wronged ourselves; if You do not forgive us and have mercy on us, we will surely be among the losers",
    },
    target: 33,
    references: [{ label: "Quran 7:23" }],
  },
  {
    id: "rabbana-la-tuzigh",
    kind: "default",
    name: { bn: "রাব্বানা লা তুজিগ কুলুবানা…", en: "Rabbana la tuzigh qulubana…" },
    arabic: "رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِنْ لَدُنْكَ رَحْمَةً، إِنَّكَ أَنْتَ الْوَهَّابُ",
    pronunciation: {
      bn: "রাব্বানা- লা- তুযিগ ক্বুলূবানা- বা'দা ইয হাদাইতানা- ওয়া হাব লানা- মিল্লাদুনকা রাহমাহ, ইন্নাকা আন্তাল ওয়াহহা-ব",
      en: "Rabbanā lā tuzigh qulūbanā baʿda idh hadaytanā wa hab lanā mil-ladunka raḥmah, innaka antal-wahhāb",
    },
    meaning: {
      bn: "হে আমাদের রব, হিদায়াত দেওয়ার পর আমাদের অন্তরকে বক্র করবেন না এবং আপনার পক্ষ থেকে আমাদের রহমত দান করুন; নিশ্চয়ই আপনি মহাদাতা",
      en: "Our Lord, do not let our hearts deviate after You have guided us, and grant us mercy from Yourself; You are the Bestower",
    },
    target: 33,
    references: [{ label: "Quran 3:8" }],
  },
  {
    id: "rabbirhamhuma",
    kind: "default",
    name: { bn: "রাব্বির হামহুমা… (বাবা-মায়ের জন্য)", en: "Rabbirhamhuma… (for parents)" },
    arabic: "رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
    pronunciation: { bn: "রাব্বির হামহুমা- কামা- রাব্বাইয়া-নী সাগীরা-", en: "Rabbi-rḥamhumā kamā rabbayānī ṣaghīrā" },
    meaning: { bn: "হে আমার রব, তাঁদের প্রতি দয়া করুন, যেমন তাঁরা শৈশবে আমাকে লালনপালন করেছেন", en: "My Lord, have mercy on them as they raised me when I was small" },
    target: 33,
    references: [{ label: "Quran 17:24" }],
  },
  {
    id: "rabbana-hab-lana",
    kind: "default",
    name: { bn: "রাব্বানা হাবলানা মিন আজওয়াজিনা… (পরিবারের জন্য)", en: "Rabbana hab lana min azwajina… (for family)" },
    arabic: "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا",
    pronunciation: {
      bn: "রাব্বানা- হাব লানা- মিন আযওয়া-জিনা- ওয়া যুররিইয়্যা-তিনা- ক্বুররাতা আ'ইউনিওঁ ওয়াজ'আলনা- লিলমুত্তাক্বীনা ইমা-মা-",
      en: "Rabbanā hab lanā min azwājinā wa dhurriyyātinā qurrata aʿyunin wajʿalnā lil-muttaqīna imāmā",
    },
    meaning: {
      bn: "হে আমাদের রব, আমাদের স্ত্রী ও সন্তানদের আমাদের চোখের শীতলতা বানিয়ে দিন এবং আমাদের মুত্তাকিদের ইমাম বানান",
      en: "Our Lord, grant us from our spouses and offspring comfort to our eyes, and make us leaders of the righteous",
    },
    target: 33,
    references: [{ label: "Quran 25:74" }],
  },
];
