// =============================================================================
// CHORD PARSER
// Handles fuzzy matching, validation, and chord parsing
// =============================================================================

class ChordParser {
  constructor(availableChords = []) {
    this.availableChords = availableChords;
    this.chordHistory = this.loadChordHistory();
  }

  updateAvailableChords(chords) {
    this.availableChords = chords;
  }

  parseChord(input) {
    if (!input || typeof input !== 'string') return null;
    
    const cleanInput = input.trim();
    if (!cleanInput) return null;

    // Try exact match first
    const exactMatch = this.availableChords.find(chord => 
      chord.toLowerCase() === cleanInput.toLowerCase()
    );
    if (exactMatch) return exactMatch;

    // Try fuzzy matching
    const fuzzyMatches = this.getFuzzyMatches(cleanInput);
    return fuzzyMatches.length > 0 ? fuzzyMatches[0].chord : null;
  }

  getFuzzyMatches(input, maxResults = 5) {
    if (!input) return [];

    const cleanInput = input.toLowerCase().trim();
    const matches = [];

    this.availableChords.forEach(chord => {
      const score = this.calculateSimilarity(cleanInput, chord.toLowerCase());
      if (score > 0.3) { // Minimum similarity threshold
        matches.push({ chord, score });
      }
    });

    // Sort by similarity score (descending) and return top results
    return matches
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);
  }

  getSuggestions(input, maxSuggestions = 5) {
    if (!input || input.length < 1) {
      // Return recent history if no input
      return this.chordHistory
        .filter(chord => this.availableChords.includes(chord))
        .slice(0, maxSuggestions);
    }

    const fuzzyMatches = this.getFuzzyMatches(input, maxSuggestions);
    return fuzzyMatches.map(match => match.chord);
  }

  validateChord(chord) {
    if (!chord) return false;
    return this.availableChords.some(availableChord => 
      availableChord.toLowerCase() === chord.toLowerCase()
    );
  }

  calculateSimilarity(input, target) {
    // Multiple similarity algorithms combined
    const levenshteinScore = 1 - (this.levenshteinDistance(input, target) / Math.max(input.length, target.length));
    const startsWithScore = target.startsWith(input) ? 0.8 : 0;
    const containsScore = target.includes(input) ? 0.6 : 0;
    const soundexScore = this.soundexMatch(input, target) ? 0.4 : 0;

    // Weighted combination
    return Math.max(levenshteinScore * 0.4, startsWithScore, containsScore, soundexScore);
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];
    const len1 = str1.length;
    const len2 = str2.length;

    // Initialize matrix
    for (let i = 0; i <= len2; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len1; j++) {
      matrix[0][j] = j;
    }

    // Fill matrix
    for (let i = 1; i <= len2; i++) {
      for (let j = 1; j <= len1; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }

    return matrix[len2][len1];
  }

  soundexMatch(str1, str2) {
    // Simple soundex-like matching for musical notes
    const normalize = (str) => {
      return str
        .replace(/[#♯]/g, 'sharp')
        .replace(/[b♭]/g, 'flat')
        .replace(/maj/g, 'major')
        .replace(/min/g, 'minor')
        .replace(/dim/g, 'diminished')
        .replace(/aug/g, 'augmented')
        .toLowerCase();
    };

    return normalize(str1) === normalize(str2);
  }

  // Enhanced chord name normalization
  normalizeChordName(chordName) {
    if (!chordName) return '';

    return chordName
      // Normalize enharmonic equivalents
      .replace(/C#|Db/g, 'C#/Db')
      .replace(/D#|Eb/g, 'D#/Eb')
      .replace(/F#|Gb/g, 'F#/Gb')
      .replace(/G#|Ab/g, 'G#/Ab')
      .replace(/A#|Bb/g, 'A#/Bb')
      // Normalize chord types
      .replace(/major/gi, '')
      .replace(/minor/gi, 'm')
      .replace(/diminished/gi, 'dim')
      .replace(/augmented/gi, 'aug')
      .replace(/dominant/gi, '')
      .trim();
  }

  // Chord history management
  addToHistory(chord) {
    if (!chord || !this.validateChord(chord)) return;

    // Remove if already exists
    const index = this.chordHistory.indexOf(chord);
    if (index > -1) {
      this.chordHistory.splice(index, 1);
    }

    // Add to beginning
    this.chordHistory.unshift(chord);

    // Keep only last 20 chords
    this.chordHistory = this.chordHistory.slice(0, 20);

    // Save to localStorage
    this.saveChordHistory();
  }

  loadChordHistory() {
    try {
      const stored = localStorage.getItem('autoharp_chord_history');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Error loading chord history:', error);
      return [];
    }
  }

  saveChordHistory() {
    try {
      localStorage.setItem('autoharp_chord_history', JSON.stringify(this.chordHistory));
    } catch (error) {
      console.warn('Error saving chord history:', error);
    }
  }

  // Advanced chord parsing with better error handling
  parseAdvancedChord(input) {
    const cleanInput = input.trim();
    
    // Handle common input variations
    const variations = [
      cleanInput,
      cleanInput.replace(/sharp/gi, '#'),
      cleanInput.replace(/flat/gi, 'b'),
      cleanInput.replace(/major/gi, ''),
      cleanInput.replace(/minor/gi, 'm'),
      this.normalizeChordName(cleanInput)
    ];

    for (const variation of variations) {
      const match = this.parseChord(variation);
      if (match) return match;
    }

    return null;
  }

  // Get chord suggestions with context
  getContextualSuggestions(input, recentChords = []) {
    const baseSuggestions = this.getSuggestions(input);
    
    // If we have recent chords, suggest harmonically related chords
    if (recentChords.length > 0) {
      const relatedChords = this.getHarmonicallyRelatedChords(recentChords[recentChords.length - 1]);
      const contextualSuggestions = relatedChords.filter(chord => 
        this.availableChords.includes(chord) && 
        !baseSuggestions.includes(chord)
      );
      
      return [...baseSuggestions, ...contextualSuggestions.slice(0, 2)];
    }

    return baseSuggestions;
  }

  getHarmonicallyRelatedChords(chord) {
    // Simple harmonic relationship suggestions
    // This could be expanded with more sophisticated music theory
    const relationships = {
      'C': ['F', 'G', 'Am', 'Dm'],
      'G': ['C', 'D', 'Em', 'Am'],
      'F': ['C', 'Bb', 'Dm', 'Gm'],
      'Am': ['C', 'F', 'G', 'Dm'],
      'Dm': ['F', 'Bb', 'Am', 'C'],
      'Em': ['G', 'C', 'Am', 'D']
    };

    const root = chord.replace(/[^A-G#b]/g, '');
    return relationships[root] || [];
  }
}

export { ChordParser };
