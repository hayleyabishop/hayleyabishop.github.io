#!/usr/bin/env node

/**
 * Comprehensive Codebase Knowledge Graph Generator
 * Creates a mental map of all functions, methods, classes, and their relationships
 */

const fs = require('fs');
const path = require('path');

class CodebaseMapper {
  constructor(projectPath) {
    this.projectPath = projectPath;
    this.knowledgeGraph = {
      files: new Map(),
      classes: new Map(),
      functions: new Map(),
      methods: new Map(),
      eventHandlers: new Map(),
      dependencies: new Map(),
      callGraph: new Map(),
      modules: new Map()
    };
  }

  async generateMap() {
    console.log('🧠 Generating Codebase Knowledge Graph...\n');
    
    const jsFiles = this.findJavaScriptFiles(this.projectPath);
    console.log(`📁 Found ${jsFiles.length} JavaScript files`);
    
    // Phase 1: Parse all files and extract entities
    for (const file of jsFiles) {
      await this.analyzeFile(file);
    }
    
    // Phase 2: Build relationships and call graph
    this.buildRelationships();
    
    // Phase 3: Generate comprehensive report
    this.generateReport();
    
    // Phase 4: Export knowledge graph
    this.exportKnowledgeGraph();
  }

  findJavaScriptFiles(dir) {
    const files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        files.push(...this.findJavaScriptFiles(fullPath));
      } else if (entry.isFile() && entry.name.endsWith('.js')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  async analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const relativePath = path.relative(this.projectPath, filePath);
    
    const fileInfo = {
      path: relativePath,
      fullPath: filePath,
      classes: [],
      functions: [],
      methods: [],
      eventHandlers: [],
      imports: [],
      exports: [],
      dependencies: [],
      lineCount: lines.length
    };

    let currentClass = null;
    
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      const trimmedLine = line.trim();
      
      // Skip comments and empty lines
      if (trimmedLine.startsWith('//') || trimmedLine.startsWith('/*') || !trimmedLine) {
        return;
      }

      // Class definitions
      const classMatch = trimmedLine.match(/^class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
      if (classMatch) {
        currentClass = {
          name: classMatch[1],
          file: relativePath,
          line: lineNumber,
          methods: [],
          constructor: null
        };
        fileInfo.classes.push(currentClass);
        this.knowledgeGraph.classes.set(classMatch[1], currentClass);
      }

      // Constructor
      if (currentClass && trimmedLine.includes('constructor(')) {
        currentClass.constructor = { line: lineNumber, signature: trimmedLine };
      }

      // Method definitions (class methods)
      const methodMatch = trimmedLine.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)\s*\{/);
      if (methodMatch && currentClass) {
        const method = {
          name: methodMatch[1],
          class: currentClass.name,
          file: relativePath,
          line: lineNumber,
          signature: trimmedLine,
          calls: []
        };
        currentClass.methods.push(method);
        fileInfo.methods.push(method);
        this.knowledgeGraph.methods.set(`${currentClass.name}.${methodMatch[1]}`, method);
      }

      // Function definitions
      const functionMatch = trimmedLine.match(/^function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)/);
      if (functionMatch) {
        const func = {
          name: functionMatch[1],
          file: relativePath,
          line: lineNumber,
          signature: trimmedLine,
          calls: []
        };
        fileInfo.functions.push(func);
        this.knowledgeGraph.functions.set(functionMatch[1], func);
      }

