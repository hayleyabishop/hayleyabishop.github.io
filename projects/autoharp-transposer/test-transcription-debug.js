/**
 * Test script to debug chord progression transcription functionality
 * This will help identify why the transcription system is not working
 */

console.log('=== Transcription Debug Test ===');

// Wait for app to load
function runTranscriptionDebugTest() {
  try {
    console.log('\n1. Testing getInputChords() function...');
    
    // Check if getInputChords function exists
    if (typeof window.getInputChords === 'function') {
      const inputChords = window.getInputChords();
      console.log(`  ✓ getInputChords() exists and returns:`, inputChords);
      console.log(`  ✓ Number of input chords: ${inputChords.length}`);
    } else {
      console.log(`  ❌ getInputChords() function not found`);
      return;
    }
    
    console.log('\n2. Testing parseChordString() function...');
    
    // Test parseChordString with sample chords
    const testChords = ['C', 'Am', 'F', 'G'];
    
    if (typeof window.parseChordString === 'function') {
      console.log(`  ✓ parseChordString() function exists`);
      
      testChords.forEach(chord => {
        const parsed = window.parseChordString(chord);
        console.log(`  parseChordString("${chord}"):`, parsed);
      });
    } else {
      console.log(`  ❌ parseChordString() function not found`);
      return;
    }
    
    console.log('\n3. Testing calculateResultingChords() function...');
    
    if (typeof window.calculateResultingChords === 'function') {
      console.log(`  ✓ calculateResultingChords() function exists`);
      
      // Test with sample chord progression
      const testProgression = ['C', 'Am', 'F', 'G'];
      console.log(`  Testing with progression: ${testProgression.join(', ')}`);
      
      const results = window.calculateResultingChords(testProgression);
      console.log(`  Results:`, results);
      console.log(`  Number of transpositions found: ${results.length}`);
      
      if (results.length > 0) {
        console.log(`  ✓ Transcription working! Found ${results.length} valid transpositions`);
        results.forEach((result, i) => {
          console.log(`    Transposition ${i + 1} (+${result.transposition} semitones):`);
          result.chords.forEach(chord => {
            console.log(`      ${chord.original} → ${chord.transposed}`);
          });
        });
      } else {
        console.log(`  ❌ No transpositions found - transcription broken`);
      }
    } else {
      console.log(`  ❌ calculateResultingChords() function not found`);
      return;
    }
    
    console.log('\n4. Testing onInputChordsChanged() function...');
    
    if (typeof window.onInputChordsChanged === 'function') {
      console.log(`  ✓ onInputChordsChanged() function exists`);
      
      // Check if it's being called when chords are added
      const originalFunction = window.onInputChordsChanged;
      let callCount = 0;
      
      window.onInputChordsChanged = function() {
        callCount++;
        console.log(`  onInputChordsChanged() called (call #${callCount})`);
        return originalFunction.apply(this, arguments);
      };
      
      console.log(`  Monitoring onInputChordsChanged() calls...`);
      
      // Restore original function after test
      setTimeout(() => {
        window.onInputChordsChanged = originalFunction;
        console.log(`  Total onInputChordsChanged() calls during test: ${callCount}`);
      }, 5000);
      
    } else {
      console.log(`  ❌ onInputChordsChanged() function not found`);
    }
    
    console.log('\n5. Checking DOM elements...');
    
    // Check if chord display elements exist
    const chordGroup = document.getElementById('chordGroup');
    const chordGroupResults = document.getElementById('chordGroupResults');
    
    if (chordGroup) {
      console.log(`  ✓ chordGroup element found`);
      const chordElements = chordGroup.querySelectorAll('.chord span');
      console.log(`  Number of chord elements in DOM: ${chordElements.length}`);
      
      if (chordElements.length > 0) {
        console.log(`  Chord text content:`, Array.from(chordElements).map(el => el.textContent));
      }
    } else {
      console.log(`  ❌ chordGroup element not found`);
    }
    
    if (chordGroupResults) {
      console.log(`  ✓ chordGroupResults element found`);
      const resultElements = chordGroupResults.querySelectorAll('.chord');
      console.log(`  Number of result chord elements: ${resultElements.length}`);
    } else {
      console.log(`  ❌ chordGroupResults element not found`);
    }
    
    console.log('\n=== Transcription Debug Test Complete ===');
    
  } catch (error) {
    console.error('Error during transcription debug test:', error);
  }
}

// Run test when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(runTranscriptionDebugTest, 1000);
  });
} else {
  setTimeout(runTranscriptionDebugTest, 1000);
}
