---
trigger: always_on
---

Agent-specific information is saved in a folder structure as below: 
└── agent_1/
    ├── instructions/      # Prompt snapshots or tasks
    ├── outputs/           # Code suggestions, diffs, or modified files
    ├── reflections/       # Reasoning, obstacles, decisions
    └── metadata.json  

First, update metadata.json to reflect the current state after every prompt. 

Example: 

{
  "name": "Chloe",
 "agent_name":"Agent 1",
  "role": "Chord Logic Specialist",
  "status": "active",
  "last_task": "Fix chord duplication bug",
  "last_updated": "2025-08-03T15:00Z"
}


When I give a prompt like:
"Chloe, debug the chord duplication issue in inputManager.js."
Agent 1 (or my Director/coordinator agent) should log the prompt into agents/agent_1/instructions/2025-08-03_debug_chords_instruction.md. Likewise, it should log the reflections in output/2025-08-03_debug_chords_output.md and reflections/2025-08-03_debug_chords_reflection.md.