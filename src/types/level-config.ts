// // level-config.ts
// export type TestCategory = 'KG' | 'Prathom' | 'Mathayom' | 'Adult'

// export const CATEGORY_LEVELS: Record<TestCategory, string[]> = {
//   KG: ['Pre-A1', 'A1'],
//   Prathom: ['Pre-A1', 'A1', 'A1+'],
//   Mathayom: ['A1+', 'A2', 'A2+', 'B1', 'B1+', 'B2'],
//   Adult: ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
// }

// src/types/level-config.ts

export type TestCategory = 'KG' | 'Prathom' | 'Mathayom' | 'Adult'

// Valid CEFR/EFL level tags (matches database test_questions level column)
export type CEFRLevel =
  | 'Pre-A1'
  | 'A1'
  | 'A1+'
  | 'A2'
  | 'A2+'
  | 'B1'
  | 'B1+'
  | 'B2'
  | 'C1'
  | 'C2'

// Complete master list of CEFR levels in ascending order
export const CEFR_LEVELS: readonly CEFRLevel[] = [
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

export const CATEGORY_LEVELS: Record<TestCategory, readonly CEFRLevel[]> = {
  KG: ['Pre-A1', 'A1'],
  Prathom: ['Pre-A1', 'A1', 'A1+'],
  Mathayom: ['A1+', 'A2', 'A2+', 'B1', 'B1+', 'B2'],
  Adult: ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
} as const

/**
 * Helper to get initial baseline level for a category
 */
export function getInitialLevel(category: TestCategory): CEFRLevel {
  return CATEGORY_LEVELS[category]?.[0] ?? 'Pre-A1'
}