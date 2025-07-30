// =============================================================================
// TEST: DUPLICATE CHORD ADDITION
// Verify that duplicate chords can now be added after removing prevention logic
// =============================================================================

console.log('🧪 Testing Duplicate Chord Addition...');

// Test setup
function testDuplicateChordAddition() {
  try {
    // Import required modules
    const { ChordParser } = await import('./modules/chordParser.js');
    const { InputManager } = await import('./modules/inputManager.js');
    const { AudioManager } = await import('./modules/audioManager.js');
    
    // Initialize components
    const availableChords = ['A', 'Am', 'B', 'Bm', 'C', 'Cm', 'D', 'Dm', 'E', 'Em', 'F', 'Fm', 'G', 'Gm'];
    const chordParser = new ChordParser(availableChords);
    const audioManager = new AudioManager();
    const inputManager = new InputManager(audioManager, chordParser);
    
    console.log('✅ Components initialized successfully');
    
    // Test 1: Add initial chord
    console.log('\n📝 Test 1: Adding initial A chord...');
    const result1 = inputManager.addChord('A', 'test');
    console.log(`Result: ${result1}`);
    console.log(`Selected chords: [${inputManager.selectedChords.join(', ')}]`);
    
    // Test 2: Add duplicate chord (should work now)
    console.log('\n📝 Test 2: Adding duplicate A chord...');
    const result2 = inputManager.addChord('A', 'test');
    console.log(`Result: ${result2}`);
    console.log(`Selected chords: [${inputManager.selectedChords.join(', ')}]`);
    
    // Test 3: Add another duplicate
    console.log('\n📝 Test 3: Adding third A chord...');
    const result3 = inputManager.addChord('A', 'test');
    console.log(`Result: ${result3}`);
    console.log(`Selected chords: [${inputManager.selectedChords.join(', ')}]`);
    
    // Test 4: Add different chord
    console.log('\n📝 Test 4: Adding different chord (C)...');
    const result4 = inputManager.addChord('C', 'test');
    console.log(`Result: ${result4}`);
    console.log(`Selected chords: [${inputManager.selectedChords.join(', ')}]`);
    
    // Test 5: Add duplicate C
    console.log('\n📝 Test 5: Adding duplicate C chord...');
    const result5 = inputManager.addChord('C', 'test');
    console.log(`Result: ${result5}`);
    console.log(`Selected chords: [${inputManager.selectedChords.join(', ')}]`);
    
    // Analyze results
    console.log('\n🔍 ANALYSIS:');
    console.log(`Total chords added: ${inputManager.selectedChords.length}`);
    console.log(`Expected: 5 chords (A, A, A, C, C)`);
    console.log(`Actual: [${inputManager.selectedChords.join(', ')}]`);
    
    if (inputManager.selectedChords.length === 5) {
      console.log('✅ SUCCESS: Duplicate chords are now allowed!');
      return true;
    } else {
      console.log('❌ FAILURE: Duplicate prevention is still active');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    return false;
  }
}

// Run test when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', testDuplicateChordAddition);
} else {
  testDuplicateChordAddition();
}

// Also export for manual testing
window.testDuplicateChordAddition = testDuplicateChordAddition;
