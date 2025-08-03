# Development Setup Guide

## 🚀 **Quick Start**

### **Prerequisites**
- Web browser (Chrome, Firefox, Safari, Edge)
- Text editor or IDE (VS Code recommended)
- Node.js (for development tools and testing)
- Basic knowledge of HTML, CSS, JavaScript

### **Project Structure**
```
autoharp-transposer/
├── webapp.html          # Main application interface
├── webapp.js            # Application entry point
├── webapp.css           # Application styles
├── modules/             # Core JavaScript modules
├── tests/               # Test suites
├── agents/              # Multi-agent development system
├── docs/                # Documentation
└── tools/               # Development utilities
```

## ⚙️ **Development Environment**

### **Local Development**
1. Clone or download the project
2. Open `webapp.html` in a web browser
3. Use browser developer tools for debugging
4. Edit files with your preferred editor

### **Testing**
```bash
# Run individual test suites
node tests/test-chord-logic-specialist.js
node tests/test-input-ui-specialist-fixes.js
node tests/test-state-data-specialist.js
node tests/test-audio-visual-feedback.js

# Update knowledge graph after changes
node codebase-mapper.js

# Update agent schema
node update-agent-schema.js
```

## 🔧 **Development Tools**

### **Quality Assurance**
- `detect-duplicates.js` - Find duplicate method definitions
- `codebase-mapper.js` - Generate knowledge graph
- `update-agent-schema.js` - Sync agent documentation

### **Multi-Agent System**
- Agent folders in `agents/` directory
- Instruction, output, and reflection logging
- Automated schema updates

## 📋 **Development Workflow**

### **Making Changes**
1. **Identify the responsible agent** for the change area
2. **Run pre-fix validation** (duplicate detection, debugging)
3. **Implement changes** following coding standards
4. **Update knowledge graph** after code changes
5. **Run relevant tests** to verify functionality
6. **Update documentation** as needed

### **Multi-Agent Coordination**
1. **Director** assigns tasks to specialist agents
2. **Specialist agents** implement solutions
3. **Integration testing** validates combined functionality
4. **Documentation updates** maintain current state

## 🎯 **Key Development Principles**

- **Modular architecture** with clear separation of concerns
- **Evidence-based debugging** with user validation
- **Comprehensive testing** for all major features
- **Documentation-first** approach for maintainability
- **Multi-agent coordination** for complex development tasks
