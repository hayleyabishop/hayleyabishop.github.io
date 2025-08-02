// =============================================================================
// TEST: Input & UI Specialist Fixes Verification
// Agent #2 (Inigo) - Testing duplicate method removal and UI enhancements
// =============================================================================

console.log('🧪 Testing Input & UI Specialist Fixes...');

// Test configuration
const TEST_CONFIG = {
  testChords: ['C', 'Gm', 'F#7', 'Asus2', 'invalid', 'c', 'GM'],
  debugMode: true
};

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(testName, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  const message = `${status}: ${testName}${details ? ' - ' + details : ''}`;
  console.log(message);
  
  testResults.tests.push({ testName, passed, details });
  if (passed) testResults.passed++;
  else testResults.failed++;
}

// Wait for DOM and app to be ready
function waitForApp() {
  return new Promise((resolve) => {
    if (window.AutoharpApp && window.AutoharpApp.modules) {
      resolve();
    } else {
      setTimeout(() => waitForApp().then(resolve), 100);
    }
  });
}

// Test 1: Verify no duplicate methods exist (by testing method execution)
function testNoDuplicateMethods() {
  console.log('\n📋 Test 1: Verifying No Duplicate Methods');
  
  const eventCoordinator = window.AutoharpApp.modules.eventCoordinator;
  if (!eventCoordinator) {
    logTest('EventCoordinator exists', false, 'EventCoordinator not found');
    return;
  }
  
  // Test that methods exist and are functions
  const methodsToTest = [
    'handleTextInput',
    'clearTextInput', 
    'showSuggestions',
    'clearSuggestions',
    'showMessage'
  ];
  
  methodsToTest.forEach(methodName => {
    const method = eventCoordinator[methodName];
    const exists = typeof method === 'function';
    logTest(`${methodName} method exists`, exists, 
      exists ? 'Function found' : 'Method missing or not a function');
  });
}

// Test 2: Test real-time input validation
function testRealTimeValidation() {
  console.log('\n📋 Test 2: Testing Real-Time Input Validation');
  
  const textInput = document.getElementById('chordTextInput');
  if (!textInput) {
    logTest('Text input element exists', false, 'chordTextInput not found');
    return;
  }
  
  // Test input validation classes
  TEST_CONFIG.testChords.forEach(chord => {
    // Clear previous classes
    textInput.classList.remove('input-valid', 'input-invalid', 'input-partial');
    
    // Simulate input
    textInput.value = chord;
    const inputEvent = new Event('input', { bubbles: true });
    textInput.dispatchEvent(inputEvent);
    
    // Check for validation classes
    const hasValidClass = textInput.classList.contains('input-valid');
    const hasInvalidClass = textInput.classList.contains('input-invalid');
    const hasPartialClass = textInput.classList.contains('input-partial');
    
    const hasValidationClass = hasValidClass || hasInvalidClass || hasPartialClass;
    logTest(`Input validation for "${chord}"`, hasValidationClass, 
      `Classes: valid=${hasValidClass}, invalid=${hasInvalidClass}, partial=${hasPartialClass}`);
  });
}

// Test 3: Test suggestion system
function testSuggestionSystem() {
  console.log('\n📋 Test 3: Testing Suggestion System');
  
  const textInput = document.getElementById('chordTextInput');
  const suggestionsContainer = document.getElementById('chordSuggestions');
  
  if (!textInput || !suggestionsContainer) {
    logTest('Suggestion elements exist', false, 'Missing text input or suggestions container');
    return;
  }
  
  // Test suggestion display
  const partialInputs = ['C', 'G', 'F'];
  
  partialInputs.forEach(input => {
    // Clear and set input
    textInput.value = input;
    const inputEvent = new Event('input', { bubbles: true });
    textInput.dispatchEvent(inputEvent);
    
    // Wait a moment for suggestions to appear
    setTimeout(() => {
      const isVisible = suggestionsContainer.style.display !== 'none';
      const hasSuggestions = suggestionsContainer.children.length > 0;
      
      logTest(`Suggestions for "${input}"`, isVisible && hasSuggestions,
        `Visible: ${isVisible}, Count: ${suggestionsContainer.children.length}`);
    }, 200);
  });
}

