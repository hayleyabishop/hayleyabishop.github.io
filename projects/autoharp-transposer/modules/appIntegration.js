// =============================================================================
// APP INTEGRATION
// Main integration file that ties all modules together
// =============================================================================

import { ChordAudioManager } from './chordAudio.js';
import { ChordParser } from './chordParser.js';
import { InputManager } from './inputManager.js';
import { StateManager } from './stateManager.js';
import { EventCoordinator } from './eventCoordinator.js';
import { storageManager } from './storageManager.js';

class AutoharpTransposerApp {
  constructor() {
    this.modules = {};
    this.initialized = false;
    this.initializeApp();
  }

  async initializeApp() {
    try {
      console.log('Initializing Autoharp Transposer App...');
      
      // Initialize core modules
      await this.initializeModules();
      
      // Set up module connections
      this.connectModules();
      
      // Load saved state
      this.loadSavedState();
      
      // Initialize UI
      this.initializeUI();
      
      this.initialized = true;
      console.log('App initialization complete');
      
      // Emit app ready event
      this.emit('appReady');
      
    } catch (error) {
      console.error('Error initializing app:', error);
      this.handleInitializationError(error);
    }
  }

  async initializeModules() {
    // Initialize state manager first
    this.modules.stateManager = new StateManager();
    
    // Initialize audio manager
    this.modules.audioManager = new ChordAudioManager();
    
    // Initialize chord parser with initial available chords
    const initialChords = this.modules.stateManager.get('availableChords');
    this.modules.chordParser = new ChordParser(initialChords);
    
    // Initialize input manager
    this.modules.inputManager = new InputManager(
      this.modules.audioManager,
      this.modules.chordParser
    );
    
    // Initialize event coordinator
    this.modules.eventCoordinator = new EventCoordinator(
      this.modules.inputManager,
      this.modules.stateManager
    );
    
    console.log('All modules initialized');
  }

  connectModules() {
    // Connect state changes to input manager
    this.modules.stateManager.subscribe('availableChordsChanged', (data) => {
      this.modules.inputManager.updateAvailableChords(data.current);
    });
    
    // Connect input manager to audio feedback
    this.modules.inputManager.on('onChordAdded', (data) => {
      // Track usage statistics
      storageManager.incrementChordUsage(data.chord);
      storageManager.incrementStat('totalChords');
      
      if (data.source === 'text') {
        storageManager.incrementStat('textInputUsage');
      } else if (data.source === 'button') {
        storageManager.incrementStat('buttonInputUsage');
      }
    });
    
    // Connect audio state changes
    this.modules.stateManager.subscribe('audioEnabledChanged', (data) => {
      if (data.current) {
        storageManager.incrementStat('audioUsage');
      }
    });
    
    console.log('Module connections established');
  }

  loadSavedState() {
    try {
      // Load preferences
      const preferences = storageManager.loadPreferences();
      this.modules.stateManager.setState({
        autoharpType: preferences.autoharpType,
        audioEnabled: preferences.audioEnabled,
        inputMode: preferences.inputMode,
        ui: preferences.ui
      });
      
      // Load recent session if available
      const session = storageManager.loadSession();
      if (session && session.selectedChords) {
        this.modules.inputManager.addChords(session.selectedChords, 'session');
      }
      
      // Set audio state
      if (preferences.audioEnabled) {
        this.modules.audioManager.soundEnabled = true;
      }
      
      console.log('Saved state loaded');
    } catch (error) {
      console.warn('Error loading saved state:', error);
    }
  }

  initializeUI() {
    // Update UI to reflect current state
    this.updateAutoharpTypeUI();
    this.updateAudioToggleUI();
    this.updateSelectedChordsUI();
    
    // Set up auto-save
    this.setupAutoSave();
    
    console.log('UI initialized');
  }

  updateAutoharpTypeUI() {
    const currentType = this.modules.stateManager.get('autoharpType');
    const radio = document.getElementById(currentType);
    if (radio) {
      radio.checked = true;
    }
  }

