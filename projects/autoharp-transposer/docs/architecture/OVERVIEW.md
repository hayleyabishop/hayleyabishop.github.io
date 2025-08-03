# System Architecture Overview

## 🏗️ **High-Level Architecture**

The Autoharp Transposer is built using a modular, multi-agent architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface Layer                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   webapp.html   │  │   webapp.css    │  │  webapp.js   │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ appIntegration  │  │ integrationBridge│  │eventCoordinator│ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  chordParser    │  │chordTransposition│  │autoharpTypes │ │
│  │  inputManager   │  │  stateManager   │  │storageManager│ │
│  │  chordAudio     │  │visualFeedback   │  │dataSchemas   │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 **Core Components**

### **Input Processing Pipeline**
1. **User Input** → `inputManager.js`
2. **Validation** → `chordParser.js`
3. **State Update** → `stateManager.js`
4. **UI Feedback** → `eventCoordinator.js`

### **Chord Processing Engine**
1. **Parsing** → `chordParser.js`
2. **Transposition** → `chordTransposition.js`
3. **Compatibility** → `autoharpTypes.js`
4. **Audio/Visual** → `chordAudio.js` + `visualFeedback.js`

### **Data Management**
1. **Validation** → `dataSchemas.js`
2. **State** → `stateManager.js`
3. **Persistence** → `storageManager.js`

## 🔄 **Data Flow**

```
User Input → Input Manager → Chord Parser → State Manager
     ↓              ↓             ↓             ↓
Event Coordinator ← Audio/Visual ← Transposition ← Storage
```

## 🤖 **Multi-Agent Responsibilities**

- **Agent 1 (Chloe):** Chord logic and music theory
- **Agent 2 (Inigo):** Input handling and UI interactions
- **Agent 3 (Stacy):** State management and data persistence
- **Agent 4 (Avery):** Audio playback and visual feedback
- **Agent 5 (Tessa):** Integration testing and legacy bridging
- **Director:** Coordination and quality assurance
