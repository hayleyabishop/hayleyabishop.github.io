/**
 * Debug script to trace the complete input flow when typing "b" and hitting Enter
 * This will help identify where suggestions are still appearing after submission
 */

console.log('=== Input Flow Debug Test ===');

function addInputFlowDebugging() {
  try {
    // Get the text input element
    const textInput = document.getElementById('chordTextInput');
    const suggestionsContainer = document.getElementById('chordSuggestions');
    
    if (!textInput || !suggestionsContainer) {
      console.log('❌ Required elements not found');
      return;
    }
    
    console.log('✓ Found input elements, adding debug listeners...');
    
    // Track all input events
    textInput.addEventListener('input', (e) => {
      console.log(`[INPUT EVENT] Value: "${e.target.value}", Suggestions visible: ${suggestionsContainer.style.display !== 'none'}`);
    });
    
    textInput.addEventListener('keydown', (e) => {
      console.log(`[KEYDOWN] Key: "${e.key}", Value: "${e.target.value}", Suggestions visible: ${suggestionsContainer.style.display !== 'none'}`);
    });
    
    textInput.addEventListener('keyup', (e) => {
      console.log(`[KEYUP] Key: "${e.key}", Value: "${e.target.value}", Suggestions visible: ${suggestionsContainer.style.display !== 'none'}`);
    });
    
    textInput.addEventListener('focus', (e) => {
      console.log(`[FOCUS] Value: "${e.target.value}", Suggestions visible: ${suggestionsContainer.style.display !== 'none'}`);
    });
    
    textInput.addEventListener('blur', (e) => {
      console.log(`[BLUR] Value: "${e.target.value}", Suggestions visible: ${suggestionsContainer.style.display !== 'none'}`);
    });
    
    // Monitor suggestions container changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          const isVisible = suggestionsContainer.style.display !== 'none';
          console.log(`[SUGGESTIONS DISPLAY CHANGE] Now visible: ${isVisible}`);
          if (isVisible) {
            const suggestions = suggestionsContainer.querySelectorAll('.suggestion-item');
            console.log(`  Number of suggestions: ${suggestions.length}`);
            if (suggestions.length > 0) {
              const suggestionTexts = Array.from(suggestions).map(s => s.textContent);
              console.log(`  Suggestions: [${suggestionTexts.join(', ')}]`);
            }
          }
        }
        
        if (mutation.type === 'childList') {
          console.log(`[SUGGESTIONS CONTENT CHANGE] Children added/removed`);
          const suggestions = suggestionsContainer.querySelectorAll('.suggestion-item');
          console.log(`  Current suggestion count: ${suggestions.length}`);
        }
      });
    });
    
    observer.observe(suggestionsContainer, {
      attributes: true,
      childList: true,
      subtree: true
    });
    
    // Hook into EventCoordinator methods if available
    if (window.app && window.app.eventCoordinator) {
      const eventCoordinator = window.app.eventCoordinator;
      
      // Wrap handleTextInput
      const originalHandleTextInput = eventCoordinator.handleTextInput;
      eventCoordinator.handleTextInput = function(value) {
        console.log(`[EventCoordinator.handleTextInput] Called with: "${value}"`);
        const result = originalHandleTextInput.call(this, value);
        console.log(`[EventCoordinator.handleTextInput] Completed`);
        return result;
      };
      
      // Wrap handleTextInputSubmit
      const originalHandleTextInputSubmit = eventCoordinator.handleTextInputSubmit;
      eventCoordinator.handleTextInputSubmit = function(value) {
        console.log(`[EventCoordinator.handleTextInputSubmit] Called with: "${value}"`);
        console.log(`[EventCoordinator.handleTextInputSubmit] justSubmitted flag before: ${this.justSubmitted}`);
        const result = originalHandleTextInputSubmit.call(this, value);
        console.log(`[EventCoordinator.handleTextInputSubmit] justSubmitted flag after: ${this.justSubmitted}`);
        console.log(`[EventCoordinator.handleTextInputSubmit] Completed`);
        return result;
      };
      
      // Wrap clearSuggestions
      const originalClearSuggestions = eventCoordinator.clearSuggestions;
      eventCoordinator.clearSuggestions = function() {
        console.log(`[EventCoordinator.clearSuggestions] Called`);
        const result = originalClearSuggestions.call(this);
        console.log(`[EventCoordinator.clearSuggestions] Suggestions now visible: ${suggestionsContainer.style.display !== 'none'}`);
        return result;
      };
      
      // Wrap updateSuggestions
      const originalUpdateSuggestions = eventCoordinator.updateSuggestions;
      eventCoordinator.updateSuggestions = function(input) {
        console.log(`[EventCoordinator.updateSuggestions] Called with: "${input}"`);
        const result = originalUpdateSuggestions.call(this, input);
        console.log(`[EventCoordinator.updateSuggestions] Completed, suggestions visible: ${suggestionsContainer.style.display !== 'none'}`);
        return result;
      };
      
      console.log('✓ EventCoordinator methods wrapped for debugging');
    } else {
      console.log('⚠ EventCoordinator not available for method wrapping');
    }
    
    console.log('\n📝 Instructions:');
    console.log('1. Type "b" in the input field');
    console.log('2. Hit Enter quickly');
    console.log('3. Watch the console logs to see the exact flow');
    console.log('4. Look for when suggestions appear/disappear');
    
  } catch (error) {
    console.error('Error setting up input flow debugging:', error);
  }
}

// Run when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(addInputFlowDebugging, 1500);
  });
} else {
  setTimeout(addInputFlowDebugging, 1500);
}
