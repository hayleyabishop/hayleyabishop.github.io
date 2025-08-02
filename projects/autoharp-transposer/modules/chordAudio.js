// =============================================================================
// CHORD AUDIO MANAGER
// Handles audio playback for chord sounds
// =============================================================================

class ChordAudioManager {
  constructor() {
    this.audioContext = null;
    this.soundEnabled = false;
    this.oscillators = [];
    this.gainNode = null;
    this.initializeAudioContext();
  }

  initializeAudioContext() {
    try {
      // Initialize Web Audio API
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    const soundToggle = document.getElementById('soundToggle');
    if (soundToggle) {
      soundToggle.textContent = this.soundEnabled ? '🔊' : '🔇';
      soundToggle.setAttribute('aria-label', this.soundEnabled ? 'Sound on' : 'Sound off');
    }
    
    // Resume audio context if needed (browser security requirement)
    if (this.soundEnabled && this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    return this.soundEnabled;
  }

  playChord(chord, autoharpType = null) {
    if (!this.soundEnabled || !this.audioContext || !chord) {
      return;
    }

    // Stop any currently playing sounds
    this.stopAllSounds();

    try {
      const chordName = typeof chord === 'string' ? chord : chord.name || chord.chord;
      const frequencies = this.getChordFrequencies(chordName, autoharpType);
      const currentTime = this.audioContext.currentTime;
      const duration = 0.8; // seconds

      frequencies.forEach((frequency, index) => {
        const oscillator = this.audioContext.createOscillator();
        const noteGain = this.audioContext.createGain();
        
        oscillator.connect(noteGain);
        noteGain.connect(this.gainNode);
        
        oscillator.frequency.setValueAtTime(frequency, currentTime);
        oscillator.type = this.getOscillatorType(autoharpType);
        
        // Envelope: attack, sustain, release
        noteGain.gain.setValueAtTime(0, currentTime);
        noteGain.gain.linearRampToValueAtTime(0.3, currentTime + 0.05);
        noteGain.gain.setValueAtTime(0.3, currentTime + duration * 0.7);
        noteGain.gain.exponentialRampToValueAtTime(0.01, currentTime + duration);
        
        oscillator.start(currentTime);
        oscillator.stop(currentTime + duration);
        
        this.oscillators.push(oscillator);
        
        // Clean up after playing
        oscillator.onended = () => {
          const index = this.oscillators.indexOf(oscillator);
          if (index > -1) {
            this.oscillators.splice(index, 1);
          }
        };
      });
    } catch (error) {
      console.warn('Error playing chord:', error);
    }
  }

  playProgression(progression, tempo = 120) {
    if (!this.soundEnabled || !this.audioContext || !progression || !Array.isArray(progression)) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const chordDuration = 60 / tempo; // Duration per chord in seconds
      let currentTime = this.audioContext.currentTime;
      let playbackPromises = [];

      progression.forEach((chord, index) => {
        const chordPlayPromise = new Promise((chordResolve) => {
          setTimeout(() => {
            this.playChordAtTime(chord, currentTime, chordDuration);
            chordResolve();
          }, index * chordDuration * 1000);
        });
        
        playbackPromises.push(chordPlayPromise);
        currentTime += chordDuration;
      });

      // Resolve when all chords have been scheduled
      Promise.all(playbackPromises).then(() => {
        // Add extra time for the last chord to finish playing
        setTimeout(resolve, chordDuration * 1000);
      });
    });
  }

