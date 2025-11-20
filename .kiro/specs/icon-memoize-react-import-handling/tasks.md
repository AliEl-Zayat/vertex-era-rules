# Implementation Plan

- [x] 1. Create helper functions for import analysis
  - Create `analyzeReactImport()` function that detects import style (namespace/default/named/mixed/none)
  - Create `ReactImportStyle` enum and `ImportAnalysisResult` interface
  - Return analysis object with import style, flags, and AST node reference
  - _Requirements: 1.1, 2.1, 3.1, 4.1_

- [x] 1.1 Write property test for import analysis
  - **Property: Import style detection accuracy**
  - **Validates: Requirements 1.1, 2.1, 3.1, 4.1**

- [x] 2. Create helper functions for environment detection
  - Create `detectIconEnvironment()` function that determines React web vs React Native
  - Create `IconEnvironment` enum and `EnvironmentDetectionResult` interface
  - Check for `react-native-svg` imports and `<Svg>` JSX elements
  - Default to React web if environment cannot be determined
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 2.1 Write property test for environment detection
  - **Property: React Native detection accuracy**
  - **Validates: Requirements 7.1, 7.2, 7.3**

- [x] 3. Create memo strategy selector and import updater in ast-helpers.ts
  - Create `selectMemoStrategy()` function that chooses between `React.memo` and `memo`
  - Create `MemoStrategy` interface and `ImportUpdateStrategy` enum
  - Return strategy object with memo reference and import update approach
  - Handle namespace imports → use `React.memo`, no import changes
  - Handle default-only imports → use `React.memo`, no import changes
  - Handle named/mixed imports → use `memo`, add to imports if needed
  - Create `updateImports()` function that generates import modification fixes
  - Handle adding `memo` to existing named imports
  - Handle adding named imports to default-only imports
  - Handle creating new import statement when none exists
  - Check for existing `memo` import to avoid duplicates
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 3.1, 3.2, 4.1, 4.2, 5.1_

- [x] 3.1 Write property test for namespace import strategy
  - **Property 1: Namespace import uses React.memo**
  - **Validates: Requirements 1.1, 1.2**

- [x] 3.2 Write property test for default-only import strategy
  - **Property 2: Default-only import uses React.memo**
  - **Validates: Requirements 2.1, 2.2**

- [x] 3.3 Write property test for named import strategy
  - **Property 3: Named imports get memo added**
  - **Property 4: Named imports use memo directly**
  - **Validates: Requirements 3.1, 3.2**

- [x] 3.4 Write property test for mixed import strategy
  - **Property 5: Mixed imports add to named section**
  - **Validates: Requirements 4.1, 4.2**

- [x] 3.5 Write property test for no duplicate imports
  - **Property 6: No duplicate memo imports**
  - **Validates: Requirements 5.1**

- [x] 4. Create type annotation helpers in ast-helpers.ts
  - Create `getTypeAnnotationStrategy()` function that determines props type
  - Create `TypeAnnotationStrategy` interface
  - Return React web type (`React.SVGProps<SVGSVGElement>`) or React Native type (`SvgProps`)
  - Determine if type import is needed based on environment
  - Create `addTypeAnnotation()` function that adds props type to component
  - Handle function declarations: add type to parameter list
  - Handle arrow functions: add type to parameter list
  - Handle components without props parameter: add props parameter with type
  - Handle components with existing props: add type annotation if missing
  - Skip if component already has conflicting type
  - Handle adding React Native type and component imports
  - _Requirements: 6.1, 6.5, 7.1, 7.2, 7.3_

- [x] 4.1 Write property test for type annotation strategy
  - **Property 7: React web components get SVGProps type**
  - **Property 10: React Native components use SvgProps type**
  - **Validates: Requirements 6.1, 7.3**

- [x] 4.2 Write property test for React Native imports
  - **Property 8: React Native components get SvgProps type import**
  - **Property 9: React Native components get Svg import**
  - **Validates: Requirements 7.1, 7.2**

- [x] 5. Integrate new helpers into memoized-export rule
  - Update the `fix()` function in `memoized-export` rule
  - Call `analyzeReactImport()` to detect import style
  - Call `detectIconEnvironment()` to determine React web vs Native
  - Call `selectMemoStrategy()` to choose memo approach
  - Call `getTypeAnnotationStrategy()` to determine props type
  - Call `addTypeAnnotation()` to add type to component
  - Call `updateImports()` to generate import fixes
  - Generate export wrapping fix using selected memo reference
  - Combine all fixes into single fix array
  - _Requirements: All requirements_

- [x] 5.1 Write integration property test
  - Test complete fix flow with various import styles
  - Verify fixed code has no violations
  - Verify no duplicate imports
  - Verify correct memo reference used
  - Verify correct type annotation added
  - _Requirements: All requirements_

- [x] 6. Update existing tests and add comprehensive unit tests
  - Review existing unit tests in `memoized-export.test.ts`
  - Update tests that expect specific import modifications
  - Add new test cases for namespace imports with various component styles
  - Add new test cases for default-only imports with various component styles
  - Add new test cases for React Native component detection and fixing
  - Add test cases for type annotation on function declarations
  - Add test cases for type annotation on arrow functions
  - Add test cases for components with no props parameter
  - Add test cases for components with untyped props
  - Add test cases for components with existing props type
  - Add edge case test: mixed React web and Native indicators
  - Ensure all existing tests still pass
  - _Requirements: All requirements_

- [x] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
