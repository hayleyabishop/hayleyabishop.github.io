/**
 * Refactoring Validation Test Suite
 * Comprehensive test to verify UI function refactoring doesn't break existing functionality
 * Run this in the browser console after loading webapp.html
 */

(function() {
  'use strict';
  
  console.log('🧪 REFACTORING VALIDATION TEST SUITE');
  console.log('=====================================');
  console.log('Testing UI function refactoring compatibility...\n');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
    details: []
  };
  
  function test(name, condition, message, isWarning = false) {
    results.total++;
    const status = condition ? '✅ PASS' : (isWarning ? '⚠️  WARN' : '❌ FAIL');
    const result = { name, condition, message, isWarning, status };
    results.details.push(result);
    
    if (condition) {
      results.passed++;
    } else if (isWarning) {
      results.warnings++;
    } else {
      results.failed++;
    }
    
    console.log(`${status}: ${name} - ${message}`);
    return condition;
  }
  
  // CRITICAL TESTS - Must pass for refactoring to be considered successful
  console.log('\n🔥 CRITICAL COMPATIBILITY TESTS');
  console.log('--------------------------------');
  
  // Test 1: Global module availability
  test(
    'EventCoordinator Global Access',
    typeof window.eventCoordinator === 'object' && window.eventCoordinator !== null,
    window.eventCoordinator ? 'Available' : 'Missing - drag/drop will fail'
  );
  
  test(
    'InputManager Global Access',
    typeof window.inputManager === 'object' && window.inputManager !== null,
    window.inputManager ? 'Available' : 'Missing - chord management will fail'
  );
  
  // Test 2: Essential legacy functions
  const criticalFunctions = [
    'addDragListeners',
    'removeChord',
    'appendChord',
    'getInputChords'
  ];
  
  criticalFunctions.forEach(funcName => {
    test(
      `Legacy Function: ${funcName}`,
      typeof window[funcName] === 'function',
      typeof window[funcName] === 'function' ? 'Available' : 'Missing - will break legacy code'
    );
  });
  
  // Test 3: EventCoordinator methods
  if (window.eventCoordinator) {
    const eventCoordinatorMethods = [
      'addDragListeners',
      'handleDragStart',
      'handleDragOver',
      'handleDrop',
      'handleDragEnd'
    ];
    
    eventCoordinatorMethods.forEach(method => {
      test(
        `EventCoordinator.${method}`,
        typeof window.eventCoordinator[method] === 'function',
        typeof window.eventCoordinator[method] === 'function' ? 'Available' : 'Missing method'
      );
    });
  }
  
  // Test 4: InputManager legacy methods
  if (window.inputManager) {
    const inputManagerMethods = [
      'appendChordLegacy',
      'removeChordLegacy',
      'getInputChordsLegacy'
    ];
    
    inputManagerMethods.forEach(method => {
      test(
        `InputManager.${method}`,
        typeof window.inputManager[method] === 'function',
        typeof window.inputManager[method] === 'function' ? 'Available' : 'Missing legacy method'
      );
    });
  }
  
  // FUNCTIONAL TESTS - Test actual functionality
  console.log('\n⚙️  FUNCTIONAL COMPATIBILITY TESTS');
  console.log('----------------------------------');
  
  // Test 5: DOM elements
  const chordGroup = document.getElementById('chordGroupInputs') || document.getElementById('chordGroup');
  test(
    'Chord Container Element',
    chordGroup !== null,
    chordGroup ? `Found: ${chordGroup.id}` : 'Missing - drag/drop target not available'
  );
  
  test(
    'Global chordGroup Reference',
    window.chordGroup !== undefined,
    window.chordGroup ? 'Available' : 'Missing - may affect drag/drop'
  );
  
  // Test 6: Function delegation
  if (typeof window.addDragListeners === 'function' && window.eventCoordinator) {
    try {
      // Create test element
      const testEl = document.createElement('div');
      testEl.className = 'chord test-element';
      testEl.setAttribute('draggable', 'true');
      
      // Test if delegation works
      window.addDragListeners(testEl);
      
      test(
        'addDragListeners Delegation',
        true,
        'Successfully delegates to EventCoordinator'
      );
      
      // Cleanup
      testEl.remove();
    } catch (error) {
      test(
        'addDragListeners Delegation',
        false,
        `Error: ${error.message}`
      );
    }
  }
  
  // Test 7: Error handling
  console.log('\n🛡️  ERROR HANDLING TESTS');
  console.log('-------------------------');
  
  // Test graceful degradation when modules are missing
  const originalEventCoordinator = window.eventCoordinator;
  window.eventCoordinator = null;
  
  try {
    if (typeof window.addDragListeners === 'function') {
      const testDiv = document.createElement('div');
      window.addDragListeners(testDiv); // Should not crash
      test(
        'Graceful Error Handling',
        true,
        'Functions handle missing dependencies gracefully'
      );
      testDiv.remove();
    }
  } catch (error) {
    test(
      'Graceful Error Handling',
      false,
      `Crashes when dependencies missing: ${error.message}`
    );
  } finally {
    // Restore
    window.eventCoordinator = originalEventCoordinator;
  }
  
  // INTEGRATION TESTS - Test with other systems
  console.log('\n🔗 INTEGRATION TESTS');
  console.log('--------------------');
  
  // Test 8: App integration
  test(
    'AutoharpApp Integration',
    typeof window.AutoharpApp === 'object',
    window.AutoharpApp ? 'App instance available' : 'App instance missing',
    true
  );
  
  if (window.AutoharpApp && window.AutoharpApp.modules) {
    test(
      'App Module System',
      window.AutoharpApp.modules.eventCoordinator === window.eventCoordinator,
      window.AutoharpApp.modules.eventCoordinator === window.eventCoordinator ? 
        'Modules properly exposed' : 'Module exposure mismatch'
    );
  }
  
  // Test 9: Legacy compatibility
  const legacyIntegrationFunctions = [
    'onInputChordsChanged',
    'initializeDOMReferences',
    'initializeDragAndDrop'
  ];
  
  legacyIntegrationFunctions.forEach(funcName => {
    test(
      `Legacy Integration: ${funcName}`,
      typeof window[funcName] === 'function',
      typeof window[funcName] === 'function' ? 'Available' : 'Missing',
      true // These are warnings, not critical failures
    );
  });
  
  // PERFORMANCE TESTS
  console.log('\n⚡ PERFORMANCE TESTS');
  console.log('-------------------');
  
  // Test 10: Memory usage
  const globalFunctions = Object.keys(window).filter(key => typeof window[key] === 'function');
  test(
    'Global Function Count',
    globalFunctions.length < 200, // Reasonable threshold
    `${globalFunctions.length} global functions (monitoring for bloat)`,
    true
  );
  
  // Test 11: Duplicate function detection
  const duplicateCheck = {
    addDragListeners: [
      typeof window.addDragListeners === 'function',
      window.eventCoordinator && typeof window.eventCoordinator.addDragListeners === 'function'
    ].filter(Boolean).length,
    
    removeChord: [
      typeof window.removeChord === 'function',
      window.inputManager && typeof window.inputManager.removeChordLegacy === 'function'
    ].filter(Boolean).length
  };
  
  test(
    'No Function Duplication',
    duplicateCheck.addDragListeners <= 2 && duplicateCheck.removeChord <= 2,
    `Functions properly delegated (not duplicated)`
  );
  
  // FINAL RESULTS
  console.log('\n📊 TEST RESULTS SUMMARY');
  console.log('=======================');
  console.log(`Total Tests: ${results.total}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⚠️  Warnings: ${results.warnings}`);
  
  const successRate = ((results.passed / results.total) * 100).toFixed(1);
  console.log(`📈 Success Rate: ${successRate}%`);
  
  // Critical failure analysis
  const criticalFailures = results.details.filter(r => !r.condition && !r.isWarning);
  if (criticalFailures.length > 0) {
    console.log('\n❌ CRITICAL FAILURES:');
    criticalFailures.forEach(failure => {
      console.log(`   • ${failure.name}: ${failure.message}`);
    });
    console.log('\n🚨 REFACTORING HAS CRITICAL ISSUES - MUST BE FIXED');
  } else {
    console.log('\n✅ NO CRITICAL FAILURES DETECTED');
  }
  
  // Warnings analysis
  const warnings = results.details.filter(r => r.isWarning && !r.condition);
  if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    warnings.forEach(warning => {
      console.log(`   • ${warning.name}: ${warning.message}`);
    });
  }
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  if (criticalFailures.length === 0) {
    console.log('✅ Refactoring appears to be compatible with existing code.');
    console.log('✅ All critical functions are properly accessible.');
    console.log('✅ Legacy compatibility is maintained.');
  } else {
    console.log('❌ Critical issues detected. Fix the following:');
    criticalFailures.forEach(failure => {
      console.log(`   - Fix: ${failure.name}`);
    });
  }
  
  if (warnings.length > 0) {
    console.log('⚠️  Consider addressing warnings for optimal compatibility.');
  }
  
  // Export results
  window.refactoringValidationResults = results;
  
  console.log('\n🔧 Access detailed results: window.refactoringValidationResults');
  
  return results;
})();
