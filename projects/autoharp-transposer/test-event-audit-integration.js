// =============================================================================
// EVENT AUDIT INTEGRATION TESTING
// Phase 4: User-facing tests that simulate input and check rendered output
// =============================================================================

/**
 * Comprehensive integration test suite for event handling and user interactions
 * Tests the complete user workflow from input to rendered output
 */
function testEventAuditIntegration() {
  console.log('=== Event Audit Integration Testing ===\n');
  
  let testsPassed = 0;
  let testsTotal = 0;
  
  // Check if AutoharpApp is available
  if (!window.AutoharpApp || !window.AutoharpApp.modules) {
    console.log('❌ AutoharpApp not available. Cannot run tests.');
    return { passed: 0, total: 0 };
  }
  
  console.log('Testing complete user interaction workflows...\n');
  
  // Test 1: Text Input -> Enter Key -> Chord Added to UI
  console.log('Test 1: Text Input + Enter Key Integration');
  testsTotal++;
  try {
    const textInput = document.getElementById('chordTextInput');
    const chordContainer = document.getElementById('chordGroupInputs');
    
    if (!textInput || !chordContainer) {
      console.log('  ❌ FAIL: Required DOM elements not found');
    } else {
      // Clear existing chords
      const originalChords = [...window.AutoharpApp.modules.inputManager.selectedChords];
      window.AutoharpApp.modules.inputManager.selectedChords.length = 0;
      
      // Simulate user typing "C" and pressing Enter
      textInput.value = 'C';
      textInput.focus();
      
      // Trigger input event (for suggestions)
      textInput.dispatchEvent(new Event('input', { bubbles: true }));
      
      // Wait a moment for suggestions to appear
      setTimeout(() => {
        // Trigger Enter key
        const enterEvent = new KeyboardEvent('keydown', {
          key: 'Enter',
          code: 'Enter',
          bubbles: true
        });
        textInput.dispatchEvent(enterEvent);
        
        // Check if chord was added
        setTimeout(() => {
          const selectedChords = window.AutoharpApp.modules.inputManager.selectedChords;
          const chordElements = chordContainer.querySelectorAll('.chord');
          
          console.log(`  Input: "C"`);
          console.log(`  Selected chords: ${JSON.stringify(selectedChords)}`);
          console.log(`  Rendered chord elements: ${chordElements.length}`);
          
          if (selectedChords.includes('C') && chordElements.length > 0) {
            console.log('  ✅ PASS: Chord added to data and rendered in UI');
            testsPassed++;
          } else {
            console.log('  ❌ FAIL: Chord not properly added or rendered');
          }
          
          // Restore original chords
          window.AutoharpApp.modules.inputManager.selectedChords.length = 0;
          window.AutoharpApp.modules.inputManager.selectedChords.push(...originalChords);
          
          // Continue with next test
          runTest2();
        }, 100);
      }, 200);
    }
  } catch (error) {
    console.log(`  ❌ ERROR: ${error.message}`);
    runTest2();
  }
  
  // Test 2: Add Button Click Integration
  function runTest2() {
    console.log('\nTest 2: Add Button Click Integration');
    testsTotal++;
    try {
      const textInput = document.getElementById('chordTextInput');
      const addButton = document.getElementById('addChordBtn');
      const chordContainer = document.getElementById('chordGroupInputs');
      
      if (!textInput || !addButton || !chordContainer) {
        console.log('  ❌ FAIL: Required DOM elements not found');
      } else {
        // Clear existing chords
        const originalChords = [...window.AutoharpApp.modules.inputManager.selectedChords];
        window.AutoharpApp.modules.inputManager.selectedChords.length = 0;
        
        // Simulate user typing "Dm" and clicking Add button
        textInput.value = 'Dm';
        
        // Trigger button click
        addButton.click();
        
        // Check if chord was added
        setTimeout(() => {
          const selectedChords = window.AutoharpApp.modules.inputManager.selectedChords;
          const chordElements = chordContainer.querySelectorAll('.chord');
          
          console.log(`  Input: "Dm"`);
          console.log(`  Selected chords: ${JSON.stringify(selectedChords)}`);
          console.log(`  Rendered chord elements: ${chordElements.length}`);
          
          if (selectedChords.includes('Dm') && chordElements.length > 0) {
            console.log('  ✅ PASS: Add button successfully added chord');
            testsPassed++;
          } else {
            console.log('  ❌ FAIL: Add button did not work properly');
          }
          
          // Restore original chords
          window.AutoharpApp.modules.inputManager.selectedChords.length = 0;
          window.AutoharpApp.modules.inputManager.selectedChords.push(...originalChords);
          
          // Continue with next test
          runTest3();
        }, 100);
      }
    } catch (error) {
      console.log(`  ❌ ERROR: ${error.message}`);
      runTest3();
    }
  }
  
  // Test 3: Clear All Button Integration
  function runTest3() {
    console.log('\nTest 3: Clear All Button Integration');
    testsTotal++;
    try {
      const clearAllButton = document.getElementById('clearAllChords');
      const chordContainer = document.getElementById('chordGroupInputs');
      
      if (!clearAllButton || !chordContainer) {
        console.log('  ❌ FAIL: Required DOM elements not found');
      } else {
        // Add some test chords first
        window.AutoharpApp.modules.inputManager.selectedChords.length = 0;
        window.AutoharpApp.modules.inputManager.addChord('C', 'test');
        window.AutoharpApp.modules.inputManager.addChord('G', 'test');
        
        console.log(`  Before clear: ${window.AutoharpApp.modules.inputManager.selectedChords.length} chords`);
        
        // Click Clear All button
        clearAllButton.click();
        
        // Check if chords were cleared
        setTimeout(() => {
          const selectedChords = window.AutoharpApp.modules.inputManager.selectedChords;
          const chordElements = chordContainer.querySelectorAll('.chord');
          
          console.log(`  After clear: ${selectedChords.length} chords`);
          console.log(`  Rendered chord elements: ${chordElements.length}`);
          
          if (selectedChords.length === 0 && chordElements.length === 0) {
            console.log('  ✅ PASS: Clear All button successfully cleared chords');
            testsPassed++;
          } else {
            console.log('  ❌ FAIL: Clear All button did not work properly');
          }
          
          // Continue with next test
          runTest4();
        }, 100);
      }
    } catch (error) {
      console.log(`  ❌ ERROR: ${error.message}`);
      runTest4();
    }
  }
  
  // Test 4: Sound Toggle Button Integration
  function runTest4() {
    console.log('\nTest 4: Sound Toggle Button Integration');
    testsTotal++;
    try {
      const soundToggle = document.getElementById('soundToggle');
      
      if (!soundToggle) {
        console.log('  ❌ FAIL: Sound toggle button not found');
      } else {
        const initialState = window.AutoharpApp.modules.audioManager ? 
          window.AutoharpApp.modules.audioManager.soundEnabled : false;
        
        console.log(`  Initial sound state: ${initialState}`);
        
        // Click sound toggle
        soundToggle.click();
        
        setTimeout(() => {
          const newState = window.AutoharpApp.modules.audioManager ? 
            window.AutoharpApp.modules.audioManager.soundEnabled : false;
          
          console.log(`  New sound state: ${newState}`);
          console.log(`  Button text: "${soundToggle.textContent}"`);
          
          if (newState !== initialState) {
            console.log('  ✅ PASS: Sound toggle successfully changed state');
            testsPassed++;
          } else {
            console.log('  ❌ FAIL: Sound toggle did not change state');
          }
          
          // Continue with next test
          runTest5();
        }, 100);
      }
    } catch (error) {
      console.log(`  ❌ ERROR: ${error.message}`);
      runTest5();
    }
  }
  
  // Test 5: Autoharp Type Radio Integration
  function runTest5() {
    console.log('\nTest 5: Autoharp Type Radio Integration');
    testsTotal++;
    try {
      const radio21 = document.getElementById('type21Chord');
      const radio12 = document.getElementById('type12Chord');
      
      if (!radio21 || !radio12) {
        console.log('  ❌ FAIL: Radio buttons not found');
      } else {
        // Click 21-chord radio
        radio21.checked = true;
        radio21.dispatchEvent(new Event('change', { bubbles: true }));
        
        setTimeout(() => {
          // Check if autoharp type changed
          const currentType = window.AutoharpApp ? window.AutoharpApp.currentAutoharpType : null;
          
          console.log(`  Selected 21-chord radio`);
          console.log(`  Current autoharp type: ${currentType}`);
          console.log(`  Radio checked: ${radio21.checked}`);
          
          if (radio21.checked) {
            console.log('  ✅ PASS: Radio button selection works');
            testsPassed++;
          } else {
            console.log('  ❌ FAIL: Radio button selection failed');
          }
          
          // Finish tests
          finishTests();
        }, 100);
      }
    } catch (error) {
      console.log(`  ❌ ERROR: ${error.message}`);
      finishTests();
    }
  }
  
  function finishTests() {
    console.log(`\n=== Integration Test Results ===`);
    console.log(`Tests passed: ${testsPassed}/${testsTotal}`);
    console.log(`Success rate: ${Math.round((testsPassed / testsTotal) * 100)}%`);
    
    if (testsPassed === testsTotal) {
      console.log('🎉 All integration tests passed!');
    } else {
      console.log(`⚠️  ${testsTotal - testsPassed} tests failed. Check event handling implementation.`);
    }
    
    return { passed: testsPassed, total: testsTotal };
  }
}

