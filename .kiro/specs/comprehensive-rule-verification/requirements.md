# Requirements Document

## Introduction

This document specifies requirements for a comprehensive test suite that verifies all ESLint rules in the @vertex-era/eslint-rules package work correctly in isolation. The test suite will validate that each rule properly detects violations and allows valid code according to the documented rule specifications.

## Glossary

- **ESLint Rule**: A specific code quality check that can report errors or warnings in source code
- **Rule Isolation**: Testing a single rule independently without interference from other rules
- **Test Case**: A code sample designed to either trigger or pass a specific rule
- **Violation**: Code that triggers an ESLint rule error or warning
- **Valid Code**: Code that passes an ESLint rule without errors or warnings
- **Config Preset**: A predefined collection of ESLint rules (base, recommended, strict, type-aware)
- **Custom Plugin**: The collection of custom ESLint rules under the 'custom/' namespace

## Requirements

### Requirement 1

**User Story:** As a package maintainer, I want to verify all error-level rules detect violations correctly, so that I can ensure the package enforces code quality standards.

#### Acceptance Criteria

1. WHEN the test suite runs THEN the system SHALL test all error-level rules from the recommended config
2. WHEN testing console statement detection THEN the system SHALL verify that console.log, console.error, and console.warn trigger violations
3. WHEN testing unused variable detection THEN the system SHALL verify that unused variables trigger violations except those prefixed with underscore or 'k'
4. WHEN testing direct Redux hooks THEN the system SHALL verify that useSelector and useDispatch usage triggers violations
5. WHEN testing type import syntax THEN the system SHALL verify that type imports without the 'type' keyword trigger violations
6. WHEN testing any type usage THEN the system SHALL verify that 'any' type annotations trigger violations
7. WHEN testing import order THEN the system SHALL verify that incorrectly ordered imports trigger violations according to the specified group order
8. WHEN testing naming conventions THEN the system SHALL verify that boolean variables without proper prefixes trigger violations
9. WHEN testing unused modules THEN the system SHALL verify that imported but unused modules trigger violations

### Requirement 2

**User Story:** As a package maintainer, I want to verify all custom plugin rules work correctly, so that I can ensure project-specific code quality standards are enforced.

#### Acceptance Criteria

1. WHEN testing JSX inline objects THEN the system SHALL verify that inline object literals in JSX props trigger violations
2. WHEN testing JSX inline functions THEN the system SHALL verify that inline arrow functions in JSX props trigger violations
3. WHEN testing boolean naming THEN the system SHALL verify that boolean variables must use prefixes: is, has, should, can, will, as, with
4. WHEN testing icon memoization THEN the system SHALL verify that icon exports without memoization trigger violations
5. WHEN testing currentColor in SVG THEN the system SHALL verify that SVG fill/stroke attributes without currentColor trigger violations
6. WHEN testing one component per file THEN the system SHALL verify that multiple component exports trigger violations
7. WHEN testing one icon per file THEN the system SHALL verify that multiple SVG elements in icon files trigger violations
8. WHEN testing form config extraction THEN the system SHALL verify that inline form configurations trigger violations
9. WHEN testing empty catch blocks THEN the system SHALL verify that try-catch blocks with empty catch clauses trigger violations
10. WHEN testing nested ternary THEN the system SHALL verify that nested ternary expressions trigger violations
11. WHEN testing service response data THEN the system SHALL verify that returning response.data directly triggers violations

### Requirement 3

**User Story:** As a package maintainer, I want to verify warning-level rules work correctly, so that I can provide helpful suggestions without blocking builds.

#### Acceptance Criteria

1. WHEN testing non-null assertions THEN the system SHALL verify that non-null assertion operator (!) triggers warnings
2. WHEN a warning-level rule is violated THEN the system SHALL report the violation as a warning not an error

### Requirement 4

**User Story:** As a package maintainer, I want to verify allowed patterns pass without violations, so that I can ensure valid code is not incorrectly flagged.

#### Acceptance Criteria

1. WHEN testing React JSX transform THEN the system SHALL verify that JSX without React import does not trigger violations
2. WHEN testing proper import structure THEN the system SHALL verify that correctly ordered imports do not trigger violations
3. WHEN testing ignored variables THEN the system SHALL verify that variables prefixed with underscore or 'k' do not trigger unused variable violations
4. WHEN testing valid boolean naming THEN the system SHALL verify that boolean variables with proper prefixes do not trigger violations
5. WHEN testing valid ternary expressions THEN the system SHALL verify that non-nested ternary expressions do not trigger violations
6. WHEN testing valid service returns THEN the system SHALL verify that returning transformed data (not response.data) does not trigger violations

### Requirement 5

**User Story:** As a package maintainer, I want to verify import order groups are enforced correctly, so that I can ensure consistent import organization.

#### Acceptance Criteria

1. WHEN imports are ordered THEN the system SHALL enforce this sequence: builtin, internal-alias, internal, external, parent, sibling, index, object, type
2. WHEN testing builtin imports THEN the system SHALL verify that react and react-* packages are treated as builtin
3. WHEN testing internal-alias imports THEN the system SHALL verify that @assets, @constants, @types paths are treated as internal-alias
4. WHEN testing internal imports THEN the system SHALL verify that @/ prefixed paths are treated as internal
5. WHEN testing external imports THEN the system SHALL verify that node_modules packages are treated as external
6. WHEN testing parent imports THEN the system SHALL verify that ../ paths are treated as parent
7. WHEN testing sibling imports THEN the system SHALL verify that ./ paths are treated as sibling
8. WHEN testing type imports THEN the system SHALL verify that type-only imports are placed last

### Requirement 6

**User Story:** As a package maintainer, I want each rule tested in isolation, so that I can identify which specific rule is failing when tests break.

#### Acceptance Criteria

1. WHEN the test suite runs THEN the system SHALL test each rule in a separate test case
2. WHEN a rule test fails THEN the system SHALL provide clear identification of which rule failed
3. WHEN testing a rule THEN the system SHALL only enable that specific rule to avoid interference from other rules
4. WHEN a test case is created THEN the system SHALL include both violation examples and valid examples for that rule

### Requirement 7

**User Story:** As a package maintainer, I want the test file to use the latest recommended config, so that I can verify the actual configuration users will receive.

#### Acceptance Criteria

1. WHEN the test suite initializes THEN the system SHALL load the recommended config from the package
2. WHEN testing rules THEN the system SHALL verify rules are configured as specified in the recommended config
3. WHEN the recommended config changes THEN the system SHALL reflect those changes in test expectations
