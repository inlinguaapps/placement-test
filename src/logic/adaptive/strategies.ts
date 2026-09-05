// src\logic\adaptive\strategies.ts

import { AdaptiveStrategy, StrategyName } from '@/types/test'

export const TEST_STRATEGIES: Record<StrategyName, AdaptiveStrategy> = {
  // Good for KG and Prathom (Forgiving)
  HYBRID_STANDARD: {
    name: 'Standard Hybrid (2-of-3 Up)',
    minQuestions: 12,
    maxQuestions: 20,
    shouldMoveUp: (history) =>
      history.slice(-3).filter((v) => v === true).length >= 2,
    shouldMoveDown: (history) =>
      history.slice(-3).every((v) => v === false) && history.length >= 3,
  },
  // Good for Matayom (Strict)
  STRICT_ACADEMIC: {
    name: 'Strict Academic (3-Streak)',
    minQuestions: 15,
    maxQuestions: 25,
    shouldMoveUp: (history) =>
      history.slice(-3).every((v) => v === true) && history.length >= 3,
    shouldMoveDown: (history) =>
      history.slice(-3).every((v) => v === false) && history.length >= 3,
  },
  // Use for quick placement or demo tests
  FAST_TRACK: {
    name: 'Rapid Assessment',
    minQuestions: 8,
    maxQuestions: 12,
    shouldMoveUp: (history) =>
      history.slice(-2).every((v) => v === true) && history.length >= 2,
    shouldMoveDown: (history) =>
      history.slice(-2).every((v) => v === false) && history.length >= 2,
  },
  // Dynamic 6-Question window with fast-exit triggers
 SIX_QUESTION_DYNAMIC: {
    name: 'Universal Dynamic Assessment',
    minQuestions: 18, // Raised from 15 so every test gets a thorough baseline
    maxQuestions: 30,

    // Moves up if 4 correct answers are found in the recent window of up to 6
    shouldMoveUp: (history) => {
      if (history.length < 4) return false
      const recent = history.slice(-6)
      return recent.filter((v) => v === true).length >= 4
    },

    // Drops down if 3 wrong answers are found in the recent window of up to 6
    shouldMoveDown: (history) => {
      if (history.length < 3) return false
      const recent = history.slice(-6)
      return recent.filter((v) => v === false).length >= 3
    },
  },
}
