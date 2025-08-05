# File Organization Plan

## 🎯 **Current State Analysis**

### **Root Folder Issues:**
- **9 markdown files** scattered in root directory
- **4 JavaScript tools** mixed with main application files
- **6 analysis/debug files** cluttering the root
- **Inconsistent organization** makes navigation difficult

### **Well-Organized Areas:**
- ✅ `modules/` - Core application modules properly organized
- ✅ `tests/` - All test files in dedicated subfolder
- ✅ `agents/` - Agent system properly structured
- ✅ `docs/` - Documentation framework established

## 📁 **Recommended File Moves**

### **1. Move Development Tools to `/tools/`**
```
tools/
├── codebase-mapper.js           # From root
├── detect-duplicates.js         # From root
├── update-agent-schema.js       # From root
├── simple-duplicate-check.js    # From root
└── improved-codebase-mapper.js  # From root
```

### **2. Move Project Rules to `/docs/development/`**
```
docs/development/
├── SETUP.md                     # Already exists
├── AGENT_RULES.md              # From root
├── DEBUGGING_RULES.md          # From root
├── CODING_STANDARDS.md         # Consolidate rules
└── FILE_ORGANIZATION.md        # This document
```

### **3. Move Analysis Files to `/docs/analysis/`**
```
docs/analysis/
├── chord-input-flow-analysis.md        # From root
├── duplicate-chord-trace.md            # From root
├── event-audit-discovery.md            # From root
├── event-audit-gap-analysis.md         # From root
├── event-audit-reflection.md           # From root
├── function-connection-audit.md        # From root
└── integration-validation.md           # Rename large file
```

### **4. Move Core Documentation to `/docs/`**
```
docs/
├── README.md                    # Already exists
├── AGENT_SCHEMA.md             # From root
├── MUSIC_THEORY.md             # Rename from root
├── PROJECT_STRATEGY.md         # Rename from root
└── SCHEMA_UPDATER_GUIDE.md     # Rename from root
```

## 🚀 **Implementation Steps**

### **Phase 1: Create New Folders**
```bash
mkdir tools
mkdir docs/analysis
```

### **Phase 2: Move Tool Files**
```bash
move codebase-mapper.js tools/
move detect-duplicates.js tools/
move update-agent-schema.js tools/
move simple-duplicate-check.js tools/
move improved-codebase-mapper.js tools/
```

### **Phase 3: Move Documentation**
```bash
move AGENT_RULES.md docs/development/
move DEBUGGING_RULES.md docs/development/
move AGENT_SCHEMA.md docs/
move MUSIC_THEORY_INTEGRATION.md docs/MUSIC_THEORY.md
move STRATEGY.md docs/PROJECT_STRATEGY.md
move SCHEMA_UPDATER_README.md docs/SCHEMA_UPDATER_GUIDE.md
```

### **Phase 4: Move Analysis Files**
```bash
move chord-input-flow-analysis.md docs/analysis/
move duplicate-chord-trace.md docs/analysis/
move event-audit-*.md docs/analysis/
move function-connection-audit.md docs/analysis/
move "Autoharp Transposer Integration and Validation.md" docs/analysis/integration-validation.md
```

## 📋 **Benefits of Organization**

### **Cleaner Root Directory:**
- Only essential files (webapp.html, webapp.js, webapp.css)
- Clear project structure for new developers
- Easier navigation and file discovery

### **Logical Grouping:**
- **Tools** separated from application code
- **Documentation** properly categorized
- **Analysis files** archived but accessible

### **Better Maintenance:**
- Easier to find and update related files
- Consistent organization patterns
- Scalable structure for future growth

## 🔧 **Update Required Files**

After moving files, update references in:
- **HTML files** - Script src paths
- **Documentation** - Internal links
- **Tool scripts** - Relative path references
- **README files** - File location references

## ✅ **Final Structure Preview**

```
autoharp-transposer/
├── webapp.html, webapp.js, webapp.css    # Main app files
├── modules/                               # Core modules
├── tests/                                 # Test suites
├── agents/                                # Agent system
├── tools/                                 # Development tools
├── docs/                                  # All documentation
│   ├── analysis/                          # Analysis and debug files
│   ├── development/                       # Dev guides and rules
│   └── [other doc categories]
├── icons/, images/                        # Assets
└── [generated files]                      # Reports, configs
```

This organization provides clear separation of concerns and makes the project much more maintainable.
