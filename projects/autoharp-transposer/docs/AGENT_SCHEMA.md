# Autoharp Transposer Multi-Agent Schema

*Last Updated: 2025-08-05T00:54:44.964Z*

## 📋 **Complete Agent Structure**

### **Agent Director (Director)**
- **Name:** Director
- **Agent ID:** agent_director
- **Role:** Project Coordinator & Integration Specialist
- **Status:** 🔄 Active
- **Last Task:** Coordinate Agent 4 (Avery) integration tasks across all specialist agents
- **Last Updated:** 2025-08-03T21:45:02Z
- **Responsibilities:**
    - Coordinate multi-agent development workflow
  - Maintain project overview and task assignment
  - Ensure quality assurance protocols are followed
  - Manage integration between agent outputs
  - Update project plans and documentation

### **Agent 1 (Chloe)**
- **Name:** Chloe
- **Agent ID:** agent_1
- **Role:** Chord Logic Specialist
- **Status:** ✅ Complete
- **Last Task:** Remove capo simulation and document music theory features
- **Last Updated:** 2025-08-03T20:54:00Z
- **Responsibilities:**
    - Chord parsing and validation logic
  - Autoharp type definitions and compatibility
  - Music theory integration (circle of fifths, enharmonic equivalents)
  - Chord transposition algorithms
  - Core business logic for chord operations

### **Agent 2 (Inigo)**
- **Name:** Inigo
- **Agent ID:** agent_2
- **Role:** Input & UI Specialist
- **Status:** 🔄 Active
- **Last Task:** Fix chord removal and click-and-drag UI bugs
- **Last Updated:** 2025-08-03T20:55:50Z
- **Responsibilities:**
    - User input handling and validation
  - UI/UX enhancements and responsiveness
  - Event coordination and user interactions
  - Input suggestion systems
  - UI bug fixes and improvements

### **Agent 3 (Stacy)**
- **Name:** Stacy
- **Agent ID:** agent_3
- **Role:** State & Data Specialist
- **Status:** ✅ Complete
- **Last Task:** Implement data schemas, enhance state and storage managers, and test
- **Last Updated:** 2025-08-03T20:55:50Z
- **Responsibilities:**
    - Application state management
  - Data persistence and storage
  - Data validation schemas
  - Project save/load functionality
  - State synchronization across modules

### **Agent 4 (Avery)**
- **Name:** Avery
- **Agent ID:** agent_4
- **Role:** Audio & Visual Feedback Specialist
- **Status:** ✅ Complete
- **Last Task:** Implement audio/visual feedback modules and comprehensive tests
- **Last Updated:** 2025-08-03T20:55:50Z
- **Responsibilities:**
    - Audio playback and synthesis
  - Visual feedback systems
  - Chord highlighting and animations
  - User feedback mechanisms
  - Performance optimization for audio/visual features

### **Agent 5 (Tessa)**
- **Name:** Tessa
- **Agent ID:** agent_5
- **Role:** Integration & Testing Specialist
- **Status:** 🔄 Active
- **Last Task:** Fix infrastructure tools and coordinate integration testing
- **Last Updated:** 2025-08-03T20:55:50Z
- **Responsibilities:**
    - Integration testing and validation
  - Quality assurance tools maintenance
  - Legacy system bridging
  - Infrastructure debugging
  - Production readiness coordination

## 📁 **Folder Structure Schema**

```
autoharp-transposer/
└── agents/
    ├── agent_director/
    │   ├── instructions/
    │   ├── outputs/
    │   ├── reflections/
    │   └── metadata.json
    ├── agent_1/
    │   ├── instructions/
    │   ├── outputs/
    │   ├── reflections/
    │   └── metadata.json
    ├── agent_2/
    │   ├── instructions/
    │   ├── outputs/
    │   ├── reflections/
    │   └── metadata.json
    ├── agent_3/
    │   ├── instructions/
    │   ├── outputs/
    │   ├── reflections/
    │   └── metadata.json
    ├── agent_4/
    │   ├── instructions/
    │   ├── outputs/
    │   ├── reflections/
    │   └── metadata.json
    ├── agent_5/
    │   ├── instructions/
    │   ├── outputs/
    │   ├── reflections/
    │   └── metadata.json
```

## 🔄 **Agent Workflow Protocol**

### **Task Assignment Process:**
1. **Director** receives user request
2. **Director** analyzes task and assigns to appropriate specialist agent
3. **Specialist Agent** logs instruction in `instructions/` folder
4. **Specialist Agent** implements solution and logs output in `outputs/` folder
5. **Specialist Agent** reflects on process and logs in `reflections/` folder
6. **Specialist Agent** updates `metadata.json` with status and timestamp
7. **Director** coordinates integration and validates results

### **File Naming Convention:**
- **Instructions:** `YYYY-MM-DD_[task_description]_instruction.md`
- **Outputs:** `YYYY-MM-DD_[task_description]_output.md`
- **Reflections:** `YYYY-MM-DD_[task_description]_reflection.md`

### **Metadata Format:**
```json
{
  "name": "[Agent Name]",
  "agent_name": "Agent [ID]",
  "role": "[Specialist Role]",
  "status": "active|inactive|complete",
  "last_task": "[Description of last task]",
  "last_updated": "[ISO 8601 timestamp]"
}
```

## 🎯 **Current Project Status**

### **Agent Status Summary:**
- 🔄 **Active Agents:** 3
- ✅ **Completed Agents:** 3
- ⏸️ **Inactive Agents:** 0

## 📊 **Agent Specialization Matrix**

| Agent | Core Focus | Dependencies | Status |
|-------|------------|--------------|--------|
| Agent Director (Director) | Coordination | All agents | 🔄 active |
| Agent 1 (Chloe) | Chord Logic | None | ✅ complete |
| Agent 2 (Inigo) | Input/UI | Agent 1, 3 | 🔄 active |
| Agent 3 (Stacy) | State/Data | Agent 1 | ✅ complete |
| Agent 4 (Avery) | Audio/Visual | Agent 1, 3 | ✅ complete |
| Agent 5 (Tessa) | Integration | All agents | 🔄 active |


---

*This schema is automatically updated by `tools/update-agent-schema.js` when agent metadata changes.*