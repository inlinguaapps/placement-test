// level-config.ts
export type TestCategory = 'KG' | 'Prathom' | 'Mathayom' | 'Adult'

export const CATEGORY_LEVELS: Record<TestCategory, string[]> = {
  KG: ['Pre-A1', 'A1'],
  Prathom: ['Pre-A1', 'A1', 'A1+'],
  Matayom: ['A1+', 'A2', 'A2+', 'B1', 'B1+', 'B2'],
  Adult: ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
}