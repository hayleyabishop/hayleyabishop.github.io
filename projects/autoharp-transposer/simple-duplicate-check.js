#!/usr/bin/env node

/**
 * Simple, Reliable Duplicate Method Checker
 * Focuses on finding actual duplicate method definitions
 */

const fs = require('fs');
const path = require('path');

function findJavaScriptFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      files.push(...findJavaScriptFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function extractMethods(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const relativePath = path.relative(process.cwd(), filePath);
  const methods = [];

  // Patterns to match method definitions
  const patterns = [
    // Class methods: methodName() {
    { pattern: /^\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)\s*\{/, type: 'class method' },
    // Function declarations: function methodName() {
    { pattern: /^\s*function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)/, type: 'function' },
    // Arrow functions: const methodName = () => {
    { pattern: /^\s*(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:\([^)]*\)\s*=>|function)/, type: 'arrow/assigned function' }
  ];

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmedLine = line.trim();
    
    // Skip comments and empty lines
    if (trimmedLine.startsWith('//') || trimmedLine.startsWith('/*') || !trimmedLine) {
      return;
    }

    patterns.forEach(({ pattern, type }) => {
      const match = trimmedLine.match(pattern);
      if (match) {
        const methodName = match[1];
        
        // Skip common keywords
        if (['if', 'for', 'while', 'switch', 'try', 'catch', 'return', 'var', 'let', 'const'].includes(methodName)) {
          return;
        }
        
        methods.push({
          name: methodName,
          file: relativePath,
          line: lineNumber,
          signature: trimmedLine,
          type: type
        });
      }
    });
  });

  return methods;
}

function checkForDuplicates() {
  console.log('🔍 Simple Duplicate Method Checker');
  console.log('==================================\n');

  const projectPath = process.argv[2] || process.cwd();
  const jsFiles = findJavaScriptFiles(projectPath);
  
  console.log(`Scanning ${jsFiles.length} JavaScript files...\n`);

  // Collect all methods
  const allMethods = [];
  jsFiles.forEach(file => {
    const methods = extractMethods(file);
    allMethods.push(...methods);
  });

  // Group methods by name
  const methodGroups = {};
  allMethods.forEach(method => {
    if (!methodGroups[method.name]) {
      methodGroups[method.name] = [];
    }
    methodGroups[method.name].push(method);
  });

  // Find duplicates
  const duplicates = [];
  const sameFileDuplicates = [];
  
  Object.entries(methodGroups).forEach(([methodName, methods]) => {
    if (methods.length > 1) {
      // Check for same-file duplicates (critical)
      const fileGroups = {};
      methods.forEach(method => {
        if (!fileGroups[method.file]) {
          fileGroups[method.file] = [];
        }
        fileGroups[method.file].push(method);
      });

      Object.entries(fileGroups).forEach(([file, fileMethods]) => {
        if (fileMethods.length > 1) {
          sameFileDuplicates.push({
            methodName,
            file,
            methods: fileMethods
          });
        }
      });

      // All duplicates (cross-file)
      if (methods.length > 1) {
        duplicates.push({
          methodName,
          methods
        });
      }
    }
  });

  // Report results
  console.log('📊 RESULTS:');
  console.log(`Total methods found: ${allMethods.length}`);
  console.log(`Unique method names: ${Object.keys(methodGroups).length}`);
  console.log(`Methods with duplicates: ${duplicates.length}`);
  console.log(`Critical same-file duplicates: ${sameFileDuplicates.length}\n`);

  // Report critical duplicates (same file)
  if (sameFileDuplicates.length > 0) {
    console.log('🚨 CRITICAL: Same-file duplicates (JavaScript will use last definition):');
    sameFileDuplicates.forEach(dup => {
      console.log(`\n❌ Method "${dup.methodName}" in ${dup.file}:`);
      dup.methods.forEach(method => {
        console.log(`   Line ${method.line}: ${method.signature}`);
      });
    });
    console.log();
  }

  // Report cross-file duplicates
  const crossFileDuplicates = duplicates.filter(dup => {
    const files = new Set(dup.methods.map(m => m.file));
    return files.size > 1;
  });

  if (crossFileDuplicates.length > 0) {
    console.log('⚠️  Cross-file duplicates (may be intentional API wrappers):');
    crossFileDuplicates.forEach(dup => {
      console.log(`\n⚠️  Method "${dup.methodName}":`);
      dup.methods.forEach(method => {
        console.log(`   ${method.file}:${method.line} (${method.type})`);
      });
    });
    console.log();
  }

  // Summary
  if (sameFileDuplicates.length === 0 && crossFileDuplicates.length === 0) {
    console.log('✅ No problematic duplicates found!');
  } else if (sameFileDuplicates.length === 0) {
    console.log('✅ No critical same-file duplicates found!');
    console.log('ℹ️  Cross-file duplicates may be intentional (API wrappers, legacy functions)');
  } else {
    console.log('❌ Critical duplicates found - these need to be resolved!');
  }
}

// Run the checker
checkForDuplicates();
