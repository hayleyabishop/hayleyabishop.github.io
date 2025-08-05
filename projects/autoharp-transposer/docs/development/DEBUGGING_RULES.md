# JavaScript Debugging Rules & Best Practices

**Version:** 2.0  
**Created:** 2025-08-03  
**Based on:** Proven debugging strategies and lessons learned from failed debugging attempts

---

## 🚨 **CARDINAL RULES - NEVER VIOLATE**

### **Rule #1: Evidence Before Assumptions**
- **NEVER** assume you understand the problem without user validation
- **ALWAYS** gather actual error messages and console output first
- **NEVER** implement fixes based on code analysis alone
- **ALWAYS** ask user to reproduce the issue and report exact symptoms

### **Rule #2: User Validation at Every Step**
- **NEVER** declare a bug "fixed" without user confirmation
- **ALWAYS** test fixes in the user's actual environment
- **NEVER** rely solely on theoretical testing or static analysis
- **ALWAYS** establish clear success criteria with the user

### **Rule #3: Minimal Changes, Maximum Validation**
- **NEVER** implement multiple fixes simultaneously
- **ALWAYS** make one small change at a time
- **NEVER** over-engineer solutions without confirming root cause
- **ALWAYS** validate each change works before proceeding

### **Rule #4: Beware of False Negatives**
- **NEVER** assume something is broken just because expected output is missing
- **ALWAYS** test actual functionality, not just logging or visual indicators
- **NEVER** declare failure based on missing console messages alone
- **ALWAYS** verify the core functionality works as intended

---

## 🔍 **EVIDENCE-BASED DEBUGGING PROTOCOL**

### **Phase 1: Evidence Gathering (MANDATORY)**
1. a. **Try to gather evidence without user interaction**
   - Test the app myself first, if possible.
   - If not possible, go to 1. b.  
1. b. **Ask user to reproduce the issue**
   - "Please try [specific action] and tell me exactly what happens"
   - "Are there any error messages in the browser console (F12)?"
   - "Which browser and version are you using?"

2. **Gather concrete evidence**
   - Exact error messages (copy/paste)
   - Console output and stack traces
   - Browser network tab for failed requests
   - User's specific steps to reproduce

3. **Validate your understanding**
   - "So when you click X, Y happens instead of Z - is that correct?"
   - "Let me confirm I understand the issue correctly..."

4. **Use prioritized investigation approach**
   - Start with easiest checks first (file existence, syntax errors)
   - Progress to medium difficulty (console errors, network issues)
   - End with hardest checks (complex logic, timing issues)
   - Document findings at each level before proceeding

### **Phase 2: Hypothesis Formation**
1. **Form hypothesis based on evidence** (not code analysis)
2. **Test core functionality before investigating symptoms**
   - Verify the actual feature works, not just its indicators
   - Check global object accessibility before assuming module loading failed
   - Test functional behavior before worrying about missing logs or messages
3. **Consider false negatives in evidence**
   - Missing console output doesn't always mean failure
   - Absent visual indicators may not reflect actual functionality
   - Timing issues can hide successful operations
2. **Start with simplest possible explanation**
3. **Consider multiple potential causes**
4. **Prioritize hypotheses by likelihood and impact**

### **Phase 3: Minimal Testing**
1. **Design minimal test to validate hypothesis**
2. **Ask user to perform simple diagnostic steps**
3. **Add minimal debugging (single console.log)**
4. **Verify hypothesis before implementing fix**

### **Phase 4: Incremental Fixing**
1. **Implement smallest possible fix**
2. **Ask user to test immediately**
3. **Confirm fix works before adding complexity**
4. **Document what worked and why**

---

## 🎯 **SPECIFIC DEBUGGING STRATEGIES**

### **For "Function Not Working" Issues**

#### **Step 1: Verify Function Existence**
```javascript
// Ask user to run in console:
console.log('Function type:', typeof functionName);
console.log('Window function type:', typeof window.functionName);
```

#### **Step 2: Verify Function is Called**
```javascript
// Add minimal debugging:
function problematicFunction() {
  console.log('[DEBUG] Function called with args:', arguments);
  // ... rest of function
}
```

#### **Step 3: Trace Execution Path**
- Add console.log at entry point
- Add console.log at key decision points
- Add console.log at exit point
- Ask user to perform action and report logs

### **For Event Handler Issues**

#### **Step 1: Verify Event Binding**
```javascript
// Ask user to run in console:
const element = document.querySelector('.target-element');
console.log('Element found:', element);
console.log('Event listeners:', getEventListeners(element)); // Chrome only
```

#### **Step 2: Test Event Firing**
```javascript
// Add to event handler:
function eventHandler(e) {
  console.log('[DEBUG] Event fired:', e.type, e.target);
  // ... rest of handler
}
```

#### **Step 3: Check for Event Conflicts**
- Search for duplicate event handlers
- Check for preventDefault() calls
- Verify event bubbling/capturing

### **For DOM Manipulation Issues**

#### **Step 1: Verify Element Existence**
```javascript
// Ask user to run in console:
const target = document.querySelector('.target');
console.log('Target element:', target);
console.log('Parent element:', target?.parentElement);
```

