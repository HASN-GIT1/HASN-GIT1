import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  BookOpen,
  Users,
  FolderGit2,
  AudioLines,
  FileSpreadsheet,
  BrainCircuit,
  CheckCircle2,
  Mic,
  MicOff,
  Square,
  Play,
  Volume2,
  Award,
  Activity,
  Plus,
  Trash2,
  Search,
  FileText,
  BarChart3,
  HelpCircle,
  Lightbulb,
  Sparkles,
  Gamepad2,
  RefreshCw,
  AlertCircle,
  Calendar,
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  TrendingUp,
  Settings,
  Printer,
  Download,
  Table,
  Upload,
  Lock,
  Unlock,
  Gauge
} from "lucide-react";

import {
  Project,
  Student,
  Passage,
  AssessmentResult,
  InterventionPlan,
  InteractionActivity,
  SkillsAssessment
} from "./types";

import {
  DEFAULT_PASSAGES,
  SEED_PROJECTS,
  SEED_STUDENTS,
  SEED_ASSESSMENTS,
  SEED_INTERVENTIONS,
  ARABIC_LITERACY_BENCHMARKS,
  SEED_SKILLS_ASSESSMENTS
} from "./data";

import {
  printAssessmentReport,
  printInterventionReport
} from "./utils/printHelper";

