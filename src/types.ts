export interface Project {
  id: string;
  name: string;
  school: string;
  classGrade: string;
  researcherName: string;
  createdAt: string;
  curriculum?: 'وزاري' | 'بريطاني';
}

export interface Student {
  id: string;
  projectId: string;
  name: string;
  gender: 'male' | 'female';
  grade: number; // e.g., 1, 2, 3, 4
  age: number;
  notes?: string;
  createdAt: string;
  languageClassification?: 'A' | 'B'; // 'A' = First Language, 'B' = Second Language
  curriculum?: 'وزاري' | 'بريطاني';
  school?: string;
  researcherName?: string;
}

export interface Passage {
  id: string;
  title: string;
  text: string;
  gradeLevel: number;
  wordCount: number;
  comprehensionQuestions: {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    isConstant?: boolean; // true = ثابت, false/undefined = متغير
  }[];
}

export interface WordAnalysis {
  word: string;
  status: 'correct' | 'incorrect' | 'skipped' | 'mispronounced';
  feedback?: string;
}

export interface PronunciationError {
  errorType: string;
  example: string;
  remediation: string;
}

export interface AssessmentResult {
  id: string;
  studentId: string;
  passageId: string;
  date: string;
  evaluatedBy: 'AI' | 'Researcher';
  wordsPerMinute: number;
  accuracy: number; // percentage (0-100)
  durationSeconds: number;
  comprehensionScore: number; // e.g., 3 out of 3
  totalComprehensionQuestions: number;
  wordsAnalyzed: WordAnalysis[];
  pronunciationErrors?: PronunciationError[];
  generalFeedback?: string;
}

export interface InteractionActivity {
  activityTitle: string;
  instructions: string;
  type: 'syllables' | 'multiple-choice' | 'scramble';
  data: {
    word?: string;
    parts?: string[];
    question?: string;
    options?: string[];
    correctAnswer?: string;
    scrambledLetters?: string[];
    correctWord?: string;
  };
}

export interface InterventionPlan {
  id: string;
  studentId: string;
  weakness: string;
  objectives: string[];
  activities: InteractionActivity[];
  teacherAdvice: string;
  createdAt: string;
  status: 'active' | 'completed';
}

export interface SkillsAssessment {
  id: string;
  studentId: string;
  date: string;
  phonologicalAwareness: number; // score 1 to 5
  letterKnowledge: number;       // score 1 to 5
  decoding: number;              // score 1 to 5
  fluency: number;               // score 1 to 5
  vocabulary: number;            // score 1 to 5
  readingComprehension: number;  // score 1 to 5
  oralReading: number;           // score 1 to 5
  notes?: string;
  evaluatedBy: string;
}
