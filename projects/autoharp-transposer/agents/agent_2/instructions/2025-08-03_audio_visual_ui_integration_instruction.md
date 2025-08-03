# Agent 2 (Inigo) - Audio/Visual UI Integration Task

## **From:** Director
## **Date:** 2025-08-03
## **Priority:** High
## **Dependencies:** Agent 5 must initialize modules first

## **Task Overview:**
Integrate Agent 4 (Avery)'s completed audio and visual feedback modules with the UI event system. Add audio playback and visual feedback to chord button interactions.

## **Specific Implementation Required:**

### **1. Chord Button Event Integration**
Add audio/visual feedback to existing chord button click handlers:

```javascript
// Add this to chord button event handlers in eventCoordinator.js or inputManager.js:
chordButton.addEventListener('click', () => {
  // Existing chord logic...
  
  // NEW: Add audio/visual feedback
  audioManager.playChord(chordName, currentAutoharpType);
  visualManager.showChordPlayback(chordName, currentAutoharpType);
});
```

### **2. Integration Points to Modify:**
- **File:** `modules/eventCoordinator.js` - Chord button click handlers
- **File:** `modules/inputManager.js` - Chord addition methods
- **Method:** `handleAddChordClick()` or similar chord interaction methods

### **3. Required Variables:**
- `audioManager` - Instance of ChordAudioManager (initialized by Agent 5)
- `visualManager` - Instance of VisualFeedbackManager (initialized by Agent 5)
- `chordName` - The chord being played (already available in your handlers)
- `currentAutoharpType` - Current autoharp selection (from state management)

## **Implementation Steps:**

1. **Wait for Agent 5** to initialize the audio/visual managers in webapp.js
2. **Identify chord button event handlers** in your existing code
3. **Add the audio/visual calls** to each relevant event handler
4. **Test chord button clicks** to ensure audio plays and visual feedback shows
5. **Verify no conflicts** with existing UI functionality

## **Success Criteria:**
- ✅ Clicking chord buttons plays audio
- ✅ Clicking chord buttons shows visual feedback
- ✅ No interference with existing chord addition logic
- ✅ Audio adapts to current autoharp type selection
- ✅ Visual feedback matches the chord being played

## **Coordination Notes:**
- **Agent 5 (Tessa)** will initialize the managers first
- **Agent 3 (Stacy)** will handle autoharp type change integration
- **Agent 1 (Chloe)** will add transposition preview integration
- **Director** will coordinate testing and validation

## **Questions/Issues:**
If you encounter any integration issues or need clarification on the audio/visual manager APIs, coordinate through the Director for resolution with Agent 4 (Avery).

## **Timeline:**
- **Phase 1:** Wait for Agent 5 module initialization
- **Phase 2:** Implement UI event binding (your task)
- **Phase 3:** Integration testing and validation
