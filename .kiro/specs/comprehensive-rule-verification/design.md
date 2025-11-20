# Design Document: Comprehensive Rule Verification Test Suite

## Overview

This design specifies a comprehensive test file that verifies all ESLint rules in the @vertex-era/eslint-rules package work correctly in isolation. The test suite will be organized by rule category and will test both violation detection and valid code acceptance for each rule.

The test file will serve as both a verification tool for package maintainers and living documentation showing examples of what each rule catches and allows.

## Architecture

### Test Structure

The test suite will be organized hierarchically:

```
Comprehensive Rule Verification Test Suite
├── Error-Level Rules
│   ├── Console Statements
│   ├── Unused Variables
│   ├── Direct Redux Hooks
│   ├── Type Import Syntax
│   ├── Any Type Usage
│   ├── Import Order
│   ├── Naming Conventions
│   └── Unused Modules
├── Custom Plugin Rules
│   ├── JSX Rules (inline objects, inline functions)
│   ├── Component Rules (one per file)
│   ├── Icon Rules (memoization, currentColor, one per file)
│   ├── Form Rules (config extraction)
│   ├── Error Handling Rules (no empty catch)
│   ├── Readability Rules (no nested ternary)
│   └── Service Rules (no response.data return)
├── Warning-Level Rules
│   └── Non-null Assertions
└── Allowed Patterns
    ├── React JSX Transform
    ├── Proper Import Structure
    ├── Ignored Variables
    └── Valid Patterns
```

### Testing Approach

Each rule will be tested using the existing `runRule` utility from `test-utils.ts`. This utility:
- Creates an isolated ESLint linter instance
- Configures only the specific rule being tested
- Returns violation messages for assertion

For each rule, we will test:
1. **Violation cases**: Code that should trigger the rule
2. **Valid cases**: Code that should pass the rule
3. **Edge cases**: Boundary conditions and special scenarios

## Components and Interfaces

### Test File Structure

```typescript
// comprehensive-rules.test.ts
import { describe, expect, it } from 'vitest';
import { runRule } from './test-utils';
import plugin from './src/plugin';

// Test suite organized by rule category
describe('Comprehensive Rule Verification', () => {
  describe('Error-Level Rules', () => {
    // Tests for each error-level rule
  });
  
  describe('Custom Plugin Rules', () => {
    // Tests for each custom rule
  });
  
  describe('Warning-Level Rules', () => {
    // Tests for warning rules
  });
  
  describe('Allowed Patterns', () => {
    // Tests verifying valid code passes
  });
});
```

### Rule Testing Pattern

Each rule test will follow this pattern:

```typescript
describe('Rule Name', () => {
  const rule = plugin.rules['rule-name'];
  
  it('should detect violation: description', () => {
    const code = `// violation code`;
    const messages = runRule(rule, code);
    expect(messages.length).toBeGreaterThan(0);
    expect(messages[0].message).toContain('expected message');
  });
  
  it('should allow valid code: description', () => {
    const code = `// valid code`;
    const messages = runRule(rule, code);
    expect(messages.length).toBe(0);
  });
});
```

## Data Models

### Test Case Structure

```typescript
interface TestCase {
  description: string;
  code: string;
  shouldViolate: boolean;
  expectedMessage?: string;
  severity?: 'error' | 'warning';
}
```

### Rule Categories

```typescript
type RuleCategory = 
  | 'error-level'
  | 'custom-plugin'
  | 'warning-level'
  | 'allowed-patterns';