      // Arrow functions and const/let/var assignments
      const arrowFunctionMatch = trimmedLine.match(/^(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:\([^)]*\)\s*=>|function)/);
      if (arrowFunctionMatch) {
        const func = {
          name: arrowFunctionMatch[1],
          file: relativePath,
          line: lineNumber,
          signature: trimmedLine,
          type: 'arrow/assigned',
          calls: []
        };
        fileInfo.functions.push(func);
        this.knowledgeGraph.functions.set(arrowFunctionMatch[1], func);
      }

      // Event handlers
      const eventHandlerMatch = trimmedLine.match(/addEventListener\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*([^,)]+)/);
      if (eventHandlerMatch) {
        const handler = {
          event: eventHandlerMatch[1],
          handler: eventHandlerMatch[2],
          file: relativePath,
          line: lineNumber,
          signature: trimmedLine
        };
        fileInfo.eventHandlers.push(handler);
        this.knowledgeGraph.eventHandlers.set(`${relativePath}:${lineNumber}`, handler);
      }

      // Imports/requires
      const importMatch = trimmedLine.match(/^(?:import|const|let|var).*(?:from\s+['"`]([^'"`]+)['"`]|require\s*\(\s*['"`]([^'"`]+)['"`]\))/);
      if (importMatch) {
        const dependency = importMatch[1] || importMatch[2];
        fileInfo.imports.push(dependency);
        fileInfo.dependencies.push(dependency);
      }

      // Function/method calls
      const callMatches = trimmedLine.match(/([a-zA-Z_$][a-zA-Z0-9_$]*(?:\.[a-zA-Z_$][a-zA-Z0-9_$]*)*)\s*\(/g);
      if (callMatches) {
        callMatches.forEach(call => {
          const funcName = call.replace('(', '');
          if (!this.knowledgeGraph.callGraph.has(relativePath)) {
            this.knowledgeGraph.callGraph.set(relativePath, []);
          }
          this.knowledgeGraph.callGraph.get(relativePath).push({
            caller: relativePath,
            callee: funcName,
            line: lineNumber
          });
        });
      }
    });

    this.knowledgeGraph.files.set(relativePath, fileInfo);
  }

  buildRelationships() {
    console.log('\n🔗 Building relationships...');
    
    // Build module relationships
    for (const [filePath, fileInfo] of this.knowledgeGraph.files.entries()) {
      const moduleName = path.basename(filePath, '.js');
      this.knowledgeGraph.modules.set(moduleName, {
        file: filePath,
        exports: fileInfo.exports,
        dependencies: fileInfo.dependencies,
        provides: [
          ...fileInfo.classes.map(c => c.name),
          ...fileInfo.functions.map(f => f.name)
        ]
      });
    }
  }

  generateReport() {
    // Build report as string array to avoid console encoding issues
    const reportLines = [];
    
    reportLines.push('CODEBASE KNOWLEDGE GRAPH REPORT');
    reportLines.push('=====================================');
    reportLines.push('');

    // Summary statistics
    reportLines.push('SUMMARY STATISTICS:');
    reportLines.push(`   Files analyzed: ${this.knowledgeGraph.files.size}`);
    reportLines.push(`   Classes found: ${this.knowledgeGraph.classes.size}`);
    reportLines.push(`   Functions found: ${this.knowledgeGraph.functions.size}`);
    reportLines.push(`   Methods found: ${this.knowledgeGraph.methods.size}`);
    reportLines.push(`   Event handlers: ${this.knowledgeGraph.eventHandlers.size}`);
    reportLines.push('');

    // Classes and their methods
    if (this.knowledgeGraph.classes.size > 0) {
      reportLines.push('CLASSES AND METHODS:');
      for (const [className, classInfo] of this.knowledgeGraph.classes.entries()) {
        reportLines.push('');
        reportLines.push(`Class: ${className} (${classInfo.file}:${classInfo.line})`);
        if (classInfo.constructor) {
          reportLines.push(`   constructor (line ${classInfo.constructor.line})`);
        }
        classInfo.methods.forEach(method => {
          reportLines.push(`   ${method.name}() (line ${method.line})`);
        });
      }
      reportLines.push('');
    }

    // Standalone functions
    if (this.knowledgeGraph.functions.size > 0) {
      reportLines.push('STANDALONE FUNCTIONS:');
      for (const [funcName, funcInfo] of this.knowledgeGraph.functions.entries()) {
        const type = funcInfo.type ? ` [${funcInfo.type}]` : '';
        reportLines.push(`   ${funcName}()${type} (${funcInfo.file}:${funcInfo.line})`);
      }
      reportLines.push('');
    }

    // Event handlers
    if (this.knowledgeGraph.eventHandlers.size > 0) {
      reportLines.push('EVENT HANDLERS:');
      for (const [key, handler] of this.knowledgeGraph.eventHandlers.entries()) {
        reportLines.push(`   ${handler.event} -> ${handler.handler} (${handler.file}:${handler.line})`);
      }
      reportLines.push('');
    }

    // Module dependencies
    reportLines.push('MODULE DEPENDENCIES:');
    for (const [moduleName, moduleInfo] of this.knowledgeGraph.modules.entries()) {
      if (moduleInfo.dependencies.length > 0) {
        reportLines.push(`   ${moduleName} depends on:`);
        moduleInfo.dependencies.forEach(dep => {
          reportLines.push(`      <- ${dep}`);
        });
      }
    }
    
    // Write report to file
    this.writeReport(reportLines);
  }

  writeReport(reportLines) {
    const reportPath = path.join(this.projectPath, 'codebase-knowledge-report.txt');
    
    try {
      fs.writeFileSync(reportPath, reportLines.join('\n'), 'utf8');
      console.log('Knowledge graph analysis completed. Check codebase-knowledge-report.txt for results.');
    } catch (error) {
      console.error('Error writing report file:', error.message);
      // Fallback to console output if file write fails
      reportLines.forEach(line => {
        console.log(line);
      });
    }
  }

  exportKnowledgeGraph() {
    const exportData = {
      generated: new Date().toISOString(),
      project: path.basename(this.projectPath),
      statistics: {
        files: this.knowledgeGraph.files.size,
        classes: this.knowledgeGraph.classes.size,
        functions: this.knowledgeGraph.functions.size,
        methods: this.knowledgeGraph.methods.size,
        eventHandlers: this.knowledgeGraph.eventHandlers.size
      },
      graph: {
        files: Object.fromEntries(this.knowledgeGraph.files),
        classes: Object.fromEntries(this.knowledgeGraph.classes),
        functions: Object.fromEntries(this.knowledgeGraph.functions),
        methods: Object.fromEntries(this.knowledgeGraph.methods),
        eventHandlers: Object.fromEntries(this.knowledgeGraph.eventHandlers),
        modules: Object.fromEntries(this.knowledgeGraph.modules),
        callGraph: Object.fromEntries(this.knowledgeGraph.callGraph)
      }
    };

    const outputPath = path.join(this.projectPath, 'codebase-knowledge-graph.json');
    fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));
    
    console.log(`\n💾 Knowledge graph exported to: ${path.basename(outputPath)}`);
    console.log('   This file can be used for:');
    console.log('   - Quick function/method lookups');
    console.log('   - Dependency analysis');
    console.log('   - Code navigation');
    console.log('   - Architecture documentation');
  }
}

// Run the mapper
if (require.main === module) {
  const projectPath = process.argv[2] || __dirname;
  const mapper = new CodebaseMapper(projectPath);
  mapper.generateMap().catch(console.error);
}

module.exports = CodebaseMapper;
