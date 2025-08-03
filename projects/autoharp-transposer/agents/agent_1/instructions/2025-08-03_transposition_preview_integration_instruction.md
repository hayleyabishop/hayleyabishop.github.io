# Agent 1 (Chloe) - Transposition Preview Integration Task

## **From:** Director
## **Date:** 2025-08-03
## **Priority:** Medium
## **Dependencies:** Agent 5 must initialize modules first

## **Task Overview:**
Integrate Agent 4 (Avery)'s audio preview system with your chord transposition logic. Add audio preview functionality so users can hear both original and transposed chord progressions.

## **Specific Implementation Required:**

### **1. Transposition Preview Integration**
Add audio preview to your existing transposition methods:

```javascript
// Add this to your transposition methods in chordTransposition.js:
const transposed = chordParser.transposeProgression(original, fromKey, toKey);
audioManager.previewTransposition(original, transposed);
```

### **2. Integration Points to Modify:**
- **File:** `modules/chordTransposition.js` - Core transposition methods
- **File:** `modules/chordParser.js` - If transposition methods are here
- **Methods:** `transposeProgression()`, `transposeChord()`, or similar

### **3. Required Variables:**
- `audioManager` - Instance of ChordAudioManager (initialized by Agent 5)
- `original` - Original chord progression before transposition
- `transposed` - Resulting chord progression after transposition
- `fromKey` - Source key for transposition
- `toKey` - Target key for transposition

## **Implementation Steps:**

1. **Wait for Agent 5** to initialize the audioManager in webapp.js
2. **Identify transposition methods** in your chord logic modules
3. **Add audio preview calls** after successful transposition
4. **Test transposition operations** to ensure preview plays
5. **Verify preview accuracy** matches transposition results

## **Code Pattern to Follow:**

```javascript
// In chordTransposition.js or similar:
transposeProgression(progression, fromKey, toKey) {
  // Your existing transposition logic...
  const originalProgression = [...progression]; // Keep original
  const transposedProgression = this.performTransposition(progression, fromKey, toKey);
  
  // NEW: Add audio preview
  if (audioManager && audioManager.previewTransposition) {
    audioManager.previewTransposition(originalProgression, transposedProgression);
  }
  
  return transposedProgression;
}
```

## **Success Criteria:**
- ✅ Transposition operations trigger audio previews
- ✅ Users can hear both original and transposed progressions
- ✅ Preview audio matches actual transposition results
- ✅ No interference with existing transposition logic
- ✅ Integration works with your music theory features (circle of fifths, etc.)

## **Music Theory Integration:**
Ensure the audio preview system works with your existing music theory features:
- Circle of fifths transpositions
- Enharmonic equivalent handling
- Complex chord progressions

## **Coordination Notes:**
- **Agent 5 (Tessa)** will initialize the audioManager first
- **Agent 2 (Inigo)** will handle UI event binding
- **Agent 3 (Stacy)** will handle state management integration
- **Director** will coordinate testing and validation

## **Optional Enhancements:**
If time permits, consider adding:
- Preview controls (play original, play transposed, play both)
- Visual indicators during preview playback
- Integration with your existing chord compatibility checks

## **Timeline:**
- **Phase 1:** Wait for Agent 5 module initialization
- **Phase 2:** Wait for Agents 2 & 3 core integrations
- **Phase 3:** Implement transposition preview (your task)
- **Phase 4:** Integration testing and validation
