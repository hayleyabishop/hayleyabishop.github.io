// =============================================================================
// STATE MANAGER
// Centralized state management for the autoharp transposer
// =============================================================================

class StateManager {
  constructor() {
    this.state = {
      autoharpType: 'type21Chord',
      availableChords: [],
      selectedChords: [],
      audioEnabled: false,
      inputMode: 'hybrid', // 'buttons', 'text', 'hybrid'
      suggestions: [],
      currentChordName: null,
      currentChordType: null,
      progressions: [],
      ui: {
        showProgressions: true,
        compactMode: false
      }
    };
    
    this.listeners = {};
    this.loadFromStorage();
    
    // Initialize available chords after construction
    this.initializeAvailableChords();
  }
  
  // Initialize available chords with default autoharp type
  initializeAvailableChords() {
    const currentType = this.get('autoharpType');
    const chords = this.getAvailableChordsForType(currentType);
    if (chords && chords.length > 0) {
      this.set('availableChords', chords);
      console.log(`Initialized ${chords.length} available chords for ${currentType}`);
    } else {
      console.warn('No chords found for type:', currentType);
      // Fallback to a basic chord set if no chords are available
      const fallbackChords = ['C', 'F', 'G', 'Am', 'Dm', 'Em'];
      this.set('availableChords', fallbackChords);
      console.log('Using fallback chord set:', fallbackChords);
    }
  }