  previewTransposition(originalChords, transposedChords) {
    if (!this.soundEnabled || !this.audioContext || !originalChords || !transposedChords) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      // Play original progression first
      console.log('🎵 Playing original progression...');
      this.playProgression(originalChords, 100).then(() => {
        // Brief pause between progressions
        setTimeout(() => {
          console.log('🎵 Playing transposed progression...');
          this.playProgression(transposedChords, 100).then(resolve);
        }, 500);
      });
    });
  }

  playChordAtTime(chord, startTime, duration) {
    try {
      const chordName = typeof chord === 'string' ? chord : chord.name || chord.chord;
      const frequencies = this.getChordFrequencies(chordName);
      
      frequencies.forEach((frequency) => {
        const oscillator = this.audioContext.createOscillator();
        const noteGain = this.audioContext.createGain();
        
        oscillator.connect(noteGain);
        noteGain.connect(this.gainNode);
        
        oscillator.frequency.setValueAtTime(frequency, startTime);
        oscillator.type = 'sine';
        
        // Envelope for progression playback
        noteGain.gain.setValueAtTime(0, startTime);
        noteGain.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
        noteGain.gain.setValueAtTime(0.2, startTime + duration * 0.8);
        noteGain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
        
        this.oscillators.push(oscillator);
        
        // Clean up after playing
        oscillator.onended = () => {
          const index = this.oscillators.indexOf(oscillator);
          if (index > -1) {
            this.oscillators.splice(index, 1);
          }
        };
      });
    } catch (error) {
      console.warn('Error playing chord at time:', error);
    }
  }

  stopAllSounds() {
    this.oscillators.forEach(oscillator => {
      try {
        oscillator.stop();
      } catch (error) {
        // Oscillator might already be stopped
      }
    });
    this.oscillators = [];
  }

  getChordFrequencies(chordName, autoharpType = null) {
    // Basic chord frequency mapping (simplified)
    const noteFrequencies = {
      'C': 261.63, 'C#': 277.18, 'Db': 277.18,
      'D': 293.66, 'D#': 311.13, 'Eb': 311.13,
      'E': 329.63, 'F': 349.23, 'F#': 369.99, 'Gb': 369.99,
      'G': 392.00, 'G#': 415.30, 'Ab': 415.30,
      'A': 440.00, 'A#': 466.16, 'Bb': 466.16,
      'B': 493.88
    };

    // Parse chord name to get root and type
    const parsed = this.parseChordName(chordName);
    if (!parsed) return [440]; // Default A note

    const rootFreq = noteFrequencies[parsed.root];
    if (!rootFreq) return [440];

    // Apply autoharp-specific frequency adjustments
    const frequencies = this.getBaseChordFrequencies(rootFreq, parsed.type);
    return this.applyAutoharpCharacteristics(frequencies, autoharpType);
  }

  parseChordName(chordName) {
    // Simple chord parsing - extract root note and type
    const match = chordName.match(/^([A-G][#b]?)(.*)$/);
    if (!match) return null;

    const root = match[1];
    const suffix = match[2].toLowerCase();

    let type = 'major'; // default
    if (suffix.includes('m7')) type = 'minor7';
    else if (suffix.includes('maj7')) type = 'major7';
    else if (suffix.includes('m')) type = 'minor';
    else if (suffix.includes('7')) type = 'dominant7';
    else if (suffix.includes('dim')) type = 'diminished';
    else if (suffix.includes('aug')) type = 'augmented';

    return { root, type };
  }

  getBaseChordFrequencies(rootFreq, chordType) {
    // Generate base chord frequencies based on type
    switch (chordType) {
      case 'major':
        return [rootFreq, rootFreq * 1.25, rootFreq * 1.5]; // Root, Major 3rd, Perfect 5th
      case 'minor':
        return [rootFreq, rootFreq * 1.2, rootFreq * 1.5]; // Root, Minor 3rd, Perfect 5th
      case 'dominant7':
        return [rootFreq, rootFreq * 1.25, rootFreq * 1.5, rootFreq * 1.78]; // Add minor 7th
      case 'major7':
        return [rootFreq, rootFreq * 1.25, rootFreq * 1.5, rootFreq * 1.89]; // Add major 7th
      case 'minor7':
        return [rootFreq, rootFreq * 1.2, rootFreq * 1.5, rootFreq * 1.78]; // Minor + minor 7th
      case 'diminished':
        return [rootFreq, rootFreq * 1.2, rootFreq * 1.41]; // Root, Minor 3rd, Diminished 5th
      case 'augmented':
        return [rootFreq, rootFreq * 1.25, rootFreq * 1.59]; // Root, Major 3rd, Augmented 5th
      default:
        return [rootFreq, rootFreq * 1.25, rootFreq * 1.5]; // Default to major
    }
  }

  applyAutoharpCharacteristics(frequencies, autoharpType) {
    if (!autoharpType) return frequencies;

    // Apply autoharp-specific sound characteristics
    switch (autoharpType.id || autoharpType) {
      case '15-chord-chromatic':
      case '21-chord-chromatic':
        // Chromatic autoharps have brighter, more metallic sound
        return frequencies.map(freq => freq * 1.02); // Slightly sharper
      
      case 'diatonic':
        // Diatonic autoharps have warmer, more mellow sound
        return frequencies.map(freq => freq * 0.98); // Slightly flatter
      
      case 'concert':
        // Concert autoharps have fuller, richer harmonics
        const harmonics = frequencies.slice();
        // Add subtle octave harmonics for richness
        frequencies.forEach(freq => {
          if (freq * 2 < 2000) { // Avoid too high frequencies
            harmonics.push(freq * 2 * 0.1); // Quiet octave harmonic
          }
        });
        return harmonics;
      
      default:
        return frequencies;
    }
  }

  getOscillatorType(autoharpType) {
    if (!autoharpType) return 'sine';

    // Different oscillator types for different autoharp characteristics
    switch (autoharpType.id || autoharpType) {
      case '15-chord-chromatic':
      case '21-chord-chromatic':
        return 'triangle'; // Brighter, more metallic sound
      
      case 'diatonic':
        return 'sine'; // Warmer, more mellow sound
      
      case 'concert':
        return 'sawtooth'; // Fuller, richer harmonics
      
      default:
        return 'sine';
    }
  }

  // Cleanup method
  destroy() {
    this.stopAllSounds();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

export { ChordAudioManager };
