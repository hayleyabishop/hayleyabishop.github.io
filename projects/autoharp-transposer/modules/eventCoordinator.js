// =============================================================================
// EVENT COORDINATOR
// Unified event handling for all input methods and UI interactions
// =============================================================================

class EventCoordinator {
  constructor(inputManager, stateManager) {
    this.inputManager = inputManager;
    this.stateManager = stateManager;
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
    const soundToggle = document.getElementById('soundToggle');
    if (soundToggle) {
      soundToggle.addEventListener('click', () => {
        this.handleSoundToggle();
      });
    }
  }

  setupUtilityButtonListeners() {
    const clearAllBtn = document.getElementById('clearAllChords');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', () => {
        this.handleClearAll();
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
    const chordName = this.stateManager.get('currentChordName');
    const chordType = this.stateManager.get('currentChordType');
    
    if (chordName && chordType) {
      const fullChord = this.formatChordName(chordName, chordType);
      this.inputManager.addChord(fullChord, 'button');
    } else {
      this.showMessage('Please select both a chord name and type', 'warning');
    }
  }

  handleRemoveChordClick(button) {
    const chord = button.dataset.chord;
    if (chord) {
      this.inputManager.removeChord(chord);
    }
  }

  handleTextInput(value) {
    // Clear previous timeout
    if (this.textInputTimeout) {
      clearTimeout(this.textInputTimeout);
    }
    
    // Debounce suggestions
    this.textInputTimeout = setTimeout(() => {
      this.updateSuggestions(value);
    }, 150);
  }

  handleTextInputSubmit(value) {
    const result = this.inputManager.processTextInput(value);
    
    if (result.success) {
      this.inputManager.addChord(result.chord, 'text');
      this.showMessage(`Added: ${result.chord}`, 'success');
    } else {
      this.showMessage(result.message, 'error');
      if (result.suggestions && result.suggestions.length > 0) {
        this.showSuggestions(result.suggestions);
      }
    }
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
    
    const suggestions = this.inputManager.getSuggestions(input, 5);
    this.showSuggestions(suggestions);
  }

  showSuggestions(suggestions) {
    const container = document.getElementById('chordSuggestions');
    if (!container) return;
    
    container.innerHTML = '';
    
    suggestions.forEach((chord, index) => {
      const item = document.createElement('div');
      item.className = 'suggestion-item';
      item.dataset.chord = chord;
      item.textContent = chord;
      
      if (index === 0) {
        item.classList.add('selected');
      }
      
      container.appendChild(item);
    });
    
    container.style.display = suggestions.length > 0 ? 'block' : 'none';
  }

  clearSuggestions() {
    const container = document.getElementById('chordSuggestions');
    if (container) {
      container.innerHTML = '';
      container.style.display = 'none';
    }
  }

  updateProgressions() {
    const selectedChords = this.stateManager.get('selectedChords');
    
    // Call existing progression calculation function
    if (typeof window.onInputChordsChanged === 'function') {
      window.onInputChordsChanged();
    }
  }

  // Utility methods
  createChordElement(chord, index) {
    const element = document.createElement('div');
    element.className = 'chord-display';
    element.innerHTML = `
      <span class="chord-name">${chord}</span>
      <button class="remove-chord-btn" data-chord="${chord}" aria-label="Remove ${chord}">×</button>
    `;
    return element;
  }

  formatChordName(chordName, chordType) {
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

  clearTextInput() {
    const input = document.getElementById('chordTextInput');
    if (input) {
      input.value = '';
    }
    this.clearSuggestions();
  }

  removeLastChord() {
    const selectedChords = this.stateManager.get('selectedChords');
    if (selectedChords.length > 0) {
      const lastChord = selectedChords[selectedChords.length - 1];
      this.inputManager.removeChord(lastChord);
    }
  }

  showMessage(message, type = 'info') {
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
}

export { EventCoordinator };
