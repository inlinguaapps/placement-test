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
  // Good for Adults and Matayom (Strict)
  STRICT_ACADEMIC: {
    name: 'Strict Academic (3-Streak)',
    minQuestions: 15, // Higher minimum for more precision
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
}
