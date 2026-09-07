// src\types\test.ts



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

export type CEFRLevel =
  | 'pre-A1'
  | 'A1'
  | 'A1+'
  | 'A2'
  | 'A2+'
  | 'B1'
  | 'B1+'
  | 'B2'
  | 'C1'
  | 'C2'

export type StrategyName =
  | 'HYBRID_STANDARD'
  | 'STRICT_ACADEMIC'
  | 'FAST_TRACK'
  | 'SIX_QUESTION_DYNAMIC'

export type AdaptiveAction = 'MOVE_UP' | 'MOVE_DOWN' | 'COMPLETE' | 'CONTINUE'

export interface StrategyContext {
  history: boolean[]
  levelHistory: CEFRLevel[]
  totalQuestions: number
  currentLevel: CEFRLevel
  availableLevels: CEFRLevel[] // e.g. ['A1+', 'A2', 'A2+', 'B1', 'B1+', 'B2'] for Matayom
}

export interface AdaptiveStrategy {
  name: string
  minQuestions: number
  maxQuestions: number
  shouldMoveUp: (history: boolean[]) => boolean
  shouldMoveDown: (history: boolean[]) => boolean
}