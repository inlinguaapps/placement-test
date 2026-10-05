

// // src\logic\adaptive\strategies.ts

// import { AdaptiveStrategy, StrategyName } from '@/types/test';

// export const SIX_QUESTION_DYNAMIC: AdaptiveStrategy = {
//   name: 'SIX_QUESTION_DYNAMIC',
//   minQuestions: 18,
//   maxQuestions: 30,
//   shouldMoveUp: (history) => {
//     if (history.length < 4) return false;
//     const recentSix = history.slice(-6);
//     const correctCount = recentSix.filter(Boolean).length;
//     return correctCount >= 4;
//   },
//   shouldMoveDown: (history) => {
//     if (history.length < 3) return false;
//     const recentSix = history.slice(-6);
//     const incorrectCount = recentSix.filter((val) => !val).length;
//     return incorrectCount >= 3;
//   }
// };

// export const HYBRID_STANDARD: AdaptiveStrategy = {
//   name: 'HYBRID_STANDARD',
//   minQuestions: 12,
//   maxQuestions: 24,
//   shouldMoveUp: (history) => {
//     if (history.length < 4) return false;
//     const recentFour = history.slice(-4);
//     return recentFour.filter(Boolean).length >= 3;
//   },
//   shouldMoveDown: (history) => {
//     if (history.length < 4) return false;
//     const recentFour = history.slice(-4);
//     return recentFour.filter((v) => !v).length >= 2;
//   }
// };

// export const STRICT_ACADEMIC: AdaptiveStrategy = {
//   name: 'STRICT_ACADEMIC',
//   minQuestions: 20,
//   maxQuestions: 35,
//   shouldMoveUp: (history) => {
//     if (history.length < 5) return false;
//     return history.slice(-5).every(Boolean);
//   },
//   shouldMoveDown: (history) => {
//     if (history.length < 5) return false;
//     return history.slice(-5).filter((v) => !v).length >= 2;
//   }
// };

// export const FAST_TRACK: AdaptiveStrategy = {
//   name: 'FAST_TRACK',
//   minQuestions: 10,
//   maxQuestions: 18,
//   shouldMoveUp: (history) => {
//     if (history.length < 3) return false;
//     return history.slice(-3).every(Boolean);
//   },
//   shouldMoveDown: (history) => {
//     if (history.length < 3) return false;
//     return history.slice(-3).filter((v) => !v).length >= 2;
//   }
// };

// export const STRATEGIES: Record<StrategyName, AdaptiveStrategy> = {
//   SIX_QUESTION_DYNAMIC,
//   HYBRID_STANDARD,
//   STRICT_ACADEMIC,
//   FAST_TRACK
// };

// export function calculateNextLevel(
//   currentLevel: string,
//   direction: 'up' | 'down',
//   levelsLadder: string[]
// ): string {
//   const currentIndex = levelsLadder.findIndex(
//     (l) => l.toLowerCase() === currentLevel.toLowerCase()
//   );

//   if (currentIndex === -1) return currentLevel;

//   if (direction === 'up') {
//     const nextIndex = Math.min(currentIndex + 1, levelsLadder.length - 1);
//     return levelsLadder[nextIndex];
//   } else {
//     const prevIndex = Math.max(currentIndex - 1, 0);
//     return levelsLadder[prevIndex];
//   }
// }



// src/logic/adaptive/strategies.ts

import { AdaptiveStrategy, StrategyName } from '@/types/test';

export const SIX_QUESTION_DYNAMIC: AdaptiveStrategy = {
  name: 'SIX_QUESTION_DYNAMIC',
  minQuestions: 18,
  maxQuestions: 36, // Increased from 30 to allow 1-mistake-per-level progression to C2
  shouldMoveUp: (history) => {
    if (history.length < 4) return false;
    const recentSix = history.slice(-6);
    const correctCount = recentSix.filter(Boolean).length;
    return correctCount >= 4;
  },
  shouldMoveDown: (history) => {
    if (history.length < 3) return false;
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