#!/usr/bin/env node

/**
 * Comprehensive Duplicate Method Detection Script
 * Scans JavaScript files for duplicate method definitions, similar method names, and potential conflicts
 */

const fs = require('fs');
const path = require('path');

class DuplicateDetector {
  constructor(projectPath) {
    this.projectPath = projectPath;
    this.methods = new Map(); // methodName -> [{ file, line, signature }]
    this.classes = new Map(); // className -> [{ file, methods }]
    this.duplicates = [];
    this.similarNames = [];
  }

  scanProject() {
    console.log('🔍 Scanning for duplicate methods...\n');
    
    const jsFiles = this.findJavaScriptFiles(this.projectPath);
    console.log(`Found ${jsFiles.length} JavaScript files to scan:`);
    jsFiles.forEach(file => console.log(`  - ${path.relative(this.projectPath, file)}`));
    console.log();

    jsFiles.forEach(file => this.scanFile(file));
    
    this.findDuplicates();
    this.findSimilarNames();
    this.generateReport();
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

  scanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const relativePath = path.relative(this.projectPath, filePath);
    
    // Patterns to match method definitions
    const patterns = [
      // Class methods: methodName() {
      /^\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)\s*\{/,
      // Function declarations: function methodName() {
      /^\s*function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)\s*\{/,
      // Arrow functions: const methodName = () => {
      /^\s*(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*\([^)]*\)\s*=>/,
      // Object methods: methodName: function() {
      /^\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*function\s*\([^)]*\)\s*\{/,
      // Object arrow methods: methodName: () => {
      /^\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*\([^)]*\)\s*=>/
    ];

    lines.forEach((line, index) => {
      patterns.forEach(pattern => {
        const match = line.match(pattern);
        if (match) {
          const methodName = match[1];
          const lineNumber = index + 1;
          const signature = line.trim();
          
          if (!this.methods.has(methodName)) {
            this.methods.set(methodName, []);
          }
          
          this.methods.get(methodName).push({
            file: relativePath,
            line: lineNumber,
            signature: signature
          });
        }
      });
    });
  }

  findDuplicates() {
    for (const [methodName, definitions] of this.methods.entries()) {
      if (definitions.length > 1) {
        // Check if duplicates are in the same file (more critical)
        const fileGroups = new Map();
        definitions.forEach(def => {
          if (!fileGroups.has(def.file)) {
            fileGroups.set(def.file, []);
          }
          fileGroups.get(def.file).push(def);
        });

        for (const [file, defs] of fileGroups.entries()) {
          if (defs.length > 1) {
            this.duplicates.push({
              methodName,
              type: 'CRITICAL - Same File',
              file,
              definitions: defs
            });
          }
        }

        // Also track cross-file duplicates
        if (fileGroups.size > 1) {
          this.duplicates.push({
            methodName,
            type: 'WARNING - Cross File',
            definitions
          });
        }
      }
    }
  }

  findSimilarNames() {
    const methodNames = Array.from(this.methods.keys());
    
    for (let i = 0; i < methodNames.length; i++) {
      for (let j = i + 1; j < methodNames.length; j++) {
        const name1 = methodNames[i];
        const name2 = methodNames[j];
        
        if (this.areSimilar(name1, name2)) {
          this.similarNames.push({
            name1,
            name2,
            definitions1: this.methods.get(name1),
            definitions2: this.methods.get(name2)
          });
        }
      }
    }
  }

  areSimilar(name1, name2) {
    // Check for common patterns that might indicate similar functionality
    const patterns = [
      // Same base with different suffixes
      (n1, n2) => n1.toLowerCase().includes(n2.toLowerCase()) || n2.toLowerCase().includes(n1.toLowerCase()),
      // Camel case variations
      (n1, n2) => n1.toLowerCase().replace(/[^a-z]/g, '') === n2.toLowerCase().replace(/[^a-z]/g, ''),
      // Common prefixes/suffixes
      (n1, n2) => {
        const prefixes = ['handle', 'on', 'get', 'set', 'update', 'create', 'remove', 'add'];
        const base1 = prefixes.reduce((acc, prefix) => acc.replace(new RegExp(`^${prefix}`, 'i'), ''), n1);
        const base2 = prefixes.reduce((acc, prefix) => acc.replace(new RegExp(`^${prefix}`, 'i'), ''), n2);
        return base1.toLowerCase() === base2.toLowerCase() && base1 !== n1 && base2 !== n2;
      }
    ];

    return patterns.some(pattern => pattern(name1, name2)) && name1 !== name2;
  }

  generateReport() {
    console.log('📊 DUPLICATE METHOD DETECTION REPORT');
    console.log('=====================================\n');

    // Critical duplicates (same file)
    const criticalDuplicates = this.duplicates.filter(d => d.type.includes('CRITICAL'));
    if (criticalDuplicates.length > 0) {
      console.log('🚨 CRITICAL: Duplicate methods in same file:');
      criticalDuplicates.forEach(dup => {
        console.log(`\n❌ Method: ${dup.methodName} (${dup.file})`);
        dup.definitions.forEach(def => {
          console.log(`   Line ${def.line}: ${def.signature}`);
        });
      });
      console.log();
    }

    // Cross-file duplicates
    const crossFileDuplicates = this.duplicates.filter(d => d.type.includes('Cross File'));
    if (crossFileDuplicates.length > 0) {
      console.log('⚠️  WARNING: Methods with same name across files:');
      crossFileDuplicates.forEach(dup => {
        console.log(`\n⚠️  Method: ${dup.methodName}`);
        dup.definitions.forEach(def => {
          console.log(`   ${def.file}:${def.line} - ${def.signature}`);
        });
      });
      console.log();
    }

    // Similar method names
    if (this.similarNames.length > 0) {
      console.log('🔍 SIMILAR: Methods with similar names (potential confusion):');
      this.similarNames.forEach(similar => {
        console.log(`\n🔍 Similar: "${similar.name1}" vs "${similar.name2}"`);
        console.log(`   ${similar.name1}:`);
        similar.definitions1.forEach(def => {
          console.log(`     ${def.file}:${def.line}`);
        });
        console.log(`   ${similar.name2}:`);
        similar.definitions2.forEach(def => {
          console.log(`     ${def.file}:${def.line}`);
        });
      });
      console.log();
    }

    // Summary
    console.log('📈 SUMMARY:');
    console.log(`   Total methods found: ${this.methods.size}`);
    console.log(`   Critical duplicates (same file): ${criticalDuplicates.length}`);
    console.log(`   Cross-file duplicates: ${crossFileDuplicates.length}`);
    console.log(`   Similar method names: ${this.similarNames.length}`);
    
    if (criticalDuplicates.length === 0 && crossFileDuplicates.length === 0) {
      console.log('\n✅ No duplicate methods found!');
    } else {
      console.log('\n❌ Issues found - review and resolve duplicates');
    }
  }
}

// Run the detector
if (require.main === module) {
  const projectPath = process.argv[2] || __dirname;
  const detector = new DuplicateDetector(projectPath);
  detector.scanProject();
}

module.exports = DuplicateDetector;
