// // src\logic\adaptive\strategies.ts

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
//   // Good for Matayom (Strict)
//   STRICT_ACADEMIC: {
//     name: 'Strict Academic (3-Streak)',
//     minQuestions: 15,
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
//   // Dynamic 6-Question window with fast-exit triggers
//  SIX_QUESTION_DYNAMIC: {
//     name: 'Universal Dynamic Assessment',
//     minQuestions: 18, // Raised from 15 so every test gets a thorough baseline
//     maxQuestions: 30,

//     // Moves up if 4 correct answers are found in the recent window of up to 6
//     shouldMoveUp: (history) => {
//       if (history.length < 4) return false
//       const recent = history.slice(-6)
//       return recent.filter((v) => v === true).length >= 4
//     },

//     // Drops down if 3 wrong answers are found in the recent window of up to 6
//     shouldMoveDown: (history) => {
//       if (history.length < 3) return false
//       const recent = history.slice(-6)
//       return recent.filter((v) => v === false).length >= 3
//     },
//   },
// }


// src/logic/adaptive/strategies.ts

import {
  AdaptiveAction,
  AdaptiveStrategy,
  CEFRLevel,
  StrategyContext,
  StrategyName,
} from '@/types/test'

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
    minQuestions: 18,
    maxQuestions: 30,
    shouldMoveUp: (history) => {
      if (history.length < 4) return false
      const recent = history.slice(-6)
      return recent.filter((v) => v === true).length >= 4
    },
    shouldMoveDown: (history) => {
      if (history.length < 3) return false
      const recent = history.slice(-6)
      return recent.filter((v) => v === false).length >= 3
    },
  },
}

/**
 * Evaluates test progress using dynamic availableLevels and ceiling tracking.
 */
export const evaluateStrategy = (
  strategyName: StrategyName,
  context: StrategyContext
): AdaptiveAction => {
  const strategy = TEST_STRATEGIES[strategyName] || TEST_STRATEGIES['SIX_QUESTION_DYNAMIC']
  const { history, levelHistory, totalQuestions, currentLevel, availableLevels } = context

  // 1. Max Questions Circuit Breaker
  if (totalQuestions >= strategy.maxQuestions) {
    return 'COMPLETE'
  }

  const currentIdx = availableLevels.indexOf(currentLevel)

  // 2. Determine highest failed level index (ceiling)
  let highestFailedIdx = -1
  for (let i = 0; i < levelHistory.length - 1; i++) {
    const fromIdx = availableLevels.indexOf(levelHistory[i])
    const toIdx = availableLevels.indexOf(levelHistory[i + 1])

    if (toIdx < fromIdx) {
      // Step down detected
      if (fromIdx > highestFailedIdx) {
        highestFailedIdx = fromIdx
      }
    }
  }

  // 3. Evaluate Move Down
  if (strategy.shouldMoveDown(history)) {
    // If already at lowest available level, check if min questions met
    if (currentIdx <= 0) {
      if (totalQuestions >= strategy.minQuestions) {
        return 'COMPLETE'
      }
      return 'CONTINUE'
    }
    return 'MOVE_DOWN'
  }

  // 4. Evaluate Move Up
  if (strategy.shouldMoveUp(history)) {
    const targetNextIdx = currentIdx + 1

    // Check if at the top level or attempting to re-enter a failed level ceiling
    const isAtTop = targetNextIdx >= availableLevels.length
    const hitsCeiling = highestFailedIdx !== -1 && targetNextIdx >= highestFailedIdx

    if (isAtTop || hitsCeiling) {
      // Cannot move up further
      if (totalQuestions >= strategy.minQuestions) {
        return 'COMPLETE'
      }
      return 'CONTINUE' // Pad remaining questions at current level without moving up
    }

    return 'MOVE_UP'
  }

  return 'CONTINUE'
}