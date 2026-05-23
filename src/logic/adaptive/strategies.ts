// src\logic\adaptive\strategies.ts

// import { AdaptiveStrategy, StrategyName } from '@/types/test'

// export const TEST_STRATEGIES: Record<StrategyName, AdaptiveStrategy> = {
//   // Good for KG and Prathom (Forgiving)
//   HYBRID_STANDARD: {
//     name: 'Standard Hybrid (2-of-3 Up)',
//     minQuestions: 12,
//     maxQuestions: 20,
//     shouldMoveUp: (history) =>
//       history.slice(-3).filter((v) => v === true).length >= 2,
//     shouldMoveDown: (history) =>
//       history.slice(-3).every((v) => v === false) && history.length >= 3,
//   },
//   // Good for Adults and Matayom (Strict)
//   STRICT_ACADEMIC: {
//     name: 'Strict Academic (3-Streak)',
//     minQuestions: 15, // Higher minimum for more precision
//     maxQuestions: 25,
//     shouldMoveUp: (history) =>
//       history.slice(-3).every((v) => v === true) && history.length >= 3,
//     shouldMoveDown: (history) =>
//       history.slice(-3).every((v) => v === false) && history.length >= 3,
//   },
//   // Use for quick placement or demo tests
//   FAST_TRACK: {
//     name: 'Rapid Assessment',
//     minQuestions: 8,
//     maxQuestions: 12,
//     shouldMoveUp: (history) =>
//       history.slice(-2).every((v) => v === true) && history.length >= 2,
//     shouldMoveDown: (history) =>
//       history.slice(-2).every((v) => v === false) && history.length >= 2,
//   },
// }

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
    name: 'Dynamic 6-Question Window',
    minQuestions: 15,
    maxQuestions: 30,

    // Moves up the second 4 correct answers are found in the recent window
    shouldMoveUp: (history) => {
      if (history.length < 4) return false // Needs at least 4 questions to have 4 correct

      // Look at the last 6 questions (or fewer if the test just started)
      const recentHistory = history.slice(-6)
      return recentHistory.filter((v) => v === true).length >= 4
    },

    // Drops down the second 3 wrong answers are found in the recent window
    shouldMoveDown: (history) => {
      if (history.length < 3) return false // Needs at least 3 questions to have 3 wrong

      // Look at the last 6 questions (or fewer if the test just started)
      const recentHistory = history.slice(-6)
      return recentHistory.filter((v) => v === false).length >= 3
    },
  },
}
