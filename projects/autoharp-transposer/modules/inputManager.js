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

  /**
   * INTERNAL API: Add a chord to the selected chords list
   * Called by public API methods and internal event handlers
   * @param {string} chord - Chord name to add
   * @param {string} source - Source of the chord addition
   * @returns {boolean} - Success status
   */
  addChord(chord, source = 'unknown') {
    console.log(`[DEBUG] InputManager.addChord called with: "${chord}" from source: ${source}`);
    
    if (!chord) {
      console.log(`[DEBUG] Chord is empty, returning false`);
      return false;
    }

    // Normalize the chord input using the chord parser
    const normalizedChord = this.chordParser.parseChord(chord);
    if (!normalizedChord) {
      console.warn(`Could not parse chord: ${chord}`);
      return false;
    }
    
    console.log(`[DEBUG] Chord "${chord}" normalized to "${normalizedChord}"`);
    
    // Use the normalized chord for all further processing
    const chordToAdd = normalizedChord;

    // Basic validation - just check if it's a reasonable chord format
    // The app should accept any valid chord and let transposition logic handle availability
    if (!this.isValidChordFormat(chordToAdd)) {
      console.warn(`Invalid chord format: ${chordToAdd}`);
      return false;
    }
    
    console.log(`[DEBUG] Chord "${chordToAdd}" passed validation`);
    
    // Duplicate prevention removed - users can now add duplicate chords
    // This allows for chord progressions that repeat chords (e.g., A-D-A-E)

    // Add to selection
    this.selectedChords.push(chordToAdd);
    
    // Add to history
    this.chordParser.addToHistory(chordToAdd);

    // Play audio feedback if enabled
    if (this.audioManager && this.audioManager.soundEnabled) {
      this.audioManager.playChord(chordToAdd);
    }

    // Emit event
    this.emit('onChordAdded', { chord: chordToAdd, source, selectedChords: [...this.selectedChords] });

    console.log(`Added chord: ${chordToAdd} (from ${source})`);
    return true;
  }

  /**
   * INTERNAL API: Remove a chord from the selected chords list
   * Called by public API methods and internal event handlers
   * @param {string} chord - Chord name to remove
   * @returns {boolean} - Success status
   */
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
  
  // Validate chord format (musical validity, not autoharp availability)
  isValidChordFormat(chord) {
    if (!chord || typeof chord !== 'string') return false;
    
    const trimmed = chord.trim();
    if (!trimmed) return false;
    
    // Basic chord pattern: Root note + optional modifiers
    // Examples: C, Gm, F#7, Asus2, Bb/D, C#m7b5
    const chordPattern = /^[A-G][#b]?(m|maj|min|dim|aug|sus[24]?|add[0-9]+|[0-9]+)*(\/[A-G][#b]?)?$/i;
    
    return chordPattern.test(trimmed);
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
    return this.chordParser.getSuggestions(input, maxSuggestions);
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

  // =============================================================================
  // LEGACY FUNCTIONS - Moved from webapp.js for better organization
  // =============================================================================

  /**
   * LEGACY FUNCTION: Gets current input chords from DOM
   * Originally from webapp.js - moved here for better organization
   * @returns {Array<string>} - Array of chord names from DOM elements
   */
  getInputChordsLegacy() {
    const chordElements = document.querySelectorAll('.chord span');
    return Array.from(chordElements).map(element => element.textContent.trim());
  }

  /**
   * LEGACY FUNCTION: Appends chord to DOM chord group
   * Originally from webapp.js - moved here for better organization
   * @param {string} chord - Chord name to append
   */
  appendChordLegacy(chord) {
    const chordGroup = document.getElementById('chordGroup');
    if (!chordGroup) return;

    const newChord = document.createElement('div');
    newChord.classList.add('chord');
    newChord.setAttribute('draggable', 'true');

    const content = document.createElement('div');
    content.classList.add('chord-content');
    content.innerHTML = `<span>${chord}</span><button class="xbutton" onclick="removeChord(this)" aria-label="Remove ${chord} chord">x</button>`;

    newChord.appendChild(content);
    chordGroup.appendChild(newChord);

    // Add drag and drop listeners if function exists
    if (typeof window.addDragListeners === 'function') {
      window.addDragListeners(newChord);
    }
  }

  /**
   * LEGACY FUNCTION: Removes chord from DOM with animation
   * Originally from webapp.js - moved here for better organization
   * @param {HTMLElement} button - Remove button element
   */
  removeChordLegacy(button) {
    const newChord = button.closest(".chord");
    if (!newChord) return;

    const chordGroup = document.getElementById('chordGroup');
    if (!chordGroup) return;

    newChord.setAttribute("aria-hidden", "true");
    newChord.style.animation = "fadeOut 0.3s forwards";
    newChord.addEventListener("animationend", () => {
      chordGroup.removeChild(newChord);
      // Trigger change event if function exists
      if (typeof window.onInputChordsChanged === 'function') {
        window.onInputChordsChanged();
      }
    });
  }

  /**
   * LEGACY FUNCTION: Adds chord from button click
   * Originally from webapp.js - moved here for better organization
   * @param {string} chordValue - Chord value to add
   */
  addChordFromButtonLegacy(chordValue) {
    if (chordValue) {
      this.appendChordLegacy(chordValue);
      // Trigger change event if function exists
      if (typeof window.onInputChordsChanged === 'function') {
        window.onInputChordsChanged();
      }
    }
  }
}

export { InputManager };
