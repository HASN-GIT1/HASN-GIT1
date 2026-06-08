import { Passage, Project, Student, AssessmentResult, InterventionPlan, SkillsAssessment } from "./types";

export const DEFAULT_PASSAGES: Passage[] = [
  {
    id: "passage-1",
    title: "عُصْفُورُ الصَّبَاحِ (الصف الأول)",
    text: "هَذَا عُصْفُورٌ صَغِيرٌ. يَطِيرُ فِي السَّمَاءِ الصَّافِيَةِ. يُغَرِّدُ الْعُصْفُورُ فَوْقَ الشَّجَرَةِ الْخَضْرَاءِ بَهْجَةً. يَأْكُلُ الْعُصْفُورُ الْحَبَّ الْمُلَوَّنَ وَيَشْرَبُ الْمَاءَ الْنَّقِيَّ عذباً.",
    gradeLevel: 1,
    wordCount: 24,
    comprehensionQuestions: [
      {
        id: "q1_1",
        question: "أَيْنَ يُغَرِّدُ الْعُصْفُورُ الْجَمِيلُ؟",
        options: ["فَوْقَ الْبَيْتِ الْمُرْتَفِعِ", "فَوْقَ الشَّجَرَةِ الْخَضْرَاءِ", "تَحْتَ التُّرَابِ الرَّطْبِ"],
        correctIndex: 1
      },
      {
        id: "q1_2",
        question: "مَاذَا يَأْكُلُ الْعُصْفُورُ فِي الصَّبَاحِ؟",
        options: ["الْحَبَّ الْمُلَوَّنَ", "أَوْرَاقَ الشَّجَرِ", "الْفَوَاكِهَ اللَّذِيذَةَ"],
        correctIndex: 0
      }
    ]
  },
  {
    id: "passage-2",
    title: "الْمَكْتَبَةُ الْمَدْرَسِيَّةُ (الصف الثاني)",
    text: "زَارَ التَّلَامِيذُ مَكْتَبَةَ الْمَدْرَسَةِ الْوَاسِعَةَ بِسَعَادَةٍ غَامِرَةٍ. جَلَسَ كُلُّ طَالِبٍ يَقْرَأُ كِتَاباً مُفِيداً بِصَمْتٍ وَهُدُوءٍ دَقِيقٍ. قَالَتْ الْمُعَلِّمَةُ الْفَاضِلَةُ: الْكِتَابُ خَيْرُ صَدِيقٍ لِلْإِنْسَانِ، فَاحْفَظُوا عَلَى نَظَافَتِهِ وَنِظَامِهِ دَائِماً.",
    gradeLevel: 2,
    wordCount: 32,
    comprehensionQuestions: [
      {
        id: "q2_1",
        question: "كَيْفَ جَلَسَ الطُّلَّابُ يَقْرَءُونَ فِي الْمَكْتَبَةِ؟",
        options: ["بِصَوْتٍ عَالٍ وَلَعِبٍ", "بِصَمْتٍ وَهُدُوءٍ دَقِيقٍ", "مُسْتَعْجِلِينَ لِلْخُرُوجِ"],
        correctIndex: 1
      },
      {
        id: "q2_2",
        question: "بِمَاذَا نَعَتَتِ الْمُعَلِّمَةُ الْكِتَابَ؟",
        options: ["أَنَّهُ زِينَةٌ لِلْغُرْفَةِ", "أَنَّهُ سَلْوَةٌ ترفيهية دَائِمَةٌ", "أَنَّهُ خَيْرُ صَدِيقٍ لِلْإِنْسَانِ"],
        correctIndex: 2
      }
    ]
  },
  {
    id: "passage-3-short",
    title: "عُطْلَةُ الصَّيْفِ (28 كلمة)",
    text: "سَافَرَ سَامِي مَعَ أُسْرَتِهِ جَوّاً. وَصَلَ إِلَى الْبَحْرِ فِي الصَّبَاحِ. لَعِبَ بِالرَّمْلِ ثُمَّ سَبَحَ كَثِيراً. أَكَلَ سَمَكاً لَذِيذاً مَعَ أَخِيهِ. رَجَعَ إِلَى الْفُنْدُقِ وَنَامَ سَعِيداً.",
    gradeLevel: 3,
    wordCount: 28,
    comprehensionQuestions: [
      {
        id: "q3_s1",
        question: "1. مَتَى وَصَلَ سَامِي وَأُسْرَتُهُ إِلَى الْبَحْرِ؟",
        options: ["فِي الصَّبَاحِ", "فِي الْمَسَاءِ", "فِي الظُّهْرِ"],
        correctIndex: 0
      },
      {
        id: "q3_s2",
        question: "2. مَعَ مَنْ أَكَلَ سَامِي سَمَكاً لَذِيذاً؟",
        options: ["مَعَ أَخِيهِ", "مَعَ أُمّهِ فَقَطْ", "بِمُفْرَدِهِ"],
        correctIndex: 0
      },
      {
        id: "q3_s3",
        question: "3. كَيْفَ سَافَرَ سَامِي وَأُسْرَتُهُ جَوّاً؟ (اسْتِنْتَاجِيَّة بِنَاءً عَلَى 'جَوّاً')",
        options: ["بِالطَّائِرَةِ", "بِالسَّيَّارَةِ", "بِالْقِطَارِ"],
        correctIndex: 0
      },
      {
        id: "q3_s4",
        question: "4. أَيْنَ لَعِبَ سَامِي بَعْدَ وُصُولِهِ؟",
        options: ["بِالرَّمْلِ", "فِي الْحَدِيقَةِ", "فِي السُّوقِ"],
        correctIndex: 0
      },
      {
        id: "q3_s5",
        question: "5. كَيْفَ نَامَ سَامِي فِي نِهَايَةِ الرِّحْلَةِ عِنْدَمَا رَجَعَ إِلَى الْفُنْدُقِ؟",
        options: ["نَامَ سَعِيداً", "نَامَ غَاضِباً", "نَامَ حَزِيناً"],
        correctIndex: 0
      }
    ]
  },
  {
    id: "passage-3",
    title: "عُطلة الصيف (52 كلمة)",
    text: "فِي عُطْلَةِ الصَّيْفِ الْمَاضِيَةِ، سَافَرَ سَامِي الْبَطَلُ مَعَ أُسْرَتِهِ جَوّاً طَائِرِينَ فِي السَّمَاءِ. وَصَلَ الْجَمِيعُ إِلَى شَاطِئِ الْبَحْرِ الْأَزْرَقِ الْجَمِيلِ فِي الصَّبَاحِ الْبَاكِرِ بِنَشَاطٍ. لَعِبَ سَامِي بِالرَِّمْلِ الذَّهَبِيِّ وَصَنَعَ قَصْراً كَبِيراً مَتِيناً، ثُمَّ سَبَحَ فِي الْمَاءِ كَثِيراً. أَكَلَ سَمَكاً طَازَجاً لَذِيذاً مَعَ أَخِيهِ بِسَعَادَةٍ غَامِرَةٍ، ثُمَّ رَجَعَ إِلَى الْفُنْدُقِ الْكَبِيرِ وَنَامَ سَعِيداً.",
    gradeLevel: 3,
    wordCount: 52,
    comprehensionQuestions: [
      {
        id: "q3_1",
        question: "1. مَتَى وَصَلَ سَامِي إِلَى الْبَحْرِ؟",
        options: ["فِي الصَّبَاحِ", "فِي الْمَسَاءِ", "فِي الظُّهْرِ"],
        correctIndex: 0
      },
      {
        id: "q3_2",
        question: "2. مَاذَا أَكَلَ سَامِي مَعَ أَخِيهِ؟",
        options: ["لَحْماً مَشْوِيّاً", "سَمَكاً لَذِيذاً", "أَرْزاً سَاخِناً"],
        correctIndex: 1
      },
      {
        id: "q3_3",
        question: "3. مَا هِيَ وَسِيلَةُ النَّقْلِ الَّتِي اسْتَخْدَمَهَا سَامِي وَأُسْرَتُهُ لِلسَّفَرِ؟ (اسْتِنْتَاجِيَّة بِنَاءً عَلَى 'جَوّاً')",
        options: ["السَّيَّارَةُ", "الْقِطَارُ", "الطَّائِرَةُ"],
        correctIndex: 2
      },
      {
        id: "q3_4",
        question: "4. لِمَاذَا نَامَ سَامِي 'سَعِيداً' فِي نِهَايَةِ رِِحْلَتِهِ؟",
        options: ["لِأَنَّهُ قَضَى يَوْماً مَلِيئاً بِاللَّعِبِ وَالسِّبَاحَةِ وَالْأَنْشِطَةِ الْمُمْتَعَةِ", "لِأَنَّهُ كَانَ خَائِفاً مِنَ الْبَحْرِ", "لِأَنَّهُ أَرَادَ النَّوْمَ بَاكِرَاً"],
        correctIndex: 0
      },
      {
        id: "q3_5",
        question: "5. لَوْ كُنْتَ مَكَانَ سَامِي، هَلْ كُنْتَ سَتَقْضِي يَوْمَكَ بِنَفْسِ الطَّرِيقَةِ، أَمْ أَنَّ هُنَاكَ أَنْشِطَةً أُخْرَى تُفَضِّلُهَا؟",
        options: ["نَعَمْ، كُنْتُ سَأَقْضِي يَوْمِي بِنَفْسِ الطَّرِيقَةِ لِأَنَّ السِّبَاحَةَ وَاللَّعِبَ بِالرِّمْلِ مُمْتِعَانِ", "لَا، كُنْتُ سَأَبْقَى دَاخِلَ الْفُنْدُقِ طَوَالَ الْوَقْتِ دُونَ حَرَاكٍ", "لَا، السَّفَرُ غَيْرُ مُفِيدٍ بِالنِّسْبَةِ لِي"],
        correctIndex: 0
      }
    ]
  },
  {
    id: "passage-4",
    title: "رِحْلَةٌ إِلَى الْفَضَاءِ (الصف الرابع)",
    text: "حَلُمَ خَالِدٌ أَنْ يَكُونَ رَائِدَ فَضَاءٍ يَرْكَبُ مَرْكَبَةً عِمْلَاقَةً. صَعِدَ فِي خَيَالِهِ عَالِياً نَحْوَ الْقَمَرِ الْمُنِيرِ، وَرَأَى النُّجُومَ الْقَرِيبَةَ وَالْبَعِيدَةَ تَلْمَعُ كَالْآلِئِ فِي ظَلَامِ الْكَوْنِ الْفَسِيحِ. شَعَرَ بِعَظَمَةِ الْخَالِقِ السُّبْحَانَ الَّذِي بَدَعَ هَذَا الْكَوْنَ الْأَنِيقَ.",
    gradeLevel: 4,
    wordCount: 42,
    comprehensionQuestions: [
      {
        id: "q4_1",
        question: "إِلَى أَيْنَ صَعِدَ خَالِدٌ فِي أَوْهَامِهِ وَخَيَالِهِ؟",
        options: ["إِلَى قِمَّةِ جَبَلٍ شَاهِقٍ", "نَحْوَ الْقَمَرِ الْمُنِيرِ وَالْفَضَاءِ", "أَعْمَاقِ الْمُحِيطِ الْأَزْرَقِ"],
        correctIndex: 1
      },
      {
        id: "q4_2",
        question: "بِمَاذَا شَعَرَ خَالِدٌ بَعْدَ مُشَاهَدَةِ النُّجُومِ وَالْقَمَرِِ؟",
        options: ["بِشِدَّةِ الْبَرْدِ فِي الظُّلْمَةِ", "بِعَظَمَةِ الْخَالِقِ سُبْحَانَهُ", "بِرَغْبَةٍ فِي الْعَوْدَةِ سَرِيعاً"],
        correctIndex: 1
      }
    ]
  }
];

