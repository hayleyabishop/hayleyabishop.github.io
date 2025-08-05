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

// Legacy function for backward compatibility
function addChordFromButton(chordValue) {
  if (chordValue) {
    appendChord(chordValue);
    onInputChordsChanged();
  }
}

function appendChord(chord) {
  const newChord = document.createElement("div");
  newChord.setAttribute("role", "listitem");
  newChord.classList.add("chord");
  newChord.setAttribute("aria-grabbed", "false");
  newChord.setAttribute("draggable", true);
  addDragListeners(newChord);

  // Create inner container for content
  const content = document.createElement("div");
  content.setAttribute("class", "chord-content");
  content.innerHTML = `<span>${chord}</span><button class="xbutton" onclick="removeChord(this)" aria-label="Remove ${chord} chord">x</button>`;
  newChord.appendChild(content);

  chordGroup.appendChild(newChord);
  chordGroup.setAttribute("role", "list");
  onInputChordsChanged();
}

function removeChord(button) {
  console.log('[DEBUG] removeChord called with button:', button);
  
  const newChord = button.closest(".chord");
  if (!newChord) {
    console.error('[DEBUG] Could not find .chord element');
    return;
  }
  
  console.log('[DEBUG] Found chord element:', newChord);
  
  newChord.setAttribute("aria-hidden", "true");
  newChord.style.animation = "fadeOut 0.3s forwards";
  
  newChord.addEventListener("animationend", () => {
    console.log('[DEBUG] Animation ended, removing chord from DOM');
    const chordGroup = document.getElementById('chordGroup');
    if (chordGroup && chordGroup.contains(newChord)) {
      chordGroup.removeChild(newChord);
      onInputChordsChanged();
      console.log('[DEBUG] Chord removed successfully');
    } else {
      console.error('[DEBUG] Could not remove chord - chordGroup not found or chord not in group');
    }
  });
}

// Ensure function is globally accessible
window.removeChord = removeChord;

function getInputChords() {
  // Get all chord names from the input chordGroup -- the text within the Span.
  // Updated to use correct element ID: chordGroupInputs instead of chordGroup
  const chordGroupElement = document.getElementById('chordGroupInputs') || chordGroup;
  if (!chordGroupElement) {
    console.warn('Neither chordGroupInputs nor chordGroup element found');
    return [];
  }
  return Array.from(chordGroupElement.querySelectorAll('.chord span')).map(span => span.textContent);
}

// =============================================================================
// DRAG AND DROP FUNCTIONALITY
// =============================================================================

function initializeDragAndDrop() {
  // When chord created, make it draggable.
  let draggables = document.querySelectorAll('[draggable="true"]');
  draggables.forEach(addDragListeners);
}

function addDragListeners(draggable) {
  console.log('[DEBUG] addDragListeners called for element:', draggable);
  
  if (!draggable) {
    console.error('[DEBUG] addDragListeners called with null/undefined element');
    return;
  }
  
  // Mouse drag events
  draggable.addEventListener("dragstart", handleDragStart);
  draggable.addEventListener("dragover", handleDragOver);
  draggable.addEventListener("drop", handleDrop);
  draggable.addEventListener("dragend", handleDragEnd);
  
  // Touch events for mobile/touchscreen support
  draggable.addEventListener("touchstart", handleTouchStart, { passive: false });
  draggable.addEventListener("touchmove", handleTouchMove, { passive: false });
  draggable.addEventListener("touchend", handleTouchEnd);
  
  console.log('[DEBUG] Drag listeners added successfully to:', draggable.className);
}

// Ensure function is globally accessible via window object
window.addDragListeners = addDragListeners;

function handleDragStart(e) {
  draggedChord = this;
  console.log('[DEBUG] Drag start handler - element:', this);
  console.log('[DEBUG] Drag start - draggedChord set to:', draggedChord);
  this.setAttribute("aria-grabbed", "true"); // Update ARIA attribute when grabbed
  setTimeout(() => {
    this.classList.add("dragging");
    console.log('[DEBUG] Dragging class added');
  }, 0); // Delay to apply dragging effect
}

