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
];
