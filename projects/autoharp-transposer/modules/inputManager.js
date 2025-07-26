// =============================================================================
// INPUT MANAGER
// Coordinates different input methods (buttons, text, audio feedback)
// =============================================================================

class InputManager {
  constructor(audioManager, chordParser) {
    this.audioManager = audioManager;
    this.chordParser = chordParser;
    this.selectedChords = [];
    this.callbacks = {
      onChordAdded: [],
      onChordRemoved: [],
      onChordsCleared: []
    };
  }

  // Event subscription system
  on(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event].push(callback);
    }
  }

  emit(event, data) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(callback => callback(data));
    }
  }

  addChord(chord, source = 'unknown') {
    if (!chord) return false;

    // Validate chord against available chords
    if (!this.chordParser.validateChord(chord)) {
      console.warn(`Invalid chord: ${chord}`);
      return false;
    }

    // Avoid duplicates
    if (this.selectedChords.includes(chord)) {
      console.info(`Chord ${chord} already selected`);
      return false;
    }

    // Add to selection
    this.selectedChords.push(chord);
    
    // Add to history
    this.chordParser.addToHistory(chord);

    // Play audio feedback if enabled
    if (this.audioManager && this.audioManager.soundEnabled) {
      this.audioManager.playChord(chord);
    }

    // Emit event
    this.emit('onChordAdded', { chord, source, selectedChords: [...this.selectedChords] });

    console.log(`Added chord: ${chord} (from ${source})`);
    return true;
  }

  removeChord(chord) {
    const index = this.selectedChords.indexOf(chord);
    if (index === -1) return false;

    this.selectedChords.splice(index, 1);
    
    // Emit event
    this.emit('onChordRemoved', { chord, selectedChords: [...this.selectedChords] });

    console.log(`Removed chord: ${chord}`);
    return true;
  }

  removeChordAt(index) {
    if (index < 0 || index >= this.selectedChords.length) return false;

    const chord = this.selectedChords[index];
    this.selectedChords.splice(index, 1);
    
    // Emit event
    this.emit('onChordRemoved', { chord, selectedChords: [...this.selectedChords] });

    console.log(`Removed chord at index ${index}: ${chord}`);
    return true;
  }

  clearAll() {
    const previousChords = [...this.selectedChords];
    this.selectedChords = [];
    
    // Emit event
    this.emit('onChordsCleared', { previousChords });

    console.log('Cleared all chords');
    return true;
  }

  getSelectedChords() {
    return [...this.selectedChords];
  }

  hasChord(chord) {
    return this.selectedChords.includes(chord);
  }

  getChordCount() {
    return this.selectedChords.length;
  }

  // Text input processing
  processTextInput(input) {
    if (!input || typeof input !== 'string') return null;

    const trimmedInput = input.trim();
    if (!trimmedInput) return null;

    // Try to parse the chord
    const parsedChord = this.chordParser.parseAdvancedChord(trimmedInput);
    
    if (parsedChord) {
      return {
        success: true,
        chord: parsedChord,
        message: `Found chord: ${parsedChord}`
      };
    } else {
      // Get suggestions for invalid input
      const suggestions = this.chordParser.getSuggestions(trimmedInput, 3);
      return {
        success: false,
        input: trimmedInput,
        suggestions,
        message: suggestions.length > 0 
          ? `Did you mean: ${suggestions.join(', ')}?`
          : 'No matching chords found'
      };
    }
  }

  // Get suggestions for autocomplete
  getSuggestions(input, maxSuggestions = 5) {
    return this.chordParser.getContextualSuggestions(
      input, 
      this.selectedChords, 
      maxSuggestions
    );
  }

  // Reorder chords (for drag and drop)
  reorderChords(fromIndex, toIndex) {
    if (fromIndex < 0 || fromIndex >= this.selectedChords.length ||
        toIndex < 0 || toIndex >= this.selectedChords.length) {
      return false;
    }

    const [movedChord] = this.selectedChords.splice(fromIndex, 1);
    this.selectedChords.splice(toIndex, 0, movedChord);

    // Emit event
    this.emit('onChordAdded', { 
      chord: movedChord, 
      source: 'reorder', 
      selectedChords: [...this.selectedChords] 
    });

    return true;
  }

  // Update available chords (when autoharp type changes)
  updateAvailableChords(chords) {
    this.chordParser.updateAvailableChords(chords);
    
    // Remove any selected chords that are no longer available
    const validChords = this.selectedChords.filter(chord => 
      this.chordParser.validateChord(chord)
    );
    
    if (validChords.length !== this.selectedChords.length) {
      const removedChords = this.selectedChords.filter(chord => 
        !this.chordParser.validateChord(chord)
      );
      
      this.selectedChords = validChords;
      
      // Emit events for removed chords
      removedChords.forEach(chord => {
        this.emit('onChordRemoved', { 
          chord, 
          reason: 'not_available', 
          selectedChords: [...this.selectedChords] 
        });
      });

      console.log(`Removed ${removedChords.length} chords no longer available:`, removedChords);
    }
  }

  // Batch operations
  addChords(chords, source = 'batch') {
    const results = [];
    chords.forEach(chord => {
      const success = this.addChord(chord, source);
      results.push({ chord, success });
    });
    return results;
  }

  replaceChords(chords, source = 'replace') {
    this.clearAll();
    return this.addChords(chords, source);
  }

  // Export/Import functionality
  exportState() {
    return {
      selectedChords: [...this.selectedChords],
      timestamp: Date.now()
    };
  }

  importState(state) {
    if (!state || !Array.isArray(state.selectedChords)) {
      return false;
    }

    this.clearAll();
    return this.addChords(state.selectedChords, 'import');
  }

  // Validation helpers
  validateAllSelected() {
    const invalidChords = this.selectedChords.filter(chord => 
      !this.chordParser.validateChord(chord)
    );
    
    if (invalidChords.length > 0) {
      console.warn('Invalid chords found:', invalidChords);
      return false;
    }
    
    return true;
  }

  // Debug information
  getDebugInfo() {
    return {
      selectedChords: this.selectedChords,
      availableChords: this.chordParser.availableChords.length,
      audioEnabled: this.audioManager?.soundEnabled || false,
      chordHistory: this.chordParser.chordHistory.slice(0, 5) // First 5 for brevity
    };
  }
}

export { InputManager };
