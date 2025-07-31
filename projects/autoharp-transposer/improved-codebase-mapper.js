#!/usr/bin/env node

/**
 * Improved Codebase Knowledge Graph Generator
 * Robust implementation that works reliably and provides accurate analysis
 */

const fs = require('fs');
const path = require('path');

class ImprovedCodebaseMapper {
  constructor(projectPath) {
    this.projectPath = projectPath;
    this.results = {
      metadata: {
        generatedAt: new Date().toISOString(),
        projectPath: projectPath,
        totalFiles: 0,
        totalClasses: 0,
        totalMethods: 0,
        totalFunctions: 0
      },
      files: {},
      classes: {},
      functions: {},
      methods: {},
      methodIndex: {},
      duplicates: {}
    };
  }

  generateKnowledgeGraph() {
    try {
      console.log('🧠 Improved Codebase Knowledge Graph Generator');
      console.log('==============================================\n');
      
      const jsFiles = this.findJavaScriptFiles(this.projectPath);
      console.log(`Analyzing ${jsFiles.length} JavaScript files...\n`);
      
      jsFiles.forEach(file => {
        try {
          this.analyzeFile(file);
        } catch (error) {
          console.warn(`Warning: Could not analyze ${path.relative(this.projectPath, file)}: ${error.message}`);
        }
      });
      
      this.buildMethodIndex();
      this.findDuplicates();
      this.updateMetadata();
      this.saveResults();
      this.generateSummary();
      
    } catch (error) {
      console.error('Error during analysis:', error.message);
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

  analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const relativePath = path.relative(this.projectPath, filePath);
    
    const fileInfo = {
      path: relativePath,
      size: content.length,
      lines: lines.length,
      classes: [],
      functions: [],
      methods: []
    };
    
    this.extractClasses(lines, fileInfo);
    this.extractFunctions(lines, fileInfo);
    
    this.results.files[relativePath] = fileInfo;
  }

  extractClasses(lines, fileInfo) {
    let currentClass = null;
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      const lineNumber = index + 1;
      
      // Class declaration
      const classMatch = trimmed.match(/^class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
      if (classMatch) {
        currentClass = {
          name: classMatch[1],
          file: fileInfo.path,
          line: lineNumber,
          methods: []
        };
        
        fileInfo.classes.push(currentClass.name);
        this.results.classes[currentClass.name] = currentClass;
      }
      
      // Class methods
      if (currentClass) {
        const methodMatch = trimmed.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)\s*\{/);
        if (methodMatch && !trimmed.startsWith('constructor')) {
          const methodName = methodMatch[1];
          const methodInfo = {
            name: methodName,
            class: currentClass.name,
            file: fileInfo.path,
            line: lineNumber,
            signature: trimmed
          };
          
          currentClass.methods.push(methodName);
          fileInfo.methods.push(methodName);
          this.results.methods[`${currentClass.name}.${methodName}`] = methodInfo;
        }
      }
    });
  }

  extractFunctions(lines, fileInfo) {
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      const lineNumber = index + 1;
      
      // Function declarations
      const funcMatch = trimmed.match(/^function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/);
      if (funcMatch) {
        const funcName = funcMatch[1];
        const funcInfo = {
          name: funcName,
          file: fileInfo.path,
          line: lineNumber,
          signature: trimmed
        };
        
        fileInfo.functions.push(funcName);
        this.results.functions[funcName] = funcInfo;
      }
      
      // Arrow functions
      const arrowMatch = trimmed.match(/^(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:\([^)]*\)\s*=>|function)/);
      if (arrowMatch) {
        const funcName = arrowMatch[1];
        const funcInfo = {
          name: funcName,
          file: fileInfo.path,
          line: lineNumber,
          signature: trimmed
        };
        
        fileInfo.functions.push(funcName);
        this.results.functions[funcName] = funcInfo;
      }
    });
  }

  buildMethodIndex() {
    const allMethods = { ...this.results.functions, ...this.results.methods };
    
    Object.entries(allMethods).forEach(([key, methodInfo]) => {
      const methodName = methodInfo.name;
      
      if (!this.results.methodIndex[methodName]) {
        this.results.methodIndex[methodName] = [];
      }
      
      this.results.methodIndex[methodName].push({
        key: key,
        file: methodInfo.file,
        line: methodInfo.line,
        class: methodInfo.class || null
      });
    });
  }

  findDuplicates() {
    Object.entries(this.results.methodIndex).forEach(([methodName, locations]) => {
      if (locations.length > 1) {
        this.results.duplicates[methodName] = {
          count: locations.length,
          locations: locations
        };
      }
    });
  }

  updateMetadata() {
    const meta = this.results.metadata;
    meta.totalFiles = Object.keys(this.results.files).length;
    meta.totalClasses = Object.keys(this.results.classes).length;
    meta.totalMethods = Object.keys(this.results.methods).length;
    meta.totalFunctions = Object.keys(this.results.functions).length;
    meta.duplicatesFound = Object.keys(this.results.duplicates).length;
  }

  saveResults() {
    try {
      const outputPath = path.join(this.projectPath, 'improved-knowledge-graph.json');
      fs.writeFileSync(outputPath, JSON.stringify(this.results, null, 2));
      console.log(`📄 Knowledge graph saved to: ${path.relative(this.projectPath, outputPath)}`);
    } catch (error) {
      console.error('Failed to save knowledge graph:', error.message);
    }
  }

  generateSummary() {
    const meta = this.results.metadata;
    
    console.log('\n📊 ANALYSIS SUMMARY');
    console.log('===================');
    console.log(`📁 Files: ${meta.totalFiles}`);
    console.log(`🏗️  Classes: ${meta.totalClasses}`);
    console.log(`⚙️  Methods: ${meta.totalMethods}`);
    console.log(`🔧 Functions: ${meta.totalFunctions}`);
    console.log(`🔍 Duplicates: ${meta.duplicatesFound}`);
    
    if (meta.totalClasses > 0) {
      console.log('\n🏗️  CLASSES:');
      Object.values(this.results.classes).forEach(cls => {
        console.log(`   ${cls.name} (${cls.file}:${cls.line}) - ${cls.methods.length} methods`);
      });
    }
    
    if (meta.duplicatesFound > 0) {
      console.log('\n🚨 DUPLICATES FOUND:');
      Object.entries(this.results.duplicates).forEach(([methodName, info]) => {
        console.log(`   ${methodName} (${info.count} definitions):`);
        info.locations.forEach(loc => {
          console.log(`     ${loc.file}:${loc.line}${loc.class ? ` (${loc.class})` : ''}`);
        });
      });
    }
    
    console.log('\n✅ Analysis complete!');
  }
}

// Run the mapper
if (require.main === module) {
  const projectPath = process.argv[2] || __dirname;
  const mapper = new ImprovedCodebaseMapper(projectPath);
  mapper.generateKnowledgeGraph();
}

module.exports = ImprovedCodebaseMapper;
