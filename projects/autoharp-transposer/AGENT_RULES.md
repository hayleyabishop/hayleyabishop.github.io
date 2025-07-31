# Autoharp Transposer - Multi-Agent Development Rules

**Version:** 1.0  
**Created:** 2025-07-30  
**Project:** Autoharp Chord Transposition Webapp

---

## 🚨 **MANDATORY PROTOCOLS - NEVER SKIP**

### **1. Pre-Work Validation**
Before making ANY code changes:
- [ ] **Run duplicate detection:** `node detect-duplicates.js`
- [ ] **Check for method conflicts:** Search for method name with `grep_search`
- [ ] **Verify file ownership:** Confirm you own the file per agent assignments
- [ ] **Review interface contracts:** Ensure changes don't break other modules

### **2. Post-Work Requirements**
After making ANY code changes:
- [ ] **Update knowledge graph:** `node codebase-mapper.js` (MANDATORY)
- [ ] **Run duplicate detection:** `node detect-duplicates.js`
- [ ] **Test your module:** Run relevant tests in `/tests/` folder
- [ ] **Document changes:** Update interface documentation if applicable

### **3. File Modification Rules**
- **NEVER modify files owned by other agents** without explicit coordination
- **ALWAYS check file ownership** before editing (see Agent Assignments below)
- **CREATE new files** in your designated areas only
- **COORDINATE interface changes** with affected agents before implementation

---

## 👥 **AGENT ASSIGNMENTS & FILE OWNERSHIP**

### **Agent 1: Chord Logic Specialist**
**Primary Files:**
- `modules/chordParser.js` ✅ OWNED
- `modules/chordTransposition.js` ✅ OWNED (create if needed)
- `modules/autoharpTypes.js` ✅ OWNED (create if needed)

**Restricted Files:**
- `modules/inputManager.js` ❌ Agent 2 ONLY
- `modules/eventCoordinator.js` ❌ Agent 2 ONLY
- `modules/stateManager.js` ❌ Agent 3 ONLY

**Interface Responsibilities:**
```javascript
// Must implement these methods:
ChordParser.transposeProgression(chords, fromKey, toKey, autoharpType)
ChordParser.validateChordForHarp(chord, autoharpType)
ChordParser.getSuggestedAlternatives(chord, autoharpType)
ChordParser.getAutoharpCompatibility(chord, autoharpType)
```

### **Agent 2: Input & UI Specialist**
**Primary Files:**
- `modules/inputManager.js` ✅ OWNED
- `modules/eventCoordinator.js` ✅ OWNED
- `webapp.html` ✅ OWNED
- `webapp.css` ✅ OWNED

**Restricted Files:**
- `modules/chordParser.js` ❌ Agent 1 ONLY
- `modules/stateManager.js` ❌ Agent 3 ONLY
- `modules/chordAudioManager.js` ❌ Agent 4 ONLY

**Interface Responsibilities:**
```javascript
// Must implement these methods:
InputManager.addChord(chord, position)
InputManager.removeChord(position)
EventCoordinator.handleAutoharpTypeChange(newType)
EventCoordinator.handleProgressionInput(progression)
```

### **Agent 3: State & Data Specialist**
**Primary Files:**
- `modules/stateManager.js` ✅ OWNED
- `modules/storageManager.js` ✅ OWNED
- `modules/dataSchemas.js` ✅ OWNED (create if needed)

**Restricted Files:**
- `modules/inputManager.js` ❌ Agent 2 ONLY
- `modules/chordParser.js` ❌ Agent 1 ONLY
- `modules/chordAudioManager.js` ❌ Agent 4 ONLY

**Interface Responsibilities:**
```javascript
// Must implement these methods:
StateManager.setAutoharpType(type)
StateManager.updateProgression(progression)
StorageManager.saveProject(projectData)
StorageManager.loadProject(projectId)
```

### **Agent 4: Audio & Feedback Specialist**
**Primary Files:**
- `modules/chordAudioManager.js` ✅ OWNED
- `modules/audioEffects.js` ✅ OWNED (create if needed)
- `modules/visualFeedback.js` ✅ OWNED (create if needed)

