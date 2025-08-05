# Agent Schema Updater - Usage Guide

## 🎯 **Purpose**
Automatically synchronizes `AGENT_SCHEMA.md` with the current status of all agent `metadata.json` files, ensuring the schema documentation always reflects the real-time state of the multi-agent system.

## 🚀 **Usage**

### **Basic Update (One-time)**
```bash
node update-agent-schema.js
```
- Reads all agent metadata.json files
- Updates AGENT_SCHEMA.md with current information
- Shows status summary of all agents

### **Watch Mode (Continuous)**
```bash
node update-agent-schema.js --watch
```
- Performs initial update
- Monitors all agent metadata.json files for changes
- Automatically updates schema when any metadata changes
- Press Ctrl+C to stop watching

## 📊 **What Gets Updated**

### **Agent Information:**
- Current status (active, complete, inactive)
- Last task description
- Last updated timestamp
- Role and responsibilities

### **Project Status:**
- Agent status summary counts
- Specialization matrix with dependencies
- Current project phase indicators

### **Automatic Features:**
- Timestamp of last schema update
- Status emojis (🔄 active, ✅ complete, ⏸️ inactive)
- Proper agent ordering and formatting
- Folder structure documentation

## 🔧 **Integration with Workflow**

### **When to Run:**
- After updating any agent's metadata.json
- Before major project reviews
- When agent statuses change
- As part of automated build processes

### **Recommended Usage:**
```bash
# Update agent metadata, then sync schema
echo '{"status": "complete", "last_task": "Integration testing"}' > agents/agent_5/metadata.json
node update-agent-schema.js
```

### **For Development:**
Use watch mode during active development:
```bash
node update-agent-schema.js --watch
```

## 📋 **Output Example**
```
🔄 Updating Agent Schema...
✅ Agent Schema updated successfully!
📊 Updated schema for 6 agents
   🔄 Director (agent_director): active
   ✅ Chloe (agent_1): complete
   🔄 Inigo (agent_2): active
   ✅ Stacy (agent_3): complete
   ✅ Avery (agent_4): complete
   🔄 Tessa (agent_5): active
```

## 🛠️ **Technical Details**

### **File Dependencies:**
- Reads: `agents/*/metadata.json`
- Updates: `AGENT_SCHEMA.md`
- Requires: Node.js filesystem access

### **Error Handling:**
- Warns about missing metadata files
- Continues processing other agents if one fails
- Provides detailed error messages

### **Features:**
- Maintains agent ordering consistency
- Preserves schema structure and formatting
- Adds automatic timestamps
- Generates dynamic status matrices

## 🔄 **Automation Integration**

### **Git Hooks (Optional):**
Add to `.git/hooks/pre-commit`:
```bash
#!/bin/bash
node update-agent-schema.js
git add AGENT_SCHEMA.md
```

### **CI/CD Integration:**
```yaml
# In GitHub Actions or similar
- name: Update Agent Schema
  run: node update-agent-schema.js
```

This tool ensures your agent documentation stays synchronized with the actual project state automatically.
