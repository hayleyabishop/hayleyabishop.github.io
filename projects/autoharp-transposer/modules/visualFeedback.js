// =============================================================================
// VISUAL FEEDBACK MANAGER
// Handles visual indicators, animations, and user feedback
// =============================================================================

class VisualFeedbackManager {
  constructor() {
    this.activeAnimations = new Map();
    this.feedbackElements = new Map();
    this.initializeFeedbackElements();
  }

  initializeFeedbackElements() {
    // Create or find existing feedback elements
    this.ensureFeedbackContainer();
    this.ensureProgressIndicator();
    this.ensureChordHighlighter();
  }

  ensureFeedbackContainer() {
    let container = document.getElementById('visual-feedback-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'visual-feedback-container';
      container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        pointer-events: none;
      `;
      document.body.appendChild(container);
    }
    this.feedbackElements.set('container', container);
  }

  ensureProgressIndicator() {
    let indicator = document.getElementById('progression-progress');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'progression-progress';
      indicator.style.cssText = `
        background: rgba(0, 123, 255, 0.9);
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 14px;
        margin-bottom: 10px;
        display: none;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      `;
      this.feedbackElements.get('container').appendChild(indicator);
    }
    this.feedbackElements.set('progress', indicator);
  }

  ensureChordHighlighter() {
    // This will highlight chords in the UI when they're being played
    let highlighter = document.getElementById('chord-highlighter');
    if (!highlighter) {
      highlighter = document.createElement('div');
      highlighter.id = 'chord-highlighter';
      highlighter.style.cssText = `
        position: absolute;
        border: 2px solid #007bff;
        border-radius: 4px;
        background: rgba(0, 123, 255, 0.1);
        pointer-events: none;
        display: none;
        transition: all 0.3s ease;
        z-index: 999;
      `;
      document.body.appendChild(highlighter);
    }
    this.feedbackElements.set('highlighter', highlighter);
  }

  // Visual feedback for single chord playback
  showChordPlayback(chordName, autoharpType = null) {
    // Find chord element in UI and highlight it
    const chordElement = this.findChordElement(chordName);
    if (chordElement) {
      this.highlightElement(chordElement, 800);
    }

    // Show chord name feedback
    this.showTemporaryMessage(`🎵 Playing: ${chordName}`, 1000);

    // Add autoharp type indicator if provided
    if (autoharpType) {
      const typeInfo = typeof autoharpType === 'string' ? autoharpType : autoharpType.name;
      this.showTemporaryMessage(`🎻 ${typeInfo}`, 1500, 'top: 60px;');
    }
  }

  // Visual feedback for progression playback
  showProgressionPlayback(progression, tempo = 120) {
    const progressIndicator = this.feedbackElements.get('progress');
    const chordDuration = 60 / tempo * 1000; // Duration in milliseconds
    
    progressIndicator.style.display = 'block';
    progressIndicator.innerHTML = `🎵 Playing Progression (${tempo} BPM)`;

    // Highlight each chord as it plays
    progression.forEach((chord, index) => {
      setTimeout(() => {
        const chordName = typeof chord === 'string' ? chord : chord.name || chord.chord;
        progressIndicator.innerHTML = `🎵 Playing: ${chordName} (${index + 1}/${progression.length})`;
        
        const chordElement = this.findChordElement(chordName);
        if (chordElement) {
          this.highlightElement(chordElement, chordDuration * 0.8);
        }
      }, index * chordDuration);
    });

    // Hide progress indicator when done
    setTimeout(() => {
      progressIndicator.style.display = 'none';
    }, progression.length * chordDuration + 500);

    return progression.length * chordDuration;
  }

  // Visual feedback for transposition preview
  showTranspositionPreview(originalChords, transposedChords) {
    const progressIndicator = this.feedbackElements.get('progress');
    
    // Show original progression
    progressIndicator.style.display = 'block';
    progressIndicator.innerHTML = '🎵 Original Progression';
    progressIndicator.style.background = 'rgba(108, 117, 125, 0.9)';

    const originalDuration = this.showProgressionPlayback(originalChords, 100);

    // Show transposed progression after original finishes
    setTimeout(() => {
      progressIndicator.innerHTML = '🎵 Transposed Progression';
      progressIndicator.style.background = 'rgba(40, 167, 69, 0.9)';
      
      const transposedDuration = this.showProgressionPlayback(transposedChords, 100);
      
      // Reset and hide when both are done
      setTimeout(() => {
        progressIndicator.style.background = 'rgba(0, 123, 255, 0.9)';
        progressIndicator.style.display = 'none';
      }, transposedDuration + 500);
      
    }, originalDuration + 500);
  }

  // Highlight a specific element
  highlightElement(element, duration = 1000) {
    const highlighter = this.feedbackElements.get('highlighter');
    const rect = element.getBoundingClientRect();
    
    highlighter.style.cssText += `
      display: block;
      left: ${rect.left - 2}px;
      top: ${rect.top - 2}px;
      width: ${rect.width + 4}px;
      height: ${rect.height + 4}px;
    `;

    // Animate highlight
    highlighter.style.opacity = '1';
    highlighter.style.transform = 'scale(1.05)';

    setTimeout(() => {
      highlighter.style.opacity = '0';
      highlighter.style.transform = 'scale(1)';
      setTimeout(() => {
        highlighter.style.display = 'none';
      }, 300);
    }, duration);
  }

  // Show temporary message
  showTemporaryMessage(message, duration = 2000, additionalStyles = '') {
    const messageEl = document.createElement('div');
    messageEl.style.cssText = `
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      margin-bottom: 5px;
      animation: fadeInOut ${duration}ms ease-in-out;
      ${additionalStyles}
    `;
    messageEl.textContent = message;

    // Add CSS animation if not already present
    this.ensureFadeAnimation();

    this.feedbackElements.get('container').appendChild(messageEl);

    setTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.parentNode.removeChild(messageEl);
      }
    }, duration);
  }

  ensureFadeAnimation() {
    if (!document.getElementById('visual-feedback-styles')) {
      const style = document.createElement('style');
      style.id = 'visual-feedback-styles';
      style.textContent = `
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(-10px); }
          20% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Find chord element in the UI (searches common chord display areas)
  findChordElement(chordName) {
    // Search for chord in various possible locations
    const selectors = [
      `[data-chord="${chordName}"]`,
      `.chord[data-name="${chordName}"]`,
      `.chord-button:contains("${chordName}")`,
      `button:contains("${chordName}")`,
      `.selected-chord:contains("${chordName}")`,
      `#selectedChords .chord:contains("${chordName}")`
    ];

    for (const selector of selectors) {
      try {
        const element = document.querySelector(selector);
        if (element) return element;
      } catch (e) {
        // Ignore invalid selectors (like :contains which isn't standard)
      }
    }

    // Fallback: search by text content
    const allElements = document.querySelectorAll('button, .chord, .chord-button, .selected-chord');
    for (const element of allElements) {
      if (element.textContent && element.textContent.trim() === chordName) {
        return element;
      }
    }

    return null;
  }

  // Show loading indicator for audio operations
  showAudioLoading(message = 'Loading audio...') {
    const loadingEl = document.createElement('div');
    loadingEl.id = 'audio-loading';
    loadingEl.style.cssText = `
      background: rgba(255, 193, 7, 0.9);
      color: #212529;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    `;
    loadingEl.innerHTML = `
      <div style="width: 16px; height: 16px; border: 2px solid #212529; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
      ${message}
    `;

    // Add spin animation
    if (!document.getElementById('spin-animation')) {
      const style = document.createElement('style');
      style.id = 'spin-animation';
      style.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }

    this.feedbackElements.get('container').appendChild(loadingEl);
    return loadingEl;
  }

  hideAudioLoading() {
    const loadingEl = document.getElementById('audio-loading');
    if (loadingEl && loadingEl.parentNode) {
      loadingEl.parentNode.removeChild(loadingEl);
    }
  }

  // Cleanup method
  destroy() {
    // Clear all active animations
    this.activeAnimations.forEach((animation, key) => {
      clearTimeout(animation);
    });
    this.activeAnimations.clear();

    // Remove feedback elements
    this.feedbackElements.forEach((element, key) => {
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
    this.feedbackElements.clear();
  }
}

export { VisualFeedbackManager };
