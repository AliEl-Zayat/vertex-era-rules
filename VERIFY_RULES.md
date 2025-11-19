# Verify Rules Are Working

## Quick Test

Run this command in your project to verify all rules are loaded:

```bash
node -e "import('@vertex-era/eslint-rules').then(m => {
  console.log('✅ Package loaded');
  console.log('📦 Available rules:', Object.keys(m.default.rules));
  console.log('');
  console.log('🔍 Checking boolean-naming-convention...');
  console.log('  - Rule exists:', !!m.default.rules['boolean-naming-convention']);
  
  const config = m.default.configs.recommended.find(c => c.rules);
  console.log('  - In recommended config:', config?.rules?.['custom/boolean-naming-convention']);
}).catch(e => console.error('❌ Error:', e.message))"
```

## Expected Output

```
✅ Package loaded
📦 Available rules: [
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

🔍 Checking boolean-naming-convention...
  - Rule exists: true
  - In recommended config: error
```

## If Rules Are Missing

### 1. Reinstall the Package

```bash
# Remove the package
pnpm remove @vertex-era/eslint-rules

# Clear pnpm cache (optional but recommended)
pnpm store prune

# Reinstall from latest
pnpm add git+https://github.com/AliEl-Zayat/vertex-era-rules.git
```

### 2. Verify Your Config

Make sure your `eslint.config.mjs` is correct:

```javascript
import vertexEraRules from '@vertex-era/eslint-rules';

export default [
  ...vertexEraRules.configs.recommended,  // ✅ Correct
];

// ❌ Wrong - don't do this
// export default [...vertexEraRules.configs];
```

### 3. Check ESLint is Using the Config

```bash
# Run ESLint with debug output
pnpm eslint --debug . 2>&1 | grep "boolean-naming-convention"
```

### 4. Test the Rule Directly

Create a test file to verify the rule works:

```typescript
// test-boolean-rule.ts

// ❌ This should trigger an error
const enabled = true;  // Should be: isEnabled, hasEnabled, etc.

// ✅ This should be fine
const isEnabled = true;
const hasPermission = false;
const shouldShow = true;
```

Run ESLint on it:

```bash
pnpm eslint test-boolean-rule.ts
```

Expected error:
```
error  Boolean variable 'enabled' should follow naming convention with prefixes: is, has, should, can, will, as, with  custom/boolean-naming-convention
```

## Rule Configuration

The boolean-naming-convention rule accepts these prefixes by default:
- `is` - isEnabled, isVisible
- `has` - hasPermission, hasAccess
- `should` - shouldShow, shouldRender
- `can` - canEdit, canDelete
- `will` - willUpdate, willChange
- `as` - asBoolean, asFlag
- `with` - withFlag, withOption

### Custom Configuration

You can customize the allowed prefixes:

```javascript
export default [
  ...vertexEraRules.configs.recommended,
  {
    rules: {
      'custom/boolean-naming-convention': ['error', {
        allowedPrefixes: ['is', 'has', 'should'],  // Only allow these
      }],
    },
  },
];
```

## Still Not Working?

1. Check your Node.js version: `node --version` (should be >= 18.0.0)
2. Check your ESLint version: `pnpm list eslint` (should be >= 9.0.0)
3. Check the package is installed: `pnpm list @vertex-era/eslint-rules`
4. Try running with `--no-cache`: `pnpm eslint --no-cache .`

If none of this works, please provide:
- Your `eslint.config.mjs` file
- Output of `pnpm list @vertex-era/eslint-rules`
- Output of the verification command above