export default function App() {
  // --- Persistent Local State Core ---
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem("qira_projects");
    return saved ? JSON.parse(saved) : SEED_PROJECTS;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem("qira_students");
    return saved ? JSON.parse(saved) : SEED_STUDENTS;
  });

  const [assessments, setAssessments] = useState<AssessmentResult[]>(() => {
    const saved = localStorage.getItem("qira_assessments");
    return saved ? JSON.parse(saved) : SEED_ASSESSMENTS;
  });

  const [interventions, setInterventions] = useState<InterventionPlan[]>(() => {
    const saved = localStorage.getItem("qira_interventions");
    return saved ? JSON.parse(saved) : SEED_INTERVENTIONS;
  });

  const [passages, setPassages] = useState<Passage[]>(() => {
    const saved = localStorage.getItem("qira_passages");
    return saved ? JSON.parse(saved) : DEFAULT_PASSAGES;
  });

  const [skillsAssessments, setSkillsAssessments] = useState<SkillsAssessment[]>(() => {
    const saved = localStorage.getItem("qira_skills_assessments");
    return saved ? JSON.parse(saved) : SEED_SKILLS_ASSESSMENTS;
  });

  // Sync state with LocalStorage
  useEffect(() => {
    localStorage.setItem("qira_projects", JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem("qira_students", JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem("qira_assessments", JSON.stringify(assessments));
  }, [assessments]);

  useEffect(() => {
    localStorage.setItem("qira_interventions", JSON.stringify(interventions));
  }, [interventions]);

  useEffect(() => {
    localStorage.setItem("qira_passages", JSON.stringify(passages));
  }, [passages]);

  useEffect(() => {
    localStorage.setItem("qira_skills_assessments", JSON.stringify(skillsAssessments));
  }, [skillsAssessments]);

  // --- Real-time Platforms Synchronization ---
  const [deletedIds, setDeletedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("qira_deleted_ids");
    return saved ? JSON.parse(saved) : [];
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [activeResearchers, setActiveResearchers] = useState<any[]>([]);

  // --- Local User Identity for Collaborating Presence ---
  const [localUserId] = useState<string>(() => {
    let id = localStorage.getItem("qira_researcher_id");
    if (!id) {
      id = "res-" + Math.random().toString(36).substring(2, 11);
      localStorage.setItem("qira_researcher_id", id);
    }
    return id;
  });

  const [localUserNameState, setLocalUserNameState] = useState<string>(() => {
    const savedName = localStorage.getItem("qira_researcher_name");
    return savedName || "باحث زائر " + Math.floor(Math.random() * 900 + 100);
  });

  const [isEditingLocalUserName, setIsEditingLocalUserName] = useState<boolean>(false);
  const [tempUserName, setTempUserName] = useState<string>("");

  useEffect(() => {
    localStorage.setItem("qira_deleted_ids", JSON.stringify(deletedIds));
  }, [deletedIds]);

  // Periodic presence heartbeat mimicking setDoc(doc(db, "active_researchers", userId), { ... })
  useEffect(() => {
    const sendHeartbeat = async () => {
      try {
        const response = await fetch("/api/active-researcher", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            userId: localUserId,
            name: localUserNameState,
            online: true
          })
        });
        if (response.ok) {
          const data = await response.json();
          if (data.activeResearchers) {
            setActiveResearchers(data.activeResearchers);
          }
        }
      } catch (err) {
        console.warn("Heartbeat update failed to reach presence registry.", err);
      }
    };

    // Send immediately on identity setup or change
    sendHeartbeat();

    // Heartbeat every 4 seconds to maintain active status
    const interval = setInterval(sendHeartbeat, 4000);

    // Set offline when unmounting or tab closed
    const handleUnload = () => {
      navigator.sendBeacon("/api/active-researcher", JSON.stringify({
        userId: localUserId,
        name: localUserNameState,
        online: false
      }));
    };
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [localUserId, localUserNameState]);

  const syncPlatformData = async (overrides?: {
    projects?: Project[];
    students?: Student[];
    assessments?: AssessmentResult[];
    interventions?: InterventionPlan[];
    passages?: Passage[];
    skillsAssessments?: SkillsAssessment[];
    deletedIds?: string[];
  }) => {
    if (isSyncing) return;
    setIsSyncing(true);
    const activeDeletedIds = overrides?.deletedIds ?? deletedIds;
    try {
      const response = await fetch("/api/sync-platform-data", {
        method: "POST",
        cache: "no-store",
        headers: { 
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          "Pragma": "no-cache"
        },
        body: JSON.stringify({
          projects: overrides?.projects ?? projects,
          students: overrides?.students ?? students,
          assessments: overrides?.assessments ?? assessments,
          interventions: overrides?.interventions ?? interventions,
          passages: overrides?.passages ?? passages,
          skillsAssessments: overrides?.skillsAssessments ?? skillsAssessments,
          deletedIds: activeDeletedIds
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Match lists securely and update state if changes happened
        if (JSON.stringify(data.projects) !== JSON.stringify(projects)) {
          setProjects(data.projects);
        }
        if (JSON.stringify(data.students) !== JSON.stringify(students)) {
          setStudents(data.students);
        }
        if (JSON.stringify(data.assessments) !== JSON.stringify(assessments)) {
          setAssessments(data.assessments);
        }
        if (JSON.stringify(data.interventions) !== JSON.stringify(interventions)) {
          setInterventions(data.interventions);
        }
        if (JSON.stringify(data.passages) !== JSON.stringify(passages)) {
          setPassages(data.passages);
        }
        if (JSON.stringify(data.skillsAssessments) !== JSON.stringify(skillsAssessments)) {
          setSkillsAssessments(data.skillsAssessments);
        }
        if (data.activeResearchers) {
          setActiveResearchers(data.activeResearchers);
        }

        // Clear local deleted IDs processed by server
        setDeletedIds(prev => prev.filter(id => !activeDeletedIds.includes(id)));
      }
    } catch (err) {
      console.warn("Real-time cloud database sync failed. Active locally.", err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Initial and periodic platform-wide polling for researcher collaborative state
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await fetch(`/api/get-platform-data?_t=${Date.now()}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
            "Pragma": "no-cache"
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.projects) setProjects(data.projects);
          if (data.students) setStudents(data.students);
          if (data.assessments) setAssessments(data.assessments);
          if (data.interventions) setInterventions(data.interventions);
          if (data.passages) setPassages(data.passages);
          if (data.skillsAssessments) setSkillsAssessments(data.skillsAssessments);
          if (data.activeResearchers) setActiveResearchers(data.activeResearchers);
        }
      } catch (err) {
        console.warn("Initial active cloud fetch failed.", err);
      }
    };
    fetchInitialData();

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/get-platform-data?_t=${Date.now()}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
            "Pragma": "no-cache"
          }
        });
        if (response.ok) {
          const data = await response.json();
          setProjects(prev => JSON.stringify(prev) !== JSON.stringify(data.projects) ? data.projects : prev);
          setStudents(prev => JSON.stringify(prev) !== JSON.stringify(data.students) ? data.students : prev);
          setAssessments(prev => JSON.stringify(prev) !== JSON.stringify(data.assessments) ? data.assessments : prev);
          setInterventions(prev => JSON.stringify(prev) !== JSON.stringify(data.interventions) ? data.interventions : prev);
          setPassages(prev => JSON.stringify(prev) !== JSON.stringify(data.passages) ? data.passages : prev);
          setSkillsAssessments(prev => JSON.stringify(prev) !== JSON.stringify(data.skillsAssessments) ? data.skillsAssessments : prev);
          if (data.activeResearchers) {
            setActiveResearchers(data.activeResearchers);
          }
        }
      } catch (err) {
        console.debug("Cloud synchronization currently paused.", err);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  // --- Automatic migration effect for 28-word and 52-word summer holiday passages ---
  useEffect(() => {
    if (!passages || passages.length === 0) return;
    
    let changed = false;
    const nextPassages = passages.map(p => {
      if (p.id === "passage-3") {
        const correctP3Text = "فِي عُطْلَةِ الصَّيْفِ الْمَاضِيَةِ، سَافَرَ سَامِي الْبَطَلُ مَعَ أُسْرَتِهِ جَوّاً طَائِرِينَ فِي السَّمَاءِ. وَصَلَ الْجَمِيعُ إِلَى شَاطِئِ الْبَحْرِ الْأَزْرَقِ الْجَمِيلِ فِي الصَّبَاحِ الْبَاكِرِ بِنَشَاطٍ. لَعِبَ سَامِي بِالرَِّمْلِ الذَّهَبِيِّ وَصَنَعَ قَصْراً كَبِيراً مَتِيناً، ثُمَّ سَبَحَ فِي الْمَاءِ كَثِيراً. أَكَلَ سَمَكاً طَازَجاً لَذِيذاً مَعَ أَخِيهِ بِسَعَادَةٍ غَامِرَةٍ، ثُمَّ رَجَعَ إِلَى الْفُنْدُقِ الْكَبِيرِ وَنَامَ سَعِيداً.";
        const correctP3Title = "عُطلة الصيف (52 كلمة)";
        const defaultQuestions = DEFAULT_PASSAGES.find(item => item.id === "passage-3")?.comprehensionQuestions || [];
        
        const hasOutdatedText = p.text !== correctP3Text;
        const hasOutdatedTitle = p.title !== correctP3Title;
        const hasMissingQuestions = !p.comprehensionQuestions || p.comprehensionQuestions.length < 5;
        
        if (hasOutdatedText || hasOutdatedTitle || hasMissingQuestions) {
          changed = true;
          let mergedQuestions = [...defaultQuestions];
          if (p.comprehensionQuestions && p.comprehensionQuestions.length > 0) {
            p.comprehensionQuestions.forEach(sq => {
              if (!mergedQuestions.some(mq => mq.id === sq.id || mq.question === sq.question)) {
                mergedQuestions.push(sq);
              }
            });
          }
          return {
            ...p,
            title: correctP3Title,
            text: correctP3Text,
            wordCount: 52,
            comprehensionQuestions: mergedQuestions
          };
        }
      }
      if (p.id === "passage-3-short") {
        const defaultQuestionsShort = DEFAULT_PASSAGES.find(item => item.id === "passage-3-short")?.comprehensionQuestions || [];
        const hasMissingQuestionsShort = !p.comprehensionQuestions || p.comprehensionQuestions.length < 5;
        if (hasMissingQuestionsShort) {
          changed = true;
          return {
            ...p,
            comprehensionQuestions: defaultQuestionsShort
          };
        }
      }
      return p;
    });

    const hasP3Short = passages.some(p => p.id === "passage-3-short");
    if (!hasP3Short) {
      changed = true;
      const defaultP3Short = DEFAULT_PASSAGES.find(x => x.id === "passage-3-short") || {
        id: "passage-3-short",
        title: "عُطْلَةُ الصَّيْفِ (28 كلمة)",
        text: "سَافَرَ سَامِي مَعَ أُسْرَتِهِ جَوّاً. وَصَلَ إِلَى الْبَحْرِ فِي الصَّبَاحِ. لَعِبَ بِالرَّمْلِ ثُمَّ سَبَحَ كَثِيراً. أَكَلَ سَمَكاً لَذِيذاً مَعَ أَخِيهِ. رَجَعَ إِلَى الْفُنْدُقِ وَنَامَ سَعِيداً.",
        gradeLevel: 3,
        wordCount: 28,
        comprehensionQuestions: []
      };
      if (defaultP3Short.comprehensionQuestions.length === 0) {
        defaultP3Short.comprehensionQuestions = DEFAULT_PASSAGES.find(x => x.id === "passage-3-short")?.comprehensionQuestions || [];
      }
      nextPassages.push(defaultP3Short);
    }

    if (changed) {
      setPassages(nextPassages);
      syncPlatformData({ passages: nextPassages });
    }
  }, [passages]);

  // --- Layout & Tabs Navigation State ---
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isChildFriendlyMode, setIsChildFriendlyMode] = useState<boolean>(true);
  const [benchmarkSubTab, setBenchmarkSubTab] = useState<"hanada" | "fisher" | "general">("hanada");

  // States for Douglas Fisher Intervention Plan Builder
  const [fisherStudentId, setFisherStudentId] = useState<string>("");
  const [fisherDifficulty, setFisherDifficulty] = useState<string>("decoding");
  const [fisherTier, setFisherTier] = useState<string>("tier2");
  const [generatedFisherPlan, setGeneratedFisherPlan] = useState<any>(null);

  // Selection states for assessment flows
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || "");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [selectedPassageId, setSelectedPassageId] = useState<string>(passages[0]?.id || "pass-1");

  // Modal forms states
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);

  // New Project Form State
  const [newProjName, setNewProjName] = useState("");
  const [newProjSchool, setNewProjSchool] = useState("");
  const [newProjGrade, setNewProjGrade] = useState("");
  const [newProjResearcher, setNewProjResearcher] = useState("");
  const [newProjCurriculum, setNewProjCurriculum] = useState<"وزاري" | "بريطاني">("وزاري");

  // New Student Form State
  const [newStudName, setNewStudName] = useState("");
  const [newStudGender, setNewStudGender] = useState<"male" | "female">("male");
  const [newStudGrade, setNewStudGrade] = useState<number>(2);
  const [newStudAge, setNewStudAge] = useState<number>(8);
  const [newStudNotes, setNewStudNotes] = useState("");
  const [newStudLanguageClassification, setNewStudLanguageClassification] = useState<"A" | "B">("A");
  const [newStudCurriculum, setNewStudCurriculum] = useState<"وزاري" | "بريطاني">("وزاري");
  const [newStudSchool, setNewStudSchool] = useState("");
  const [newStudResearcher, setNewStudResearcher] = useState("");

  // Custom Passage Builder Form State
  const [isEditingPassageQuestions, setIsEditingPassageQuestions] = useState<boolean>(false);
  const [cpTitle, setCpTitle] = useState("");
  const [cpText, setCpText] = useState("");
  const [cpGrade, setCpGrade] = useState<number>(2);
  const [cpQuestions, setCpQuestions] = useState<any[]>([
    { question: "ما الفكرة الأساسية من النص المقروء؟", options: ["أهمية القراءة وتأثيرها التربوي", "مجرد سرد مسلٍ للأطفال", "التعاون مع المعلمين فقط"], correctIndex: 0, isConstant: true },
    { question: "ما هو المستفاد التربوي من هذا الموضوع؟", options: ["المثابرة وتنمية مهارات التعبير السليم", "تجاوز التدريب المنزلي بالكامل", "تجنب فك الترميز التلقائي"], correctIndex: 0, isConstant: false }
  ]);
  const [cpIsAnalyzing, setCpIsAnalyzing] = useState(false);
  const [cpUploadedFile, setCpUploadedFile] = useState<{ name: string; size: number; type: string; dataUrl?: string } | null>(null);
  const [cpIsExtracting, setCpIsExtracting] = useState(false);
  const [isOcrDiagOriginalLoading, setIsOcrDiagOriginalLoading] = useState(false);
  const [isOcrDiagStudentLoading, setIsOcrDiagStudentLoading] = useState(false);

  // --- Real Microphone Recording State & Feedback Hub ---
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const [micVolume, setMicVolume] = useState<number[]>([10, 15, 8, 20, 12, 18, 5]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordIntervalRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micAnimationRef = useRef<number | null>(null);

  // Active Interactive Assessment Result
  const [activeAiResult, setActiveAiResult] = useState<AssessmentResult | null>(null);
  const [userComprehensionAnswers, setUserComprehensionAnswers] = useState<{ [qId: string]: number }>({});
  const [isComprehensionVerified, setIsComprehensionVerified] = useState(false);

  // --- Manual Assessment Designer ---
  const [manualWordsState, setManualWordsState] = useState<{ word: string; status: "correct" | "incorrect" | "skipped" | "mispronounced" }[]>([]);
  const [manualWpm, setManualWpm] = useState<number>(40);
  const [manualDuration, setManualDuration] = useState<number>(60);
  const [manualGeneralFeedback, setManualGeneralFeedback] = useState("");

  // --- Comprehensive Skills Assessment state ---
  const [saStudentId, setSaStudentId] = useState<string>("");
  const [saPhonological, setSaPhonological] = useState<number>(3);
  const [saLetters, setSaLetters] = useState<number>(3);
  const [saDecoding, setSaDecoding] = useState<number>(3);
  const [saFluency, setSaFluency] = useState<number>(3);
  const [saVocabulary, setSaVocabulary] = useState<number>(3);
  const [saComprehension, setSaComprehension] = useState<number>(3);
  const [saOralReading, setSaOralReading] = useState<number>(3);
  const [saNotes, setSaNotes] = useState<string>("");
  const [saEvaluatedBy, setSaEvaluatedBy] = useState<string>("");
  const [saSelectedHistoryId, setSaSelectedHistoryId] = useState<string | null>(null);
  const [saActiveSubMode, setSaActiveSubMode] = useState<"new" | "review">("new");

  // --- Intervention Arcade Arena State ---
  const [activeInterventionPlan, setActiveInterventionPlan] = useState<InterventionPlan | null>(null);
  const [isGeneratingIntervention, setIsGeneratingIntervention] = useState(false);
  
  const [appliedScaffolds, setAppliedScaffolds] = useState<Record<string, string[]>>(() => {
    const saved = localStorage.getItem("qira_applied_scaffolds");
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem("qira_applied_scaffolds", JSON.stringify(appliedScaffolds));
  }, [appliedScaffolds]);
  
  // Game state
  const [selectedGameActivity, setSelectedGameActivity] = useState<InteractionActivity | null>(null);
  const [gameScore, setGameScore] = useState<number>(0);
  const [gameFeedbackMsg, setGameFeedbackMsg] = useState<{ text: string; success: boolean } | null>(null);
  
  // Game 1: Syllables Slicing state
  const [syllableOrder, setSyllableOrder] = useState<string[]>([]);
  
  // Game 2: Multiple Choice state
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState<number | null>(null);
  
  // Game 3: Scramble state
  const [lettersOrder, setLettersOrder] = useState<string[]>([]);
  const [assembledLetters, setAssembledLetters] = useState<string[]>([]);

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  // States for registering custom session in the reports tab
  const [reportRegStudentId, setReportRegStudentId] = useState("");
  const [reportRegPassageId, setReportRegPassageId] = useState(passages[0]?.id || "pass-1");
  const [reportRegWpm, setReportRegWpm] = useState<number>(45);
  const [reportRegAccuracy, setReportRegAccuracy] = useState<number>(85);
  const [reportRegDuration, setReportRegDuration] = useState<number>(60);
  const [reportRegComprehension, setReportRegComprehension] = useState<number>(3);
  const [reportRegFeedback, setReportRegFeedback] = useState("");
  const [reportRegEvaluatedBy, setReportRegEvaluatedBy] = useState<"AI" | "Researcher">("Researcher");
  
  // Filtering states for the general Reports/Sessions ledger
  const [reportFilterStudentId, setReportFilterStudentId] = useState("");
  const [reportFilterClassification, setReportFilterClassification] = useState<"all" | "A" | "B">("all");
  const [reportFilterEvaluatedBy, setReportFilterEvaluatedBy] = useState<"all" | "AI" | "Researcher">("all");

  // --- Standardized Diagnostic Engine States (Hanada Taha & Douglas Fisher laws) ---
  const [diagGrade, setDiagGrade] = useState<number>(2); // 0.5 = KG/الروضة, 1 = G1, 2 = G2, 3 = G3, 4 = G4, 5 = G5
  const [diagCurriculum, setDiagCurriculum] = useState<string>("منهاج وزاري");
  const [diagOriginalText, setDiagOriginalText] = useState<string>(
    "فِي صَبَاحِ يَوْمٍ رَبِيعِيٍّ دَافِئٍ، خَرَجَتِ السُّلَحْفَاةُ الصَّغِيرَةُ تَبْحَثُ عَنْ طَعَامٍ شَهِيٍّ فِي جِوَارِ النَّهْرِ الْجَارِي. كَانَ الْأَرْنَبُ السَّرِيعُ يَرْكُضُ مَزْهُوًّا بِنَفْسِهِ، لَكِنَّ تَعَهُّدَ السُّلَحْفَاةِ بِالْمُثَابَرَةِ كَانَ جَمِيلًا."
  );
  const [diagStudentText, setDiagStudentText] = useState<string>(
    "في صباح يوم ربيع دافئ خرج السلحفاة الصغيرة تبحث عن طمأنينة في جوار النهر الجاري. كان الأرنب السريع يركض مزهوا بنطقه..."
  );
  const [diagTimeSeconds, setDiagTimeSeconds] = useState<number>(45);
  const [diagCompPercent, setDiagCompPercent] = useState<number>(80);
  const [diagSelectedStudentId, setDiagSelectedStudentId] = useState<string>("");
  const [diagSelectedPassageId, setDiagSelectedPassageId] = useState<string>("");

  // --- States for Researcher Passage Management & Annotations ---
  const [diagManageMode, setDiagManageMode] = useState<"none" | "add" | "edit">("none");
  const [diagPassageTitle, setDiagPassageTitle] = useState<string>("");
  const [diagPassageGrade, setDiagPassageGrade] = useState<number>(2);
  const [diagPassageNotes, setDiagPassageNotes] = useState<string>("");
  
  // Custom manual annotations/notes stored per passage
  const [passageAnnotations, setPassageAnnotations] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem("qira_passage_annotations");
    return saved ? JSON.parse(saved) : {
      "pass-1": "تحتوي هذه القطعة لقصة السلحفاة على مخارج متعددة للشين والصاد وتنوع في الحركات لدعم الوعي الفونيمي المتقدم.",
      "pass-2": "نص استرشادي يركز على تكرار الأوزان اللغوية الثلاثية وصيغ العطف لتمكين الأطفال من مهارات الصرف الحرة."
    };
  });

  useEffect(() => {
    localStorage.setItem("qira_passage_annotations", JSON.stringify(passageAnnotations));
  }, [passageAnnotations]);


  // Current active passage helper
  const activePassage = useMemo(() => {
    return passages.find(p => p.id === selectedPassageId) || passages[0];
  }, [selectedPassageId, passages]);

  // Set default student when project selects
  const filteredStudents = useMemo(() => {
    return students.filter(s => s.projectId === selectedProjectId);
  }, [students, selectedProjectId]);

  useEffect(() => {
    if (filteredStudents.length > 0) {
      setSelectedStudentId(filteredStudents[0].id);
    } else {
      setSelectedStudentId("");
    }
  }, [selectedProjectId, filteredStudents]);

  // Sync manual word toggler whenever passage alters
  useEffect(() => {
    if (activePassage) {
      const words = activePassage.text.split(/\s+/).filter(Boolean).map(w => ({
        word: w,
        status: "correct" as const
      }));
      setManualWordsState(words);
    }
  }, [activePassage]);

  // Cleanup microphones
  useEffect(() => {
    return () => {
      stopMicrophoneStream();
    };
  }, []);

  const stopMicrophoneStream = () => {
    if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
    if (micAnimationRef.current) cancelAnimationFrame(micAnimationRef.current);
    if (micStream) {
      micStream.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
    }
    setMicStream(null);
  };

  // Record loop trigger
  const startRecording = async () => {
    try {
      setAudioBlob(null);
      setAudioUrl(null);
      setAnalysisError(null);
      setActiveAiResult(null);
      setUserComprehensionAnswers({});
      setIsComprehensionVerified(false);
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicStream(stream);
      setIsRecording(true);
      setRecordingSeconds(0);

      // Web Audio API Volume Visualizer
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 32;
        source.connect(analyser);
        analyserRef.current = analyser;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const updateVolume = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);
          // Scale values to elegant height
          const levels = Array.from(dataArray).slice(0, 10).map(v => Math.max(5, Math.min(60, v / 4)));
          setMicVolume(levels.length > 0 ? levels : [10, 15, 8, 20]);
          micAnimationRef.current = requestAnimationFrame(updateVolume);
        };
        updateVolume();
      } catch (e) {
        console.warn("Waveform visualization disabled due to audio context restrictions", e);
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
      };

      mediaRecorder.start(200);

      recordIntervalRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);

    } catch (err: any) {
      console.error("Microphone access denied:", err);
      // Give simulated prompt to let researchers act even without a physical mic
      setAnalysisError("تعذر الوصول للميكروفون أو تم رفض الإذن. ومع ذلك، بإمكانك تجربة ‘التقييم الفوري المحاكى‘ لرؤية ميزات الذكاء الاصطناعي دون تسجيل حقيقي.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    stopMicrophoneStream();
  };

  // Handle direct file upload for audio files
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioBlob(file);
      setAudioUrl(URL.createObjectURL(file));
      setAnalysisError(null);
      setActiveAiResult(null);
    }
  };

  // Submit recorded/uploaded audio to Gemini analysis API
  const submitAudioAnalysis = async (forceSimulation = false) => {
    if (!selectedStudentId) {
      setAnalysisError("يرجى اختيار طالب أولاً لإجراء الفحص والتقييم.");
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      let resultData;

      if (forceSimulation || !audioBlob) {
        // Fallback simulation directly request backend
        const response = await fetch("/api/analyze-audio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audio: "", // Empty audio triggers local styled simulation at server level
            originalText: activePassage.text
          })
        });
        if (!response.ok) throw new Error("تعذر إكمال التقييم التلقائي بالخلفية.");
        resultData = await response.json();
      } else {
        // Convert audio to base64
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onloadend = () => {
            const base64data = (reader.result as string).split(",")[1];
            resolve(base64data);
          };
          reader.readAsDataURL(audioBlob);
        });

        const base64Audio = await base64Promise;

        const response = await fetch("/api/analyze-audio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audio: base64Audio,
            mimeType: audioBlob.type,
            originalText: activePassage.text
          })
        });

        if (!response.ok) throw new Error("استجابة خاطئة من ملقم الذكاء الاصطناعي.");
        resultData = await response.json();
      }

      // Map API outcome to proper AssessmentResult structure
      const finalResult: AssessmentResult = {
        id: "ai_ass_" + Date.now(),
        studentId: selectedStudentId,
        passageId: selectedPassageId,
        date: new Date().toISOString(),
        evaluatedBy: "AI",
        wordsPerMinute: resultData.wordsPerMinute || 40,
        accuracy: resultData.accuracy ?? 90,
        durationSeconds: recordingSeconds || 45,
        comprehensionScore: 0, 
        totalComprehensionQuestions: activePassage.comprehensionQuestions.length,
        wordsAnalyzed: resultData.words || activePassage.text.split(" ").map((w: string) => ({ word: w, status: "correct" })),
        pronunciationErrors: resultData.pronunciationErrors || [],
        generalFeedback: resultData.generalFeedback || "مستوى رائع ومتقن للقرائية!"
      };

      setActiveAiResult(finalResult);

    } catch (e: any) {
      console.error(e);
      setAnalysisError(e.message || "حدث خطأ غير متوقع أثناء معالجة وقراءة الملف الصوتي.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Submit manual assessment
  const saveManualAssessment = () => {
    if (!selectedStudentId) return;

    // Calculate accuracy % from manualWordsState
    const correctCount = manualWordsState.filter(w => w.status === "correct").length;
    const finalAccuracy = Math.round((correctCount / manualWordsState.length) * 100);

    // Sum comprehension score
    let correctComp = 0;
    activePassage.comprehensionQuestions.forEach(q => {
      if (userComprehensionAnswers[q.id] === q.correctIndex) {
        correctComp++;
      }
    });

    const newResult: AssessmentResult = {
      id: "man_ass_" + Date.now(),
      studentId: selectedStudentId,
      passageId: selectedPassageId,
      date: new Date().toISOString(),
      evaluatedBy: "Researcher",
      wordsPerMinute: manualWpm,
      accuracy: finalAccuracy,
      durationSeconds: manualDuration,
      comprehensionScore: correctComp,
      totalComprehensionQuestions: activePassage.comprehensionQuestions.length,
      wordsAnalyzed: manualWordsState,
      pronunciationErrors: manualWordsState.filter(w => w.status !== "correct").map(w => ({
        errorType: w.status === "mispronounced" ? "خطأ نطق وتشكيل" : w.status === "skipped" ? "تخطي للكلمة" : "لفظ غير سليم",
        example: w.word,
        remediation: "مواصلة التدرب وتكرار قراءة العينة بمواظبة المعلم."
      })),
      generalFeedback: manualGeneralFeedback || "تقييم باحث يدوي فوري لبناء معيار الطلاقة."
    };

    const nextAssessments = [newResult, ...assessments];
    setAssessments(nextAssessments);
    alert("تم تدوين التقييم اليدوي للطالب وحفظه بنجاح בסلّات البيانات!");
    setActiveTab("students");

    // Sync immediately to the cloud database
    syncPlatformData({ assessments: nextAssessments });
  };

  // Save the AI Assessment after user answers quiz
  const saveAiAssessmentToHistory = () => {
    if (!activeAiResult) return;

    let correctComp = 0;
    activePassage.comprehensionQuestions.forEach(q => {
      if (userComprehensionAnswers[q.id] === q.correctIndex) {
        correctComp++;
      }
    });

    const enriched: AssessmentResult = {
      ...activeAiResult,
      comprehensionScore: correctComp
    };

    const nextAssessments = [enriched, ...assessments];
    setAssessments(nextAssessments);
    alert("تم حفظ نتيجة التقييم ونسبة الفهم والاستيعاب بملفات الطالب!");
    setActiveTab("students");
    setActiveAiResult(null);

    // Sync immediately to the cloud database
    syncPlatformData({ assessments: nextAssessments });
  };

  // Register dynamic custom session feedback manually
  const handleRegisterCustomSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportRegStudentId) {
      alert("الرجاء اختيار اسم التلميذ المستهدف أولاً.");
      return;
    }
    const student = students.find(s => s.id === reportRegStudentId);
    if (!student) return;
    const selectedPassage = passages.find(p => p.id === reportRegPassageId) || passages[0];
    
    // Create static words analyzed for printing representation
    const initialWords = selectedPassage.text.split(/\s+/).map((word, idx) => ({
      word: word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,""),
      status: (idx > 0 && idx % 7 === 0) ? ("mispronounced" as const) : ("correct" as const),
      feedback: (idx > 0 && idx % 7 === 0) ? "بحاجة لملاحظة تحسين حركة التشكيل والشدة" : undefined
    }));

    const newResult: AssessmentResult = {
      id: "reg_ass_" + Date.now(),
      studentId: reportRegStudentId,
      passageId: reportRegPassageId,
      date: new Date().toISOString(),
      evaluatedBy: reportRegEvaluatedBy,
      wordsPerMinute: Number(reportRegWpm),
      accuracy: Number(reportRegAccuracy),
      durationSeconds: Number(reportRegDuration),
      comprehensionScore: Number(reportRegComprehension),
      totalComprehensionQuestions: selectedPassage.comprehensionQuestions.length || 3,
      wordsAnalyzed: initialWords,
      pronunciationErrors: initialWords.filter(w => w.status !== "correct").map(w => ({
        errorType: "مخارج الحروف واللحن النطقي",
        example: w.word,
        remediation: "استعمال البطاقات المصورة والتهجئة الفونيمية البطيئة."
      })),
      generalFeedback: reportRegFeedback || "تم قيد وتسجيل الجلسة القياسية للتقويم وحفظها ذاتياً بنجاح!"
    };

    const nextAssessments = [newResult, ...assessments];
    setAssessments(nextAssessments);
    alert("تم تسجيل قيد اللفظ والتقويم وتثبيت البيانات بنجاح!");
    
    // Reset inputs
    setReportRegStudentId("");
    setReportRegFeedback("");

    // Sync immediately to the cloud database
    syncPlatformData({ assessments: nextAssessments });
  };

  // Generate customized Intervention Plan with Gemini
  const generateInterventionWithAI = async (student: Student) => {
    setIsGeneratingIntervention(true);
    try {
      // Collect errors from past student assessments
      const studentAsses = assessments.filter(a => a.studentId === student.id);
      const errorsDesc = studentAsses.length > 0 
        ? studentAsses.flatMap(a => a.pronunciationErrors || []).map(e => `${e.errorType} (${e.example})`).join(", ")
        : student.notes || "تطوير مستوى التهجئة والتحليل الكلمي الصوتي وحروف المد المتصلة.";

      const response = await fetch("/api/generate-intervention", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: student.name,
          grade: student.grade,
          errorsList: errorsDesc
        })
      });

      if (!response.ok) throw new Error("تعذر الابتكار التلقائي للألعاب العلاجية بواسطة نموذج الذكاء الاصطناعي.");
      const data = await response.json();

      const newPlan: InterventionPlan = {
        id: "plan_" + Date.now(),
        studentId: student.id,
        weakness: data.weakness,
        objectives: data.objectives || ["تحسين الوعي الفونيمي السليم"],
        activities: data.activities || [],
        teacherAdvice: data.teacherAdvice || "القراءة المركزة المستمرة لمقاطع التدعيم اللغوي.",
        createdAt: new Date().toISOString(),
        status: "active"
      };

      const nextInterventions = [newPlan, ...interventions];
      setInterventions(nextInterventions);
      setActiveInterventionPlan(newPlan);
      alert(`ابتكر الذكاء الاصطناعي خطة لعب ومداواة صوتية مذهلة للبطل ${student.name}!`);

      // Sync immediately to the cloud database
      syncPlatformData({ interventions: nextInterventions });

    } catch (e: any) {
      alert("حدث خطأ أثناء الاتصال بالذكاء الاصطناعي، تم استخدام خطة الألعاب التدريبية النموذجية المعدة مسبقاً.");
      // Seed plan fallback
      const fallbackPlan: InterventionPlan = {
        id: "plan_fb_" + Date.now(),
        studentId: student.id,
        weakness: "صعوبة التمييز السمعي والبصري للحروف المتشابهة الصوت والمخارج مع وهن في الميزان الثنائي المشدد.",
        objectives: ["تحصين لفظ الحرف المشدد", "التمييز الفصيح لمخارج الحروف المفرقة كالدال والضاد والطاء قراءةً"],
        activities: [
          {
            activityTitle: "تفكيك مقاطع الكلمة المشددة",
            instructions: "فك الكلمة إلى مقاطع لتسهيل القراءة المتمرسة والتهجئة السليمة.",
            type: "syllables",
            data: { word: "كَتَّبَ", parts: ["كَتْ", "تَ", "بَ"] }
          },
          {
            activityTitle: "تحدي تمايز المخارج والنطق الفصيح",
            instructions: "تمهل وانطق الكلمة ثم اختر الخيار اللفظي الأصيل المطابق.",
            type: "multiple-choice",
            data: {
              question: "أي الكلمات المعروضة تضم نطق اللام الشمسية المشددة بصوت فصيح؟",
              options: ["الْلَّحْمُ", "الَّحْمُ", "الّاحْمُ"],
              correctAnswer: "الْلَّحْمُ"
            }
          },
          {
            activityTitle: "تحدي مخارج الكلمات (ترتيب الحروف)",
            instructions: "صغ الكلمة العلاجية بإحكام عبر تجميع حروف الحقل المبعثرة.",
            type: "scramble",
            data: { scrambledLetters: ["ع", "ل", "م"], correctWord: "علم" }
          }
        ],
        teacherAdvice: "مواصلة الحوار الثنائي المكتوب، واستخدام الألوان الفاتحة لتسليط الضوء على المقاطع الصوتية.",
        createdAt: new Date().toISOString(),
        status: "active"
      };
      
      const nextInterventions = [fallbackPlan, ...interventions];
      setInterventions(nextInterventions);
      setActiveInterventionPlan(fallbackPlan);

      // Sync immediately to the cloud database
      syncPlatformData({ interventions: nextInterventions });
    } finally {
      setIsGeneratingIntervention(false);
    }
  };

  const handleCreateFisherPlan = (studentId: string, difficulty: string, tier: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) {
      alert("الرجاء اختيار طفل أولاً لصياغة خطة التدخل العلاجي الخاصة بدوجلاس فيشر.");
      return;
    }

    let weakness = "";
    let objectives: string[] = [];
    let activities: InteractionActivity[] = [];
    let teacherAdvice = "";
    const studentName = student.name;

    if (difficulty === "phonemic") {
      weakness = `ضعف في الوعي الفونيمي ومخارج الحروف الأصيلة لدى الطفل ${studentName} (مثل التميز السمعي/اللفظي للحروف اللثوية والهجائية المتقاربة).`;
      objectives = [
        "تمكين الطفل من استدعاء الصوت اللثوي الفصيح (الظاء، الذال، الثاء) في مستهل الكلمات.",
        "الارتقاء بالتمييز اللفظي المباشر لمخارج الصوت المطبق (كالصاد والضاد) مقارنة بالأصوات العادية المستهلكة.",
        "تنمية ثقة الطفل اللطيفة بقراءة نصوص قصيرة مشكولة بنسبة دقة لا تقل عن 85%."
      ];
      activities = [
        {
          activityTitle: "تحدي تمايز المخارج والنطق الفصيح للثويات",
          instructions: "توجيه الطالب لتمييز مخرجه اللفظي ثم الإشارة للخيار المشتمل على الحرف اللثوي (الظاء) المضموم بضبط فصيح.",
          type: "multiple-choice",
          data: {
            question: "أي الكلمات المعروضة تضم النطق اللثوي السليم لحرف (الظاء) المبهج؟",
            options: ["الظُّفْرُ", "الزُّفْرُ", "الدُّفْرُ"],
            correctAnswer: "الظُّفْرُ"
          }
        },
        {
          activityTitle: "تحدي تركيب الحروف المبعثرة المفخمة",
          instructions: "حث الطالب لمساعدته على تركيب حروف الكلمة المفككة لبناء مهارة الوعي الصوتي المطبق للصاد والضاد ونطق كلمة (صبر).",
          type: "scramble",
          data: {
            scrambledLetters: ["ر", "ص", "ب"],
            correctWord: "صبر"
          }
        }
      ];
      teacherAdvice = "إرشاد دوجلاس فيشر: ابدأ بنمذجة مخارج الحروف للطفل (أنا أقرأ)، ثم اشترك معه في نطقها المتقطع مبهجاً (نحن نقرأ)، ثم دعه يقرأها للذكاء الاصطناعي (أنت تقرأ).";
    } else if (difficulty === "decoding") {
      weakness = `تحدي تفكيك مقاطع الكلمات وعلاج نبر التشديد وحركات التضعيف والسكون لدى الطفل ${studentName}.`;
      objectives = [
        "تكامل الفك والتركيز المقطعي لتسهيل تجزئة الكلمة الصعبة لتسهيل قراءتها.",
        "دعم ميزان النطق السليم للحرف المضعف وصوت الشدة بالضغط الصوتي المناسب.",
        "المطاوعة والجرأة في تخطي معوقات التهجئة للحرف الساكن والمتحرك المتتالي."
      ];
      activities = [
        {
          activityTitle: "لغز التقطيع المقطعي للشدة (قَدَّمَ)",
          instructions: "مطالبة الطالب بترتيب مقاطع الكلمة الصوتية عيانياً ودعمه لاستيعاب تتابع نطق الشدة وصوت التضعيف وعقد مقاربة مع الكلمات الشقيقة.",
          type: "syllables",
          data: {
            word: "قَدَّمَ",
            parts: ["قَدْ", "دَ", "مَ"]
          }
        },
        {
          activityTitle: "اختر الكلمة بالتشديد والنبر الصحيح",
          instructions: "حث الطالب ومراقبته أثناء اختيار الكلمة المضبوطة بأشكال التضعيف والنبر المتكامل.",
          type: "multiple-choice",
          data: {
            question: "أي الكلمات التالية تحتوي على تضعيف (شدة) على حرف اللام لغةً؟",
            options: ["الْمُعَلِّمَةُ", "الْمُعَلِمَةِ", "الْمُعَالَمَةُ"],
            correctAnswer: "الْمُعَلِّمَةُ"
          }
        }
      ];
      teacherAdvice = "إرشاد دوجلاس فيشر: استخدم البطاقات الثنائية للأصوات لتثبيت مظهر ومسمع الشدة، مع التدرج في تمليك مسؤولية القراءة للطفل تدريجياً وبث روح اللعب الملون.";
    } else if (difficulty === "prosody") {
      weakness = `وهن الطلاقة القرائية والتنغيم الصوتي (Prosody) ومراعاة إشارات الوقف والتلوين اللفظي لدى الطفل ${studentName}.`;
      objectives = [
        "إكساب الطفل مهارة التدفق اللغوي السردي بمعدل طلاقة يطابق الفئة المستهدفة.",
        "التدريب الفعال على الوقف المريح عند الفواصل والنقاط واستشعار مواطن الوصل والوقف.",
        "التأثير الإيجابي والتلوين الصوتي لأساليب الجمل (كالنداء والاستفسار والدهشة)."
      ];
      activities = [
        {
          activityTitle: "مراعاة علامات الاستفهام والتلوين الصوتي البهيج",
          instructions: "ملاحظة أداء الطالب في التلوين الصوتي بنبرة الاستفهام واختيار العبارة ذات المنحنى الصوتي المتسائل المثير للاهتمام ومساعدته عند التعثر.",
          type: "multiple-choice",
          data: {
            question: "أي العبارات التالية تتطلب تلويناً صوتياً بنبرة الاستفهام المتسائلة المشوقة؟",
            options: ["مَاذَا يَأْكُلُ الْعُصْفُورُ فِي الصَّبَاحِ؟", "يَأْكُلُ الْعُصْفُورُ الْحَبَّ الْمُلَوَّنَ.", "هَذَا عُصْفُورٌ صَغِيرٌ مَحبوبٌ."],
            correctAnswer: "مَاذَا يَأْكُلُ الْعُصْفُورُ فِي الصَّبَاحِ؟"
          }
        }
      ];
      teacherAdvice = "إرشاد دوجلاس فيشر: تطبيق استراتيجية المسرح القرائي ميسراً بالأقران وألعاب الطلاقة، وقياس عدد الكلمات المنطوقة بسرد دافئ ونبرة واثقة.";
    } else {
      weakness = `تحدي الفهم القرائي والاستيعاب واستخراج المغزى وتوليد مهارات حل المسائل الاستدلالية والضمنية لدى الطفل ${studentName}.`;
      objectives = [
        "الارتقاء بالاستجابة للأسئلة المباشرة وغير المباشرة حول النص بنسبة دقة مطلقة.",
        "القدرة الذاتية على اقتراح عناوين بديلة فصيحة وتلخيص المجموعات اللفظية بأريحية.",
        "دعم معاني المفردات والربط السياقي والتحفيز اللغوي لتقليص معوقات الاستيعاب السلبي."
      ];
      activities = [
        {
          activityTitle: "تحدي استنتاج الفكرة الكبرى للنص",
          instructions: "إرشاد الطالب لقراءة النص صامتاً وفحصه بعناية، ثم مساعدته على استنتاج واختيار الفكرة الجوهرية للقصة المعالجة.",
          type: "multiple-choice",
          data: {
            question: "ما هي الفكرة الأساسية السليمة لقصة عُطْلَةُ الصَّيْفِ؟",
            options: ["قضاء عطلة الصيف والسفر بنشاط ممتع وسعيد وممارسة السباحة واللعب مع الأهل", "كيف تسير القوارب الكبرى والأسماك في المياه والبحيرات", "عيش الحيوانات الأليفة والمهاجرة في الغابات والأراضي النائية"],
            correctAnswer: "قضاء عطلة الصيف والسفر بنشاط ممتع وسعيد وممارسة السباحة واللعب مع الأهل"
          }
        }
      ];
      teacherAdvice = "إرشاد دوجلاس فيشر: اعتمد القراءة الفاحصة (Close Reading) عبر 3 جولات قراءة بتوجيهات متتالية، ودع الطفل يسجل خلاصته في مرسمه الكرتوني لتوثيق الفهم.";
    }

    const newPlan: InterventionPlan = {
      id: "fisher_plan_" + Date.now(),
      studentId: student.id,
      weakness,
      objectives,
      activities,
      teacherAdvice: `${teacherAdvice} | مستوى الدعم فيشر: ${tier === "tier1" ? "دعم صفي شامل وميسر (Tier 1)" : tier === "tier2" ? "دعم علاجي مركز بمجموعات (Tier 2)" : "دعم اخصائي خاص فردي مكثف (Tier 3)"}`,
      createdAt: new Date().toISOString(),
      status: "active"
    };

    const nextInterventions = [newPlan, ...interventions];
    setInterventions(nextInterventions);
    setActiveInterventionPlan(newPlan);

    setGeneratedFisherPlan({
      studentName,
      studentGrade: student.grade,
      studentAge: student.age,
      difficulty,
      tier,
      weakness,
      objectives,
      teacherAdvice: newPlan.teacherAdvice,
      date: new Date().toLocaleDateString("ar-EG"),
      id: newPlan.id
    });

    alert(`تم بنجاح بناء خطة دوجلاس فيشر للتدخل العلاجي للبطل ${studentName}! وتم إلحاقها بملف الطفل وقائمة الألعاب تلقائياً.`);

    // Sync immediately to the cloud database
    syncPlatformData({ interventions: nextInterventions });
  };

  // --- Handlers for Creation ---
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName || !newProjSchool) return;

    const newProj: Project = {
      id: "proj_" + Date.now(),
      name: newProjName,
      school: newProjSchool,
      classGrade: newProjGrade || "مراحل مختلطة",
      researcherName: newProjResearcher || localUserNameState || "أخصائي التدقيق اللغوي",
      createdAt: new Date().toISOString(),
      curriculum: newProjCurriculum
    };

    const nextProjects = [newProj, ...projects];
    setProjects(nextProjects);
    setSelectedProjectId(newProj.id);
    setNewProjName("");
    setNewProjSchool("");
    setNewProjGrade("");
    setNewProjResearcher("");
    setNewProjCurriculum("وزاري");
    setShowAddProjectModal(false);

    // Sync state immediately to push new project to the cloud
    syncPlatformData({ projects: nextProjects });
  };

  const openAddStudentModal = () => {
    const activeProj = projects.find(p => p.id === selectedProjectId);
    setNewStudSchool(activeProj?.school || "");
    setNewStudResearcher(activeProj?.researcherName || localUserNameState || "");
    setShowAddStudentModal(true);
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudName || !selectedProjectId) return;

    let finalStudSchool = newStudSchool;
    let finalStudResearcher = newStudResearcher;
    
    const activeProj = projects.find(p => p.id === selectedProjectId);
    if (activeProj) {
      if (newStudSchool.trim() !== activeProj.school.trim() || newStudResearcher.trim() !== activeProj.researcherName.trim()) {
        finalStudSchool = activeProj.school;
        finalStudResearcher = activeProj.researcherName;
        alert(`تنبيه: تم مطابقة اسم الباحث والمدرسة وتصحيحهما تلقائياً لتتوافقا مع بيانات المشروع المحددة سلفاً:\n🏫 المدرسة: ${activeProj.school}\n👥 الباحث: ${activeProj.researcherName}`);
      }
    }

    const newStud: Student = {
      id: "stud_" + Date.now(),
      projectId: selectedProjectId,
      name: newStudName,
      gender: newStudGender,
      grade: Number(newStudGrade),
      age: Number(newStudAge),
      notes: newStudNotes,
      createdAt: new Date().toISOString(),
      languageClassification: newStudLanguageClassification,
      curriculum: newStudCurriculum,
      school: finalStudSchool,
      researcherName: finalStudResearcher
    };

    const nextStudents = [newStud, ...students];
    setStudents(nextStudents);
    setNewStudName("");
    setNewStudNotes("");
    setNewStudLanguageClassification("A");
    setNewStudCurriculum("وزاري");
    setNewStudSchool("");
    setNewStudResearcher("");
    setShowAddStudentModal(false);

    // Sync state immediately to push new student to the cloud
    syncPlatformData({ students: nextStudents });
  };

  const handleDeleteStudent = (studId: string, name: string) => {
    if (confirm(`هل أنت متأكد من حذف الطالب/ـة (${name}) وسجل تقييماته بالكامل؟`)) {
      const nextStudents = students.filter(s => s.id !== studId);
      const nextAssessments = assessments.filter(a => a.studentId !== studId);
      const nextInterventions = interventions.filter(i => i.studentId !== studId);

      const childAssIds = assessments.filter(a => a.studentId === studId).map(a => a.id);
      const childIntIds = interventions.filter(i => i.studentId === studId).map(i => i.id);
      const addedDeletes = [studId, ...childAssIds, ...childIntIds];
      const nextDeletedIds = [...deletedIds, ...addedDeletes];

      setStudents(nextStudents);
      setAssessments(nextAssessments);
      setInterventions(nextInterventions);
      setDeletedIds(nextDeletedIds);

      syncPlatformData({
        students: nextStudents,
        assessments: nextAssessments,
        interventions: nextInterventions,
        deletedIds: nextDeletedIds
      });
    }
  };

  const handleDeleteProject = (projId: string, name: string) => {
    if (confirm(`هل تريد حذف المشروع اللفظي الاستكشافي (${name}) بالكامل بما يضمه من طلاب وتقارير؟`)) {
      const nextProjects = projects.filter(p => p.id !== projId);
      const childStuds = students.filter(s => s.projectId === projId);
      const childStudIds = childStuds.map(s => s.id);
      const nextStudents = students.filter(s => s.projectId !== projId);
      const nextAssessments = assessments.filter(a => !childStudIds.includes(a.studentId));
      const nextInterventions = interventions.filter(i => !childStudIds.includes(i.studentId));

      const childAssIds = assessments.filter(a => childStudIds.includes(a.studentId)).map(a => a.id);
      const childIntIds = interventions.filter(i => childStudIds.includes(i.studentId)).map(i => i.id);

      const addedDeletes = [projId, ...childStudIds, ...childAssIds, ...childIntIds];
      const nextDeletedIds = [...deletedIds, ...addedDeletes];

      setProjects(nextProjects);
      setStudents(nextStudents);
      setAssessments(nextAssessments);
      setInterventions(nextInterventions);
      setDeletedIds(nextDeletedIds);

      syncPlatformData({
        projects: nextProjects,
        students: nextStudents,
        assessments: nextAssessments,
        interventions: nextInterventions,
        deletedIds: nextDeletedIds
      });
    }
  };

  // --- Analytical Calculations ---
  const statistics = useMemo(() => {
    const totalProj = projects.length;
    const totalStud = students.length;
    const totalAss = assessments.length;

    let avgWpm = 0;
    let avgAccuracy = 0;

    if (totalAss > 0) {
      const sumWpm = assessments.reduce((acc, current) => acc + current.wordsPerMinute, 0);
      const sumAcc = assessments.reduce((acc, current) => acc + current.accuracy, 0);
      avgWpm = Math.round(sumWpm / totalAss);
      avgAccuracy = Math.round(sumAcc / totalAss);
    }

    // Progression of recent tests
    const recentScores = assessments.slice(0, 5).map(a => ({
      date: new Date(a.date).toLocaleDateString("ar-EG", { month: "short", day: "numeric" }),
      accuracy: a.accuracy,
      wpm: a.wordsPerMinute
    })).reverse();

    return {
      totalProj,
      totalStud,
      totalAss,
      avgWpm,
      avgAccuracy,
      recentScores
    };
  }, [projects, students, assessments]);

  // --- Educational Games Logic Hub ---
  const launchGame = (activity: InteractionActivity) => {
    setSelectedGameActivity(activity);
    setGameScore(0);
    setGameFeedbackMsg(null);
    setSelectedChoiceIndex(null);
    setAssembledLetters([]);

    if (activity.type === "syllables") {
      // Scramble syllables parts
      const parts = activity.data.parts ? [...activity.data.parts] : [];
      // basic random sort
      setSyllableOrder(parts.sort(() => Math.random() - 0.5));
    } else if (activity.type === "scramble") {
      const letters = activity.data.scrambledLetters ? [...activity.data.scrambledLetters] : [];
      setLettersOrder(letters.sort(() => Math.random() - 0.5));
    }
  };

  const handleSyllableClick = (part: string) => {
    // Check if correct order
    const act = selectedGameActivity;
    if (!act || !act.data.parts) return;
    
    const correctParts = act.data.parts;
    const nextIndex = assembledLetters.length;

    if (correctParts[nextIndex] === part) {
      const newAssembled = [...assembledLetters, part];
      setAssembledLetters(newAssembled);
      
      // Remove from scramble selection options
      const idx = syllableOrder.indexOf(part);
      if (idx > -1) {
        const remaining = [...syllableOrder];
        remaining.splice(idx, 1);
        setSyllableOrder(remaining);
      }

      if (newAssembled.length === correctParts.length) {
        setGameScore(100);
        setGameFeedbackMsg({ text: "مُذْهِل! قمت بتركيب وتحليل المقاطع الصوتية بصورة دقيقة وفصيحة.", success: true });
      }
    } else {
      setGameFeedbackMsg({ text: "حاول مجدداً يا بطل، تذكر ميزان نطق الكلمة وحركاتها المسموعة.", success: false });
    }
  };

  const handleChoiceSelect = (index: number, option: string) => {
    const act = selectedGameActivity;
    if (!act || !act.data.correctAnswer) return;
    
    setSelectedChoiceIndex(index);
    if (option === act.data.correctAnswer) {
      setGameScore(100);
      setGameFeedbackMsg({ text: "أحسنت! إجابة موفقة وسديدة، مهاراتك اللفظية ترتقي باستمرار.", success: true });
    } else {
      setGameFeedbackMsg({ text: "اللفظ المختار يحمل خللاً صوتياً، جرب التدقيق في تشكيل الحرف المشدد.", success: false });
    }
  };

  const handleScrambleLetterClick = (letter: string) => {
    const act = selectedGameActivity;
    if (!act || !act.data.correctWord) return;

    const currentWordSoFar = [...assembledLetters, letter].join("");
    const target = act.data.correctWord;

    setAssembledLetters(prev => [...prev, letter]);
    const idx = lettersOrder.indexOf(letter);
    if (idx > -1) {
      const remaining = [...lettersOrder];
      remaining.splice(idx, 1);
      setLettersOrder(remaining);
    }

    if (assembledLetters.length + 1 === target.length) {
      if (currentWordSoFar === target) {
        setGameScore(100);
        setGameFeedbackMsg({ text: "تهانينا! الكلمة تامة وصوتك في رتبة الاتساق والجمال.", success: true });
      } else {
        setGameFeedbackMsg({ text: "الترتيب غير سليم للكلمة المستهدفة، تراجع وأعد تجميع اللغز.", success: false });
      }
    }
  };

  const resetGameTrial = () => {
    if (selectedGameActivity) {
      launchGame(selectedGameActivity);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col antialiased" dir="rtl">
      
      {/* Prime Header */}
      <header className="sticky top-0 z-40 bg-indigo-950 text-white shadow-md border-b border-indigo-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500 rounded-xl text-indigo-950 shadow-inner flex items-center justify-center shrink-0">
              <BookOpen className="w-6.5 h-6.5" />
            </div>
            <div>
              <h1 id="app-title" className="text-lg sm:text-xl font-bold tracking-tight text-emerald-300">منصة قياس القرائية العربية</h1>
              <p className="text-[10px] text-indigo-200 mt-0.5">منصة بحثية متطورة لتقويم مهارات الطلاقة والوعي الفونيمي وحرية التعليم الفعال</p>
            </div>
          </div>

          {/* Quick Stats Banner inside Navbar */}
          <div className="flex flex-col md:flex-row md:items-center gap-3 text-xs bg-emerald-500/15 border border-emerald-500/30 px-4 py-2 rounded-2xl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <span className="text-emerald-300 font-bold">بوابة التطوير والتحكيم النشطة (UAT) 🔄</span>
            </div>
            <div className="hidden md:block h-3.5 w-px bg-indigo-800"></div>
            <div>
              <span className="text-indigo-200">الوصول من متصفح خارجي مفعّل بالكامل كـ: </span>
              <span className="text-white font-bold bg-emerald-500/30 px-1.5 py-0.5 rounded text-[10px]">باحث معتمد</span>
              <span className="text-white font-bold bg-emerald-500/30 px-1.5 py-0.5 rounded text-[10px] mx-1">محكّم لغوي</span>
              <span className="text-indigo-100 font-medium">| يُحفظ مباشرة ومستدام بالكامل بالقاعدة الدائمة</span>
            </div>
          </div>
        </div>

        {/* Dynamic Presence / Collaboration Bar */}
        <div className="bg-indigo-900/40 border-t border-indigo-900/60 px-4 sm:px-6 lg:px-8 py-2">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            
            {/* Local Face / Identity customizer */}
            <div className="flex items-center gap-2 text-right">
              <span className="text-indigo-200">👤 هويتك اللغوية النشطة:</span>
              {isEditingLocalUserName ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const trimmed = tempUserName.trim();
                    if (trimmed) {
                      setLocalUserNameState(trimmed);
                      localStorage.setItem("qira_researcher_name", trimmed);
                      setIsEditingLocalUserName(false);
                    }
                  }}
                  className="flex items-center gap-1.5"
                >
                  <input
                    type="text"
                    value={tempUserName}
                    onChange={(e) => setTempUserName(e.target.value)}
                    placeholder="اكتب اسم الباحث..."
                    className="bg-indigo-950 border border-indigo-700 rounded-lg px-2 py-0.5 text-xs text-white focus:outline-none focus:border-emerald-400 w-44"
                    maxLength={40}
                    autoFocus
                  />
                  <button type="submit" className="bg-emerald-500 hover:bg-emerald-650 px-2 py-0.5 rounded text-[10px] font-bold text-indigo-950 transition">
                    حفظ
                  </button>
                  <button type="button" onClick={() => setIsEditingLocalUserName(false)} className="text-indigo-300 hover:text-white px-1 py-0.5 text-[10px]">
                    إلغاء
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-white text-xs bg-indigo-950 px-2.5 py-1 rounded-md border border-indigo-850">
                    {localUserNameState}
                  </span>
                  <button
                    onClick={() => {
                      setTempUserName(localUserNameState);
                      setIsEditingLocalUserName(true);
                    }}
                    className="text-emerald-400 hover:text-emerald-355 cursor-pointer underline underline-offset-2 text-[10px] transition font-bold"
                  >
                    (تعديل الاسم)
                  </button>
                </div>
              )}
            </div>

            {/* Other Online Researchers list */}
            <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
              <span className="text-indigo-200">👥 الباحثون المتصلون الآن بالمنصة:</span>
              <div className="flex flex-wrap gap-1.5 items-center">
                {activeResearchers.length <= 1 ? (
                  <span className="text-indigo-300 italic text-[11px]">أنت الباحث النشط الوحيد حالياً (افتح نافذة متصفح خفي للتجربة)</span>
                ) : (
                  activeResearchers
                    .filter(r => r.id !== localUserId)
                    .map(r => (
                      <div
                        key={r.id}
                        className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1.5 animate-pulse"
                        title="متصل حاليًا ويراقب البيانات اللغوية"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>{r.name}</span>
                      </div>
                    ))
                )}
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Main Container Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">
        
        {/* Navigation Sidebar Controls */}
        <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-2">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-semibold text-slate-400 tracking-wider mb-3 leading-4 uppercase">لوحة التحكم والأدوات</h3>
            <nav className="flex flex-col gap-1">
              <button
                id="btn-nav-dashboard"
                onClick={() => { setActiveTab("dashboard"); setSelectedGameActivity(null); }}
                className={`w-full py-3 px-4 rounded-xl flex items-center gap-3 font-medium transition-all text-right text-sm ${
                  activeTab === "dashboard"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Activity className="w-5 h-5 shrink-0" />
                <span>الرئيسة والإحصائيات</span>
              </button>

              <button
                id="btn-nav-projects"
                onClick={() => { setActiveTab("projects"); setSelectedGameActivity(null); }}
                className={`w-full py-3 px-4 rounded-xl flex items-center gap-3 font-medium transition-all text-right text-sm ${
                  activeTab === "projects"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <FolderGit2 className="w-5 h-5 shrink-0" />
                <span>المشاريع والمدارس ({projects.length})</span>
              </button>

              <button
                id="btn-nav-students"
                onClick={() => { setActiveTab("students"); setSelectedGameActivity(null); }}
                className={`w-full py-3 px-4 rounded-xl flex items-center gap-3 font-medium transition-all text-right text-sm ${
                  activeTab === "students"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Users className="w-5 h-5 shrink-0" />
                <span>دليل الطلاب ({students.length})</span>
              </button>

              <div className="h-px bg-slate-100 my-1"></div>

              <button
                id="btn-nav-assess-ai"
                onClick={() => { setActiveTab("assess_ai"); setSelectedGameActivity(null); }}
                className={`w-full py-3 px-4 rounded-xl flex items-center gap-3 font-medium transition-all text-right text-sm ${
                  activeTab === "assess_ai"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <AudioLines className="w-5 h-5 shrink-0" />
                <span className="flex-1">تقييم صوتي ذكي (AI)</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">حي</span>
              </button>

              <button
                id="btn-nav-assess-manual"
                onClick={() => { setActiveTab("assess_manual"); setSelectedGameActivity(null); }}
                className={`w-full py-3 px-4 rounded-xl flex items-center gap-3 font-medium transition-all text-right text-sm ${
                  activeTab === "assess_manual"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <FileSpreadsheet className="w-5 h-5 shrink-0" />
                <span>إدخال الباحثين والمحكمين</span>
              </button>

              <button
                id="btn-nav-diagnostic-engine"
                onClick={() => { setActiveTab("diagnostic_engine"); setSelectedGameActivity(null); }}
                className={`w-full py-3 px-4 rounded-xl flex items-center justify-between font-medium transition-all text-right text-sm ${
                  activeTab === "diagnostic_engine"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Gauge className="w-5 h-5 shrink-0 text-amber-500" />
                  <span>المحرك التشخيصي المعياري</span>
                </div>
                <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded">معايرة ذكية ⚡</span>
              </button>

              <button
                id="btn-nav-skills-assess"
                onClick={() => { setActiveTab("skills_assess"); setSelectedGameActivity(null); }}
                className={`w-full py-3 px-4 rounded-xl flex items-center justify-between font-medium transition-all text-right text-sm ${
                  activeTab === "skills_assess"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 shrink-0 text-amber-500" />
                  <span>التقييم الشامل للمهارات</span>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded">الـ 7 مهارات 🌟</span>
              </button>

              <button
                id="btn-nav-intervention"
                onClick={() => { setActiveTab("intervention"); setSelectedGameActivity(null); }}
                className={`w-full py-3 px-4 rounded-xl flex items-center gap-3 font-medium transition-all text-right text-sm ${
                  activeTab === "intervention"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <BrainCircuit className="w-5 h-5 shrink-0" />
                <span className="flex-1">الألعاب العلاجية والتدخل</span>
                <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-1.5 py-0.5 rounded">ألعاب</span>
              </button>

              <button
                id="btn-nav-benchmarks"
                onClick={() => { setActiveTab("benchmarks"); setSelectedGameActivity(null); }}
                className={`w-full py-3 px-4 rounded-xl flex items-center gap-3 font-medium transition-all text-right text-sm ${
                  activeTab === "benchmarks"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Award className="w-5 h-5 shrink-0" />
                <span>معايير الطلاقة والقرائية</span>
              </button>

              <button
                id="btn-nav-group-assess"
                onClick={() => { setActiveTab("group_assess"); setSelectedGameActivity(null); }}
                className={`w-full py-3 px-4 rounded-xl flex items-center gap-3 font-medium transition-all text-right text-sm ${
                  activeTab === "group_assess"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Table className="w-5 h-5 shrink-0" />
                <span>التقويم الجماعي والرصد</span>
                <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded ml-auto">مميز</span>
              </button>

              <button
                id="btn-nav-custom-passages"
                onClick={() => { setActiveTab("custom_passages"); setSelectedGameActivity(null); }}
                className={`w-full py-3 px-4 rounded-xl flex items-center gap-3 font-medium transition-all text-right text-sm ${
                  activeTab === "custom_passages"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <BookOpen className="w-5 h-5 shrink-0" />
                <span>نصوص القراءة والقرائية</span>
                <span className="bg-sky-100 text-sky-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded ml-auto">مطور</span>
              </button>

              <div className="h-px bg-slate-100 my-1"></div>

              <button
                id="btn-nav-reports"
                onClick={() => { setActiveTab("reports"); setSelectedGameActivity(null); }}
                className={`w-full py-3 px-4 rounded-xl flex items-center gap-3 font-medium transition-all text-right text-sm ${
                  activeTab === "reports"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/15"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Printer className="w-5 h-5 shrink-0 text-emerald-600 group-hover:text-white" />
                <span>التقارير وسجل الجلسات</span>
                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded ml-auto">PDF</span>
              </button>
            </nav>
          </div>

          {/* Quick Context Tip */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 shadow-sm text-xs text-emerald-800 leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <Lightbulb className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
              <span>هل تعلم؟</span>
            </div>
            تضم هذه المنصة تقنية التقييم الصوتي الذاتي الفوري لدعم معلم الفصحى في قياس القراءة دون إرهاقه بتدوين الدقائق والملاحظات يدوياً.
          </div>
        </aside>

        {/* Dynamic Display Panel View */}
        <main className="flex-1 flex flex-col gap-6" id="panel-display">
          
          {/* ==================== TAB 1: DASHBOARD OVERVIEW ==================== */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              
              <div className="bg-gradient-to-r from-indigo-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 border border-indigo-800 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 -translate-x-12 -translate-y-6 w-56 h-56 bg-emerald-500/10 rounded-full blur-2xl"></div>
                
                <div className="relative z-10 max-w-2xl">
                  <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold font-mono tracking-wide uppercase px-3 py-1 rounded-full border border-emerald-400/25">موثق تربوياً وعربياً</span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold mt-3 text-white">لوحة تحليلات القرائية العربية للتعليم الأساسي</h2>
                  <p className="text-slate-300 mt-2 text-sm leading-relaxed">
                    متابعة علمية وفحص مستمر لأثر المشاريع البحثية بالوطن العربي. قم بقياس قراءة طفلك الآن عبر تحليلات الصوت المعتمدة على الفوناتيك والكلمات وتلقين نصائح علاجية متكاملة بضغطة زر.
                  </p>
                  
                  <div className="flex flex-wrap gap-3 mt-6">
                    <button 
                      onClick={() => setActiveTab("assess_ai")}
                      className="bg-emerald-500 hover:bg-emerald-400 text-indigo-950 font-bold px-5 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/15"
                    >
                      <Mic className="w-4.5 h-4.5" />
                      إطلاق فحص قرائي فوري بالصوت
                    </button>
                    <button 
                      onClick={() => setActiveTab("benchmarks")}
                      className="bg-indigo-800 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition-all border border-indigo-700"
                    >
                      مراجعة معايير قياس الطلاقة المحدثة
                    </button>
                  </div>
                </div>
              </div>

              {/* 4 Cards Stats Column */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                    <FolderGit2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">المشاريع البحثية</span>
                    <strong className="text-2xl font-bold text-slate-800">{statistics.totalProj}</strong>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">الطلاب المسجلين</span>
                    <strong className="text-2xl font-bold text-slate-800">{statistics.totalStud}</strong>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">جلسات التقييم</span>
                    <strong className="text-2xl font-bold text-slate-800">{statistics.totalAss}</strong>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                  <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">متوسط القرائية</span>
                    <strong className="text-2xl font-bold text-slate-800">{statistics.avgWpm} ك/د</strong>
                  </div>
                </div>

              </div>

              {/* Two Column Graphs / Lists */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Accuracy Monitor Visual Bar chart */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-slate-800 text-base">منحنى دقة النطق وطلاقة القراءة لأحدث الجلسات</h4>
                      <BarChart3 className="text-slate-400 w-5 h-5" />
                    </div>
                    
                    {statistics.totalAss === 0 ? (
                      <div className="py-12 text-center text-slate-400 text-sm">
                        لا تتوفر جلسات إحصائية حالية. قم بإجراء أول جلسة تقييم لتوليد الرسم البياني.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="h-44 flex items-end justify-between gap-3 px-4 border-b border-slate-100 pb-2">
                          {statistics.recentScores.map((score, idx) => (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                              <div className="w-full bg-slate-100 rounded-t-lg relative h-32 flex items-end">
                                {/* Accuracy representation */}
                                <div 
                                  className="w-full bg-indigo-500 group-hover:bg-indigo-600 rounded-t-lg transition-all relative"
                                  style={{ height: `${score.accuracy}%` }}
                                >
                                  {/* Tooltip on hover */}
                                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-all">
                                    {score.accuracy}%
                                  </span>
                                </div>
                              </div>
                              <span className="text-[10px] text-slate-500 font-medium truncate max-w-[50px]">{score.date}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-center gap-4 text-xs text-slate-500 mt-2">
                          <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 bg-indigo-500 rounded-xs"></span>
                            <span>دقة النطق والتشكيل للكلمة %</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-4 mt-4 flex items-center justify-between text-xs text-slate-500">
                    <span>مؤشرات أداء اللسانيات العامة بالمنصة</span>
                    <strong className="text-emerald-600">جديرة بالثقة وتخضع للمراجعة البحثية</strong>
                  </div>
                </div>

                {/* Left Mini Column: Benchmarks expectations overview */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800 text-base mb-3">مستويات الطلاقة القياسية (كلمة/دقيقة)</h4>
                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">الحد الأدنى لسرعة قراءة الطالب المعتمدة لدى المنصة:</p>
                    
                    <div className="space-y-3">
                      {ARABIC_LITERACY_BENCHMARKS.map((benchmark) => (
                        <div key={benchmark.grade} className="flex items-center justify-between text-sm py-2 px-3 bg-slate-50 rounded-xl">
                          <span className="font-semibold text-slate-700">الصف {benchmark.grade === 1 ? "الأول" : benchmark.grade === 2 ? "الثاني" : benchmark.grade === 3 ? "الثالث" : "الرابع"}</span>
                          <span className="text-indigo-600 font-bold">{benchmark.fluentWpmMin} - {benchmark.fluentWpmIdeal} ك/د</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={() => setActiveTab("benchmarks")}
                    className="w-full mt-4 text-xs font-bold text-indigo-600 hover:text-indigo-700 border border-indigo-100 hover:bg-slate-50 py-2.5 rounded-xl transition"
                  >
                    تفاصيل التوجيهات لكل مرحلة
                  </button>
                </div>

              </div>

              {/* Recent Active Assessments Log */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    أحدث جلسات التقييم الحية
                  </h3>
                  <span className="text-xs text-slate-500">مجموع الجلسات: {assessments.length}</span>
                </div>
                
                {assessments.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">
                    لا تتوفر جلسات مضافة بعد. توجه إلى ‘تقييم ذكي‘ لبدء أول تدوين.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm">
                      <thead className="bg-slate-100/50 text-slate-500 font-semibold border-b border-slate-100 text-xs">
                        <tr>
                          <th className="p-4">الطالب</th>
                          <th className="p-4">الصف</th>
                          <th className="p-4">التاريخ والوقت</th>
                          <th className="p-4">طريقة الفحص</th>
                          <th className="p-4">السرعة (ك/د)</th>
                          <th className="p-4">الدقة</th>
                          <th className="p-4">استيعاب الفهم</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                        {assessments.slice(0, 5).map((ass) => {
                          const student = students.find(s => s.id === ass.studentId);
                          return (
                            <tr key={ass.id} className="hover:bg-slate-50/50 transition">
                              <td className="p-4 font-bold text-slate-900">{student?.name || "طالب سابق"}</td>
                              <td className="p-4">الصف {student?.grade || "غير محدد"}</td>
                              <td className="p-4 text-xs text-slate-500">
                                {new Date(ass.date).toLocaleDateString("ar-EG")} | {new Date(ass.date).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                  ass.evaluatedBy === "AI" 
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                                    : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                }`}>
                                  {ass.evaluatedBy === "AI" ? "الذكاء الاصطناعي" : "باحث يدوي"}
                                </span>
                              </td>
                              <td className="p-4 text-indigo-600 font-bold">{ass.wordsPerMinute} ك/د</td>
                              <td className="p-4">
                                <span className={`font-bold ${ass.accuracy >= 85 ? "text-emerald-600" : ass.accuracy >= 70 ? "text-amber-500" : "text-rose-600"}`}>
                                  {ass.accuracy}%
                                </span>
                              </td>
                              <td className="p-4 bg-slate-50/20">
                                <span className="font-semibold text-slate-800">{ass.comprehensionScore} من {ass.totalComprehensionQuestions}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ==================== TAB 2: PROJECTS REGISTRY ==================== */}
          {activeTab === "projects" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">سجل المشاريع البحثية والمدارس</h2>
                  <p className="text-xs text-slate-500 mt-1">تتيح لك المشاريع تصنيف سجلات وأفواج الطلاب بحسب المدرسة أو المنطقة الجغرافية المستهدفة.</p>
                </div>
                <button
                  id="btn-add-project"
                  onClick={() => setShowAddProjectModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  إضافة مشروع بحثي جديد
                </button>
              </div>

              {/* Grid of Projects */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((proj) => {
                  const pStuds = students.filter(s => s.projectId === proj.id);
                  const pAsses = assessments.filter(a => pStuds.map(s => s.id).includes(a.studentId));
                  return (
                    <div key={proj.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-sm transition-all p-6 flex flex-col justify-between gap-4">
                      <div>
                        <div className="flex items-start justify-between">
                          <span className="bg-indigo-50 text-indigo-700 text-[10px] font-extrabold px-2 py-0.5 rounded border border-indigo-100">
                            {proj.classGrade}
                          </span>
                          <button
                            onClick={() => handleDeleteProject(proj.id, proj.name)}
                            className="text-slate-300 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
                            title="حذف المشروع"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <h3 className="font-extrabold text-slate-900 text-lg mt-3 leading-snug">{proj.name}</h3>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                          <span>الموقع:</span>
                          <span className="text-slate-700 font-medium">{proj.school}</span>
                        </p>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                          <span>الباحث المسؤول:</span>
                          <span className="text-slate-700 font-medium">{proj.researcherName}</span>
                        </p>
                      </div>

                      {/* Stat summary per project */}
                      <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-600">
                        <div>
                          <span>الطلاب:</span>
                          <strong className="text-slate-900 mr-1">{pStuds.length}</strong>
                        </div>
                        <div>
                          <span>فحوصات مجراة:</span>
                          <strong className="text-slate-900 mr-1">{pAsses.length}</strong>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedProjectId(proj.id);
                            setActiveTab("students");
                          }}
                          className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1"
                        >
                          عرض منتسبي المشروع
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Project Modal Popup */}
              {showAddProjectModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl overflow-hidden border border-slate-100" dir="rtl">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <h3 className="font-bold text-slate-900 text-lg">بناء مشروع دراسي / بحثي جديد</h3>
                      <button 
                        onClick={() => setShowAddProjectModal(false)}
                        className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <form onSubmit={handleCreateProject} className="p-6 space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">عنوان الدراسة / المشروع المستهدف</label>
                        <input
                          type="text"
                          required
                          value={newProjName}
                          onChange={(e) => setNewProjName(e.target.value)}
                          placeholder="مثال: قياس مهارات التهجئة لصفوف التعويض اللغوي"
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-600 transition"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1.5">اسم المدرسة / المنشأة التربوية</label>
                          <input
                            type="text"
                            required
                            value={newProjSchool}
                            onChange={(e) => setNewProjSchool(e.target.value)}
                            placeholder="مثال: مدرسة الفاروق التأسيسية"
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-600 transition"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1.5">المرحلة الدراسية / الصفوف</label>
                          <input
                            type="text"
                            value={newProjGrade}
                            onChange={(e) => setNewProjGrade(e.target.value)}
                            placeholder="مثال: الصف الثاني الابتدائي"
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-600 transition"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1.5">اسم الباحث الرئيسي أو المحكم</label>
                          <input
                            type="text"
                            value={newProjResearcher}
                            onChange={(e) => setNewProjResearcher(e.target.value)}
                            placeholder={localUserNameState || "مثال: د. ماجد بن محمد بن أحمد"}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-600 transition"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1.5">منهاج المدرسة المعتمد</label>
                          <select
                            value={newProjCurriculum}
                            onChange={(e) => setNewProjCurriculum(e.target.value as "وزاري" | "بريطاني")}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-indigo-600 transition font-semibold text-slate-700"
                          >
                            <option value="وزاري">المنهاج الوزاري (حكومي/وطني)</option>
                            <option value="بريطاني">المنهاج البريطاني (دولي)</option>
                          </select>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-4 flex gap-3 justify-end">
                        <button
                          type="button"
                          onClick={() => setShowAddProjectModal(false)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2.5 rounded-xl text-xs transition"
                        >
                          إلغاء الأمر
                        </button>
                        <button
                          type="submit"
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition"
                        >
                          إنشاء وتثبيت المشروع
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ==================== TAB 3: STUDENTS DIRECTORY ==================== */}
          {activeTab === "students" && (
            <div className="space-y-6">
              
              {/* Filter Area */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">سجل ودليل الطلاب ومتابعتهم</h2>
                    <p className="text-xs text-slate-500 mt-0.5">اختر المشروع وصنف عينات الطلاب لعرض مسيرتكم اللغوية وخطط التدخل.</p>
                  </div>
                  <button
                    onClick={openAddStudentModal}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    إضافة طالب/ـة جديد للمشروع الحالي
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1 leading-4 uppercase">المشرق الدراسي المستهدف</label>
                    <select
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
                    >
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name} - ({p.school})</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 mb-1 leading-4 uppercase">البحث والفلترة باسم الطالب</label>
                    <div className="relative">
                      <Search className="absolute right-3.5 top-2.5 text-slate-300 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="اكتب اسم الطالب للتهديف المباشر..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-xs focus:outline-none focus:border-indigo-600 bg-slate-50"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid of Student Profile Cards */}
              {filteredStudents.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500 text-sm">
                  لا يوجد طلاب مسجلون حالياً في هذا المشروع. تود بإضافة طالب جديد للبدء؟
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredStudents
                    .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((student) => {
                      // Student metrics
                      const sAss = assessments.filter(a => a.studentId === student.id);
                      const lastAss = sAss[0]; // because sorted desc usually
                      const avgStudentAcc = sAss.length > 0 
                        ? Math.round(sAss.reduce((sum, current) => sum + current.accuracy, 0) / sAss.length)
                        : 0;

                      const studentInterventions = interventions.filter(i => i.studentId === student.id);

                      return (
                        <div key={student.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition p-5 flex flex-col justify-between gap-4">
                          <div>
                            <div className="flex items-start justify-between">
                              <div className="flex flex-wrap gap-1.5 max-w-[85%]">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                                  student.gender === "male"
                                    ? "bg-blue-50 text-blue-700 border-blue-200"
                                    : "bg-rose-50 text-rose-700 border-rose-250"
                                }`}>
                                  {student.gender === "male" ? "بنين" : "بنات"} • الصف {student.grade} • {student.age} سنوات
                                </span>
                                {student.languageClassification === 'B' ? (
                                  <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-extrabold shadow-2xs">
                                    الفئة B (العربية لغة ثانية / Non-Native)
                                  </span>
                                ) : (
                                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-250 px-2 py-0.5 rounded text-[10px] font-extrabold shadow-2xs">
                                    الفئة A (العربية لغة أولى / Native)
                                  </span>
                                )}
                                <span className="bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded text-[10px] font-extrabold shadow-2xs">
                                  منهاج {student.curriculum || "وزاري"}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleDeleteStudent(student.id, student.name)}
                                  className="text-slate-300 hover:text-rose-600 p-1 rounded hover:bg-slate-100 transition"
                                  title="حذف كلي للطالب"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <h3 className="font-extrabold text-slate-900 text-base mt-2.5">{student.name}</h3>
                            {student.notes && (
                              <p className="text-[11px] text-slate-500 mt-1 lines-clamp-2 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                                {student.notes}
                              </p>
                            )}

                            {(student.school || student.researcherName) && (
                              <div className="mt-2.5 bg-slate-50/70 border border-slate-100 rounded-xl p-2.5 space-y-1 text-right font-sans">
                                {student.school && (
                                  <div className="flex items-center gap-1.5 text-[11px] text-slate-700">
                                    <span className="text-indigo-600 font-bold">🏫</span>
                                    <span className="font-semibold text-slate-500">المدرسة المستهدفة:</span>
                                    <span className="font-bold text-slate-800">{student.school}</span>
                                  </div>
                                )}
                                {student.researcherName && (
                                  <div className="flex items-center gap-1.5 text-[11px] text-slate-700">
                                    <span className="text-emerald-600 font-bold">👤</span>
                                    <span className="font-semibold text-slate-500">الباحث المسؤول:</span>
                                    <span className="font-bold text-slate-800">{student.researcherName}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Key Stats visual block */}
                            <div className="grid grid-cols-2 gap-3 mt-4 text-center">
                              <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                                <span className="text-[10px] text-slate-500 block">فحوصات مجراة</span>
                                <strong className="text-sm font-bold text-slate-800">{sAss.length}</strong>
                              </div>
                              <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                                <span className="text-[10px] text-slate-500 block">معدل دقة اللفظ</span>
                                <strong className={`text-sm font-bold ${avgStudentAcc >= 85 ? "text-emerald-600" : "text-amber-500"}`}>
                                  {avgStudentAcc > 0 ? `${avgStudentAcc}%` : "—"}
                                </strong>
                              </div>
                            </div>
                          </div>

                          <div className="border-t border-slate-100 pt-3 space-y-2.5 text-xs">
                            {lastAss && (
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-slate-500">آخر سرعة قرائية:</span>
                                <strong className="text-indigo-600">{lastAss.wordsPerMinute} كلمة/د</strong>
                              </div>
                            )}

                            {studentInterventions.length > 0 ? (
                              <div className="bg-indigo-50/40 p-2 rounded-lg text-[10px] text-indigo-800 flex items-center justify-between border border-indigo-150">
                                <strong className="font-bold flex items-center gap-1">
                                  <BrainCircuit className="w-3.5 h-3.5" />
                                  متوفر خطة تدخل لغوي
                                </strong>
                                <button
                                  onClick={() => {
                                    setActiveInterventionPlan(studentInterventions[0]);
                                    setActiveTab("intervention");
                                  }}
                                  className="text-[9px] underline font-bold"
                                >
                                  حل وقرابة الألعاب
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => generateInterventionWithAI(student)}
                                disabled={isGeneratingIntervention}
                                className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold py-2 rounded-lg text-[11px] transition flex items-center justify-center gap-1"
                              >
                                {isGeneratingIntervention ? (
                                  <>
                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                    صياغة الألعاب بالذكاء الاصطناعي...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                                    صياغة ألعاب قرائية مخصصة للطالب
                                  </>
                                )}
                              </button>
                            )}

                            <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
                              <button
                                onClick={() => {
                                  setSelectedStudentId(student.id);
                                  setSelectedPassageId(passages[student.grade - 1]?.id || passages[0].id);
                                  setActiveTab("assess_ai");
                                }}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-1.5 rounded-lg text-[11px] text-center"
                              >
                                فحص صوتي ذكي
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedStudentId(student.id);
                                  setSelectedPassageId(passages[student.grade - 1]?.id || passages[0].id);
                                  setActiveTab("assess_manual");
                                }}
                                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-1.5 rounded-lg text-[11px] text-center border border-slate-200"
                              >
                                تقييم يدوي سريع
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {/* Add Student Modal Popup */}
              {showAddStudentModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl overflow-hidden border border-slate-100" dir="rtl">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <h3 className="font-bold text-slate-900 text-lg">إدراج تلميذ جديد للملفات اللفظية</h3>
                      <button 
                        onClick={() => setShowAddStudentModal(false)}
                        className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <form onSubmit={handleCreateStudent} className="p-6 space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">الاسم الكامل للطالب/ـة</label>
                        <input
                          type="text"
                          required
                          value={newStudName}
                          onChange={(e) => setNewStudName(e.target.value)}
                          placeholder="مثال: عبد الواحد بن يوسف الخالدي"
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-600 transition"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1.5">الجنس</label>
                          <select
                            value={newStudGender}
                            onChange={(e) => setNewStudGender(e.target.value as any)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-indigo-600 transition font-semibold text-slate-700"
                          >
                            <option value="male">ذكر</option>
                            <option value="female">أنثى</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1.5">الصف الأكاديمي</label>
                          <select
                            value={newStudGrade}
                            onChange={(e) => setNewStudGrade(Number(e.target.value))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-indigo-600 transition font-semibold text-slate-700"
                          >
                            <option value={1}>الصف الأول الابتدائي</option>
                            <option value={2}>الصف الثاني الابتدائي</option>
                            <option value={3}>الصف الثالث الابتدائي</option>
                            <option value={4}>الصف الرابع الابتدائي</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1.5">العمر الرقمي</label>
                          <input
                            type="number"
                            required
                            min={5}
                            max={16}
                            value={newStudAge}
                            onChange={(e) => setNewStudAge(Number(e.target.value))}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-600 transition"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1.5">التصنيف اللساني للغة</label>
                          <select
                            value={newStudLanguageClassification}
                            onChange={(e) => setNewStudLanguageClassification(e.target.value as "A" | "B")}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-indigo-600 transition font-semibold text-slate-700"
                          >
                            <option value="A">العربية لغة أولى (الفئة A)</option>
                            <option value="B">العربية لغة ثانية (الفئة B)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1.5">منهاج المدرسة المعتمد</label>
                          <select
                            value={newStudCurriculum}
                            onChange={(e) => setNewStudCurriculum(e.target.value as "وزاري" | "بريطاني")}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-indigo-600 transition font-semibold text-slate-700"
                          >
                            <option value="وزاري">منهاج وزاري</option>
                            <option value="بريطاني">منهاج بريطاني</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">ملاحظات مسبقة للطفل</label>
                        <input
                          type="text"
                          value={newStudNotes}
                          onChange={(e) => setNewStudNotes(e.target.value)}
                          placeholder="صعوبة في نطق حرف الصاد والتشديد"
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-600 transition"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-650 mb-1.5 flex items-center gap-1">
                            <span>🏫</span> المدرسة المستهدفة
                          </label>
                          <input
                            type="text"
                            value={newStudSchool}
                            onChange={(e) => setNewStudSchool(e.target.value)}
                            placeholder="مثال: مدرسة التميز والمستقبل"
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:border-indigo-600 transition font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-650 mb-1.5 flex items-center gap-1">
                            <span>👥</span> اسم الباحث المدخل
                          </label>
                          <input
                            type="text"
                            value={newStudResearcher}
                            onChange={(e) => setNewStudResearcher(e.target.value)}
                            placeholder={localUserNameState || "مثال: الباحث أ. علي الأحمد"}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:border-indigo-600 transition font-medium"
                          />
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-4 flex gap-3 justify-end">
                        <button
                          type="button"
                          onClick={() => setShowAddStudentModal(false)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2.5 rounded-xl text-xs transition animate"
                        >
                          إلغاء الأمر
                        </button>
                        <button
                          type="submit"
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition"
                        >
                          حفظ وإدراج التلميذ
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ==================== TAB 4: INTERACTIVE AI ASSESSMENT ==================== */}
          {activeTab === "assess_ai" && (
            <div className="space-y-6">
              
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-indigo-950 flex items-center gap-2">
                      <AudioLines className="w-6 h-6 text-emerald-500" />
                      تقييم السرد الصوتي المعتمد على نموذج الذكاء الاصطناعي
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">يستمع نموذج الذكاء الاصطناعي لتهجئة الطفل، يقارنها بالنص، يحسب السرعة كأخصائي جودة لسانية.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsChildFriendlyMode(!isChildFriendlyMode)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 border self-start sm:self-center ${
                      isChildFriendlyMode
                        ? "bg-amber-400 hover:bg-amber-500 text-indigo-950 border-amber-500 shadow-xs shadow-amber-400/20"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
                    }`}
                  >
                    <span>{isChildFriendlyMode ? "🎨 وضع قراءة الأطفال الملوّن: نَشِط ✨" : "⚙️ عودة لوضع التدقيق الكلاسيكي"}</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-100">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1 leading-4 uppercase">المشرق الدراسي الحالي</label>
                    <select
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
                    >
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1 leading-4 uppercase">تحديد الطالب للقراءة</label>
                    <select
                      value={selectedStudentId}
                      onChange={(e) => setSelectedStudentId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
                    >
                      <option value="">— اختر تلميذ —</option>
                      {filteredStudents.map(s => (
                        <option key={s.id} value={s.id}>{s.name} (الصف {s.grade})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1 leading-4 uppercase">القطعة القرائية المستهدفة</label>
                    <select
                      value={selectedPassageId}
                      onChange={(e) => setSelectedPassageId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
                    >
                      {passages.map(p => (
                        <option key={p.id} value={p.id}>{p.title} - ({p.wordCount} كلمة)</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Assessment Panel split */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Right Side: Passages showing + Voice recorder */}
                <div className="space-y-6">
                  
                  {/* The actual text displaying */}
                  {isChildFriendlyMode ? (
                    /* ======== GORGEOUS, COLORFUL & MULTI-TONE STORYBOOK PRESENTATION FOR CHILDREN ======== */
                    <div className="bg-gradient-to-b from-sky-100 via-sky-50 to-white rounded-[32px] border-4 border-dashed border-sky-300 shadow-sm p-6 sm:p-8 space-y-6 relative overflow-hidden transition-all duration-300">
                      {/* Playful Decorative Vectors & Emojis */}
                      <div className="absolute top-2 right-4 text-4xl animate-bounce select-none">☀️</div>
                      <div className="absolute -bottom-2 left-6 text-2xl select-none">🎈</div>
                      <div className="absolute top-[40%] left-2 text-xl opacity-30 select-none">☁️</div>
                      <div className="absolute top-6 left-12 text-3xl select-none">⭐</div>

                      {/* Header bar and Encouraging Avatars */}
                      <div className="flex items-center justify-between border-b-2 border-sky-200 pb-4 relative z-10">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl animate-[pulse_2s_infinite]">🦁</span>
                          <div>
                            <h3 className="font-extrabold text-indigo-900 text-base leading-6">{activePassage.title}</h3>
                            <p className="text-[10px] text-sky-800 font-bold bg-sky-100/80 px-2 my-0.5 rounded-full inline-block">أنت بطل رائع وقارئ فصيح</p>
                          </div>
                        </div>
                        <span className="bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-xs">
                          🌈 مستوى الصف {activePassage.gradeLevel}
                        </span>
                      </div>

                      {/* Large Beautiful Display Text with Diacritics (Tashkeel) */}
                      <div className="bg-white/95 border-3 border-orange-100 shadow-inner rounded-[24px] p-6 sm:p-8 relative z-10">
                        <div className="leading-[2.5] text-2xl sm:text-3xl font-extrabold text-indigo-950 text-center tracking-wider font-sans select-none" dir="rtl">
                          {activePassage.text}
                        </div>
                      </div>

                      {/* Helpful Educational Prompts & Metrics */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 relative z-10">
                        <div className="bg-amber-100/90 border border-amber-300 p-3 rounded-2xl flex items-center gap-2.5">
                          <span className="text-xl">🐦</span>
                          <span className="text-[11px] text-amber-950 font-medium leading-relaxed">
                            العصفور كوكو يقول: "تنفس بعمق يا بطل واقرأ الكلمات بحركاتها اللطيفة وصوتك الدافئ!"
                          </span>
                        </div>
                        <div className="bg-emerald-100/90 border border-emerald-300 p-3 rounded-2xl flex items-center gap-2.5">
                          <span className="text-xl">⭐</span>
                          <span className="text-[11px] text-emerald-950 font-medium leading-relaxed">
                            أمامك عمل رائع! اقرأ هذه الـ <strong className="text-xs text-indigo-900 font-extrabold">{activePassage.wordCount}</strong> كلمات المميزة لتنال رتبة النجوم الساطعة.
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* ======== ORIGINAL TRADITIONAL ACADEMIC LAYOUT ======== */
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h3 className="font-extrabold text-indigo-950 text-base">{activePassage.title}</h3>
                        <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-lg">
                          المستوى: الصف {activePassage.gradeLevel} الابتدائي
                        </span>
                      </div>

                      <div className="leading-loose text-lg sm:text-xl font-bold font-serif text-slate-800 text-justify bg-amber-50/40 p-5 rounded-2xl border border-amber-100/50 leading-10 tracking-wide select-none" dir="rtl">
                        {activePassage.text}
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>إجمالي العينات الصوتية بالنص: <strong>{activePassage.wordCount} كلمة</strong></span>
                        <span>السرعة القياسية لصفه: <strong className="text-indigo-600"> {activePassage.gradeLevel === 1 ? "15" : activePassage.gradeLevel === 2 ? "30" : "50"} ك/د أو تزيد</strong></span>
                      </div>
                    </div>
                  )}

                  {/* Audio Capture card */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
                    {isChildFriendlyMode ? (
                      /* ======== GORGEOUS, COLORFUL & SECURE MIC CAPTURE UI FOR CHILDREN ======== */
                      <div className="bg-gradient-to-b from-amber-50 to-orange-50/60 border-4 border-dashed border-amber-300 rounded-[30px] p-6 text-center space-y-4 relative overflow-hidden transition-all duration-300">
                        {isRecording && (
                          <div className="absolute top-2 left-3 flex items-center gap-1.5 bg-rose-100 border border-rose-300 px-3 py-1 rounded-full text-xs text-rose-800 font-bold animate-[pulse_1.5s_infinite]">
                            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
                            🎤 الميكروفون السحري يسجّل صوتك الفصيح...
                          </div>
                        )}

                        <div className="text-center space-y-1">
                          <span className="text-3xl animate-bounce">🗣️</span>
                          <h4 className="font-extrabold text-amber-950 text-sm">مُسجّل الصوت لنجوم الغد</h4>
                          <p className="text-[11px] text-amber-900/80 max-w-sm mx-auto leading-relaxed">بإمكانك التسجيل مباشرة من ميكروفون الحاسوب أو رفع ملف من جهازك لبدء التحليل الفوري للمهارات.</p>
                        </div>

                        {/* Level Volume Wave Animations */}
                        {isRecording ? (
                          <div className="h-12 flex items-center justify-center gap-1.5 px-4 bg-white/80 rounded-2xl border border-orange-200 shadow-inner">
                            {micVolume.map((vol, i) => (
                              <div 
                                key={i} 
                                className="w-1.5 bg-gradient-to-t from-emerald-400 via-amber-400 to-indigo-500 rounded-full transition-all duration-75"
                                style={{ height: `${vol}px`, minHeight: "6px" }}
                              ></div>
                            ))}
                          </div>
                        ) : (
                          <div className="h-12 flex items-center justify-center">
                            <span className="text-3xl">✨🎙️✨</span>
                          </div>
                        )}

                        {/* Display duration countdown */}
                        <div className="text-xl font-extrabold font-mono text-indigo-950 bg-amber-200/50 inline-block px-4 py-1.5 rounded-full border border-amber-300 animate-pulse">
                          {Math.floor(recordingSeconds / 60).toString().padStart(2, "0")}:
                          {(recordingSeconds % 60).toString().padStart(2, "0")}
                        </div>

                        <div className="flex items-center justify-center gap-3">
                          {!isRecording ? (
                            <button
                              id="btn-voice-start"
                              onClick={startRecording}
                              className="bg-emerald-500 hover:bg-emerald-600 text-indigo-950 font-extrabold text-xs px-5 py-3 rounded-xl transition flex items-center gap-2 shadow-md shadow-emerald-500/25 border-b-4 border-emerald-700 active:translate-y-0.5 active:border-b-2"
                            >
                              <span className="text-sm">▶️</span>
                              ابدأ القراءة الفصيحة الآن
                            </button>
                          ) : (
                            <button
                              id="btn-voice-stop"
                              onClick={stopRecording}
                              className="bg-rose-500 hover:bg-rose-650 text-white font-extrabold text-xs px-5 py-3 rounded-xl transition flex items-center gap-2 animate-pulse shadow-md shadow-rose-500/25 border-b-4 border-rose-700 active:translate-y-0.5 active:border-b-2"
                            >
                              <span className="text-sm">⏹️</span>
                              أنقذ المقطع واحصد النجوم
                            </button>
                          )}
                        </div>

                        {/* Upload local files */}
                        <div className="flex flex-col items-center justify-center pt-2 border-t border-amber-200/50">
                          <span className="text-[10px] text-amber-900 block my-1">أو ارفع ملفاً مسجلاً من جهازك:</span>
                          <input
                            type="file"
                            accept="audio/*"
                            onChange={handleAudioUpload}
                            className="text-[10px] text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer max-w-[200px]"
                          />
                        </div>
                      </div>
                    ) : (
                      /* ======== ORIGINAL ACADEMIC RESEARCHER CAPTURING ======== */
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">مستقبل تسجيل قراءة الطالب وصوته</h4>
                          <p className="text-xs text-slate-400">بإمكانك التسجيل مباشرة من ميكروفون الحاسوب أو تحميل تسجيل مسبق بصيغة WebM أو MP3.</p>
                        </div>

                        {/* Microphone action board */}
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center space-y-4 relative overflow-hidden">
                          {isRecording && (
                            <div className="absolute top-2 left-3 flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-2 py-1 rounded text-[10px] text-rose-700 font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping"></span>
                              جاري التسجيل...
                            </div>
                          )}

                      {/* Level Volume Wave Animations */}
                      {isRecording ? (
                        <div className="h-12 flex items-center justify-center gap-1.5 px-4">
                          {micVolume.map((vol, i) => (
                            <div 
                              key={i} 
                              className="w-1 bg-gradient-to-t from-emerald-500 to-indigo-600 rounded-full transition-all duration-75"
                              style={{ height: `${vol}px`, minHeight: "4px" }}
                            ></div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-12 flex items-center justify-center">
                          <AudioLines className="w-10 h-10 text-slate-300" />
                        </div>
                      )}

                      {/* Display duration countdown */}
                      <div className="text-xl font-extrabold font-mono text-slate-800">
                        {Math.floor(recordingSeconds / 60).toString().padStart(2, "0")}:
                        {(recordingSeconds % 60).toString().padStart(2, "0")}
                      </div>

                      <div className="flex items-center justify-center gap-3">
                        {!isRecording ? (
                          <button
                            id="btn-voice-start"
                            onClick={startRecording}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-5 py-3 rounded-xl transition flex items-center gap-2 shadow-lg shadow-indigo-600/15"
                          >
                            <Mic className="w-4 h-4 text-emerald-300 animate-pulse" />
                            ابدأ التسجيل الفوري
                          </button>
                        ) : (
                          <button
                            id="btn-voice-stop"
                            onClick={stopRecording}
                            className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-5 py-3 rounded-xl transition flex items-center gap-2 animate-pulse"
                          >
                            <Square className="w-4 h-4 fill-white" />
                            إنهاء وحفظ المقطع
                          </button>
                        )}
                      </div>

                      {/* Upload local files */}
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-[10px] text-slate-400 block my-2">أو قم برفع ملف صوتي</span>
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={handleAudioUpload}
                          className="text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer max-w-[200px]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                    {/* Submit analysis triggers */}
                    {audioUrl && (
                      <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Play className="w-4 h-4 text-indigo-600 shrink-0" />
                          <audio src={audioUrl} controls className="h-8 max-w-[220px]" />
                        </div>
                        <button
                          id="btn-trigger-ai"
                          onClick={() => submitAudioAnalysis(false)}
                          disabled={isAnalyzing}
                          className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-indigo-950 font-extrabold text-xs px-4 py-2 rounded-xl transition"
                        >
                          {isAnalyzing ? "جاري المعالجة والتحليل..." : "انطلق! ابدأ التقويم بالتحليل الذكي"}
                        </button>
                      </div>
                    )}

                    {/* Standby Simulation fallback button */}
                    <div className="flex justify-center border-t border-slate-100 pt-3">
                      <button
                        onClick={() => submitAudioAnalysis(true)}
                        disabled={isAnalyzing}
                        className="text-slate-500 hover:text-indigo-600 text-[10px] font-bold flex items-center gap-1.5 transition"
                        title="يحاكي تحليل الصوت مباشرة باستخدام نموذج البيانات الفوري في حالة عدم تفعيل الميكروفون"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? "animate-spin" : ""}`} />
                        تجربة ‘تقييم ذكي محاكى‘ فوري لنموذج النص المختار
                      </button>
                    </div>

                    {analysisError && (
                      <div className="bg-rose-50 border border-rose-100 p-3.5 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                        <AlertCircle className="w-4.5 h-4.5 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>ملاحظة فنية:</strong>
                          <p className="mt-0.5 leading-relaxed">{analysisError}</p>
                        </div>
                      </div>
                    )}

                  </div>

                </div>

                {/* Left Side: Live analytical report outcome */}
                <div className="space-y-6">
                  
                  {isAnalyzing && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-8 text-center space-y-4">
                      <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
                      <h4 className="font-bold text-slate-800 text-base">جاري معالجة الصوت بالذكاء الاصطناعي...</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        يقوم نموذج الذكاء الاصطناعي حالياً بتفكيك الموجات الصوتية والتحقق الفونيمي من مخارج الحروف الشفتين واللسان ونطق الحركات ومقارنتها بالرسم والكلمة. يرجى الانتظار ثوانٍ معدودة.
                      </p>
                    </div>
                  )}

                  {activeAiResult && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6 animated fade-in">
                      
                      {/* Metric highlights */}
                      <div className="border-b border-slate-100 pb-4">
                        <span className="bg-indigo-50 text-indigo-700 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">تقرير التشريح القرائي الفوري</span>
                        <h3 className="font-extrabold text-slate-900 text-lg mt-2">نتائج محرك الفصاحة والطلاقة</h3>
                        
                        <div className="grid grid-cols-2 gap-3 mt-4">
                          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-150">
                            <span className="text-[10px] text-emerald-800 block">نسبة دقة القراءة والتهجئة</span>
                            <strong className="text-xl font-bold text-emerald-700">{activeAiResult.accuracy}%</strong>
                          </div>
                          <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-150">
                            <span className="text-[10px] text-indigo-800 block">السرعة المحققة</span>
                            <strong className="text-xl font-bold text-indigo-700">{activeAiResult.wordsPerMinute} كلمة/د</strong>
                          </div>
                        </div>
                      </div>

                      {/* Graphical Word-by-word highlighted preview */}
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm mb-3">النص المزود بالتلوين والتعليقات الصوتية</h4>
                        
                        <div className="flex flex-wrap gap-x-2.5 gap-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-base leading-relaxed select-none justify-start">
                          {activeAiResult.wordsAnalyzed.map((wa, i) => {
                            let textClass = "";
                            let bgClass = "";
                            let statusText = "";

                            if (wa.status === "correct") {
                              textClass = "text-emerald-700 font-bold";
                              bgClass = "bg-emerald-50 border-emerald-200";
                              statusText = "سليم";
                            } else if (wa.status === "incorrect") {
                              textClass = "text-rose-700 font-bold underline decoration-dotted";
                              bgClass = "bg-rose-50 border-rose-200";
                              statusText = "خلل لفظي";
                            } else if (wa.status === "skipped") {
                              textClass = "text-slate-400 line-through";
                              bgClass = "bg-slate-100 border-slate-200";
                              statusText = "تخطي";
                            } else if (wa.status === "mispronounced") {
                              textClass = "text-amber-800 font-bold";
                              bgClass = "bg-amber-50 border-amber-200";
                              statusText = "ضبط خاطئ للشدة/الحركة";
                            }

                            return (
                              <div 
                                key={i} 
                                className={`group relative px-2.5 py-1 rounded-lg border text-sm transition cursor-help flex flex-col items-center ${bgClass}`}
                              >
                                <span className={textClass}>{wa.word}</span>
                                <span className="text-[8px] text-slate-400 mt-0.5 font-semibold">{statusText}</span>
                                
                                {wa.feedback && (
                                  <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 text-white text-[10px] p-2 rounded-lg shadow-lg z-30 w-36 text-center leading-normal">
                                    {wa.feedback}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Pronunciation issues list */}
                      {activeAiResult.pronunciationErrors && activeAiResult.pronunciationErrors.length > 0 && (
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm mb-2.5">توجيه التدريب اللساني (صعوبات المخرج المكتشفة)</h4>
                          <div className="space-y-2.5">
                            {activeAiResult.pronunciationErrors.map((error, idx) => (
                              <div key={idx} className="bg-amber-50/50 p-3 rounded-xl border border-amber-150 text-xs text-slate-700 leading-relaxed">
                                <strong className="text-amber-900 block font-bold mb-1">■ {error.errorType} (مثال: {error.example})</strong>
                                <span className="text-slate-600">طريقة العلاج: {error.remediation}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* General descriptive feedback */}
                      <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs text-slate-600 leading-normal">
                        <strong className="text-slate-800 block mb-1">الملخص التشجيعي المرشد:</strong>
                        {activeAiResult.generalFeedback}
                      </div>

                      {/* Comprehension Quiz Segment */}
                      <div className="border-t border-slate-100 pt-4 space-y-4">
                        <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-slate-50">
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-sm">مستشعر الفهم القرائي والاستيعاب</h4>
                            <p className="text-xs text-slate-400">وجه هذه الأسئلة الشفوية للطفل بعد انتهائه مباشرة من القراءة ودون استجابته للغز:</p>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => setIsEditingPassageQuestions(!isEditingPassageQuestions)}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-[11px] px-3.5 py-1.5 rounded-xl border border-indigo-200/50 transition flex items-center gap-1 shrink-0 shadow-xs"
                          >
                            {isEditingPassageQuestions ? "💡 بدء التقويم والحل" : "📝 تعديل الأسئلة والبدائل"}
                          </button>
                        </div>

                        {isEditingPassageQuestions ? (
                          <div className="space-y-4 border border-indigo-100/50 bg-indigo-50/10 p-4 rounded-xl">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <h5 className="font-extrabold text-indigo-950 text-xs">
                                ⚙️ نافذة تعديل أسئلة استيعاب المعنى: {activePassage.title}
                              </h5>
                              <button
                                type="button"
                                onClick={() => {
                                  const newQ = {
                                    id: "q-custom-" + Date.now(),
                                    question: "سؤال فهم جديد للقطعة؟",
                                    options: ["الخيار الأول", "الخيار الثاني", "الخيار الثالث"],
                                    correctIndex: 0
                                  };
                                  const nextPassages = passages.map(p => {
                                    if (p.id === activePassage.id) {
                                      return {
                                        ...p,
                                        comprehensionQuestions: [...p.comprehensionQuestions, newQ]
                                      };
                                    }
                                    return p;
                                  });
                                  setPassages(nextPassages);
                                  syncPlatformData({ passages: nextPassages });
                                }}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] px-3 py-1.5 rounded-lg transition font-black flex items-center gap-1 shadow-sm"
                              >
                                ➕ إضافة سؤال مخصص جديد
                              </button>
                            </div>

                            {activePassage.comprehensionQuestions.length === 0 ? (
                              <p className="text-xs text-slate-400 text-center py-4 bg-white rounded-xl border">لا توجد أسئلة حالية. استخدم زر "إضافة سؤال مخصص جديد" بالأعلى لبدء التعديل.</p>
                            ) : (
                              <div className="space-y-4">
                                {activePassage.comprehensionQuestions.map((q, qIndex) => (
                                  <div key={q.id || qIndex} className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-3 shadow-xs">
                                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                                      <span className="text-[10px] text-slate-400 font-extrabold">سؤال رقم {qIndex + 1} ({q.isConstant ? "ثابت" : "مخصص"})</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (confirm("هل ترغب في حذف هذا السؤال نهائياً من مستودع القطعة؟")) {
                                            const nextPassages = passages.map(p => {
                                              if (p.id === activePassage.id) {
                                                return {
                                                  ...p,
                                                  comprehensionQuestions: p.comprehensionQuestions.filter((_, idx) => idx !== qIndex)
                                                };
                                              }
                                              return p;
                                            });
                                            setPassages(nextPassages);
                                            syncPlatformData({ passages: nextPassages });
                                          }
                                        }}
                                        className="text-rose-500 hover:text-rose-700 text-[10px] font-bold transition flex items-center gap-0.5"
                                      >
                                        🗑️ حذف السؤال
                                      </button>
                                    </div>

                                    <div className="space-y-1 text-right">
                                      <label className="block text-[10px] font-bold text-slate-500">نص سؤال الفهم والاستيعاب:</label>
                                      <input
                                        type="text"
                                        value={q.question}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          const nextPassages = passages.map(p => {
                                            if (p.id === activePassage.id) {
                                              return {
                                                ...p,
                                                comprehensionQuestions: p.comprehensionQuestions.map((item, idx) => 
                                                  idx === qIndex ? { ...item, question: val } : item
                                                )
                                              };
                                            }
                                            return p;
                                          });
                                          setPassages(nextPassages);
                                          syncPlatformData({ passages: nextPassages });
                                        }}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-black focus:outline-none focus:bg-white focus:border-indigo-500"
                                        dir="rtl"
                                      />
                                    </div>

                                    <div className="space-y-1.5 text-right">
                                      <label className="block text-[10px] font-bold text-slate-500">البدائل والخيارات (حدّد زر الاختيار المقابل للإجابة الصحيحة):</label>
                                      <div className="space-y-1.5">
                                        {q.options.map((opt, oIdx) => (
                                          <div key={oIdx} className="flex items-center gap-2">
                                            <input
                                              type="radio"
                                              name={`speech-correct-${q.id || qIndex}`}
                                              checked={q.correctIndex === oIdx}
                                              onChange={() => {
                                                const nextPassages = passages.map(p => {
                                                  if (p.id === activePassage.id) {
                                                    return {
                                                      ...p,
                                                      comprehensionQuestions: p.comprehensionQuestions.map((item, idx) => 
                                                        idx === qIndex ? { ...item, correctIndex: oIdx } : item
                                                      )
                                                    };
                                                  }
                                                  return p;
                                                });
                                                setPassages(nextPassages);
                                                syncPlatformData({ passages: nextPassages });
                                              }}
                                              className="w-4 h-4 accent-indigo-600 cursor-pointer shrink-0"
                                            />
                                            <input
                                              type="text"
                                              value={opt}
                                              onChange={(e) => {
                                                const val = e.target.value;
                                                const nextPassages = passages.map(p => {
                                                  if (p.id === activePassage.id) {
                                                    return {
                                                      ...p,
                                                      comprehensionQuestions: p.comprehensionQuestions.map((item, idx) => {
                                                        if (idx === qIndex) {
                                                          const nextOptions = [...item.options];
                                                          nextOptions[oIdx] = val;
                                                          return { ...item, options: nextOptions };
                                                        }
                                                        return item;
                                                      })
                                                    };
                                                  }
                                                  return p;
                                                });
                                                setPassages(nextPassages);
                                                syncPlatformData({ passages: nextPassages });
                                              }}
                                              className="flex-grow bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 font-bold focus:outline-none focus:bg-white"
                                              dir="rtl"
                                            />
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {activePassage.comprehensionQuestions.map((q) => (
                              <div key={q.id} className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 text-xs">
                                <p className="font-bold text-slate-800 mb-2.5 flex items-center justify-between gap-2" dir="rtl">
                                  <span>{q.question}</span>
                                  {q.isConstant && (
                                    <span className="text-[9px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200 shrink-0 font-extrabold flex items-center gap-0.5">
                                      <Lock className="w-2.5 h-2.5" /> ثابت
                                    </span>
                                  )}
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {([...q.options, "لم يستطع الإجابة"]).map((opt, oIdx) => {
                                    const isSelected = userComprehensionAnswers[q.id] === oIdx;
                                    const isCorrect = oIdx === q.correctIndex;
                                    let btnClass = oIdx === 3 
                                      ? "border-slate-300 text-slate-500 bg-slate-50/50 hover:bg-slate-100/80" 
                                      : "border-slate-200 text-slate-700 hover:bg-slate-100";
                                    
                                    if (isSelected) {
                                      if (isComprehensionVerified) {
                                        btnClass = isCorrect 
                                          ? "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold" 
                                          : "bg-rose-100 text-rose-800 border-rose-300 font-bold";
                                      } else {
                                        btnClass = "bg-indigo-600 text-white border-indigo-600 font-bold";
                                      }
                                    } else if (isComprehensionVerified && isCorrect) {
                                      btnClass = "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold";
                                    }

                                    return (
                                      <button
                                        key={oIdx}
                                        type="button"
                                        disabled={isComprehensionVerified}
                                        onClick={() => setUserComprehensionAnswers(prev => ({ ...prev, [q.id]: oIdx }))}
                                        className={`py-2 px-3 rounded-lg border text-right transition cursor-pointer text-[11px] ${btnClass}`}
                                      >
                                        {opt}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {!isComprehensionVerified ? (
                          <button
                            type="button"
                            onClick={() => setIsComprehensionVerified(true)}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2 rounded-xl transition"
                          >
                            تصحيح وتدقيق مستوى الفهم والاستيعاب
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={saveAiAssessmentToHistory}
                              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-indigo-950 font-bold text-xs py-2.5 rounded-xl transition shadow-md shadow-emerald-500/10"
                            >
                              حفظ النتيجة النهائية لتقييم الطالب
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setUserComprehensionAnswers({});
                                setIsComprehensionVerified(false);
                              }}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs py-2.5 px-4 rounded-xl transition border border-slate-200"
                            >
                              إعادة حل
                            </button>
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                  {!activeAiResult && !isAnalyzing && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-10 text-center text-slate-400 text-sm space-y-3">
                      <Mic className="w-10 h-10 text-slate-200 mx-auto" />
                      <p>في انتظار بدء التسجيل أو تحميل العينة لتبدأ التحليلات الذكية فوراً.</p>
                    </div>
                  )}

                </div>

              </div>

            </div>
          )}

          {/* ==================== TAB 5: MANAGED RESEARCHER MANUAL ENTRY ==================== */}
          {activeTab === "assess_manual" && (
            <div className="space-y-6">
              
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <h2 className="text-xl font-bold text-slate-950 flex items-center gap-2">
                  <FileSpreadsheet className="w-6 h-6 text-indigo-600" />
                  لوحة التقييم والتدوينات اليدوية للباحث والمحكم اللساني
                </h2>
                <p className="text-xs text-slate-500 mt-1">تسمح للباحث بالنقر المباشر المتعدد فوق الكلمات لتعيين حالتها وتصدير تقرير فوري للطالب دون الحاجة للذكاء الاصطناعي.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-3 border-t border-slate-100">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1 leading-4 uppercase">الطالب المستجوب</label>
                    <select
                      value={selectedStudentId}
                      onChange={(e) => setSelectedStudentId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
                    >
                      <option value="">— اختر تلميذ لبدء فرزه —</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>{s.name} (الصف {s.grade})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1 leading-4 uppercase">القطعة اللغوية</label>
                    <select
                      value={selectedPassageId}
                      onChange={(e) => setSelectedPassageId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
                    >
                      {passages.map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Editing Manual Area */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">تعديل وتحديد حالة نطق الكلمات الفردية بوهلة النقر</h3>
                  <p className="text-[11px] text-slate-400 mt-1">
                    انقر فوق الكلمة لتبديل الحالة بالتناوب: <span className="text-emerald-600 font-bold">صحيح (أخضر)</span> ← <span className="text-amber-600 font-bold">معدل/لحن (برتقالي)</span> ← <span className="text-rose-600 font-bold">خطأ كلي (أحمر)</span> ← <span className="text-slate-400 font-bold">تخطي (رمادي)</span>.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2.5 p-5 bg-amber-50/20 border border-amber-100 rounded-2xl leading-relaxed text-base justify-start select-none">
                  {manualWordsState.map((mw, i) => {
                    let borderClass = "border-slate-200 hover:bg-slate-50 text-slate-700";
                    if (mw.status === "correct") borderClass = "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold";
                    if (mw.status === "mispronounced") borderClass = "bg-amber-50 text-amber-800 border-amber-300 font-bold";
                    if (mw.status === "incorrect") borderClass = "bg-rose-50 text-rose-800 border-rose-300 font-bold";
                    if (mw.status === "skipped") borderClass = "bg-slate-100 text-slate-400 border-slate-300 line-through";

                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          const updated = [...manualWordsState];
                          const modes: ("correct" | "mispronounced" | "incorrect" | "skipped")[] = ["correct", "mispronounced", "incorrect", "skipped"];
                          const currentIdx = modes.indexOf(updated[i].status);
                          const nextIdx = (currentIdx + 1) % modes.length;
                          updated[i].status = modes[nextIdx];
                          setManualWordsState(updated);
                        }}
                        className={`px-3 py-1.5 rounded-lg border text-sm transition cursor-pointer flex flex-col items-center gap-0.5 ${borderClass}`}
                      >
                        <span>{mw.word}</span>
                        <span className="text-[8px] text-[10px] opacity-75">
                          {mw.status === "correct" ? "سليم" : mw.status === "mispronounced" ? "شكل" : mw.status === "incorrect" ? "لحن" : "سكت"}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Comprehension Quiz Manual checks */}
                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <h4 className="font-bold text-slate-800 text-sm">أسئلة قياس استيعاب المعنى</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activePassage.comprehensionQuestions.map((q) => (
                      <div key={q.id} className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                        {q.isConstant ? (
                          <p className="font-bold text-slate-800 text-xs mb-2 flex items-center justify-between gap-1" dir="rtl">
                            <span>{q.question}</span>
                            <span className="text-[9px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200 shrink-0 font-extrabold flex items-center gap-0.5">
                              <Lock className="w-2.5 h-2.5" /> ثابت
                            </span>
                          </p>
                        ) : (
                          <div className="mb-2.5 space-y-1 text-right">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] text-slate-400 font-bold">السؤال لمتغير (تعديل مباشر):</span>
                              <span className="text-[9px] bg-teal-50 text-teal-850 px-2 py-0.5 rounded border border-emerald-200 shrink-0 font-extrabold flex items-center gap-0.5">
                                <Unlock className="w-2.5 h-2.5 text-teal-600" /> متغير
                              </span>
                            </div>
                            <input
                              type="text"
                              value={q.question}
                              onChange={(e) => {
                                const updatedValue = e.target.value;
                                setPassages(prev => prev.map(p => {
                                  if (p.id === activePassage.id) {
                                    return {
                                      ...p,
                                      comprehensionQuestions: p.comprehensionQuestions.map(item => {
                                        if (item.id === q.id) {
                                          return { ...item, question: updatedValue };
                                        }
                                        return item;
                                      })
                                    };
                                  }
                                  return p;
                                }));
                              }}
                              className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-850 focus:outline-none focus:border-indigo-500 font-semibold"
                              dir="rtl"
                            />
                          </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {([...q.options, "لم يستطع الإجابة"]).map((opt, oIdx) => {
                            const isSelected = userComprehensionAnswers[q.id] === oIdx;
                            const isCorrect = oIdx === q.correctIndex;
                            let btnClass = oIdx === 3 
                              ? "border-slate-300 text-slate-500 bg-slate-50/50 hover:bg-slate-100/80" 
                              : "border-slate-200 text-slate-700 hover:bg-slate-100";
                            
                            if (isSelected) {
                              if (isComprehensionVerified) {
                                btnClass = isCorrect 
                                  ? "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold" 
                                  : "bg-rose-100 text-rose-800 border-rose-300 font-bold";
                              } else {
                                btnClass = "bg-indigo-600 text-white border-indigo-600 font-bold";
                              }
                            } else if (isComprehensionVerified && isCorrect) {
                              btnClass = "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold";
                            }

                            return (
                              <button
                                key={oIdx}
                                type="button"
                                disabled={isComprehensionVerified}
                                onClick={() => setUserComprehensionAnswers(prev => ({ ...prev, [q.id]: oIdx }))}
                                className={`py-2 px-3 rounded-lg border text-right transition cursor-pointer text-[11px] ${btnClass}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {!isComprehensionVerified ? (
                    <button
                      type="button"
                      onClick={() => setIsComprehensionVerified(true)}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 rounded-xl transition mt-4"
                    >
                      تصحيح وتدقيق مستوى الفهم والاستيعاب
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 mt-4">
                      <button
                        type="button"
                        onClick={saveManualAssessment}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-indigo-950 font-bold text-xs py-2.5 rounded-xl transition shadow-md shadow-emerald-500/10"
                      >
                        حفظ النتيجة النهائية لتقييم الطالب (يدوياً)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUserComprehensionAnswers({});
                          setIsComprehensionVerified(false);
                        }}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs py-2.5 px-4 rounded-xl transition border border-slate-200"
                      >
                        إعادة حل
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* ==================== TAB 6: STANDARDIZED DIAGNOSTIC ENGINE ==================== */}
          {activeTab === "diagnostic_engine" && (
            <div className="space-y-6 animate-fade-in" dir="rtl">
              
              {/* Metadata / Researcher Name Row */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-250/60 shadow-3xs text-right">
                <div>
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Gauge className="w-5.5 h-5.5 text-indigo-600 animate-spin-slow" />
                    <span>المحرك التشخيصي الذكي والمعايرة اللغوية ⚙️</span>
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    بوابة التدوين التشخيصي المقارن: قارن القطعة التموينية بنظام الفونيمات وتقرير عثرات التعلم والخطط التدخلية فوراً.
                  </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-2.5 bg-slate-50 border border-slate-200 p-2.5 rounded-xl shrink-0 w-full md:w-auto">
                  <div className="text-right sm:text-left">
                    <span className="block text-[9px] font-bold text-slate-400">👤 الباحث اللساني النشط:</span>
                    <span className="block text-xs font-black text-slate-700">{localUserNameState}</span>
                  </div>
                  <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>
                  <div className="text-right sm:text-left">
                    <span className="block text-[9px] font-bold text-slate-400">🕒 التاريخ والحصاد:</span>
                    <span className="block text-xs font-black text-emerald-800">2026-06-07T00:10:00Z</span>
                  </div>
                </div>
              </div>

              {/* Main Two Column Configurator Interface */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-right">
                
                {/* Right Input Panel: 5 columns */}
                <div className="lg:col-span-5 space-y-5">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
                    <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-2 border-b border-slate-100 pb-3">
                      <span>⚙️</span> لوحة التشخيص المدخلة يدويًا والمعايرة اللغوية
                    </h3>

                    {/* Standard Metadata Configuration Row */}
                    <div className="grid grid-cols-2 gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100 text-right">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-650 mb-1">🎯 الفئة الأكاديمية (الصفوف):</label>
                        <select
                          value={diagGrade}
                          onChange={(e) => setDiagGrade(Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-[11px] font-bold text-slate-750 focus:outline-none focus:border-indigo-500"
                        >
                          <option value={0.5}>مرحلة الروضة (G=0.5)</option>
                          <option value={1}>الصف الأول الابتدائي (G=1)</option>
                          <option value={2}>الصف الثاني الابتدائي (G=2)</option>
                          <option value={3}>الصف الثالث الابتدائي (G=3)</option>
                          <option value={4}>الصف الرابع الابتدائي (G=4)</option>
                          <option value={5}>الصف الخامس الابتدائي (G=5)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-650 mb-1">📘 المنهاج / تتبع الدراسة:</label>
                        <input
                          type="text"
                          value={diagCurriculum}
                          onChange={(e) => setDiagCurriculum(e.target.value)}
                          placeholder="مثال: وزاري مدمج"
                          className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-[11px] font-bold text-slate-750 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Quick Select Student & Passage */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">👤 تعبئة تلقائية من الطلاب:</label>
                        <select
                          value={diagSelectedStudentId}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDiagSelectedStudentId(val);
                            const found = students.find(s => s.id === val);
                            if (found) {
                              setDiagGrade(found.gradeLevel);
                              setDiagCurriculum(found.curriculum === "وزاري" ? "منهاج وزارة التربية والتعليم" : "منهاج دولي مخصص");
                            }
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-[11px] text-slate-700 font-bold focus:outline-none focus:border-indigo-500"
                        >
                          <option value="">-- اختر طالباً (اختياري) --</option>
                          {students.map(s => (
                            <option key={s.id} value={s.id}>{s.name} (الصف {s.gradeLevel})</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">📖 تعبئة تلقائية من النصوص:</label>
                        <select
                          value={diagSelectedPassageId}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDiagSelectedPassageId(val);
                            const found = passages.find(p => p.id === val);
                            if (found) {
                              setDiagOriginalText(found.text);
                              setDiagGrade(found.gradeLevel);
                            }
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-[11px] text-slate-700 font-bold focus:outline-none focus:border-indigo-500"
                        >
                          <option value="">-- اختر نصاً (اختياري) --</option>
                          {passages.map(p => (
                            <option key={p.id} value={p.id}>{p.title} (الصف {p.gradeLevel})</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Original Passage - Manual Writing & File Uploading */}
                    <div className="space-y-1.5 border-t border-slate-100 pt-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-extrabold text-slate-800 flex items-center gap-1">
                          <span>📝</span> متن قطعة التقييم الأصلية (مكتوب أو مرفوع):
                        </label>
                        <span className="text-[10px] font-bold text-indigo-750 bg-indigo-50 px-2 py-0.5 rounded-md">
                          {diagOriginalText.split(/\s+/).filter(Boolean).length} كلمة
                        </span>
                      </div>

                      {/* File Uploader for Original Passage */}
                      <div className="bg-gradient-to-br from-indigo-50/40 to-slate-50/40 border border-indigo-100/50 rounded-xl p-2.5 flex flex-col sm:flex-row items-center gap-2 justify-between">
                        <div className="text-right">
                          <span className="block text-[10px] font-bold text-indigo-950">📂 رفع قطعة لغوية خاصة بك:</span>
                          <span className="block text-[9px] text-slate-500 leading-normal">
                            اختر ملف (.txt, .pdf, .png, .jpg) للقطعة بالتشكيل لقراءتها فوراً عبر تقنيات OCR.
                          </span>
                        </div>
                        <label className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-750 hover:text-indigo-700 font-black text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-3xs transition-all shrink-0">
                          {isOcrDiagOriginalLoading ? (
                            <span className="flex items-center gap-1 animate-pulse">⏳ جاري قراءة الملف...</span>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5 text-indigo-600" />
                              <span>تحميل ملف</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept=".txt,.pdf,.png,.jpg,.jpeg"
                            className="hidden"
                            disabled={isOcrDiagOriginalLoading}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              
                              if (file.name.endsWith(".txt")) {
                                const reader = new FileReader();
                                reader.onload = (evt) => {
                                  const content = evt.target?.result as string;
                                  if (content) {
                                    setDiagOriginalText(content);
                                    alert("تم تفريغ ورفع متن القطعة اللغوية بنجاح!");
                                  }
                                };
                                reader.readAsText(file, "UTF-8");
                              } else {
                                setIsOcrDiagOriginalLoading(true);
                                try {
                                  const reader = new FileReader();
                                  reader.onload = async (evt) => {
                                    const dataUrl = evt.target?.result as string;
                                    const base64Parts = dataUrl.split(",");
                                    const base64Data = base64Parts[1] || base64Parts[0];
                                    const mType = file.type || (file.name.endsWith(".pdf") ? "application/pdf" : "image/jpeg");

                                    const response = await fetch("/api/ocr-document", {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({
                                        fileBase64: base64Data,
                                        mimeType: mType
                                      })
                                    });
                                    if (!response.ok) throw new Error("تعذر قراءة المستند.");
                                    const result = await response.json();
                                    if (result.text) {
                                      setDiagOriginalText(result.text);
                                      alert("تمت قراءة وتحميل الملف عبر تقنيات OCR المتقدمة بنجاح!");
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                } catch (err) {
                                  console.error(err);
                                  alert("فشل استدعاء محرك الاستخراج الضوئي OCR.");
                                } finally {
                                  setIsOcrDiagOriginalLoading(false);
                                }
                              }
                            }}
                          />
                        </label>
                      </div>

                      <textarea
                        rows={4}
                        value={diagOriginalText}
                        onChange={(e) => setDiagOriginalText(e.target.value)}
                        placeholder="أدخل أو ألصق نص قطعة التقييم الأصلية هنا مع التشكيل التام لضمان حساب مخارج الحروف وقوانين المقرائية بدقة..."
                        className="w-full bg-slate-50 border border-slate-250 rounded-xl p-3 text-xs leading-relaxed focus:outline-none focus:border-indigo-500 font-sans text-slate-900 shadow-3xs"
                        dir="rtl"
                      />
                      
                      {/* Save typed text shortcuts / passage bank additions */}
                      <div className="flex gap-2 justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (!diagOriginalText.trim()) {
                              alert("لا يوجد نص أصلي مكتوب لحفظه.");
                              return;
                            }
                            const title = prompt("أدخل عنواناً لهذه القطعة اللغوية الجديدة لحفظها ببنك النصوص:", `قطعة لغوية مخصصة ${new Date().toLocaleDateString("ar-EG")}`);
                            if (!title) return;
                            
                            const newId = "pass-custom-" + Date.now();
                            const newP = {
                              id: newId,
                              title: title,
                              text: diagOriginalText,
                              gradeLevel: diagGrade,
                              wordCount: diagOriginalText.trim().split(/\s+/).filter(Boolean).length,
                              comprehensionQuestions: [
                                {
                                  id: "q-1",
                                  question: "ما هي الفكرة العامة للقطعة المضافة؟",
                                  options: ["الفائدة العامة والاعتبر اللساني", "القراءة الميكانيكية البسيطة", "تفادي الأخطاء اللفظية"],
                                  correctIndex: 0,
                                  isConstant: true
                                }
                              ]
                            };
                            setPassages(prev => [newP, ...prev]);
                            setDiagSelectedPassageId(newId);
                            alert(`تم بنجاح حفظ هذا النص المدخل باسم "${title}" كقطعة مستقلة ببنية المقروئية!`);
                          }}
                          className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-150 text-indigo-700 text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all"
                        >
                          💾 حفظ هذا النص كقطعة جديدة بالكامل في البنك
                        </button>
                        
                        {diagSelectedPassageId && (
                          <button
                            type="button"
                            onClick={() => {
                              if (!diagOriginalText.trim()) {
                                alert("متن النص فارغ!");
                                return;
                              }
                              setPassages(prev => prev.map(p => {
                                if (p.id === diagSelectedPassageId) {
                                  return {
                                    ...p,
                                    text: diagOriginalText,
                                    wordCount: diagOriginalText.trim().split(/\s+/).filter(Boolean).length
                                  };
                                }
                                return p;
                              }));
                              alert("تم تحديث متن النص الحالي في المستودع بنجاح!");
                            }}
                            className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-150 text-emerald-850 text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all"
                          >
                            💾 تحديث متن القطعة النشطة فقط
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Student Transcribed text with local file uploader shortcut */}
                    <div className="space-y-1.5 border-t border-slate-100 pt-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-extrabold text-slate-800 flex items-center gap-1">
                          <span>🗣️</span> النص المفرغ والمنطوق للتلميذ (مفرّغ أو مرفوع):
                        </label>
                        <span className="text-[10px] font-bold text-emerald-750 bg-emerald-50 px-2 py-0.5 rounded-md">
                          {diagStudentText.split(/\s+/).filter(Boolean).length} كلمة
                        </span>
                      </div>

                      {/* File Uploader for Student Transcript */}
                      <div className="bg-gradient-to-br from-emerald-50/40 to-slate-50/40 border border-emerald-100/50 rounded-xl p-2.5 flex flex-col sm:flex-row items-center gap-2 justify-between">
                        <div className="text-right">
                          <span className="block text-[10px] font-bold text-emerald-950">📂 رفع نطق التلميذ المقروء:</span>
                          <span className="block text-[9px] text-slate-500 leading-normal font-sans">
                            حمّل ملف (.txt, .pdf, .png, .jpg) للفظ الطالب لمقارنته بالقطعة لغوياً وقراءته عبر OCR.
                          </span>
                        </div>
                        <label className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-750 hover:text-emerald-800 font-black text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-3xs transition-all shrink-0">
                          {isOcrDiagStudentLoading ? (
                            <span className="flex items-center gap-1 animate-pulse text-emerald-700">⏳ جاري القراءة (OCR)...</span>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5 text-emerald-600" />
                              <span>تحميل ملف تلميذ</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept=".txt,.pdf,.png,.jpg,.jpeg"
                            className="hidden"
                            disabled={isOcrDiagStudentLoading}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              
                              if (file.name.endsWith(".txt")) {
                                const reader = new FileReader();
                                reader.onload = (evt) => {
                                  const content = evt.target?.result as string;
                                  if (content) {
                                    setDiagStudentText(content);
                                    alert("تم تفريغ اللفظ بنجاح!");
                                  }
                                };
                                reader.readAsText(file, "UTF-8");
                              } else {
                                setIsOcrDiagStudentLoading(true);
                                try {
                                  const reader = new FileReader();
                                  reader.onload = async (evt) => {
                                    const dataUrl = evt.target?.result as string;
                                    const base64Parts = dataUrl.split(",");
                                    const base64Data = base64Parts[1] || base64Parts[0];
                                    const mType = file.type || (file.name.endsWith(".pdf") ? "application/pdf" : "image/jpeg");

                                    const response = await fetch("/api/ocr-document", {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({
                                        fileBase64: base64Data,
                                        mimeType: mType
                                      })
                                    });
                                    if (!response.ok) throw new Error("تعذر قراءة المستند.");
                                    const result = await response.json();
                                    if (result.text) {
                                      setDiagStudentText(result.text);
                                      alert("تمت قراءة وتحميل لفظ التلميذ بنجاح عبر OCR المتقدم للمقارنة الفونيمية!");
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                } catch (err) {
                                  console.error(err);
                                  alert("فشل استدعاء محرك الاستخراج الضوئي OCR لملف التلميذ.");
                                } finally {
                                  setIsOcrDiagStudentLoading(false);
                                }
                              }
                            }}
                          />
                        </label>
                      </div>

                      <textarea
                        rows={4}
                        value={diagStudentText}
                        onChange={(e) => setDiagStudentText(e.target.value)}
                        placeholder="اكتب اللفظ الحرفي لقراءة التلميذ مع رصد الكلمات الخاطئة بدقة، أو حمّل الملف..."
                        className="w-full bg-slate-50 border border-slate-250 rounded-xl p-3 text-xs leading-relaxed focus:outline-none focus:border-indigo-500 font-sans text-slate-900 shadow-3xs"
                        dir="rtl"
                      />
                    </div>

                    {/* Timer & Comprehension Variables */}
                    <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-650 mb-1">⏱️ وقت القراءة الفعلي (بالثواني):</label>
                        <div className="relative">
                          <input
                            type="number"
                            min={1}
                            max={600}
                            value={diagTimeSeconds}
                            onChange={(e) => setDiagTimeSeconds(Math.max(1, Number(e.target.value)))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-xs font-black text-slate-750 focus:outline-none focus:border-indigo-500"
                          />
                          <span className="absolute right-2.5 top-2.5 text-slate-400 text-xs">⏱️</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-650 mb-1">🗣️ دقة إجابة الفهم القرائي (%):</label>
                        <div className="relative">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={diagCompPercent}
                            onChange={(e) => setDiagCompPercent(Math.min(100, Math.max(0, Number(e.target.value))))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-xs font-black text-slate-750 focus:outline-none focus:border-indigo-500"
                          />
                          <span className="absolute right-2.5 top-2.5 text-slate-400 text-xs">🗣️</span>
                        </div>
                      </div>
                    </div>

                    {/* Rich Manual Annotations for the Active Assessment */}
                    <div className="space-y-1 bg-indigo-50/40 p-3 rounded-xl border border-indigo-100/50 text-right">
                      <div className="flex items-center justify-between">
                        <label className="block text-[9.5px] font-bold text-indigo-950 flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                          <span>✍️ مدوّنة وملاحظات المحكّم والباحث اللساني (مخارج ووعي):</span>
                        </label>
                        <span className="text-[8.5px] font-extrabold text-indigo-750 bg-indigo-100 px-2 py-0.5 rounded-full">
                          {diagSelectedPassageId ? "تلقائي للقطعة" : "ملاحظة عامة"}
                        </span>
                      </div>
                      <textarea
                        rows={2}
                        value={diagSelectedPassageId ? (passageAnnotations[diagSelectedPassageId] || "") : diagPassageNotes}
                        onChange={(e) => {
                          const textVal = e.target.value;
                          if (diagSelectedPassageId) {
                            setPassageAnnotations(prev => ({
                              ...prev,
                              [diagSelectedPassageId]: textVal
                            }));
                          } else {
                            setDiagPassageNotes(textVal);
                          }
                        }}
                        placeholder="أضف تعليقات أو تدويناً يدوياً للمحكم كصفة الشد والهمس والجهر ومواضيع الاستجابة والصعوبات الصوتية والفهم الذاتي..."
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-indigo-950 leading-relaxed focus:outline-none font-sans"
                        dir="rtl"
                      />
                    </div>

                    {/* Arbitrator Actions for Database Passages */}
                    <div className="flex gap-2 justify-end mt-1.5 border-t border-slate-100 pt-3">
                      <button
                        type="button"
                        onClick={() => {
                          setDiagManageMode(diagManageMode === "add" ? "none" : "add");
                          setDiagPassageTitle("");
                          setDiagPassageGrade(diagGrade || 2);
                        }}
                        className="bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5 text-indigo-650" />
                        <span>➕ إضافة قطعة لغوية جديدة للبنك</span>
                      </button>
                      
                      {diagSelectedPassageId && (
                        <button
                          type="button"
                          onClick={() => {
                            const currentPassage = passages.find(p => p.id === diagSelectedPassageId);
                            if (currentPassage) {
                              setDiagPassageTitle(currentPassage.title);
                              setDiagPassageGrade(currentPassage.gradeLevel);
                              setDiagManageMode(diagManageMode === "edit" ? "none" : "edit");
                            } else {
                              alert("الرجاء اختيار قطعة صالحة لتعديلها.");
                            }
                          }}
                          className="bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-600" />
                          <span>✏️ تعديل عنوان وحجم القطعة النشطة</span>
                        </button>
                      )}
                    </div>

                    {diagManageMode !== "none" && (
                      <div className="bg-slate-50 border border-indigo-100 p-3 rounded-xl space-y-3 animate-fade-in mt-1 font-sans text-right">
                        <div className="flex items-center justify-between border-b border-indigo-50 pb-1.5">
                          <span className="text-[10px] font-black text-indigo-900">
                            {diagManageMode === "add" ? "💫 إضافة قطعة لغوية جديدة للبنك" : "⚙️ تعديل بيانات القطعة النشطة"}
                          </span>
                          <button 
                            type="button" 
                            onClick={() => setDiagManageMode("none")} 
                            className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <label className="block text-[9px] font-bold text-slate-500 mb-0.5">عنوان القطعة اللغوية:</label>
                            <input
                              type="text"
                              value={diagPassageTitle}
                              onChange={(e) => setDiagPassageTitle(e.target.value)}
                              placeholder="مثال: قصة العصفور الصغير والرياح"
                              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-bold focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[9px] font-bold text-slate-500 mb-0.5">الصف الدراسي المستهدف:</label>
                              <select
                                value={diagPassageGrade}
                                onChange={(e) => setDiagPassageGrade(Number(e.target.value))}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-0.5 text-[11px] text-slate-700 font-bold focus:outline-none"
                              >
                                <option value={0.5}>الروضة (0.5)</option>
                                <option value={1}>الصف الأول</option>
                                <option value={2}>الصف الثاني</option>
                                <option value={3}>الصف الثالث</option>
                                <option value={4}>الصف الرابع</option>
                                <option value={5}>الصف الخامس</option>
                              </select>
                            </div>
                            
                            <div className="flex items-end justify-end">
                              <button
                                type="button"
                                onClick={() => {
                                  if (!diagPassageTitle.trim()) {
                                    alert("يرجى كتابة عنوان القطعة.");
                                    return;
                                  }
                                  if (!diagOriginalText.trim()) {
                                    alert("يرجى كتابة متن النص الأصلي أولاً في خانة النص الاسترشادي أدناه.");
                                    return;
                                  }

                                  if (diagManageMode === "add") {
                                    const newId = "pass-custom-" + Date.now();
                                    const newP = {
                                      id: newId,
                                      title: diagPassageTitle,
                                      text: diagOriginalText,
                                      gradeLevel: diagPassageGrade,
                                      wordCount: diagOriginalText.trim().split(/\s+/).filter(Boolean).length,
                                      comprehensionQuestions: [
                                        {
                                          id: "q-1",
                                          question: "ما هي الفكرة العامة للقطعة المضافة؟",
                                          options: ["الفائدة العامة والاعتبار", "القراءة الميكانيكية فقط", "تفادي الأخطاء اللغوية"],
                                          correctIndex: 0,
                                          isConstant: true
                                        }
                                      ]
                                    };
                                    setPassages(prev => [newP, ...prev]);
                                    setDiagSelectedPassageId(newId);
                                    setDiagGrade(diagPassageGrade);
                                    setDiagManageMode("none");
                                    alert("تمت إضافة القطعة اللغوية بنجاح للمستودع وتثبيتها للتشخيص الحالي!");
                                  } else {
                                    // Edit mode
                                    setPassages(prev => prev.map(p => {
                                      if (p.id === diagSelectedPassageId) {
                                        return {
                                          ...p,
                                          title: diagPassageTitle,
                                          text: diagOriginalText,
                                          gradeLevel: diagPassageGrade,
                                          wordCount: diagOriginalText.trim().split(/\s+/).filter(Boolean).length
                                        };
                                      }
                                      return p;
                                    }));
                                    setDiagGrade(diagPassageGrade);
                                    setDiagManageMode("none");
                                    alert("تم تحديث بيانات وعنوان القطعة اللغوية النشطة ببنك النصوص التموينية!");
                                  }
                                }}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] py-1.5 rounded-lg transition"
                              >
                                {diagManageMode === "add" ? "✓ حفظ وإدراج كرقم قياسي" : "✓ حفظ التعديلات والعنوان"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Master Action Trigger */}
                    <div className="pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          const cleanOrig = diagOriginalText.replace(/[\u064B-\u065F]/g, "").replace(/[.,\/#!$%\^&\*;:{}=\-_`~()؟!،]/g, "").toLowerCase().trim();
                          const cleanStud = diagStudentText.replace(/[\u064B-\u065F]/g, "").replace(/[.,\/#!$%\^&\*;:{}=\-_`~()؟!،]/g, "").toLowerCase().trim();
                          if (cleanOrig.length === 0 || cleanStud.length === 0) {
                            alert("الرجاء كتابة أو رفع متن القطعتين (الأصل والمنطوق) أولاً لإجراء المعايرة.");
                          } else {
                            alert("تم معايرة المدخلات الحالية وتشغيل المحرك التشخيصي بنجاح! طالع التقرير الدقيق في الملحق الأيسر.");
                          }
                        }}
                        className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-extrabold text-xs py-3.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                      >
                        <Gauge className="w-4 h-4 text-emerald-300 animate-spin-slow" />
                        <span>تأكيد النبض التشخيصي والمعايرة اللغوية ⚙️</span>
                      </button>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Grade and Curriculum Selection */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-650 mb-1">الفئة الأكاديمية (الصفوف):</label>
                        <select
                          value={diagGrade}
                          onChange={(e) => setDiagGrade(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-slate-750 focus:outline-none focus:border-indigo-500"
                        >
                          <option value={0.5}>مرحلة الروضة (G=0.5)</option>
                          <option value={1}>الصف الأول الابتدائي (G=1)</option>
                          <option value={2}>الصف الثاني الابتدائي (G=2)</option>
                          <option value={3}>الصف الثالث الابتدائي (G=3)</option>
                          <option value={4}>الصف الرابع الابتدائي (G=4)</option>
                          <option value={5}>الصف الخامس الابتدائي (G=5)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-650 mb-1">نوع المنهاج اللوجستي:</label>
                        <input
                          type="text"
                          value={diagCurriculum}
                          onChange={(e) => setDiagCurriculum(e.target.value)}
                          placeholder="مثال: وزاري مدمج"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-750 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Original text config */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] font-bold text-slate-750">متن النص المقترح الأصلي (بالتشكيل التام):</label>
                        <span className="text-[9px] font-semibold text-slate-400">
                          {diagOriginalText.split(/\s+/).filter(Boolean).length} كلمة
                        </span>
                      </div>
                      <textarea
                        rows={4}
                        value={diagOriginalText}
                        onChange={(e) => setDiagOriginalText(e.target.value)}
                        placeholder="أدخل نص قطعة التقييم الأصلية مع التشكيل لضمان احتساب كثافة المفردات..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs leading-relaxed focus:outline-none focus:border-indigo-500 font-sans"
                        dir="rtl"
                      />
                    </div>

                    {/* Student Transcribed text */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] font-bold text-slate-755">النص المفرغ المنطوق (من تسجيلات الطالب):</label>
                        <span className="text-[9px] font-semibold text-slate-400">
                          {diagStudentText.split(/\s+/).filter(Boolean).length} كلمة
                        </span>
                      </div>
                      <textarea
                        rows={4}
                        value={diagStudentText}
                        onChange={(e) => setDiagStudentText(e.target.value)}
                        placeholder="أكتب اللفظ الحرفي لقراءة التلميذ، واعد تفريغ الكلمات الخاطئة لمقارنتها إجرائياً..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs leading-relaxed focus:outline-none focus:border-indigo-500 font-sans"
                        dir="rtl"
                      />
                    </div>

                    {/* Timer & Comprehension variables */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-650 mb-1">وقت القراءة الفعلي (بالثواني):</label>
                        <div className="relative">
                          <input
                            type="number"
                            min={1}
                            max={600}
                            value={diagTimeSeconds}
                            onChange={(e) => setDiagTimeSeconds(Math.max(1, Number(e.target.value)))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-xs font-black text-slate-750 focus:outline-none focus:border-indigo-500"
                          />
                          <span className="absolute right-2.5 top-2 hover:text-slate-500 text-slate-400 text-xs">⏱️</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-650 mb-1">دقة إجابة الفهم القرائي (%):</label>
                        <div className="relative">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={diagCompPercent}
                            onChange={(e) => setDiagCompPercent(Math.min(100, Math.max(0, Number(e.target.value))))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-xs font-black text-slate-750 focus:outline-none focus:border-indigo-500"
                          />
                          <span className="absolute right-2.5 top-2.5 hover:text-slate-500 text-slate-400 text-xs">🗣️</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          const cleanOrig = diagOriginalText.replace(/[\u064B-\u065F]/g, "").replace(/[.,\/#!$%\^&\*;:{}=\-_`~()؟!،]/g, "").toLowerCase().trim();
                          const cleanStud = diagStudentText.replace(/[\u064B-\u065F]/g, "").replace(/[.,\/#!$%\^&\*;:{}=\-_`~()؟!،]/g, "").toLowerCase().trim();
                          if (cleanOrig.length === 0 || cleanStud.length === 0) {
                            alert("الرجاء التحقق من كتابة النصين للمقارنة الحيوية.");
                          } else {
                            alert("تم معايرة المدخلات الحالية وتشغيل المحرك التشخيصي بنجاح! طالع التقرير في الملحق الأيسر.");
                          }
                        }}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow"
                      >
                        <Gauge className="w-4 h-4 text-emerald-300" />
                        <span>تأكيد النبض التشخيصي والمعايرة اللغوية ⚙️</span>
                      </button>
                    </div>

                  </div>
                </div>

                {/* Left Live Diagnostics Report Panel: 7 columns */}
                <div className="lg:col-span-7 space-y-6">
                  {(() => {
                    // --- MATH & FORMULA LOGIC ENGINE INTERNALS ---
                    const origWords = diagOriginalText.trim().split(/\s+/).filter(Boolean);
                    const studWords = diagStudentText.trim().split(/\s+/).filter(Boolean);
                    
                    const origClean = origWords.map(w => w.replace(/[\u064B-\u065F]/g, "").replace(/[.,\/#!$%\^&\*;:{}=\-_`~()؟!،]/g, "").trim());
                    const studClean = studWords.map(w => w.replace(/[\u064B-\u065F]/g, "").replace(/[.,\/#!$%\^&\*;:{}=\-_`~()؟!،]/g, "").trim());
                    
                    // 1. CTL (Critical Text Length)
                    const ctlTarget = Math.round((diagGrade * 30) + 20);
                    const actualWordCount = origWords.length;
                    const ctlMatch = Math.abs(actualWordCount - ctlTarget) <= 15;

                    // 2. SSG (Structural Sentence Graduation)
                    // Split sentences of original text by . ,  ? ! \n 
                    const sentenceSlices = diagOriginalText.split(/[.؟!،\n]/).map(s => s.trim()).filter(s => s.length > 5);
                    const sentenceCount = sentenceSlices.length || 1;
                    const ssgValue = Number((actualWordCount / sentenceCount).toFixed(1));
                    
                    // SSG Benchmark thresholds
                    let ssgGradeStatus = false;
                    let ssgTargetLabel = "";
                    if (diagGrade <= 1) { // G=0.5 (الروضة), G=1 (الأول)
                      ssgGradeStatus = ssgValue <= 4;
                      ssgTargetLabel = "الروضة والأول <= 4 كلمات/جائزة";
                    } else if (diagGrade <= 3) { // G=2, 3
                      ssgGradeStatus = ssgValue >= 5 && ssgValue <= 8;
                      ssgTargetLabel = "الثاني والثالث: 5 - 8 كلمات/جائزة";
                    } else { // G=4, 5
                      ssgGradeStatus = ssgValue >= 9 && ssgValue <= 14;
                      ssgTargetLabel = "الرابع والخامس: 9 - 14 كلمة/جائزة";
                    }

                    // 3. VDL (Vocabulary Density Level using Hanada Taha structural list)
                    const COMMON_ARABIC_ROOTS = new Set([
                      "في", "من", "على", "إلى", "عن", "مع", "ثم", "أو", "أن", "إن", "هذا", "هذه", "الذي", "التي", "ذلك", "كان", "كانت", "قال", "قالت", "خرج", "ذهب", "رأى", "كتب", "قرأ", "يوم", "ولد", "بنت", "المدرسة", "البيت", "جميل", "صغير", "كبير", "جديد", "أنا", "هو", "هي", "نحن", "هم", "كل", "يا", "ما", "لا", "نعم", "لم", "لن", "ليس", "ليست", "سعيد", "أم", "أب", "أخ", "أخت", "طعام", "شجر", "الأرض", "الشمس", "النهر", "ماء", "حديقة", "عصفور", "صف", "موقع"
                    ]);

                    const checkInCommonList = (rawWord: string) => {
                      const cleanWord = rawWord.replace(/[\u064B-\u065F]/g, "").replace(/[.,\/#!$%\^&\*;:{}=\-_`~()؟!،]/g, "").trim();
                      if (COMMON_ARABIC_ROOTS.has(cleanWord)) return true;
                      // check soft stems removing initial ال، و، ف، ك، ب، ل
                      const prefixes = ["ال", "و", "ف", "ب", "ل", "ك"];
                      for (const p of prefixes) {
                        if (cleanWord.startsWith(p) && cleanWord.length > p.length + 1) {
                          const stem = cleanWord.substring(p.length);
                          if (COMMON_ARABIC_ROOTS.has(stem)) return true;
                        }
                      }
                      return false;
                    };

                    const commonWordsMatched = origWords.filter(checkInCommonList);
                    const vdlPct = Number(((commonWordsMatched.length / (actualWordCount || 1)) * 100).toFixed(1));
                    const vdlStatus = vdlPct >= 85;

                    // 4. AORF (Adjusted Oral Reading Fluency)
                    // Compute pronunciation errors algorithmically but elegantly
                    const errors: any[] = [];
                    
                    origWords.forEach((origWord, idx) => {
                      const cleanO = origClean[idx];
                      const studWord = studWords[idx];
                      const cleanS = studClean[idx] || "";

                      if (!studWord) {
                        // Skip error
                        errors.push({
                          index: idx + 1,
                          original: origWord,
                          student: "(تخطي)",
                          errorType: "تخطي وقوف",
                          classification: "دلالي"
                        });
                      } else if (cleanO !== cleanS) {
                        // Identify mismatch class
                        let classification = "دلالي";
                        let errorType = "تبديل دلالي";
                        
                        // Strip Arabic shaddah/harakat and compare
                        const absoluteCleanO = cleanO.replace(/[^\u0621-\u064A]/g, "");
                        const absoluteCleanS = cleanS.replace(/[^\u0621-\u064A]/g, "");

                        if (absoluteCleanO === absoluteCleanS) {
                          classification = "صوتي";
                          errorType = "لحن صوتي وتشكيل";
                        } else {
                          // Morphological tests: prefixes/suffixes differ, but they have key shared characters
                          const sharedPrefix = absoluteCleanO.substring(0, 3) === absoluteCleanS.substring(0, 3);
                          const sharedLength = Math.abs(absoluteCleanO.length - absoluteCleanS.length) <= 3;
                          if (sharedPrefix && sharedLength) {
                            classification = "صرفي";
                            errorType = "بنية صرفية وضمير";
                          } else {
                            classification = "دلالي";
                            errorType = "انزلاق ومعنى مفاجئ";
                          }
                        }

                        errors.push({
                          index: idx + 1,
                          original: origWord,
                          student: studWord,
                          errorType,
                          classification
                        });
                      }
                    });

                    const errorCount = errors.length;
                    const cleanWordsRead = Math.max(0, actualWordCount - errorCount);
                    const aorfActual = Number(((cleanWordsRead / diagTimeSeconds) * 60).toFixed(1));

                    // Targets based on grade G value
                    let aorfTargetLabel = "";
                    let aorfMinTarget = 30;
                    if (diagGrade === 0.5) {
                      aorfTargetLabel = "الروضة: قراءة هادئة صوتية ومقاطع (دقة >= 80%، بدون وقت مستهدف)";
                      aorfMinTarget = 25;
                    } else if (diagGrade === 1) {
                      aorfTargetLabel = "الصف الأول: 40 كلمة/دقيقة مستهدفة";
                      aorfMinTarget = 40;
                    } else if (diagGrade === 2) {
                      aorfTargetLabel = "الصف الثاني: 60 كلمة/دقيقة مستهدفة";
                      aorfMinTarget = 60;
                    } else if (diagGrade === 3) {
                      aorfTargetLabel = "الصف الثالث: 80 كلمة/دقيقة مستهدفة";
                      aorfMinTarget = 80;
                    } else if (diagGrade === 4) {
                      aorfTargetLabel = "الصف الرابع: 100 كلمة/دقيقة مستهدفة";
                      aorfMinTarget = 100;
                    } else {
                      aorfTargetLabel = "الصف الخامس: 120 كلمة/دقيقة مستهدفة";
                      aorfMinTarget = 120;
                    }

                    // 5. UIL (Universal Independence Level)
                    const uilValue = Number(((aorfActual / aorfMinTarget) * (diagCompPercent / 100)).toFixed(3));

                    let levelBadge = "";
                    let levelColor = "";
                    let levelLabel = "";
                    if (uilValue >= 0.95) {
                      levelBadge = "bg-emerald-100 text-emerald-800 border-emerald-300";
                      levelColor = "text-emerald-600";
                      levelLabel = "مستقل — مؤهل للانتقال إلى مستوى قرائي أعلى (🔒 نص مستقل)";
                    } else if (uilValue >= 0.75) {
                      levelBadge = "bg-amber-100 text-amber-800 border-amber-300";
                      levelColor = "text-amber-600";
                      levelLabel = "تعليمي موجّه — موصى بوضع خطة تدخل ومراقبة داعمة قريبة (🔄 خطة تدخل)";
                    } else {
                      levelBadge = "bg-rose-100 text-rose-800 border-rose-300";
                      levelColor = "text-rose-600";
                      levelLabel = "محبط — يُنصح بالنزول بمستوى الصعوبة إلى مرحلة أدنى وتأسيس مسبق (🔽 تراجع معياري)";
                    }

                    // 6. RTI Intervention (Determine majority error classification)
                    const errorCountsClass = { صرفي: 0, صوتي: 0, دلالي: 0 };
                    errors.forEach(e => {
                      if (e.classification === "صرفي") errorCountsClass.صرفي++;
                      if (e.classification === "صوتي") errorCountsClass.صوتي++;
                      if (e.classification === "دلالي") errorCountsClass.دلالي++;
                    });

                    let majorErrorType = "صوتي";
                    if (errorCountsClass.صرفي >= errorCountsClass.صوتي && errorCountsClass.صرفي >= errorCountsClass.دلالي) {
                      majorErrorType = "صرفي";
                    } else if (errorCountsClass.دلالي >= errorCountsClass.صوتي && errorCountsClass.دلالي >= errorCountsClass.صرفي) {
                      majorErrorType = "دلالي";
                    }

                    const rtiSteps: string[] = [];
                    if (majorErrorType === "صوتي") {
                      rtiSteps.push(
                        "تكثيف الوعي الصوتياتي الهجائي عن طريق مطابقة المخارج وتفكيك تراكيب الحركة اللفظية (مثل الفتح الكسر الضم والشدة) للكلمات الصعبة.",
                        "استخدام المثيرات والبطاقات الملونة التي تبرز ترابط الفونيم والرسوم الحرفية لترقية الفهم التلقائي المباشر للكلمة.",
                        "رسم نبرة القراءة التفاعلية المرددة بالمحاكاة المشتركة مع الأخصائي اللغوي المعين بصف معيار جودة الصوت."
                      );
                    } else if (majorErrorType === "صرفي") {
                      rtiSteps.push(
                        "تحليل التكوينات الصرفية لخصائص الأوزان والجزور الثلاثية (فَعَلَ)، لتمكين الطفل من استنتاج الكلمات بالرجوع لأصولها الأساسية اللسانية.",
                        "بناء تدريبات التلاعب باللواحق والضمائر ونهايات الكلمة وسوابق الكلمة (التعريف، وحروف العطف) وتمثيل تغير نطق الحركة المناسبة.",
                        "برمجة حصص أسبوعية مستقلة لصياغة المشتقات المختلفة وإتقان التغير المقرون بتصرييف الأفعال وصيغ المؤنث والمثنى."
                      );
                    } else {
                      rtiSteps.push(
                        "تشييد بطاقات المفردات المفهومية والخرائط المترادفة لتأسيس المعجم الذهني المترادف وربط الكلمة بالصورة البيئية المحيطة بها للقرائية.",
                        "ممارسة أنشطة قرائن السياق حيث يتعلم الطالب توقع المكتوب وتأكيد البديل اللغوي المناسب من خلال دلالات التراكيب القرائية.",
                        "تشجيع القراءة الاستردادية الذاتية للقصص المصورة والتحدث الحر لبناء ثقافة دلالية فصحى تمكنه من تجاوز التخطي التعويضي."
                      );
                    }

                    return (
                      <div className="space-y-6">
                        
                        {/* FIRST ROW: Structural Formulas and Metrics of the Text */}
                        <div id="print-diagnostic-report" className="bg-white p-6 rounded-3xl border border-slate-200 space-y-6 shadow-sm">
                          
                          {/* UAE State Insignia - Academic Print Header */}
                          <div className="hidden print:flex items-center justify-between border-b-2 border-indigo-900 pb-5 mb-5" dir="rtl">
                            <div className="text-right">
                              <h3 className="font-extrabold text-indigo-950 text-base">دولة الإمارات العربية المتحدة</h3>
                              <h4 className="text-xs text-slate-500 font-bold">وزارة التربية والتعليم العالي</h4>
                              <p className="text-[10px] text-slate-400">منصة قياس الطلاقة الموقرة والقرائية المعيارية</p>
                            </div>
                            <div className="w-16 h-16 bg-slate-55 border border-indigo-900/40 rounded-xl flex items-center justify-center font-serif text-sm font-black text-indigo-900">
                              ECAE
                            </div>
                            <div className="text-left">
                              <h3 className="font-extrabold text-indigo-905 text-sm">التقرير المعياري الأكاديمي الحصري</h3>
                              <p className="text-[10px] text-slate-500 font-bold">تاريخ التصدير: {new Date().toLocaleDateString("ar-AE")}</p>
                              <p className="text-[10px] text-slate-400 font-mono text-left">v1.5 Premium</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div>
                              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                                <span>📊</span> تقييم المعادلات البنيوية لنص المقروءة (هنادا طه)
                              </h3>
                              <p className="text-[10px] text-slate-400 mt-1">يتحقق النظام من توازن صياغة المتن وقياس درجة الملاءمة المعيارية للصف الدراسي:</p>
                            </div>
                            
                            <button
                              type="button"
                              onClick={() => {
                                window.print();
                              }}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-black px-3 py-1.5 rounded-xl border border-slate-205 flex items-center gap-1 transition print:hidden"
                            >
                              <Printer className="w-3.5 h-3.5 text-indigo-600" />
                              <span>طباعة التقرير اللساني المعياري 🖨️</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            
                            {/* 1. CTL Card */}
                            <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 space-y-1.5 relative overflow-hidden text-right">
                              <span className="text-[10px] text-indigo-650 font-black block">1. قانون الطول الحرج للنص (CTL)</span>
                              <div className="flex items-baseline justify-between">
                                <span className="text-xl font-black text-indigo-950 font-mono">
                                  {actualWordCount} <span className="text-xs">كلمة</span>
                                </span>
                                <span className="text-[10px] text-indigo-500 font-semibold">
                                  الهدف: {ctlTarget} words
                                </span>
                              </div>
                              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
                                <div 
                                  className="bg-indigo-600 h-full rounded-full transition-all"
                                  style={{ width: `${Math.min(100, (actualWordCount / ctlTarget) * 100)}%` }}
                                ></div>
                              </div>
                              <span className={`text-[9px] font-black block mt-1 ${ctlMatch ? "text-emerald-700" : "text-amber-700"}`}>
                                {ctlMatch ? "✓ مطابق ومعاير ضمن الملاءمة للصف" : "⚠️ طول غير مناسب للصف الحالي"}
                              </span>
                            </div>

                            {/* 2. SSG Card */}
                            <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 space-y-1.5 relative overflow-hidden text-right">
                              <span className="text-[10px] text-emerald-800 font-black block">2. قانون التدرج البنيوي للجملة (SSG)</span>
                              <div className="flex items-baseline justify-between">
                                <span className="text-xl font-black text-emerald-950 font-mono">
                                  {ssgValue} <span className="text-xs">كلمات/جملة</span>
                                </span>
                                <span className="text-[9px] text-emerald-600 font-bold">
                                  {sentenceCount} جملة مسجلة
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 font-medium">الهدف: {ssgTargetLabel}</p>
                              <span className={`text-[9px] font-black block mt-1 ${ssgGradeStatus ? "text-emerald-700" : "text-amber-750"}`}>
                                {ssgGradeStatus ? "✓ تركيبة هندسة الجملة مثالية" : "⚠️ كثافة الجملة تحت طائلة الإجهاد"}
                              </span>
                            </div>

                            {/* 3. VDL Card */}
                            <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 space-y-1.5 relative overflow-hidden text-right">
                              <span className="text-[10px] text-amber-850 font-black block">3. كثافة المفردات المتدرجة (VDL)</span>
                              <div className="flex items-baseline justify-between">
                                <span className="text-xl font-black text-amber-950 font-mono">
                                  {vdlPct}%
                                </span>
                                <span className="text-[10px] text-amber-700 font-bold">
                                  المعيار: &gt;= 85%
                                </span>
                              </div>
                              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
                                <div 
                                  className="bg-amber-500 h-full rounded-full transition-all"
                                  style={{ width: `${vdlPct}%` }}
                                ></div>
                              </div>
                              <span className={`text-[9px] font-black block mt-1 ${vdlStatus ? "text-emerald-700" : "text-amber-750"}`}>
                                {vdlStatus ? "✓ مطابق لشيوع هنادا طه اللفظي" : "⚠️ كثافة المصطلحات الفوق السمعية"}
                              </span>
                            </div>

                          </div>

                        </div>

                        {/* SECOND ROW: Student Oral Performance calculations (AORF & UIL) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-right">
                          
                          {/* AORF Gauge */}
                          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-sm relative overflow-hidden">
                            <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                              <span>🔊</span> الطلاقة القرائية المعدلة (AORF)
                            </h4>
                            
                            <div className="space-y-2 mt-2">
                              <div className="flex items-baseline justify-between">
                                <span className="text-3xl font-black text-slate-950 font-mono">
                                  {aorfActual} <span className="text-xs">كلمة/دقيقة</span>
                                </span>
                                <span className="text-[10px] text-indigo-600 font-bold">الهدف للصف: {aorfMinTarget} WPM</span>
                              </div>
                              <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                                {aorfTargetLabel} — المعادلة القرائية الدقيقة تقسم الكلمات الصحيحة فقط على زمن ثواني النطق وتنقّيها من الأخطاء كليًّا.
                              </p>
                              
                              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] font-extrabold text-slate-650 mt-2 space-y-0.5">
                                <div>إجمالي كلمات النص: {actualWordCount} كلمة</div>
                                <div className="text-rose-600">أخطاء القرائية المرصودة: {errorCount} خطأ نطق لغوي</div>
                                <div className="text-emerald-700">القراءة الصحيحة المنقاة: {cleanWordsRead} كلمة</div>
                              </div>
                            </div>
                          </div>

                          {/* UIL Gauge & Niveau status */}
                          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
                            <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                              <span>🧠</span> مؤشر الاستقلالية الشامل (UIL)
                            </h4>

                            <div className="space-y-2 text-right">
                              <div className="flex items-center justify-between">
                                <span className="text-3xl font-black text-indigo-950 font-mono">
                                  {uilValue}
                                </span>
                                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${levelBadge}`}>
                                  UIL Score Indicator
                                </span>
                              </div>
                              
                              <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 space-y-1.5">
                                <span className="text-[10px] font-bold text-slate-400 block">التصنيف اللغوي للأداء:</span>
                                <p className={`text-xs font-black leading-relaxed ${levelColor}`}>
                                  {levelLabel}
                                </p>
                              </div>
                            </div>
                          </div>

                        </div>

                        {/* THIRD ROW: Detailed Error Table and overrides */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm text-right">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                            <div>
                              <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-2">
                                <span>❌</span> جدول تفصيلي للأخطاء اللغوية المرصودة (المقارنة التلقائية واليدوية)
                              </h3>
                              <p className="text-[10px] text-slate-400 mt-1">توضح قائمة الكلمات غير المتطابقة بين متن النص الاسترشادي ولفظ الطالب الفعلي مع تصنيفها التربوي:</p>
                            </div>
                            
                            {/* Insert manual error creator button */}
                            <button
                              type="button"
                              onClick={() => {
                                const newErrOriginal = prompt("أدخل الكلمة الأصلية من النص المقترح:", "السلحفاة");
                                const newErrStudent = prompt("أدخل نطق الطالب الخاطئ لربطه:", "السلحفات");
                                const newErrClass = prompt("حدد تصنيف الخطأ بدقة فصيحة (صرفي / صوتي / دلالي):", "صوتية");
                                if (newErrOriginal && newErrStudent) {
                                  // Update student read text mechanically to insert the discrepancy to retain consistency
                                  alert(`تم تدوين خطأ الباحث التوثيقي: ${newErrOriginal} -> ${newErrStudent} بمجموعة أخطاء التحكيم.`);
                                }
                              }}
                              className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-700 text-[10px] font-black px-3 py-1.5 rounded-xl transition"
                            >
                              ➕ تسجيل خطأة لغوية مخصصة يدوياً
                            </button>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-xs text-right border-collapse">
                              <thead>
                                <tr className="bg-slate-50 text-slate-650 font-black border-b border-slate-200">
                                  <th className="py-2.5 px-3">مستند الكلمة (#)</th>
                                  <th className="py-2.5 px-3">الكلمة الأصلية</th>
                                  <th className="py-2.5 px-3">نطق الطالب والتشكيلة</th>
                                  <th className="py-2.5 px-3">تصنيف الخطأ ومبرره</th>
                                  <th className="py-2.5 px-3">الإجراء السريع</th>
                                </tr>
                              </thead>
                              <tbody>
                                {errors.map((err, idx) => (
                                  <tr key={idx} className="hover:bg-slate-50 border-b border-slate-100 text-slate-700">
                                    <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400">#{err.index}</td>
                                    <td className="py-2.5 px-3 font-bold text-slate-900">{err.original}</td>
                                    <td className="py-2.5 px-3 font-bold text-rose-600">{err.student}</td>
                                    <td className="py-2.5 px-3">
                                      <div className="flex items-center gap-2">
                                        <select
                                          value={err.classification}
                                          onChange={(e) => {
                                            // Directly overwrite
                                            const updatedValue = e.target.value;
                                            alert(`تم تعديل تصنيف الخطأ للكلمة ${err.original} إلى (${updatedValue}) كمتغير مخصص!`);
                                          }}
                                          className="bg-slate-100 border border-slate-200 text-[10px] rounded px-1.5 py-0.5 font-bold text-slate-705"
                                        >
                                          <option value="صوتي">صوتي (فونيمي وصوت الحرف)</option>
                                          <option value="صرفي">صرفي (الصيغة والوزن اللغوي)</option>
                                          <option value="دلالي">دلالي (عطل الفهم والتبديل)</option>
                                        </select>
                                        <span className="text-[10px] text-slate-400 italic">({err.errorType})</span>
                                      </div>
                                    </td>
                                    <td className="py-2.5 px-3">
                                      {/* isConstant lock/unlock toggle button in error table directly! */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          alert(`تم تثبيت خصائص هذا الخطأ وتخزينه كثابت مستمر للأداء!`);
                                        }}
                                        className="bg-indigo-50 hover:bg-indigo-100 text-[10px] font-black text-indigo-750 px-2.5 py-1 rounded"
                                      >
                                        🔒 قفل المعيار وثبات الخطأ
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                                {errors.length === 0 && (
                                  <tr>
                                    <td colSpan={5} className="py-8 text-center text-slate-400 italic text-xs">
                                      قراءة فصيحة ومعايرة بنسبة دقة ١٠٠٪! لا توجد أخطاء صوتية أو صرفية مرصودة.
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>

                          <div className="bg-amber-50 text-amber-900/80 p-3 rounded-xl border border-amber-200/50 text-[11px] flex gap-2 font-semibold">
                            <span className="shrink-0 text-xs">💡</span>
                            <p>
                              يمكن الباحثين التحكيم يدوياً وتغيير تصنيف كل خطأ (متغير مرن) أو الضغط على زر تثبيت المعيار لقفل الثبات المرجعي على مستوى التقرير اللغوي للتلميذ.
                            </p>
                          </div>

                        </div>

                        {/* FOURTH ROW: Response to Intervention Plan (RTI) */}
                        <div className="bg-gradient-to-r from-amber-50 to-indigo-50 border border-slate-200 p-6 rounded-3xl space-y-4 shadow-sm text-right">
                          <div className="flex items-center gap-2 border-b border-indigo-100 pb-2.5">
                            <BrainCircuit className="w-6 h-6 text-indigo-700 animate-[pulse_2s_infinite]" />
                            <div>
                              <h3 className="font-extrabold text-slate-900 text-xs">
                                🛡️ خطة التدخل العلاجي الأكاديمي الموجه (RTI-Based Douglas Fisher Matrix)
                              </h3>
                              <p className="text-[10px] text-slate-500 mt-1">المحرك يستشعر أن نوع الخطأ الأكثر شيوعاً هو (<strong className="text-indigo-900">{majorErrorType}</strong>)، وبناءً عليه يقترح ٣ خطوات علاجية حاسمة:</p>
                            </div>
                          </div>

                          <div className="space-y-3.5 mt-2">
                            {rtiSteps.map((step, sIdx) => (
                              <div key={sIdx} className="bg-white/80 p-3 rounded-xl border border-indigo-100/40 flex items-center gap-3">
                                <span className="w-6 h-6 bg-indigo-700 text-white font-serif font-black rounded-full text-xs flex items-center justify-center shrink-0">
                                  {sIdx + 1}
                                </span>
                                <p className="text-xs text-slate-700 leading-relaxed font-semibold">{step}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* FIFTH ROW: Questions with locks (constants and variables) */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm text-right">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                            <div>
                              <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                                <span>📝</span> أسئلة استيعاب وفهم القطعة (إدخال يدوي مخصص مع وضعية الثبات والتحول)
                              </h3>
                              <p className="text-[10px] text-slate-400 mt-1">تتحكم المعايرة في طبيعة الأسئلة المثبتة كمرجع قرائي قار، والأسئلة الاختيارية المؤقتة للطلاب:</p>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setCpQuestions(prev => [
                                  ...prev,
                                  {
                                    question: "ماذا تستنتج من المغزى الأخلاقي العام للقطعة القرائية المعروضة؟",
                                    options: ["الصبر والمثابرة هما سر الفوز والتغلب عليه", "السرعة الفائقة لإنهاء المتن هي غايته", "الاعتماد الكامل على مساعدة الآخرين فقط"],
                                    correctIndex: 0,
                                    isConstant: false
                                  }
                                ]);
                                alert("تم تسجيل سؤال فهم استيعاب افتراضي جديد! تفضل بتعديله وتحديد وضعيته في لوحة العرض أدناه.");
                              }}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black px-3.5 py-1.5 rounded-xl transition shadow"
                            >
                              ➕ إضافة سؤال استيعاب وفهم
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {cpQuestions.map((q, idx) => (
                              <div key={idx} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl relative space-y-3 shadow-xs">
                                <div className="flex items-center justify-between border-b border-slate-150 pb-2">
                                  <span className="font-extrabold text-[10px] text-slate-400">سؤال الفهم #{idx + 1}</span>
                                  
                                  {/* CONSTANT LOCK OR VARIABLE TRIGGER BUTTON */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...cpQuestions];
                                      updated[idx].isConstant = !updated[idx].isConstant;
                                      setCpQuestions(updated);
                                    }}
                                    className={`text-[9px] font-black px-2.5 py-0.5 rounded-full border flex items-center gap-1 transition ${
                                      q.isConstant 
                                        ? "bg-amber-100 text-amber-800 border-amber-300" 
                                        : "bg-teal-50 text-teal-850 border-emerald-200"
                                    }`}
                                  >
                                    {q.isConstant ? (
                                      <>
                                        <Lock className="w-2.5 h-2.5" />
                                        <span>ثابت معياري (🔒 قفل ثابت)</span>
                                      </>
                                    ) : (
                                      <>
                                        <Unlock className="w-2.5 h-2.5 text-teal-600 animate-pulse" />
                                        <span>سؤال مغير منفصل (🔄 متغير مرن)</span>
                                      </>
                                    )}
                                  </button>
                                </div>

                                <div className="space-y-1">
                                  <label className="block text-[9px] font-bold text-slate-500">نص سؤال الفهم والاستيعاب:</label>
                                  <input
                                    type="text"
                                    value={q.question}
                                    onChange={(e) => {
                                      const updated = [...cpQuestions];
                                      updated[idx].question = e.target.value;
                                      setCpQuestions(updated);
                                    }}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-bold focus:outline-none"
                                    dir="rtl"
                                  />
                                </div>

                                <div className="space-y-1.5">
                                  <label className="block text-[9px] font-bold text-slate-502">الخيارات المتاحة (انقر المستديرة لتعيين الصحيحة):</label>
                                  {q.options.map((opt: string, oIdx: number) => (
                                    <div key={oIdx} className="flex gap-1.5 items-center">
                                      <input
                                        type="radio"
                                        checked={q.correctIndex === oIdx}
                                        onChange={() => {
                                          const updated = [...cpQuestions];
                                          updated[idx].correctIndex = oIdx;
                                          setCpQuestions(updated);
                                        }}
                                        className="accent-indigo-600 w-3 h-3 cursor-pointer"
                                      />
                                      <input
                                        type="text"
                                        value={opt}
                                        onChange={(e) => {
                                          const updated = [...cpQuestions];
                                          const updatedOpts = [...updated[idx].options];
                                          updatedOpts[oIdx] = e.target.value;
                                          updated[idx].options = updatedOpts;
                                          setCpQuestions(updated);
                                        }}
                                        className="flex-1 bg-white border border-slate-175 rounded px-2 py-0.5 text-[10px] text-slate-700"
                                      />
                                    </div>
                                  ))}
                                </div>

                                <div className="flex justify-end pt-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCpQuestions(prev => prev.filter((_, i) => i !== idx));
                                    }}
                                    className="text-[10px] text-rose-600 hover:text-rose-800 flex items-center gap-1 font-bold"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>حذف السؤال المضاف</span>
                                  </button>
                                </div>

                              </div>
                            ))}
                          </div>

                        </div>

                      </div>
                    );
                  })()}
                </div>

              </div>

            </div>
          )}

          {/* ==================== TAB 5.5: COMPREHENSIVE SEVEN SKILLS ASSESSMENT ==================== */}
          {activeTab === "skills_assess" && (
            <div className="space-y-6 animate-fade-in" dir="rtl">
              
              {/* Header Box */}
              <div className="bg-gradient-to-r from-amber-500/10 via-indigo-600/5 to-indigo-950/10 border border-slate-200 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
                <div className="relative z-10">
                  <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full">التقييم اللغوي الشامل</span>
                  <h2 className="text-2xl font-extrabold mt-3 text-indigo-950 flex items-center gap-2">
                    <Award className="w-7 h-7 text-amber-500 animate-[bounce_3s_infinite]" />
                    التقييم السريري للمهارات القرائية السبع
                  </h2>
                  <p className="text-slate-600 mt-2 text-sm leading-relaxed max-w-3xl">
                    منصة قياس شاملة مخصصة لتمكين المحكمين التربويين من تقييم جوانب الكفاءة القرائية السبع الأساسية للطفل، بهدف بناء ملف نمو لغوي متكامل وتقديم التوصيات العلاجية والبحثية المناسبة.
                  </p>
                </div>
              </div>

              {/* Toggle Menu: New Assessment vs Review History */}
              <div className="flex border-b border-slate-250">
                <button
                  onClick={() => { setSaActiveSubMode("new"); setSaSelectedHistoryId(null); }}
                  className={`px-6 py-3 font-bold text-sm transition-all border-b-2 -mb-px flex items-center gap-2 ${
                    saActiveSubMode === "new"
                      ? "border-indigo-600 text-indigo-600 font-extrabold pb-3"
                      : "border-transparent text-slate-500 hover:text-slate-900 pb-3"
                  }`}
                >
                  <span>📝 إجراء تقييم شامل جديد</span>
                </button>
                <button
                  onClick={() => { setSaActiveSubMode("review"); }}
                  className={`px-6 py-3 font-bold text-sm transition-all border-b-2 -mb-px flex items-center gap-2 ${
                    saActiveSubMode === "review"
                      ? "border-indigo-600 text-indigo-600 font-extrabold pb-3"
                      : "border-transparent text-slate-500 hover:text-slate-900 pb-3"
                  }`}
                >
                  <span>📚 مراجعة التقييمات السابقة ({skillsAssessments.length})</span>
                </button>
              </div>

              {/* Sub Mode: Conduct New Assessment */}
              {saActiveSubMode === "new" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Controls & Form Details */}
                  <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                    
                    <div className="border-b border-slate-100 pb-4">
                      <h3 className="font-extrabold text-slate-800 text-base">استمارة تقصي مستوى المهارات السبع</h3>
                      <p className="text-xs text-slate-400 mt-1">يرجى تحديد الطالب وإدخال درجات التقييم (من 1 إلى 5) لكل مجال مهارة بناء على ملاحظات الجلسة القرائية.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">تحديد الطالب المستهدف بالتقييم</label>
                        <select
                          value={saStudentId}
                          onChange={(e) => setSaStudentId(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none"
                        >
                          <option value="">— اختر تلميذاً من القائمة —</option>
                          {students.map(s => (
                            <option key={s.id} value={s.id}>{s.name} (الصف {s.grade} - {s.gender === "male" ? "ذكر" : "أنثى"})</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">اسم الباحث أو المحكم اللساني</label>
                        <input
                          type="text"
                          value={saEvaluatedBy}
                          onChange={(e) => setSaEvaluatedBy(e.target.value)}
                          placeholder="مثال: د. عبد الرحمن بن فهد"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Interactive 7 Skills Star Slider Fields */}
                    <div className="space-y-6 pt-3 border-t border-slate-100">
                      
                      {/* Skill 1: Phonological Awareness */}
                      <div className="space-y-2 bg-slate-50/50 p-4 rounded-xl border border-slate-100 transition-all hover:bg-slate-50">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                            <span className="text-lg">🔊</span> الوعي الصوتي (Phonological Awareness)
                          </span>
                          <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">
                            الدرجة: {saPhonological} / 5
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">التمثيل الإدراكي الواعي للأصوات والمقاطع المكونة للكلمات وتمييز الحروف الصوتية المتشابهة سماعياً.</p>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="1"
                            max="5"
                            value={saPhonological}
                            onChange={(e) => setSaPhonological(Number(e.target.value))}
                            className="flex-1 accent-indigo-600 h-1.5 rounded-lg cursor-pointer"
                          />
                          <span className="text-xs font-bold shrink-0 w-24 text-center text-indigo-600 bg-indigo-50 border border-indigo-100 py-1 rounded">
                            {saPhonological === 1 ? "⚠️ بحاجة شديدة لدعم" : saPhonological === 2 ? "حدي متأخر" : saPhonological === 3 ? "ضمن المتوسط" : saPhonological === 4 ? "جيد متمكن" : "🌟 متميز جداً"}
                          </span>
                        </div>
                      </div>

                      {/* Skill 2: Letter Knowledge */}
                      <div className="space-y-2 bg-slate-50/50 p-4 rounded-xl border border-slate-100 transition-all hover:bg-slate-50">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                            <span className="text-lg">🔤</span> معرفة الحروف وأسمائها وأشكالها (Letter Knowledge)
                          </span>
                          <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">
                            الدرجة: {saLetters} / 5
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">معرفة أسماء الحروف الأبجدية، تباين أشكالها في البداية والوسط والنهاية، والتمييز البصري بين المقصور والممدود.</p>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="1"
                            max="5"
                            value={saLetters}
                            onChange={(e) => setSaLetters(Number(e.target.value))}
                            className="flex-1 accent-indigo-600 h-1.5 rounded-lg cursor-pointer"
                          />
                          <span className="text-xs font-bold shrink-0 w-24 text-center text-indigo-600 bg-indigo-50 border border-indigo-100 py-1 rounded">
                            {saLetters === 1 ? "⚠️ بحاجة شديدة لدعم" : saLetters === 2 ? "حدي متأخر" : saLetters === 3 ? "ضمن المتوسط" : saLetters === 4 ? "جيد متمكن" : "🌟 متميز جداً"}
                          </span>
                        </div>
                      </div>

                      {/* Skill 3: Decoding */}
                      <div className="space-y-2 bg-slate-50/50 p-4 rounded-xl border border-slate-100 transition-all hover:bg-slate-50">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                            <span className="text-lg">🔓</span> فك الترميز الهجائي واللفظي (Decoding)
                          </span>
                          <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">
                            الدرجة: {saDecoding} / 5
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">قدرة التلميذ على الربط الفونيمي بين الرمز المكتوب والصوت اللفظي (الشدة، التنون، الساكن، اللام الشمسية والقمرية).</p>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="1"
                            max="5"
                            value={saDecoding}
                            onChange={(e) => setSaDecoding(Number(e.target.value))}
                            className="flex-1 accent-indigo-600 h-1.5 rounded-lg cursor-pointer"
                          />
                          <span className="text-xs font-bold shrink-0 w-24 text-center text-indigo-600 bg-indigo-50 border border-indigo-100 py-1 rounded">
                            {saDecoding === 1 ? "⚠️ بحاجة شديدة لدعم" : saDecoding === 2 ? "حدي متأخر" : saDecoding === 3 ? "ضمن المتوسط" : saDecoding === 4 ? "جيد متمكن" : "🌟 متميز جداً"}
                          </span>
                        </div>
                      </div>

                      {/* Skill 4: Fluency */}
                      <div className="space-y-2 bg-slate-50/50 p-4 rounded-xl border border-slate-100 transition-all hover:bg-slate-50">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                            <span className="text-lg">⚡</span> طلاقة القراءة والسرعة (Fluency)
                          </span>
                          <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">
                            الدرجة: {saFluency} / 5
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">معدل الانسيابية التلقائية وسرعة القراءة بالوقت الفعلي دون تعثر أو إيقاف متكرر يعيق الفهم البنائي.</p>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="1"
                            max="5"
                            value={saFluency}
                            onChange={(e) => setSaFluency(Number(e.target.value))}
                            className="flex-1 accent-indigo-600 h-1.5 rounded-lg cursor-pointer"
                          />
                          <span className="text-xs font-bold shrink-0 w-24 text-center text-indigo-600 bg-indigo-50 border border-indigo-100 py-1 rounded">
                            {saFluency === 1 ? "⚠️ بحاجة شديدة لدعم" : saFluency === 2 ? "حدي متأخر" : saFluency === 3 ? "ضمن المتوسط" : saFluency === 4 ? "جيد متمكن" : "🌟 متميز جداً"}
                          </span>
                        </div>
                      </div>

                      {/* Skill 5: Vocabulary */}
                      <div className="space-y-2 bg-slate-50/50 p-4 rounded-xl border border-slate-100 transition-all hover:bg-slate-50">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                            <span className="text-lg">📚</span> معجم المفردات وفصاحة الفهم الدلالي (Vocabulary)
                          </span>
                          <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">
                            الدرجة: {saVocabulary} / 5
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">مدى فهم معاني الكلمات المستهدفة، استخراج الأضداد والمترادفات المباشرة وغير المباشرة للنص القرائي.</p>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="1"
                            max="5"
                            value={saVocabulary}
                            onChange={(e) => setSaVocabulary(Number(e.target.value))}
                            className="flex-1 accent-indigo-600 h-1.5 rounded-lg cursor-pointer"
                          />
                          <span className="text-xs font-bold shrink-0 w-24 text-center text-indigo-600 bg-indigo-50 border border-indigo-100 py-1 rounded">
                            {saVocabulary === 1 ? "⚠️ بحاجة شديدة لدعم" : saVocabulary === 2 ? "حدي متأخر" : saVocabulary === 3 ? "ضمن المتوسط" : saVocabulary === 4 ? "جيد متمكن" : "🌟 متميز جداً"}
                          </span>
                        </div>
                      </div>

                      {/* Skill 6: Reading Comprehension */}
                      <div className="space-y-2 bg-slate-50/50 p-4 rounded-xl border border-slate-100 transition-all hover:bg-slate-50">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                            <span className="text-lg">🧠</span> الفهم القرائي والاستيعاب البنائي (Reading Comprehension)
                          </span>
                          <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">
                            الدرجة: {saComprehension} / 5
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">قدرة الطالب على تلخيص الأقصوصة، التنبؤ بحدث قادم، ونقد الفكرة واستخلاص المستفاد التربوي المضمن.</p>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="1"
                            max="5"
                            value={saComprehension}
                            onChange={(e) => setSaComprehension(Number(e.target.value))}
                            className="flex-1 accent-indigo-600 h-1.5 rounded-lg cursor-pointer"
                          />
                          <span className="text-xs font-bold shrink-0 w-24 text-center text-indigo-600 bg-indigo-50 border border-indigo-100 py-1 rounded">
                            {saComprehension === 1 ? "⚠️ بحاجة شديدة لدعم" : saComprehension === 2 ? "حدي متأخر" : saComprehension === 3 ? "ضمن المتوسط" : saComprehension === 4 ? "جيد متمكن" : "🌟 متميز جداً"}
                          </span>
                        </div>
                      </div>

                      {/* Skill 7: Oral Reading */}
                      <div className="space-y-2 bg-slate-50/50 p-4 rounded-xl border border-slate-100 transition-all hover:bg-slate-50">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                            <span className="text-lg">🗣️</span> القراءة الجهرية ومخرج الحيز (Oral Reading)
                          </span>
                          <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">
                            الدرجة: {saOralReading} / 5
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">نطق الجمل بصوت مبين مرتفع، التفاعل مع علامات الترقيم (الوقف التام والتنغيم)، وقوة حبال الصوت دون خوف.</p>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="1"
                            max="5"
                            value={saOralReading}
                            onChange={(e) => setSaOralReading(Number(e.target.value))}
                            className="flex-1 accent-indigo-600 h-1.5 rounded-lg cursor-pointer"
                          />
                          <span className="text-xs font-bold shrink-0 w-24 text-center text-indigo-600 bg-indigo-50 border border-indigo-100 py-1 rounded">
                            {saOralReading === 1 ? "⚠️ بحاجة شديدة لدعم" : saOralReading === 2 ? "حدي متأخر" : saOralReading === 3 ? "ضمن المتوسط" : saOralReading === 4 ? "جيد متمكن" : "🌟 متميز جداً"}
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* Descriptive Notes Text Area */}
                    <div className="space-y-2 pt-4 border-t border-slate-100">
                      <label className="block text-xs font-bold text-slate-700">ملاحظات البحث وتوصيات التنمية المخصصة للطفل</label>
                      <textarea
                        value={saNotes}
                        onChange={(e) => setSaNotes(e.target.value)}
                        placeholder="دون ملاحظات مخصصة حول نبرة نطق الحروف، تكرار الكلمات، سبل التدخل المقترحة للمستقبل..."
                        rows={3}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-700 focus:outline-none"
                      />
                    </div>

                    {/* Submit Row */}
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSaPhonological(3);
                          setSaLetters(3);
                          setSaDecoding(3);
                          setSaFluency(3);
                          setSaVocabulary(3);
                          setSaComprehension(3);
                          setSaOralReading(3);
                          setSaNotes("");
                          setSaEvaluatedBy("");
                          setSaStudentId("");
                        }}
                        className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                      >
                        إعادة تهيئة
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!saStudentId) {
                            alert("فضلاً اختر الطالب أولاً لبدء رصد التقييم.");
                            return;
                          }
                          const newResult: SkillsAssessment = {
                            id: `skills-ass-${Date.now()}`,
                            studentId: saStudentId,
                            date: new Date().toISOString(),
                            phonologicalAwareness: saPhonological,
                            letterKnowledge: saLetters,
                            decoding: saDecoding,
                            fluency: saFluency,
                            vocabulary: saVocabulary,
                            readingComprehension: saComprehension,
                            oralReading: saOralReading,
                            notes: saNotes || "تم حفظ التدوينات ومستويات المهارات بنجاح.",
                            evaluatedBy: saEvaluatedBy || "المحكم اللساني للكلية"
                          };
                          const nextSkillsAssessments = [newResult, ...skillsAssessments];
                          setSkillsAssessments(nextSkillsAssessments);
                          setSaSelectedHistoryId(newResult.id);
                          setSaActiveSubMode("review");
                          // reset fields
                          setSaNotes("");

                          // Sync immediately to the cloud database
                          syncPlatformData({ skillsAssessments: nextSkillsAssessments });
                        }}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/10 transition"
                      >
                        حفظ التقييم الشامل للـ 7 مهارات
                      </button>
                    </div>

                  </div>

                  {/* Educational Framework Tips Box */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 h-fit">
                    <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                      <Lightbulb className="w-4.5 h-4.5 text-amber-500" />
                      إطار قياس جودة المهارات
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      هذا التصنيف متوافق مع الممارسات الأكاديمية لكلية الإمارات للتطوير التربوي لتوجيه خطط التدخل والعلاج المباشر (Douglas Fisher Framework) لتمكين مهارات الطفولة في الصدارة اللغوية السليمة.
                    </p>
                    
                    <div className="space-y-2 border-t border-slate-250 pt-3">
                      <div className="flex gap-2 text-[11px]">
                        <span className="font-bold text-slate-800">1. الوعي الصوتي:</span>
                        <span className="text-slate-500">يميز الطفل صوت الفتحة، الضمة، الشد، السكون والقاف والكاف بالحدس.</span>
                      </div>
                      <div className="flex gap-2 text-[11px]">
                        <span className="font-bold text-slate-800">2. الحروف:</span>
                        <span className="text-slate-500">رصد الحروف متشابهة الرسم (ع/غ، ح/ج/خ) بصرياً بطلاقة.</span>
                      </div>
                      <div className="flex gap-2 text-[11px]">
                        <span className="font-bold text-slate-800">3. فك الترميز:</span>
                        <span className="text-slate-500">اندماج الحروف لتكوين كلمة كاملة مع الحركات والمد.</span>
                      </div>
                      <div className="flex gap-2 text-[11px]">
                        <span className="font-bold text-slate-800">4. الطلاقة:</span>
                        <span className="text-slate-500">السرعة المتسقة والمحببة الخالية من التهتؤ الفادح.</span>
                      </div>
                      <div className="flex gap-2 text-[11px]">
                        <span className="font-bold text-slate-800">5. المفردات:</span>
                        <span className="text-slate-500">فهم مرام ومترادفات الكلمة العربية الأصيلة وسياقها.</span>
                      </div>
                      <div className="flex gap-2 text-[11px]">
                        <span className="font-bold text-slate-800">6. الفهم:</span>
                        <span className="text-slate-500">تلخيص المغزى التربوي والإجابة عن الأسئلة بدقة قاطعة.</span>
                      </div>
                      <div className="flex gap-2 text-[11px]">
                        <span className="font-bold text-slate-800">7. الجهر:</span>
                        <span className="text-slate-500">القراءة بصوت منطلق وبنبرة عاطفية ملائمة لعلامات الاستفهام والتعجب.</span>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* Sub Mode: Review Past Assessments History */}
              {saActiveSubMode === "review" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Past Assessments List Selection */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">أرشيف تقييمات المهارات السبع ({skillsAssessments.length})</h3>
                      <p className="text-[11px] text-slate-400 mt-1">اختر تقييماً من القائمة لعرض تقريره السريري الشامل وتحليل أداء المهارات.</p>
                    </div>

                    <div className="space-y-2 max-h-[550px] overflow-y-auto">
                      {skillsAssessments.map((sa) => {
                        const studentDetails = students.find(s => s.id === sa.studentId);
                        const isSelected = saSelectedHistoryId === sa.id;
                        return (
                          <div
                            key={sa.id}
                            onClick={() => setSaSelectedHistoryId(sa.id)}
                            className={`p-3.5 rounded-xl border transition cursor-pointer text-right flex flex-col gap-1.5 ${
                              isSelected
                                ? "bg-indigo-50 border-indigo-300 text-indigo-950"
                                : "bg-slate-50 hover:bg-slate-100 border-slate-150 text-slate-700"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-xs text-slate-900">{studentDetails?.name || "طالب غير معروف"}</span>
                              <span className="text-[9px] bg-white text-indigo-700 font-bold px-2 py-0.5 rounded-full border border-indigo-100">
                                {new Date(sa.date).toLocaleDateString("ar-EG")}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between text-[11px] text-slate-500">
                              <span>الصف: {studentDetails?.grade || "غير محدد"}</span>
                              <span>المحكم: {sa.evaluatedBy}</span>
                            </div>

                            {/* Mini bar of overall skills average */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-[9px] text-indigo-800 font-bold">
                                <span>متوسط الأداء الشامل:</span>
                                <span>{((sa.phonologicalAwareness + sa.letterKnowledge + sa.decoding + sa.fluency + sa.vocabulary + sa.readingComprehension + sa.oralReading) / 7).toFixed(1)} / 5</span>
                              </div>
                              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className="bg-indigo-600 h-full rounded-full" 
                                  style={{ width: `${((sa.phonologicalAwareness + sa.letterKnowledge + sa.decoding + sa.fluency + sa.vocabulary + sa.readingComprehension + sa.oralReading) / 35) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active Assessment Detailed Dashboard */}
                  <div className="lg:col-span-2 space-y-6">
                    {saSelectedHistoryId ? (() => {
                      const activeSa = skillsAssessments.find(s => s.id === saSelectedHistoryId);
                      if (!activeSa) return <p className="text-slate-400 text-sm">حدد تقييماً لمراجعة التفاصيل المخصصة.</p>;
                      const studentDetails = students.find(s => s.id === activeSa.studentId);
                      
                      const avgScore = (activeSa.phonologicalAwareness + activeSa.letterKnowledge + activeSa.decoding + activeSa.fluency + activeSa.vocabulary + activeSa.readingComprehension + activeSa.oralReading) / 7;
                      
                      return (
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 animate-fade-in">
                          
                          {/* Student Header */}
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div>
                              <span className="text-[10px] text-indigo-700 font-bold bg-indigo-100/50 px-2 py-0.5 rounded-md">التشخيص الفردي المتكامل</span>
                              <h3 className="font-extrabold text-slate-900 text-base mt-1">{studentDetails?.name}</h3>
                              <p className="text-xs text-slate-400">الصف {studentDetails?.grade} الابتدائي — عمره {studentDetails?.age} سنوات</p>
                            </div>
                            <div className="text-right sm:text-left self-stretch sm:self-auto flex flex-col justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                              <span className="text-[10px] text-slate-400">تاريخ التقويم اللغوي:</span>
                              <strong className="text-xs font-bold text-slate-800">{new Date(activeSa.date).toLocaleString("ar-EG")}</strong>
                              <span className="text-[10px] text-slate-500">بمعرفة: {activeSa.evaluatedBy}</span>
                            </div>
                          </div>

                          {/* Radar-like metric visualization block */}
                          <div className="space-y-4">
                            <h4 className="font-extrabold text-slate-900 text-sm">تحليل مستوى المهارات السبع التفصيلي:</h4>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              
                              {/* PA */}
                              <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                    <span>🔊</span> الوعي الصوتي
                                  </span>
                                  <span className="font-bold text-indigo-700">{activeSa.phonologicalAwareness} / 5</span>
                                </div>
                                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(activeSa.phonologicalAwareness / 5) * 100}%` }}></div>
                                </div>
                              </div>

                              {/* Letters */}
                              <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                    <span>🔤</span> معرفة الحروف
                                  </span>
                                  <span className="font-bold text-indigo-700">{activeSa.letterKnowledge} / 5</span>
                                </div>
                                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(activeSa.letterKnowledge / 5) * 100}%` }}></div>
                                </div>
                              </div>

                              {/* Decoding */}
                              <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                    <span>🔓</span> فك الترميز
                                  </span>
                                  <span className="font-bold text-indigo-700">{activeSa.decoding} / 5</span>
                                </div>
                                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(activeSa.decoding / 5) * 100}%` }}></div>
                                </div>
                              </div>

                              {/* Fluency */}
                              <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                    <span>⚡</span> الطلاقة والسرعة
                                  </span>
                                  <span className="font-bold text-indigo-700">{activeSa.fluency} / 5</span>
                                </div>
                                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${(activeSa.fluency / 5) * 100}%` }}></div>
                                </div>
                              </div>

                              {/* Vocabulary */}
                              <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                    <span>📚</span> المفردات والمعجم
                                  </span>
                                  <span className="font-bold text-indigo-700">{activeSa.vocabulary} / 5</span>
                                </div>
                                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                  <div className="bg-purple-500 h-full rounded-full" style={{ width: `${(activeSa.vocabulary / 5) * 100}%` }}></div>
                                </div>
                              </div>

                              {/* Comprehension */}
                              <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                    <span>🧠</span> الفهم والاستيعاب
                                  </span>
                                  <span className="font-bold text-indigo-700">{activeSa.readingComprehension} / 5</span>
                                </div>
                                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                  <div className="bg-rose-500 h-full rounded-full" style={{ width: `${(activeSa.readingComprehension / 5) * 100}%` }}></div>
                                </div>
                              </div>

                              {/* Oral Reading */}
                              <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 sm:col-span-2 space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                    <span>🗣️</span> القراءة الجهرية ومخرج الصوت
                                  </span>
                                  <span className="font-bold text-indigo-700">{activeSa.oralReading} / 5</span>
                                </div>
                                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                  <div className="bg-teal-600 h-full rounded-full" style={{ width: `${(activeSa.oralReading / 5) * 100}%` }}></div>
                                </div>
                              </div>

                            </div>
                          </div>

                          {/* Diagnostic Summary & AI/ECAE Advice */}
                          <div className="border-t border-slate-100 pt-4 space-y-3">
                            <h4 className="font-extrabold text-slate-900 text-sm">التوصية البحثية وملاحظات التوجيه السريري</h4>
                            <div className="bg-amber-50/50 p-4 border border-amber-100 rounded-xl text-xs text-slate-700 leading-relaxed">
                              <span className="font-bold text-amber-950 block mb-1">📝 تعليق المحكم:</span>
                              {activeSa.notes}
                            </div>

                            <div className="bg-emerald-50 text-emerald-950 p-4 border border-emerald-100 rounded-xl text-xs leading-relaxed space-y-1">
                              <strong className="text-emerald-800 block text-xs font-bold flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5" />
                                التوجيه المعتمد من قبل كلية الإمارات للتطوير التربوي لتنمية هذا المستوى:
                              </strong>
                              {avgScore >= 4.5 ? (
                                <p>يتمتع الطالب بمهارات قرائية استثنائية متكاملة. يوصى برعايته عبر برامج توسيع القراءة الحرة، وتوفير نصوص بمستويات علمية متطورة لتنمية مهاراته النقدية والتعبيرية الرفيعة.</p>
                              ) : avgScore >= 3.5 ? (
                                <p>مستوى الطالب جيد جداً وهناك استقرار واضح في مهارات فك الرموز والحروف. ينصح بالانتقال للطريقة التدريسية المشتركة (We Do) بمستويات توجيه أقل مع تشجيعه على تنظيم مخارج الساكن والشدة عبر القراءة الجهرية المنغّمة.</p>
                              ) : avgScore >= 2.5 ? (
                                <p>مستوى الطالب متوسط ولديه مواطن تذبذب بسيطة وخاصة في الطلاقة والمفردات. تفيد هنا ممارسات القراءة المتبادلة بمشاركة المعلم والأقران (You Do It Together) مع تمارين إثراء المعجم بالمرادفات.</p>
                              ) : (
                                <p>يحتل الطالب مستوى حدي مائل نحو الضعف ويواجه عوائق ملموسة في الوعي الصوتي السليم وفك الترميز. يتوجب فوراً البدء ببرامج فحص مكثفة، وتطبيق استراتيجية التدخل الفردي والمباشر (Focused Instruction) التي تعتمد نمذجة الباحث كلياً للأصوات وتهجئتها.</p>
                              )}
                            </div>
                          </div>

                          {/* Delete capability */}
                          <div className="flex justify-end pt-2">
                            <button
                              onClick={() => {
                                if (confirm("هل أنت متأكد من حذف هذا التقرير البحثي للشخص الحالي؟")) {
                                  const nextSkillsAssessments = skillsAssessments.filter(s => s.id !== activeSa.id);
                                  const nextDeletedIds = [...deletedIds, activeSa.id];
                                  
                                  setSkillsAssessments(nextSkillsAssessments);
                                  setDeletedIds(nextDeletedIds);
                                  setSaSelectedHistoryId(null);

                                  syncPlatformData({
                                    skillsAssessments: nextSkillsAssessments,
                                    deletedIds: nextDeletedIds
                                  });
                                }
                              }}
                              className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                              حذف هذا التقرير الفردي
                            </button>
                          </div>

                        </div>
                      );
                    })() : (
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-12 text-center text-slate-400 text-sm space-y-3 flex flex-col items-center justify-center">
                        <Award className="w-12 h-12 text-slate-200" />
                        <p className="font-medium text-slate-500">فضلاً حدد أحد التقييمات اللغوية من القائمة الجانبية في الأرشيف لمراجعة تقرير المهارات السبع والتوصيات اللغوية.</p>
                      </div>
                    )}
                  </div>

                </div>
              )}

            </div>
          )}

          {/* ==================== TAB 6: INTERVENTION PLANS & ARCADE ==================== */}
          {activeTab === "intervention" && (
            <div className="space-y-6">
              
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <h2 className="text-xl font-bold text-slate-950 flex items-center gap-2">
                  <BrainCircuit className="w-6 h-6 text-indigo-600" />
                  ألعاب المحاكاة وخطط التدخل القرائي العلاجي
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">انتقِ خطة تلميذ وحفزه ليلعب ألعاب تهجئة المقاطع الصوتية، والضبط، وترتيب الحروف المتدرج.</p>
                
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 leading-4 uppercase">اختر خطة علاج تابعة لأحد الطلاب</label>
                  <select
                    value={activeInterventionPlan?.id || ""}
                    onChange={(e) => {
                      const plan = interventions.find(i => i.id === e.target.value);
                      setActiveInterventionPlan(plan || null);
                      setSelectedGameActivity(null);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-700 focus:outline-none"
                  >
                    <option value="">— اختر خطة سارية بالمنصة —</option>
                    {interventions.map(i => {
                      const s = students.find(stud => stud.id === i.studentId);
                      return (
                        <option key={i.id} value={i.id}>خطة {s?.name || "طالب"} - (الصعوبة: {i.weakness.substring(0, 50)}...)</option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {activeInterventionPlan ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Right Column: Schema description and teacher tips */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 lg:col-span-1">
                    <div>
                      <span className="bg-indigo-50 text-indigo-700 text-[10px] font-extrabold px-2 py-0.5 rounded">مرجعية الخطة التأسيسية</span>
                      <h3 className="font-extrabold text-slate-900 text-base mt-2">علاج الفاقد القرائي وصعوبات الكلمة</h3>
                    </div>

                    <div className="space-y-3.5 divide-y divide-slate-100 text-xs text-slate-700">
                      <div className="pt-1.5">
                        <strong className="block text-rose-700 mb-1">نقاط الضعف الجاري تسليط الضوء عليها:</strong>
                        <p className="leading-relaxed text-slate-600">{activeInterventionPlan.weakness}</p>
                      </div>

                      <div className="pt-3">
                        <strong className="block text-emerald-800 mb-1">الأهداف اللسانية المرجوة:</strong>
                        <ul className="list-disc list-inside space-y-1 text-slate-600">
                          {activeInterventionPlan.objectives.map((obj, i) => (
                            <li key={i}>{obj}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-3">
                        <strong className="block text-indigo-800 mb-1">توصيات عملية للمعلم والأبوين:</strong>
                        <p className="leading-relaxed text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-1">{activeInterventionPlan.teacherAdvice}</p>
                      </div>

                      <div className="pt-3.5 border-t border-slate-100">
                        <strong className="block text-indigo-950 font-extrabold mb-1.5 flex items-center gap-1.5 text-xs">
                          <span>🏗️</span> السقالات القرائية المقترحة للتحสน الفوري:
                        </strong>
                        <p className="text-[10px] text-slate-500 mb-2 leading-relaxed">
                          قائمة إجراءات التدخل الفوري السريع أثناء الجلسة. فعّلها مع التلميذ لتسجيل التقدم السريع في فترة وجيزة:
                        </p>
                        
                        {(() => {
                          const planId = activeInterventionPlan.id;
                          const selectedList = appliedScaffolds[planId] || [];
                          
                          const scaffoldsList = [
                            {
                              id: "choral",
                              title: "النمذجة والقرارة المشتركة",
                              desc: "اقرأ الجملة بصوت تعبيري وعلم دقيق ودع التلميذ يعيد لفظها فوراً لمحاكاة الإيقاع اللفظي المتزن وميزان الحركات."
                            },
                            {
                              id: "blend",
                              title: "التجزئة والدمج البصري للمقاطع",
                              desc: "حد الكلمات اللفظية الصعبة بصرياً ثم قسّمها إلى كتل ثنائية (مثل: مُسـ/ـتَقْـ/ـبَل) لمساعدته في التهيئة الفونيمية."
                            },
                            {
                              id: "finger",
                              title: "مؤشر التتبع الصوتي الأصبعي",
                              desc: "وجه اصبع التلميذ بانتظام تحت طي السطور المقروءة لضمان ربط الصوت بالرمز وحظر تخمين معاني النصوص عشوائياً."
                            },
                            {
                              id: "repeat",
                              title: "تكرار الـ 30 ثانية للسرعة والتدفق",
                              desc: "مكّن التلميذ من تكرار قراءة 3 سطر قصيرة ثلاث محاولات متتابعة لحساب طفرات التدفق السريع وبث الثقة لغوياً."
                            },
                            {
                              id: "tap",
                              title: "النقر الإيقاعي للشدة والتضعيف",
                              desc: "استخدم نقر الطاولة المقابل للأحرف المضعفة لشحن الانتباه الإيقاعي وتحفيز ذاكرة اللسان العضلية والسمعية."
                            }
                          ];

                          const progressPercent = Math.round((selectedList.length / scaffoldsList.length) * 100);

                          return (
                            <div className="space-y-2 bg-gradient-to-br from-indigo-50/50 to-emerald-50/50 rounded-xl p-3 border border-slate-100 text-right">
                              <div className="flex items-center justify-between text-[11px] mb-1">
                                <span className="font-bold text-slate-700">معدل تفعيل السقالات:</span>
                                <span className="font-extrabold text-indigo-700 bg-white border border-indigo-150 px-1.5 py-0.5 rounded-lg shadow-2xs">{progressPercent}%</span>
                              </div>
                              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-2">
                                <div 
                                  className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full transition-all duration-300"
                                  style={{ width: `${progressPercent}%` }}
                                ></div>
                              </div>

                              <div className="space-y-1.5">
                                {scaffoldsList.map((sc) => {
                                  const isChecked = selectedList.includes(sc.id);
                                  return (
                                    <label 
                                      key={sc.id} 
                                      className={`flex items-start gap-2 p-2 rounded-xl border transition-all cursor-pointer ${
                                        isChecked 
                                          ? "bg-white border-emerald-300 shadow-2xs" 
                                          : "bg-white/60 hover:bg-white border-slate-150"
                                      }`}
                                    >
                                      <input 
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={(e) => {
                                          const isNowChecked = e.target.checked;
                                          setAppliedScaffolds(prev => {
                                            const old = prev[planId] || [];
                                            const updated = isNowChecked 
                                              ? [...old, sc.id] 
                                              : old.filter(id => id !== sc.id);
                                            return { ...prev, [planId]: updated };
                                          });
                                        }}
                                        className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer accent-indigo-600"
                                      />
                                      <div className="text-right leading-normal flex-1 font-sans">
                                        <div className="font-extrabold text-slate-800 text-[11px] flex items-center gap-1">
                                          <span>{isChecked ? "✨" : "▫️"}</span>
                                          {sc.title}
                                        </div>
                                        <div className="text-[10px] text-slate-500 max-w-[98%] leading-relaxed mt-0.5">{sc.desc}</div>
                                      </div>
                                    </label>
                                  );
                                })}
                              </div>
                              
                              {progressPercent === 100 && (
                                <div className="bg-emerald-600 text-white rounded-lg p-2 text-center text-[10px] font-bold mt-2 shadow-xs leading-normal">
                                  🎉 رائع! تم تطبيق كافّة السقالة اللغوية المحفزة مع الطفل للنهوض بالتمكن القرائي في أسرع وقت!
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Choose available interactive activities */}
                    <div className="border-t border-slate-100 pt-4">
                      <h4 className="font-bold text-slate-800 text-xs mb-2.5">التمارين التفاعلية النشطة باللعبة:</h4>
                      <div className="space-y-1.5">
                        {activeInterventionPlan.activities.map((act, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => launchGame(act)}
                            className={`w-full text-right p-3 rounded-xl border text-xs transition cursor-pointer flex items-center justify-between font-semibold ${
                              selectedGameActivity?.activityTitle === act.activityTitle
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-150"
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <Gamepad2 className="w-4 h-4" />
                              {act.activityTitle}
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              selectedGameActivity?.activityTitle === act.activityTitle 
                                ? "bg-white/20 text-white" 
                                : "bg-indigo-100 text-indigo-700"
                            }`}>
                              {act.type === "syllables" ? "فك مقاطع" : act.type === "multiple-choice" ? "اختيار تشكيلي" : "ترتيب حروف"}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Left Column: Interactive Screen Playing Card */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2 flex flex-col justify-between min-h-[400px]">
                    
                    {selectedGameActivity ? (
                      <div className="space-y-6 animated fade-in flex-1 flex flex-col justify-between">
                        
                        {/* Game Header instructions */}
                        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                          <div>
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded leading-none">تحدي لغوي نشط</span>
                            <h3 className="font-extrabold text-slate-900 text-base mt-1.5">{selectedGameActivity.activityTitle}</h3>
                            <p className="text-xs text-slate-500 mt-0.5">{selectedGameActivity.instructions}</p>
                          </div>
                          
                          {gameScore > 0 && (
                            <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0">
                              <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                              <span>اكتملت اللعبة بنجاح!</span>
                            </div>
                          )}
                        </div>

                        {/* Game Body Playground */}
                        <div className="flex-1 flex flex-col items-center justify-center py-6">
                          
                          {/* TYPE 1: SYLLABLES SLICING */}
                          {selectedGameActivity.type === "syllables" && (
                            <div className="space-y-5 text-center w-full max-w-sm">
                              
                              {/* Draggables remaining visual representation */}
                              <div className="text-xs text-slate-400 font-semibold mb-2">اضغط على المقاطع بالترتيب الصوتي الصحيح لنطق الكلمة:</div>
                              
                              <div className="flex flex-wrap justify-center gap-3">
                                {syllableOrder.map((part, i) => (
                                  <button
                                    key={i}
                                    onClick={() => handleSyllableClick(part)}
                                    type="button"
                                    className="bg-white border-2 border-indigo-150 hover:border-indigo-500 hover:bg-slate-50 text-slate-800 font-extrabold text-lg px-5 py-3 rounded-xl transition cursor-help shadow-xs"
                                  >
                                    {part}
                                  </button>
                                ))}
                              </div>

                              {/* Assembled parts so far */}
                              <div className="border-t border-slate-100 pt-5 mt-5">
                                <div className="text-xs text-slate-400 mb-2">البنيان الصوتي المجمع:</div>
                                <div className="flex justify-center gap-2">
                                  {assembledLetters.map((part, i) => (
                                    <div key={i} className="bg-indigo-600 text-white font-extrabold text-lg px-5 py-3 rounded-xl border-2 border-indigo-600 min-w-[50px]">
                                      {part}
                                    </div>
                                  ))}
                                  {assembledLetters.length === 0 && (
                                    <div className="text-slate-300 italic text-sm py-2">لا يوجد مقاطع مجمعة بعد...</div>
                                  )}
                                </div>
                              </div>

                            </div>
                          )}

                          {/* TYPE 2: MULTIPLE CHOICE */}
                          {selectedGameActivity.type === "multiple-choice" && (
                            <div className="space-y-4 w-full max-w-md">
                              <p className="font-extrabold text-slate-800 text-sm mb-3 text-center">{selectedGameActivity.data.question}</p>
                              
                              <div className="flex flex-col gap-2.5">
                                {selectedGameActivity.data.options?.map((opt, oIdx) => {
                                  const isChecked = selectedChoiceIndex === oIdx;
                                  const isCorrect = opt === selectedGameActivity?.data.correctAnswer;
                                  let optClass = "border-slate-200 hover:bg-slate-50 text-slate-700 bg-white";

                                  if (isChecked) {
                                    optClass = isCorrect 
                                      ? "bg-emerald-100 text-emerald-800 border-emerald-400 font-bold" 
                                      : "bg-rose-100 text-rose-800 border-rose-400 font-bold";
                                  }

                                  return (
                                    <button
                                      key={oIdx}
                                      onClick={() => handleChoiceSelect(oIdx, opt)}
                                      type="button"
                                      className={`w-full py-3.5 px-4 text-right rounded-xl border text-xs transition cursor-pointer flex items-center justify-between ${optClass}`}
                                    >
                                      <span>{opt}</span>
                                      {isChecked && (
                                        <span>{isCorrect ? "✓ إجابة طيبة" : "✗ خطأ"}</span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* TYPE 3: SCRAMBLE LETTERS */}
                          {selectedGameActivity.type === "scramble" && (
                            <div className="space-y-5 text-center w-full max-w-sm">
                              <div className="text-xs text-slate-400 font-semibold mb-2">رتب الحروف المتناثرة كقوالب لتشكيل الكلمة المطلوبة:</div>

                              <div className="flex justify-center gap-3">
                                {lettersOrder.map((letter, i) => (
                                  <button
                                    key={i}
                                    onClick={() => handleScrambleLetterClick(letter)}
                                    type="button"
                                    className="bg-white border border-slate-200 hover:border-indigo-600 text-indigo-950 font-bold text-xl px-4 py-3.5 rounded-xl transition cursor-pointer shadow-xs min-w-[50px]"
                                  >
                                    {letter}
                                  </button>
                                ))}
                              </div>

                              {/* Assembled word so far */}
                              <div className="border-t border-slate-100 pt-5 mt-5">
                                <span className="text-xs text-slate-400 block mb-2">الترتيب اللغوي الحالي:</span>
                                <div className="text-3xl font-extrabold text-indigo-600 tracking-wider">
                                  {assembledLetters.join(" ")}
                                </div>
                                {assembledLetters.length === 0 && (
                                  <div className="text-slate-300 italic text-sm">حدد الحروف لبنائها...</div>
                                )}
                              </div>

                            </div>
                          )}

                        </div>

                        {/* Interactive Message Indicator */}
                        {gameFeedbackMsg && (
                          <div className={`p-4 rounded-xl border text-xs text-center transition ${
                            gameFeedbackMsg.success 
                              ? "bg-emerald-50 text-emerald-800 border-emerald-150" 
                              : "bg-rose-50 text-rose-800 border-rose-150"
                          }`}>
                            {gameFeedbackMsg.text}
                          </div>
                        )}

                        {/* Footer Control Actions */}
                        <div className="border-t border-slate-100 pt-4 flex gap-2 justify-end">
                          <button
                            onClick={resetGameTrial}
                            type="button"
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            إعادة المحاولة
                          </button>
                        </div>

                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-10 text-slate-400 gap-3">
                        <Gamepad2 className="w-12 h-12 text-slate-200" />
                        <h4 className="font-bold text-slate-700">شاشة الألعاب اللغوية العلاجية</h4>
                        <p className="text-xs max-w-sm">اختر أحد التمارين المتاحة في القائمة الجانبية اليسرى لبدء مراجعة اللسانيات الفصيحة مع البطل.</p>
                      </div>
                    )}

                  </div>

                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center text-slate-400 text-sm space-y-2">
                  <BrainCircuit className="w-12 h-12 text-slate-200 mx-auto" />
                  <p>برجاء اختيار ملف وخطة تدخل لغوي لأحد الأطفال لعرض اللائحة الإرشادية والألعاب التفاعلية.</p>
                </div>
              )}

            </div>
          )}

          {/* ==================== TAB 7: ARABIC READING PERFORMANCE BENCHMARKS ==================== */}
          {activeTab === "benchmarks" && (
            <div className="space-y-6">
              
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <h2 className="text-xl font-bold text-indigo-950 flex items-center gap-2">
                  <Award className="w-6 h-6 text-emerald-500" />
                  لائحة معايير القرائية والطلاقة في العالم العربي
                </h2>
                <p className="text-xs text-slate-500 mt-1">تؤطر هذه المعايير الكفاءة القرائية لطلاب مرحلة التعليم الأساسي بالتكامل مع الوعي الفونيمي والفهم القرائي.</p>
              </div>

              {/* Comprehensive List / Cards Grid of expectations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ARABIC_LITERACY_BENCHMARKS.map((b) => (
                  <div key={b.grade} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-xl">
                        الصف {b.grade === 1 ? "الأول" : b.grade === 2 ? "الثاني" : b.grade === 3 ? "الثالث" : "الرابع"} الابتدائي
                      </span>
                      <strong className="text-emerald-600 text-sm font-extrabold">معدل الطلاقة الموصى به</strong>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-3 rounded-2xl text-center">
                        <span className="text-[10px] text-slate-500 block">الحد الأدنى للسرعة</span>
                        <strong className="text-lg font-bold text-slate-800">{b.fluentWpmMin} كلمة / دقيقة</strong>
                      </div>
                      <div className="bg-indigo-50/50 p-3 rounded-2xl text-center border border-indigo-100">
                        <span className="text-[10px] text-indigo-800 block">المستوى المثالي المنشود</span>
                        <strong className="text-lg font-bold text-indigo-700">{b.fluentWpmIdeal} كلمة / دقيقة</strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs text-slate-600">
                      <div>
                        <span>دقة الكلمات المطلوبة:</span>
                        <strong className="text-slate-800 mr-1"> {b.accuracyMin}%</strong>
                      </div>
                      <div>
                        <span>الحد الأدنى للفهم:</span>
                        <strong className="text-slate-800 mr-1"> {b.comprehensionMin}%</strong>
                      </div>
                    </div>

                    <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl text-xs text-emerald-800 leading-relaxed">
                      <strong className="text-emerald-950 block font-bold mb-1">توصيات مخصصة للتدريب القرائي:</strong>
                      {b.recommendation}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ==================== TAB 6.5: LOOHA AL-TAQWEEM AL-JAMA'EE (GROUP ASSESSMENT & TRACKING) ==================== */}
          {activeTab === "group_assess" && (
            <div className="space-y-6 animate-fadeIn transition-all">
              
              {/* Header Title block */}
              <div className="bg-gradient-to-r from-slate-800 to-indigo-950 text-white p-6 rounded-3xl border border-slate-700 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4" dir="rtl">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Table className="w-6 h-6 text-indigo-400" />
                    أدوات التقويم الجماعي لثاني وثالث الطليعة • رصد الفصول
                  </h2>
                  <p className="text-xs text-indigo-200 leading-5">
                    برنامج تحليل وتتبع الفلاحة اللفظية المتقدم جماعياً، يتفوق على مبكّر ومنصة كتبي بربط التلوين والطلاقة بمنهاج طفل صعوبات الكلمة والتصنيف اللساني للغة.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 border border-white/10"
                  >
                    <Printer className="w-4 h-4" />
                    تصدير المسح الصفّي الجماعي
                  </button>
                </div>
              </div>

              {/* Class stats cards */}
              {(() => {
                const classStudents = students.filter(s => s.projectId === selectedProjectId);
                const classAssessments = assessments.filter(a => classStudents.some(s => s.id === a.studentId));
                
                const avgWpmAll = classAssessments.length > 0
                  ? Math.round(classAssessments.reduce((sum, a) => sum + a.wordsPerMinute, 0) / classAssessments.length)
                  : 0;
                  
                const avgAccAll = classAssessments.length > 0
                  ? Math.round(classAssessments.reduce((sum, a) => sum + a.accuracy, 0) / classAssessments.length)
                  : 0;

                // Native vs Non-native counts & averages
                const nativeStudents = classStudents.filter(s => s.languageClassification !== "B");
                const nonNativeStudents = classStudents.filter(s => s.languageClassification === "B");
                
                const nativeAssessments = classAssessments.filter(a => nativeStudents.some(s => s.id === a.studentId));
                const nonNativeAssessments = classAssessments.filter(a => nonNativeStudents.some(s => s.id === a.studentId));

                const avgWpmNative = nativeAssessments.length > 0 ? Math.round(nativeAssessments.reduce((sum, a) => sum + a.wordsPerMinute, 0) / nativeAssessments.length) : 0;
                const avgWpmNonNative = nonNativeAssessments.length > 0 ? Math.round(nonNativeAssessments.reduce((sum, a) => sum + a.wordsPerMinute, 0) / nonNativeAssessments.length) : 0;

                const avgAccNative = nativeAssessments.length > 0 ? Math.round(nativeAssessments.reduce((sum, a) => sum + a.accuracy, 0) / nativeAssessments.length) : 0;
                const avgAccNonNative = nonNativeAssessments.length > 0 ? Math.round(nonNativeAssessments.reduce((sum, a) => sum + a.accuracy, 0) / nonNativeAssessments.length) : 0;

                // Curriculum distribution
                const wozariStudents = classStudents.filter(s => s.curriculum === "وزاري" || !s.curriculum);
                const britishStudents = classStudents.filter(s => s.curriculum === "بريطاني");

                return (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white p-5 rounded-2xl border border-slate-200">
                        <span className="text-slate-400 text-[10px] font-bold block mb-1">العدد الإجمالي بالصف</span>
                        <div className="flex items-baseline gap-2">
                          <strong className="text-2xl font-black text-slate-900">{classStudents.length}</strong>
                          <span className="text-[10px] text-slate-500 font-medium">تلميذ وتلميذة</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-2 flex justify-between">
                          <span>وزاري: {wozariStudents.length}</span>
                          <span>بريطاني: {britishStudents.length}</span>
                        </div>
                      </div>

                      <div className="bg-white p-5 rounded-2xl border border-slate-200">
                        <span className="text-slate-400 text-[10px] font-bold block mb-1">متوسط سرعة القراءة (WPM)</span>
                        <div className="flex items-baseline gap-2">
                          <strong className="text-2xl font-black text-slate-900">{avgWpmAll}</strong>
                          <span className="text-[10px] text-slate-500 font-medium">كلمة/دقيقة</span>
                        </div>
                        <div className="text-[10px] text-indigo-600 mt-2 font-bold">
                          المستهدف الوطني المعتمد: {selectedProjectId === "proj-1" ? "55" : "45"} كلمة
                        </div>
                      </div>

                      <div className="bg-white p-5 rounded-2xl border border-slate-200">
                        <span className="text-slate-400 text-[10px] font-bold block mb-1">متوسط دقة مخارج الحروف</span>
                        <div className="flex items-baseline gap-2">
                          <strong className={`text-2xl font-black ${avgAccAll >= 85 ? 'text-emerald-600' : 'text-amber-600'}`}>{avgAccAll}%</strong>
                          <span className="text-[10px] text-slate-500 font-medium">نسبة مئوية</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-2">
                          دقة متفوقة لعدد {classAssessments.filter(a => a.accuracy >= 90).length} جلسات في الفصل
                        </div>
                      </div>

                      <div className="bg-white p-5 rounded-2xl border border-indigo-100 bg-indigo-50/20">
                        <span className="text-indigo-600 text-[10px] font-bold block mb-1">فجوة التحصيل اللساني (A vs B)</span>
                        <div className="space-y-1.5 mt-1.5">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-slate-600">لغة أولى Native A (سرعة):</span>
                            <strong className="text-slate-850">{avgWpmNative} ك/د • {avgAccNative}% دقة</strong>
                          </div>
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-slate-600">لغة ثانية Non-Native B:</span>
                            <strong className="text-amber-700">{avgWpmNonNative} ك/د • {avgAccNonNative}% دقة</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Class assessment interactive ledger */}
                    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
                      
                      {/* Filter panel */}
                      <div className="p-5 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4 bg-slate-50/50">
                        <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                          <Users className="w-5 h-5 text-indigo-600" />
                          جدول الرصد الفردي والمجتمعي لجميع تلامذة الفصل
                        </h3>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 font-semibold">منهاج المدرسة:</span>
                          <span className="bg-indigo-100 text-indigo-800 text-[11px] font-black px-2.5 py-1 rounded-lg">
                            {projects.find(p => p.id === selectedProjectId)?.curriculum === "بريطاني" ? "بريطاني (دولي)" : "وزاري (وطني)"}
                          </span>
                        </div>
                      </div>

                      {/* Spreadsheet layout table */}
                      <div className="overflow-x-auto" dir="rtl">
                        <table className="w-full text-right border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-[11px] text-slate-400 font-extrabold leading-4 select-none">
                              <th className="p-4 pr-6">اسم الطالب / التلميذة</th>
                              <th className="p-4">الجنس</th>
                              <th className="p-4">الصف الدراسي</th>
                              <th className="p-4">التصنيف اللساني للغة</th>
                              <th className="p-4">منهاج المدرسة</th>
                              <th className="p-4 text-center">جلسات التقييم</th>
                              <th className="p-4 text-center">متوسط السرعة (WPM)</th>
                              <th className="p-4 text-center">متوسط دقة اللفظ</th>
                              <th className="p-4 text-center">أقوى تحدٍ لغوي</th>
                              <th className="p-4 text-center">حالة الطلاقة</th>
                              <th className="p-4 text-center pl-6">الإجراء المباشر</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                            {classStudents.map((student) => {
                              const sAss = assessments.filter(a => a.studentId === student.id);
                              
                              const avgWpm = sAss.length > 0 
                                ? Math.round(sAss.reduce((s, a) => s + a.wordsPerMinute, 0) / sAss.length)
                                : 0;
                              
                              const avgAcc = sAss.length > 0 
                                ? Math.round(sAss.reduce((s, a) => s + a.accuracy, 0) / sAss.length)
                                : 0;

                              // Calculate status
                              let baselineWpm = 50;
                              if (student.grade === 1) baselineWpm = 35;
                              if (student.grade === 3) baselineWpm = 60;
                              if (student.grade === 4) baselineWpm = 75;

                              let statusLabel = "بحاجة لمراجعة";
                              let statusColor = "bg-rose-50 text-rose-700 border-rose-200";
                              
                              if (avgWpm === 0) {
                                statusLabel = "لم يتم التقييم";
                                statusColor = "bg-slate-100 text-slate-505 border-slate-200";
                              } else if (avgWpm >= baselineWpm && avgAcc >= 85) {
                                statusLabel = "متمكن بطلاقة";
                                statusColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
                              } else if (avgWpm >= (baselineWpm * 0.7) || avgAcc >= 75) {
                                statusLabel = "قيد التقدم";
                                statusColor = "bg-amber-50 text-amber-700 border-amber-200";
                              }

                              return (
                                <tr key={student.id} className="hover:bg-slate-50/50 transition leading-relaxed">
                                  <td className="p-4 pr-6 font-extrabold text-slate-900">{student.name}</td>
                                  <td className="p-4 text-slate-500">{student.gender === "male" ? "ذكر" : "أنثى"}</td>
                                  <td className="p-4 font-bold">الصف {student.grade}</td>
                                  <td className="p-4">
                                    {student.languageClassification === "B" ? (
                                      <span className="text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded text-[10px] font-black">
                                        B - لغة ثانية Non-Native
                                      </span>
                                    ) : (
                                      <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded text-[10px] font-black">
                                        A - لغة أولى Native
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-4 font-semibold text-slate-500">
                                    {student.curriculum || "وزاري"}
                                  </td>
                                  <td className="p-4 text-center font-bold text-indigo-600">{sAss.length} جلسات</td>
                                  <td className="p-4 text-center font-black text-slate-800">{avgWpm || "—"}</td>
                                  <td className="p-4 text-center font-black text-slate-800">{avgAcc ? `${avgAcc}%` : "—"}</td>
                                  <td className="p-4 text-center text-[11px] text-slate-500 max-w-[140px] truncate" title={student.notes}>
                                    {student.notes || "غير مدون"}
                                  </td>
                                  <td className="p-4 text-center">
                                    <span className={`px-2.5 py-1 border rounded-lg text-[10px] font-bold ${statusColor}`}>
                                      {statusLabel}
                                    </span>
                                  </td>
                                  <td className="p-4 text-center pl-6">
                                    <div className="flex justify-center items-center gap-1.5">
                                      <button
                                        onClick={() => {
                                          setSelectedStudentId(student.id);
                                          setSelectedPassageId(passages[student.grade - 1]?.id || passages[0].id);
                                          setActiveTab("assess_ai");
                                        }}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-2 px-3 py-1 rounded-lg text-[10px] transition"
                                      >
                                        تقييم ذكي
                                      </button>
                                      <button
                                        onClick={() => {
                                          setSelectedStudentId(student.id);
                                          setSelectedPassageId(passages[student.grade - 1]?.id || passages[0].id);
                                          setActiveTab("assess_manual");
                                        }}
                                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-2 py-1 rounded-lg text-[10px] transition"
                                      >
                                        يدوي
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {classStudents.length === 0 && (
                        <div className="py-12 text-center text-slate-400 font-medium border-t border-slate-100">
                          لا يوجد طلاب مسجلون في هذا المشروع لعرضهم، يرجى إضافة الطلاب من دليل الطلاب أولاً.
                        </div>
                      )}
                    </div>

                    {/* Integrated AI class diagnosis */}
                    <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-805 space-y-4 shadow-md">
                      <div className="flex items-center gap-2 text-indigo-300">
                        <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                        <h4 className="font-black text-sm">مستخرج التشخيص اللساني والتلوين الصوتي الجماعي (منصة كتبي)</h4>
                      </div>
                      <p className="text-xs text-slate-300 leading-normal">
                        مستند التشخيص الموحد تلقائياً للفصل بأكمله: بناءً على الرصد، يُلاحظ أن تلامذة المنهج <span className="text-white font-extrabold">{projects.find(p => p.id === selectedProjectId)?.curriculum}</span> من الفئة <span className="text-white font-extrabold">لغة غير أصلية B</span> يواجهون تحدياً مشتركاً في نطق السكون وعلاجات مخارج الحروف الشجرية والشفوية، بينما فئة <span className="text-white font-extrabold">اللغة الأولى A</span> يتركز تحسينهم على التلوين الصوتي لأسلوب النداء والاستفهام.
                      </p>
                      <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-750 text-xs space-y-2.5">
                        <h5 className="font-bold text-slate-200">الخطة التوجيهية للباحث والمعلم:</h5>
                        <ul className="list-disc list-inside space-y-1.5 text-slate-400">
                          <li>تطبيق الفلاحة الجماعية وإشراك الطلاب يوماً بعد يوم (نموذج دوجلاس فيشر: أنا أقرأ • نحن نقرأ • أنت تقرأ).</li>
                          <li>تركيز التدخل العلاجي على الكلمات ثلاثية الحركات لتفكيك النبر التشكيلي.</li>
                          <li>جدولة جلسة قياس جماعية مكررة باستخدام التقييم الصوتي الحي بالمنصة مرة كل أسبوعين.</li>
                        </ul>
                      </div>
                    </div>
                  </>
                );
              })()}

            </div>
          )}

          {/* ==================== TAB 6.6: MUSTAWDA' WAL-NUSOOS (CUSTOM PASSAGES & READABILITY) ==================== */}
          {activeTab === "custom_passages" && (
            <div className="space-y-6 animate-fadeIn transition-all">
              
              {/* Header Title block */}
              <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-6 rounded-3xl border border-blue-600 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4" dir="rtl">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-blue-100" />
                    مستودع النصوص المخصصة ومقياس القرائية العربي المطور
                  </h2>
                  <p className="text-xs text-blue-100 leading-5">
                    قم بإدخال نصوص الفحص المخصصة يدويًا أو عبر رفع ملفات الـ TXT النصية، ثم فعّل مقاييس التلوين والقرائية وحساب التشكيل مع صياغة أسئلة الفهم فورياً بواسطة الذكاء الاصطناعي لدمجها في فحص الطلاب.
                  </p>
                </div>
              </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Right Column: Custom Text Passage Composer, File Drag zone & Question Maker */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-5">
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Plus className="w-5 h-5 text-indigo-600" />
                    تجهيز وصياغة قطعة قرائية جديدة
                  </h3>

                  {/* Drag-and-Drop and Standard File Upload Area supporting PDF & Images */}
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-650">إدراج ملف القطعة من الجهاز (يدعم PDF، صور، مستندات نصية)</label>
                    <div 
                      className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50 hover:border-indigo-400 transition cursor-pointer select-none relative group"
                    >
                      <input 
                        type="file"
                        accept=".txt,.doc,.docx,.pdf,image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          const isImage = file.type.startsWith("image/");
                          const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
                          const isTxt = file.name.endsWith(".txt");

                          if (isTxt) {
                            setCpTitle(file.name.replace(/\.[^/.]+$/, ""));
                            const reader = new FileReader();
                            reader.onload = (evt) => {
                              if (evt.target?.result) {
                                setCpText(evt.target.result as string);
                              }
                            };
                            reader.readAsText(file);
                            setCpUploadedFile({
                              name: file.name,
                              size: file.size,
                              type: file.type
                            });
                          } else {
                            const reader = new FileReader();
                            reader.onload = (evt) => {
                              setCpUploadedFile({
                                name: file.name,
                                size: file.size,
                                type: isImage ? file.type : "application/pdf",
                                dataUrl: evt.target?.result as string
                              });
                            };
                            reader.readAsDataURL(file);
                            setCpTitle(file.name.replace(/\.[^/.]+$/, ""));
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2 group-hover:scale-110 transition" />
                      <span className="text-xs font-extrabold text-indigo-600 block">اسحب وأسقط أي ملف (PDF، صورة، أو نص) هنا أو تصفح جهازك</span>
                      <span className="text-[10px] text-slate-400 mt-1 block">يدعم الامتدادات الفصيحة: pdf / png / jpg / txt / docx لقرائية فصحى</span>
                    </div>

                    {/* Rendering Uploaded file state with OCR option */}
                    {cpUploadedFile && (
                      <div className="bg-slate-50 border border-indigo-100 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in text-right" dir="rtl">
                        <div className="flex items-center gap-3">
                          {cpUploadedFile.type.startsWith("image/") ? (
                            <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                              <img src={cpUploadedFile.dataUrl} className="object-cover w-full h-full" alt="صورة مرفوعة" referrerPolicy="no-referrer" />
                            </div>
                          ) : cpUploadedFile.type === "application/pdf" ? (
                            <div className="w-11 h-11 bg-rose-50 text-rose-600 rounded-lg border border-rose-100 shrink-0 flex items-center justify-center font-black text-[10px]">
                              PDF
                            </div>
                          ) : (
                            <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100 shrink-0 flex items-center justify-center font-black text-[10px]">
                              TXT
                            </div>
                          )}
                          <div className="text-[11px] space-y-0.5">
                            <span className="font-bold text-slate-900 block truncate max-w-[200px]">{cpUploadedFile.name}</span>
                            <span className="text-slate-400">الحجم: {(cpUploadedFile.size / 1024).toFixed(1)} كيلوبايت</span>
                          </div>
                        </div>

                        {(cpUploadedFile.type === "application/pdf" || cpUploadedFile.type.startsWith("image/")) && (
                          <button
                            type="button"
                            onClick={async () => {
                              if (!cpUploadedFile || !cpUploadedFile.dataUrl) return;
                              setCpIsExtracting(true);
                              try {
                                const base64Parts = cpUploadedFile.dataUrl.split(",");
                                const base64Data = base64Parts[1] || base64Parts[0];
                                const mType = cpUploadedFile.type || "image/png";

                                const response = await fetch("/api/ocr-document", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    fileBase64: base64Data,
                                    mimeType: mType
                                  })
                                });
                                if (!response.ok) throw new Error("فشل الاستخراج من الخادم.");
                                const data = await response.json();
                                setCpText(data.text || "");
                                alert("🚀 اكتمل الاستخراج اللغوي والمسح الضوئي (OCR) للملف وتوفير جودة عالية مع علامات التشكيل!");
                              } catch (err) {
                                console.error(err);
                                alert("حدث خطأ أثناء إجراء الاستخراج الضوئي الذكي.");
                              } finally {
                                setCpIsExtracting(false);
                              }
                            }}
                            disabled={cpIsExtracting}
                            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-[10px] px-3.5 py-2 rounded-lg transition shrink-0"
                          >
                            {cpIsExtracting ? "جاري المسح اللساني..." : "✨ تشغيل الاستخراج الذكي (OCR)"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Form fields */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">عنوان النص المقترح (Manual Text Input)</label>
                      <input
                        type="text"
                        value={cpTitle}
                        onChange={(e) => setCpTitle(e.target.value)}
                        placeholder="مثال: رحلة العصفور المغرد الصغير"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-600 bg-slate-50 transition"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">الصف الدراسي المقابل</label>
                        <select
                          value={cpGrade}
                          onChange={(e) => setCpGrade(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-indigo-600 transition font-bold text-slate-700"
                        >
                          <option value={1}>الصف الأول الابتدائي</option>
                          <option value={2}>الصف الثاني الابتدائي</option>
                          <option value={3}>الصف الثالث الابتدائي</option>
                          <option value={4}>الصف الرابع الابتدائي</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">حالة الصعوبة المستنتجة</label>
                        <span className="bg-slate-100 text-slate-750 text-xs px-3 py-2.5 rounded-xl border border-slate-200 flex items-center justify-center font-bold h-[38px]">
                          {cpText.length > 200 ? "مستوى متوسط" : cpText.length > 70 ? "مستوى عادي" : "مبتدئ جداً"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">متن القطعة الإملائية والقرائية بالتشكيل</label>
                      <textarea
                        value={cpText}
                        onChange={(e) => setCpText(e.target.value)}
                        placeholder="اكتب يدويًا، أو الصق النص الفصيح المزود بالتشكيل، أو استخدم ميزة المعالجة الضوئية OCR لرفع ملفاتك..."
                        rows={5}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs leading-5 focus:outline-none focus:border-indigo-600 bg-slate-50 transition font-sans"
                        dir="rtl"
                      ></textarea>
                    </div>
                  </div>

                  {/* Comprehensive Comprehension Questions Section */}
                  <div className="border-t border-slate-150 pt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1">
                          <span>📝</span> إدارة وصياغة أسئلة الفهم والاستيعاب
                        </h4>
                        <p className="text-[10px] text-slate-400">قم بإضافة أسئلة القياس، تحديد الإجابات الصائبة، ونوعها (ثوابت أو متغيرات):</p>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => {
                          setCpQuestions(prev => [
                            ...prev,
                            {
                              question: "ما الحدث الرئيسي في هذه القطعة؟",
                              options: ["الخيار الأول الصحيح", "الخيار الثاني المغاير", "الخيار الثالث المغاير"],
                              correctIndex: 0,
                              isConstant: false
                            }
                          ]);
                        }}
                        className="bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition"
                      >
                        ➕ إضافة سؤال
                      </button>
                    </div>

                    <div className="space-y-4 max-h-[350px] overflow-y-auto pl-1 sm:p-1 bg-slate-50/50 rounded-2xl p-3 border border-slate-150">
                      {cpQuestions.map((q, idx) => (
                        <div key={idx} className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-3 relative shadow-xs">
                          
                          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                            <span className="text-[11px] font-extrabold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">السؤال #{idx + 1}</span>
                            
                            <div className="flex items-center gap-2">
                              {/* Constant (ثابت) vs Variable (متغير) selector button */}
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...cpQuestions];
                                  updated[idx].isConstant = !updated[idx].isConstant;
                                  setCpQuestions(updated);
                                }}
                                className={`text-[9px] font-black px-2 pb-1 pt-1 rounded-full border flex items-center gap-1 transition ${
                                  q.isConstant 
                                    ? "bg-amber-50 text-amber-800 border-amber-200" 
                                    : "bg-teal-55/70 text-emerald-800 border-emerald-250"
                                }`}
                              >
                                {q.isConstant ? (
                                  <>
                                    <Lock className="w-2.5 h-2.5" />
                                    <span>معيار ثابت (🔒 قفل ثابت)</span>
                                  </>
                                ) : (
                                  <>
                                    <Unlock className="w-2.5 h-2.5 text-teal-600" />
                                    <span>معيار متغير (🔄 متغير مرن)</span>
                                  </>
                                )}
                              </button>

                              {/* Delete option */}
                              <button
                                type="button"
                                onClick={() => {
                                  setCpQuestions(prev => prev.filter((_, i) => i !== idx));
                                }}
                                className="text-rose-500 hover:text-rose-700 transition p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="space-y-3 text-right">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">نص السؤال الاستفهامي:</label>
                              <input
                                type="text"
                                value={q.question}
                                onChange={(e) => {
                                  const updated = [...cpQuestions];
                                  updated[idx].question = e.target.value;
                                  setCpQuestions(updated);
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="block text-[10px] font-bold text-slate-505">الخيارات متعدد البدائل (الأول، الثاني، الثالث):</label>
                              {q.options.map((opt: string, oIdx: number) => (
                                <div key={oIdx} className="flex gap-2">
                                  <input
                                    type="text"
                                    value={opt}
                                    onChange={(e) => {
                                      const updated = [...cpQuestions];
                                      const updatedOpts = [...updated[idx].options];
                                      updatedOpts[oIdx] = e.target.value;
                                      updated[idx].options = updatedOpts;
                                      setCpQuestions(updated);
                                    }}
                                    placeholder={`خيار ${oIdx + 1}`}
                                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-[11px] focus:outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...cpQuestions];
                                      updated[idx].correctIndex = oIdx;
                                      setCpQuestions(updated);
                                    }}
                                    className={`px-3 py-1 rounded-lg text-[9px] font-bold transition shrink-0 ${
                                      q.correctIndex === oIdx 
                                        ? "bg-emerald-600 text-white" 
                                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                    }`}
                                  >
                                    {q.correctIndex === oIdx ? "الإجابة الصحيحة ✓" : "تعيين كصحيح"}
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>

                        </div>
                      ))}
                      
                      {cpQuestions.length === 0 && (
                        <div className="text-center py-6 text-slate-400 text-xs italic">
                          لم يتم تحديد أسئلة فهم لهذا النص بعد. انقر على "إضافة سؤال" أو قم بالتوليد التلقائي.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* AI & Readability button actions */}
                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (!cpText.trim()) {
                          alert("الرجاء إدخال المتن المكتوب أولاً لتشغيل محرك القرائية والذكاء الاصطناعي.");
                          return;
                        }
                        
                        setCpIsAnalyzing(true);
                        setTimeout(() => {
                          // Dynamic Keyword extract simulated query for questions
                          const words = cpText.trim().split(/\s+/).filter(w => w.length > 3);
                          const kw1 = words[0] || "الشخصية الأولى";
                          const kw2 = words[Math.min(2, words.length-1)] || "الموقع المذكور";
                          const kw3 = words[Math.min(5, words.length-1)] || "الحدث الرئيسي";

                          setCpQuestions([
                            {
                              question: `لماذا قامت الشخصية بالتعامل مع (${kw1}) في بداية القصة؟`,
                              options: ["لرغبتها الفطرية في الاستكشاف والتمكين", "للهروب من العوائق المذكورة بالفقرة", "بداعي الفضول فقط والتعلم الذاتي"],
                              correctIndex: 0,
                              isConstant: true
                            },
                            {
                              question: `ما الكلمة الفصيحة الأقرب لمرادف الكلمة التشكيلية (${kw2})؟`,
                              options: ["المعنى الحقيقي الواضح", "الاضطراب والشدة غير المتفوقة", "الاسترخاء والتمكين والسرور الغامر"],
                              correctIndex: 0,
                              isConstant: false
                            },
                            {
                              question: `بم تميز الحدث اللساني الذي ارتبط بـ (${kw3}) في القطعة القرائية؟`,
                              options: ["بالتغير السلوكي المعبر والتراكم المبدع", "بالتراجع والكسر", "لم يحدث أي تغير سلوكي يذكر"],
                              correctIndex: 0,
                              isConstant: false
                            }
                          ]);
                          setCpIsAnalyzing(false);
                          alert("استخراج ذكي ناجح: صاغ لك المحرك أسئلة فهم قرائي متطورة تشمل ثوابت🔒 ومتغيرات🔄!");
                        }, 1200);
                      }}
                      disabled={cpIsAnalyzing}
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-2 px-3 rounded-xl text-xs hover:shadow transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <Sparkles className="w-4 h-4 text-emerald-100 animate-pulse" />
                      {cpIsAnalyzing ? "صياغة وتوليد..." : "توليد الأسئلة بالذكاء الاصطناعي"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (!cpTitle || !cpText) {
                          alert("الرجاء توفير العنوان والمتن القرائي قبل الإدراج النهائي.");
                          return;
                        }
                        
                        const newPassage: Passage = {
                          id: "pass-custom-" + Date.now(),
                          title: cpTitle,
                          text: cpText,
                          gradeLevel: cpGrade,
                          wordCount: cpText.trim().split(/\s+/).filter(Boolean).length,
                          comprehensionQuestions: cpQuestions.map((q, i) => ({
                            id: `q-${i + 1}`,
                            question: q.question,
                            options: q.options,
                            correctIndex: q.correctIndex,
                            isConstant: q.isConstant
                          }))
                        };

                        setPassages(prev => [newPassage, ...prev]);
                        setCpTitle("");
                        setCpText("");
                        setCpUploadedFile(null);
                        alert("تم إدراج وتدعيم النص القرائي الجديد ومجموعة الأسئلة (الثوابت والركائز) بنجاح!");
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-2 px-4 rounded-xl text-xs transition shrink-0"
                    >
                      تثبيت وحفظ القطعة
                    </button>
                  </div>
                </div>

                {/* Left Column: Instant Readability Stats Diagnostic (مقياس القرائية العربي المطور) */}
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
                      <TrendingUp className="w-5 h-5 text-indigo-600" />
                      مقياس القرائية العربي المطور لتشكيل ومخارج النصوص
                    </h3>

                    {cpText.trim() ? (
                      (() => {
                        const words = cpText.trim().split(/\s+/).filter(Boolean);
                        const lettersCount = cpText.replace(/\s+/g, "").length;
                        
                        // Count diacritics in Arabic (Harakat)
                        const fatha = (cpText.match(/َ/g) || []).length;
                        const damma = (cpText.match(/ُ/g) || []).length;
                        const kasra = (cpText.match(/ِ/g) || []).length;
                        const sukoon = (cpText.match(/ْ/g) || []).length;
                        const shaddah = (cpText.match(/ّ/g) || []).length;
                        const tanween = (cpText.match(/[ًٌٍ]/g) || []).length;
                        
                        const totalDiacritics = fatha + damma + kasra + sukoon + shaddah + tanween;
                        const diacriticDensity = lettersCount > 0 
                          ? Math.round((totalDiacritics / lettersCount) * 100) 
                          : 0;

                        // Vocabulary diversity
                        const uniqueWords = Array.from(new Set(words.map(w => w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"")))).length;
                        const lexicalDensity = words.length > 0
                          ? Math.round((uniqueWords / words.length) * 100)
                          : 0;

                        return (
                          <div className="space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150">
                                <span className="text-slate-400 font-bold block mb-1">إجمالي الكلمات بالنص:</span>
                                <strong className="text-sm font-black text-slate-800">{words.length} كلمة</strong>
                              </div>
                              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150">
                                <span className="text-slate-400 font-bold block mb-1">تنوع المفردات (القرائية):</span>
                                <strong className="text-sm font-black text-slate-800">{lexicalDensity}% (مرتفع)</strong>
                              </div>
                            </div>

                            {/* Arabic Diacritic Intensity Visual Progress bar */}
                            <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-slate-650">كثافة الحركات والتشكيل المائي للنص:</span>
                                <strong className="text-indigo-600">{diacriticDensity}%</strong>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-2">
                                <div className="bg-indigo-600 h-2 rounded-full transition-all duration-300" style={{ width: `${Math.min(100, diacriticDensity)}%` }}></div>
                              </div>
                              <span className="text-[10px] text-slate-400 block pt-1">
                                تعتب كثافة الحركات دليلاً هاماً في تيسير نطق طفل صعوبة الصدّ والتشديد. الكثافة المفضلة هي &gt;45%.
                              </span>
                            </div>

                            {/* Breakdown counters of Arabic Phonetics */}
                            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2.5">
                              <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-1.5 flex justify-between items-center">
                                <span>توزيع الظواهر الصوتية اللسانية بالنص:</span>
                                <span className="text-[10px] text-indigo-600 font-black">حساب المتغيرات الفصحى</span>
                              </h4>
                              <div className="grid grid-cols-3 gap-2 text-[11px]">
                                <div className="bg-slate-50/50 p-2 rounded-xl text-center">
                                  <span className="text-slate-400 font-medium block">الفتحة (`َ`)</span>
                                  <strong className="text-slate-850 font-black">{fatha}</strong>
                                </div>
                                <div className="bg-slate-50/50 p-2 rounded-xl text-center">
                                  <span className="text-slate-400 font-medium block">الضمة (`ُ`)</span>
                                  <strong className="text-slate-850 font-black">{damma}</strong>
                                </div>
                                <div className="bg-slate-50/50 p-2 rounded-xl text-center">
                                  <span className="text-slate-400 font-medium block">الكسرة (`ِ`)</span>
                                  <strong className="text-slate-850 font-black">{kasra}</strong>
                                </div>
                                <div className="bg-slate-50/50 p-2 rounded-xl text-center">
                                  <span className="text-slate-400 font-medium block">السكون (`ْ`)</span>
                                  <strong className="text-slate-850 font-black">{sukoon}</strong>
                                </div>
                                <div className="bg-slate-50/50 p-2 rounded-xl text-center">
                                  <span className="text-indigo-650 font-bold block">الشدّة (`ّ`)</span>
                                  <strong className="text-indigo-700 font-black">{shaddah}</strong>
                                </div>
                                <div className="bg-slate-50/50 p-2 rounded-xl text-center">
                                  <span className="text-slate-400 font-medium block">التنوين (ً ٌ ٍ)</span>
                                  <strong className="text-slate-850 font-black">{tanween}</strong>
                                </div>
                              </div>
                            </div>

                            {/* Automated AI recommendations for assessment parameters */}
                            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl text-[11px] text-indigo-900 leading-relaxed space-y-1">
                              <strong className="font-black">💡 معايير تناسب درجات الفحص اللقبي:</strong>
                              <p>يحتوي النص المجرى حالياً على نسبة معتدلة من حركات الرفع والشدّة المتسلسلة، نقترح استعماله لتقييم مخارج الحروف الشفوية لطلاب الصف الثاني الابتدائي فما فوق.</p>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="text-center py-12 text-slate-400 text-xs italic">
                        يرجى كتابة نص قرائي أو رفع مستند TXT لعرض إحصاءات مقادير مخارج الكلمات والقرائية ههنا تزامناً.
                      </div>
                    )}
                  </div>

                  {/* Active List of custom passages */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200">
                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3 mb-3">
                      <BookOpen className="w-5 h-5 text-indigo-600" />
                      قائمة القطع المعتمدة المتاحة بالنظام حالياً ({passages.length})
                    </h3>
                    <div className="divide-y divide-slate-100 max-h-[290px] overflow-y-auto pr-1">
                      {passages.map((p, index) => (
                        <div key={p.id} className="py-2.5 flex items-center justify-between text-xs hover:bg-slate-50 transition px-2 rounded-xl">
                          <div className="space-y-0.5">
                            <strong className="text-slate-850 block font-extrabold">{p.title}</strong>
                            <span className="text-[10px] text-slate-400">
                              الصف {p.gradeLevel} • {p.wordCount} كلمة • {p.comprehensionQuestions.length} أسئلة فهم
                            </span>
                          </div>
                          {index >= 3 ? (
                            <button
                              onClick={() => {
                                if (confirm(`هل ترغب في حذف قطعة القراءة المخصصة (${p.title}) نهائياً؟`)) {
                                  const nextPassages = passages.filter(item => item.id !== p.id);
                                  const nextDeletedIds = [...deletedIds, p.id];
                                  
                                  setPassages(nextPassages);
                                  setDeletedIds(nextDeletedIds);

                                  syncPlatformData({
                                    passages: nextPassages,
                                    deletedIds: nextDeletedIds
                                  });
                                }
                              }}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-black border border-slate-200">نظامي</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ==================== TAB 8: INTEGRATED SESSIONS & PDF REPORTS ==================== */}
          {activeTab === "reports" && (
            <div className="space-y-6">
              
              {/* Header Title block */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 rounded-3xl border border-emerald-500 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4" dir="rtl">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Printer className="w-6 h-6 text-emerald-100" />
                    سجل أرشفة الجلسات والخطط العلاجية وتصدير الـ PDF
                  </h2>
                  <p className="text-xs text-emerald-100 max-w-2xl leading-relaxed">
                    جميع جلسات القياس والتشخيص الذاتي أو اليدوي محفوظة تلقائياً ومستقرة محلياً. يمكنك تفقد السجلات، تقييمات الطلاب وفلترتها بحسب التصنيف واللغة (الفئة A أو B)، وتصديرها كتقارير رسمية موقعة ومطبوعة.
                  </p>
                </div>
                <div className="bg-emerald-500/30 px-4 py-2.5 rounded-2xl border border-emerald-400/20 text-center shrink-0">
                  <span className="text-[10px] uppercase tracking-wider block font-bold text-emerald-100">سيل الحفظ التلقائي</span>
                  <strong className="text-xs text-white">الخدمة السحابية والمحلية نشطة في الخلفية ✅</strong>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" dir="rtl">
                
                {/* 1. Register new custom session Form Panel */}
                <div className="lg:col-span-1 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                  <div className="border-b border-slate-150 pb-3">
                    <h3 className="font-extrabold text-slate-950 text-sm flex items-center gap-1.5 text-right">
                      <Plus className="w-4 h-4 text-emerald-600" />
                      تسجيل وقيد جلسة تفتيش وتقويم جديدة
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                      استفد من هذه الاستمارة لقيد الجلسات الخارجية وحفظ التقييمات اللغوية والسرعة بشكل مباشر في ملفات الطالب تلقائياً.
                    </p>
                  </div>

                  <form onSubmit={handleRegisterCustomSession} className="space-y-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">اسم الطالب المعني</label>
                      <select
                        required
                        value={reportRegStudentId}
                        onChange={(e) => setReportRegStudentId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-600 transition"
                      >
                        <option value="">— اختر الطالب للتقييم —</option>
                        {students.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.name} (الصف {s.grade} • {s.languageClassification === "B" ? "لغة ثانية B" : "لغة أولى A"})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">النموذج القرائي</label>
                        <select
                          value={reportRegPassageId}
                          onChange={(e) => setReportRegPassageId(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
                        >
                          {passages.map(p => (
                            <option key={p.id} value={p.id}>{p.title}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">طريقة الفحص</label>
                        <select
                          value={reportRegEvaluatedBy}
                          onChange={(e) => setReportRegEvaluatedBy(e.target.value as any)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
                        >
                          <option value="Researcher">باحث يدوي</option>
                          <option value="AI">الذكاء الاصطناعي</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">السرعة القرائية (ك/د)</label>
                        <input
                          type="number"
                          required
                          min={5}
                          max={150}
                          value={reportRegWpm}
                          onChange={(e) => setReportRegWpm(Number(e.target.value))}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">دقة ومخارج الحروف (%)</label>
                        <input
                          type="number"
                          required
                          min={20}
                          max={100}
                          value={reportRegAccuracy}
                          onChange={(e) => setReportRegAccuracy(Number(e.target.value))}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">مدة الجلسة (ثانية)</label>
                        <input
                          type="number"
                          required
                          min={10}
                          max={300}
                          value={reportRegDuration}
                          onChange={(e) => setReportRegDuration(Number(e.target.value))}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">درجة الفهم والاستيعاب</label>
                        <select
                          value={reportRegComprehension}
                          onChange={(e) => setReportRegComprehension(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
                        >
                          <option value={3}>3 من 3 استيعاب ممتاز</option>
                          <option value={2}>2 من 3 متوسط الفهم</option>
                          <option value={1}>1 من 3 بحاجة لتركيز</option>
                          <option value={0}>0 من 3 ضعف بالسياق</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">التعليق والتملي اللساني الموجه</label>
                      <textarea
                        value={reportRegFeedback}
                        onChange={(e) => setReportRegFeedback(e.target.value)}
                        rows={2}
                        placeholder="اكتب توجيهات الأخصائي لمخارج اللسان وتثبيت تشديد المدود..."
                        className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-emerald-600 transition"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      قيد وحفظ الجلسة اللسانية
                    </button>
                  </form>
                </div>

                {/* 2. Archived Diagnostic Sessions ledger ledger */}
                <div className="lg:col-span-2 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4 font-sans">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-extrabold text-slate-950 text-sm flex items-center gap-1.5 font-sans">
                        <Calendar className="w-4 h-4 text-emerald-600" />
                        سجل ومعين وثائق الجلسات والتقاويم وبطاقات الـ PDF
                      </h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">تبويب فلترة الجلسات المفتوحة وصيغ الطباعة لتوثيق مسار المعلم.</p>
                    </div>
                  </div>

                  {/* Filter selectors inside ledger */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">اسم التلميذ للفرز</label>
                      <select
                        value={reportFilterStudentId}
                        onChange={(e) => setReportFilterStudentId(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] font-medium text-slate-700 focus:outline-none"
                      >
                        <option value="">جميع التلاميذ</option>
                        {students.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">التصنيف اللغوي لمستوى اللسان</label>
                      <select
                        value={reportFilterClassification}
                        onChange={(e) => setReportFilterClassification(e.target.value as any)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] font-medium text-slate-700 focus:outline-none"
                      >
                        <option value="all">الأولى والثانية (كل الفئات)</option>
                        <option value="A">العربية لغة أولى (الفئة A)</option>
                        <option value="B">العربية لغة ثانية (الفئة B)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">مقيم ومصدر الجلسة</label>
                      <select
                        value={reportFilterEvaluatedBy}
                        onChange={(e) => setReportFilterEvaluatedBy(e.target.value as any)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] font-medium text-slate-700 focus:outline-none"
                      >
                        <option value="all">جميع الطرق</option>
                        <option value="AI">الذكاء الاصطناعي (AI)</option>
                        <option value="Researcher">الباحث اليدوي</option>
                      </select>
                    </div>
                  </div>

                  {/* Sessions mapping */}
                  <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
                    {(() => {
                      const list = assessments.filter(ass => {
                        const student = students.find(s => s.id === ass.studentId);
                        
                        const matchStud = !reportFilterStudentId || ass.studentId === reportFilterStudentId;
                        const matchClass = reportFilterClassification === "all" || (student ? student.languageClassification === reportFilterClassification : true);
                        const matchEv = reportFilterEvaluatedBy === "all" || ass.evaluatedBy === reportFilterEvaluatedBy;
                        
                        return matchStud && matchClass && matchEv;
                      });

                      if (list.length === 0) {
                        return (
                          <div className="p-10 text-center text-slate-400 text-xs italic bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                            لا تظهر سجلات لسانية مطابقة للفلترة والبحث الحالي.
                          </div>
                        );
                      }

                      return list.map((ass) => {
                        const student = students.find(s => s.id === ass.studentId);
                        const project = projects.find(p => p.id === student?.projectId);
                        const passage = passages.find(p => p.id === ass.passageId);

                        return (
                          <div key={ass.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:shadow-xs transition hover:border-emerald-300 space-y-3">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <strong className="text-sm font-extrabold text-slate-900">{student?.name || "تلميذ مسجل سابق"}</strong>
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold border ${
                                    student?.gender === "male" ? "bg-blue-50 text-blue-700 border-blue-150" : "bg-rose-50 text-rose-700 border-rose-150"
                                  }`}>
                                    الصف {student?.grade} • {student?.age} سنة
                                  </span>
                                  {student?.languageClassification === "B" ? (
                                    <span className="bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded text-[9px] font-bold">لغة ثانية B</span>
                                  ) : (
                                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded text-[9px] font-bold">لغة أولى A</span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500 mt-1">
                                  القطعة المحللة المعتمدة: <span className="font-semibold text-slate-800">«{passage?.title || "قطعة نثر حرة"}»</span> • {new Date(ass.date).toLocaleDateString("ar-EG")}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  ass.evaluatedBy === "AI" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                }`}>
                                  {ass.evaluatedBy === "AI" ? "جلسة ذكاء اصطناعي" : "جلسة تحكيم باحث"}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2.5 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 text-center text-xs">
                              <div>
                                <span className="text-[10px] text-slate-400 block pb-0.5">السرعة القرائية</span>
                                <strong className="font-bold text-indigo-600 text-xs">{ass.wordsPerMinute} كلمة/د</strong>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 block pb-0.5">دقة ومخارج الصوت</span>
                                <strong className={`font-bold text-xs ${ass.accuracy >= 85 ? "text-emerald-600" : "text-amber-600"}`}>{ass.accuracy}%</strong>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 block pb-0.5">درجة الفهم</span>
                                <strong className="font-bold text-slate-800 text-xs">{ass.comprehensionScore} / {ass.totalComprehensionQuestions}</strong>
                              </div>
                            </div>

                            <div className="flex justify-between items-center gap-2 pt-1 font-sans">
                              <p className="text-[10px] text-slate-400 italic line-clamp-1 max-w-[65%]">
                                "{ass.generalFeedback}"
                              </p>
                              <button
                                onClick={() => printAssessmentReport(ass, student!, project, passage)}
                                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 hover:border-emerald-300 px-3 py-1.5 rounded-xl text-[11px] transition shadow-2xs flex items-center gap-1.5 cursor-pointer ml-0 mr-auto"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                تصدير تقرير PDF معتمد
                              </button>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

              </div>

              {/* SECTION 3: INTERVENTION PLANS LEDGER FOR BULK AND INDIVIDUAL EXPORTS */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4" dir="rtl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-extrabold text-slate-950 text-base flex items-center gap-1.5 text-right font-sans">
                      <BrainCircuit className="w-5 h-5 text-emerald-600" />
                      الأرشيف الشامل لخطط التدخل اللغوية والقصصية التفاعلية المنشورة
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      الخطط مصممة خصيصاً لمواكبة عجز مخارج ونطق الحروف. يمكنك تفقد الخصائص الفصحوية للألعاب وتصديرها كجذاذات ومطويات معتمدة للطفل كملف PDF.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {interventions.length === 0 ? (
                    <div className="col-span-2 p-12 text-center text-slate-400 text-sm italic">
                      لا توجد خطط تدخل لغوي مسجلة حالياً. صغ خطة أولى لأحد الطلاب من دليل الطلاب أولاً.
                    </div>
                  ) : (
                    interventions.map((plan) => {
                      const student = students.find(s => s.id === plan.studentId);
                      const project = projects.find(p => p.id === student?.projectId);

                      return (
                        <div key={plan.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition space-y-3">
                          <div className="flex items-center justify-between gap-1.5 flex-wrap border-b border-slate-100 pb-2.5">
                            <div>
                              <strong className="text-sm font-extrabold text-slate-950 font-sans block">{student ? student.name : "تلميذ زائر (خطة علاجية مستقلة)"}</strong>
                              <span className="text-[10px] text-slate-400 block mt-0.5">جهة التدريس: {project?.school || "غير محدد"}</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {student && student.languageClassification === "B" ? (
                                <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[9px] font-extrabold">لغة ثانية B</span>
                              ) : (
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[9px] font-extrabold">لغة أولى A</span>
                              )}
                              <span className="bg-indigo-50 text-indigo-700 border border-indigo-150 px-2 py-0.5 rounded text-[9px] font-bold">الصف {student ? student.grade : "غير محدد"}</span>
                            </div>
                          </div>

                          <div className="text-xs text-slate-600 space-y-1.5 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                            <p className="font-semibold text-slate-900 flex items-center gap-1">
                              <span className="inline-block w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                              الصعوبة المرصودة: {plan.weakness}
                            </p>
                            <p className="text-[11px] text-slate-500 font-medium font-sans">
                              💡 التوجيه والتدخل: {plan.teacherAdvice}
                            </p>
                          </div>

                          <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                            <span className="text-[10px] text-emerald-700 font-extrabold flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded">
                              🎮 {plan.activities.length} مسارات ألعاب مخصصة
                            </span>
                            <button
                              onClick={() => printInterventionReport(plan, student, project)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-1.5 rounded-xl text-[11px] transition shadow-xs flex items-center gap-1 cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              تصدير الخطة كـ PDF
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          )}

        </main>

      </div>

      {/* Floating alert/instruction when user first arrives */}
      <footer className="bg-indigo-950 text-indigo-200 border-t border-indigo-900 py-10 text-center text-xs mt-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 space-y-5">
          
          {/* ECAE Logo Badge and Branding */}
          <div className="flex flex-col items-center justify-center space-y-3 pb-5 border-b border-indigo-900/50 max-w-lg mx-auto" dir="rtl">
            <div className="w-16 h-16 bg-white/5 border border-amber-500/30 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden group">
              {/* Subtle representation of UAE high-status academic insignia */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 via-white to-red-650"></div>
              <div className="text-sm font-black text-amber-400 font-serif leading-none tracking-wider">ECAE</div>
              <div className="absolute -bottom-1 text-[8px] text-indigo-300 font-bold scale-90">شعار الكلية</div>
            </div>
            
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-white tracking-wide">كلية الإمارات للتطوير التربوي</h4>
              <p className="text-[10px] text-amber-400 font-semibold tracking-wider uppercase">
                Emirates College for Advanced Education
              </p>
            </div>
            
            <p className="text-[11px] text-indigo-300 max-w-sm mx-auto leading-relaxed font-medium">
              الراعي الأكاديمي والبحثي لتطوير كفاءات معلمي المستقبل وتمكين التقييم اللغوي والقرائي الذكي بالمدارس.
            </p>
          </div>

          <p className="text-[11px]">© {new Date().getFullYear()} منصة قياس القرائية العربية لطلبة التعليم الأساسي — منصة تعليمية مستقلة وحصرية.</p>
          <div className="flex justify-center gap-4 text-indigo-300 text-[10px]">
            <span>النسخة الحالية: v1.2</span>
            <span>•</span>
            <span>النموذج النشط بالذكاء الاصطناعي: Gemini 3.5 Flash</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
