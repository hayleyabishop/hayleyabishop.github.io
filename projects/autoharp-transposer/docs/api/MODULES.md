# Module API Reference

## 🔌 **Core Modules**

### **ChordParser (`modules/chordParser.js`)**
```javascript
// Main parsing methods
parseChord(chordString)           // Parse and validate chord input
normalizeChordInput(input)        // Normalize chord string format
getSuggestions(input)            // Get chord suggestions for input
validateChord(chord)             // Validate chord structure

// Integration methods
getCompatibleChords(autoharpType) // Get chords compatible with harp
getFuzzyMatches(input)           // Fuzzy matching for suggestions
```

### **ChordTransposition (`modules/chordTransposition.js`)**
```javascript
// Transposition methods
transposeChord(chord, semitones)     // Transpose single chord
transposeProgression(progression, fromKey, toKey) // Transpose progression
getEnharmonicEquivalent(note)        // Get enharmonic equivalent
getCircleOfFifthsDistance(key1, key2) // Calculate key distance
```

### **AutoharpTypes (`modules/autoharpTypes.js`)**
```javascript
// Autoharp management
getAutoharpTypes()               // Get all available autoharp types
getChordLayout(type)            // Get chord button layout
isChordCompatible(chord, type)  // Check chord compatibility
getIntervalMappings(type)       // Get interval mappings for type
```

### **StateManager (`modules/stateManager.js`)**
```javascript
// State management
getCurrentState()                // Get current application state
updateState(newState)           // Update application state
onStateChanged(callback)        // Listen for state changes
resetState()                    // Reset to default state

// Integration methods
onAutoharpTypeChanged(callback) // Listen for autoharp type changes
```

### **ChordAudio (`modules/chordAudio.js`)**
```javascript
// Audio playback
playChord(chordName, autoharpType)    // Play single chord
previewTransposition(original, transposed) // Preview transposition
stopPlayback()                        // Stop current playback
setVolume(level)                     // Set playback volume
```

### **VisualFeedback (`modules/visualFeedback.js`)**
```javascript
// Visual feedback
showChordPlayback(chord, type)       // Show chord being played
highlightChordButton(chord)          // Highlight chord button
showProgressionIndicator(progression) // Show progression progress
clearVisualFeedback()               // Clear all visual feedback
```

## 📊 **Data Schemas**

### **Chord Object**
```javascript
{
  name: "C",           // Chord name
  root: "C",           // Root note
  quality: "major",    // Chord quality
  extensions: [],      // Extensions (7, 9, etc.)
  normalized: "C"      // Normalized form
}
```

### **Autoharp Type**
```javascript
{
  id: "oscar_schmidt_21",
  name: "Oscar Schmidt 21-Chord",
  chordCount: 21,
  chords: ["C", "F", "G", ...],
  layout: { /* button positions */ }
}
```

### **Application State**
```javascript
{
  selectedChords: [],      // Current chord selection
  currentAutoharpType: "", // Selected autoharp type
  inputText: "",          // Current input text
  suggestions: []         // Current suggestions
}
```
