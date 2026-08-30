export interface IOption {
  optionId: string;
  optionText: string;
  score: number;
}

export interface IQuestion {
  _id?: string;
  questionNumber: number;
  questionText: string;
  category?: string;
  section?: string;
  options: IOption[];
  isActive: boolean;
  order?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface IAnswerSnapshot {
  questionId: string;
  questionNumber: number;
  questionText: string;
  selectedOptionId: string;
  selectedOptionText: string;
  score: number;
  category?: string;
  section?: string;
}

export interface ISurveyResponse {
  _id?: string;
  respondent: {
    name: string;
    email: string;
    phone?: string;
    age: number;
  };
  answers: IAnswerSnapshot[];
  totalScore: number;
  indexValue: number;
  submittedAt: string | Date;
  emailSent: boolean;
  emailSentAt?: string | Date;
  emailError?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface IAdminUser {
  _id?: string;
  name: string;
  email: string;
  role?: string;
  createdAt?: string | Date;
}

export interface AdminJWTPayload {
  sub: string;
  email: string;
  name: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface SurveySubmitPayload {
  respondent: {
    name: string;
    email: string;
    age: number;
  };
  answers: Record<string, string>; // questionId or questionNumber -> selectedOptionId
}

export interface SectionScoreBreakdown {
  sectionName: string;
  score: number;
  maxScore: number;
  percentage: number;
}

export type FinancialReadinessLevel =
  | 'Financial Explorer'
  | 'Financial Starter'
  | 'Financial Builder'
  | 'Financial Planner'
  | 'Financial Strategist';

export interface ScoreCalculationResult {
  totalScore: number;
  indexValue: number;
  readinessLevel: FinancialReadinessLevel;
  categoryScores?: Record<string, number>;
  sectionBreakdown?: SectionScoreBreakdown[];
  strongestDimension?: {
    name: string;
    score: number;
    maxScore: number;
    percentage: number;
    note: string;
  };
  opportunityDimension?: {
    name: string;
    score: number;
    maxScore: number;
    percentage: number;
    note: string;
  };
  nextActions?: string[];
  interpretation?: {
    level: FinancialReadinessLevel | string;
    badgeColor: string;
    description: string;
    motivationalQuote?: string;
  };
}
