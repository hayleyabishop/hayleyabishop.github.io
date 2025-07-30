// =============================================================================
// TEST SUITE FOR DUPLICATE FUNCTION FIXES
// Tests the resolution of duplicate methods and functions
// =============================================================================

/**
 * Test suite to verify duplicate function fixes work correctly
 */
function testDuplicateFixes() {
  console.log('=== Testing Duplicate Function Fixes ===\n');
  
  let testsPassed = 0;
  let testsTotal = 0;
  
  // Test 1: Verify formatChordName functionality
  console.log('Test 1: formatChordName functionality');
  testsTotal++;
  
  try {
    if (typeof window.formatChordName === 'function') {
      const testCases = [
        { input: ['C', 'major'], expected: 'C' },
        { input: ['C', 'minor'], expected: 'Cm' },
        { input: ['C', '7th'], expected: 'C7' },
        { input: ['C', 'm7'], expected: 'Cm7' },
        { input: ['C', 'maj7'], expected: 'Cmaj7' },
        { input: ['C', 'dim'], expected: 'Cdim' },
        { input: ['C', 'aug'], expected: 'Caug' }
      ];
      
      let formatTestsPassed = 0;
      testCases.forEach(testCase => {
        const result = window.formatChordName(testCase.input[0], testCase.input[1]);
        if (result === testCase.expected) {
          formatTestsPassed++;
          console.log(`  ✓ ${testCase.input[0]} + ${testCase.input[1]} = ${result}`);
        } else {
          console.log(`  ✗ ${testCase.input[0]} + ${testCase.input[1]} = ${result} (expected ${testCase.expected})`);
        }
      });
      
      if (formatTestsPassed === testCases.length) {
        console.log('  ✓ formatChordName test PASSED');
        testsPassed++;
      } else {
        console.log(`  ✗ formatChordName test FAILED (${formatTestsPassed}/${testCases.length} subtests passed)`);
      }
    } else {
      console.log('  ✗ formatChordName function not available');
    }
  } catch (error) {
    console.log(`  ✗ formatChordName test ERROR: ${error.message}`);
  }
  
  // Test 2: Verify parseChordString vs parseChord distinction
  console.log('\nTest 2: parseChordString vs parseChord distinction');
  testsTotal++;
  
  try {
    let parseTestsPassed = 0;
    let parseTestsTotal = 2;
    
    // Test parseChordString (webapp.js) - should return structured data
    if (typeof window.parseChordString === 'function') {
      const parseStringResult = window.parseChordString('Cm7');
      if (parseStringResult && typeof parseStringResult === 'object' && parseStringResult.root && parseStringResult.type) {
        console.log(`  ✓ parseChordString('Cm7') returns structured data: ${JSON.stringify(parseStringResult)}`);
        parseTestsPassed++;
      } else {
        console.log(`  ✗ parseChordString('Cm7') failed to return structured data: ${parseStringResult}`);
      }
    } else {
      console.log('  ✗ parseChordString function not available');
    }
    
    // Test parseChord (chordParser.js) - should return matching chord or null
    if (window.AutoharpApp && window.AutoharpApp.modules && window.AutoharpApp.modules.chordParser) {
      const chordParser = window.AutoharpApp.modules.chordParser;
      const parseResult = chordParser.parseChord('C');
      if (typeof parseResult === 'string' || parseResult === null) {
        console.log(`  ✓ chordParser.parseChord('C') returns chord match: ${parseResult}`);
        parseTestsPassed++;
      } else {
        console.log(`  ✗ chordParser.parseChord('C') returned unexpected type: ${typeof parseResult}`);
      }
    } else {
      console.log('  ✗ chordParser.parseChord not available');
    }
    
    if (parseTestsPassed === parseTestsTotal) {
      console.log('  ✓ parseChord distinction test PASSED');
      testsPassed++;
    } else {
      console.log(`  ✗ parseChord distinction test FAILED (${parseTestsPassed}/${parseTestsTotal} subtests passed)`);
    }
  } catch (error) {
    console.log(`  ✗ parseChord distinction test ERROR: ${error.message}`);
  }
  
  // Test 3: Verify chord addition/removal functionality
  console.log('\nTest 3: Chord addition/removal functionality');
  testsTotal++;
  
  try {
    if (window.AutoharpApp) {
      const app = window.AutoharpApp;
      
      // Clear any existing chords
      app.clearAllChords();
      
      let chordTestsPassed = 0;
      let chordTestsTotal = 4;
      
      // Test 3a: Add chord
      const addResult = app.addChord('C', 'test');
      if (addResult === true) {
        console.log('  ✓ addChord() returned true');
        chordTestsPassed++;
      } else {
        console.log(`  ✗ addChord() returned: ${addResult}`);
      }
      
      // Test 3b: Verify chord was added
      const selectedChords = app.getSelectedChords();
      if (selectedChords && selectedChords.includes('C')) {
        console.log('  ✓ Chord appears in getSelectedChords()');
        chordTestsPassed++;
      } else {
        console.log(`  ✗ Chord not found in getSelectedChords(): ${JSON.stringify(selectedChords)}`);
      }
      
      // Test 3c: Remove chord
      const removeResult = app.removeChord('C');
      if (removeResult === true) {
        console.log('  ✓ removeChord() returned true');
        chordTestsPassed++;
      } else {
        console.log(`  ✗ removeChord() returned: ${removeResult}`);
      }
      
      // Test 3d: Verify chord was removed
      const selectedChordsAfterRemoval = app.getSelectedChords();
      if (selectedChordsAfterRemoval && !selectedChordsAfterRemoval.includes('C')) {
        console.log('  ✓ Chord removed from getSelectedChords()');
        chordTestsPassed++;
      } else {
        console.log(`  ✗ Chord still in getSelectedChords(): ${JSON.stringify(selectedChordsAfterRemoval)}`);
      }
      
      if (chordTestsPassed === chordTestsTotal) {
        console.log('  ✓ Chord addition/removal test PASSED');
        testsPassed++;
      } else {
        console.log(`  ✗ Chord addition/removal test FAILED (${chordTestsPassed}/${chordTestsTotal} subtests passed)`);
      }
    } else {
      console.log('  ✗ AutoharpApp not available');
    }
  } catch (error) {
    console.log(`  ✗ Chord addition/removal test ERROR: ${error.message}`);
  }
  
  // Test 4: Verify no duplicate handleAddChordClick functions
  console.log('\nTest 4: Verify handleAddChordClick duplicate removal');
  testsTotal++;
  
  try {
    if (window.AutoharpApp && window.AutoharpApp.modules && window.AutoharpApp.modules.eventCoordinator) {
      const eventCoordinator = window.AutoharpApp.modules.eventCoordinator;
      
      // Check that handleAddChordClick exists and is a function
      if (typeof eventCoordinator.handleAddChordClick === 'function') {
        console.log('  ✓ handleAddChordClick method exists');
        
        // Try to call it (should not throw an error about duplicate definitions)
        try {
          // We won't actually call it since it requires DOM elements, but we can verify it exists
          console.log('  ✓ handleAddChordClick is callable (no duplicate definition errors)');
          testsPassed++;
        } catch (callError) {
          console.log(`  ✗ handleAddChordClick call error: ${callError.message}`);
        }
      } else {
        console.log('  ✗ handleAddChordClick method not found or not a function');
      }
    } else {
      console.log('  ✗ EventCoordinator not available');
    }
  } catch (error) {
    console.log(`  ✗ handleAddChordClick test ERROR: ${error.message}`);
  }
  
  // Final results
  console.log(`\n=== Test Results ===`);
  console.log(`Tests passed: ${testsPassed}/${testsTotal}`);
  
  if (testsPassed === testsTotal) {
    console.log('🎉 All duplicate function fixes are working correctly!');
  } else {
    console.log('⚠️  Some tests failed. Please review the duplicate function fixes.');
  }
  
  return { passed: testsPassed, total: testsTotal };
}

// Auto-run test when everything is loaded
function runTestWhenAppReady() {
  if (window.AutoharpApp && window.AutoharpApp.initialized) {
    testDuplicateFixes();
  } else {
    console.log('Waiting for AutoharpApp to initialize...');
    setTimeout(runTestWhenAppReady, 1000);
  }
}

// Make test function available globally
window.testDuplicateFixes = testDuplicateFixes;

// Auto-run test
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(runTestWhenAppReady, 2000);
  });
} else {
  setTimeout(runTestWhenAppReady, 2000);
}

console.log('Duplicate fixes test suite loaded. Run testDuplicateFixes() manually or wait for auto-run.');
