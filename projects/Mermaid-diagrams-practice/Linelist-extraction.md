:::mermaid

---

config:
    theme: 'dark'
    themeVariables:
        darkMode: true
---

block
    subgraph Shared Folder files
        direction LR
        A@{shape: doc, label: CAD Drawings} --> B
        B@{shape: extract, label: DAG Extraction} --> C
        C@{shape: disk, label: "[Shared-Folder]/LineNumbers.txt"} --> D
    end
    subgraph Access File
    direction LR
        D@{shape: extract, label: "Pull 
        LineNumbers 
        into Access File,
        UST.accdb"} --> E
        E@{shape: }
    end
    
:::
::: mermaid

flowchart RL

    subgraph Main Process

        A@{ shape: manual-file, label: "File Input"}

        B5[User Input]@{ shape: manual-input}

        C5[Multiple Documents]@{ shape: docs}

        D5[Process Automation]@{ shape: procs}

        E5[Paper Records]@{ shape: paper-tape}

    end

subgraph Additional Process

    A2@{ shape: fork, label: “Parallel Processing”}

    B2@{ shape: hourglass, label: “Timed Operation”}

    C2@{ shape: comment, label: “Note User Intervention Required” }

end
:::