export const SEED_PROJECTS: Project[] = [
  {
    id: "proj-1",
    name: "مبادرة التقييم المتكامل لمهارات القرائية ومخارج الحروف",
    school: "مدرسة الشروق النموذجية",
    classGrade: "الصف الثاني والثالث الابتدائي",
    researcherName: "أخصائي جودة القراءة",
    createdAt: "2026-05-12T10:00:00Z",
    curriculum: "وزاري"
  },
  {
    id: "proj-2",
    name: "مستكشف الفصاحة اللفظية والطلاقة اللغوية",
    school: "مدرسة التميز التأسيسية",
    classGrade: "الصف الأول والرابع",
    researcherName: "مشرف التمكّن القرائي",
    createdAt: "2026-05-28T14:30:00Z",
    curriculum: "بريطاني"
  }
];

export const SEED_STUDENTS: Student[] = [
  {
    id: "stud-1",
    projectId: "proj-1",
    name: "أحمد ياسين محمد",
    gender: "male",
    grade: 2,
    age: 8,
    notes: "يُعاني من تلعثم طفيف عند نطق الشدّة في الكلمات الثلاثية.",
    createdAt: "2026-05-12T10:15:00Z",
    languageClassification: "A",
    curriculum: "وزاري",
    school: "مدرسة الشروق النموذجية",
    researcherName: "أخصائي جودة القراءة"
  },
  {
    id: "stud-2",
    projectId: "proj-1",
    name: "فاطمة الزهراء علي",
    gender: "female",
    grade: 2,
    age: 7,
    notes: "سرعة ممتازة ومخارج حروف واضحة جداً، تفوق المستوى القياسي.",
    createdAt: "2026-05-12T10:20:00Z",
    languageClassification: "A",
    curriculum: "وزاري",
    school: "مدرسة الشروق النموذجية",
    researcherName: "أخصائي جودة القراءة"
  },
  {
    id: "stud-3",
    projectId: "proj-1",
    name: "عمر خالد الجبري",
    gender: "male",
    grade: 3,
    age: 9,
    notes: "خلط متكرر بين الصاد والسين والتاء والطاء في وسط الكلمة.",
    createdAt: "2026-05-14T09:00:00Z",
    languageClassification: "B",
    curriculum: "وزاري"
  },
  {
    id: "stud-4",
    projectId: "proj-2",
    name: "لجين عبد الله السفياني",
    gender: "female",
    grade: 1,
    age: 6,
    notes: "طالبة واعدة تبدي صعوبة بسيطة في نطق الحركات القصيرة والتهجئة.",
    createdAt: "2026-05-28T15:00:00Z",
    languageClassification: "A",
    curriculum: "بريطاني"
  },
  {
    id: "stud-5",
    projectId: "proj-2",
    name: "زياد فهد الحربي",
    gender: "male",
    grade: 4,
    age: 10,
    notes: "مستوى منضبط ولكن القراءة المرتجلة تفتقد أحياناً لعناصر التشديد اللغوي.",
    createdAt: "2026-05-29T11:00:00Z",
    languageClassification: "B"
  }
];

