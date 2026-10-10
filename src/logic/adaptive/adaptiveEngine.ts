import { AdaptiveStrategy, StrategyName } from '@/types/test'

export const SIX_QUESTION_DYNAMIC: AdaptiveStrategy = {
  name: 'SIX_QUESTION_DYNAMIC',
  minQuestions: 18,
  maxQuestions: 36,
  shouldMoveUp: (history) => {
    if (history.length < 4) return false
    const recentSix = history.slice(-6)
    const correctCount = recentSix.filter(Boolean).length
    return correctCount >= 4
  },
  shouldMoveDown: (history) => {
    if (history.length < 3) return false
    const recentSix = history.slice(-6)
    const incorrectCount = recentSix.filter((val) => !val).length
    return incorrectCount >= 3
  },
}

export const HYBRID_STANDARD: AdaptiveStrategy = {
  name: 'HYBRID_STANDARD',
  minQuestions: 12,
  maxQuestions: 24,
  shouldMoveUp: (history) => {
    if (history.length < 4) return false
    const recentFour = history.slice(-4)
    return recentFour.filter(Boolean).length >= 3
  },
  shouldMoveDown: (history) => {
    if (history.length < 4) return false
    const recentFour = history.slice(-4)
    return recentFour.filter((v) => !v).length >= 2
  },
}

export const STRICT_ACADEMIC: AdaptiveStrategy = {
  name: 'STRICT_ACADEMIC',
  minQuestions: 20,
  maxQuestions: 35,
  shouldMoveUp: (history) => {
    if (history.length < 5) return false
    return history.slice(-5).every(Boolean)
  },
  shouldMoveDown: (history) => {
    if (history.length < 5) return false
    return history.slice(-5).filter((v) => !v).length >= 2
  },
}

export const FAST_TRACK: AdaptiveStrategy = {
  name: 'FAST_TRACK',
  minQuestions: 10,
  maxQuestions: 18,
  shouldMoveUp: (history) => {
    if (history.length < 3) return false
    return history.slice(-3).every(Boolean)
  },
  shouldMoveDown: (history) => {
    if (history.length < 3) return false
    return history.slice(-3).filter((v) => !v).length >= 2
  },
}

export const STRATEGIES: Record<StrategyName, AdaptiveStrategy> = {
  SIX_QUESTION_DYNAMIC,
  HYBRID_STANDARD,
  STRICT_ACADEMIC,
  FAST_TRACK,
}

export function calculateNextLevel(
  currentLevel: string,
  direction: 'up' | 'down',
  levelsLadder: readonly string[],
): string {
  const currentIndex = levelsLadder.findIndex(
    (l) => l.toLowerCase() === currentLevel.toLowerCase(),
  )

  if (currentIndex === -1) return currentLevel

  if (direction === 'up') {
    const nextIndex = Math.min(currentIndex + 1, levelsLadder.length - 1)
    return levelsLadder[nextIndex]
  } else {
    const prevIndex = Math.max(currentIndex - 1, 0)
    return levelsLadder[prevIndex]
  }
}

export interface AdaptiveEngineState {
  currentLevel: string
  totalAnswered: number
  highestPassedLevel: string | null
  isLevelEstablished: boolean
  currentLevelHistory: boolean[]
}

export interface AdaptiveStepResult {
  nextLevel: string
  isFinished: boolean
  updatedFloor: string | null
  isLevelEstablished: boolean
  newLevelHistory: boolean[]
}

export function processAdaptiveAnswer({
  strategyName,
  isCorrect,
  categoryLevels,
  state,
}: {
  strategyName: StrategyName
  isCorrect: boolean
  categoryLevels: readonly string[]
  state: AdaptiveEngineState
}): AdaptiveStepResult {
  const strategy = STRATEGIES[strategyName] || STRATEGIES.SIX_QUESTION_DYNAMIC
  const total = state.totalAnswered + 1
  const newLevelHistory = [...state.currentLevelHistory, isCorrect]

  // A. MAX QUESTIONS LIMIT REACHED
  if (total >= strategy.maxQuestions) {
    return {
      nextLevel: state.currentLevel,
      isFinished: true,
      updatedFloor: state.highestPassedLevel,
      isLevelEstablished: state.isLevelEstablished,
      newLevelHistory,
    }
  }

  let nextLevel = state.currentLevel
  let updatedFloor = state.highestPassedLevel
  let isLevelEstablished = state.isLevelEstablished

  // B. IF LEVEL IS ALREADY ESTABLISHED / LOCKED
  if (isLevelEstablished) {
    if (total >= strategy.minQuestions) {
      return {
        nextLevel: state.currentLevel,
        isFinished: true,
        updatedFloor,
        isLevelEstablished,
        newLevelHistory,
      }
    }
  } 
  // C. NORMAL ADAPTIVE MOVEMENT (UP)
  else if (strategy.shouldMoveUp(newLevelHistory)) {
    const currentIdx = categoryLevels.findIndex(
      (l) => l.toLowerCase() === state.currentLevel.toLowerCase(),
    )
    const prevFloorIdx = categoryLevels.findIndex(
      (l) => l.toLowerCase() === (state.highestPassedLevel || '').toLowerCase(),
    )

    if (currentIdx > prevFloorIdx) {
      updatedFloor = state.currentLevel
    }

    nextLevel = calculateNextLevel(state.currentLevel, 'up', categoryLevels)
    return {
      nextLevel,
      isFinished: false,
      updatedFloor,
      isLevelEstablished: false,
      newLevelHistory: [],
    }
  } 
  // D. NORMAL ADAPTIVE MOVEMENT (DOWN)
  else if (strategy.shouldMoveDown(newLevelHistory)) {
    const calculatedNext = calculateNextLevel(state.currentLevel, 'down', categoryLevels)
    const floorIdx = categoryLevels.findIndex(
      (l) => l.toLowerCase() === (state.highestPassedLevel || '').toLowerCase(),
    )
    const nextIdx = categoryLevels.findIndex(
      (l) => l.toLowerCase() === calculatedNext.toLowerCase(),
    )

    // CEILING EXIT CONDITION MET
    if (state.highestPassedLevel && nextIdx <= floorIdx) {
      const targetLevel = state.currentLevel

      if (total >= strategy.minQuestions) {
        return {
          nextLevel: targetLevel,
          isFinished: true,
          updatedFloor,
          isLevelEstablished: true,
          newLevelHistory: [],
        }
      }

      isLevelEstablished = true
      nextLevel = targetLevel
      return {
        nextLevel,
        isFinished: false,
        updatedFloor,
        isLevelEstablished,
        newLevelHistory: [],
      }
    }

    nextLevel = calculatedNext
    return {
      nextLevel,
      isFinished: false,
      updatedFloor,
      isLevelEstablished: false,
      newLevelHistory: [],
    }
  }

  return {
    nextLevel,
    isFinished: false,
    updatedFloor,
    isLevelEstablished,
    newLevelHistory,
  }
}