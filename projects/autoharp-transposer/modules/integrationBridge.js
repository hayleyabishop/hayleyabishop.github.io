// =============================================================================
// INTEGRATION BRIDGE
// Bridges the new modular system with the existing webapp
// =============================================================================

class IntegrationBridge {
  constructor() {
    this.legacyDataReady = false;
    this.moduleSystemReady = false;
    this.pendingCallbacks = [];
    this.chordLists = null;
    
    this.setupLegacyDataWatcher();
  }

  setupLegacyDataWatcher() {
    // Check if CHORD_LISTS is already available
    if (window.CHORD_LISTS) {
      this.onLegacyDataReady();
      return;
    }

    // Watch for CHORD_LISTS to become available
    const checkInterval = setInterval(() => {
      if (window.CHORD_LISTS) {
        clearInterval(checkInterval);
        this.onLegacyDataReady();
      }
    }, 100);

    // Timeout after 5 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      if (!this.legacyDataReady) {
        console.warn('Legacy chord data not found, using fallback');
        this.useFallbackChordData();
      }
    }, 5000);
  }

  onLegacyDataReady() {
    this.legacyDataReady = true;
    this.chordLists = window.CHORD_LISTS;
    console.log('Legacy chord data loaded:', Object.keys(this.chordLists));
    this.checkReadiness();
  }
  
  // Check if integration bridge is ready and call callbacks
  // (Duplicate removed - using the complete version below)

  useFallbackChordData() {
    // Fallback chord data if the legacy system isn't available
    this.chordLists = {
      notes: ["C", "C#/Db", "D", "D#/Eb", "E", "F", "F#/Gb", "G", "G#/Ab", "A", "A#/Bb", "B"],
      autoharp12Maj: ["C", "F", "G", "A#/Bb"],
      autoharp12Min: ["Dm", "Gm", "Am"],
      autoharp127th: ["C7", "D7", "E7", "G7", "A7"],
      autoharp15Maj: ["C", "D", "D#/Eb", "E", "F", "G", "A#/Bb"],
      autoharp15Min: ["Dm", "Am", "Gm"],
      autoharp157th: ["C7", "D7", "E7", "F7", "G7", "A7"],
      autoharp21Maj: ["C", "D", "D#/Eb", "F", "G", "G#/Ab", "A", "A#/Bb"],
      autoharp21Min: ["Cm", "Dm", "Em", "Gm", "Am"],
      autoharp217th: ["C7", "D7", "E7", "F7", "G7", "A7", "B7", "A#/Bb7"]
    };
    
    this.legacyDataReady = true;
    console.log('Using fallback chord data');
    this.checkReadiness();
  }

  setModuleSystemReady() {
    this.moduleSystemReady = true;
    this.checkReadiness();
  }

  checkReadiness() {
    if (this.legacyDataReady && this.moduleSystemReady) {
      this.executePendingCallbacks();
    }
  }

  onReady(callback) {
    if (this.legacyDataReady && this.moduleSystemReady) {
      callback();
    } else {
      this.pendingCallbacks.push(callback);
    }
  }

  executePendingCallbacks() {
    this.pendingCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error executing pending callback:', error);
      }
    });
    this.pendingCallbacks = [];
  }

  getAvailableChordsForType(type) {
    if (!this.chordLists) {
      console.warn('Chord lists not available yet');
      return [];
    }

    switch (type) {
      case 'type12Chord':
        return [
          ...(this.chordLists.autoharp12Maj || []),
          ...(this.chordLists.autoharp12Min || []),
          ...(this.chordLists.autoharp127th || [])
        ];
      case 'type15Chord':
        return [
          ...(this.chordLists.autoharp15Maj || []),
          ...(this.chordLists.autoharp15Min || []),
          ...(this.chordLists.autoharp157th || [])
        ];
      case 'type21Chord':
        return [
          ...(this.chordLists.autoharp21Maj || []),
          ...(this.chordLists.autoharp21Min || []),
          ...(this.chordLists.autoharp217th || [])
        ];
      case 'typeCustomChords':
        return this.chordLists.notes || [];
      default:
        return [];
    }
  }

  // Bridge legacy functions to new system
  bridgeLegacyFunctions(app) {
    if (!app) return;

    // Override legacy chord selection functions
    if (window.selectChordName) {
      const originalSelectChordName = window.selectChordName;
      window.selectChordName = (chordName) => {
        originalSelectChordName(chordName);
        // Also update the new system
        app.modules.stateManager.updateCurrentChord(
          chordName, 
          app.modules.stateManager.get('currentChordType')
        );
      };
    }

    if (window.selectChordType) {
      const originalSelectChordType = window.selectChordType;
      window.selectChordType = (chordType) => {
        originalSelectChordType(chordType);
        // Also update the new system
        app.modules.stateManager.updateCurrentChord(
          app.modules.stateManager.get('currentChordName'),
          chordType
        );
      };
    }

    // Bridge autoharp type changes
    if (window.onChordTypeChanged) {
      const originalOnChordTypeChanged = window.onChordTypeChanged;
      window.onChordTypeChanged = () => {
        originalOnChordTypeChanged();
        // Update the new system
        const selectedType = document.querySelector('input[name="autoharpType"]:checked')?.value;
        if (selectedType) {
          app.modules.stateManager.updateAutoharpType(selectedType);
        }
      };
    }

    // Bridge chord input changes
    if (window.onInputChordsChanged) {
      const originalOnInputChordsChanged = window.onInputChordsChanged;
      window.onInputChordsChanged = () => {
        originalOnInputChordsChanged();
        // Sync with new system if needed
      };
    }

    console.log('Legacy functions bridged to new system');
  }

  // Get current autoharp type from legacy system
  getCurrentAutoharpType() {
    const checkedRadio = document.querySelector('input[name="autoharpType"]:checked');
    return checkedRadio ? checkedRadio.value : 'type21Chord';
  }

  // Get current selected chords from legacy system
  getCurrentSelectedChords() {
    // First ensure DOM references are initialized
    if (window.initializeDOMReferences && typeof window.initializeDOMReferences === 'function') {
      window.initializeDOMReferences();
    }
    
    // Try legacy function if available and chordGroup exists
    if (window.getInputChords && typeof window.getInputChords === 'function' && window.chordGroup) {
      try {
        return window.getInputChords();
      } catch (error) {
        console.warn('Error calling legacy getInputChords:', error);
      }
    }
    
    // Fallback: parse from DOM
    const chordElements = document.querySelectorAll('#chordGroupInputs .chord');
    return Array.from(chordElements).map(el => {
      const span = el.querySelector('span');
      return span ? span.textContent.trim() : el.textContent.trim();
    }).filter(Boolean);
  }

  // Sync legacy state to new system
  syncLegacyToNewSystem(app) {
    if (!app || !app.modules) return;

    try {
      // Sync autoharp type
      const currentType = this.getCurrentAutoharpType();
      app.modules.stateManager.updateAutoharpType(currentType);

      // Sync selected chords
      const currentChords = this.getCurrentSelectedChords();
      if (currentChords.length > 0) {
        app.modules.inputManager.replaceChords(currentChords, 'legacy_sync');
      }

      console.log('Legacy state synced to new system');
    } catch (error) {
      console.error('Error syncing legacy state:', error);
    }
  }

  // Sync new system state to legacy
  syncNewSystemToLegacy(app) {
    if (!app || !app.modules) return;

    try {
      const selectedChords = app.modules.stateManager.get('selectedChords');
      
      // Update legacy DOM if needed
      if (window.renderInputChords && typeof window.renderInputChords === 'function') {
        window.renderInputChords(selectedChords);
      }

      console.log('New system state synced to legacy');
    } catch (error) {
      console.error('Error syncing new system state:', error);
    }
  }
}

// Create singleton instance
const integrationBridge = new IntegrationBridge();

export { IntegrationBridge, integrationBridge };
