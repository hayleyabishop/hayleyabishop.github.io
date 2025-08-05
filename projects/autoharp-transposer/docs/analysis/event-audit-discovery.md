# EVENT AUDIT DISCOVERY PHASE
## Comprehensive Mapping of Interactive Elements and Event Handlers

### PHASE 1: DISCOVERY - Interactive Elements Inventory

---

## HTML INTERACTIVE ELEMENTS (webapp.html)

### 1. RADIO BUTTONS - Autoharp Type Selection
**Location**: Lines 34, 39, 44, 49
**Elements**:
- `#type12Chord` - 12-Chord autoharp selection
- `#type15Chord` - 15-Chord autoharp selection  
- `#type21Chord` - 21-Chord autoharp selection
- `#typeCustomChords` - Custom chord selection

**Inline Event Handlers**: `onclick="onChordTypeChanged()"`
**Purpose**: Allow user to select which type of autoharp they have to determine available chords

### 2. TEXT INPUT - Chord Entry
**Location**: Line 99
**Element**: `#chordTextInput`
**Attributes**: `placeholder="Type chord name (e.g., Gm, F#7, Asus2)" autocomplete="off"`
**Purpose**: Allow user to type chord names with fuzzy matching and autocomplete

### 3. BUTTONS - Primary Actions
**Location**: Lines 100, 101, 108, 109
**Elements**:
- `#addChordBtn` - "Add" button next to text input
- `#soundToggle` - Sound toggle button (🔇 icon)
- `#clearAllChords` - "Clear All" utility button
- `#playAllChords` - "Play All" utility button

**Purpose**: 
- Add chord from text input
- Toggle sound on/off
- Clear all selected chords
- Play all selected chords

### 4. SUGGESTIONS CONTAINER
**Location**: Line 103
**Element**: `#chordSuggestions`
**Purpose**: Display autocomplete suggestions for chord input

### 5. MESSAGE CONTAINER
**Location**: Line 117
**Element**: `#app-message`
**Purpose**: Display user feedback messages

### 6. CHORD DISPLAY CONTAINERS
**Location**: Lines 123, 129-131
**Elements**:
- `#chordGroupInputs` - Selected chords display
- `#chordGroupResults` - Transposed chord progressions display

**Purpose**: Show user's selected chords and available transpositions

### 7. COMMENTED OUT ELEMENTS (Legacy UI)
**Location**: Lines 64-91
**Elements**: Multiple chord name and type buttons with inline onclick handlers
**Status**: Currently commented out, but handlers may still exist in JS
**Legacy Handlers**: `selectChordName()`, `selectChordType()`

---

## JAVASCRIPT EVENT LISTENERS

### EventCoordinator.js Event Listeners

#### 1. DOCUMENT READY
**Location**: Line 18
**Handler**: `document.addEventListener('DOMContentLoaded', () => this.initializeEventListeners())`
**Purpose**: Initialize all event listeners when DOM is ready

#### 2. RADIO BUTTON CHANGES
**Location**: Line 47
**Handler**: `radio.addEventListener('change', (e) => { ... })`
**Purpose**: Handle autoharp type selection changes

#### 3. GLOBAL CLICK HANDLER
**Location**: Line 57
**Handler**: `document.addEventListener('click', (e) => { ... })`
**Purpose**: Handle clicks on dynamically created elements (chord buttons, suggestions)

#### 4. TEXT INPUT EVENTS
**Location**: Lines 82, 87, 100, 104
**Handlers**:
- `textInput.addEventListener('input', (e) => { ... })` - Handle typing for suggestions
- `textInput.addEventListener('keydown', (e) => { ... })` - Handle Enter, Escape, Arrow keys
- `textInput.addEventListener('focus', () => { ... })` - Handle input focus
- `textInput.addEventListener('blur', () => { ... })` - Handle input blur

**Purpose**: Manage text input interactions, suggestions, and keyboard navigation

#### 5. SUGGESTIONS CLICK
**Location**: Line 112
**Handler**: `suggestionsContainer.addEventListener('click', (e) => { ... })`
**Purpose**: Handle clicks on suggestion items

#### 6. SOUND TOGGLE
**Location**: Line 123
**Handler**: `soundToggle.addEventListener('click', () => { ... })`
**Purpose**: Toggle sound on/off

#### 7. CLEAR ALL BUTTON
**Location**: Line 132
**Handler**: `clearAllBtn.addEventListener('click', () => { ... })`
**Purpose**: Clear all selected chords

#### 8. GLOBAL KEYBOARD HANDLER
**Location**: Line 139
**Handler**: `document.addEventListener('keydown', (e) => { ... })`
**Purpose**: Handle global keyboard shortcuts (focus input, sound toggle, etc.)

### webapp.js Event Listeners

#### 1. AUTOHARP TYPE CHANGE
**Location**: Line 84
**Handler**: `inputType.addEventListener("change", onAutoharpTypeChanged)`
**Purpose**: Handle autoharp type radio button changes

#### 2. CHORD ANIMATION
**Location**: Line 313
**Handler**: `newChord.addEventListener("animationend", () => { ... })`
**Purpose**: Clean up after chord addition animation

#### 3. DRAG AND DROP EVENTS
**Location**: Lines 336-339, 342-344
**Handlers**: Multiple drag/drop and touch event listeners
**Purpose**: Handle chord reordering via drag and drop

#### 4. DOCUMENT READY
**Location**: Line 634
**Handler**: `document.addEventListener('DOMContentLoaded', function () { ... })`
**Purpose**: Initialize app when DOM is ready

### AppIntegration.js Event Listeners

#### 1. WINDOW BEFOREUNLOAD
**Location**: Line 240
**Handler**: `window.addEventListener('beforeunload', () => { ... })`
**Purpose**: Save state before page unload

#### 2. DOCUMENT READY
**Location**: Line 419
**Handler**: `document.addEventListener('DOMContentLoaded', () => { ... })`
**Purpose**: Initialize app integration

---

## INLINE EVENT HANDLERS (HTML)

### 1. onChordTypeChanged()
**Usage**: 4 radio buttons (lines 34, 39, 44, 49)
**Purpose**: Handle autoharp type selection
**Expected Behavior**: Update available chords based on selected autoharp type

### 2. LEGACY HANDLERS (Commented Out)
**Handlers**: `selectChordName()`, `selectChordType()`
**Status**: HTML is commented out but functions may still exist
**Purpose**: Legacy chord selection interface

---

## MISSING ELEMENTS REQUIRING INVESTIGATION

### 1. Add Chord Button Handler
**Element**: `#addChordBtn`
**Issue**: No explicit event listener found in discovery
**Expected**: Should add chord from text input when clicked

### 2. Play All Button Handler
**Element**: `#playAllChords`
**Issue**: No explicit event listener found in discovery
**Expected**: Should play all selected chords

### 3. Legacy Function Connections
**Functions**: `onChordTypeChanged()`, `selectChordName()`, `selectChordType()`
**Issue**: Need to verify these functions exist and work correctly

---

## NEXT PHASE: GAP ANALYSIS

The following items need detailed investigation in Phase 2:

1. **Missing Event Listeners**: Verify all buttons have working handlers
2. **Function Existence**: Confirm all referenced functions exist
3. **Comment Accuracy**: Check if element purposes match actual behavior
4. **Handler Completeness**: Verify handlers implement full intended functionality
5. **Legacy Code Status**: Determine if commented HTML has working JS counterparts

---

*Generated by Event Audit Discovery Phase - Step 1 of 5*