#### **Step 2: Check Element State**
```javascript
// Add debugging:
console.log('[DEBUG] Element classes:', element.className);
console.log('[DEBUG] Element attributes:', element.attributes);
console.log('[DEBUG] Element style:', element.style.cssText);
```

---

## 🚫 **ANTI-PATTERNS TO AVOID**

### **Never Do This:**
1. **Assumption-Based Fixes**
   - ❌ "The function probably isn't in global scope, so I'll add window.func = func"
   - ✅ "Let's first check if the function is being called at all"

2. **Over-Engineering Without Evidence**
   - ❌ Adding complex error handling before confirming the actual error
   - ✅ Adding simple console.log to see what's actually happening

3. **Multiple Simultaneous Changes**
   - ❌ Fixing scope, adding error handling, and refactoring all at once
   - ✅ Fix one thing, test, then move to next issue

4. **Theoretical Testing Only**
   - ❌ "My test script shows it should work"
   - ✅ "Does it work when you try it in your browser?"

### **Red Flags in Your Own Debugging:**
- You haven't asked the user to test anything yet
- You're implementing fixes based on code analysis alone
- You're adding debugging to multiple functions simultaneously
- You're confident about the solution without user validation
- You're creating complex test scripts before simple validation

---

## 🧪 **VALIDATION CHECKLIST**

### **Before Implementing Any Fix:**
- [ ] User has confirmed the exact symptoms
- [ ] I have actual error messages or console output
- [ ] I understand the user's environment (browser, etc.)
- [ ] I have a specific, testable hypothesis
- [ ] I know exactly what "success" looks like

### **Before Declaring Fix Complete:**
- [ ] User has tested the fix in their environment
- [ ] User confirms the issue is resolved
- [ ] No new issues were introduced
- [ ] Debugging code has been cleaned up (if appropriate)
- [ ] Fix is documented for future reference

### **Red Flags - Stop and Reassess:**
- [ ] User reports issue still exists after your "fix"
- [ ] You haven't gotten user feedback in multiple debugging steps
- [ ] You're adding more complexity without solving core issue
- [ ] You're confident but user experience doesn't match

---

## 🎯 **COMMUNICATION PROTOCOLS**

### **When Starting Debugging:**
- "Let me help you debug this. First, could you try [specific action] and tell me exactly what happens?"
- "Are there any error messages in the browser console when you do this?"
- "Let's start by gathering some evidence about what's actually happening."

### **When Proposing a Fix:**
- "Based on the evidence, I think the issue might be X. Let's test this hypothesis by..."
- "I'd like to add a simple debug line to see if the function is being called. Could you..."
- "Before implementing a fix, let's confirm my understanding is correct..."

### **When Testing Fixes:**
- "I've made a small change. Could you test it and let me know if it works?"
- "Please try the action again and tell me if you see any console messages."
- "Does this resolve the issue, or are you still experiencing the same problem?"

### **When Debugging Fails:**
- "It seems my approach isn't working. Let me step back and gather more evidence."
- "I may have made incorrect assumptions. Could you help me understand what's actually happening?"
- "Let's try a different approach based on what we've learned."

---

## 📚 **INTEGRATION WITH EXISTING PRACTICES**

### **From Memory: Pre-Fix Validation Checklist**
1. **Search for duplicate method definitions** - Still valid, but do AFTER evidence gathering
2. **Verify method execution path** - Enhanced with user validation requirement
3. **Check for method override patterns** - Part of hypothesis formation phase
4. **Validate context and scope** - Must be based on actual evidence, not assumptions

### **From Memory: Systematic Debugging Checklist**
1. **Always trace the complete data flow** - But start with user-reported symptoms
2. **Test the actual user-facing behavior** - This is now Rule #2
3. **Use grep_search to find all code paths** - After evidence gathering phase
4. **Create comprehensive test suites** - Only after confirming fixes work for user

### **From Memory: JavaScript Debugging Strategy Guide**
- **"When User Reports 'Input X Becomes Y' Issues"** - Enhanced with evidence-first approach
- **"FIRST: Check for Duplicate Methods"** - Now "FIRST: Gather Evidence from User"
- **"SECOND: Trace Data Flow with Debugging"** - Now includes user validation at each step

---

## 🔄 **CONTINUOUS IMPROVEMENT**

### **After Each Debugging Session:**
1. **Document what worked and what didn't**
2. **Note any assumptions that proved incorrect**
3. **Update debugging approach based on lessons learned**
4. **Share insights with team/future debugging efforts**

### **Regular Review:**
- Are we following evidence-based debugging?
- Are we validating with users at each step?
- Are we making minimal changes and testing incrementally?
- Are we learning from debugging failures?

---

## 🎖️ **SUCCESS METRICS**

### **Good Debugging Session:**
- User confirms issue is resolved
- Root cause was correctly identified
- Fix was minimal and targeted
- No new issues were introduced
- Process was efficient and collaborative

### **Failed Debugging Session:**
- User reports issue persists after "fix"
- Multiple assumptions proved incorrect
- Over-engineered solution for simple problem
- User had to correct your understanding multiple times
- Debugging took much longer than necessary

---

**Remember: The goal is not to demonstrate debugging knowledge, but to solve the user's actual problem efficiently and reliably.**
