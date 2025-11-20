# Requirements Document

## Introduction

This feature enhances the `memoized-export` ESLint rule fixer to intelligently handle different React import styles. Currently, the fixer breaks when encountering namespace imports (`import * as React from 'react'`) by attempting to add named imports to them. The enhancement will detect the import style and use the appropriate memo reference (`React.memo` vs `memo`).

## Glossary

- **Fixer**: An ESLint rule component that automatically corrects code violations
- **Namespace Import**: An import statement using the `* as` syntax (e.g., `import * as React from 'react'`)
- **Named Import**: An import statement using destructuring syntax (e.g., `import { memo } from 'react'`)
- **Default Import**: An import statement importing the default export (e.g., `import React from 'react'`)
- **Memoized Export**: A React component wrapped with `memo()` to prevent unnecessary re-renders
- **Icon Component**: A React component that renders an SVG icon
- **React Web SVG**: SVG components for React web using native `<svg>` elements with `React.SVGProps<SVGSVGElement>` type
- **React Native SVG**: SVG components for React Native using `react-native-svg` library with `SvgProps` type

## Requirements

### Requirement 1

**User Story:** As a developer using namespace imports for React, I want the icon-memoize fixer to use `React.memo` instead of adding a named import, so that my code doesn't break when the fixer runs.

#### Acceptance Criteria

1. WHEN the fixer encounters a file with `import * as React from 'react'` THEN the system SHALL wrap the export with `React.memo()` instead of `memo()`
2. WHEN the fixer encounters a file with `import * as React from 'react'` THEN the system SHALL NOT add a named import for `memo`
3. WHEN the fixer wraps an export with `React.memo()` THEN the system SHALL maintain the existing namespace import unchanged

### Requirement 2

**User Story:** As a developer using default imports for React, I want the fixer to use `React.memo` when appropriate, so that I don't need to add additional named imports.

#### Acceptance Criteria

1. WHEN the fixer encounters a file with `import React from 'react'` and no named imports THEN the system SHALL wrap the export with `React.memo()`
2. WHEN the fixer encounters a file with `import React from 'react'` and no named imports THEN the system SHALL NOT add a named import for `memo`
3. WHEN the fixer wraps an export with `React.memo()` THEN the system SHALL maintain the existing default import unchanged

### Requirement 3

**User Story:** As a developer using named imports for React, I want the fixer to add `memo` to my imports and use it directly, so that my code follows the named import pattern consistently.

#### Acceptance Criteria

1. WHEN the fixer encounters a file with `import { useState } from 'react'` THEN the system SHALL add `memo` to the named imports
2. WHEN the fixer adds `memo` to existing named imports THEN the system SHALL wrap the export with `memo()`
3. WHEN the fixer encounters a file with no React import THEN the system SHALL create `import { memo } from 'react'` and wrap the export with `memo()`

### Requirement 4

**User Story:** As a developer with mixed import styles, I want the fixer to handle combined default and named imports correctly, so that my existing import structure is preserved.

#### Acceptance Criteria

1. WHEN the fixer encounters `import React, { useState } from 'react'` THEN the system SHALL add `memo` to the named imports
2. WHEN the fixer encounters `import React, { useState } from 'react'` THEN the system SHALL wrap the export with `memo()` not `React.memo()`
3. WHEN named imports already exist in a combined import THEN the system SHALL preserve the default import and add to the named imports

### Requirement 5

**User Story:** As a developer, I want the fixer to detect if `memo` is already imported, so that duplicate imports are not created.

#### Acceptance Criteria

1. WHEN the fixer encounters a file where `memo` is already imported THEN the system SHALL NOT add another `memo` import
2. WHEN `memo` is already imported THEN the system SHALL use the existing `memo` reference in the wrapped export
3. WHEN checking for existing `memo` imports THEN the system SHALL check both standalone named imports and combined imports

### Requirement 6

**User Story:** As a developer creating React web icon components, I want the fixer to automatically add proper TypeScript types, so that my components have correct type safety without manual typing.

#### Acceptance Criteria

1. WHEN the fixer wraps a component export THEN the system SHALL add `React.SVGProps<SVGSVGElement>` as the props type parameter
2. WHEN adding SVG props type THEN the system SHALL ensure the component function signature includes the props parameter with the correct type
3. WHEN the component is a function declaration THEN the system SHALL add the type annotation to the function parameter
4. WHEN the component is an arrow function THEN the system SHALL add the type annotation to the arrow function parameter
5. WHEN the component already has a props parameter THEN the system SHALL add the type annotation if missing

### Requirement 7

**User Story:** As a developer creating React Native icon components, I want the fixer to automatically add React Native SVG types and imports, so that my components work correctly in React Native environments.

#### Acceptance Criteria

1. WHEN the fixer detects React Native SVG usage THEN the system SHALL import `SvgProps` type from `react-native-svg`
2. WHEN the fixer detects React Native SVG usage THEN the system SHALL import `Svg` component from `react-native-svg`
3. WHEN wrapping a React Native component export THEN the system SHALL use `SvgProps` as the props type parameter
4. WHEN the file contains `react-native-svg` imports THEN the system SHALL detect it as a React Native icon component
5. WHEN the file uses `<Svg>` JSX element THEN the system SHALL detect it as a React Native icon component
