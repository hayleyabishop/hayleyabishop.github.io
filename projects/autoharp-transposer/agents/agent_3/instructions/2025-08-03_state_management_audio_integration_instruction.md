# Agent 3 (Stacy) - State Management Audio Integration Task

## **From:** Director
## **Date:** 2025-08-03
## **Priority:** High
## **Dependencies:** Agent 5 must initialize modules first

## **Task Overview:**
Integrate Agent 4 (Avery)'s audio system with your state management system. Expose autoharp type change events so the audio system can automatically adapt to different autoharp configurations.

## **Specific Implementation Required:**

### **1. Autoharp Type Change Event Exposure**
Add event emission when autoharp type changes in your state management:

```javascript
// Add this to stateManager.js in the autoharp type change method:
stateManager.onAutoharpTypeChanged((newType) => {
  // Audio system automatically adapts to new type
  audioManager.currentAutoharpType = newType;
});
```

### **2. Integration Points to Modify:**
- **File:** `modules/stateManager.js` - Autoharp type management methods
- **Method:** Where autoharp type selection is updated/changed
- **Event System:** Your existing event emission system

### **3. Required Implementation:**
- **Event Listener Registration:** `onAutoharpTypeChanged()` method
- **Event Emission:** Trigger when autoharp type changes
- **Audio Manager Access:** Reference to audioManager instance (from Agent 5)

## **Implementation Steps:**

1. **Wait for Agent 5** to initialize the audioManager in webapp.js
2. **Identify autoharp type change methods** in your stateManager.js
3. **Add event emission** when autoharp type changes
4. **Create event listener registration** method `onAutoharpTypeChanged()`
5. **Test autoharp type changes** to ensure audio system updates
6. **Verify integration** with your existing state management

## **Code Pattern to Follow:**

```javascript
// In stateManager.js - Add this method:
onAutoharpTypeChanged(callback) {
  this.addEventListener('autoharpTypeChanged', callback);
}

// In your existing autoharp type change method:
setAutoharpType(newType) {
  // Your existing logic...
  this.currentAutoharpType = newType;
  
  // NEW: Emit event for audio system
  this.emit('autoharpTypeChanged', newType);
}
```

## **Success Criteria:**
- ✅ Autoharp type changes trigger audio system updates
- ✅ Audio system receives correct autoharp type information
- ✅ No interference with existing state management
- ✅ Event system works reliably
- ✅ Integration with your existing event architecture

## **Coordination Notes:**
- **Agent 5 (Tessa)** will initialize the audioManager first
- **Agent 2 (Inigo)** will handle UI event binding
- **Agent 1 (Chloe)** will add transposition preview integration
- **Director** will coordinate testing and validation

## **Data Schema Considerations:**
Ensure the autoharp type data passed to the audio system matches your existing data schemas from `dataSchemas.js`.

## **Timeline:**
- **Phase 1:** Wait for Agent 5 module initialization
- **Phase 2:** Implement state management integration (your task)
- **Phase 3:** Integration testing and validation
