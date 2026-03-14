export interface RubricItem {
  competency: string;
  whatGoodLooksLike: string;
  seniorExample: string;
}

export interface Question {
  id: string;
  type: 'craft' | 'behavioral';
  text: string;
  source: 'ai' | 'web';
  rubric: RubricItem[];
}

export interface GenerateQuestionsRequest {
  jobDescription: string;
}

export interface GenerateQuestionsResponse {
  questions: Question[];
}

export interface FeedbackRequest {
  question: string;
  rubric: RubricItem[];
  answer: string;
}

export interface FeedbackResponse {
  whatLandedWell: string;
  whatIsMissing: string;
  howToStrengthen: string;
}

export type AppPhase = 'input' | 'loading-questions' | 'questions';
export type FeedbackPhase = 'idle' | 'loading' | 'ready' | 'error';
