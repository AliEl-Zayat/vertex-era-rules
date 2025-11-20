# Implementation Plan

- [x] 1. Create test file structure and setup
  - Create `eslint-plugin-custom/comprehensive-rules.test.ts` file
  - Import necessary dependencies (vitest, test-utils, plugin)
  - Set up main describe block for comprehensive rule verification
  - _Requirements: 6.1, 6.2_

- [x] 2. Implement error-level rule tests
  - [x] 2.1 Implement console statement tests
    - Test console.log detection
    - Test console.error detection
    - Test console.warn detection
    - _Requirements: 1.2_q

  - [x] 2.2 Write property test for console statement detection
    - **Property 2: Console statement detection**
    - **Validates: Requirements 1.2**

  - [x] 2.3 Implement unused variable tests
    - Test unused variable detection
    - Test underscore prefix exception
    - Test 'k' prefix exception
    - _Requirements: 1.3_

  - [x] 2.4 Write property test for unused variable detection
    - **Property 3: Unused variable detection with prefix exceptions**
    - **Validates: Requirements 1.3**

  - [x] 2.5 Implement type import syntax tests
    - Test type imports without 'type' keyword trigger violations
    - Test type imports with 'type' keyword pass
    - _Requirements: 1.5_

  - [x] 2.6 Write property test for type import syntax
    - **Property 5: Type import syntax enforcement**
    - **Validates: Requirements 1.5**

  - [x] 2.7 Implement any type usage tests
    - Test 'any' type in variable declarations
    - Test 'any' type in function parameters
    - Test 'any' type in return types
    - _Requirements: 1.6_

  - [x] 2.8 Write property test for any type detection
    - **Property 6: Any type usage detection**
    - **Validates: Requirements 1.6**

  - [x] 2.9 Implement import order tests
    - Test incorrect import order triggers violations
    - Test correct import order passes
    - Test all import groups (builtin, internal-alias, internal, external, parent, sibling, index, object, type)
    - _Requirements: 1.7, 5.1-5.8_

  - [x] 2.10 Write property test for import order enforcement
    - **Property 7: Import order enforcement**
    - **Validates: Requirements 1.7, 5.1**

- [x] 3. Implement custom plugin rule tests
  - [x] 3.1 Implement JSX inline object tests
    - Test inline objects in JSX props trigger violations
    - Test variable references in JSX props pass
    - _Requirements: 2.1_

  - [x] 3.2 Write property test for JSX inline objects
    - **Property 10: JSX inline object detection**
    - **Validates: Requirements 2.1**

  - [x] 3.3 Implement JSX inline function tests
    - Test inline arrow functions in JSX props trigger violations
    - Test function references in JSX props pass
    - _Requirements: 2.2_

  - [x] 3.4 Write property test for JSX inline functions
    - **Property 11: JSX inline function detection**
    - **Validates: Requirements 2.2**

  - [x] 3.5 Implement boolean naming convention tests
    - Test boolean variables without proper prefixes trigger violations
    - Test boolean variables with allowed prefixes (is, has, should, can, will, as, with) pass
    - _Requirements: 1.8, 2.3_

  - [x] 3.6 Write property test for boolean naming
    - **Property 8: Boolean naming convention enforcement**
    - **Validates: Requirements 1.8, 2.3**

  - [x] 3.7 Implement icon memoization tests
    - Test icon exports without memoization trigger violations
    - Test memoized icon exports pass
    - _Requirements: 2.4_

  - [x] 3.8 Write property test for icon memoization
    - **Property 12: Icon memoization enforcement**
    - **Validates: Requirements 2.4**

  - [x] 3.9 Implement SVG currentColor tests
    - Test SVG fill/stroke without currentColor trigger violations
    - Test SVG with currentColor passes
    - _Requirements: 2.5_

  - [x] 3.10 Write property test for SVG currentColor
    - **Property 13: SVG currentColor enforcement**
    - **Validates: Requirements 2.5**

  - [x] 3.11 Implement one component per file tests
    - Test multiple component exports trigger violations
    - Test single component export passes
    - _Requirements: 2.6_

  - [x] 3.12 Write property test for one component per file
    - **Property 14: One component per file enforcement**
    - **Validates: Requirements 2.6**

  - [x] 3.13 Implement one SVG per icon file tests
    - Test multiple SVG elements trigger violations
    - Test single SVG element passes
    - _Requirements: 2.7_

  - [x] 3.14 Write property test for one SVG per file
    - **Property 15: One SVG per icon file enforcement**
    - **Validates: Requirements 2.7**

  - [x] 3.15 Implement form config extraction tests
    - Test inline form configs trigger violations
    - Test extracted form configs pass
    - _Requirements: 2.8_

  - [x] 3.16 Write property test for form config extraction
    - **Property 16: Form config extraction enforcement**
    - **Validates: Requirements 2.8**

  - [x] 3.17 Implement empty catch block tests
    - Test empty catch blocks trigger violations
    - Test catch blocks with error handling pass
    - _Requirements: 2.9_

  - [x] 3.18 Write property test for empty catch blocks
    - **Property 17: Empty catch block detection**
    - **Validates: Requirements 2.9**

  - [x] 3.19 Implement nested ternary tests
    - Test nested ternary expressions trigger violations
    - Test simple ternary expressions pass
    - _Requirements: 2.10_

  - [x] 3.20 Write property test for nested ternary
    - **Property 18: Nested ternary detection**
    - **Validates: Requirements 2.10**

  - [x] 3.21 Implement service response.data tests
    - Test direct response.data returns trigger violations
    - Test transformed data returns pass
    - _Requirements: 2.11_

  - [x] 3.22 Write property test for service response data
    - **Property 19: Service response.data return detection**
    - **Validates: Requirements 2.11**

