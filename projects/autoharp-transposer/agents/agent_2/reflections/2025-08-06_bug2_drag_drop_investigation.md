# Bug 2 Investigation Report: Drag-and-Drop Chord Reordering Not Working

## **Agent:** Inigo (Agent 2 - Input & UI Specialist)
## **Date:** 2025-08-06
## **Status:** Root Cause Identified - Ready for Fix

## **Evidence-Based Investigation Results**

### **✅ What Works:**
1. **`addDragListeners` function exists** - Properly implemented in `webapp.js` with comprehensive mouse and touch support
2. **Drag event handlers exist** - All necessary handlers (`handleDragStart`, `handleDragOver`, `handleDrop`, etc.) are implemented
3. **`chordGroup` variable is initialized** - Properly set to `document.getElementById("chordGroupInputs")`
4. **Legacy drag system works** - The old `appendChordLegacy()` method properly calls `addDragListeners()`

### **❌ Root Cause Identified:**
**CRITICAL BUG:** The new modular system creates chord elements that never get drag functionality added.

**Analysis:**
- **New System:** `EventCoordinator.createChordElement()` creates chord elements but never calls `addDragListeners()`
- **Legacy System:** `InputManager.appendChordLegacy()` creates chord elements AND calls `addDragListeners()`
- **Result:** New chord elements are not draggable because they lack drag event listeners

### **Evidence:**
```javascript
// NEW SYSTEM (EventCoordinator.createChordElement) - NO DRAG LISTENERS:
createChordElement(chord, index) {
  const element = document.createElement('div');
  element.className = 'chord';
  element.innerHTML = `...`;
  // ❌ Missing: No call to addDragListeners(element)
  return element;
}

// LEGACY SYSTEM (InputManager.appendChordLegacy) - HAS DRAG LISTENERS:
appendChordLegacy(chord) {
  // ... creates element ...
  newChord.setAttribute('draggable', 'true');
  // ✅ Calls drag listeners:
  if (typeof window.addDragListeners === 'function') {
    window.addDragListeners(newChord);
  }
}
```

### **Impact:**
- Users cannot reorder chords via drag-and-drop
- Chord elements appear but lack draggable functionality
- Workflow efficiency is compromised

## **Recommended Fix:**
Add drag listener initialization to the `createChordElement()` method:

```javascript
// In EventCoordinator.createChordElement() method:
createChordElement(chord, index) {
  const element = document.createElement('div');
  element.className = 'chord';
  element.setAttribute('draggable', 'true');  // Add this
  element.innerHTML = `...`;
  
  // Add drag functionality
  if (typeof window.addDragListeners === 'function') {
    window.addDragListeners(element);
  }
  
  // ... rest of method
  return element;
}
```

## **Testing Protocol:**
1. Apply the fix to add drag listeners
2. Add debugging console.log to verify drag listeners are added
3. Test drag-and-drop functionality manually
4. Verify chord reordering updates the underlying state
5. Update knowledge graph after fix

## **Next Steps:**
1. Implement the drag listener fix
2. Add debugging for verification
3. Test the drag-and-drop functionality
4. Report completion to Director
