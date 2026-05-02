// src\types\test.ts

// Define logic styles rather than school levels
export type StrategyName = 'HYBRID_STANDARD' | 'STRICT_ACADEMIC' | 'FAST_TRACK'

export interface AdaptiveStrategy {
  name: string
  minQuestions: number
  maxQuestions: number
  shouldMoveUp: (history: boolean[]) => boolean
  shouldMoveDown: (history: boolean[]) => boolean
}
