# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

### [1.2.1](https://github.com/AliEl-Zayat/vertex-era-rules/compare/v1.1.0...v1.2.1) (2025-12-03)


### Features

* add file-specific configs for main.tsx and shadcn ui ([5e83772](https://github.com/AliEl-Zayat/vertex-era-rules/commit/5e83772f93588d612da426e349e9741d841a8820))

## 1.2.0 (2025-11-25)

### Added

* Add `mainTsxConfig` file-specific configuration to disable `@typescript-eslint/no-non-null-assertion` for `main.tsx` entry files
* Add `shadcnUiConfig` file-specific configuration with relaxed rules for shadcn UI components (`**/ui/*.{ts,tsx}`)
* Add example file `examples/shadcn-ui-config.ts` demonstrating usage of file-specific configurations

## 1.1.0 (2025-11-25)


### Features

* improve type safety with eslintutils.rulecreator ([2d77111](https://github.com/AliEl-Zayat/vertex-era-rules/commit/2d771114e27f69a78e206f4b25b1a23937e674c8))
* sync library with vertex-era-rules - add configs, examples, and docs ([605fdb7](https://github.com/AliEl-Zayat/vertex-era-rules/commit/605fdb7617f442faae014ce6f13190f55503375c))


### Bug Fixes

* update github repository urls to eslint-rules-zayat ([c74b131](https://github.com/AliEl-Zayat/vertex-era-rules/commit/c74b131fac6c741d0ce5e22127b113347e1344ee))

## [1.0.0] - 2024-01-01

### Added

- Initial release of `zayat-eslint-rules`

#### Custom Rules (12 total)

- **Component Rules**
  - `custom/one-component-per-file` - Enforce one React component per file with compound component support

- **Error Handling Rules**
  - `custom/no-empty-catch` - Prevent empty catch blocks with auto-fix for intentional ignores

- **Forms Rules**
  - `custom/form-config-extraction` - Enforce form configuration extraction to constants files

- **Icon Rules**
  - `custom/single-svg-per-file` - Enforce one SVG icon per file
  - `custom/svg-currentcolor` - Enforce currentColor usage in single-color SVGs with auto-fix
  - `custom/memoized-export` - Enforce React.memo for icon exports with auto-fix

- **JSX Rules**
  - `custom/no-inline-objects` - Prevent inline object literals in JSX props
  - `custom/no-inline-functions` - Prevent inline function declarations in JSX props

- **Naming Rules**
  - `custom/boolean-naming-convention` - Enforce boolean variable naming conventions (is/has/should/can/will prefix)

- **Readability Rules**
  - `custom/no-nested-ternary` - Prevent nested ternary operators

- **Services Rules**
  - `custom/no-response-data-return` - Prevent direct response.data returns in service layer

#### Configurations

- `base` - Core ESLint + TypeScript configuration without custom rules
- `recommended` - Base + common custom rules for most projects
- `strict` - All custom rules enabled for maximum code quality
- `typeAware` - Additional TypeScript rules requiring type information
- `naming` - TypeScript naming conventions (T prefix for types, I prefix for interfaces)
- `redux` - Redux typed hooks enforcement (useAppSelector, useAppDispatch)

#### Features

- **Prettier Integration** - Auto-detects existing Prettier config or creates default
- **VS Code Settings Helper** - Generates recommended VS Code settings to prevent conflicts
- **Postinstall Script** - Automatic setup guidance after installation
- **ESM Support** - Full ECMAScript modules support

### Dependencies

- ESLint 9.x (flat config)
- TypeScript 5.x
- typescript-eslint 8.x
- eslint-config-prettier
- eslint-plugin-prettier
- eslint-plugin-import
- eslint-plugin-simple-import-sort
- eslint-plugin-unused-imports

---

## [Unreleased]

### Planned

- Additional rules for React hooks best practices
- Support for React Native specific patterns
- More comprehensive auto-fix capabilities
- Integration tests for all rules

---

## Contributing

When contributing, please update this changelog with your changes under the `[Unreleased]` section.

Categories to use:
- `Added` - New features
- `Changed` - Changes in existing functionality
- `Deprecated` - Soon-to-be removed features
- `Removed` - Removed features
- `Fixed` - Bug fixes
- `Security` - Vulnerability fixes
