// // level-config.ts
// export type TestCategory = 'KG' | 'Prathom' | 'Mathayom' | 'Adult'

// export const CATEGORY_LEVELS: Record<TestCategory, string[]> = {
//   KG: ['Pre-A1', 'A1'],
//   Prathom: ['Pre-A1', 'A1', 'A1+'],
//   Mathayom: ['A1+', 'A2', 'A2+', 'B1', 'B1+', 'B2'],
//   Adult: ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
// }

// level-config.ts

export type TestCategory = 'KG' | 'Prathom' | 'Matayom' | 'Adult'

// Valid CEFR/EFL level tags (ensures strict type safety when querying Supabase questions)
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

export const CATEGORY_LEVELS: Record<TestCategory, readonly CEFRLevel[]> = {
  KG: ['Pre-A1', 'A1'],
  Prathom: ['Pre-A1', 'A1', 'A1+'],
  Matayom: ['A1+', 'A2', 'A2+', 'B1', 'B1+', 'B2'],
  Adult: ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
} as const

/**
 * Helper to get initial baseline level for a category (e.g. entry-level index)
 */
export function getInitialLevel(category: TestCategory): CEFRLevel {
  return CATEGORY_LEVELS[category][0]
}