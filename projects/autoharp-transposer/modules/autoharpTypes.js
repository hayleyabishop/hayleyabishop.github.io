// =============================================================================
// AUTOHARP TYPES
// Centralized definitions for different autoharp configurations
// Extracted from webapp.js to create modular architecture
// =============================================================================

/**
 * Comprehensive autoharp type definitions with chord lists and intervals
 * Each type includes major, minor, and 7th chord configurations
 */
class AutoharpTypes {
  constructor() {
    this.types = {
      '12-chord': {
        name: '12-Chord Autoharp',
        description: 'Basic autoharp with 12 chord bars',
        chords: {
          major: ['C', 'F', 'G', 'A#/Bb'],
          minor: ['Dm', 'Gm', 'Am'],
          seventh: ['C7', 'D7', 'E7', 'G7', 'A7']
        },
        intervals: {
          major: [0, 5, 7, 10],
          minor: [2, 7, 9],
          seventh: [0, 2, 4, 7, 9]
        }
      },
      
      '15-chord': {
        name: '15-Chord Autoharp',
        description: 'Mid-range autoharp with 15 chord bars',
        chords: {
          major: ['C', 'D', 'D#/Eb', 'E', 'F', 'G', 'A#/Bb'],
          minor: ['Dm', 'Am', 'Gm'],
          seventh: ['C7', 'D7', 'E7', 'F7', 'G7', 'A7']
        },
        intervals: {
          major: [0, 2, 3, 4, 5, 7, 10],
          minor: [2, 9, 7],
          seventh: [0, 2, 4, 5, 7, 9]
        }
      },
      
      '21-chord': {
        name: '21-Chord Autoharp',
        description: 'Full-featured autoharp with 21 chord bars',
        chords: {
          major: ['C', 'D', 'D#/Eb', 'F', 'G', 'G#/Ab', 'A', 'A#/Bb'],
          minor: ['Cm', 'Dm', 'Em', 'Gm', 'Am'],
          seventh: ['C7', 'D7', 'E7', 'F7', 'G7', 'A7', 'B7', 'A#/Bb7']
        },
        intervals: {
          major: [0, 2, 3, 5, 7, 8, 9, 10],
          minor: [0, 2, 4, 7, 9],
          seventh: [0, 2, 4, 5, 7, 9, 11, 10]
        }
      },
      
      'chromatic': {
        name: 'Chromatic (All Notes)',
        description: 'All chromatic notes for testing/development',
        chords: {
          major: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
          minor: ['Cm', 'C#m', 'Dm', 'D#m', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'A#m', 'Bm'],
          seventh: ['C7', 'C#7', 'D7', 'D#7', 'E7', 'F7', 'F#7', 'G7', 'G#7', 'A7', 'A#7', 'B7']
        },
        intervals: {
          major: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
          minor: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
          seventh: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
        }
      }
    };
    
    // Default autoharp type
    this.defaultType = '21-chord';
  }
  
  /**
   * Get all available autoharp types
   * @returns {Array<string>} Array of autoharp type keys
   */
  getAvailableTypes() {
    return Object.keys(this.types);
  }
  
  /**
   * Get autoharp type configuration
   * @param {string} type - Autoharp type ('12-chord', '15-chord', '21-chord', 'chromatic')
   * @returns {Object|null} Autoharp configuration or null if not found
   */
  getType(type) {
    return this.types[type] || null;
  }
  
  /**
   * Get all chords for a specific autoharp type
   * @param {string} type - Autoharp type
   * @returns {Array<string>} Combined array of all chords for this autoharp type
   */
  getAllChords(type) {
    const config = this.getType(type);
    if (!config) return [];
    
    return [
      ...config.chords.major,
      ...config.chords.minor,
      ...config.chords.seventh
    ];
  }
  
  /**
   * Get chords by category for a specific autoharp type
   * @param {string} type - Autoharp type
   * @param {string} category - Chord category ('major', 'minor', 'seventh')
   * @returns {Array<string>} Array of chords in the specified category
   */
  getChordsByCategory(type, category) {
    const config = this.getType(type);
    if (!config || !config.chords[category]) return [];
    
    return [...config.chords[category]];
  }
  
  /**
   * Get intervals for a specific autoharp type and category
   * @param {string} type - Autoharp type
   * @param {string} category - Chord category ('major', 'minor', 'seventh')
   * @returns {Array<number>} Array of semitone intervals
   */
  getIntervals(type, category) {
    const config = this.getType(type);
    if (!config || !config.intervals[category]) return [];
    
    return [...config.intervals[category]];
  }
  
  /**
   * Check if a chord is available on a specific autoharp type
   * @param {string} chord - Chord name to check
   * @param {string} type - Autoharp type
   * @returns {boolean} True if chord is available on this autoharp type
   */
  isChordAvailable(chord, type) {
    const allChords = this.getAllChords(type);
    return allChords.some(availableChord => 
      availableChord.toLowerCase() === chord.toLowerCase()
    );
  }
  
  /**
   * Get autoharp type information including name and description
   * @param {string} type - Autoharp type
   * @returns {Object|null} Type info with name and description
   */
  getTypeInfo(type) {
    const config = this.getType(type);
    if (!config) return null;
    
    return {
      name: config.name,
      description: config.description,
      chordCount: this.getAllChords(type).length
    };
  }
  
  /**
   * Get compatibility matrix showing which chords are available on which autoharp types
   * @param {Array<string>} chords - Array of chord names to check
   * @returns {Object} Compatibility matrix with chord availability by type
   */
  getCompatibilityMatrix(chords) {
    const matrix = {};
    const types = this.getAvailableTypes();
    
    for (const chord of chords) {
      matrix[chord] = {};
      for (const type of types) {
        matrix[chord][type] = this.isChordAvailable(chord, type);
      }
    }
    
    return matrix;
  }
  
  /**
   * Find the best autoharp type for a given set of chords
   * @param {Array<string>} chords - Array of chord names
   * @returns {Object} Best match info with type, coverage, and missing chords
   */
  findBestAutoharpType(chords) {
    const types = this.getAvailableTypes();
    let bestMatch = {
      type: null,
      coverage: 0,
      availableChords: [],
      missingChords: [],
      totalChords: chords.length
    };
    
    for (const type of types) {
      const availableChords = [];
      const missingChords = [];
      
      for (const chord of chords) {
        if (this.isChordAvailable(chord, type)) {
          availableChords.push(chord);
        } else {
          missingChords.push(chord);
        }
      }
      
      const coverage = chords.length > 0 ? availableChords.length / chords.length : 0;
      
      if (coverage > bestMatch.coverage) {
        bestMatch = {
          type,
          coverage,
          availableChords,
          missingChords,
          totalChords: chords.length
        };
      }
    }
    
    return bestMatch;
  }
}

export { AutoharpTypes };
