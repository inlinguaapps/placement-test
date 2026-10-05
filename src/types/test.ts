// // src\types\test.ts

// export type StrategyName =
//   | 'HYBRID_STANDARD'
//   | 'STRICT_ACADEMIC'
//   | 'FAST_TRACK'
//   | 'SIX_QUESTION_DYNAMIC'

// export interface AdaptiveStrategy {
//   name: string
//   minQuestions: number
//   maxQuestions: number
//   shouldMoveUp: (history: boolean[]) => boolean
//   shouldMoveDown: (history: boolean[]) => boolean
// }


export type StrategyName = 
  | 'HYBRID_STANDARD' 
  | 'STRICT_ACADEMIC' 
  | 'FAST_TRACK' 
  | 'SIX_QUESTION_DYNAMIC';

export interface HistoryEntry {
  questionId: string;
  level: string;
  isCorrect: boolean;
  selectedOption: string;
}

export interface AdaptiveTestStats {
  currentLevel: string;
  totalAnswered: number;
  correctAnswers: number;
}

export interface Question {
  id: string;
  test_type: string;
  level: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c?: string;
  option_d?: string;
  correct_answer: string;
  media_url?: string;
  question_type?: 'standard' | 'listen_choose' | 'dialogue' | 'image_listen_choose';
  audio_url?: string;
  image_url?: string;
  audio_url_a?: string;
  audio_url_b?: string;
  audio_url_c?: string;
  audio_url_d?: string;
}

export interface AdaptiveStrategy {
  name: StrategyName;
  minQuestions: number;
  maxQuestions: number;
  shouldMoveUp: (historyAtCurrentLevel: readonly boolean[]) => boolean;
  shouldMoveDown: (historyAtCurrentLevel: readonly boolean[]) => boolean;
}