export const SEED_ASSESSMENTS: AssessmentResult[] = [
  {
    id: "ass-1",
    studentId: "stud-1",
    passageId: "passage-2",
    date: "2026-05-12T11:30:00Z",
    evaluatedBy: "Researcher",
    wordsPerMinute: 21,
    accuracy: 81,
    durationSeconds: 90,
    comprehensionScore: 2,
    totalComprehensionQuestions: 2,
    wordsAnalyzed: [
      { word: "زَارَ", status: "correct" },
      { word: "التَّلَامِيذُ", status: "correct" },
      { word: "مَكْتَبَةَ", status: "correct" },
      { word: "الْمَدْرَسَةِ", status: "correct" },
      { word: "الْوَاسِعَةَ", status: "incorrect", feedback: "نطق الواو منفصلة ببطء" },
      { word: "بِسَعَادَةٍ", status: "correct" },
      { word: "غَامِرَةٍ", status: "correct" },
      { word: "جَلَسَ", status: "correct" },
      { word: "كُلُّ", status: "mispronounced", feedback: "تخفيف المضعف الشدّة" },
      { word: "طَالِبٍ", status: "correct" },
      { word: "يَقْرَأُ", status: "correct" },
      { word: "كِتَاباً", status: "incorrect", feedback: "إسقاط تنوين النصب" },
      { word: "مُفِيداً", status: "correct" },
      { word: "بِصَمْتٍ", status: "correct" },
      { word: "وَهُدُوءٍ", status: "skipped" },
      { word: "دَقِيقٍ", status: "correct" },
      { word: "قَالَتْ", status: "correct" },
      { word: "الْمُعَلِّمَةُ", status: "mispronounced", feedback: "نطق اللام مفتوحة" },
      { word: "الْفَاضِلَةُ", status: "correct" },
      { word: "الْكِتَابُ", status: "correct" },
      { word: "خَيْرُ", status: "correct" },
      { word: "صَدِيقٍ", status: "correct" },
      { word: "لِلْإِنْسَانِ", status: "correct" },
      { word: "فَاحْفَظُوا", status: "incorrect", feedback: "نطق الظاء ضاداً" },
      { word: "عَلَى", status: "correct" },
      { word: "نَظَافَتِهِ", status: "correct" },
      { word: "وَنِظَامِهِ", status: "correct" },
      { word: "دَائِماً", status: "correct" }
    ],
    pronunciationErrors: [
      {
        errorType: "إسقاط تشديد اللام والراء",
        example: "تجاوز شدة 'كلّ' و 'المُعلمة'",
        remediation: "الضغط على الحرف المشدد وإعطاء الطالب تمرين صوتي للتكرار."
      },
      {
        errorType: "تبديل المخرج (الظاء ضاداً)",
        example: "احفظوا نُطقت احفضوا",
        remediation: "تدريب الطالب على مخرج الحرف اللثوي (الظاء) بإخراج رأس اللسان قليلاً."
      }
    ],
    generalFeedback: "أحمد يحرز تقدماً ممتازاً ولكن ينبغي مواصلة التركيز العلمي على الحروف اللثوية ومواقع التضعيف وحركات التنوين."
  },
  {
    id: "ass-2",
    studentId: "stud-2",
    passageId: "passage-2",
    date: "2026-05-12T11:45:00Z",
    evaluatedBy: "AI",
    wordsPerMinute: 58,
    accuracy: 96,
    durationSeconds: 33,
    comprehensionScore: 2,
    totalComprehensionQuestions: 2,
    wordsAnalyzed: [
      { word: "زَارَ", status: "correct" },
      { word: "التَّلَامِيذُ", status: "correct" },
      { word: "مَكْتَبَةَ", status: "correct" },
      { word: "الْمَدْرَسَةِ", status: "correct" },
      { word: "الْوَاسِعَةَ", status: "correct" },
      { word: "بِسَعَادَةٍ", status: "correct" },
      { word: "غَامِرَةٍ", status: "correct" },
      { word: "جَلَسَ", status: "correct" },
      { word: "كُلُّ", status: "correct" },
      { word: "طَالِبٍ", status: "correct" },
      { word: "يَقْرَأُ", status: "correct" },
      { word: "كِتَاباً", status: "correct" },
      { word: "مُفِيداً", status: "correct" },
      { word: "بِصَمْتٍ", status: "correct" },
      { word: "وَهُدُوءٍ", status: "correct" },
      { word: "دَقِيقٍ", status: "correct" },
      { word: "قَالَتْ", status: "correct" },
      { word: "الْمُعَلِّمَةُ", status: "correct" },
      { word: "الْفَاضِلَةُ", status: "correct" },
      { word: "الْكِتَابُ", status: "correct" },
      { word: "خَيْرُ", status: "correct" },
      { word: "صَدِيقٍ", status: "correct" },
      { word: "لِلْإِنْسَانِ", status: "correct" },
      { word: "فَاحْفَظُوا", status: "mispronounced", feedback: "تفخيم الفاء" },
      { word: "عَلَى", status: "correct" },
      { word: "نَظَافَتِهِ", status: "correct" },
      { word: "وَنِظَامِهِ", status: "correct" },
      { word: "دَائِماً", status: "correct" }
    ],
    pronunciationErrors: [],
    generalFeedback: "قراءة فصيحة، مرسلة، عذبة ومخارج ناصعة مذهلة تفوق متوسط المرحلة بمراحل."
  },
  {
    id: "ass-3",
    studentId: "stud-3",
    passageId: "passage-3",
    date: "2026-05-14T10:00:00Z",
    evaluatedBy: "AI",
    wordsPerMinute: 45,
    accuracy: 96,
    durationSeconds: 37,
    comprehensionScore: 4,
    totalComprehensionQuestions: 5,
    wordsAnalyzed: [
      { word: "سَافَرَ", status: "correct" },
      { word: "سَامِي", status: "correct" },
      { word: "مَعَ", status: "correct" },
      { word: "أُسْرَتِهِ", status: "correct" },
      { word: "جَوّاً", status: "correct" },
      { word: "وَصَلَ", status: "correct" },
      { word: "إِلَى", status: "correct" },
      { word: "الْبَحْرِ", status: "correct" },
      { word: "فِي", status: "correct" },
      { word: "الصَّبَاحِ", status: "correct" },
      { word: "لَعِبَ", status: "correct" },
      { word: "بِالرَّمْلِ", status: "correct" },
      { word: "ثُمَّ", status: "correct" },
      { word: "سَبَحَ", status: "correct" },
      { word: "كَثِيراً", status: "correct" },
      { word: "أَكَلَ", status: "correct" },
      { word: "سَمَكاً", status: "correct" },
      { word: "لَذِيذاً", status: "mispronounced", feedback: "تسهيل نطق الذال كأنها زاي 'لزيزاً'" },
      { word: "مَعَ", status: "correct" },
      { word: "أَخِيهِ", status: "correct" },
      { word: "رَجَعَ", status: "correct" },
      { word: "إِلَى", status: "correct" },
      { word: "الْفُنْدُقِ", status: "correct" },
      { word: "وَنَامَ", status: "correct" },
      { word: "سَعِيداً", status: "correct" }
    ],
    pronunciationErrors: [
      {
        errorType: "إبدال صوتي (تسهيل الأحرف اللثوية)",
        example: "نطق كلمة لَذِيذاً كأنها لَزِيزاً",
        remediation: "تدريب الطالب بانتظام على إخراج اللسان لمس الثنايا العليا عند نطق حرف الذال الفصيح."
      }
    ],
    generalFeedback: "عمر فطن جداً ويبدي طلاقة متميزة في القراءة، يحتاج فقط تثبيت مخرج الذال اللثوي لضبط تمام الفصاحة."
  }
];

