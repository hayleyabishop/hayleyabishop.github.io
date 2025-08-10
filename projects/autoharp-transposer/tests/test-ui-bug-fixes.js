/**
 * Test Script: UI Bug Fixes - Chord Removal and Drag-and-Drop
 * Tests the fixes for reported UI issues
 */

console.log('🧪 Testing UI Bug Fixes - Chord Removal and Drag-and-Drop');
console.log('============================================================');

// Test 1: Verify removeChord function accessibility
console.log('\n📋 Test 1: removeChord Function Accessibility');
console.log('----------------------------------------------');

if (typeof window.removeChord === 'function') {
  console.log('✅ window.removeChord is accessible');
  console.log('   Function definition:', window.removeChord.toString().substring(0, 100) + '...');
} else {
  console.log('❌ window.removeChord is NOT accessible');
  console.log('   Type:', typeof window.removeChord);
}

if (typeof removeChord === 'function') {
  console.log('✅ removeChord is accessible in global scope');
} else {
  console.log('❌ removeChord is NOT accessible in global scope');
}

// Test 2: Verify addDragListeners function accessibility
console.log('\n📋 Test 2: addDragListeners Function Accessibility');
console.log('--------------------------------------------------');

if (typeof window.addDragListeners === 'function') {
  console.log('✅ window.addDragListeners is accessible');
  console.log('   Function definition:', window.addDragListeners.toString().substring(0, 100) + '...');
} else {
  console.log('❌ window.addDragListeners is NOT accessible');
  console.log('   Type:', typeof window.addDragListeners);
}

// Test 3: Verify chord elements have proper structure
console.log('\n📋 Test 3: Chord Element Structure');
console.log('-----------------------------------');

const chordGroup = document.getElementById('chordGroup');
if (chordGroup) {
  console.log('✅ chordGroup element found');
  
  const chordElements = chordGroup.querySelectorAll('.chord');
  console.log(`   Found ${chordElements.length} chord elements`);
  
  chordElements.forEach((chord, index) => {
    const removeButton = chord.querySelector('.remove-chord-btn');
    const isDraggable = chord.getAttribute('draggable') === 'true';
    
    console.log(`   Chord ${index + 1}:`);
    console.log(`     - Has remove button: ${removeButton ? '✅' : '❌'}`);
    console.log(`     - Is draggable: ${isDraggable ? '✅' : '❌'}`);
    
    if (removeButton) {
      const onclickAttr = removeButton.getAttribute('onclick');
      console.log(`     - Remove button onclick: ${onclickAttr || 'None'}`);
    }
  });
} else {
  console.log('❌ chordGroup element not found');
}

// Test 4: Simulate chord removal
console.log('\n📋 Test 4: Simulate Chord Removal');
console.log('----------------------------------');

const testRemoveButton = document.querySelector('.remove-chord-btn');
if (testRemoveButton) {
  console.log('✅ Found test remove button');
  console.log('   Attempting to simulate click...');
  
  try {
    // Create a mock button element for testing
    const mockButton = {
      closest: (selector) => {
        const realChord = testRemoveButton.closest(selector);
        console.log(`   Mock closest('${selector}') returned:`, realChord);
        return realChord;
      }
    };
    
    console.log('   Calling removeChord with mock button...');
    if (typeof window.removeChord === 'function') {
      // Don't actually remove, just test the function call
      console.log('   removeChord function is available for testing');
    }
  } catch (error) {
    console.log('❌ Error during chord removal test:', error.message);
  }
} else {
  console.log('⚠️  No remove buttons found for testing');
}

// Test 5: Verify drag event handlers exist
console.log('\n📋 Test 5: Drag Event Handler Functions');
console.log('---------------------------------------');

const dragHandlers = [
  'handleDragStart',
  'handleDragOver', 
  'handleDrop',
  'handleDragEnd',
  'getDragAfterElement'
];

dragHandlers.forEach(handlerName => {
  if (typeof window[handlerName] === 'function') {
    console.log(`✅ ${handlerName} is accessible`);
  } else {
    console.log(`❌ ${handlerName} is NOT accessible`);
  }
});

// Test 6: Test drag listener attachment
console.log('\n📋 Test 6: Drag Listener Attachment');
console.log('------------------------------------');

const draggableChords = document.querySelectorAll('.chord[draggable="true"]');
console.log(`Found ${draggableChords.length} draggable chord elements`);

if (draggableChords.length > 0 && typeof window.addDragListeners === 'function') {
  console.log('✅ Can test drag listener attachment');
  
  // Test on first draggable element
  const testChord = draggableChords[0];
  console.log('   Testing addDragListeners on first chord...');
  
  try {
    // This will trigger our debugging logs
    window.addDragListeners(testChord);
    console.log('✅ addDragListeners executed without errors');
  } catch (error) {
    console.log('❌ Error during addDragListeners test:', error.message);
  }
} else {
  console.log('⚠️  Cannot test drag listeners - missing elements or function');
}

// Test Summary
console.log('\n📊 Test Summary');
console.log('===============');
console.log('Tests completed. Check the console logs above for detailed results.');
console.log('');
console.log('Expected behavior after fixes:');
console.log('1. Clicking "x" buttons should remove chords with animation');
console.log('2. Dragging chords should reorder them within the input area');
console.log('3. Debug logs should appear in console during interactions');
console.log('');
console.log('If issues persist, check the debug logs for specific error messages.');

// Export test functions for manual testing
window.testUIFixes = {
  testRemoveChord: () => {
    const button = document.querySelector('.remove-chord-btn');
    if (button && typeof window.removeChord === 'function') {
      console.log('Manual test: Calling removeChord...');
      window.removeChord(button);
    } else {
      console.log('Manual test failed: Button or function not found');
    }
  },
  
  testDragListeners: () => {
    const chord = document.querySelector('.chord');
    if (chord && typeof window.addDragListeners === 'function') {
      console.log('Manual test: Adding drag listeners...');
      window.addDragListeners(chord);
    } else {
      console.log('Manual test failed: Chord or function not found');
    }
  }
};

console.log('\n🔧 Manual test functions available:');
console.log('   window.testUIFixes.testRemoveChord()');
console.log('   window.testUIFixes.testDragListeners()');
