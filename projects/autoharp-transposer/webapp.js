// =============================================================================
// CONSTANTS AND DATA
// =============================================================================

const CHORD_LISTS = {
  all: ["A", "A# / Bb", "B", "C", "C# / Db", "D", "D# / Eb", "E", "F", "F# / Gb", "G", "G# / Ab"],
  autoharp12: ["A", "A# / Bb", "B", "C", "D", "D# / Eb", "E", "F", "G", "G# / Ab"],
  autoharp21: ["A", "A7", "Ab", "Am", "B7", "Bb", "Bb7", "C", "C7", "Cm", "D", "D7", "Dm", "E7", "Eb", "Em", "F", "F7", "G", "G7", "Gm"]
};

// Global variables
let draggedChord = null;

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
  let chordList = [];

  switch (selectedType) {
    case "type12Chord":
      // TODO: Make hardcoded variables, and add them to the list!
      // appendChords .staticChords
      // chordList = ["A","A7","Ab","Am","B7","Bb","Bb7","C","C7","Cm","D","D7","Dm","E7","Eb","Em","F","F7","G","G7","Gm"];
      // chord degrees = a, a minor, b, b minor, etc. 
      // if progression is c to d minor, find the c to d comparison, then check if d minor exists
      // rootNoteInterval = result interval;
      // 0 0m 1 1m 2 2m 2D7... 
      // interval is 1 to minor +1;
      
      chordList = CHORD_LISTS.autoharp12;
      break;
    case "type15Chord":
      // 15-chord autoharp typically has these chords
      chordList = ["Eb", "Bb", "F", "F7", "C", "C7", "G", "G7", "Gm", "D7", "D", "Dm", "A7", "Am", "E7"];
      break;
    case "type21Chord":
      chordList = CHORD_LISTS.autoharp21;
      break;
    case "typeCustomChords":
      // For custom, show all available chords
      chordList = CHORD_LISTS.all;
      break;
  }
  
  // Update the available chords display
  renderAvailableChords(chordList);
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
  // Define the Input dropdown and the draggables container as js variables for manipulation.
  window.chordInput = document.getElementById("chordInput1");
  window.chordGroup = document.getElementById("chordGroupInputs");
  window.chordGroupResults = document.getElementById("chordGroupResults");
}

// =============================================================================
// CHORD INPUT
// =============================================================================

function initializeChordInputListener() {
  // When user selects a chord from the dropdown list, spawn a new chord!
  chordInput.addEventListener("change", function () {
    const selectedValue = this.value;
    if (selectedValue !== "") {
      appendChord(selectedValue);
      this.value = "selected";
      onInputChordsChanged();
    }
  });
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
  const newChord = button.closest(".chord");
  newChord.setAttribute("aria-hidden", "true");
  newChord.style.animation = "fadeOut 0.3s forwards";
  newChord.addEventListener("animationend", () => {
    chordGroup.removeChild(newChord);
    onInputChordsChanged();
  });
}

function getInputChords() {
  // Get all chord names from the input chordGroup -- the text within the Span.
  return Array.from(chordGroup.querySelectorAll('.chord span')).map(span => span.textContent);
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
  draggable.addEventListener("dragstart", handleDragStart);
  draggable.addEventListener("dragover", handleDragOver);
  draggable.addEventListener("drop", handleDrop);
  draggable.addEventListener("dragend", handleDragEnd);
}

function handleDragStart(e) {
  draggedChord = this;
  console.log("drag start handler");
  this.setAttribute("aria-grabbed", "true"); // Update ARIA attribute when grabbed
  setTimeout(() => this.classList.add("dragging"), 0); // Delay to apply dragging effect
}

function handleDragOver(e) {
  e.preventDefault();
  const afterElement = getDragAfterElement(chordGroup, e.clientX);
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

function handleDrop() {
  this.classList.remove("dragging");
}

function handleDragEnd() {
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
// CALCULATE RESULTANT CHORDS
// =============================================================================

function calculateResultingChords(inputChords) {
  const chords = CHORD_LISTS.all;
  const autoharpChords = CHORD_LISTS.autoharp12;

  let autoharpIntervals = [];
  let intervals = [];

  // Find the input chords' relationship to one another.
  // Transpose that relationship by finding other chords in the autoharpChords list
  // that have the same relationship.
  console.log("Input Chords: \n" + inputChords);

  for (let i in autoharpChords) {
    autoharpIntervals.push(chords.indexOf(autoharpChords[i]));
  }
  console.log("\n Available Autoharp Chords Index: \n" + autoharpIntervals);

  // Available Autoharp Chords Index: 0,1,2,3,5,6,7,8,10,11
  for (let i in inputChords) {
    intervals.push(chords.indexOf(inputChords[i]));
    console.log(intervals);
  }

  // Subtract smallest chord number from all elements, to find lowest common denominator of intervals.
  intervals = intervals.map(element => element - intervals[0]);
  let matches = [];

  console.log("\nInput Chord Intervals: \n" + intervals);

  for (i = 0; Math.max(...intervals) < 12; i++) {
    // Try looking for all 3 items in the autoharp set; try again, going up by a half note, until the largest interval is 12.

    // Use .filter() to find and save a match if the interval exists in autoharpintervals.
    foundIntervals = intervals.filter((e) => autoharpIntervals.includes(e));

    // If all intervals are present, save this set as a match.
    if (foundIntervals.length == intervals.length) {
      matches.push(foundIntervals);
    }
    intervals = intervals.map(element => element + 1);
  }

  // Convert the index numbers in matches to the actual chord names.
  let chordMatches = matches.map(match => match.map(index => chords[index]));

  // Print each chord grouping, no matter how many matches there are.
  for (const match of matches) {
    console.log(match.map(index => chords[index]));
  }
  return chordMatches;
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

  resultingChords.forEach((chordSet, i) => {
    const div = document.createElement('div');
    div.className = 'chordGroup';
    chordSet.forEach((chord, j) => {
      const chordDiv = document.createElement('div');
      chordDiv.className = 'chord';
      chordDiv.setAttribute('role', 'listitem');
      chordDiv.setAttribute('aria-grabbed', 'false');
      chordDiv.innerHTML = `<span>${chord}</span>`;

      // Do NOT set draggable attribute for resulting chords
      div.appendChild(chordDiv);
    });
    // Do NOT set draggable attribute for resulting chords
    chordGroupResults.appendChild(div);
  });
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
// TODO: Render chord degrees as chips. Use capital or lowercase for major minor. ex. I vi ii V I
// TODO: Support "7" chords. 
// TODO: Add chord synonym suggestions. 
// TODO: Add degrees indicators by each chord group. 
// TODO: Add save functionality that allows users to save chords.
// TODO: Add Custom Chords text input to allow users to paste in a list of chords.
// TODO: Add Custom Chords highlighted buttons that allows user to toggle chords on/off of availability. 