export const SEED_INTERVENTIONS: InterventionPlan[] = [
  {
    id: "int-1",
    studentId: "stud-1",
    weakness: "ظاهرة تخفيف الحرف المضعف وصعوبة إظهار مخارج الأحرف اللثوية (الظاء والذال وثاء).",
    objectives: [
      "تمكين الطالب من تثبيت مخرج الظاء لفظاً وصورياً في الكلمات الثلاثية والرباعية.",
      "تطبيق نبر التشديد في قراءة الحروف مع الحركة القصيرة."
    ],
    activities: [
      {
        activityTitle: "تحدي تركيب المقاطع وتحليلها (علاج الشدة)",
        instructions: "توجيه الطالب لسحب ودمج المقاطع الصوتية لتشديد الكلمة وتدريبه العملي لتبين ميزان وتتابع نطق الحروف المضعفة.",
        type: "syllables",
        data: {
          word: "قَدَّمَ",
          parts: ["قَدْ", "دَ", "مَ"]
        }
      },
      {
        activityTitle: "اختيار الضبط السليم في الجمل والكلمات",
        instructions: "توجيه وحث الطالب لمراقبة النطق الفصيح للأصوات والشدة، ثم دعمه لاختيار وضبط الكلمة لثوياً ولغوياً.",
        type: "multiple-choice",
        data: {
          question: "أي الكلمات التالية تشتمل على النطق السليم لحرف (الظاء) اللثوي المضموم؟",
          options: ["الظُّفْرُ", "الزُّفْرُ", "الدُّفْرُ"],
          correctAnswer: "الظُّفْرُ"
        }
      },
      {
        activityTitle: "تركيب أحرف الكلمات المبعثرة",
        instructions: "إرشاد ومطالبة الطالب بترتيب الأحرف المبعثرة للكلمة المسموعة لتمكين وعيه الفونيمي السريع للفظ المخارج اللثوية.",
        type: "scramble",
        data: {
          scrambledLetters: ["ظ", "ه", "ر"],
          correctWord: "ظهر"
        }
      }
    ],
    teacherAdvice: "يُنصح بمراجعة الحروف الملونة وتمرين الفك بمعدل عشر دقائق صباحية قبل بدء الحصة الرئيسية.",
    createdAt: "2026-05-13T09:00:00Z",
    status: "active"
  }
];

