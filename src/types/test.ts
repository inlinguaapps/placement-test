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


// src/types/test.ts

import { CEFRLevel, TestCategory } from './level-config'

export type StrategyName =
  | 'HYBRID_STANDARD'
  | 'STRICT_ACADEMIC'
  | 'FAST_TRACK'
  | 'SIX_QUESTION_DYNAMIC'

export interface AdaptiveStrategy {
  name: string
  minQuestions: number
  maxQuestions: number
  shouldMoveUp: (history: boolean[]) => boolean
  shouldMoveDown: (history: boolean[]) => boolean
}

export interface Question {
  id: string
  level: CEFRLevel
  question_text: string
  options: string[]
  correct_answer: string
  audio_url?: string
  image_url?: string
}

export interface HistoryEntry {
  level: CEFRLevel
  correct: boolean
}

export interface TestStats {
  currentLevel: CEFRLevel
  totalAnswered: number
}

export interface TestSession {
  sessionId: string
  testType: TestCategory
  strategyName: StrategyName
}