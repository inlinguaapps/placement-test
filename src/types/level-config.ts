export type TestCategory = 'kg' | 'prathom' | 'matayom' | 'adult';

export const CATEGORY_LEVELS: Record<TestCategory, string[]> = {
  kg: ['Pre-A1', 'K1', 'K2', 'K3'],
  prathom: ['Pre-A1', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6'],
  matayom: ['Pre-A1', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6'],
  adult: ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']
};

export const CEFR_LEVELS = ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export function getLevelsForCategory(category?: string): string[] {
  if (!category) return CEFR_LEVELS;
  const key = category.toLowerCase() as TestCategory;
  return CATEGORY_LEVELS[key] || CEFR_LEVELS;
}