- [x] 4. Implement warning-level rule tests
  - [x] 4.1 Implement non-null assertion tests
    - Test non-null assertion operator triggers warnings (severity 1)
    - Verify severity is warning not error
    - _Requirements: 3.1, 3.2_

  - [x] 4.2 Write property test for non-null assertion warnings
    - **Property 20: Non-null assertion warning**
    - **Validates: Requirements 3.1, 3.2**

- [x] 5. Implement allowed pattern tests
  - [x] 5.1 Implement React JSX transform tests
    - Test JSX without React import passes (React 17+)
    - _Requirements: 4.1_

  - [x] 5.2 Write property test for React JSX transform
    - **Property 21: Valid React JSX transform acceptance**
    - **Validates: Requirements 4.1**

  - [x] 5.3 Implement proper import structure tests
    - Test correctly ordered imports pass
    - _Requirements: 4.2_

  - [x] 5.4 Write property test for proper import order
    - **Property 22: Proper import order acceptance**
    - **Validates: Requirements 4.2**

  - [x] 5.5 Implement ignored variable tests
    - Test underscore-prefixed unused variables pass
    - Test 'k'-prefixed unused variables pass
    - _Requirements: 4.3_

  - [x] 5.6 Write property test for ignored variables
    - **Property 23: Ignored variable prefix acceptance**
    - **Validates: Requirements 4.3**

  - [x] 5.7 Implement valid boolean naming tests
    - Test boolean variables with proper prefixes pass
    - _Requirements: 4.4_

  - [x] 5.8 Write property test for valid boolean naming
    - **Property 24: Valid boolean naming acceptance**
    - **Validates: Requirements 4.4**

  - [x] 5.9 Implement valid ternary tests
    - Test non-nested ternary expressions pass
    - _Requirements: 4.5_

  - [x] 5.10 Write property test for simple ternary
    - **Property 25: Simple ternary acceptance**
    - **Validates: Requirements 4.5**

  - [x] 5.11 Implement valid service return tests
    - Test transformed service data returns pass
    - _Requirements: 4.6_

  - [x] 5.12 Write property test for transformed service data
    - **Property 26: Transformed service data acceptance**
    - **Validates: Requirements 4.6**

- [x] 6. Implement config verification tests
  - [x] 6.1 Implement config loading test
    - Test recommended config loads successfully
    - _Requirements: 7.1_

  - [x] 6.2 Implement rule severity verification tests
    - Test each rule's severity matches recommended config
    - _Requirements: 7.2_

  - [x] 6.3 Write property test for config rule severity
    - **Property 28: Config rule severity matching**
    - **Validates: Requirements 7.2**

- [x] 7. Implement rule isolation verification
  - [x] 7.1 Verify runRule utility isolates rules
    - Test that only the specified rule is enabled
    - _Requirements: 6.3_

  - [x] 7.2 Write property test for rule isolation
    - **Property 27: Rule isolation in tests**
    - **Validates: Requirements 6.3**

- [x] 9. Implement missing error-level rule tests
  - [x] 9.1 Implement Direct Redux hooks tests
    - Test useSelector usage triggers violations using no-restricted-syntax rule
    - Test useDispatch usage triggers violations using no-restricted-syntax rule
    - Test that importing useSelector/useDispatch from react-redux triggers violations using no-restricted-imports rule
    - Test that custom hooks (useAppSelector, useAppDispatch) are allowed
    - _Requirements: 1.4_

  - [x] 9.2 Write property test for Direct Redux hooks detection
    - **Property 4: Direct Redux hooks detection**
    - **Validates: Requirements 1.4**

  - [x] 9.3 Implement unused imports tests
    - Test imported but unused modules trigger violations using unused-imports/no-unused-imports rule
    - Test used imports pass without violations
    - Test that unused imports are detected separately from unused variables
    - _Requirements: 1.9_

  - [x] 9.4 Write property test for unused imports
    - **Property 9: Unused module detection**
    - **Validates: Requirements 1.9**

- [x] 10. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
