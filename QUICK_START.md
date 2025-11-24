# Quick Start Guide

Get up and running with `zayat-eslint-rules` in minutes.

## Prerequisites

- Node.js >= 18.0.0
- ESLint >= 9.0.0
- TypeScript >= 5.0.0

## Installation

```bash
# Using npm
npm install zayat-eslint-rules --save-dev

# Using yarn
yarn add -D zayat-eslint-rules

# Using pnpm
pnpm add -D zayat-eslint-rules

# Or install via Git
npm install git+https://github.com/AliEl-Zayat/vertex-era-rules.git
```

## Basic Setup

### Step 1: Create ESLint Config

Create `eslint.config.ts` (or `eslint.config.js`) in your project root:

```typescript
import eslintRules from 'zayat-eslint-rules';

export default [
  ...eslintRules.configs.recommended,
];
```

That's it! You now have:
- ESLint recommended rules
- TypeScript recommended, stylistic, and strict rules
- Import sorting and unused import detection
- Prettier integration
- TypeScript naming conventions (T/I prefix)
- Redux typed hooks enforcement
- 6 custom rules for React best practices

### Step 2: Run ESLint

```bash
# Lint your code
npx eslint .

# Lint and fix
npx eslint . --fix
```

## Configuration Options

### Recommended (Default)

Best for most projects. Includes common custom rules:

```typescript
import eslintRules from 'zayat-eslint-rules';

export default [
  ...eslintRules.configs.recommended,
];
```

**Enabled rules:**
- `custom/one-component-per-file`
- `custom/no-empty-catch`
- `custom/no-inline-objects`
- `custom/no-inline-functions`
- `custom/boolean-naming-convention`
- `custom/no-nested-ternary`

### Strict

For maximum code quality. Enables ALL custom rules:

```typescript
import eslintRules from 'zayat-eslint-rules';

export default [
  ...eslintRules.configs.strict,
];
```

**Additional rules:**
- `custom/form-config-extraction`
- `custom/no-response-data-return`
- `custom/single-svg-per-file` (icon files only)
- `custom/svg-currentcolor` (icon files only)
- `custom/memoized-export` (icon files only)

### Type-Aware

For projects that want TypeScript type-checking rules:

```typescript
import eslintRules from 'zayat-eslint-rules';

export default [
  ...eslintRules.configs.recommended,
  ...eslintRules.configs.typeAware,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
  },
];
```

## VS Code Setup

For the best experience, add these settings to `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

Or generate them programmatically:

```typescript
import { getVSCodeSettingsJSON } from '@zayat/eslint-custom-rules';

console.log(getVSCodeSettingsJSON());
```

## Common Customizations

### Disable a Specific Rule

```typescript
export default [
  ...eslintRules.configs.recommended,
  {
    rules: {
      'custom/boolean-naming-convention': 'off',
    },
  },
];
```

### Change Rule to Warning

```typescript
export default [
  ...eslintRules.configs.recommended,
  {
    rules: {
      'custom/no-inline-objects': 'warn',
    },
  },
];
```

### Add Custom Ignores

```typescript
export default [
  {
    ignores: ['**/dist/**', '**/legacy/**'],
  },
  ...eslintRules.configs.recommended,
];
```

### Override for Specific Files

```typescript
export default [
  ...eslintRules.configs.recommended,
  {
    files: ['**/*.test.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
```

## Next Steps

- Read the full [README](README.md) for detailed rule documentation
- Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) if you encounter issues
- See [examples/](examples/) for more configuration examples
- Review [CHANGELOG.md](CHANGELOG.md) for version history

## Need Help?

- [GitHub Issues](https://github.com/AliEl-Zayat/vertex-era-rules/issues)
- [Documentation](https://github.com/AliEl-Zayat/vertex-era-rules)