**Restricted Files:**
- `modules/chordParser.js` ❌ Agent 1 ONLY
- `modules/stateManager.js` ❌ Agent 3 ONLY
- `modules/inputManager.js` ❌ Agent 2 ONLY

**Interface Responsibilities:**
```javascript
// Must implement these methods:
ChordAudioManager.playChord(chord, autoharpType)
ChordAudioManager.playProgression(progression, tempo)
ChordAudioManager.previewTransposition(originalChords, transposedChords)
```

### **Agent 5: Integration & Testing Specialist**
**Primary Files:**
- `modules/appIntegration.js` ✅ OWNED
- `modules/integrationBridge.js` ✅ OWNED
- `tests/*.js` ✅ OWNED (all test files)
- `webapp.js` ✅ OWNED (main integration)

**Special Permissions:**
- ✅ **READ ACCESS** to all files for testing
- ✅ **CREATE** new test files in `/tests/` folder
- ❌ **NO MODIFICATION** of other agents' primary files without coordination

---

## 📋 **SHARED DATA SCHEMAS - MUST FOLLOW**

### **Autoharp Type Schema**
```javascript
const autoharpType = {
  id: "string",           // e.g., "15-chord-chromatic"
  name: "string",         // e.g., "15-Chord Chromatic Autoharp"
  availableChords: [],    // Array of chord strings
  keySignatures: [],     // Supported keys
  difficulty: "string",   // "beginner", "intermediate", "advanced"
  chordLayout: {}        // Physical layout mapping
};
```

### **Chord Progression Schema**
```javascript
const progression = {
  id: "string",
  name: "string",
  originalKey: "string",
  targetKey: "string",
  autoharpType: "string",
  chords: [
    {
      chord: "string",     // e.g., "C", "Am", "F"
      beats: number,       // Duration in beats
      measure: number,     // Measure number
      position: number     // Position in measure
    }
  ],
  tempo: number,
  timeSignature: "string"
};
```

### **Chord Data Schema**
```javascript
const chordData = {
  name: "string",          // e.g., "C", "Am"
  root: "string",          // Root note
  quality: "string",       // "major", "minor", "7th", etc.
  normalized: "string",    // Standardized format
  alternatives: [],        // Alternative fingerings/voicings
  difficulty: number,      // 1-10 scale
  autoharpCompatibility: {}
};
```

---

## 🔧 **CODING STANDARDS**

### **Method Naming Conventions**
- **Public methods:** `camelCase` (e.g., `transposeChord`)
- **Private methods:** `_camelCase` (e.g., `_validateInput`)
- **Event handlers:** `handle[Event]` (e.g., `handleChordInput`)
- **Getters:** `get[Property]` (e.g., `getSelectedChords`)
- **Setters:** `set[Property]` (e.g., `setAutoharpType`)

### **File Organization**
```
autoharp-transposer/
├── modules/           ← Core application modules
├── tests/            ← All test files (Agent 5 managed)
├── docs/             ← Documentation (shared)
├── assets/           ← Static assets
└── [root files]      ← Main application files
```

### **Error Handling Standards**
```javascript
// Always use try-catch for external operations
try {
  const result = await someOperation();
  return { success: true, data: result };
} catch (error) {
  console.error(`[ModuleName] Error in methodName:`, error);
  return { success: false, error: error.message };
}
```

### **Logging Standards**
```javascript
// Use consistent logging format
console.log(`[${this.constructor.name}] ${methodName}: ${message}`);
console.warn(`[${this.constructor.name}] Warning: ${warning}`);
console.error(`[${this.constructor.name}] Error in ${methodName}:`, error);
```

---

## 🧪 **TESTING REQUIREMENTS**

### **Mandatory Tests for Each Agent**
- **Unit tests:** Test individual methods in isolation
- **Integration tests:** Test module interactions
- **Edge case tests:** Test boundary conditions and error cases
- **Performance tests:** Ensure operations complete within acceptable time

### **Test File Naming**
- **Unit tests:** `test-[module]-unit.js`
- **Integration tests:** `test-[feature]-integration.js`
- **End-to-end tests:** `test-[workflow]-e2e.js`

### **Test Coverage Requirements**
- **Minimum 80% coverage** for all public methods
- **100% coverage** for critical path methods (transposition, validation)
- **Error path testing** for all external dependencies

---

