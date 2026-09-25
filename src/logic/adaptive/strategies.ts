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


import { AdaptiveStrategy, StrategyName } from '@/types/test';

export const SIX_QUESTION_DYNAMIC: AdaptiveStrategy = {
  name: 'SIX_QUESTION_DYNAMIC',
  minQuestions: 18,
  maxQuestions: 30,
  shouldMoveUp: (history) => {
    if (history.length < 6) return false;
    const recentSix = history.slice(-6);
    const correctCount = recentSix.filter(Boolean).length;
    return correctCount >= 4;
  },
  shouldMoveDown: (history) => {
    if (history.length < 6) return false;
    const recentSix = history.slice(-6);
    const incorrectCount = recentSix.filter((val) => !val).length;
    return incorrectCount >= 3;
  }
};

export const HYBRID_STANDARD: AdaptiveStrategy = {
  name: 'HYBRID_STANDARD',
  minQuestions: 12,
  maxQuestions: 24,
  shouldMoveUp: (history) => {
    if (history.length < 4) return false;
    const recentFour = history.slice(-4);
    return recentFour.filter(Boolean).length >= 3;
  },
  shouldMoveDown: (history) => {
    if (history.length < 4) return false;
    const recentFour = history.slice(-4);
    return recentFour.filter((v) => !v).length >= 2;
  }
};

export const STRICT_ACADEMIC: AdaptiveStrategy = {
  name: 'STRICT_ACADEMIC',
  minQuestions: 20,
  maxQuestions: 35,
  shouldMoveUp: (history) => {
    if (history.length < 5) return false;
    return history.slice(-5).every(Boolean);
  },
  shouldMoveDown: (history) => {
    if (history.length < 5) return false;
    return history.slice(-5).filter((v) => !v).length >= 2;
  }
};

export const FAST_TRACK: AdaptiveStrategy = {
  name: 'FAST_TRACK',
  minQuestions: 10,
  maxQuestions: 18,
  shouldMoveUp: (history) => {
    if (history.length < 3) return false;
    return history.slice(-3).every(Boolean);
  },
  shouldMoveDown: (history) => {
    if (history.length < 3) return false;
    return history.slice(-3).filter((v) => !v).length >= 2;
  }
};

export const STRATEGIES: Record<StrategyName, AdaptiveStrategy> = {
  SIX_QUESTION_DYNAMIC,
  HYBRID_STANDARD,
  STRICT_ACADEMIC,
  FAST_TRACK
};

export function calculateNextLevel(
  currentLevel: string,
  direction: 'up' | 'down',
  levelsLadder: string[]
): string {
  const currentIndex = levelsLadder.findIndex(
    (l) => l.toLowerCase() === currentLevel.toLowerCase()
  );

  if (currentIndex === -1) return currentLevel;

  if (direction === 'up') {
    const nextIndex = Math.min(currentIndex + 1, levelsLadder.length - 1);
    return levelsLadder[nextIndex];
  } else {
    const prevIndex = Math.max(currentIndex - 1, 0);
    return levelsLadder[prevIndex];
  }
}