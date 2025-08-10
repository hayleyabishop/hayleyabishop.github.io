// =============================================================================
// CONSTANTS AND DATA
// =============================================================================

const CHORD_LISTS = {
  notes: ["C", "C#/Db", "D", "D#/Eb", "E", "F", "F#/Gb", "G", "G#/Ab","A", "A#/Bb", "B"],
  autoharp12Maj: ["C","F","G","A#/Bb"],
  autoharp12Min: ["Dm","Gm","Am"],
  autoharp127th: ["C7","D7","E7","G7","A7"],
  autoharp15Maj: ["C", "D", "D#/Eb", "E", "F", "G", "A#/Bb"],
  autoharp15Min: ["Dm", "Am", "Gm"],
  autoharp157th: ["C7","D7","E7","F7","G7","A7"],
  autoharp15MajIntervals: [0,2,3,4,5,7,10],
  autoharp15MinIntervals: [2,9,7],
  autoharp157thIntervals: [0,2,4,5,7,9],
  autoharp21Maj: ["C","D","D#/Eb","F","G","G#/Ab","A","A#/Bb"],
  autoharp21Min: ["Cm","Dm","Em","Gm","Am"],
  autoharp217th: ["C7","D7", "E7","F7", "G7","A7","B7", "A#/Bb7"],
  autoharp21MajIntervals: [0,2,3,5,7,8,9,10],
  autoharp21MinIntervals: [0,2,4,7,9],
  autoharp217thIntervals: [0,2,4,5,7,9,11,10],

};

// Expose CHORD_LISTS to global window for module access
window.CHORD_LISTS = CHORD_LISTS;

