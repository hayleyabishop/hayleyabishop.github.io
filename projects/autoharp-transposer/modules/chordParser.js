// =============================================================================
// CHORD PARSER
// Handles fuzzy matching, validation, and chord parsing
// Enhanced with autoharp-specific transposition and validation
// =============================================================================

import { AutoharpTypes } from './autoharpTypes.js';
import { ChordTransposition } from './chordTransposition.js';

class ChordParser {
  constructor(availableChords = []) {
    this.availableChords = availableChords;
    this.chordHistory = this.loadChordHistory();
    
    // Initialize autoharp integration modules
    this.autoharpTypes = new AutoharpTypes();
    this.transposition = new ChordTransposition();
    
    // Current autoharp type (can be changed via setAutoharpType)
    this.currentAutoharpType = '21-chord';
    
    // Comprehensive list of all valid Western music chords for normalization
    // This is separate from availableChords (which varies by autoharp type)
    this.allValidChords = this.generateAllValidChords();
  }
  
  /**
   * Generate comprehensive list of all valid Western music chords
   * Used for normalization/validation, independent of autoharp type
   */
  generateAllValidChords() {
    const roots = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];
    const chordTypes = [
      '',      // Major
      'm',     // Minor
      '7',     // Dominant 7th
      'maj7',  // Major 7th
      'm7',    // Minor 7th
      'dim',   // Diminished
      'aug',   // Augmented
      'sus2',  // Suspended 2nd
      'sus4',  // Suspended 4th
      'add9',  // Add 9
      '6',     // Major 6th
      'm6',    // Minor 6th
      '9',     // Dominant 9th
      'maj9',  // Major 9th
      'm9',    // Minor 9th
      '11',    // Dominant 11th
      '13',    // Dominant 13th
      'dim7',  // Diminished 7th
      'm7b5',  // Half-diminished
      '7sus4', // Dominant 7 suspended 4
      'maj7#11', // Major 7 sharp 11
      'add2',  // Add 2
      '5'      // Power chord (fifth)
    ];
    
    const allChords = [];
    
    // Generate all combinations
    for (const root of roots) {
      for (const type of chordTypes) {
        allChords.push(root + type);
      }
    }
    
