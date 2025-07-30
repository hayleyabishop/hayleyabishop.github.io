// =============================================================================
// TEST SUITE FOR CHORD NORMALIZATION FIXES
// Tests that lowercase inputs are properly normalized in suggestions and rendering
// =============================================================================

/**
 * Test suite to verify that chord normalization works in all input scenarios
 */
function testChordNormalizationFix() {
  console.log('=== Testing Chord Normalization Fix ===\n');
  
  let testsPassed = 0;
  let testsTotal = 0;
  
  // Check if AutoharpApp is available
  if (!window.AutoharpApp || !window.AutoharpApp.modules) {
    console.log('❌ AutoharpApp not available. Cannot run tests.');
    return { passed: 0, total: 0 };
  }
  
  const { chordParser, inputManager } = window.AutoharpApp.modules;
  
  if (!chordParser || !inputManager) {
    console.log('❌ Required modules not available. Cannot run tests.');
    return { passed: 0, total: 0 };
  }
  
  console.log('Testing chord normalization in different scenarios...\n');
  
  // Test 1: Suggestions should return normalized chords
  console.log('Test 1: Chord suggestions normalization');
  testsTotal++;
  try {
    const suggestions = chordParser.getSuggestions('c');
    console.log(`  Input: "c"`);
    console.log(`  Suggestions: ${JSON.stringify(suggestions)}`);
    
    // Check if all suggestions start with uppercase C
    const allNormalized = suggestions.every(chord => chord.startsWith('C'));
    if (allNormalized && suggestions.length > 0) {
      console.log('  ✅ PASS: All suggestions are normalized to uppercase');
      testsPassed++;
    } else {
      console.log('  ❌ FAIL: Some suggestions are not normalized');
    }
  } catch (error) {
    console.log(`  ❌ ERROR: ${error.message}`);
  }
  console.log('');
  
  // Test 2: Adding chord should normalize input
  console.log('Test 2: Adding chord normalization');
  testsTotal++;
  try {
    // Clear existing chords first
    const originalChords = [...inputManager.selectedChords];
    inputManager.selectedChords.length = 0;
    
    const success = inputManager.addChord('c', 'test');
    console.log(`  Input: "c"`);
    console.log(`  Add success: ${success}`);
    console.log(`  Selected chords: ${JSON.stringify(inputManager.selectedChords)}`);
    
    if (success && inputManager.selectedChords.includes('C') && !inputManager.selectedChords.includes('c')) {
      console.log('  ✅ PASS: Chord was normalized to uppercase when added');
      testsPassed++;
    } else {
      console.log('  ❌ FAIL: Chord was not properly normalized when added');
    }
    
    // Restore original chords
    inputManager.selectedChords.length = 0;
    inputManager.selectedChords.push(...originalChords);
  } catch (error) {
    console.log(`  ❌ ERROR: ${error.message}`);
  }
  console.log('');
  
  // Test 3: parseChord should normalize input
  console.log('Test 3: parseChord normalization');
  testsTotal++;
  try {
    const result = chordParser.parseChord('c');
    console.log(`  Input: "c"`);
    console.log(`  parseChord result: "${result}"`);
    
    if (result === 'C') {
      console.log('  ✅ PASS: parseChord normalized lowercase to uppercase');
      testsPassed++;
    } else {
      console.log(`  ❌ FAIL: parseChord returned "${result}" instead of "C"`);
    }
  } catch (error) {
    console.log(`  ❌ ERROR: ${error.message}`);
  }
  console.log('');
  
  // Test 4: extractRootNote should normalize input
  console.log('Test 4: extractRootNote normalization');
  testsTotal++;
  try {
    const rootNote = chordParser.extractRootNote('c');
    console.log(`  Input: "c"`);
    console.log(`  extractRootNote result: "${rootNote}"`);
    
    if (rootNote === 'C') {
      console.log('  ✅ PASS: extractRootNote normalized lowercase to uppercase');
      testsPassed++;
    } else {
      console.log(`  ❌ FAIL: extractRootNote returned "${rootNote}" instead of "C"`);
    }
  } catch (error) {
    console.log(`  ❌ ERROR: ${error.message}`);
  }
  console.log('');
  
  // Test 5: Complex chord normalization
  console.log('Test 5: Complex chord normalization');
  testsTotal++;
  try {
    const result = chordParser.parseChord('c minor');
    console.log(`  Input: "c minor"`);
    console.log(`  parseChord result: "${result}"`);
    
    if (result === 'Cm') {
      console.log('  ✅ PASS: Complex chord normalized correctly');
      testsPassed++;
    } else {
      console.log(`  ❌ FAIL: Complex chord returned "${result}" instead of "Cm"`);
    }
  } catch (error) {
    console.log(`  ❌ ERROR: ${error.message}`);
  }
  console.log('');
  
  // Final results
  console.log(`=== Test Results ===`);
  console.log(`Tests passed: ${testsPassed}/${testsTotal}`);
  console.log(`Success rate: ${Math.round((testsPassed / testsTotal) * 100)}%`);
  
  if (testsPassed === testsTotal) {
    console.log('🎉 All normalization tests passed!');
  } else {
    console.log(`⚠️  ${testsTotal - testsPassed} tests failed. Normalization needs more work.`);
  }
  
  return { passed: testsPassed, total: testsTotal };
}

/**
 * Interactive test for manual verification
 */
function testSpecificInput(input) {
  if (!window.AutoharpApp || !window.AutoharpApp.modules) {
    console.log('❌ AutoharpApp not available.');
    return;
  }
  
  const { chordParser, inputManager } = window.AutoharpApp.modules;
  
  console.log(`=== Testing input: "${input}" ===`);
  
  // Test parseChord
  try {
    const parsed = chordParser.parseChord(input);
    console.log(`parseChord: "${input}" -> "${parsed}"`);
  } catch (error) {
    console.log(`parseChord ERROR: ${error.message}`);
  }
  
  // Test extractRootNote
  try {
    const rootNote = chordParser.extractRootNote(input);
    console.log(`extractRootNote: "${input}" -> "${rootNote}"`);
  } catch (error) {
    console.log(`extractRootNote ERROR: ${error.message}`);
  }
  
  // Test getSuggestions
  try {
    const suggestions = chordParser.getSuggestions(input, 3);
    console.log(`getSuggestions: "${input}" -> ${JSON.stringify(suggestions)}`);
  } catch (error) {
    console.log(`getSuggestions ERROR: ${error.message}`);
  }
  
  // Test addChord (without actually adding to avoid side effects)
  console.log(`To test addChord, use: inputManager.addChord("${input}", "test")`);
}

// Auto-run test when everything is loaded
function runNormalizationTestWhenReady() {
  if (window.AutoharpApp && window.AutoharpApp.initialized) {
    testChordNormalizationFix();
  } else {
    console.log('Waiting for AutoharpApp to initialize...');
    setTimeout(runNormalizationTestWhenReady, 1000);
  }
}

// Make test functions available globally
window.testChordNormalizationFix = testChordNormalizationFix;
window.testSpecificInput = testSpecificInput;

// Auto-run test
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(runNormalizationTestWhenReady, 2000);
  });
} else {
  setTimeout(runNormalizationTestWhenReady, 2000);
}

console.log('Chord normalization test suite loaded.');
console.log('Available functions:');
console.log('- testChordNormalizationFix() - Run all normalization tests');
console.log('- testSpecificInput("your input") - Test a specific input');
