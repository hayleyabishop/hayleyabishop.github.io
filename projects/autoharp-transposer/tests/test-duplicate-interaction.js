// =============================================================================
// INTERACTIVE DUPLICATE CHORD TEST
// Test duplicate chord functionality through browser automation
// =============================================================================

console.log('🧪 Starting Interactive Duplicate Chord Test...');

// Test function to simulate user interactions
function testDuplicateChordInteraction() {
  console.log('📝 Test: Adding duplicate A chords through UI interaction');
  
  // Get the text input element
  const textInput = document.getElementById('chordTextInput');
  if (!textInput) {
    console.error('❌ Could not find chordTextInput element');
    return false;
  }
  
  // Get the chord display container
  const chordContainer = document.getElementById('chordGroupInputs');
  if (!chordContainer) {
    console.error('❌ Could not find chordGroupInputs element');
    return false;
  }
  
  console.log('✅ Found required DOM elements');
  
  // Function to get current chord count
  function getCurrentChordCount() {
    const chordElements = chordContainer.querySelectorAll('.chord-display');
    return chordElements.length;
  }
  
  // Function to get current chord list
  function getCurrentChords() {
    const chordElements = chordContainer.querySelectorAll('.chord-display .chord-name');
    return Array.from(chordElements).map(el => el.textContent);
  }
  
  // Test Step 1: Add first A chord
  console.log('\n📝 Step 1: Adding first A chord...');
  const initialCount = getCurrentChordCount();
  console.log(`Initial chord count: ${initialCount}`);
  
  // Type 'A' in input
  textInput.value = 'A';
  textInput.dispatchEvent(new Event('input', { bubbles: true }));
  
  // Wait for suggestions to appear, then press Enter
  setTimeout(() => {
    console.log('Pressing Enter to add first A chord...');
    const enterEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      code: 'Enter',
      bubbles: true
    });
    textInput.dispatchEvent(enterEvent);
    
    // Check result after a short delay
    setTimeout(() => {
      const countAfterFirst = getCurrentChordCount();
      const chordsAfterFirst = getCurrentChords();
      console.log(`Chord count after first A: ${countAfterFirst}`);
      console.log(`Chords after first A: [${chordsAfterFirst.join(', ')}]`);
      
      if (countAfterFirst > initialCount) {
        console.log('✅ First A chord added successfully');
        
        // Test Step 2: Add duplicate A chord
        console.log('\n📝 Step 2: Adding duplicate A chord...');
        
        // Type 'A' again
        textInput.value = 'A';
        textInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Wait for suggestions, then press Enter
        setTimeout(() => {
          console.log('Pressing Enter to add duplicate A chord...');
          const enterEvent2 = new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            bubbles: true
          });
          textInput.dispatchEvent(enterEvent2);
          
          // Check final result
          setTimeout(() => {
            const finalCount = getCurrentChordCount();
            const finalChords = getCurrentChords();
            console.log(`Final chord count: ${finalCount}`);
            console.log(`Final chords: [${finalChords.join(', ')}]`);
            
            // Analyze results
            console.log('\n🔍 ANALYSIS:');
            console.log(`Initial count: ${initialCount}`);
            console.log(`After first A: ${countAfterFirst}`);
            console.log(`After duplicate A: ${finalCount}`);
            
            if (finalCount === countAfterFirst + 1) {
              console.log('✅ SUCCESS: Duplicate A chord was added!');
              console.log('✅ Duplicate prevention has been successfully removed');
              return true;
            } else if (finalCount === countAfterFirst) {
              console.log('❌ FAILURE: Duplicate A chord was NOT added');
              console.log('❌ Duplicate prevention is still active');
              return false;
            } else {
              console.log('⚠️ UNEXPECTED: Unexpected chord count change');
              return false;
            }
          }, 500);
        }, 200);
      } else {
        console.log('❌ First A chord was not added - test cannot continue');
        return false;
      }
    }, 500);
  }, 200);
}

// Run the test
testDuplicateChordInteraction();

// Also make it available globally for manual testing
window.testDuplicateChordInteraction = testDuplicateChordInteraction;
