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

export type StrategyName =
  | 'HYBRID_STANDARD'
  | 'STRICT_ACADEMIC'
  | 'FAST_TRACK'
  | 'SIX_QUESTION_DYNAMIC'

export interface AdaptiveStrategy {
  name: string
  minQuestions: number
  maxQuestions: number
  shouldMoveUp: (history: readonly boolean[]) => boolean
  shouldMoveDown: (history: readonly boolean[]) => boolean
}