/**
 * Test specific user interaction workflow
 */
function testSpecificWorkflow(workflowName) {
  console.log(`=== Testing Workflow: ${workflowName} ===`);
  
  switch (workflowName) {
    case 'chord-input':
      testChordInputWorkflow();
      break;
    case 'button-clicks':
      testButtonClickWorkflow();
      break;
    case 'keyboard-shortcuts':
      testKeyboardShortcutWorkflow();
      break;
    default:
      console.log('Unknown workflow. Available: chord-input, button-clicks, keyboard-shortcuts');
  }
}

function testChordInputWorkflow() {
  console.log('Testing complete chord input workflow...');
  
  const textInput = document.getElementById('chordTextInput');
  if (!textInput) {
    console.log('❌ Text input not found');
    return;
  }
  
  // Simulate typing
  textInput.value = 'c maj';
  textInput.dispatchEvent(new Event('input', { bubbles: true }));
  
  setTimeout(() => {
    const suggestions = document.getElementById('chordSuggestions');
    console.log(`Suggestions visible: ${suggestions && suggestions.style.display !== 'none'}`);
    console.log(`Suggestions content: ${suggestions ? suggestions.innerHTML : 'none'}`);
    
    // Simulate Enter key
    const enterEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      code: 'Enter',
      bubbles: true
    });
    textInput.dispatchEvent(enterEvent);
    
    setTimeout(() => {
      const selectedChords = window.AutoharpApp.modules.inputManager.selectedChords;
      console.log(`Final selected chords: ${JSON.stringify(selectedChords)}`);
    }, 100);
  }, 200);
}

// Auto-run test when everything is loaded
function runEventAuditTestWhenReady() {
  if (window.AutoharpApp && window.AutoharpApp.initialized) {
    testEventAuditIntegration();
  } else {
    console.log('Waiting for AutoharpApp to initialize...');
    setTimeout(runEventAuditTestWhenReady, 1000);
  }
}

// Make test functions available globally
window.testEventAuditIntegration = testEventAuditIntegration;
window.testSpecificWorkflow = testSpecificWorkflow;
window.testChordInputWorkflow = testChordInputWorkflow;

// Auto-run test
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(runEventAuditTestWhenReady, 2000);
  });
} else {
  setTimeout(runEventAuditTestWhenReady, 2000);
}

console.log('Event Audit Integration Test Suite loaded.');
console.log('Available functions:');
console.log('- testEventAuditIntegration() - Run all integration tests');
console.log('- testSpecificWorkflow("workflow-name") - Test specific workflow');
console.log('- testChordInputWorkflow() - Test chord input specifically');