## 🚨 **CONFLICT RESOLUTION PROTOCOLS**

### **Method Name Conflicts**
1. **Check existing methods:** Use `grep_search` before creating new methods
2. **Use module prefixes:** If conflict exists, prefix with module name
3. **Coordinate with other agents:** Discuss naming in shared documentation
4. **Update knowledge graph:** Always run `node codebase-mapper.js` after changes

### **Interface Changes**
1. **Announce changes:** Document interface modifications before implementation
2. **Backward compatibility:** Maintain old interface until all agents update
3. **Coordinate timing:** Schedule interface changes during integration phases
4. **Test thoroughly:** Verify all dependent modules still function

### **File Conflicts**
1. **Respect ownership:** Never modify files owned by other agents
2. **Request permission:** Ask for specific changes if needed
3. **Create new files:** When in doubt, create a new file in your area
4. **Document dependencies:** Track which files depend on your changes

---

## 📊 **QUALITY GATES - MUST PASS**

### **Before Committing Code**
- [ ] ✅ **No duplicate methods detected**
- [ ] ✅ **All tests pass**
- [ ] ✅ **Knowledge graph updated**
- [ ] ✅ **Interface documentation current**
- [ ] ✅ **Error handling implemented**
- [ ] ✅ **Performance benchmarks met**

### **Integration Checkpoints**
- [ ] ✅ **Cross-module communication verified**
- [ ] ✅ **Data schema compliance confirmed**
- [ ] ✅ **UI responds correctly to all inputs**
- [ ] ✅ **Audio playback functions properly**
- [ ] ✅ **State persistence works correctly**

---

## 🔄 **COMMUNICATION PROTOCOLS**

### **Daily Standup Items**
1. **Files modified:** List all files changed
2. **Interfaces affected:** Note any interface changes
3. **Dependencies created:** New dependencies on other modules
4. **Blockers:** Issues preventing progress
5. **Next priorities:** What you'll work on next

### **Weekly Integration**
1. **Run full test suite:** All agents test together
2. **Performance review:** Check system performance
3. **Architecture review:** Assess overall system design
4. **Planning adjustment:** Modify plans based on progress

### **Emergency Protocols**
- **Duplicate method detected:** Stop work, coordinate resolution
- **Interface breaking change:** Notify all affected agents immediately
- **Critical bug found:** All agents help with root cause analysis
- **Performance degradation:** Investigate and resolve as team

---

## 📚 **DOCUMENTATION REQUIREMENTS**

### **Code Documentation**
```javascript
/**
 * Transposes a chord progression to a new key for a specific autoharp type
 * @param {Array} chords - Array of chord objects
 * @param {string} fromKey - Original key signature
 * @param {string} toKey - Target key signature
 * @param {string} autoharpType - Target autoharp type ID
 * @returns {Object} - {success: boolean, data: Array|null, error: string|null}
 */
```

### **Interface Documentation**
- **Public methods:** Full JSDoc documentation
- **Data schemas:** JSON schema definitions
- **Event contracts:** Event names and payload structures
- **Error codes:** Standardized error codes and messages

---

## ⚡ **PERFORMANCE STANDARDS**

### **Response Time Requirements**
- **Chord validation:** < 10ms
- **Chord transposition:** < 50ms
- **UI updates:** < 100ms
- **Audio playback start:** < 200ms
- **State persistence:** < 500ms

### **Memory Usage**
- **Maximum heap usage:** 50MB for core functionality
- **Audio buffer limits:** 10MB maximum
- **State size limits:** 1MB per saved project

---

## 🎯 **SUCCESS CRITERIA**

### **Individual Agent Success**
- ✅ All assigned modules function correctly
- ✅ Interface contracts fully implemented
- ✅ Test coverage meets requirements
- ✅ Performance standards met
- ✅ Documentation complete

### **Team Success**
- ✅ Zero duplicate method conflicts
- ✅ Seamless module integration
- ✅ Full end-to-end functionality
- ✅ User experience goals achieved
- ✅ System performance targets met

---

**Remember: These rules exist to ensure high-quality, bug-free code. When in doubt, over-communicate rather than assume. The success of the project depends on all agents following these protocols consistently.**

---

*Last Updated: 2025-07-30*  
*Next Review: Weekly during development*