export interface BenchmarkExpectation {
  grade: number;
  fluentWpmMin: number;
  fluentWpmIdeal: number;
  accuracyMin: number;
  comprehensionMin: number; // percentage
  recommendation: string;
}

export const ARABIC_LITERACY_BENCHMARKS: BenchmarkExpectation[] = [
  {
    grade: 1,
    fluentWpmMin: 15,
    fluentWpmIdeal: 30,
    accuracyMin: 80,
    comprehensionMin: 60,
    recommendation: "التركيز المطلق على تهجئة الأحرف الهجائية بالحركات القصيرة الثلاثة (فتحة، ضمة، كسرة) والتدريب على الكلمات الثلاثية البسيطة."
  },
  {
    grade: 2,
    fluentWpmMin: 30,
    fluentWpmIdeal: 55,
    accuracyMin: 85,
    comprehensionMin: 70,
    recommendation: "الدخول المكثف في المجموعات اللفظية والتدريب على الوعي المقطعي والمدود الثنائية والتنوين والتفريق البصري السريع بين الحروف المتشابهة."
  },
  {
    grade: 3,
    fluentWpmMin: 50,
    fluentWpmIdeal: 75,
    accuracyMin: 90,
    comprehensionMin: 80,
    recommendation: "الانتقال لقراءة الجمل الطويلة الصامتة والجهرية والتشديد اللغوي ومواقع علامات الترقيم وبناء عضلات الفهم الاستنباطي المباشر."
  },
  {
    grade: 4,
    fluentWpmMin: 70,
    fluentWpmIdeal: 100,
    accuracyMin: 95,
    comprehensionMin: 85,
    recommendation: "تركيز العلاج القرائي على الطلاقة مع التلوين الصوتي والضبط النحوي التلقائي لقراءة نصوص علمية وثقافية أطول واستخلاص الفكرة الرئيسية للفقرة."
  }
];

