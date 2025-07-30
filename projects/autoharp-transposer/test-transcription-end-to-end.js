/**
 * End-to-end test for chord progression transcription
 * This will add chords through the UI and verify transcription results appear
 */

console.log('=== End-to-End Transcription Test ===');

function runEndToEndTest() {
  try {
    console.log('\n1. Adding chords through the UI...');
    
    // Get the app instance
    if (!window.app || !window.app.inputManager) {
      console.log('❌ App or inputManager not available');
      return;
    }
    
    // Add a test progression: C - Am - F - G
    const testChords = ['C', 'Am', 'F', 'G'];
    
    testChords.forEach((chord, i) => {
      console.log(`  Adding chord ${i + 1}: ${chord}`);
      window.app.inputManager.addChord(chord, 'end-to-end-test');
    });
    
    // Wait a moment for UI to update
    setTimeout(() => {
      console.log('\n2. Checking DOM structure...');
      
      // Check if chords appear in chordGroupInputs
      const chordGroupInputs = document.getElementById('chordGroupInputs');
      if (chordGroupInputs) {
        console.log('✓ chordGroupInputs element found');
        
        const chordElements = chordGroupInputs.querySelectorAll('.chord');
        console.log(`  Number of .chord elements: ${chordElements.length}`);
        
        const chordSpans = chordGroupInputs.querySelectorAll('.chord span');
        console.log(`  Number of .chord span elements: ${chordSpans.length}`);
        
        if (chordSpans.length > 0) {
          const chordTexts = Array.from(chordSpans).map(span => span.textContent);
          console.log(`  Chord texts: [${chordTexts.join(', ')}]`);
        }
      } else {
        console.log('❌ chordGroupInputs element not found');
      }
      
      console.log('\n3. Testing getInputChords() function...');
      
      if (typeof window.getInputChords === 'function') {
        const inputChords = window.getInputChords();
        console.log(`  getInputChords() returned: [${inputChords.join(', ')}]`);
        console.log(`  Number of input chords: ${inputChords.length}`);
        
        if (inputChords.length > 0) {
          console.log('✓ Input chords detected by legacy system');
          
          console.log('\n4. Testing transcription calculation...');
          
          if (typeof window.calculateResultingChords === 'function') {
            const results = window.calculateResultingChords(inputChords);
            console.log(`  Number of transpositions found: ${results.length}`);
            
            if (results.length > 0) {
              console.log('✓ Transcription working! Results:');
              results.forEach((result, i) => {
                console.log(`    Transposition ${i + 1} (+${result.transposition} semitones):`);
                result.chords.forEach(chord => {
                  console.log(`      ${chord.original} → ${chord.transposed}`);
                });
              });
            } else {
              console.log('❌ No transcription results found');
            }
          } else {
            console.log('❌ calculateResultingChords function not found');
          }
        } else {
          console.log('❌ No input chords detected by legacy system');
        }
      } else {
        console.log('❌ getInputChords function not found');
      }
      
      console.log('\n5. Checking results display...');
      
      const chordGroupResults = document.getElementById('chordGroupResults');
      if (chordGroupResults) {
        console.log('✓ chordGroupResults element found');
        
        const resultChords = chordGroupResults.querySelectorAll('.chord');
        console.log(`  Number of result chord elements: ${resultChords.length}`);
        
        if (resultChords.length > 0) {
          console.log('✓ Transcription results are displayed in UI');
        } else {
          console.log('❌ No transcription results displayed in UI');
        }
      } else {
        console.log('❌ chordGroupResults element not found');
      }
      
      console.log('\n6. Triggering onInputChordsChanged manually...');
      
      if (typeof window.onInputChordsChanged === 'function') {
        console.log('  Calling onInputChordsChanged()...');
        window.onInputChordsChanged();
        
        // Check results again after manual trigger
        setTimeout(() => {
          const resultChordsAfter = chordGroupResults ? chordGroupResults.querySelectorAll('.chord').length : 0;
          console.log(`  Result chord elements after manual trigger: ${resultChordsAfter}`);
          
          if (resultChordsAfter > 0) {
            console.log('✓ Manual trigger worked - results now displayed');
          } else {
            console.log('❌ Manual trigger did not produce results');
          }
          
          console.log('\n=== End-to-End Test Complete ===');
          
          // Clean up
          if (window.app && window.app.stateManager) {
            window.app.stateManager.clearSelectedChords();
            console.log('Cleaned up test chords');
          }
        }, 500);
      } else {
        console.log('❌ onInputChordsChanged function not found');
        console.log('\n=== End-to-End Test Complete ===');
      }
      
    }, 500);
    
  } catch (error) {
    console.error('Error during end-to-end test:', error);
  }
}

// Run test when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(runEndToEndTest, 2000);
  });
} else {
  setTimeout(runEndToEndTest, 2000);
}
