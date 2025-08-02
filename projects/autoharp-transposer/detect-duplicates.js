#!/usr/bin/env node

/**
 * Robust Duplicate Method Detection Script
 * Fixed implementation that actually works and provides accurate results
 */

const fs = require('fs');
const path = require('path');

class RobustDuplicateDetector {
  constructor(projectPath) {
    this.projectPath = projectPath;
    this.methodDefinitions = new Map(); // methodName -> array of definitions
    this.results = {
      totalMethods: 0,
      uniqueMethodNames: 0,
      criticalDuplicates: [],
      crossFileDuplicates: [],
      similarNames: []
    };
  }

  scanProject() {
    try {
      console.log('🔍 Robust Duplicate Method Detection');
      console.log('====================================\n');
      
      const jsFiles = this.findJavaScriptFiles(this.projectPath);
      console.log(`Scanning ${jsFiles.length} JavaScript files...\n`);
      
      // Process each file
      jsFiles.forEach(file => {
        try {
          this.scanFile(file);
        } catch (error) {
          console.warn(`Warning: Could not scan ${file}: ${error.message}`);
        }
      });
      
      this.analyzeResults();
      this.generateReport();
      
    } catch (error) {
      console.error('Error during duplicate detection:', error.message);
      process.exit(1);
    }
  }

