// =============================================================================
// INTEGRATION TEST SCRIPT
// Simple test to verify the modular integration is working
// =============================================================================

function testIntegration() {
  console.log('=== Testing Autoharp Transposer Integration ===');
  
  // Test 1: Check if integration bridge is available
  console.log('1. Testing integration bridge...');
  if (window.integrationBridge) {
    console.log('✓ Integration bridge is available');
    
    // Test chord data
    const chords21 = window.integrationBridge.getAvailableChordsForType('type21Chord');
    console.log('✓ 21-chord autoharp chords:', chords21.length, 'chords');
    console.log('  Sample chords:', chords21.slice(0, 5));
    
    if (chords21.length === 0) {
      console.error('✗ No chords available - integration issue!');
    }
  } else {
    console.error('✗ Integration bridge not found');
  }
  
  // Test 2: Check if app instance is available
  console.log('\n2. Testing app instance...');
  if (window.AutoharpApp) {
    console.log('✓ App instance is available');
    
    const state = window.AutoharpApp.getState();
    console.log('✓ App state:', {
      autoharpType: state.autoharpType,
      availableChords: state.availableChords.length,
      selectedChords: state.selectedChords.length,
      audioEnabled: state.audioEnabled
    });
    
    if (state.availableChords.length === 0) {
      console.error('✗ No available chords in app state - integration issue!');
    }
  } else {
    console.error('✗ App instance not found');
  }
  
  // Test 3: Check if legacy functions are available
  console.log('\n3. Testing legacy functions...');
  const legacyFunctions = ['selectChordName', 'selectChordType', 'onChordTypeChanged'];
  legacyFunctions.forEach(funcName => {
    if (window[funcName]) {
      console.log(`✓ ${funcName} is available`);
    } else {
      console.warn(`⚠ ${funcName} not found`);
    }
  });
  
  // Test 4: Test chord input functionality
  console.log('\n4. Testing chord input...');
  if (window.AutoharpApp) {
    try {
      // Test adding a chord
      const success = window.AutoharpApp.addChord('C', 'test');
      if (success) {
        console.log('✓ Successfully added chord C');
        
        // Test getting selected chords
        const selected = window.AutoharpApp.getSelectedChords();
        console.log('✓ Selected chords:', selected);
        
        // Clean up
        window.AutoharpApp.clearAllChords();
        console.log('✓ Cleared chords');
      } else {
        console.error('✗ Failed to add chord');
      }
    } catch (error) {
      console.error('✗ Error testing chord input:', error);
    }
  }
  
  // Test 5: Test UI elements
  console.log('\n5. Testing UI elements...');
  const uiElements = [
    'chordTextInput',
    'addChordBtn', 
    'soundToggle',
    'chordSuggestions',
    'clearAllChords'
  ];
  
  uiElements.forEach(elementId => {
    const element = document.getElementById(elementId);
    if (element) {
      console.log(`✓ ${elementId} element found`);
    } else {
      console.warn(`⚠ ${elementId} element not found`);
    }
  });
  
  console.log('\n=== Integration Test Complete ===');
}

// Run test when everything is loaded
function runTestWhenReady() {
  if (window.AutoharpApp && window.integrationBridge) {
    testIntegration();
  } else {
    console.log('Waiting for app to initialize...');
    setTimeout(runTestWhenReady, 500);
  }
}

// Auto-run test
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(runTestWhenReady, 1000);
  });
} else {
  setTimeout(runTestWhenReady, 1000);
}

// Make test function available globally
window.testIntegration = testIntegration;
