import { useMemo } from "react";
import { getSuggestions } from "chord-utils";

/**
 * useChordSuggestions
 * Lightweight hook around chord-utils.getSuggestions.
 * Given a raw input string, returns a small list of chord suggestions.
 */
export function useChordSuggestions(input: string, maxSuggestions: number = 5) {
  const suggestions = useMemo(() => {
    if (!input || input.trim().length === 0) return [] as string[];
    return getSuggestions(input, maxSuggestions) || [];
  }, [input, maxSuggestions]);

  return suggestions;
}