  updateAudioToggleUI() {
    const audioEnabled = this.modules.stateManager.get('audioEnabled');
    const toggle = document.getElementById('soundToggle');
    if (toggle) {
      toggle.textContent = audioEnabled ? '🔊' : '🔇';
      toggle.setAttribute('aria-label', audioEnabled ? 'Sound on' : 'Sound off');
    }
  }

  updateSelectedChordsUI() {
    // This will be handled by the event coordinator
    this.modules.eventCoordinator.updateUI();
  }

  setupAutoSave() {
    // Save session data periodically
    setInterval(() => {
      this.saveCurrentSession();
    }, 30000); // Every 30 seconds
    
    // Save on page unload
    window.addEventListener('beforeunload', () => {
      this.saveCurrentSession();
    });
  }

  saveCurrentSession() {
    try {
      const sessionData = {
        selectedChords: this.modules.stateManager.get('selectedChords'),
        autoharpType: this.modules.stateManager.get('autoharpType')
      };
      storageManager.saveSession(sessionData);
    } catch (error) {
      console.warn('Error saving session:', error);
    }
  }

  // Public API methods
  addChord(chord, source = 'api') {
    return this.modules.inputManager.addChord(chord, source);
  }

  removeChord(chord) {
    return this.modules.inputManager.removeChord(chord);
  }

  clearAllChords() {
    return this.modules.inputManager.clearAll();
  }

  getSelectedChords() {
    return this.modules.inputManager.getSelectedChords();
  }

  setAutoharpType(type) {
    this.modules.stateManager.updateAutoharpType(type);
  }

  toggleAudio() {
    return this.modules.audioManager.toggleSound();
  }

  getState() {
    return this.modules.stateManager.getState();
  }

  // Event system
  on(event, callback) {
    if (!this.eventListeners) {
      this.eventListeners = {};
    }
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  emit(event, data) {
    if (this.eventListeners && this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Utility methods
  exportData() {
    return {
      state: this.modules.stateManager.exportState(),
      storage: storageManager.exportAllData(),
      timestamp: Date.now()
    };
  }

  importData(data) {
    if (data.state) {
      this.modules.stateManager.importState(data.state);
    }
    if (data.storage) {
      storageManager.importAllData(data.storage);
    }
  }

  getDebugInfo() {
    return {
      initialized: this.initialized,
      modules: Object.keys(this.modules),
      state: this.modules.stateManager?.getDebugInfo(),
      inputManager: this.modules.inputManager?.getDebugInfo(),
      eventCoordinator: this.modules.eventCoordinator?.getDebugInfo(),
      storage: storageManager.getStorageInfo()
    };
  }

  // Cleanup
  destroy() {
    try {
      // Save final state
      this.saveCurrentSession();
      
      // Cleanup modules
      if (this.modules.audioManager) {
        this.modules.audioManager.destroy();
      }
      
      // Clear intervals and event listeners
      if (this.autoSaveInterval) {
        clearInterval(this.autoSaveInterval);
      }
      
      console.log('App destroyed');
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  handleInitializationError(error) {
    // Show user-friendly error message
    const errorMessage = document.createElement('div');
    errorMessage.className = 'app-error';
    errorMessage.innerHTML = `
      <h3>Initialization Error</h3>
      <p>The app failed to initialize properly. Please refresh the page.</p>
      <details>
        <summary>Technical Details</summary>
        <pre>${error.message}</pre>
      </details>
    `;
    
    document.body.insertBefore(errorMessage, document.body.firstChild);
  }
}

// Create global app instance
let appInstance = null;

// Initialize app when DOM is ready
function initializeApp() {
  if (appInstance) {
    console.warn('App already initialized');
    return appInstance;
  }
  
  appInstance = new AutoharpTransposerApp();
  
  // Make app available globally for debugging
  window.AutoharpApp = appInstance;
  
  return appInstance;
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

export { AutoharpTransposerApp, initializeApp };
