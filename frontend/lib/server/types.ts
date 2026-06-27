export type ReportLanguage = "ar" | "en";
export type ReportType = "short" | "medium";
export type ExperienceLevel = "student" | "fresh_graduate" | "entry_level" | "mid_level" | "senior" | "not_specified";
export type AnalysisStatus = "extracting_text" | "parsing_cv" | "evaluating" | "generating_report" | "completed" | "failed";
export type AnalysisMode = "generic" | "role_only" | "targeted";

export type ParsedCv = {
  contact_information: {
    email_found: boolean;
    phone_found: boolean;
    links: string[];
  };
  sections: Record<string, boolean>;
  bullet_points: string[];
  numbers: string[];
  dates: string[];
  buzzwords: string[];
  word_count: number;
  line_count: number;
  source_references: string[];
  parsing_quality: {
    overall_confidence: number;
    warnings: string[];
  };
};

export type ScoreItem = {
  criterion: string;
  max_score: number;
  score: number;
  reason: string;
  priority: string;
};

export type Issue = {
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  why: string;
  action: string;
};

export type Strength = {
  title: string;
  evidence: string;
};

export type Evaluation = {
  analysis_mode: AnalysisMode;
  scores: {
    main_score: number;
    internal_score: number;
    penalties: number;
    final_score: number;
  };
  score_caps: Array<{ cap: number; reason: string }>;
  criteria: {
    main: ScoreItem[];
    internal: ScoreItem[];
  };
  classification: string;
  decision: string;
  issues: Issue[];
  strengths: Strength[];
  ats: Record<string, unknown>;
};

export type GeneratedReport = {
  executive_judgment: string;
  ten_second_test: Record<string, string>;
  strengths: Strength[];
  issues: Issue[];
  repair_plan: string[];
};

export type AnalysisRecord = {
  status: AnalysisStatus;
  progress: number;
  error?: string;
  language?: ReportLanguage;
  report_type?: ReportType;
  experience_level?: ExperienceLevel;
  target_role?: string | null;
  job_description_available?: boolean;
  extracted?: Record<string, unknown>;
  parsed?: ParsedCv;
  evaluation?: Evaluation;
  report?: GeneratedReport;
  filename?: string;
};