export interface HanadaTahaBenchmark {
  grade: number;
  title: string;
  focusMetric: string;
  fluencyTarget: string;
  accuracyTarget: string;
  comprehensionTarget: string;
  coreSkills: string[];
  diagnosticCriteria: string[];
  remediationPath: string;
}

export const HANADA_TAHA_BENCHMARKS: HanadaTahaBenchmark[] = [
  {
    grade: 1,
    title: "الصف الأول الابتدائي (تأسيس الوعي الفونيمي والأصوات)",
    focusMetric: "قراءة أصوات الحروف المفردة ودمج المقاطع الثنائية والثلاثية بالحركات القصيرة والمدود الأساسية.",
    fluencyTarget: "15 - 30 كلمة صحيحة بالدقيقة (WPM)",
    accuracyTarget: "ما لا يقل عن 80% دقة لفظية",
    comprehensionTarget: "60% فما فوق (الاستدعاء الفوري والحكائي)",
    coreSkills: [
      "الوعي الصوتي التام بمخارج الحروف العربية اللثوية والمفخمة",
      "الربط البصري الصوتي للحروف بأشكالها الثلاثة بالكلمة",
      "التهجئة الفونيمية المباشرة للقطع القصيرة المشكولة",
      "تمييز المد بالألف والواو والياء بالكلمات"
    ],
    diagnosticCriteria: [
      "قياس معرفة أصوات الحروف ونطقها الفردي",
      "قياس قراءة المقاطع البسيطة (حرف متحرك + ساكن)",
      "سرعة استدعاء الكلمات البصرية والأسماء الشائعة"
    ],
    remediationPath: "البدء بالانتقال من الكل للجزء (الصوت الفردي) وتنمية التدريب اليومي على المقاطع الثنائية، واستعمال البطاقات الملونة المجزأة لتسهيل التركيب والدمج الفونيمي."
  },
  {
    grade: 2,
    title: "الصف الثاني الابتدائي (علاج الطلاقة الصوتية والمقاطع المتوسطة)",
    focusMetric: "قراءه الجمل المتصلة القصيرة بطلاقة نسبية مع نطق المقطع الساكن، التنوين والشدة واللاّم ال التعريفية بوضوح.",
    fluencyTarget: "30 - 55 كلمة صحيحة بالدقيقة (WPM)",
    accuracyTarget: "ما لا يقل عن 85% دقة لفظية",
    comprehensionTarget: "70% فما فوق (فهم صريح مباشر للمفردات الأساسية)",
    coreSkills: [
      "نطق الشدة (التضعيف) مع الفتح والضم والكسر",
      "قراءة تنوين الكسر والضم والفتح بنبر لغوي واضح",
      "التفريق الصوتي التطبيقي السريع للجمل المنشأة بـ (الـ) الشمسية والقمرية",
      "الاستجابة لعلامة السكون في نهاية المقاطع"
    ],
    diagnosticCriteria: [
      "اختبار قراءة الكلمات الثلاثية والرباعية المحلاة بالشدّ والغُنّة",
      "قياس قراءة الجمل من 3-5 كلمات مع الحركات الإعرابية",
      "ثنائيات الكلمات المتشابهة في اللفظ مخرجاً (كـ الصاد والسين)"
    ],
    remediationPath: "تطوير طلاقة قراءة جمل قصيرة متتالية، واستعمال تمرينات الحذف والإضافة للمنظومات الحرفية لترسيخ التضعيف والوعي البصري، وصنع لوحات ملوّنة تصنيفية للّام اللفظية والخطّية."
  },
  {
    grade: 3,
    title: "الصف الثالث الابتدائي (الطلاق الفصيحة والفهم الاستنباطي)",
    focusMetric: "قراءة نصوص نثرية متعددة الفقرات مع تلوين صوتي معبر ومراعاة تامة لعلامات التوقف الاستباقية والفهم الضمني.",
    fluencyTarget: "50 - 75 كلمة صحيحة بالدقيقة (WPM)",
    accuracyTarget: "ما لا يقل عن 90% دقة لفظية",
    comprehensionTarget: "80% فما فوق (الفهم الحرفي والاستنتاجي والأرشفة الذهنية)",
    coreSkills: [
      "التلوين الصوتي والاسترسال المعبر لغرض الاستفهام أو الدهشة",
      "مراعاة علامات الترقيم الكبرى (الفاصلة، النقطة، النقطتان، وعلامة الاستفهام)",
      "قراءة التراكيب النحوية البسيطة وضبط أواخر الكلم بمراعاة الوقف لغةً",
      "تحديد مغزى النص والقصة القصيرة والأفكار الفرعية المستنبطة"
    ],
    diagnosticCriteria: [
      "تقييم التنغيم الصوتي (Prosody) وسياق تدفق الكلمات الفصيحة",
      "حل أسئلة الفهم الاستنباطي (مستويات التحليل والاستنباط غير الصريح)",
      "استبدال مرادفات الكلمات في سياق الجمل اللغوية الصعبة"
    ],
    remediationPath: "نمذجة القراءة المعبرة من الباحث (أو النظام) باستمرار، وإشراك الطالب في القراءة التبادلية والمسرح اللفظي، ودعم الفك المتأخر عبر تلخيص بطاقات الفهم برسم خرائط ذهنية طفولية."
  }
];

