// src/types/level-config.ts

export type TestCategory = 'kg' | 'prathom' | 'matayom' | 'adult' | 'KG' | 'Prathom' | 'Mathayom' | 'Adult'

// Complete master list of CEFR levels in ascending order
export const CEFR_LEVELS = [
  'Pre-A1',
  'A1',
  'A1+',
  'A2',
  'A2+',
  'B1',
  'B1+',
  'B2',
  'C1',
  'C2',
] as const

export type CEFRLevel = (typeof CEFR_LEVELS)[number] | string

export const CATEGORY_LEVELS: Record<string, readonly string[]> = {
  kg: ['Pre-A1', 'K1', 'K2', 'K3'],
  KG: ['Pre-A1', 'A1'],
  prathom: ['Pre-A1', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6'],
  Prathom: ['Pre-A1', 'A1', 'A1+'],
  matayom: ['Pre-A1', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6'],
  Mathayom: ['A1+', 'A2', 'A2+', 'B1', 'B1+', 'B2'],
  adult: ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
  Adult: ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
} as const

/**
 * Helper to get initial baseline level for a category
 */
export function getInitialLevel(category: string): string {
  const levels = getLevelsForCategory(category)
  return levels[0] ?? 'Pre-A1'
}

/**
 * Helper to get all allowed levels for a category (handles upper and lower case)
 */
export function getLevelsForCategory(category?: string): readonly string[] {
  if (!category) return CEFR_LEVELS
  const match = CATEGORY_LEVELS[category] || CATEGORY_LEVELS[category.toLowerCase()]
  return match || CEFR_LEVELS
}

/**
 * Alias to support components requesting levels by test type string
 */
export function getLevelsForTestType(testType: string): readonly string[] {
  return getLevelsForCategory(testType)
}