interface RuleTest {
  ruleName: string;
  category: RuleCategory;
  testCases: TestCase[];
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Error-level rule violation detection
*For any* error-level rule in the recommended config, when code violates that rule, running the rule should return at least one violation message.
**Validates: Requirements 1.1**

### Property 2: Console statement detection
*For any* console method (log, error, warn), when code contains that console method call, the console rule should detect a violation.
**Validates: Requirements 1.2**

### Property 3: Unused variable detection with prefix exceptions
*For any* variable that is declared but never used, if the variable name starts with underscore or 'k', no violation should be reported; otherwise a violation should be reported.
**Validates: Requirements 1.3**

### Property 4: Direct Redux hooks detection
*For any* code containing useSelector or useDispatch calls, the Redux hooks rule should detect a violation.
**Validates: Requirements 1.4**

### Property 5: Type import syntax enforcement
*For any* type-only import, if the import does not use the 'type' keyword, the type import rule should detect a violation.
**Validates: Requirements 1.5**

### Property 6: Any type usage detection
*For any* type annotation using 'any', the any type rule should detect a violation.
**Validates: Requirements 1.6**

### Property 7: Import order enforcement
*For any* set of imports that are not ordered according to the specified groups (builtin, internal-alias, internal, external, parent, sibling, index, object, type), the import order rule should detect a violation.
**Validates: Requirements 1.7, 5.1**

### Property 8: Boolean naming convention enforcement
*For any* boolean variable, if the variable name does not start with one of the allowed prefixes (is, has, should, can, will, as, with), the boolean naming rule should detect a violation.
**Validates: Requirements 1.8, 2.3**

### Property 9: Unused module detection
*For any* imported module that is never referenced in the code, the unused imports rule should detect a violation.
**Validates: Requirements 1.9**

### Property 10: JSX inline object detection
*For any* JSX element with a prop containing an inline object literal, the no-inline-objects rule should detect a violation.
**Validates: Requirements 2.1**

### Property 11: JSX inline function detection
*For any* JSX element with a prop containing an inline arrow function, the no-inline-functions rule should detect a violation.
**Validates: Requirements 2.2**

### Property 12: Icon memoization enforcement
*For any* icon component export, if the export is not wrapped with memoization, the memoized-export rule should detect a violation.
**Validates: Requirements 2.4**

### Property 13: SVG currentColor enforcement
*For any* SVG element with fill or stroke attributes, if the value is not 'currentColor', the svg-currentcolor rule should detect a violation.
**Validates: Requirements 2.5**

### Property 14: One component per file enforcement
*For any* file containing multiple React component exports, the one-component-per-file rule should detect a violation.
**Validates: Requirements 2.6**

### Property 15: One SVG per icon file enforcement
*For any* icon file containing multiple SVG elements, the single-svg-per-file rule should detect a violation.
**Validates: Requirements 2.7**

### Property 16: Form config extraction enforcement
*For any* inline form configuration object, the form-config-extraction rule should detect a violation.
**Validates: Requirements 2.8**

### Property 17: Empty catch block detection
*For any* try-catch block with an empty catch clause, the no-empty-catch rule should detect a violation.
**Validates: Requirements 2.9**

### Property 18: Nested ternary detection
*For any* ternary expression containing another ternary expression, the no-nested-ternary rule should detect a violation.
**Validates: Requirements 2.10**

### Property 19: Service response.data return detection
*For any* service function that directly returns response.data, the no-response-data-return rule should detect a violation.
**Validates: Requirements 2.11**

### Property 20: Non-null assertion warning
*For any* code using the non-null assertion operator (!), the rule should produce a warning (severity 1) not an error (severity 2).
**Validates: Requirements 3.1, 3.2**

### Property 21: Valid React JSX transform acceptance
*For any* JSX code without a React import, when using React 17+ JSX transform, no violations should be reported.
**Validates: Requirements 4.1**

### Property 22: Proper import order acceptance
*For any* set of imports correctly ordered according to the specified groups, the import order rule should report zero violations.
**Validates: Requirements 4.2**

### Property 23: Ignored variable prefix acceptance
*For any* unused variable with name starting with underscore or 'k', the unused variable rule should report zero violations.
**Validates: Requirements 4.3**

### Property 24: Valid boolean naming acceptance
*For any* boolean variable with a name starting with an allowed prefix (is, has, should, can, will, as, with), the boolean naming rule should report zero violations.
**Validates: Requirements 4.4**

### Property 25: Simple ternary acceptance
*For any* non-nested ternary expression, the no-nested-ternary rule should report zero violations.
**Validates: Requirements 4.5**

### Property 26: Transformed service data acceptance
*For any* service function that transforms response.data before returning, the no-response-data-return rule should report zero violations.
**Validates: Requirements 4.6**

### Property 27: Rule isolation in tests
*For any* rule being tested using the runRule utility, only that specific rule should be enabled in the test configuration.
**Validates: Requirements 6.3**

### Property 28: Config rule severity matching
*For any* rule in the recommended config, the test suite should verify that the rule's configured severity matches the expected severity.
**Validates: Requirements 7.2**

## Error Handling

### Missing Rules
If a rule referenced in the test suite doesn't exist in the plugin:
- The test should fail with a clear error message
- The error should identify which rule is missing
- This helps catch configuration drift

### Parser Errors
If test code has syntax errors:
- The test framework will catch the parser error
- The test should fail with the parser error message
- Test code should be syntactically valid

### Configuration Errors
If the ESLint configuration is invalid:
- The `runRule` utility will throw an error
- The test should fail immediately
- Error message should indicate configuration issue

## Testing Strategy

### Unit Testing Approach

The comprehensive test file itself is a unit test suite that tests each rule in isolation. Each test case:
- Tests a single rule
- Uses minimal code examples
- Verifies specific behavior
- Is independent of other tests

### Test Organization

Tests are organized by:
1. **Rule Category**: Groups related rules together
2. **Violation vs Valid**: Separates tests that should fail from tests that should pass
3. **Specific Scenarios**: Each test focuses on one specific case

### Test Coverage

The test suite will cover:
- All rules in the recommended config
- All custom plugin rules
- Both error and warning severity levels
- Common violation patterns
- Valid code patterns
- Edge cases (empty strings, special characters, etc.)

### Property-Based Testing

While this test file uses example-based testing, the existing property-based tests in the codebase (e.g., `boolean-variable-naming.property.test.ts`) provide complementary coverage by testing rules across many generated inputs.

### Testing Framework

- **Framework**: Vitest
- **Utilities**: Existing `runRule` and `applyFixes` from `test-utils.ts`
- **Assertions**: Vitest's `expect` API
- **File Location**: `eslint-plugin-custom/comprehensive-rules.test.ts`

### Test Execution

```bash
# Run all tests
npm test

# Run only comprehensive test
npm test comprehensive-rules.test.ts

# Run with coverage
npm test -- --coverage
```

## Implementation Notes

### Rule Access

Rules are accessed from the plugin:
```typescript
import plugin from './src/plugin';
const rule = plugin.rules['rule-name'];
```

### TypeScript/ESLint Rules

For TypeScript-specific rules from `@typescript-eslint`:
```typescript
import tseslint from 'typescript-eslint';
// Rules are in tseslint.configs.recommended, etc.
```

### Custom vs Built-in Rules

- **Custom rules**: Prefixed with `custom/` in config, accessed via `plugin.rules`
- **Built-in rules**: From ESLint core or TypeScript-ESLint, accessed via their respective packages

### File Naming

The test file will be named `comprehensive-rules.test.ts` to clearly indicate its purpose and ensure it's picked up by the test runner.

### Code Examples

Test code examples should be:
- Minimal (only what's needed to trigger/pass the rule)
- Clear (obvious what the rule is checking)
- Realistic (representative of actual code)
- Self-contained (no external dependencies)

## Dependencies

- **Vitest**: Test framework
- **@typescript-eslint/utils**: ESLint utilities
- **@typescript-eslint/parser**: TypeScript parser for ESLint
- **Existing test-utils.ts**: Provides `runRule` helper
- **src/plugin.ts**: Provides access to all custom rules

## Future Enhancements

1. **Automated Rule Discovery**: Automatically detect all rules in the plugin and generate test stubs
2. **Config Validation**: Verify that all rules in configs actually exist
3. **Performance Testing**: Measure rule execution time
4. **Fix Testing**: Verify auto-fix functionality for rules that provide fixes
5. **Integration Testing**: Test multiple rules working together