  // State subscription system
  subscribe(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners[event].indexOf(callback);
      if (index > -1) {
        this.listeners[event].splice(index, 1);
      }
    };
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in state listener for ${event}:`, error);
        }
      });
    }
  }

  // State getters
  getState() {
    return { ...this.state };
  }

  get(key) {
    return this.state[key];
  }

  // State setters
  setState(updates) {
    const previousState = { ...this.state };
    this.state = { ...this.state, ...updates };
    
    // Emit change events for each updated property
    Object.keys(updates).forEach(key => {
      if (previousState[key] !== this.state[key]) {
        this.emit(`${key}Changed`, {
          previous: previousState[key],
          current: this.state[key],
          state: this.getState()
        });
      }
    });
    
    this.emit('stateChanged', {
      previous: previousState,
      current: this.getState(),
      updates
    });
    
    this.saveToStorage();
  }

  set(key, value) {
    this.setState({ [key]: value });
  }

  // Specific state update methods
  updateAutoharpType(type) {
    const availableChords = this.getAvailableChordsForType(type);
    
    this.setState({
      autoharpType: type,
      availableChords,
      selectedChords: [], // Clear selections when changing type
      currentChordName: null,
      currentChordType: null,
      progressions: []
    });
  }

  updateSelectedChords(chords) {
    this.setState({ selectedChords: [...chords] });
  }

  addSelectedChord(chord) {
    if (!this.state.selectedChords.includes(chord)) {
      const newChords = [...this.state.selectedChords, chord];
      this.setState({ selectedChords: newChords });
    }
  }

  removeSelectedChord(chord) {
    const newChords = this.state.selectedChords.filter(c => c !== chord);
    this.setState({ selectedChords: newChords });
  }

  clearSelectedChords() {
    this.setState({ 
      selectedChords: [],
      currentChordName: null,
      currentChordType: null,
      progressions: []
    });
  }

  updateProgressions(progressions) {
    this.setState({ progressions: [...progressions] });
  }

  updateSuggestions(suggestions) {
    this.setState({ suggestions: [...suggestions] });
  }

  toggleAudio() {
    this.setState({ audioEnabled: !this.state.audioEnabled });
    return this.state.audioEnabled;
  }

  setInputMode(mode) {
    if (['buttons', 'text', 'hybrid'].includes(mode)) {
      this.setState({ inputMode: mode });
    }
  }

  updateCurrentChord(chordName, chordType) {
    this.setState({
      currentChordName: chordName,
      currentChordType: chordType
    });
  }

  // Helper methods
  getAvailableChordsForType(type) {
    // Use integration bridge to get chord data
    if (window.integrationBridge) {
      return window.integrationBridge.getAvailableChordsForType(type);
    }
    
    // Fallback to direct access if bridge not available
    const CHORD_LISTS = window.CHORD_LISTS || {};
    
    switch (type) {
      case 'type12Chord':
        return [
          ...(CHORD_LISTS.autoharp12Maj || []),
          ...(CHORD_LISTS.autoharp12Min || []),
          ...(CHORD_LISTS.autoharp127th || [])
        ];
      case 'type15Chord':
        return [
          ...(CHORD_LISTS.autoharp15Maj || []),
          ...(CHORD_LISTS.autoharp15Min || []),
          ...(CHORD_LISTS.autoharp157th || [])
        ];
      case 'type21Chord':
        return [
          ...(CHORD_LISTS.autoharp21Maj || []),
          ...(CHORD_LISTS.autoharp21Min || []),
          ...(CHORD_LISTS.autoharp217th || [])
        ];
      case 'typeCustomChords':
        return CHORD_LISTS.notes || [];
      default:
        return [];
    }
  }

  isChordAvailable(chord) {
    return this.state.availableChords.includes(chord);
  }

  isChordSelected(chord) {
    return this.state.selectedChords.includes(chord);
  }

  getSelectedChordCount() {
    return this.state.selectedChords.length;
  }

  // Persistence
  saveToStorage() {
    try {
      const persistentState = {
        autoharpType: this.state.autoharpType,
        audioEnabled: this.state.audioEnabled,
        inputMode: this.state.inputMode,
        ui: this.state.ui
      };
      localStorage.setItem('autoharp_app_state', JSON.stringify(persistentState));
    } catch (error) {
      console.warn('Error saving state to localStorage:', error);
    }
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem('autoharp_app_state');
      if (stored) {
        const persistentState = JSON.parse(stored);
        
        // Update state with stored values, but recalculate derived values
        this.state.autoharpType = persistentState.autoharpType || 'type21Chord';
        this.state.audioEnabled = persistentState.audioEnabled || false;
        this.state.inputMode = persistentState.inputMode || 'hybrid';
        this.state.ui = { ...this.state.ui, ...persistentState.ui };
        
        // Recalculate available chords for the stored type
        this.state.availableChords = this.getAvailableChordsForType(this.state.autoharpType);
      }
    } catch (error) {
      console.warn('Error loading state from localStorage:', error);
    }
  }

  clearStorage() {
    try {
      localStorage.removeItem('autoharp_app_state');
    } catch (error) {
      console.warn('Error clearing localStorage:', error);
    }
  }

  // State validation
  validateState() {
    const issues = [];
    
    if (!this.state.autoharpType) {
      issues.push('Missing autoharp type');
    }
    
    if (!Array.isArray(this.state.availableChords)) {
      issues.push('Available chords is not an array');
    }
    
    if (!Array.isArray(this.state.selectedChords)) {
      issues.push('Selected chords is not an array');
    }
    
    // Check if selected chords are all available
    const invalidChords = this.state.selectedChords.filter(chord => 
      !this.state.availableChords.includes(chord)
    );
    
    if (invalidChords.length > 0) {
      issues.push(`Invalid selected chords: ${invalidChords.join(', ')}`);
    }
    
    return {
      valid: issues.length === 0,
      issues
    };
  }

  // Reset to defaults
  reset() {
    this.state = {
      autoharpType: 'type21Chord', // Default to 21-chord autoharp
      selectedChords: [],
      availableChords: [], // Will be populated after initialization
      audioEnabled: false,
      currentChordName: null,
      currentChordType: null,
      progressions: [],
      ui: {
        showProgressions: true,
        compactMode: false
      }
    };
    
    this.emit('stateReset', this.getState());
    this.saveToStorage();
  }

  // Debug helpers
  getDebugInfo() {
    const validation = this.validateState();
    return {
      state: this.getState(),
      validation,
      listeners: Object.keys(this.listeners).map(event => ({
        event,
        listenerCount: this.listeners[event].length
      }))
    };
  }

  // Export/Import
  exportState() {
    return {
      ...this.getState(),
      timestamp: Date.now(),
      version: '1.0'
    };
  }

  importState(exportedState) {
    if (!exportedState || typeof exportedState !== 'object') {
      throw new Error('Invalid state format');
    }
    
    // Validate essential properties
    if (!exportedState.autoharpType) {
      throw new Error('Missing autoharp type in imported state');
    }
    
    // Import state (excluding timestamp and version)
    const { timestamp, version, ...stateToImport } = exportedState;
    
    // Recalculate available chords to ensure consistency
    stateToImport.availableChords = this.getAvailableChordsForType(stateToImport.autoharpType);
    
    // Filter selected chords to only include available ones
    if (Array.isArray(stateToImport.selectedChords)) {
      stateToImport.selectedChords = stateToImport.selectedChords.filter(chord =>
        stateToImport.availableChords.includes(chord)
      );
    }
    
    this.state = { ...this.state, ...stateToImport };
    this.emit('stateImported', this.getState());
    this.saveToStorage();
  }
}

export { StateManager };