function handleDragOver(e) {
  e.preventDefault();
  console.log('[DEBUG] Drag over - clientX:', e.clientX);
  const afterElement = getDragAfterElement(chordGroup, e.clientX);
  console.log('[DEBUG] After element:', afterElement);
  
  if (afterElement == null && chordGroup.lastElementChild == draggedChord) {
    // Do nothing. We are already at the end.
    console.log('[DEBUG] Already at end, no movement needed');
  } else if (afterElement == null && chordGroup.lastElementChild !== draggedChord) {
    console.log('[DEBUG] Moving to end of list');
    chordGroup.appendChild(draggedChord);
  } else if (afterElement !== null) {
    if (draggedChord !== afterElement.previousElementSibling) {
      console.log('[DEBUG] Inserting before:', afterElement);
      chordGroup.insertBefore(draggedChord, afterElement);
    }
  }
}

function handleDrop() {
  console.log('[DEBUG] Drop handler - removing dragging class');
  this.classList.remove("dragging");
  onInputChordsChanged(); // Trigger update after reorder
  console.log('[DEBUG] Drop completed, chords updated');
}

function handleDragEnd() {
  console.log('[DEBUG] Drag end handler');
  this.setAttribute("aria-grabbed", "false"); // Reset ARIA attribute when dropped
  this.classList.remove("dragging");
  draggedChord = null;
  onInputChordsChanged(); // Recalculate resulting chords after drag
}

// Insert the chord before the next element.
// Calculate which element is next based on drop location.
function getDragAfterElement(container, x) {
  const draggableElements = [
    ...container.querySelectorAll(".chord:not(.dragging)"),
  ];
  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = x - box.left - box.width / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

// =============================================================================
// TOUCH EVENT HANDLERS FOR MOBILE SUPPORT
// =============================================================================

let touchStartX = 0;
let touchStartY = 0;
let isDragging = false;

function handleTouchStart(e) {
  // Prevent default to avoid scrolling while dragging
  e.preventDefault();
  
  draggedChord = this;
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
  isDragging = false;
  
  this.setAttribute("aria-grabbed", "true");
  console.log("touch start handler");
}

function handleTouchMove(e) {
  if (!draggedChord) return;
  
  e.preventDefault();
  const touch = e.touches[0];
  const deltaX = Math.abs(touch.clientX - touchStartX);
  const deltaY = Math.abs(touch.clientY - touchStartY);
  
  // Start dragging if moved more than 10px (threshold to distinguish from tap)
  if (!isDragging && (deltaX > 10 || deltaY > 10)) {
    isDragging = true;
    draggedChord.classList.add("dragging");
  }
  
  if (isDragging) {
    // Find the element we're dragging over
    const afterElement = getDragAfterElement(chordGroup, touch.clientX);
    
    if (afterElement == null && chordGroup.lastElementChild == draggedChord) {
      // Do nothing. We are already at the end.
    } else if (afterElement == null && chordGroup.lastElementChild !== draggedChord) {
      chordGroup.appendChild(draggedChord);
    } else if (afterElement !== null) {
      if (draggedChord !== afterElement.previousElementSibling) {
        chordGroup.insertBefore(draggedChord, afterElement);
      }
    }
  }
}

function handleTouchEnd(e) {
  if (!draggedChord) return;
  
  this.setAttribute("aria-grabbed", "false");
  this.classList.remove("dragging");
  
  if (isDragging) {
    onInputChordsChanged(); // Recalculate resulting chords after drag
  }
  
  draggedChord = null;
  isDragging = false;
  console.log("touch end handler");
}

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
// TODO: Add list of minor chords. Work through problem of interval degree.
// TODO: Add audible chords sound playing. 
// TODO: Add section for chord degrees / nashville numbers. 
// TODO: Render chord DEGREES/nashville no.s as chips. Use capital or lowercase for major minor. ex. I vi ii V I
// TODO: Support "7" chords. 
// TODO: Add "Found # progressions" results message. 
// TODO: Add chord synonym suggestions. 
// TODO: Add degrees indicators by each chord group. 
// TODO: Add save functionality that allows users to save chords.
// TODO: Add Custom Chords text input to allow users to paste in a list of chords.
// TODO: Add Custom Chords highlighted buttons that allows user to toggle chords on/off of availability. 
