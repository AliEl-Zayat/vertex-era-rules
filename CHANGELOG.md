# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-11-19

### 🎉 Initial Release

First stable release of `@vertex-era-rules` - a comprehensive ESLint plugin with custom rules for React/TypeScript projects.

### ✨ Features

#### Custom Rules (12 Total)

**Component Rules:**

- `one-component-per-file` - Enforce one component per file with explicit compound component patterns

**Error Handling Rules:**

- `no-empty-catch` - Prevent empty catch blocks in try-catch statements (with auto-fix)

**Forms Rules:**

- `form-config-extraction` - Require form configuration parameters to be defined in separate constant files

**Icon Rules:**

- `single-svg-per-file` - Ensure only one SVG icon per file
- `svg-currentcolor` - Ensure single-color SVGs use `currentColor` (with auto-fix)
- `memoized-export` - Ensure icon components are memoized using `React.memo` (with auto-fix)

**JSX Rules:**

- `no-inline-objects` - Prevent inline object literals in JSX props
- `no-inline-functions` - Prevent inline function declarations in JSX props

**Naming Rules:**

- `boolean-naming-convention` - Enforce boolean variables to follow naming convention with prefixes (configurable)

**Readability Rules:**

- `no-nested-ternary` - Disallow nested ternary operators

**Services Rules:**

- `no-response-data-return` - Prevent direct `response.data` returns in service layer files

#### Configuration Presets

**Base Configuration:**

- Core TypeScript recommended, stylistic, and strict rules
- Import sorting and management with `eslint-plugin-simple-import-sort`
- Prettier integration with `eslint-plugin-prettier`
- React and React Hooks configuration
- No custom rules enabled by default

**Recommended Configuration:**

- Extends base configuration
- Enables commonly used custom rules at 'error' level
- Suitable for most projects
- Includes: `one-component-per-file`, `no-empty-catch`, `no-inline-objects`, `no-inline-functions`, `boolean-naming-convention`, `no-nested-ternary`

**Strict Configuration:**

- Extends recommended configuration
- Enables ALL custom rules
- Maximum code quality enforcement
- Additional rules: `form-config-extraction`, `single-svg-per-file`, `svg-currentcolor`, `memoized-export`, `no-response-data-return`

#### Testing

- Comprehensive property-based testing using `fast-check`
- All property tests run 100+ iterations for reliability
- Unit tests for all custom rules with valid and invalid examples
- Test coverage for rule-to-test correspondence
- Build output verification tests

#### Package Features

- TypeScript-first with full type safety and IntelliSense support
- ESLint 9.x flat config support
- Auto-fix support for applicable rules
- Comprehensive documentation with examples
- Multiple installation methods (npm, yarn, yalc, Git)

### 📦 Installation Methods

- **npm/yarn**: Standard package manager installation
- **yalc**: Local development and testing workflow
- **Git**: Direct installation from Git repository with version tags

### 📚 Documentation

- Complete README with installation instructions
- Usage examples for all configuration presets
- Detailed documentation for each custom rule with code examples
- Troubleshooting guide for common issues
- Migration guide for existing projects
- Gradual adoption strategy for large codebases

### 🔧 Technical Details

- **Minimum Node Version**: 18.0.0
- **Peer Dependencies**: ESLint ^9.0.0, TypeScript ^5.0.0
- **Build Target**: ES2022 with ESNext modules
- **Source Maps**: Enabled for debugging
- **Declaration Files**: Full TypeScript type definitions included

### 🎯 Import Alias Support

Verified consistency across:

- TypeScript configuration (`tsconfig.json`, `tsconfig.app.json`)
- Vite configuration (`vite.config.ts`)
- Vitest configuration (`vitest.config.ts`)
- ESLint import resolver settings

### 🧪 Quality Assurance

- Property-based tests for:
    - Import alias consistency across configurations
    - Rule-to-test correspondence
    - Build output completeness
    - Semantic version format validation
    - Property test iteration count verification
    - Test case completeness
- Unit tests for all custom rules
- Configuration preset validation tests

### 📝 Migration Notes

#### From ESLint 8.x

This package requires ESLint 9.x with flat config format. To migrate:

1. Update ESLint to version 9.x
2. Convert your configuration to flat config format
3. Install `@vertex-era-rules`
4. Use one of the provided configuration presets

#### Gradual Adoption

For large existing codebases:

1. Start with the `base` configuration preset
2. Enable custom rules individually with 'warn' severity
3. Fix issues incrementally
4. Upgrade to 'error' severity once issues are resolved
5. Move to `recommended` or `strict` preset when ready

#### Breaking Changes from Internal Usage

If migrating from internal usage of these rules:

- Plugin name changed to `@vertex-era-rules`
- Rules must be prefixed with `custom/` (e.g., `custom/one-component-per-file`)
- Configuration presets are now available as `configs.base`, `configs.recommended`, `configs.strict`
- Import path changed to `@vertex-era-rules` instead of local paths

### 🔗 Resources

- [GitHub Repository](https://github.com/vertex-era/eslint-rules)
- [Issue Tracker](https://github.com/vertex-era/eslint-rules/issues)
- [ESLint Documentation](https://eslint.org/)
- [TypeScript ESLint](https://typescript-eslint.io/)

---

## Future Releases

See [GitHub Issues](https://github.com/vertex-era/eslint-rules/issues) for planned features and enhancements.

### Planned Enhancements

- Additional custom rules (no-default-export, prefer-const-assertion, no-magic-numbers)
- Enhanced auto-fix support for more rules
- Performance optimizations with caching
- VS Code extension with rule snippets
- Interactive rule playground
- Additional configuration presets for specific frameworks

---

**Note**: This is the initial stable release. Future versions will follow semantic versioning:

- **Major** (x.0.0): Breaking changes to rule behavior or configuration structure
- **Minor** (0.x.0): New rules, new configuration presets, non-breaking enhancements
- **Patch** (0.0.x): Bug fixes, documentation updates, dependency updates
