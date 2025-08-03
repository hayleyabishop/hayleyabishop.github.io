# JavaScript Debugging Rules Reference

## General Principles
- Always gather concrete evidence before making any changes
- Validate all assumptions with user confirmation
- Make minimal, focused changes and test each one
- Document all debugging steps and decisions

## Code Style & Structure
- Keep debugging code minimal and focused
- Remove or comment out debug logs before finalizing changes
- Use consistent debug message formatting (e.g., `[DEBUG]` prefix)
- Place debug code as close to the issue as possible

## Error Handling
- Always check for and handle potential errors
- Log meaningful error messages with context
- Use try-catch blocks for operations that might fail
- Validate function arguments and return values

## Testing & Validation
- Test changes in the actual user environment
- Verify fixes with the user before considering an issue resolved
- Check for regressions in related functionality
- Document test cases and expected outcomes

## Common Pitfalls to Avoid
- Making assumptions without evidence
- Implementing multiple changes at once
- Over-engineering solutions
- Relying on theoretical testing only
- Skipping user validation

## Best Practices
- Use console.log strategically for debugging
- Leverage browser developer tools
- Keep track of debugging sessions
- Document findings and solutions
- Share knowledge with the team

## When to Ask for Help
- After exhausting all evidence-based approaches
- When encountering unfamiliar error patterns
- When changes have unexpected side effects
- When the root cause remains unclear after investigation
