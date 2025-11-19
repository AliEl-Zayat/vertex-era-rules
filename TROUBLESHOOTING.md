# Troubleshooting Guide

## Common Issues and Solutions

### Error: "You have used a rule which requires type information"

**Problem:** You're using type-aware TypeScript rules without configuring `parserOptions.project`.

**Solution:**

The base and recommended configs now avoid type-aware rules by default. If you see this error, you have two options:

**Option 1: Remove type-aware rules (Recommended)**

The package now works without type-aware rules by default. Just use the standard configs:

```javascript
import vertexEraRules from '@vertex-era/eslint-rules';

export default [
  ...vertexEraRules.configs.recommended,
];
```

**Option 2: Enable type-aware rules (Advanced)**

If you specifically want type-aware rules, use the `typeAware` config and configure the parser:

```javascript
import vertexEraRules from '@vertex-era/eslint-rules';

export default [
  ...vertexEraRules.configs.recommended,
  ...vertexEraRules.configs.typeAware,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
  },
];
```

### Error: "vertexEraRules.configs is not iterable"

**Problem:** You're trying to spread the `configs` object itself instead of a specific config array.

**❌ Wrong:**
```javascript
import vertexEraRules from '@vertex-era/eslint-rules';

// This will fail because configs is an object, not an array
export default [...vertexEraRules.configs];
```

**✅ Correct:**
```javascript
import vertexEraRules from '@vertex-era/eslint-rules';

// Spread a specific config array
export default [...vertexEraRules.configs.recommended];
// or
export default [...vertexEraRules.configs.base];
// or
export default [...vertexEraRules.configs.strict];
```

### Error: "Cannot find module '@vertex-era/eslint-rules'"

**Problem:** The package isn't installed or the name is incorrect.

**Solution:**
```bash
# Reinstall the package
npm install git+https://github.com/AliEl-Zayat/vertex-era-rules.git

# Or with pnpm
pnpm add git+https://github.com/AliEl-Zayat/vertex-era-rules.git
```

### Error: "Cannot find module '...dist/eslint-plugin-custom/utils/ast-helpers'"

**Problem:** Missing `.js` extensions in imports (this should be fixed in the latest version).

**Solution:**
```bash
# Update to the latest version
npm install git+https://github.com/AliEl-Zayat/vertex-era-rules.git#main

# Or reinstall
npm uninstall @vertex-era/eslint-rules
npm install git+https://github.com/AliEl-Zayat/vertex-era-rules.git
```

### Error: "Module not found" or "Cannot resolve module"

**Problem:** Your project might not be configured for ESM.

**Solution:**

1. Make sure your `package.json` has:
```json
{
  "type": "module"
}
```

2. Use `.mjs` extension for your ESLint config:
```bash
mv eslint.config.js eslint.config.mjs
```

3. Or use `.cjs` with CommonJS:
```javascript
// eslint.config.cjs
const vertexEraRules = require('@vertex-era/eslint-rules');

module.exports = [
  ...vertexEraRules.configs.recommended,
];
```

### Config Not Working / Rules Not Applied

**Problem:** The config might not be properly structured.

**Solution:**

Check your `eslint.config.mjs`:

```javascript
import vertexEraRules from '@vertex-era/eslint-rules';

export default [
  // ✅ Spread the config array
  ...vertexEraRules.configs.recommended,
  
  // Add your custom overrides
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      // Override specific rules
      'custom/no-inline-objects': 'warn',
    },
  },
];
```

### Using Individual Rules

If you want to use only specific rules without the full config:

```javascript
import vertexEraRules from '@vertex-era/eslint-rules';

export default [
  {
    plugins: {
      custom: vertexEraRules.plugin,
    },
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      'custom/one-component-per-file': 'error',
      'custom/no-empty-catch': 'error',
      'custom/no-inline-objects': 'warn',
    },
  },
];
```

### Checking Package Installation

Verify the package is installed correctly:

```bash
# Check if the package is installed
npm list @vertex-era/eslint-rules

# Test if the module loads
node -e "import('@vertex-era/eslint-rules').then(m => console.log('✅ Package loaded!', Object.keys(m))).catch(e => console.error('❌ Error:', e.message))"
```

Expected output:
```
✅ Package loaded! [ 'configs', 'default', 'plugin', 'rules' ]
```

### Verify Available Configs

```bash
node -e "import('@vertex-era/eslint-rules').then(m => console.log('Available configs:', Object.keys(m.default.configs))).catch(e => console.error('Error:', e.message))"
```

Expected output:
```
Available configs: [ 'base', 'recommended', 'strict' ]
```

### Verify Available Rules

```bash
node -e "import('@vertex-era/eslint-rules').then(m => console.log('Available rules:', Object.keys(m.default.rules))).catch(e => console.error('Error:', e.message))"
```

Expected output:
```
Available rules: [
  'one-component-per-file',
  'no-empty-catch',
  'form-config-extraction',
  'single-svg-per-file',
  'svg-currentcolor',
  'memoized-export',
  'no-inline-objects',
  'no-inline-functions',
  'boolean-naming-convention',
  'no-nested-ternary',
  'no-response-data-return'
]
```

## Still Having Issues?

1. Check the [examples](./examples/) directory for working configurations
2. Make sure you're using Node.js 18.0.0 or higher
3. Verify ESLint 9.0.0 or higher is installed
4. Check that TypeScript 5.0.0 or higher is installed (if using TypeScript)
5. Open an issue on GitHub with:
   - Your `eslint.config.js` file
   - Your `package.json`
   - The full error message
   - Node.js version (`node --version`)
   - npm/pnpm/yarn version
