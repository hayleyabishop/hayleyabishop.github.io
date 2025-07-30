// =============================================================================
// TEST SUITE FOR ENHANCED FUZZY CHORD MATCHING
// Tests all the specified test cases for chord parsing improvements
// =============================================================================

/**
 * Test suite to verify enhanced fuzzy chord matching works correctly
 */
function testFuzzyChordMatching() {
  console.log('=== Testing Enhanced Fuzzy Chord Matching ===\n');
  
  let testsPassed = 0;
  let testsTotal = 0;
  
  // Test cases as specified by the user
  const testCases = [
    { input: 'C', expected: 'C', description: 'Simple major chord' },
    { input: 'c', expected: 'C', description: 'Lowercase to uppercase' },
    { input: 'c minor', expected: 'Cm', description: 'Lowercase with space and full word' },
    { input: 'D minor', expected: 'Dm', description: 'Mixed case with space and full word' },
    { input: 'd mjnor', expected: 'Dm', description: 'Lowercase with misspelling' },
    { input: 'D Mino', expected: 'Dm', description: 'Mixed case with partial word' },
    { input: 'D major', expected: 'D', description: 'Major with space and full word' },
    { input: 'Dmajor', expected: 'D', description: 'Major without space' },
    { input: 'd maj', expected: 'D', description: 'Lowercase with abbreviated major' },
    { input: 'dm', expected: 'Dm', description: 'Simple minor chord' },
    { input: 'd aug', expected: 'Daug', description: 'Augmented with space' },
    { input: 'D augmented', expected: 'Daug', description: 'Augmented full word' },
    { input: 'D °', expected: 'Daug', description: 'Degree symbol for augmented' },
    { input: 'd9', expected: 'Dadd9', description: 'Add9 chord' },
    { input: 'DM7', expected: 'Dmaj7', description: 'Major 7th with capital M' },
    { input: 'DMm7', expected: 'D7', description: 'Dominant 7th with confusing notation' },
    { input: 'D dom 7', expected: 'D7', description: 'Dominant 7th with space' },
    { input: 'D dominant 7th', expected: 'D7', description: 'Dominant 7th full description' },
    { input: 'D maj min 7', expected: 'D7', description: 'Confusing dominant 7th notation' },
    { input: 'D major minpr 7', expected: 'D7', description: 'Misspelled confusing dominant 7th' }
  ];
  
  console.log(`Running ${testCases.length} test cases...\n`);
  
  // Check if AutoharpApp and chordParser are available
  if (!window.AutoharpApp || !window.AutoharpApp.modules || !window.AutoharpApp.modules.chordParser) {
    console.log('❌ AutoharpApp or chordParser not available. Cannot run tests.');
    return { passed: 0, total: testCases.length };
  }
  
  const chordParser = window.AutoharpApp.modules.chordParser;
  
  testCases.forEach((testCase, index) => {
    testsTotal++;
    console.log(`Test ${index + 1}: "${testCase.input}" -> "${testCase.expected}" (${testCase.description})`);
    
    try {
      const result = chordParser.parseChord(testCase.input);
      
      if (result === testCase.expected) {
        console.log(`  ✅ PASS: Got "${result}"`);
        testsPassed++;
      } else {
        console.log(`  ❌ FAIL: Expected "${testCase.expected}", got "${result}"`);
        
        // Additional debugging - show normalization step
        const normalized = chordParser.normalizeChordInput(testCase.input);
        console.log(`    🔍 Debug: Normalized to "${normalized}"`);
      }
    } catch (error) {
      console.log(`  ❌ ERROR: ${error.message}`);
    }
    
    console.log(''); // Empty line for readability
  });
  
  // Final results
  console.log(`=== Test Results ===`);
  console.log(`Tests passed: ${testsPassed}/${testsTotal}`);
  console.log(`Success rate: ${Math.round((testsPassed / testsTotal) * 100)}%`);
  
  if (testsPassed === testsTotal) {
    console.log('🎉 All fuzzy matching tests passed!');
  } else {
    console.log(`⚠️  ${testsTotal - testsPassed} tests failed. Review the fuzzy matching logic.`);
  }
  
  return { passed: testsPassed, total: testsTotal };
}

/**
 * Test the normalization function directly
 */
function testNormalizationOnly() {
  console.log('=== Testing Chord Normalization Function ===\n');
  
  if (!window.AutoharpApp || !window.AutoharpApp.modules || !window.AutoharpApp.modules.chordParser) {
    console.log('❌ AutoharpApp or chordParser not available. Cannot run tests.');
    return;
  }
  
  const chordParser = window.AutoharpApp.modules.chordParser;
  
  const testCases = [
    'C', 'c', 'c minor', 'D minor', 'd mjnor', 'D Mino', 
    'D major', 'Dmajor', 'd maj', 'dm', 'd aug', 'D augmented', 
    'D °', 'd9', 'DM7', 'DMm7', 'D dom 7', 'D dominant 7th', 
    'D maj min 7', 'D major minpr 7'
  ];
  
  testCases.forEach(testCase => {
    try {
      const normalized = chordParser.normalizeChordInput(testCase);
      console.log(`"${testCase}" -> "${normalized}"`);
    } catch (error) {
      console.log(`"${testCase}" -> ERROR: ${error.message}`);
    }
  });
}

/**
 * Interactive test function for manual testing
 */
function testChordInput(input) {
  if (!window.AutoharpApp || !window.AutoharpApp.modules || !window.AutoharpApp.modules.chordParser) {
    console.log('❌ AutoharpApp or chordParser not available.');
    return;
  }
  
  const chordParser = window.AutoharpApp.modules.chordParser;
  
  console.log(`Testing input: "${input}"`);
  
  try {
    const normalized = chordParser.normalizeChordInput(input);
    console.log(`  Normalized: "${normalized}"`);
    
    const parsed = chordParser.parseChord(input);
    console.log(`  Final result: "${parsed}"`);
    
    return parsed;
  } catch (error) {
    console.log(`  ERROR: ${error.message}`);
    return null;
  }
}

// Auto-run test when everything is loaded
function runFuzzyTestWhenReady() {
  if (window.AutoharpApp && window.AutoharpApp.initialized) {
    testFuzzyChordMatching();
  } else {
    console.log('Waiting for AutoharpApp to initialize...');
    setTimeout(runFuzzyTestWhenReady, 1000);
  }
}

// Make test functions available globally
window.testFuzzyChordMatching = testFuzzyChordMatching;
window.testNormalizationOnly = testNormalizationOnly;
window.testChordInput = testChordInput;

// Auto-run test
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(runFuzzyTestWhenReady, 2000);
  });
} else {
  setTimeout(runFuzzyTestWhenReady, 2000);
}

console.log('Fuzzy chord matching test suite loaded.');
console.log('Available functions:');
console.log('- testFuzzyChordMatching() - Run all test cases');
console.log('- testNormalizationOnly() - Test normalization function only');
console.log('- testChordInput("your input") - Test a specific chord input');
