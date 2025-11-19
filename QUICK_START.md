# Quick Start Guide

## Installation

```bash
# Using npm
npm install --save-dev git+https://github.com/AliEl-Zayat/vertex-era-rules.git

# Using pnpm
pnpm add --save-dev git+https://github.com/AliEl-Zayat/vertex-era-rules.git

# Using yarn
yarn add --dev git+https://github.com/AliEl-Zayat/vertex-era-rules.git
```

## Basic Setup

Create `eslint.config.mjs` in your project root:

```javascript
import vertexEraRules from '@vertex-era/eslint-rules';

export default [
  ...vertexEraRules.configs.recommended,
];
```

That's it! You're ready to lint:

```bash
npx eslint .
# or
pnpm eslint .
```

## Configuration Options

### Recommended (Default)

Best for most projects - includes base rules + common custom rules:

```javascript
export default [...vertexEraRules.configs.recommended];
```

### Base Only

Just TypeScript, imports, and Prettier - no custom rules:

```javascript
export default [...vertexEraRules.configs.base];
```

### Strict

All rules enabled - maximum code quality:

```javascript
export default [...vertexEraRules.configs.strict];
```

### With Custom Overrides

```javascript
export default [
  ...vertexEraRules.configs.recommended,
  {
    rules: {
      // Adjust rule severity
      'custom/no-inline-objects': 'warn',
      
      // Disable specific rules
      'custom/one-component-per-file': 'off',
    },
  },
];
```

## Common Issues

### Error: "configs is not iterable"

Make sure you're spreading a specific config, not the configs object:

```javascript
// ❌ Wrong
export default [...vertexEraRules.configs];

// ✅ Correct
export default [...vertexEraRules.configs.recommended];
```

### Error: "requires type information"

The base configs now work without type information. If you see this error after updating, just reinstall:

```bash
pnpm install git+https://github.com/AliEl-Zayat/vertex-era-rules.git
```

## Available Rules

- `custom/one-component-per-file` - One React component per file
- `custom/no-empty-catch` - No empty catch blocks
- `custom/form-config-extraction` - Extract form configs
- `custom/single-svg-per-file` - One SVG per icon file
- `custom/svg-currentcolor` - Use currentColor in SVGs
- `custom/memoized-export` - Memoize icon exports
- `custom/no-inline-objects` - No inline objects in JSX
- `custom/no-inline-functions` - No inline functions in JSX
- `custom/boolean-naming-convention` - Boolean naming (is/has/should)
- `custom/no-nested-ternary` - No nested ternaries
- `custom/no-response-data-return` - Don't return response.data

## Need Help?

- See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed solutions
- Check [examples/](./examples/) for working configurations
- Read the full [README.md](./README.md) for comprehensive documentation