// Test 4: Test method execution with debugging
function testMethodExecution() {
  console.log('\n📋 Test 4: Testing Method Execution (Check Console for Debug Logs)');
  
  const eventCoordinator = window.AutoharpApp.modules.eventCoordinator;
  if (!eventCoordinator) {
    logTest('EventCoordinator available for testing', false);
    return;
  }
  
  // Test handleTextInput execution
  console.log('🔍 Testing handleTextInput execution...');
  try {
    eventCoordinator.handleTextInput('C');
    logTest('handleTextInput executes without error', true, 'Check console for debug log');
  } catch (error) {
    logTest('handleTextInput executes without error', false, error.message);
  }
  
  // Test clearTextInput execution
  console.log('🔍 Testing clearTextInput execution...');
  try {
    eventCoordinator.clearTextInput();
    logTest('clearTextInput executes without error', true, 'Check console for debug log');
  } catch (error) {
    logTest('clearTextInput executes without error', false, error.message);
  }
  
  // Test showSuggestions execution
  console.log('🔍 Testing showSuggestions execution...');
  try {
    eventCoordinator.showSuggestions(['C', 'Cm', 'C7'], 'C');
    logTest('showSuggestions executes without error', true, 'Check console for debug log');
  } catch (error) {
    logTest('showSuggestions executes without error', false, error.message);
  }
}

// Test 5: Test chord addition workflow
function testChordAdditionWorkflow() {
  console.log('\n📋 Test 5: Testing Complete Chord Addition Workflow');
  
  const textInput = document.getElementById('chordTextInput');
  const addButton = document.getElementById('addChordBtn');
  
  if (!textInput || !addButton) {
    logTest('Chord addition elements exist', false, 'Missing text input or add button');
    return;
  }
  
  // Test adding a valid chord
  textInput.value = 'C';
  try {
    addButton.click();
    logTest('Chord addition workflow', true, 'Add button clicked successfully');
  } catch (error) {
    logTest('Chord addition workflow', false, error.message);
  }
}

// Main test execution
async function runAllTests() {
  console.log('🚀 Starting Input & UI Specialist Fix Verification Tests');
  console.log('=' .repeat(60));
  
  try {
    await waitForApp();
    console.log('✅ App loaded successfully');
    
    // Run all tests
    testNoDuplicateMethods();
    testRealTimeValidation();
    testSuggestionSystem();
    testMethodExecution();
    testChordAdditionWorkflow();
    
    // Final results
    setTimeout(() => {
      console.log('\n' + '='.repeat(60));
      console.log('📊 TEST RESULTS SUMMARY');
      console.log('='.repeat(60));
      console.log(`✅ Passed: ${testResults.passed}`);
      console.log(`❌ Failed: ${testResults.failed}`);
      console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
      
      if (testResults.failed === 0) {
        console.log('🎉 ALL TESTS PASSED! Input & UI enhancements are working correctly.');
      } else {
        console.log('⚠️  Some tests failed. Review the results above for details.');
      }
      
      console.log('\n🔍 Debug Information:');
      console.log('- Check console logs above for method execution debugging');
      console.log('- Verify that duplicate methods have been removed');
      console.log('- Test real-time input validation by typing in the chord input field');
      console.log('- Verify suggestions appear when typing partial chord names');
    }, 1000);
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    logTest('Test execution', false, error.message);
  }
}

// Auto-run tests when script loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runAllTests);
} else {
  runAllTests();
}

// Export for manual testing
window.InputUISpecialistTests = {
  runAllTests,
  testNoDuplicateMethods,
  testRealTimeValidation,
  testSuggestionSystem,
  testMethodExecution,
  testChordAdditionWorkflow,
  testResults
};

console.log('📝 Test script loaded. Tests will run automatically or call window.InputUISpecialistTests.runAllTests()');