export interface DouglasFisherGuideline {
  phase: string;
  title: string;
  englishTitle: string;
  actor: string;
  description: string;
  scaffoldingActions: string[];
}

export const DOUGLAS_FISHER_FRAMEWORK: DouglasFisherGuideline[] = [
  {
    phase: "أولاً",
    title: "النمذجة والتهيئة المباشرة",
    englishTitle: "I Do (Focused Instruction)",
    actor: "الباحث والمنصة",
    description: "يقوم الباحث (أو نظام القراءة الصوتي بالمنصة) بعرض القراءة الفصيحة النموذجية مع الإشارة البصرية النشطة للكلمات والتلوين الصوتي لمعالجة مخارج الحروف الشائعة.",
    scaffoldingActions: [
      "نطق الكلمات الصعبة بصوت جهوري مشكول ومطمئن.",
      "توضيح كيفية استخدام ميزات التقطيع والتحفيز الذكي بالمنصة.",
      "شرح فكرة القراءة الفاحصة (Close Reading) عبر الوقوف على أفكار النص."
    ]
  },
  {
    phase: "ثانياً",
    title: "القراءة التوجيهية المشتركة",
    englishTitle: "We Do (Guided Instruction)",
    actor: "الباحث + الطالب معاً",
    description: "يقرأ الطالب بدعم لوحة تليين الحروف بالمنصة مع إرشاد الباحث الفوري ولحظي لحركات الحروف الصعبة، حيث يتشارك الطرفان ثقل المهمة.",
    scaffoldingActions: [
      "حصر الأخطاء النطقية عبر النقر التفاعلي على الكلمات وتصحيحها فوراً ببطء.",
      "طرح أسئلة توجيهية فرعية لإرشاد الفهم نحو الحقيقة أو المغزى دون إعطاء الإجابة مباشرة.",
      "استلهام ألعاب الوعي اللغوي (مقاطع الكلمات، اختيار الحروف المنتشرة)."
    ]
  },
  {
    phase: "ثالثاً",
    title: "القراءة التعاونية والأقران",
    englishTitle: "You Do It Together (Collaborative)",
    actor: "الطلاب ومجموعة البحث",
    description: "تطبيق استراتيجية القراءة التعاونية، حيث يقوم فريق البحث بتعريف الأطفال على بيئة المنصة التشاركية وقراءة النصوص متبوعة بالمناقشة وحل ألغاز التطابق.",
    scaffoldingActions: [
      "تنظيم الطلاب في ثنائيات أو مجموعات بحثية صغيرة لمقارنة الطلاقة والدروع الرمزية في المنصة.",
      "السماح للأطفال بتقييم نطق بعضهم في إطار آمن وجاذب للتحسين الفردي والجمعي.",
      "الاسترشاد بالألعاب العلاجية (Intervention Arcade Arena)."
    ]
  },
  {
    phase: "رابعاً",
    title: "الممارسة المستقلة المعززة",
    englishTitle: "You Do It Alone (Independent Learning)",
    actor: "الطالب بمفرده",
    description: "يقرأ الطفل النص بشكل جهرى أمام الميكروفون المطور بالذكاء الاصطناعي بنسبة اعتماد كاملة على قدراته، لتكوين المنحنى والتحليل المستقل.",
    scaffoldingActions: [
      "توليد تقرير الطلاقة المستقل والفاقد القرائي بدقة بالغة.",
      "تشغيل الذكاء الاصطناعي لتقديم تغذية راجعة لطيفة خالية من الإحراج ومطابقة لتمارين الدعم الفردي.",
      "مكافأة البطل بالأوسمة والنجوم وإدراج إنجازه بملف التقدم المستمر."
    ]
  }
];

