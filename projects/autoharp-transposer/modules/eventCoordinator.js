// =============================================================================
// EVENT COORDINATOR
// Unified event handling for all input methods and UI interactions
// =============================================================================

class EventCoordinator {
  constructor(inputManager, stateManager, audioManager) {
    this.inputManager = inputManager;
    this.stateManager = stateManager;
    this.audioManager = audioManager;
    
    // Flag to prevent suggestions from showing immediately after submission
    this.justSubmitted = false;
    
    this.textInputTimeout = null;
    this.setupEventListeners();
    this.setupStateListeners();
  }

  setupEventListeners() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeEventListeners());
    } else {
      this.initializeEventListeners();
    }
  }

  initializeEventListeners() {
    // Autoharp type selection
    this.setupAutoharpTypeListeners();
    
    // Chord button clicks
    this.setupChordButtonListeners();
    
    // Text input handling
    this.setupTextInputListeners();
    
    // Audio controls
    this.setupAudioControlListeners();
    
    // Clear/reset buttons
    this.setupUtilityButtonListeners();
    
    // Keyboard shortcuts
    this.setupKeyboardShortcuts();
  }

  setupAutoharpTypeListeners() {
    const radioButtons = document.querySelectorAll('input[name="autoharpType"]');
    radioButtons.forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (e.target.checked) {
          this.handleAutoharpTypeChange(e.target.value);
        }
      });
    });
  }

  setupChordButtonListeners() {
    // Chord name buttons
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('chord-name-btn')) {
        this.handleChordNameSelection(e.target.dataset.chord, e.target);
      }
      
      if (e.target.classList.contains('chord-type-btn')) {
        this.handleChordTypeSelection(e.target.dataset.type, e.target);
      }
      
      if (e.target.classList.contains('add-chord-btn')) {
        this.handleAddChordClick();
      }
      
      if (e.target.classList.contains('remove-chord-btn')) {
        this.handleRemoveChordClick(e.target);
      }
    });
  }

  setupTextInputListeners() {
    const textInput = document.getElementById('chordTextInput');
    const suggestionsContainer = document.getElementById('chordSuggestions');
    
    if (textInput) {
      // Input event for real-time suggestions
      textInput.addEventListener('input', (e) => {
        // Don't show suggestions immediately after submission
        if (this.justSubmitted) {
          this.justSubmitted = false;
          return;
        }
        this.handleTextInput(e.target.value);
      });
      
      // Enter key to add chord
      textInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.handleTextInputSubmit(e.target.value);
        } else if (e.key === 'Escape') {
          this.clearSuggestions();
          e.target.blur();
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          this.handleSuggestionNavigation(e.key);
        }
      });
      
      // Focus/blur events
      textInput.addEventListener('focus', () => {
        this.handleTextInputFocus();
      });
      
      textInput.addEventListener('blur', () => {
        // Delay clearing suggestions to allow clicks
        setTimeout(() => this.clearSuggestions(), 150);
      });
    }
    
    // Suggestion clicks
    if (suggestionsContainer) {
      suggestionsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('suggestion-item')) {
          this.handleSuggestionClick(e.target.dataset.chord);
        }
      });
    }
  }

  setupAudioControlListeners() {
    // Sound Toggle Button - Toggles audio feedback on/off for chord interactions
    const soundToggle = document.getElementById('soundToggle');
    if (soundToggle) {
      soundToggle.addEventListener('click', () => {
        this.handleSoundToggle();
      });
    }
  }

  setupUtilityButtonListeners() {
    // Add Chord Button - Adds chord from text input when clicked
    const addChordBtn = document.getElementById('addChordBtn');
    if (addChordBtn) {
      addChordBtn.addEventListener('click', () => {
        this.handleAddChordClick();
      });
    }
    
    // Clear All Button - Clears all selected chords when clicked
    const clearAllBtn = document.getElementById('clearAllChords');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', () => {
        this.handleClearAll();
      });
    }
    
    // Play All Button - Plays all selected chords in sequence when clicked
    const playAllBtn = document.getElementById('playAllChords');
    if (playAllBtn) {
      playAllBtn.addEventListener('click', () => {
        this.handlePlayAll();
      });
    }
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Only handle shortcuts when not typing in input fields
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      
      switch (e.key) {
        case 'c':
          if (e.ctrlKey || e.metaKey) {
            // Don't override copy
            return;
          }
          this.focusTextInput();
          e.preventDefault();
          break;
        case 'Escape':
          this.clearSuggestions();
          this.clearTextInput();
          break;
        case ' ':
          this.handleSoundToggle();
          e.preventDefault();
          break;
        case 'Delete':
        case 'Backspace':
          this.removeLastChord();
          e.preventDefault();
          break;
      }
    });
  }

  // Handle add chord button click - REMOVED DUPLICATE (kept the more complete version at line 258)
  


  setupStateListeners() {
    // Listen to input manager events
    this.inputManager.on('onChordAdded', (data) => {
      this.stateManager.addSelectedChord(data.chord);
      this.updateUI();
      this.clearTextInput();
    });
    
    this.inputManager.on('onChordRemoved', (data) => {
      this.stateManager.removeSelectedChord(data.chord);
      this.updateUI();
    });
    
    this.inputManager.on('onChordsCleared', () => {
      this.stateManager.clearSelectedChords();
      this.updateUI();
    });
    
    // Listen to state changes
    this.stateManager.subscribe('selectedChordsChanged', () => {
      this.updateProgressions();
    });
    
    this.stateManager.subscribe('autoharpTypeChanged', (data) => {
      this.inputManager.updateAvailableChords(data.current);
      this.updateAvailableChordButtons();
    });
  }

  // Event handlers
  handleAutoharpTypeChange(type) {
    this.stateManager.updateAutoharpType(type);
    console.log(`Autoharp type changed to: ${type}`);
  }

  handleChordNameSelection(chordName, button) {
    // Update visual state
    document.querySelectorAll('.chord-name-btn').forEach(btn => 
      btn.classList.remove('selected'));
    button.classList.add('selected');
    
    this.stateManager.updateCurrentChord(chordName, this.stateManager.get('currentChordType'));
    console.log(`Selected chord name: ${chordName}`);
  }

  handleChordTypeSelection(chordType, button) {
    // Update visual state
    document.querySelectorAll('.chord-type-btn').forEach(btn => 
      btn.classList.remove('selected'));
    button.classList.add('selected');
    
    this.stateManager.updateCurrentChord(this.stateManager.get('currentChordName'), chordType);
    console.log(`Selected chord type: ${chordType}`);
  }

  handleAddChordClick() {
    console.log(`[DEBUG] handleAddChordClick called`);
    const textInput = document.getElementById('chordTextInput');
    if (!textInput) return;
    
    const inputValue = textInput.value.trim();
    console.log(`[DEBUG] Raw input value: "${textInput.value}"`);
    console.log(`[DEBUG] Trimmed input value: "${inputValue}"`);
    
    if (!inputValue) {
      this.showMessage('Please enter a chord name', 'warning');
      return;
    }
    
    // Use InputManager's addChord method directly
    // This bypasses fuzzy matching and accepts any valid chord format
    console.log(`[DEBUG] Calling inputManager.addChord with: "${inputValue}"`);
    const success = this.inputManager.addChord(inputValue, 'text');
    
    if (success) {
      // Clear the input field after successful addition
      textInput.value = '';
      console.log(`Successfully added chord: ${inputValue}`);
    } else {
      console.warn('Failed to add chord:', inputValue);
      this.showMessage('Invalid chord: ' + inputValue, 'error');
    }
  }



  handleRemoveChordClick(button) {
    const chord = button.dataset.chord;
    if (chord) {
      this.inputManager.removeChord(chord);
    }
  }

  /**
   * Handle Play All button click - Plays all selected chords in sequence
   * Provides audio feedback for the user's current chord selection
   */
  handlePlayAll() {
    console.log('[DEBUG] handlePlayAll called');
    
    const selectedChords = this.inputManager.getSelectedChords();
    if (!selectedChords || selectedChords.length === 0) {
      this.showMessage('No chords selected to play', 'warning');
      return;
    }
    
    console.log(`[DEBUG] Playing ${selectedChords.length} chords:`, selectedChords);
    
    // Check if audio manager is available
    if (!this.audioManager) {
      this.showMessage('Audio not available', 'error');
      return;
    }
    
    // Play chords in sequence
    this.audioManager.playChordSequence(selectedChords)
      .then(() => {
        console.log('Finished playing all chords');
      })
      .catch((error) => {
        console.warn('Error playing chords:', error);
        this.showMessage('Error playing chords', 'error');
      });
  }



  handleTextInputFocus() {
    const input = document.getElementById('chordTextInput');
    if (input && input.value) {
      this.updateSuggestions(input.value);
    }
  }

  handleSuggestionClick(chord) {
    this.inputManager.addChord(chord, 'suggestion');
    this.clearSuggestions();
    this.clearTextInput();
  }

  /**
   * Handle real-time text input for chord suggestions and validation
   * Provides immediate feedback and suggestions as user types
   * @param {string} inputValue - Current value of the text input
   */
  handleTextInput(inputValue) {
    console.log(`[DEBUG] EventCoordinator.handleTextInput called with: "${inputValue}"`);
    const textInput = document.getElementById('chordTextInput');
    if (!textInput) return;
    
    // Clear any previous validation styling
    textInput.classList.remove('input-valid', 'input-invalid', 'input-partial');
    
    // If input is empty, hide suggestions and reset styling
    if (!inputValue || !inputValue.trim()) {
      this.clearSuggestions();
      return;
    }
    
    const trimmedInput = inputValue.trim();
    
    // Get suggestions from InputManager
    const suggestions = this.inputManager.getSuggestions(trimmedInput, 8);
    
    // Validate the current input
    const validationResult = this.inputManager.chordParser.parseChord(trimmedInput);
    
    // Apply visual feedback based on validation
    if (validationResult) {
      // Input is a valid chord
      textInput.classList.add('input-valid');
    } else if (suggestions.length > 0) {
      // Input is partial but has suggestions
      textInput.classList.add('input-partial');
    } else {
      // Input doesn't match any known chords
      textInput.classList.add('input-invalid');
    }
    
    // Show suggestions if available
    if (suggestions.length > 0) {
      this.showSuggestions(suggestions, trimmedInput);
    } else {
      this.clearSuggestions();
    }
  }

  handleTextInputSubmit(inputValue) {
    // Set flag to prevent suggestions from showing after submission
    this.justSubmitted = true;
    
    // Clear suggestions immediately
    this.clearSuggestions();
    
    // If there are suggestions visible, use the selected one
    const selectedSuggestion = document.querySelector('.suggestion-item.selected');
    if (selectedSuggestion) {
      const chord = selectedSuggestion.dataset.chord;
      this.inputManager.addChord(chord, 'suggestion');
      this.clearTextInput();
      return;
    }
    
    // If no suggestions are selected but input has value, try to add it directly
    if (inputValue && inputValue.trim()) {
      const result = this.inputManager.processTextInput(inputValue.trim());
      if (result.success) {
        // Actually add the parsed chord to the selected chords
        this.inputManager.addChord(result.chord, 'text');
        this.clearTextInput();
      } else {
        this.showMessage(result.message, 'error');
      }
    }
    
    // Reset the flag after a short delay to allow normal suggestions again
    setTimeout(() => {
      this.justSubmitted = false;
    }, 100);
  }

  clearTextInput() {
    console.log(`[DEBUG] EventCoordinator.clearTextInput called`);
    const textInput = document.getElementById('chordTextInput');
    if (textInput) {
      textInput.value = '';
      // Also clear validation styling
      textInput.classList.remove('input-valid', 'input-invalid', 'input-partial');
    }
  }

  /**
   * Display chord suggestions in the suggestions container
   * @param {Array} suggestions - Array of suggestion objects
   * @param {string} inputValue - Current input value for highlighting
   */
  showSuggestions(suggestions, inputValue) {
    console.log(`[DEBUG] EventCoordinator.showSuggestions called with ${suggestions.length} suggestions`);
    const container = document.getElementById('chordSuggestions');
    if (!container) return;
    
    // Clear existing suggestions
    container.innerHTML = '';
    
    if (suggestions.length === 0) {
      container.style.display = 'none';
      return;
    }
    
    // Create suggestion items
    suggestions.forEach((suggestion, index) => {
      const item = document.createElement('div');
      item.className = 'suggestion-item';
      item.dataset.chord = suggestion;
      
      // Highlight matching part of the suggestion
      const highlightedText = this.highlightMatch(suggestion, inputValue);
      item.innerHTML = highlightedText;
      
      // Add click handler
      item.addEventListener('click', () => {
        this.inputManager.addChord(suggestion, 'suggestion');
        this.clearTextInput();
        this.clearSuggestions();
      });
      
      // Select first item by default
      if (index === 0) {
        item.classList.add('selected');
      }
      
      container.appendChild(item);
    });
    
    // Show the container
    container.style.display = 'block';
  }

  /**
   * Clear and hide the suggestions container
   */
  clearSuggestions() {
    const container = document.getElementById('chordSuggestions');
    if (container) {
      container.innerHTML = '';
      container.style.display = 'none';
    }
  }

  /**
   * Highlight matching characters in suggestion text
   * @param {string} suggestion - The suggestion text
   * @param {string} input - The user input to highlight
   * @returns {string} HTML with highlighted matches
   */
  highlightMatch(suggestion, input) {
    if (!input || input.length === 0) {
      return suggestion;
    }
    
    const inputLower = input.toLowerCase();
    const suggestionLower = suggestion.toLowerCase();
    
    // Find the start of the match
    const matchIndex = suggestionLower.indexOf(inputLower);
    
    if (matchIndex === -1) {
      // No direct match, return as-is
      return suggestion;
    }
    
    // Highlight the matching part
    const before = suggestion.substring(0, matchIndex);
    const match = suggestion.substring(matchIndex, matchIndex + input.length);
    const after = suggestion.substring(matchIndex + input.length);
    
    return `${before}<strong class="suggestion-highlight">${match}</strong>${after}`;
  }

  handleSuggestionNavigation(key) {
    const suggestions = document.querySelectorAll('.suggestion-item');
    if (suggestions.length === 0) return;
    
    const currentSelected = document.querySelector('.suggestion-item.selected');
    let newIndex = 0;
    
    if (currentSelected) {
      const currentIndex = Array.from(suggestions).indexOf(currentSelected);
      newIndex = key === 'ArrowDown' 
        ? Math.min(currentIndex + 1, suggestions.length - 1)
        : Math.max(currentIndex - 1, 0);
      currentSelected.classList.remove('selected');
    }
    
    suggestions[newIndex].classList.add('selected');
  }

  handleSoundToggle() {
    const enabled = this.inputManager.audioManager.toggleSound();
    this.stateManager.set('audioEnabled', enabled);
    this.showMessage(`Sound ${enabled ? 'enabled' : 'disabled'}`, 'info');
  }

  handleClearAll() {
    this.inputManager.clearAll();
    this.showMessage('Cleared all chords', 'info');
  }

  // UI update methods
  updateUI() {
    this.updateSelectedChordsDisplay();
    this.updateChordButtons();
    this.updateProgressions();
  }

  updateSelectedChordsDisplay() {
    const container = document.getElementById('chordGroupInputs');
    if (!container) return;
    
    const selectedChords = this.stateManager.get('selectedChords');
    
    // Clear existing
    container.innerHTML = '';
    
    // Add chord elements
    selectedChords.forEach((chord, index) => {
      const chordElement = this.createChordElement(chord, index);
      container.appendChild(chordElement);
    });
  }

  updateChordButtons() {
    const selectedChords = this.stateManager.get('selectedChords');
    
    // Update button states to show which chords are selected
    document.querySelectorAll('[data-chord]').forEach(button => {
      const chord = button.dataset.chord;
      button.classList.toggle('in-use', selectedChords.includes(chord));
    });
  }

  updateAvailableChordButtons() {
    const availableChords = this.stateManager.get('availableChords');
    
    // Show/hide buttons based on availability
    document.querySelectorAll('[data-chord]').forEach(button => {
      const chord = button.dataset.chord;
      button.style.display = availableChords.includes(chord) ? '' : 'none';
    });
  }

  updateSuggestions(input) {
    if (!input || input.length < 1) {
      this.clearSuggestions();
      return;
    }
    
    // Normalize input before getting suggestions for consistent chord parsing
    const normalizedInput = this.inputManager.chordParser.normalizeChordInput(input);
    const inputForSuggestions = normalizedInput || input; // Fallback to original if normalization fails
    
    const suggestions = this.inputManager.getSuggestions(inputForSuggestions, 5);
    this.showSuggestions(suggestions);
  }



  updateProgressions() {
    const selectedChords = this.stateManager.get('selectedChords');
    
    // Ensure DOM references are initialized before calling legacy functions
    if (window.initializeDOMReferences && typeof window.initializeDOMReferences === 'function') {
      window.initializeDOMReferences();
    }
    
    // Call existing progression calculation function safely
    if (typeof window.onInputChordsChanged === 'function' && window.chordGroup) {
      try {
        window.onInputChordsChanged();
      } catch (error) {
        console.warn('Error calling legacy onInputChordsChanged:', error);
        // Continue without legacy progression updates
      }
    }
  }

  // Utility methods
  createChordElement(chord, index) {
    const element = document.createElement('div');
    // Use 'chord' class to match legacy transcription system expectations
    element.className = 'chord';
    element.innerHTML = `
      <span>${chord}</span>
      <button class="remove-chord-btn" data-chord="${chord}" aria-label="Remove ${chord}">×</button>
    `;
    
    // Add click handler for remove button
    const removeBtn = element.querySelector('.remove-chord-btn');
    if (removeBtn) {
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.stateManager.removeSelectedChord(chord);
      });
    }
    
    return element;
  }

  // Wrapper for legacy formatChordName function - renamed to avoid confusion
  formatChordNameLegacy(chordName, chordType) {
    // Use existing formatting function if available
    if (typeof window.formatChordName === 'function') {
      return window.formatChordName(chordName, chordType);
    }
    
    // Fallback formatting
    if (chordType === 'major') return chordName;
    return chordName + chordType;
  }

  focusTextInput() {
    const input = document.getElementById('chordTextInput');
    if (input) {
      input.focus();
    }
  }



  
  removeLastChord() {
    const selectedChords = this.stateManager.get('selectedChords');
    if (selectedChords.length > 0) {
      const lastChord = selectedChords[selectedChords.length - 1];
      this.inputManager.removeChord(lastChord);
    }
  }

  showMessage(message, type = 'info') {
    console.log(`[DEBUG] EventCoordinator.showMessage called: "${message}" (${type})`);
    // Create or update message display
    let messageEl = document.getElementById('app-message');
    if (!messageEl) {
      messageEl = document.createElement('div');
      messageEl.id = 'app-message';
      messageEl.className = 'app-message';
      document.body.appendChild(messageEl);
    }
    
    messageEl.textContent = message;
    messageEl.className = `app-message ${type}`;
    messageEl.style.display = 'block';
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      messageEl.style.display = 'none';
    }, 3000);
  }

  // Debug methods
  getDebugInfo() {
    return {
      inputManager: this.inputManager.getDebugInfo(),
      stateManager: this.stateManager.getDebugInfo(),
      eventListeners: {
        textInputTimeout: !!this.textInputTimeout
      }
    };
  }

  // =============================================================================
  // LEGACY FUNCTIONS - Moved from webapp.js for better organization
  // =============================================================================

  /**
   * LEGACY FUNCTION: Handles chord name selection
   * Originally from webapp.js - moved here for better organization
   * @param {string} chordName - Selected chord name
   */
  selectChordNameLegacy(chordName) {
    const selectedButton = document.querySelector(`[data-chord="${chordName}"]`);
    if (!selectedButton) return;

    if (selectedButton.classList.contains('active')) {
      selectedButton.classList.remove('active');
      window.selectedChordName = null;
      return;
    }

    // Remove active class from all chord name buttons
    const chordNameButtons = document.querySelectorAll('[data-chord]');
    chordNameButtons.forEach(btn => {
      if (btn !== selectedButton) {
        btn.classList.remove('active');
      }
    });

    selectedButton.classList.add('active');
    window.selectedChordName = chordName;
    console.log(`Selected chord name: ${chordName}`);
  }

  /**
   * LEGACY FUNCTION: Handles chord type selection
   * Originally from webapp.js - moved here for better organization
   * @param {string} chordType - Selected chord type
   */
  selectChordTypeLegacy(chordType) {
    const selectedButton = document.querySelector(`[data-type="${chordType}"]`);
    if (!selectedButton) return;

    if (selectedButton.classList.contains('active')) {
      selectedButton.classList.remove('active');
      window.selectedChordType = null;
      return;
    }

    // Remove active class from all chord type buttons
    const chordTypeButtons = document.querySelectorAll('[data-type]');
    chordTypeButtons.forEach(btn => {
      if (btn !== selectedButton) {
        btn.classList.remove('active');
      }
    });

    selectedButton.classList.add('active');
    window.selectedChordType = chordType;
    console.log(`Selected chord type: ${chordType}`);
  }

  /**
   * LEGACY FUNCTION: Attempts to add selected chord
   * Originally from webapp.js - moved here for better organization
   */
  tryAddChordLegacy() {
    if (window.selectedChordName && window.selectedChordType) {
      const chordValue = this.formatChordNameLegacy(window.selectedChordName, window.selectedChordType);
      if (typeof window.appendChord === 'function') {
        window.appendChord(chordValue);
      }
      if (typeof window.onInputChordsChanged === 'function') {
        window.onInputChordsChanged();
      }
      this.resetChordSelectionLegacy();
    }
  }

  /**
   * LEGACY FUNCTION: Resets chord selection UI state
   * Originally from webapp.js - moved here for better organization
   */
  resetChordSelectionLegacy() {
    // Remove active class from all buttons
    const allButtons = document.querySelectorAll('[data-chord], [data-type]');
    allButtons.forEach(btn => btn.classList.remove('active'));

    // Reset global variables
    window.selectedChordName = null;
    window.selectedChordType = null;
  }

  /**
   * LEGACY FUNCTION: Initializes chord input listener
   * Originally from webapp.js - moved here for better organization
   */
  initializeChordInputListenerLegacy() {
    // This function is kept for compatibility but no longer needed
    // Chord buttons now use inline onclick handlers
    console.log('Legacy chord input listener initialized');
  }
}

export { EventCoordinator };
