# Design Document

## Overview

This design enhances the `memoized-export` ESLint rule fixer to intelligently handle different React import patterns and automatically add TypeScript type definitions for icon components. The current implementation breaks when encountering namespace imports (`import * as React`) by attempting to add named imports to them. The enhanced fixer will:

1. Detect the React import style (namespace, default, named, or mixed)
2. Use the appropriate memo reference (`React.memo` vs `memo`)
3. Add or update imports correctly without breaking existing code
4. Automatically add proper TypeScript types for both React web and React Native SVG components

## Architecture

The enhancement follows a detection-then-action pattern:

1. **Import Detection Phase**: Analyze the file's React import statement to determine its style
2. **Environment Detection Phase**: Determine if the component is for React web or React Native
3. **Type Addition Phase**: Add appropriate TypeScript type annotations to the component
4. **Memo Application Phase**: Apply the appropriate memo wrapping based on the detected import style
5. **Import Update Phase**: Add or update imports as needed without breaking existing syntax

### Component Flow

```
File AST
  ↓
Import Analyzer → Detects import style (namespace/default/named/mixed/none)
  ↓
Environment Detector → Detects React web vs React Native
  ↓
Type Annotator → Adds SVGProps or SvgProps type to component
  ↓
Memo Strategy Selector → Chooses React.memo vs memo
  ↓
Import Updater → Adds/updates imports if needed
  ↓
Export Wrapper → Wraps export with chosen memo strategy
```

## Components and Interfaces

### 1. Import Style Detector

```typescript
enum ReactImportStyle {
  NAMESPACE,    // import * as React from 'react'
  DEFAULT_ONLY, // import React from 'react'
  NAMED_ONLY,   // import { useState } from 'react'
  MIXED,        // import React, { useState } from 'react'
  NONE          // no React import
}

interface ImportAnalysisResult {
  style: ReactImportStyle;
  hasDefaultImport: boolean;
  hasNamedImports: boolean;
  hasMemoImport: boolean;
  importNode: TSESTree.ImportDeclaration | null;
}

function analyzeReactImport(programNode: TSESTree.Program): ImportAnalysisResult
```

### 2. Environment Detector

```typescript
enum IconEnvironment {
  REACT_WEB,
  REACT_NATIVE
}

interface EnvironmentDetectionResult {
  environment: IconEnvironment;
  hasReactNativeSvgImport: boolean;
  usesSvgComponent: boolean;
}

function detectIconEnvironment(
  programNode: TSESTree.Program,
  svgNode: TSESTree.JSXElement
): EnvironmentDetectionResult
```

### 3. Type Annotator

```typescript
interface TypeAnnotationStrategy {
  propsType: string;  // 'React.SVGProps<SVGSVGElement>' or 'SvgProps'
  needsTypeImport: boolean;
  typeImportSource: string | null;  // 'react-native-svg' or null
}

function getTypeAnnotationStrategy(
  environment: IconEnvironment,
  importStyle: ReactImportStyle
): TypeAnnotationStrategy

function addTypeAnnotation(
  componentNode: TSESTree.Node,
  strategy: TypeAnnotationStrategy,
  fixer: TSESLint.RuleFixer
): TSESLint.RuleFix[]
```

### 4. Memo Strategy Selector

```typescript
interface MemoStrategy {
  memoReference: string;  // 'React.memo' or 'memo'
  needsMemoImport: boolean;
  importUpdateStrategy: ImportUpdateStrategy;
}

enum ImportUpdateStrategy {
  NO_UPDATE,           // memo already available
  ADD_TO_NAMED,        // add to existing named imports
  ADD_NAMED_TO_DEFAULT, // add named imports to default-only import
  CREATE_NEW_IMPORT    // create new import statement
}

function selectMemoStrategy(analysis: ImportAnalysisResult): MemoStrategy
```

### 5. Import Updater

```typescript
interface ImportUpdate {
  fixes: TSESLint.RuleFix[];
  updatedImports: string[];
}

function updateImports(
  strategy: MemoStrategy,
  typeStrategy: TypeAnnotationStrategy,
  importNode: TSESTree.ImportDeclaration | null,
  programNode: TSESTree.Program,
  fixer: TSESLint.RuleFixer
): ImportUpdate
```

## Data Models

### Import Analysis Result
- `style`: The detected React import pattern
- `hasDefaultImport`: Whether a default React import exists
- `hasNamedImports`: Whether named imports exist
- `hasMemoImport`: Whether memo is already imported
- `importNode`: Reference to the import AST node

### Memo Strategy
- `memoReference`: The string to use when wrapping (`'React.memo'` or `'memo'`)
- `needsMemoImport`: Whether we need to add a memo import
- `importUpdateStrategy`: How to update the import statement

### Type Annotation Strategy
- `propsType`: The TypeScript type string to use for props
- `needsTypeImport`: Whether a type import is needed
- `typeImportSource`: The module to import the type from

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Namespace import uses React.memo
*For any* icon component file with `import * as React from 'react'`, the fixer should wrap the export with `React.memo()` and not modify the import statement.
**Validates: Requirements 1.1, 1.2**

### Property 2: Default-only import uses React.memo
*For any* icon component file with `import React from 'react'` and no named imports, the fixer should wrap the export with `React.memo()` and not add named imports.
**Validates: Requirements 2.1, 2.2**

### Property 3: Named imports get memo added
*For any* icon component file with named imports from React (e.g., `import { useState } from 'react'`), the fixer should add `memo` to the named imports list.
**Validates: Requirements 3.1**

