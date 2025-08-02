// =============================================================================
// CHORD TRANSPOSITION
// Handles key changes and chord progression transposition
// Core music theory logic for autoharp chord transposition
// =============================================================================

import { AutoharpTypes } from './autoharpTypes.js';

/**
 * Comprehensive chord transposition engine with music theory validation
 */
class ChordTransposition {
  constructor() {
    this.autoharpTypes = new AutoharpTypes();
    
    // Chromatic scale for transposition calculations
    this.chromaticScale = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    
    // Enharmonic equivalents for better chord matching
    this.enharmonicMap = {
      'C#': 'Db', 'Db': 'C#',
      'D#': 'Eb', 'Eb': 'D#',
      'F#': 'Gb', 'Gb': 'F#',
      'G#': 'Ab', 'Ab': 'G#',
      'A#': 'Bb', 'Bb': 'A#'
    };
    
    // Circle of fifths for intelligent key suggestions
    this.circleOfFifths = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'F', 'Bb', 'Eb', 'Ab'];
  }
  
  /**
   * Transpose a single chord by a given number of semitones
   * @param {string} chord - Original chord (e.g., 'Cm7', 'F#maj7')
   * @param {number} semitones - Number of semitones to transpose (positive = up, negative = down)
   * @returns {string|null} Transposed chord or null if invalid
   */
  transposeChord(chord, semitones) {
    if (!chord || typeof chord !== 'string') return null;
    
    // Parse the chord to extract root note and chord type
    const chordMatch = chord.match(/^([A-G][#b]?)(.*)$/);
    if (!chordMatch) return null;
    
    const [, rootNote, chordType] = chordMatch;
    
    // Find the root note in the chromatic scale
    let rootIndex = this.chromaticScale.findIndex(note => 
      note.toLowerCase() === rootNote.toLowerCase()
    );
    
    // Try enharmonic equivalent if not found
    if (rootIndex === -1 && this.enharmonicMap[rootNote]) {
      rootIndex = this.chromaticScale.findIndex(note => 
        note.toLowerCase() === this.enharmonicMap[rootNote].toLowerCase()
      );
    }
    
    if (rootIndex === -1) return null;
    
    // Calculate new root note position
    const newRootIndex = (rootIndex + semitones + 12) % 12;
    const newRootNote = this.chromaticScale[newRootIndex];
    
    return newRootNote + chordType;
  }
  
  /**
   * Calculate semitone difference between two keys
   * @param {string} fromKey - Original key
   * @param {string} toKey - Target key
   * @returns {number} Semitone difference
   */
  calculateSemitoneInterval(fromKey, toKey) {
    const fromIndex = this.chromaticScale.findIndex(note => 
      note.toLowerCase() === fromKey.toLowerCase()
    );
    const toIndex = this.chromaticScale.findIndex(note => 
      note.toLowerCase() === toKey.toLowerCase()
    );
    
    if (fromIndex === -1 || toIndex === -1) return 0;
    
    return (toIndex - fromIndex + 12) % 12;
  }
  
  /**
   * Transpose an entire chord progression
   * @param {Array<string>} chords - Array of chord names
   * @param {string} fromKey - Original key
   * @param {string} toKey - Target key
   * @param {string} autoharpType - Target autoharp type for validation
   * @returns {Object} Transposition result with success status and chord mappings
   */
  transposeProgression(chords, fromKey, toKey, autoharpType = '21-chord') {
    const semitones = this.calculateSemitoneInterval(fromKey, toKey);
    const result = {
      success: false,
      originalKey: fromKey,
      targetKey: toKey,
      autoharpType: autoharpType,
      semitones: semitones,
      chordMappings: [],
      availableChords: [],
      missingChords: [],
      alternativeChords: [],
      coverage: 0
    };
    
    // Transpose each chord
    for (const originalChord of chords) {
      const transposedChord = this.transposeChord(originalChord, semitones);
      
      if (transposedChord) {
        const isAvailable = this.autoharpTypes.isChordAvailable(transposedChord, autoharpType);
        const alternatives = isAvailable ? [] : this.findAlternativeChords(transposedChord, autoharpType);
        
        const mapping = {
          original: originalChord,
          transposed: transposedChord,
          available: isAvailable,
          alternatives: alternatives
        };
        
        result.chordMappings.push(mapping);
        
        if (isAvailable) {
          result.availableChords.push(transposedChord);
        } else {
          result.missingChords.push(transposedChord);
          if (alternatives.length > 0) {
            result.alternativeChords.push(...alternatives);
          }
        }
      }
    }
    
    // Calculate coverage
    result.coverage = chords.length > 0 ? result.availableChords.length / chords.length : 0;
    result.success = result.coverage > 0;
    
    return result;
  }
  
  /**
   * Find alternative chords when the exact transposed chord isn't available
   * @param {string} targetChord - The desired chord that's not available
   * @param {string} autoharpType - Autoharp type to search within
   * @returns {Array<string>} Array of alternative chord suggestions
   */
  findAlternativeChords(targetChord, autoharpType) {
    const alternatives = [];
    const availableChords = this.autoharpTypes.getAllChords(autoharpType);
    
    // Parse target chord
    const chordMatch = targetChord.match(/^([A-G][#b]?)(.*)$/);
    if (!chordMatch) return alternatives;
    
    const [, rootNote, chordType] = chordMatch;
    
    // Strategy 1: Same root note, different chord type
    for (const chord of availableChords) {
      const availableMatch = chord.match(/^([A-G][#b]?)(.*)$/);
      if (availableMatch && availableMatch[1].toLowerCase() === rootNote.toLowerCase()) {
        alternatives.push(chord);
      }
    }
    
    // Strategy 2: Relative major/minor
    if (chordType.includes('m') && !chordType.includes('maj')) {
      // Target is minor, look for relative major (3 semitones up)
      const relativeMajor = this.transposeChord(rootNote, 3);
      if (relativeMajor && this.autoharpTypes.isChordAvailable(relativeMajor, autoharpType)) {
        alternatives.push(relativeMajor);
      }
    } else if (!chordType.includes('m')) {
      // Target is major, look for relative minor (3 semitones down)
      const relativeMinor = this.transposeChord(rootNote + 'm', -3);
      if (relativeMinor && this.autoharpTypes.isChordAvailable(relativeMinor, autoharpType)) {
        alternatives.push(relativeMinor);
      }
    }
    
    // Strategy 3: Enharmonic equivalents
    if (this.enharmonicMap[rootNote]) {
      const enharmonicChord = this.enharmonicMap[rootNote] + chordType;
      if (this.autoharpTypes.isChordAvailable(enharmonicChord, autoharpType)) {
        alternatives.push(enharmonicChord);
      }
    }
    
    // Remove duplicates and return
    return [...new Set(alternatives)];
  }
  

  
  /**
   * Find optimal keys for a chord progression on a specific autoharp type
   * @param {Array<string>} chords - Original chord progression
   * @param {string} autoharpType - Autoharp type
   * @returns {Array<Object>} Array of key options sorted by coverage
   */
  findOptimalKeys(chords, autoharpType = '21-chord') {
    const keyOptions = [];
    
    // Test all 12 possible keys
    for (let semitones = 0; semitones < 12; semitones++) {
      const targetKey = this.chromaticScale[semitones];
      const transpositionResult = this.transposeProgression(chords, 'C', targetKey, autoharpType);
      
      keyOptions.push({
        key: targetKey,
        coverage: transpositionResult.coverage,
        availableCount: transpositionResult.availableChords.length,
        missingCount: transpositionResult.missingChords.length,
        semitones: semitones,
        chordMappings: transpositionResult.chordMappings
      });
    }
    
    // Sort by coverage (descending) and then by fewer missing chords
    return keyOptions.sort((a, b) => {
      if (b.coverage !== a.coverage) {
        return b.coverage - a.coverage;
      }
      return a.missingCount - b.missingCount;
    });
  }
  
  /**
   * Get music theory analysis of a chord progression
   * @param {Array<string>} chords - Chord progression to analyze
   * @returns {Object} Analysis including key suggestions and chord functions
   */
  analyzeProgression(chords) {
    const analysis = {
      chords: chords,
      possibleKeys: [],
      chordFunctions: [],
      complexity: 'simple'
    };
    
    // Analyze chord relationships and suggest possible keys
    const rootNotes = chords.map(chord => {
      const match = chord.match(/^([A-G][#b]?)/);
      return match ? match[1] : null;
    }).filter(Boolean);
    
    // Find most common root notes to suggest keys
    const rootCounts = {};
    rootNotes.forEach(root => {
      rootCounts[root] = (rootCounts[root] || 0) + 1;
    });
    
    // Sort by frequency and suggest as possible keys
    analysis.possibleKeys = Object.entries(rootCounts)
      .sort(([,a], [,b]) => b - a)
      .map(([root]) => root)
      .slice(0, 3);
    
    // Determine complexity based on chord variety
    const uniqueChordTypes = new Set(chords.map(chord => {
      const match = chord.match(/^[A-G][#b]?(.*)$/);
      return match ? match[1] : '';
    }));
    
    if (uniqueChordTypes.size > 3) {
      analysis.complexity = 'complex';
    } else if (uniqueChordTypes.size > 1) {
      analysis.complexity = 'moderate';
    }
    
    return analysis;
  }
}

export { ChordTransposition };