  findJavaScriptFiles(dir) {
    const files = [];
    
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          // Skip node_modules and hidden directories
          if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
            files.push(...this.findJavaScriptFiles(fullPath));
          }
        } else if (entry.isFile() && entry.name.endsWith('.js')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not read directory ${dir}: ${error.message}`);
    }
    
    return files;
  }

  scanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const relativePath = path.relative(this.projectPath, filePath);
    
    // Robust patterns for method detection
    const methodPatterns = [
      {
        // Function declarations: function methodName()
        pattern: /^\s*function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/,
        type: 'function declaration'
      },
      {
        // Class methods: methodName() {
        pattern: /^\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)\s*\{/,
        type: 'class method'
      },
      {
        // Arrow function assignments: const methodName = () =>
        pattern: /^\s*(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:\([^)]*\)\s*=>|function)/,
        type: 'arrow/assigned function'
      },
      {
        // Object method definitions: methodName: function()
        pattern: /^\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*function\s*\(/,
        type: 'object method'
      }
    ];

    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      const trimmedLine = line.trim();
      
      // Skip comments and empty lines
      if (trimmedLine.startsWith('//') || 
          trimmedLine.startsWith('/*') || 
          trimmedLine.startsWith('*') ||
          !trimmedLine) {
        return;
      }

      methodPatterns.forEach(({ pattern, type }) => {
        const match = trimmedLine.match(pattern);
        if (match) {
          const methodName = match[1];
          
          // Skip common keywords and control structures
          const skipKeywords = [
            'if', 'for', 'while', 'switch', 'try', 'catch', 'return',
            'var', 'let', 'const', 'import', 'export', 'default',
            'class', 'extends', 'super', 'this', 'new', 'typeof'
          ];
          
          if (skipKeywords.includes(methodName)) {
            return;
          }
          
          // Store method definition
          if (!this.methodDefinitions.has(methodName)) {
            this.methodDefinitions.set(methodName, []);
          }
          
          this.methodDefinitions.get(methodName).push({
            name: methodName,
            file: relativePath,
            line: lineNumber,
            signature: trimmedLine,
            type: type
          });
          
          this.results.totalMethods++;
        }
      });
    });
  }

  analyzeResults() {
    this.results.uniqueMethodNames = this.methodDefinitions.size;
    
    // Find duplicates
    for (const [methodName, definitions] of this.methodDefinitions.entries()) {
      if (definitions.length > 1) {
        // Group by file to find same-file duplicates (critical)
        const fileGroups = new Map();
        definitions.forEach(def => {
          if (!fileGroups.has(def.file)) {
            fileGroups.set(def.file, []);
          }
          fileGroups.get(def.file).push(def);
        });

        // Check for critical same-file duplicates
        for (const [file, fileDefs] of fileGroups.entries()) {
          if (fileDefs.length > 1) {
            this.results.criticalDuplicates.push({
              methodName,
              file,
              definitions: fileDefs
            });
          }
        }

        // Check for cross-file duplicates
        if (fileGroups.size > 1) {
          this.results.crossFileDuplicates.push({
            methodName,
            definitions
          });
        }
      }
    }
    
    // Find similar method names
    this.findSimilarMethodNames();
  }

  findSimilarMethodNames() {
    const methodNames = Array.from(this.methodDefinitions.keys());
    
    for (let i = 0; i < methodNames.length; i++) {
      for (let j = i + 1; j < methodNames.length; j++) {
        const name1 = methodNames[i];
        const name2 = methodNames[j];
        
        if (this.areMethodNamesSimilar(name1, name2)) {
          this.results.similarNames.push({
            name1,
            name2,
            definitions1: this.methodDefinitions.get(name1),
            definitions2: this.methodDefinitions.get(name2)
          });
        }
      }
    }
  }

  areMethodNamesSimilar(name1, name2) {
    // Skip if names are identical
    if (name1 === name2) return false;
    
    // Check for common similarity patterns
    const lower1 = name1.toLowerCase();
    const lower2 = name2.toLowerCase();
    
    // One name contains the other
    if (lower1.includes(lower2) || lower2.includes(lower1)) {
      return true;
    }
    
    // Same base with different prefixes/suffixes
    const commonPrefixes = ['handle', 'on', 'get', 'set', 'update', 'create', 'remove', 'add', 'init', 'setup'];
    const commonSuffixes = ['legacy', 'new', 'old', 'temp', 'backup', 'v2', 'alt'];
    
    for (const prefix of commonPrefixes) {
      const base1 = lower1.replace(new RegExp(`^${prefix}`, 'i'), '');
      const base2 = lower2.replace(new RegExp(`^${prefix}`, 'i'), '');
      if (base1 === base2 && base1 !== lower1 && base2 !== lower2) {
        return true;
      }
    }
    
    for (const suffix of commonSuffixes) {
      const base1 = lower1.replace(new RegExp(`${suffix}$`, 'i'), '');
      const base2 = lower2.replace(new RegExp(`${suffix}$`, 'i'), '');
      if (base1 === base2 && base1 !== lower1 && base2 !== lower2) {
        return true;
      }
    }
    
    return false;
  }

  generateReport() {
    // Build report as string array to avoid console encoding issues
    const reportLines = [];
    
    reportLines.push('DUPLICATE DETECTION RESULTS');
    reportLines.push('===============================');
    reportLines.push('');

    // Statistics
    reportLines.push('STATISTICS:');
    reportLines.push(`   Total method definitions found: ${this.results.totalMethods}`);
    reportLines.push(`   Unique method names: ${this.results.uniqueMethodNames}`);
    reportLines.push(`   Critical same-file duplicates: ${this.results.criticalDuplicates.length}`);
    reportLines.push(`   Cross-file duplicates: ${this.results.crossFileDuplicates.length}`);
    reportLines.push(`   Similar method names: ${this.results.similarNames.length}`);
    reportLines.push('');

    // Critical duplicates (same file)
    if (this.results.criticalDuplicates.length > 0) {
      reportLines.push('CRITICAL: Same-file duplicates (JavaScript uses last definition):');
      this.results.criticalDuplicates.forEach(dup => {
        reportLines.push('');
        reportLines.push(`Method "${dup.methodName}" in ${dup.file}:`);
        dup.definitions.forEach(def => {
          reportLines.push(`   Line ${def.line}: ${def.signature}`);
        });
      });
      reportLines.push('');
    }

    // Cross-file duplicates
    if (this.results.crossFileDuplicates.length > 0) {
      reportLines.push('Cross-file duplicates (may be intentional API wrappers):');
      this.results.crossFileDuplicates.forEach(dup => {
        reportLines.push('');
        reportLines.push(`Method "${dup.methodName}":`);
        dup.definitions.forEach(def => {
          reportLines.push(`   ${def.file}:${def.line} (${def.type})`);
        });
      });
      reportLines.push('');
    }

    // Similar method names
    if (this.results.similarNames.length > 0) {
      reportLines.push('Similar method names (potential confusion):');
      this.results.similarNames.slice(0, 10).forEach(similar => { // Limit to first 10
        reportLines.push('');
        reportLines.push(`"${similar.name1}" vs "${similar.name2}"`);
        reportLines.push(`   ${similar.name1}: ${similar.definitions1[0].file}:${similar.definitions1[0].line}`);
        reportLines.push(`   ${similar.name2}: ${similar.definitions2[0].file}:${similar.definitions2[0].line}`);
      });
      if (this.results.similarNames.length > 10) {
        reportLines.push(`   ... and ${this.results.similarNames.length - 10} more similar pairs`);
      }
      reportLines.push('');
    }

    // Final assessment
    if (this.results.criticalDuplicates.length === 0) {
      reportLines.push('SUCCESS: No critical same-file duplicates found!');
      if (this.results.crossFileDuplicates.length === 0) {
        reportLines.push('SUCCESS: No cross-file duplicates found!');
        reportLines.push('');
        reportLines.push('Codebase is clean of duplicate method definitions!');
      } else {
        reportLines.push('INFO: Cross-file duplicates found, but these may be intentional (API wrappers, legacy functions)');
      }
    } else {
      reportLines.push('ERROR: Critical duplicates found that need immediate attention!');
      reportLines.push('JavaScript will silently use the last definition, causing unexpected behavior.');
    }

    // Output report safely
    this.outputReport(reportLines);
  }

  outputReport(reportLines) {
    // Write to file for reliable output (bypasses Windows console encoding issues)
    const reportPath = path.join(this.projectPath, 'duplicate-detection-report.txt');
    
    try {
      fs.writeFileSync(reportPath, reportLines.join('\n'), 'utf8');
      
      // Simple console message to avoid encoding issues
      console.log('Duplicate detection completed. Check duplicate-detection-report.txt for results.');
      
    } catch (error) {
      console.error('Error: Could not write report file:', error.message);
      // Fallback to basic console output if file write fails
      reportLines.forEach(line => {
        console.log(line);
      });
    }
  }

  // Export results for programmatic use
  getResults() {
    return this.results;
  }
}

// Run the detector
if (require.main === module) {
  const projectPath = process.argv[2] || __dirname;
  const detector = new RobustDuplicateDetector(projectPath);
  detector.scanProject();
}

module.exports = RobustDuplicateDetector;