### Property 4: Named imports use memo directly
*For any* icon component file with named imports from React (including mixed imports), the fixer should wrap the export with `memo()` not `React.memo()`.
**Validates: Requirements 3.2, 4.2**

### Property 5: Mixed imports add to named section
*For any* icon component file with `import React, { ... } from 'react'`, the fixer should add `memo` to the existing named imports section.
**Validates: Requirements 4.1**

### Property 6: No duplicate memo imports
*For any* icon component file where `memo` is already imported, the fixer should not add another `memo` import.
**Validates: Requirements 5.1**

### Property 7: React web components get SVGProps type
*For any* React web icon component, the fixer should add `React.SVGProps<SVGSVGElement>` as the props type parameter to the component function.
**Validates: Requirements 6.1, 6.5**

### Property 8: React Native components get SvgProps type import
*For any* React Native icon component, the fixer should import `SvgProps` type from `react-native-svg`.
**Validates: Requirements 7.1**

### Property 9: React Native components get Svg import
*For any* React Native icon component, the fixer should import `Svg` component from `react-native-svg` if not already imported.
**Validates: Requirements 7.2**

### Property 10: React Native components use SvgProps type
*For any* React Native icon component, the fixer should add `SvgProps` as the props type parameter to the component function.
**Validates: Requirements 7.3**

## Error Handling

### Invalid Import Patterns
- If the React import cannot be parsed or has an unexpected structure, the fixer should skip import modifications and log a warning
- The fixer should not crash ESLint if it encounters malformed imports

### Missing Component Names
- If the component has no name (inline arrow function or anonymous function), the fixer should not attempt to wrap it with memo
- This behavior is already implemented and should be preserved

### Type Annotation Failures
- If the component already has a props type that conflicts with SVGProps/SvgProps, the fixer should not override it
- If the component has complex props types (intersections, unions), the fixer should attempt to add SVGProps/SvgProps as an intersection

### React Native Detection Failures
- If the environment cannot be determined (no clear indicators), default to React web behavior
- Log a warning if both React web and React Native indicators are present

## Testing Strategy

### Unit Tests

Unit tests will cover specific examples and edge cases:

1. **Import Style Examples**:
   - Namespace import: `import * as React from 'react'`
   - Default-only import: `import React from 'react'`
   - Named-only import: `import { useState } from 'react'`
   - Mixed import: `import React, { useState } from 'react'`
   - No import: empty file with JSX

2. **Component Style Examples**:
   - Arrow function: `const Icon = () => <svg>...</svg>`
   - Function declaration: `function Icon() { return <svg>...</svg>; }`
   - Arrow with props: `const Icon = (props) => <svg {...props}>...</svg>`

3. **Type Annotation Examples**:
   - Component without props parameter
   - Component with untyped props parameter
   - Component with existing props type
   - Function declaration vs arrow function

4. **React Native Examples**:
   - File with `react-native-svg` import
   - File using `<Svg>` component
   - File with both React web and React Native indicators

5. **Edge Cases**:
   - Component with memo already imported
   - Component already wrapped with memo
   - Inline anonymous functions
   - Multiple React imports (should not happen, but handle gracefully)

### Property-Based Tests

Property-based tests will verify universal properties across many generated inputs using fast-check:

1. **Property 1-2 Tests**: Generate random components with namespace/default imports and verify React.memo usage
2. **Property 3-5 Tests**: Generate random components with named/mixed imports and verify memo import additions
3. **Property 6 Test**: Generate random components with memo already imported and verify no duplicates
4. **Property 7 Test**: Generate random React web components and verify SVGProps type addition
5. **Property 8-10 Tests**: Generate random React Native components and verify SvgProps type and imports

Each property test will:
- Run 100+ iterations with randomized inputs
- Verify the fix produces valid code
- Verify the fixed code passes the rule (no violations)
- Verify no duplicate imports are created
- Verify the import statement structure is valid

### Test Configuration

- Use `fast-check` for property-based testing
- Configure each property test to run minimum 100 iterations
- Use the existing `test-utils.ts` helpers for running rules and applying fixes
- Tag each property test with: `Feature: icon-memoize-react-import-handling, Property {number}: {property_text}`

## Implementation Notes

### AST Node Types

The implementation will work with these TypeScript ESLint AST node types:
- `TSESTree.ImportDeclaration` - for analyzing and modifying imports
- `TSESTree.ImportSpecifier` - for named imports
- `TSESTree.ImportDefaultSpecifier` - for default imports
- `TSESTree.ImportNamespaceSpecifier` - for namespace imports
- `TSESTree.ExportDefaultDeclaration` - for the export statement
- `TSESTree.FunctionDeclaration` - for function component declarations
- `TSESTree.ArrowFunctionExpression` - for arrow function components
- `TSESTree.Identifier` - for component names and import names

### Fixer Strategy

The fixer will generate multiple fixes in a single array:
1. Import modification fix (if needed)
2. Type annotation fix (if needed)
3. Export wrapping fix (always needed)

All fixes must be applied atomically to ensure code validity.

### Performance Considerations

- Cache import analysis results to avoid repeated AST traversal
- Use early returns to skip unnecessary processing
- Reuse existing helper functions from `ast-helpers.ts`

### Backward Compatibility

- The enhancement should not change behavior for files that already work correctly
- Existing test cases should continue to pass
- The fixer should remain optional (users can ignore the error if they prefer)
