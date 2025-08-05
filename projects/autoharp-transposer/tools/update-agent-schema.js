#!/usr/bin/env node

/**
 * Agent Schema Updater
 * Automatically updates AGENT_SCHEMA.md based on current agent metadata.json files
 * Usage: node update-agent-schema.js
 */

const fs = require('fs');
const path = require('path');

class AgentSchemaUpdater {
    constructor() {
        this.projectRoot = path.dirname(__dirname);
        this.agentsDir = path.join(this.projectRoot, 'agents');
        this.schemaFile = path.join(this.projectRoot, 'docs', 'AGENT_SCHEMA.md');
        this.agentOrder = ['agent_director', 'agent_1', 'agent_2', 'agent_3', 'agent_4', 'agent_5'];
    }

    /**
     * Read and parse agent metadata.json file
     */
    readAgentMetadata(agentId) {
        try {
            const metadataPath = path.join(this.agentsDir, agentId, 'metadata.json');
            if (!fs.existsSync(metadataPath)) {
                console.warn(`Warning: metadata.json not found for ${agentId}`);
                return null;
            }
            
            const rawData = fs.readFileSync(metadataPath, 'utf8');
            return JSON.parse(rawData);
        } catch (error) {
            console.error(`Error reading metadata for ${agentId}:`, error.message);
            return null;
        }
    }

    /**
     * Get all agent metadata
     */
    getAllAgentMetadata() {
        const agents = {};
        
        for (const agentId of this.agentOrder) {
            const metadata = this.readAgentMetadata(agentId);
            if (metadata) {
                agents[agentId] = metadata;
            }
        }
        
        return agents;
    }

    /**
     * Generate agent section for schema
     */
    generateAgentSection(agentId, metadata) {
        const statusEmoji = {
            'active': '🔄',
            'complete': '✅',
            'inactive': '⏸️'
        };

        return `### **${metadata.agent_name} (${metadata.name})**
- **Name:** ${metadata.name}
- **Agent ID:** ${agentId}
- **Role:** ${metadata.role}
- **Status:** ${statusEmoji[metadata.status] || '❓'} ${metadata.status.charAt(0).toUpperCase() + metadata.status.slice(1)}
- **Last Task:** ${metadata.last_task}
- **Last Updated:** ${metadata.last_updated}
- **Responsibilities:**
  ${this.getAgentResponsibilities(agentId)}`;
    }

    /**
     * Get agent responsibilities based on role
     */
    getAgentResponsibilities(agentId) {
        const responsibilities = {
            'agent_director': [
                'Coordinate multi-agent development workflow',
                'Maintain project overview and task assignment',
                'Ensure quality assurance protocols are followed',
                'Manage integration between agent outputs',
                'Update project plans and documentation'
            ],
            'agent_1': [
                'Chord parsing and validation logic',
                'Autoharp type definitions and compatibility',
                'Music theory integration (circle of fifths, enharmonic equivalents)',
                'Chord transposition algorithms',
                'Core business logic for chord operations'
            ],
            'agent_2': [
                'User input handling and validation',
                'UI/UX enhancements and responsiveness',
                'Event coordination and user interactions',
                'Input suggestion systems',
                'UI bug fixes and improvements'
            ],
            'agent_3': [
                'Application state management',
                'Data persistence and storage',
                'Data validation schemas',
                'Project save/load functionality',
                'State synchronization across modules'
            ],
            'agent_4': [
                'Audio playback and synthesis',
                'Visual feedback systems',
                'Chord highlighting and animations',
                'User feedback mechanisms',
                'Performance optimization for audio/visual features'
            ],
            'agent_5': [
                'Integration testing and validation',
                'Quality assurance tools maintenance',
                'Legacy system bridging',
                'Infrastructure debugging',
                'Production readiness coordination'
            ]
        };

        const agentResponsibilities = responsibilities[agentId] || ['Role-specific responsibilities'];
        return agentResponsibilities.map(resp => `  - ${resp}`).join('\n');
    }

    /**
     * Generate specialization matrix
     */
    generateSpecializationMatrix(agents) {
        let matrix = `| Agent | Core Focus | Dependencies | Status |\n`;
        matrix += `|-------|------------|--------------|--------|\n`;

        const dependencies = {
            'agent_director': 'All agents',
            'agent_1': 'None',
            'agent_2': 'Agent 1, 3',
            'agent_3': 'Agent 1',
            'agent_4': 'Agent 1, 3',
            'agent_5': 'All agents'
        };

        const coreFocus = {
            'agent_director': 'Coordination',
            'agent_1': 'Chord Logic',
            'agent_2': 'Input/UI',
            'agent_3': 'State/Data',
            'agent_4': 'Audio/Visual',
            'agent_5': 'Integration'
        };

        for (const [agentId, metadata] of Object.entries(agents)) {
            const statusEmoji = metadata.status === 'active' ? '🔄' : 
                              metadata.status === 'complete' ? '✅' : '⏸️';
            
            matrix += `| ${metadata.agent_name} (${metadata.name}) | ${coreFocus[agentId]} | ${dependencies[agentId]} | ${statusEmoji} ${metadata.status} |\n`;
        }

        return matrix;
    }

