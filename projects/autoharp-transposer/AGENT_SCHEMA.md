# Autoharp Transposer Multi-Agent Schema

## 📋 **Complete Agent Structure**

### **Agent Directory (Director)**
- **Name:** Director
- **Agent ID:** agent_director
- **Role:** Project Coordinator & Integration Specialist
- **Status:** Active
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
- **Status:** Complete
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
- **Status:** Active
- **Responsibilities:**
  - User input handling and validation
  - UI/UX enhancements and responsiveness
  - Event coordination and user interactions
  - Input suggestion systems
  - UI bug fixes (chord removal, drag-and-drop)

### **Agent 3 (Stacy)**
- **Name:** Stacy
- **Agent ID:** agent_3
- **Role:** State & Data Specialist
- **Status:** Complete
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
- **Status:** Complete
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
- **Status:** Active
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
    └── agent_5/
        ├── instructions/
        ├── outputs/
        ├── reflections/
        └── metadata.json
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

### **Completed Modules:**
- ✅ **Agent 1:** Chord logic, autoharp types, transposition engine
- ✅ **Agent 3:** Data schemas, state management, storage systems
- ✅ **Agent 4:** Audio playback, visual feedback, comprehensive testing

### **Active Work:**
- 🔄 **Agent 2:** UI bug fixes (chord removal, drag-and-drop)
- 🔄 **Agent 5:** Integration testing and legacy system bridging
- 🔄 **Director:** Multi-agent coordination and quality assurance

### **Next Phase:**
- Integration testing of all completed modules
- Final UI bug resolution
- Production readiness validation
- Comprehensive end-to-end testing

## 📊 **Agent Specialization Matrix**

| Agent | Core Focus | Dependencies | Status |
|-------|------------|--------------|---------|
| Director | Coordination | All agents | Active |
| Agent 1 (Chloe) | Chord Logic | None | Complete |
| Agent 2 (Inigo) | Input/UI | Agent 1, 3 | Active |
| Agent 3 (Stacy) | State/Data | Agent 1 | Complete |
| Agent 4 (Avery) | Audio/Visual | Agent 1, 3 | Complete |
| Agent 5 (Tessa) | Integration | All agents | Active |

This schema provides the complete organizational structure for efficient multi-agent development coordination on the autoharp transposer webapp project.