const REGEX_CHORDS = /[A-G](#|b)?(\/[A-G](#|b)?)?/gm;

// Function to parse a chord string and extract root note and type
/**
 * LEGACY FUNCTION: Parses chord notation string into structured data
 * NOTE: This is different from chordParser.parseChord() which finds matching chords from available list
 * @param {string} chordString - Chord notation (e.g., "Cm7", "F#maj7")
 * @returns {Object|null} - {root, type, original} or null if invalid
 */
function parseChordString(chordString) {
  // Match the root note (including sharps/flats and enharmonic equivalents)
  const rootMatch = chordString.match(/^[A-G](#\/[A-G]b|b\/[A-G]#|#|b)?/);
  if (!rootMatch) return null;
  
  const root = rootMatch[0];
  const remainder = chordString.slice(root.length);
  
  // Determine chord type based on remainder
  let chordType = 'major'; // default
  
  if (remainder.includes('m7')) {
    chordType = 'minor7';
  } else if (remainder.includes('maj7')) {
    chordType = 'major7';
  } else if (remainder.includes('m')) {
    chordType = 'minor';
  } else if (remainder.includes('7')) {
    chordType = 'dominant7';
  } else if (remainder.includes('dim')) {
    chordType = 'diminished';
  } else if (remainder.includes('aug')) {
    chordType = 'augmented';
  }
  
  return {
    root: root,
    type: chordType,
    original: chordString
  };
}

// Global variable to store the current autoharp chord list
let currentAutoharpChords = CHORD_LISTS.autoharp21Maj.concat(CHORD_LISTS.autoharp21Min.concat(CHORD_LISTS.autoharp217th)); // Default to 21-chord

// Global variables
let draggedChord = null;
let selectedChordName = null;
let selectedChordType = null;

// =============================================================================
// AUTOHARP TYPES
// =============================================================================

function initializeAutoharpTypeListeners() {
  const chordInputType = document.querySelectorAll("[name='autoharpType']");
  chordInputType.forEach(inputType => {
    inputType.addEventListener("change", onAutoharpTypeChanged);
  });
}

function onAutoharpTypeChanged(event) {
  const selectedType = event.target.value;

  switch (selectedType) {
    case "type12Chord":
      // TODO: Minor/major/7th chords integration
      // if progression is c to d minor, find the c to d comparison, then check if d minor exists
      // rootNoteInterval = result interval;
      // 0 0m 1 1m 2 2m 2D7... 
      // interval is 1 to minor +1;
      
      currentAutoharpChords = CHORD_LISTS.autoharp12Maj.concat(CHORD_LISTS.autoharp12Min.concat(CHORD_LISTS.autoharp127th));
      break;
    case "type15Chord":
      // 15-chord autoharp typically has these chords
      currentAutoharpChords = CHORD_LISTS.autoharp15Maj.concat(CHORD_LISTS.autoharp15Min.concat(CHORD_LISTS.autoharp157th));
      break;
    case "type21Chord":
      currentAutoharpChords = CHORD_LISTS.autoharp21Maj.concat(CHORD_LISTS.autoharp21Min.concat(CHORD_LISTS.autoharp217th));
      break;
    case "typeCustomChords":
      // For custom, show all available chords
      // TODO: Make variable chord list!
      currentAutoharpChords = CHORD_LISTS.notes;
      break;
  }
  
  // Update the available chords display
  renderAvailableChords(currentAutoharpChords);
  onInputChordsChanged();
}

function renderAvailableChords(chordList) {
  // Find the container where chords should be displayed
  const availableChordsContainer = document.querySelector('.availableChordsSection');
  
  if (!availableChordsContainer || chordList.length === 0) {
    return;
  }
  
  // Clear existing content
  availableChordsContainer.innerHTML = '';
  
  // Create chord keys similar to the existing Eb key
  chordList.forEach((chord, index) => {
      const chordKey = document.createElement('div');
      chordKey.className = 'staticChord';
      chordKey.textContent = chord;
      availableChordsContainer.appendChild(chordKey);
    
  });
}

// =============================================================================
// DOM ELEMENT REFERENCES
// =============================================================================

function initializeDOMReferences() {
  // Define the draggables container as js variables for manipulation.
  window.chordGroup = document.getElementById("chordGroupInputs");
  window.chordGroupResults = document.getElementById("chordGroupResults");
  
  // Add container drag events (where you drop) - now using eventCoordinator
  if (window.chordGroup) {
    console.log('[DEBUG] Adding container drag events to chordGroup');
    if (window.eventCoordinator) {
      window.chordGroup.addEventListener("dragover", window.eventCoordinator.handleDragOver.bind(window.eventCoordinator));
      window.chordGroup.addEventListener("drop", window.eventCoordinator.handleDrop.bind(window.eventCoordinator));
    } else {
      console.error('[DEBUG] eventCoordinator not available for container drag events');
    }
  } else {
    console.error('[DEBUG] chordGroup element not found for drag events');
  }
}

// =============================================================================
// CHORD INPUT
// =============================================================================

function initializeChordInputListener() {
  // Chord buttons now use inline onclick handlers
  // This function is kept for compatibility but no longer needed
}

// =============================================================================
// CHORD SELECTION FUNCTIONS
// =============================================================================

function selectChordName(chordName) {
  const selectedButton = document.querySelector(`[data-chord="${chordName}"]`);
  
  // Check if the button is already active (toggle behavior)
  if (selectedButton.classList.contains('active')) {
    // Remove active class from all chord name buttons
    document.querySelectorAll('.chordName').forEach(btn => {
      btn.classList.remove('active');
      btn.classList.remove('grayed-out');
    });
    
    selectedChordName = null;
    return;
  }
  
  // Remove active class from all chord name buttons
  document.querySelectorAll('.chordName').forEach(btn => {
    btn.classList.remove('active');
    btn.classList.remove('grayed-out');
  });
  
  // Add active class to selected button and gray out others
  selectedButton.classList.add('active');
  
  document.querySelectorAll('.chordName').forEach(btn => {
    if (btn !== selectedButton) {
      btn.classList.add('grayed-out');
    }
  });
  
  selectedChordName = chordName;
  tryAddChord();
}

function selectChordType(chordType) {
  const selectedButton = document.querySelector(`[data-type="${chordType}"]`);
  
  // Check if the button is already active (toggle behavior)
  if (selectedButton.classList.contains('active')) {
    // Remove active class from all chord type buttons
    document.querySelectorAll('.chordType').forEach(btn => {
      btn.classList.remove('active');
      btn.classList.remove('grayed-out');
    });
    
    selectedChordType = null;
    return;
  }
  
  // Remove active class from all chord type buttons
  document.querySelectorAll('.chordType').forEach(btn => {
    btn.classList.remove('active');
    btn.classList.remove('grayed-out');
  });
  
  // Add active class to selected button and gray out others
  selectedButton.classList.add('active');
  
  document.querySelectorAll('.chordType').forEach(btn => {
    if (btn !== selectedButton) {
      btn.classList.add('grayed-out');
    }
  });
  
  selectedChordType = chordType;
  tryAddChord();
}

function tryAddChord() {
  if (selectedChordName && selectedChordType) {
    const chordValue = formatChordName(selectedChordName, selectedChordType);
    appendChord(chordValue);
    onInputChordsChanged();
    
    // Reset selections
    resetChordSelection();
  }
}

function resetChordSelection() {
  selectedChordName = null;
  selectedChordType = null;
  
  // First, gray out all buttons for visual feedback
  document.querySelectorAll('.chordName, .chordType').forEach(btn => {
    btn.classList.remove('active');
    btn.classList.add('grayed-out');
  });
  
  // After a brief delay, return all buttons to normal state
  setTimeout(() => {
    document.querySelectorAll('.chordName, .chordType').forEach(btn => {
      btn.classList.remove('grayed-out');
    });
  }, 100); // 200ms delay
}

function formatChordName(chordName, chordType) {
  switch (chordType) {
    case 'major':
      return chordName;
    case 'minor':
      return chordName + 'm';
    case '7th':
      return chordName + '7';
    case 'm7':
      return chordName + 'm7';
    case 'maj7':
      return chordName + 'maj7';
    case 'dim':
      return chordName + 'dim';
    case 'aug':
      return chordName + 'aug';
    default:
      return chordName;
  }
}

// Legacy function for backward compatibility - now uses inputManager
function addChordFromButton(chordValue) {
  console.log('[DEBUG] addChordFromButton called with:', chordValue);
  if (chordValue && window.inputManager) {
    window.inputManager.appendChordLegacy(chordValue);
    onInputChordsChanged();
  } else {
    console.error('[DEBUG] inputManager not available or chordValue empty');
  }
}

// Legacy function - now delegates to inputManager
function appendChord(chord) {
  console.log('[DEBUG] appendChord called with:', chord);
  if (window.inputManager) {
    window.inputManager.appendChordLegacy(chord);
  } else {
    console.error('[DEBUG] inputManager not available');
  }
}

// Legacy function - now delegates to inputManager
function removeChord(button) {
  console.log('[DEBUG] removeChord called with button:', button);
  if (window.inputManager) {
    window.inputManager.removeChordLegacy(button);
  } else {
    console.error('[DEBUG] inputManager not available');
  }
}

// Ensure function is globally accessible
window.removeChord = removeChord;

// Legacy function - now delegates to inputManager
function getInputChords() {
  console.log('[DEBUG] getInputChords called');
  if (window.inputManager) {
    return window.inputManager.getInputChordsLegacy();
  } else {
    console.error('[DEBUG] inputManager not available');
    return [];
  }
}

// =============================================================================
// DRAG AND DROP FUNCTIONALITY
// =============================================================================

function initializeDragAndDrop() {
  // When chord created, make it draggable.
  let draggables = document.querySelectorAll('[draggable="true"]');
  draggables.forEach(addDragListeners);
}

// Legacy function - now delegates to eventCoordinator
function addDragListeners(draggable) {
  console.log('[DEBUG] addDragListeners called - delegating to eventCoordinator');
  if (window.eventCoordinator) {
    window.eventCoordinator.addDragListeners(draggable);
  } else {
    console.error('[DEBUG] eventCoordinator not available');
  }
}

// Ensure function is globally accessible via window object
window.addDragListeners = addDragListeners;

// =============================================================================
// DRAG AND TOUCH HANDLERS - REFACTORED TO USE EVENT COORDINATOR
// All drag and touch functionality moved to eventCoordinator.js for better modularity
// =============================================================================

// Note: All drag and touch event handlers have been moved to EventCoordinator class
// The container-level drag events (dragover, drop) are still bound here in initializeDOMReferences
// Individual element drag events are handled by EventCoordinator.addDragListeners

// =============================================================================
// CALCULATE RESULTANT CHORDS
// =============================================================================

function calculateResultingChords(inputChords) {
  const chords = CHORD_LISTS.notes;
  const autoharpChords = currentAutoharpChords;

  let autoharpIntervals = [];
  let intervals = [];

  // Find the input chords' relationship to one another.
  // Transpose that relationship by finding other chords in the autoharpChords list
  // that have the same relationship.
  console.log("Input Chords: \n" + inputChords);

  for (let i in autoharpChords) {
    // console.log(i + ": " + autoharpChords[i].match(REGEX_CHORDS)[0] + " of " + autoharpChords[i]);
    // console.log(chords.indexOf(autoharpChords[i].match(REGEX_CHORDS)[0]));
    autoharpIntervals.push(chords.indexOf(autoharpChords[i].match(REGEX_CHORDS)[0]));
  }
  console.log("\n Available Autoharp Chords Index: \n" + autoharpIntervals);

  // Parse input chords to extract root notes and types
  let parsedInputChords = [];
  for (let i in inputChords) {
    const parsed = parseChordString(inputChords[i]);
    if (parsed) {
      const rootIndex = chords.indexOf(parsed.root);
      parsedInputChords.push({
        index: rootIndex,
        type: parsed.type,
        original: parsed.original,
        root: parsed.root
      });
      intervals.push(rootIndex);
      console.log(`Chord ${i}: ${parsed.original} -> Root: ${parsed.root} (index ${rootIndex}), Type: ${parsed.type}`);
    } else {
      console.warn(`Could not parse chord: ${inputChords[i]}`);
    }
  }
  console.log("Parsed input chords:", parsedInputChords);
  console.log("Input chord intervals:", intervals);
  // Create a map of available autoharp chords by root note and type
  let autoharpChordMap = new Map();
  for (let chord of autoharpChords) {
    const parsed = parseChordString(chord);
    if (parsed) {
      const rootIndex = chords.indexOf(parsed.root);
      const key = `${rootIndex}-${parsed.type}`;
      if (!autoharpChordMap.has(key)) {
        autoharpChordMap.set(key, []);
      }
      autoharpChordMap.get(key).push(chord);
    }
  }

  console.log("Available autoharp chords by type:", autoharpChordMap);

  // Find all possible transpositions
  let matches = [];
  
  // Try each possible transposition (0-11 semitones)
  for (let transposition = 0; transposition < 12; transposition++) {
    let transposedChords = [];
    let allChordsAvailable = true;
    
    // Check if all input chords can be transposed and are available on autoharp
    for (let inputChord of parsedInputChords) {
      const transposedRootIndex = (inputChord.index + transposition) % 12;
      const transposedKey = `${transposedRootIndex}-${inputChord.type}`;
      
      if (autoharpChordMap.has(transposedKey)) {
        // Found a matching chord on the autoharp
        const availableChords = autoharpChordMap.get(transposedKey);
        transposedChords.push({
          original: inputChord.original,
          transposed: availableChords[0], // Use first available chord
          rootIndex: transposedRootIndex,
          type: inputChord.type
        });
      } else {
        // This chord type is not available at this transposition
        allChordsAvailable = false;
        break;
      }
    }
    
    if (allChordsAvailable && transposedChords.length > 0) {
      matches.push({
        transposition: transposition,
        chords: transposedChords
      });
      
      console.log(`Transposition +${transposition} semitones:`, 
        transposedChords.map(c => `${c.original} → ${c.transposed}`).join(', '));
    }
  }

  console.log(`Found ${matches.length} valid transpositions`);
  return matches;
}

// =============================================================================
// RENDER CHORD MATCHES
// =============================================================================

function onInputChordsChanged() {
  const inputChords = getInputChords();
  chordGroupResults.innerHTML = '';

  if (inputChords.length < 2) {
    // Always render an empty chordGroup for staff background
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'chordGroup';
    chordGroupResults.appendChild(emptyDiv);
    return;
  }

  // Call calculation logic
  const resultingChords = calculateResultingChords(inputChords);
  chordGroupResults.innerHTML = '';

  if (resultingChords.length === 0) {
    // Always render an empty chordGroup for staff background
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'chordGroup';
    chordGroupResults.appendChild(emptyDiv);
    return;
  }

  resultingChords.forEach((transpositionResult, i) => {
    const div = document.createElement('div');
    div.className = 'chordGroup';
    
    // Add transposition header
    const semitones = transpositionResult.transposition;
    const direction = semitones === 0 ? '+0' : 
                     semitones > 0 ? `+${semitones} semitones` : 
                     `${Math.abs(semitones)} semitones`;
    div.style.setProperty('--transposition-text', `"${direction}"`);
    div.setAttribute('data-transposition', direction);
    
    // Add the transposed chords
    transpositionResult.chords.forEach((chordInfo, j) => {
      const chordDiv = document.createElement('div');
      chordDiv.className = 'chord';
      chordDiv.setAttribute('role', 'listitem');
      chordDiv.setAttribute('aria-grabbed', 'false');
      
      // Show both original and transposed chord
      chordDiv.innerHTML = `
        <span class="transposed-chord">${chordInfo.transposed}</span>
      `;

      // Do NOT set draggable attribute for resulting chords
      div.appendChild(chordDiv);
    });
    
    chordGroupResults.appendChild(div);
  });
}

// =============================================================================
// AUDIO AND VISUAL FEEDBACK INITIALIZATION
// =============================================================================

// Global instances for audio and visual feedback managers
let audioManager = null;
let visualManager = null;

/**
 * Initialize audio and visual feedback modules
 * Phase 1 of integration sequence - enables other agents to proceed
 */
function initializeAudioVisualModules() {
  try {
    // Import and initialize ChordAudioManager
    import('./modules/chordAudio.js').then(({ ChordAudioManager }) => {
      audioManager = new ChordAudioManager();
      window.audioManager = audioManager; // Make globally accessible
      console.log('[Integration] Audio manager initialized successfully');
    }).catch(error => {
      console.error('[Integration] Failed to initialize audio manager:', error);
    });

    // Import and initialize VisualFeedbackManager
    import('./modules/visualFeedback.js').then(({ VisualFeedbackManager }) => {
      visualManager = new VisualFeedbackManager();
      window.visualManager = visualManager; // Make globally accessible
      console.log('[Integration] Visual feedback manager initialized successfully');
    }).catch(error => {
      console.error('[Integration] Failed to initialize visual feedback manager:', error);
    });

  } catch (error) {
    console.error('[Integration] Error during audio/visual module initialization:', error);
  }
}

// =============================================================================
// INITIALIZE EVENT LISTENERS
// =============================================================================

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  initializeDOMReferences();
  initializeAutoharpTypeListeners();
  initializeChordInputListener();
  initializeDragAndDrop();
  
  // Phase 1: Initialize audio/visual modules (critical for other agents)
  initializeAudioVisualModules();
}); 

// =============================================================================
// TODO LIST
// =============================================================================

// TODO: Add collapsible section in Availabe Chords.
// TODO: Move "Available Chords" off to the side or bottom. 
// TODO: Drag and drop support using touch screens?????? 
// TODO: Add section for chord degrees / nashville numbers. 
// TODO: Render chord DEGREES/nashville no.s as chips. Use capital or lowercase for major minor. ex. I vi ii V I
// TODO: Add "Found # progressions" results message. 
// TODO: Add chord synonym suggestions. 
// TODO: Add save functionality that allows users to save chords.
// TODO: Add Custom Chords text input to allow users to paste in a list of chords.
// TODO: Add Custom Chords highlighted buttons that allows user to toggle chords on/off of availability. 


// DONE: Add audible chords sound playing. 

// DONE: Add list of minor chords. Work through problem of interval degree.
// DONE: Support "7" chords. 
// DONE: Add degrees indicators by each chord group. 