    /**
     * Generate the complete AGENT_SCHEMA.md content
     */
    generateSchemaContent(agents) {
        const timestamp = new Date().toISOString();
        
        let content = `# Autoharp Transposer Multi-Agent Schema

*Last Updated: ${timestamp}*

## 📋 **Complete Agent Structure**

`;

        // Generate agent sections
        for (const [agentId, metadata] of Object.entries(agents)) {
            content += this.generateAgentSection(agentId, metadata) + '\n\n';
        }

        content += `## 📁 **Folder Structure Schema**

\`\`\`
autoharp-transposer/
└── agents/
`;

        // Generate folder structure
        for (const agentId of this.agentOrder) {
            if (agents[agentId]) {
                content += `    ├── ${agentId}/
    │   ├── instructions/
    │   ├── outputs/
    │   ├── reflections/
    │   └── metadata.json
`;
            }
        }

        content += `\`\`\`

## 🔄 **Agent Workflow Protocol**

### **Task Assignment Process:**
1. **Director** receives user request
2. **Director** analyzes task and assigns to appropriate specialist agent
3. **Specialist Agent** logs instruction in \`instructions/\` folder
4. **Specialist Agent** implements solution and logs output in \`outputs/\` folder
5. **Specialist Agent** reflects on process and logs in \`reflections/\` folder
6. **Specialist Agent** updates \`metadata.json\` with status and timestamp
7. **Director** coordinates integration and validates results

### **File Naming Convention:**
- **Instructions:** \`YYYY-MM-DD_[task_description]_instruction.md\`
- **Outputs:** \`YYYY-MM-DD_[task_description]_output.md\`
- **Reflections:** \`YYYY-MM-DD_[task_description]_reflection.md\`

### **Metadata Format:**
\`\`\`json
{
  "name": "[Agent Name]",
  "agent_name": "Agent [ID]",
  "role": "[Specialist Role]",
  "status": "active|inactive|complete",
  "last_task": "[Description of last task]",
  "last_updated": "[ISO 8601 timestamp]"
}
\`\`\`

## 🎯 **Current Project Status**

### **Agent Status Summary:**
`;

        // Add status summary
        const statusCounts = { active: 0, complete: 0, inactive: 0 };
        for (const metadata of Object.values(agents)) {
            statusCounts[metadata.status] = (statusCounts[metadata.status] || 0) + 1;
        }

        content += `- 🔄 **Active Agents:** ${statusCounts.active}
- ✅ **Completed Agents:** ${statusCounts.complete}
- ⏸️ **Inactive Agents:** ${statusCounts.inactive}

## 📊 **Agent Specialization Matrix**

${this.generateSpecializationMatrix(agents)}

---

*This schema is automatically updated by \`tools/update-agent-schema.js\` when agent metadata changes.*`;

        return content;
    }

    /**
     * Update the AGENT_SCHEMA.md file
     */
    updateSchema() {
        try {
            console.log('🔄 Updating Agent Schema...');
            
            // Read all agent metadata
            const agents = this.getAllAgentMetadata();
            
            if (Object.keys(agents).length === 0) {
                console.error('❌ No agent metadata found!');
                return false;
            }

            // Generate new schema content
            const schemaContent = this.generateSchemaContent(agents);
            
            // Write to file
            fs.writeFileSync(this.schemaFile, schemaContent, 'utf8');
            
            console.log('✅ Agent Schema updated successfully!');
            console.log(`📊 Updated schema for ${Object.keys(agents).length} agents`);
            
            // Log agent statuses
            for (const [agentId, metadata] of Object.entries(agents)) {
                const statusEmoji = metadata.status === 'active' ? '🔄' : 
                                  metadata.status === 'complete' ? '✅' : '⏸️';
                console.log(`   ${statusEmoji} ${metadata.name} (${agentId}): ${metadata.status}`);
            }
            
            return true;
        } catch (error) {
            console.error('❌ Error updating schema:', error.message);
            return false;
        }
    }

    /**
     * Watch for metadata file changes (optional feature)
     */
    watchForChanges() {
        console.log('👀 Watching for agent metadata changes...');
        
        for (const agentId of this.agentOrder) {
            const metadataPath = path.join(this.agentsDir, agentId, 'metadata.json');
            
            if (fs.existsSync(metadataPath)) {
                fs.watchFile(metadataPath, (curr, prev) => {
                    console.log(`📝 Detected change in ${agentId}/metadata.json`);
                    this.updateSchema();
                });
            }
        }
    }
}

// Main execution
if (require.main === module) {
    const updater = new AgentSchemaUpdater();
    
    // Check command line arguments
    const args = process.argv.slice(2);
    
    if (args.includes('--watch')) {
        updater.updateSchema();
        updater.watchForChanges();
        console.log('Press Ctrl+C to stop watching...');
    } else {
        updater.updateSchema();
    }
}

module.exports = AgentSchemaUpdater;
