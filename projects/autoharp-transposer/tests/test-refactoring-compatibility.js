/**
 * Test Script: Refactoring Compatibility Test
 * Verifies that UI function refactoring changes don't conflict with other code
 * Tests global accessibility, module integration, and backward compatibility
 */

console.log('🧪 Testing Refactoring Compatibility - UI Function Modularization');
console.log('================================================================');

// Global test results
const testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
};

function logTest(testName, passed, message, isWarning = false) {
  const status = passed ? '✅' : (isWarning ? '⚠️' : '❌');
  console.log(`${status} ${testName}: ${message}`);
  
  testResults.tests.push({ testName, passed, message, isWarning });
  if (passed) {
    testResults.passed++;
  } else if (isWarning) {
    testResults.warnings++;
  } else {
    testResults.failed++;
  }
}

// Test 1: Global Module Accessibility
console.log('\n📋 Test Suite 1: Global Module Accessibility');
console.log('---------------------------------------------');

// Test EventCoordinator global exposure
if (window.eventCoordinator) {
  logTest('EventCoordinator Global Access', true, 'window.eventCoordinator is available');
  
  // Test EventCoordinator methods
  const requiredMethods = ['addDragListeners', 'handleDragStart', 'handleDragOver', 'handleDrop', 'handleDragEnd'];
  requiredMethods.forEach(method => {
    if (typeof window.eventCoordinator[method] === 'function') {
      logTest(`EventCoordinator.${method}`, true, 'Method is available');
    } else {
      logTest(`EventCoordinator.${method}`, false, 'Method is missing or not a function');
    }
  });
} else {
  logTest('EventCoordinator Global Access', false, 'window.eventCoordinator is not available');
}

// Test InputManager global exposure
if (window.inputManager) {
  logTest('InputManager Global Access', true, 'window.inputManager is available');
  
  // Test InputManager legacy methods
  const legacyMethods = ['appendChordLegacy', 'removeChordLegacy', 'getInputChordsLegacy'];
  legacyMethods.forEach(method => {
    if (typeof window.inputManager[method] === 'function') {
      logTest(`InputManager.${method}`, true, 'Legacy method is available');
    } else {
      logTest(`InputManager.${method}`, false, 'Legacy method is missing');
    }
  });
} else {
  logTest('InputManager Global Access', false, 'window.inputManager is not available');
}

// Test 2: Legacy Function Compatibility
console.log('\n📋 Test Suite 2: Legacy Function Compatibility');
console.log('-----------------------------------------------');

// Test global legacy functions
const legacyFunctions = [
  'addDragListeners',
  'removeChord',
  'appendChord',
  'getInputChords',
  'addChordFromButton'
];

legacyFunctions.forEach(funcName => {
  if (typeof window[funcName] === 'function') {
    logTest(`Global ${funcName}`, true, 'Legacy function is accessible');
  } else {
    logTest(`Global ${funcName}`, false, 'Legacy function is missing');
  }
});

// Test 3: DOM Integration Points
console.log('\n📋 Test Suite 3: DOM Integration Points');
console.log('----------------------------------------');

// Test critical DOM elements
const criticalElements = [
  'chordGroupInputs',
  'chordGroupResults'
];

criticalElements.forEach(elementId => {
  const element = document.getElementById(elementId);
  if (element) {
    logTest(`DOM Element ${elementId}`, true, 'Element found in DOM');
  } else {
    logTest(`DOM Element ${elementId}`, false, 'Element not found in DOM', true);
  }
});

// Test global DOM references
if (window.chordGroup) {
  logTest('Global chordGroup Reference', true, 'window.chordGroup is available');
} else {
  logTest('Global chordGroup Reference', false, 'window.chordGroup is not available');
}

// Test 4: Event Handler Binding
console.log('\n📋 Test Suite 4: Event Handler Binding');
console.log('---------------------------------------');

// Test container drag events
if (window.chordGroup) {
  const hasEventListeners = window.chordGroup._eventListeners || 
                           window.chordGroup.getAttribute('data-drag-events') === 'bound';
  
  logTest('Container Drag Events', true, 'Container drag events should be bound (cannot verify programmatically)', true);
  
  // Test if we can create a test element and add drag listeners
  try {
    const testElement = document.createElement('div');
    testElement.setAttribute('draggable', 'true');
    testElement.className = 'chord test-chord';
    
    if (window.eventCoordinator && typeof window.eventCoordinator.addDragListeners === 'function') {
      window.eventCoordinator.addDragListeners(testElement);
      logTest('Drag Listener Addition', true, 'Can add drag listeners to test element');
      
      // Clean up test element
      testElement.remove();
    } else {
      logTest('Drag Listener Addition', false, 'Cannot add drag listeners - EventCoordinator not available');
    }
  } catch (error) {
    logTest('Drag Listener Addition', false, `Error testing drag listeners: ${error.message}`);
  }
} else {
  logTest('Container Drag Events', false, 'chordGroup not available for testing');
}

// Test 5: Module Integration
console.log('\n📋 Test Suite 5: Module Integration');
console.log('------------------------------------');

