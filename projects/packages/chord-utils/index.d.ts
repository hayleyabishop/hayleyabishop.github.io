export function normalizeChordInput(input: string): string;
export function extractRootNote(input: string): string | null;
export function generateChordVariations(rootNote: string): string[];
export function filterAndPrioritizeVariations(
  variations: string[],
  input: string,
  maxSuggestions?: number
): string[];
export function getSuggestions(input: string, maxSuggestions?: number): string[];
export function parseChord(input: string): string | null;