export const SEED_SKILLS_ASSESSMENTS: SkillsAssessment[] = [
  {
    id: "skills-ass-1",
    studentId: "stud-1", // أحمد ياسين محمد
    date: "2026-05-20T10:00:00Z",
    phonologicalAwareness: 4,
    letterKnowledge: 5,
    decoding: 3,
    fluency: 3,
    vocabulary: 4,
    readingComprehension: 4,
    oralReading: 3,
    notes: "يُظهر مهارات ممتازة في تمييز الحروف والوعي الصوتي التام، ولكنه متردد قليلاً في فك ترميز الكلمات المشددة بطلاقة.",
    evaluatedBy: "أ.د. عبد الرحمن بن فهد"
  },
  {
    id: "skills-ass-2",
    studentId: "stud-2", // فاطمة الزهراء علي
    date: "2026-05-22T11:30:00Z",
    phonologicalAwareness: 5,
    letterKnowledge: 5,
    decoding: 5,
    fluency: 5,
    vocabulary: 5,
    readingComprehension: 5,
    oralReading: 5,
    notes: "قراءة رائعة ومتمكنة لكافة المهارات السبع، اللفظ جلي والتلوين الصوتي متسق تماماً.",
    evaluatedBy: "أ.د. عبد الرحمن بن فهد"
  },
  {
    id: "skills-ass-3",
    studentId: "stud-3", // عمر خالد الجبري
    date: "2026-05-25T09:15:00Z",
    phonologicalAwareness: 2,
    letterKnowledge: 3,
    decoding: 2,
    fluency: 2,
    vocabulary: 3,
    readingComprehension: 4,
    oralReading: 2,
    notes: "يعاني من فجوة في الوعي الصوتي وفك الترميز، ولديه خلط بين مخارج بعض الحروف اللثوية والشجرية. ينصح بحصص مكثفة للوعي الفونيمي والمقاطع الصوتية.",
    evaluatedBy: "د. هند الشاطر"
  }
];