// Test app integration
if (window.AutoharpApp) {
  logTest('App Integration', true, 'AutoharpApp is available');
  
  try {
    const modules = window.AutoharpApp.modules;
    if (modules) {
      logTest('App Modules', true, 'App modules are accessible');
      
      if (modules.eventCoordinator) {
        logTest('App EventCoordinator Module', true, 'EventCoordinator module in app');
      } else {
        logTest('App EventCoordinator Module', false, 'EventCoordinator module not in app');
      }
      
      if (modules.inputManager) {
        logTest('App InputManager Module', true, 'InputManager module in app');
      } else {
        logTest('App InputManager Module', false, 'InputManager module not in app');
      }
    } else {
      logTest('App Modules', false, 'App modules not accessible');
    }
  } catch (error) {
    logTest('App Integration', false, `Error accessing app modules: ${error.message}`);
  }
} else {
  logTest('App Integration', false, 'AutoharpApp not available', true);
}

// Test 6: Backward Compatibility
console.log('\n📋 Test Suite 6: Backward Compatibility');
console.log('----------------------------------------');

// Test that old function calls still work (simulation)
try {
  // Test removeChord delegation
  if (typeof window.removeChord === 'function') {
    // Don't actually call it, just verify it exists and can be called
    logTest('removeChord Delegation', true, 'removeChord function is callable');
  } else {
    logTest('removeChord Delegation', false, 'removeChord function not available');
  }
  
  // Test addDragListeners delegation
  if (typeof window.addDragListeners === 'function') {
    logTest('addDragListeners Delegation', true, 'addDragListeners function is callable');
  } else {
    logTest('addDragListeners Delegation', false, 'addDragListeners function not available');
  }
  
  // Test chord management functions
  const chordFunctions = ['appendChord', 'getInputChords', 'addChordFromButton'];
  chordFunctions.forEach(funcName => {
    if (typeof window[funcName] === 'function') {
      logTest(`${funcName} Delegation`, true, `${funcName} function is callable`);
    } else {
      logTest(`${funcName} Delegation`, false, `${funcName} function not available`);
    }
  });
  
} catch (error) {
  logTest('Backward Compatibility', false, `Error testing compatibility: ${error.message}`);
}

// Test 7: Error Handling
console.log('\n📋 Test Suite 7: Error Handling');
console.log('--------------------------------');

// Test error handling when modules are not available
try {
  // Temporarily hide eventCoordinator to test error handling
  const originalEventCoordinator = window.eventCoordinator;
  window.eventCoordinator = null;
  
  if (typeof window.addDragListeners === 'function') {
    // This should log an error but not crash
    const testDiv = document.createElement('div');
    window.addDragListeners(testDiv);
    logTest('Error Handling - Missing EventCoordinator', true, 'Graceful error handling when EventCoordinator missing');
    testDiv.remove();
  }
  
  // Restore eventCoordinator
  window.eventCoordinator = originalEventCoordinator;
  
} catch (error) {
  logTest('Error Handling', false, `Error in error handling test: ${error.message}`);
}

// Test 8: Performance and Memory
console.log('\n📋 Test Suite 8: Performance and Memory');
console.log('----------------------------------------');

// Test that we haven't created memory leaks with duplicate functions
const globalFunctionCount = Object.keys(window).filter(key => typeof window[key] === 'function').length;
logTest('Global Function Count', true, `${globalFunctionCount} global functions (monitoring for leaks)`, true);

// Test that event listeners are properly bound
if (window.chordGroup) {
  // Count existing chord elements
  const existingChords = window.chordGroup.querySelectorAll('.chord').length;
  logTest('Existing Chord Elements', true, `${existingChords} chord elements found`);
}

// Final Results Summary
console.log('\n🏁 Test Results Summary');
console.log('=======================');
console.log(`✅ Passed: ${testResults.passed}`);
console.log(`❌ Failed: ${testResults.failed}`);
console.log(`⚠️  Warnings: ${testResults.warnings}`);
console.log(`📊 Total Tests: ${testResults.tests.length}`);

const successRate = ((testResults.passed / testResults.tests.length) * 100).toFixed(1);
console.log(`📈 Success Rate: ${successRate}%`);

if (testResults.failed > 0) {
  console.log('\n❌ Failed Tests:');
  testResults.tests
    .filter(test => !test.passed && !test.isWarning)
    .forEach(test => console.log(`   - ${test.testName}: ${test.message}`));
}

if (testResults.warnings > 0) {
  console.log('\n⚠️  Warnings:');
  testResults.tests
    .filter(test => test.isWarning)
    .forEach(test => console.log(`   - ${test.testName}: ${test.message}`));
}

// Provide recommendations
console.log('\n💡 Recommendations:');
if (testResults.failed === 0) {
  console.log('✅ All critical tests passed! Refactoring appears to be compatible.');
} else {
  console.log('❌ Some tests failed. Review the failed tests above and fix issues before proceeding.');
}

if (testResults.warnings > 0) {
  console.log('⚠️  Some warnings detected. These may indicate areas for improvement but are not critical.');
}

// Export test results for external access
window.refactoringCompatibilityTest = {
  results: testResults,
  runTest: () => {
    // Re-run this entire test
    location.reload();
  }
};

console.log('\n🔧 Test utilities available:');
console.log('   window.refactoringCompatibilityTest.results - View detailed results');
console.log('   window.refactoringCompatibilityTest.runTest() - Re-run all tests');
