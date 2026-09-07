// src\types\level-config.ts

export type TestCategory = 'KG' | 'Prathom' | 'Matayom' | 'Adult'

export const CATEGORY_LEVELS: Record<TestCategory, string[]> = {
  KG: ['Pre-A1', 'A1'],
  Prathom: ['Pre-A1', 'A1', 'A1+'],
  Matayom: ['A1+', 'A2', 'A2+', 'B1', 'B1+', 'B2'],
  Adult: ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
}

/**
  Normalizes incoming test type strings to matching TestCategory keys.
 */
export function getLevelsForTestType(testType: string): string[] {
  const normalized = Object.keys(CATEGORY_LEVELS).find(
    (key) => key.toLowerCase() === testType.toLowerCase(),
  ) as TestCategory | undefined

  return normalized
    ? CATEGORY_LEVELS[normalized]
    : CATEGORY_LEVELS.Adult // Safe default fallback
}