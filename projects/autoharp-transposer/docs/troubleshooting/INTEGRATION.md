# Integration Troubleshooting Guide

## 🔧 **Common Integration Issues**

### **Duplicate Method Conflicts**
**Symptoms:** Method doesn't work as expected, silent failures
**Solution:**
```bash
# Check for duplicates
node detect-duplicates.js

# Look for specific method
grep -n "methodName" modules/*.js
```

### **Module Import/Export Issues**
**Symptoms:** "Module not found" or "undefined" errors
**Solution:**
- Verify file paths in import statements
- Check module export syntax
- Ensure modules are properly initialized

### **Event Handler Problems**
**Symptoms:** UI interactions don't trigger expected behavior
**Solution:**
- Check event listener registration
- Verify event handler binding
- Look for preventDefault/stopPropagation issues

## 🚨 **Agent-Specific Issues**

### **Agent 1 (Chord Logic)**
- **Parsing failures:** Check chord format validation
- **Transposition errors:** Verify music theory calculations
- **Compatibility issues:** Check autoharp type definitions

### **Agent 2 (Input/UI)**
- **Input validation:** Check real-time feedback systems
- **Suggestion problems:** Verify fuzzy matching logic
- **UI responsiveness:** Check event coordination

### **Agent 3 (State/Data)**
- **State sync issues:** Check event emission
- **Data persistence:** Verify storage operations
- **Schema validation:** Check data format compliance

### **Agent 4 (Audio/Visual)**
- **Audio playback:** Check Web Audio API initialization
- **Visual feedback:** Verify DOM element access
- **Performance:** Check for memory leaks

### **Agent 5 (Integration)**
- **Module initialization:** Check webapp.js setup
- **Legacy compatibility:** Verify bridge functions
- **Cross-module communication:** Check interface compliance

## 🔍 **Debugging Tools**

### **Console Debugging**
```javascript
// Add strategic debugging logs
console.log('[DEBUG] Method called with:', input);
console.log('[DEBUG] Processing result:', result);
```

### **Quality Assurance**
```bash
# Update knowledge graph
node codebase-mapper.js

# Check for duplicates
node detect-duplicates.js

# Update agent schema
node update-agent-schema.js
```

## 📋 **Evidence-Based Debugging Protocol**

1. **Gather Evidence** - User reproduction, exact errors
2. **Form Hypothesis** - Based on evidence, not assumptions
3. **Minimal Testing** - Simple diagnostic steps
4. **Incremental Fixing** - Smallest fix, immediate validation
5. **User Validation** - Confirm fix resolves actual issue