    return allChords;
  }

  updateAvailableChords(chords) {
    this.availableChords = chords;
  }

  /**
   * MODERN FUNCTION: Finds matching chord from available chord list with enhanced fuzzy matching
   * NOTE: This is different from webapp.js parseChordString() which parses notation into structured data
   * Handles spaces, different chord names, capitalizations, and common misspellings
   * @param {string} input - Chord name to search for (e.g., "Cm7", "F#maj7", "c minor", "D major")
   * @returns {string|null} - Matching chord name from available list or null if not found
   */
  parseChord(input) {
    if (!input || typeof input !== 'string') return null;
    
    const cleanInput = input.trim();
    if (!cleanInput) return null;

    // Step 1: Try exact match against all valid chords (for normalization)
    const exactValidMatch = this.allValidChords.find(chord => 
      chord.toLowerCase() === cleanInput.toLowerCase()
    );
    if (exactValidMatch) {
      // Check if this valid chord is available on this autoharp
      const availableMatch = this.availableChords.find(chord => 
        chord.toLowerCase() === exactValidMatch.toLowerCase()
      );
      if (availableMatch) {
        return availableMatch;
      }
      // Return the normalized valid chord even if not available (for user feedback)
      return exactValidMatch;
    }

    // Step 2: Try enhanced chord parsing with normalization against all valid chords
    const normalizedChord = this.normalizeChordInput(cleanInput);
    if (normalizedChord) {
      // Check if normalized chord is valid
      const validNormalizedMatch = this.allValidChords.find(chord => 
        chord.toLowerCase() === normalizedChord.toLowerCase()
      );
      if (validNormalizedMatch) {
        // Check if available on this autoharp
        const availableNormalizedMatch = this.availableChords.find(chord => 
          chord.toLowerCase() === validNormalizedMatch.toLowerCase()
        );
        if (availableNormalizedMatch) {
          return availableNormalizedMatch;
        }
        return validNormalizedMatch;
      }
      
      // Try fuzzy matching against valid chords first
      const validFuzzyMatches = this.getFuzzyMatches(normalizedChord, 5, this.allValidChords);
      if (validFuzzyMatches.length > 0) {
        const validFuzzyMatch = validFuzzyMatches[0].chord;
        // Check if available on this autoharp
        const availableFuzzyMatch = this.availableChords.find(chord => 
          chord.toLowerCase() === validFuzzyMatch.toLowerCase()
        );
        if (availableFuzzyMatch) {
          return availableFuzzyMatch;
        }
        return validFuzzyMatch;
      }
    }

    // Step 3: Try original fuzzy matching as fallback (against available chords only)
    const originalFuzzyMatches = this.getFuzzyMatches(cleanInput, 5, this.availableChords);
    if (originalFuzzyMatches.length > 0) {
      return originalFuzzyMatches[0].chord;
    }
    
    return null;
  }

  /**
   * Normalizes chord input to handle spaces, different names, capitalizations, and misspellings
   * @param {string} input - Raw chord input
   * @returns {string|null} - Normalized chord name or null if cannot be parsed
   */
  normalizeChordInput(input) {
    if (!input || typeof input !== 'string') return null;
    
    // Clean and normalize the input
    let normalized = input.trim().toLowerCase();
    
    // Remove extra spaces and normalize spacing
    normalized = normalized.replace(/\s+/g, ' ');

    // Join accidental separated by space with root (e.g., 'c #' => 'c#', 'd b' => 'db')
    normalized = normalized.replace(/([a-g])\s*([#b])/g, '$1$2');
    
    // Extract root note (handle sharps/flats and case insensitivity)
    const rootMatch = normalized.match(/^([a-g][#b]?)/);
    if (!rootMatch) return null;
    
    let root = rootMatch[1].toUpperCase(); // Normalize to uppercase
    let remainder = normalized.slice(rootMatch[0].length).trim();
    // Collapse spaces in remainder so 'm 7' -> 'm7', 'maj 7' -> 'maj7', etc.
    remainder = remainder.replace(/\s+/g, '');
    
    
    // Handle enharmonic equivalents and normalize sharps/flats
    const enharmonicMap = {
      'db': 'C#', 'c#': 'C#',
      'eb': 'D#', 'd#': 'D#', 
      'gb': 'F#', 'f#': 'F#',
      'ab': 'G#', 'g#': 'G#',
      'bb': 'A#', 'a#': 'A#'
    };
    
    if (enharmonicMap[root.toLowerCase()]) {
      root = enharmonicMap[root.toLowerCase()];
    }
    
    // Define chord type mappings with fuzzy matching
    const chordTypeMappings = {
      // Major variations (empty result means major)
      '': '',
      'major': '',
      'maj': '',
      'majr': '', // misspelling
      'najor': '', // misspelling
      'maojr': '', // misspelling
      
      // Minor variations
      'minor': 'm',
      'min': 'm',
      'mino': 'm', // misspelling
      'mjnor': 'm', // misspelling
      'minpr': 'm', // misspelling
      'm': 'm',
      
      // Augmented variations
      'augmented': 'aug',
      'aug': 'aug',
      '°': 'aug', // degree symbol
      '+': 'aug',
      
      // Diminished variations
      'diminished': 'dim',
      'dim': 'dim',
      'o': 'dim',
      
      // 7th chord variations
      '7': '7',
      '7th': '7',
      'seventh': '7',
      'dom 7': '7',
      'dominant 7': '7',
      'dominant 7th': '7',
      'dominant seventh': '7',
      
      // Major 7th variations
      'maj7': 'maj7',
      'major 7': 'maj7',
      'major 7th': 'maj7',
      'major seventh': 'maj7',
      'm7': 'maj7', // when preceded by capital letter (DM7 -> Dmaj7)
      
      // Minor 7th variations
      'minor 7': 'm7',
      'minor 7th': 'm7',
      'minor seventh': 'm7',
      
      // Dominant 7th with confusing names
      'maj min 7': '7',
      'major minpr 7': '7', // misspelling
      'mm7': '7', // DMm7 -> D7
      
      // Add9 variations
      '9': 'add9',
      'add9': 'add9',
      'add 9': 'add9'
    };
    
    // Handle special cases for compound chord types
    if (remainder) {
      // Handle cases like "DM7" where M should be "maj"
      if (remainder.match(/^m7$/i) && /[A-Z]/.test(input)) {
        // If original input had uppercase M, treat as major 7th
        remainder = 'maj7';
      }
      
      // Handle "DMm7" -> "D7" pattern
      if (remainder.match(/^mm7$/i)) {
        remainder = '7';
      }
      
      // Normalize the chord type
      let chordType = '';
      
      // Try exact mapping first
      if (chordTypeMappings.hasOwnProperty(remainder)) {
        chordType = chordTypeMappings[remainder];
      } else {
        // Try fuzzy matching for chord types
        let bestMatch = '';
        let bestScore = 0;
        
        for (const [key, value] of Object.entries(chordTypeMappings)) {
          if (key === '') continue; // Skip empty key
          
          const score = this.calculateSimilarity(remainder, key);
          if (score > bestScore && score > 0.6) { // Higher threshold for chord types
            bestScore = score;
            bestMatch = value;
          }
        }
        
        chordType = bestMatch;
      }
      
      return root + chordType;
    }
    
    // If no chord type specified, return just the root (major)
    return root;
  }

  getFuzzyMatches(input, maxResults = 5, chordList = null) {
    if (!input) return [];

    const cleanInput = input.toLowerCase().trim();
    const matches = [];
    
    // Use provided chord list or default to availableChords
    const chordsToSearch = chordList || this.availableChords;

    chordsToSearch.forEach(chord => {
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

    // Generate root-note-based chord permutations
    return this.getRootNotePermutations(input, maxSuggestions);
  }

  getRootNotePermutations(input, maxSuggestions = 5) {
    // Extract the root note from the input
    const rootNote = this.extractRootNote(input);
    if (!rootNote) {
      // Fallback to fuzzy matching if we can't extract a root note
      const fuzzyMatches = this.getFuzzyMatches(input, maxSuggestions);
      return fuzzyMatches.map(match => match.chord);
    }

    // Generate common chord variations for the root note
    const chordVariations = this.generateChordVariations(rootNote);
    
    // Filter and prioritize based on input
    const filteredVariations = this.filterAndPrioritizeVariations(chordVariations, input, maxSuggestions);
    
    return filteredVariations;
  }

  extractRootNote(input) {
    // Match common root note patterns (C, C#, Db, etc.)
    const rootNotePattern = /^([A-G][#b]?)/i;
    const match = input.match(rootNotePattern);
    if (!match) return null;
    
    // Normalize to uppercase
    let rootNote = match[1].toUpperCase();
    
    // Handle enharmonic equivalents and normalize sharps/flats
    const enharmonicMap = {
      'DB': 'C#', 'C#': 'C#',
      'EB': 'D#', 'D#': 'D#', 
      'GB': 'F#', 'F#': 'F#',
      'AB': 'G#', 'G#': 'G#',
      'BB': 'A#', 'A#': 'A#'
    };
    
    if (enharmonicMap[rootNote]) {
      rootNote = enharmonicMap[rootNote];
    }
    
    return rootNote;
  }

  generateChordVariations(rootNote) {
    // Common chord types in order of popularity
    const chordTypes = [
      '',        // Major (default)
      'm',       // Minor
      '7',       // Dominant 7th
      'maj7',    // Major 7th
      'm7',      // Minor 7th
      'sus4',    // Suspended 4th
      'sus2',    // Suspended 2nd
      'dim',     // Diminished
      'aug',     // Augmented
      '6',       // Major 6th
      'm6',      // Minor 6th
      '9',       // Dominant 9th
      'maj9',    // Major 9th
      'm9',      // Minor 9th
      'add9',    // Add 9th
      '11',      // 11th
      '13',      // 13th
      '7sus4',   // 7th suspended 4th
      'dim7',    // Diminished 7th
      'aug7',    // Augmented 7th
    ];

    return chordTypes.map(type => rootNote + type);
  }

  filterAndPrioritizeVariations(variations, input, maxSuggestions) {
    const inputLower = input.toLowerCase();
    
    // Score each variation based on how well it matches the input
    const scoredVariations = variations.map(variation => {
      const variationLower = variation.toLowerCase();
      let score = 0;
      
      // Exact match gets highest priority
      if (variationLower === inputLower) {
        score = 100;
      }
      // Starts with input gets high priority
      else if (variationLower.startsWith(inputLower)) {
        score = 80;
      }
      // Contains input gets medium priority
      else if (variationLower.includes(inputLower)) {
        score = 60;
      }
      // Just the root note gets base priority
      else {
        score = 40;
      }
      
      return { chord: variation, score };
    });
    
    // Sort by score (descending) and return top results
    return scoredVariations
      .sort((a, b) => b.score - a.score)
      .slice(0, maxSuggestions)
      .map(item => item.chord);
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

  // =============================================================================
  // LEGACY FUNCTIONS - Moved from webapp.js for better organization
  // =============================================================================

  /**
   * LEGACY FUNCTION: Parses chord notation string into structured data
   * Originally from webapp.js - moved here for better organization
   * NOTE: This is different from parseChord() which finds matching chords from available list
   * @param {string} chordString - Chord notation (e.g., "Cm7", "F#maj7")
   * @returns {Object|null} - {root, type, original} or null if invalid
   */
  static parseChordStringLegacy(chordString) {
    // Match the root note (including sharps/flats and enharmonic equivalents)
    const rootMatch = chordString.match(/^[A-G](#\/[A-G]b|b\/[A-G]#|#|b)?/);
    if (!rootMatch) return null;
    
    const root = rootMatch[0];
    const remainder = chordString.slice(root.length);
    
    // Determine chord type based on remainder
    let chordType = 'major'; // default
    
    if (remainder.includes('m7')) {
      chordType = 'minor7';
    } else if (remainder.includes('maj7')) {
      chordType = 'major7';
    } else if (remainder.includes('m')) {
      chordType = 'minor';
    } else if (remainder.includes('7')) {
      chordType = 'dominant7';
    } else if (remainder.includes('dim')) {
      chordType = 'diminished';
    } else if (remainder.includes('aug')) {
      chordType = 'augmented';
    }
    
    return {
      root: root,
      type: chordType,
      original: chordString
    };
  }

  /**
   * LEGACY FUNCTION: Formats chord name with type
   * Originally from webapp.js - moved here for better organization
   * @param {string} chordName - Root chord name (e.g., "C", "F#")
   * @param {string} chordType - Chord type (e.g., "major", "minor", "7th")
   * @returns {string} - Formatted chord name
   */
  static formatChordNameLegacy(chordName, chordType) {
    switch (chordType) {
      case 'major':
        return chordName;
      case 'minor':
        return chordName + 'm';
      case '7th':
        return chordName + '7';
      case 'm7':
        return chordName + 'm7';
      case 'maj7':
        return chordName + 'maj7';
      case 'dim':
        return chordName + 'dim';
      case 'aug':
        return chordName + 'aug';
      default:
        return chordName;
    }
  }
  
  // =============================================================================
  // AUTOHARP-SPECIFIC INTERFACE METHODS
  // Required methods for Agent #1 - Chord Logic Specialist
  // =============================================================================
  
  /**
   * Set the current autoharp type for validation and transposition
   * @param {string} autoharpType - Autoharp type ('12-chord', '15-chord', '21-chord', 'chromatic')
   */
  setAutoharpType(autoharpType) {
    if (this.autoharpTypes.getType(autoharpType)) {
      this.currentAutoharpType = autoharpType;
      // Update available chords to match the new autoharp type
      this.updateAvailableChords(this.autoharpTypes.getAllChords(autoharpType));
    }
  }
  
  /**
   * Get the current autoharp type
   * @returns {string} Current autoharp type
   */
  getCurrentAutoharpType() {
    return this.currentAutoharpType;
  }
  
  /**
   * REQUIRED INTERFACE: Transpose a chord progression between keys for a specific autoharp type
   * @param {Array<string>} chords - Array of chord names to transpose
   * @param {string} fromKey - Original key
   * @param {string} toKey - Target key
   * @param {string} autoharpType - Target autoharp type (optional, uses current if not specified)
   * @returns {Object} Transposition result with success status and chord mappings
   */
  transposeProgression(chords, fromKey, toKey, autoharpType = null) {
    const targetType = autoharpType || this.currentAutoharpType;
    return this.transposition.transposeProgression(chords, fromKey, toKey, targetType);
  }
  
  /**
   * REQUIRED INTERFACE: Validate if a chord is available on a specific autoharp type
   * @param {string} chord - Chord name to validate
   * @param {string} autoharpType - Autoharp type to check against (optional, uses current if not specified)
   * @returns {boolean} True if chord is available on the specified autoharp type
   */
  validateChordForAutoharp(chord, autoharpType = null) {
    const targetType = autoharpType || this.currentAutoharpType;
    return this.autoharpTypes.isChordAvailable(chord, targetType);
  }
  
  /**
   * REQUIRED INTERFACE: Get all compatible chords for a specific autoharp type
   * @param {string} autoharpType - Autoharp type (optional, uses current if not specified)
   * @returns {Array<string>} Array of all chords available on the specified autoharp type
   */
  getCompatibleChords(autoharpType = null) {
    const targetType = autoharpType || this.currentAutoharpType;
    return this.autoharpTypes.getAllChords(targetType);
  }
  
  /**
   * Get autoharp type information and statistics
   * @param {string} autoharpType - Autoharp type (optional, uses current if not specified)
   * @returns {Object} Autoharp type information including name, description, and chord count
   */
  getAutoharpTypeInfo(autoharpType = null) {
    const targetType = autoharpType || this.currentAutoharpType;
    return this.autoharpTypes.getTypeInfo(targetType);
  }
  
  /**
   * Find the best autoharp type for a given set of chords
   * @param {Array<string>} chords - Array of chord names
   * @returns {Object} Best match info with type, coverage, and missing chords
   */
  findBestAutoharpType(chords) {
    return this.autoharpTypes.findBestAutoharpType(chords);
  }
  
  /**
   * Find optimal keys for a chord progression on the current autoharp type
   * @param {Array<string>} chords - Original chord progression
   * @param {string} autoharpType - Autoharp type (optional, uses current if not specified)
   * @returns {Array<Object>} Array of key options sorted by coverage
   */
  findOptimalKeys(chords, autoharpType = null) {
    const targetType = autoharpType || this.currentAutoharpType;
    return this.transposition.findOptimalKeys(chords, targetType);
  }
  

  
  /**
   * Get comprehensive compatibility matrix for multiple chords across autoharp types
   * @param {Array<string>} chords - Array of chord names to check
   * @returns {Object} Compatibility matrix showing chord availability by autoharp type
   */
  getCompatibilityMatrix(chords) {
    return this.autoharpTypes.getCompatibilityMatrix(chords);
  }
  
  /**
   * Analyze a chord progression for music theory insights
   * @param {Array<string>} chords - Chord progression to analyze
   * @returns {Object} Analysis including key suggestions and complexity assessment
   */
  analyzeProgression(chords) {
    return this.transposition.analyzeProgression(chords);
  }
  
  /**
   * Enhanced chord parsing with autoharp-specific validation and suggestions
   * @param {string} input - Chord input to parse
   * @param {string} autoharpType - Autoharp type for validation (optional, uses current if not specified)
   * @returns {Object} Enhanced parsing result with autoharp compatibility info
   */
  parseChordWithAutoharpInfo(input, autoharpType = null) {
    const targetType = autoharpType || this.currentAutoharpType;
    const parsedChord = this.parseChord(input);
    
    if (!parsedChord) {
      return {
        success: false,
        input: input,
        chord: null,
        autoharpCompatible: false,
        autoharpType: targetType,
        alternatives: []
      };
    }
    
    const isCompatible = this.validateChordForAutoharp(parsedChord, targetType);
    const alternatives = isCompatible ? [] : this.transposition.findAlternativeChords(parsedChord, targetType);
    
    return {
      success: true,
      input: input,
      chord: parsedChord,
      autoharpCompatible: isCompatible,
      autoharpType: targetType,
      alternatives: alternatives
    };
  }
}

export { ChordParser };
