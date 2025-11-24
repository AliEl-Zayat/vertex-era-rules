# Installation Test Guide

This guide helps you verify that `zayat-eslint-rules` is correctly installed and configured.

## Quick Verification

### Step 1: Check Installation

```bash
# Verify package is installed
npm list zayat-eslint-rules

# Expected output (version may differ):
# └── zayat-eslint-rules@1.0.0
```

### Step 2: Verify Import

Create a test file `test-eslint.js`:

```javascript
import eslintRules from 'zayat-eslint-rules';

console.log('✅ Package imported successfully');
console.log('📦 Plugin name:', eslintRules.plugin.meta.name);
console.log('📋 Available rules:', Object.keys(eslintRules.plugin.rules).length);
console.log('⚙️  Available configs:', Object.keys(eslintRules.configs).length);
```

Run it:

```bash
node --experimental-vm-modules test-eslint.js
```

### Step 3: Test ESLint Config

Create a minimal `eslint.config.js`:

```javascript
import eslintRules from 'zayat-eslint-rules';

export default [...eslintRules.configs.recommended];
```

Run ESLint:

```bash
npx eslint --print-config src/App.tsx | head -50
```

You should see configuration output with `custom/` rules included.

## Detailed Verification

### Verify All Rules Are Available

```javascript
import eslintRules from 'zayat-eslint-rules';

const expectedRules = [
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
  'no-response-data-return',
];

const availableRules = Object.keys(eslintRules.plugin.rules);

console.log('Expected rules:', expectedRules.length);
console.log('Available rules:', availableRules.length);

const missing = expectedRules.filter(r => !availableRules.includes(r));
const extra = availableRules.filter(r => !expectedRules.includes(r));

if (missing.length === 0) {
  console.log('✅ All expected rules are available');
} else {
  console.log('❌ Missing rules:', missing);
}

if (extra.length > 0) {
  console.log('ℹ️  Additional rules:', extra);
}
```

### Verify Configs Are Available

```javascript
import eslintRules from 'zayat-eslint-rules';

const expectedConfigs = ['base', 'recommended', 'strict', 'typeAware'];

const availableConfigs = Object.keys(eslintRules.configs);

console.log('Available configs:', availableConfigs);

const hasAll = expectedConfigs.every(c => availableConfigs.includes(c));

if (hasAll) {
  console.log('✅ All expected configs are available');
} else {
  console.log('❌ Missing configs');
}
```

### Verify Utilities Are Available

```javascript
import {
  detectPrettierConfig,
  getPrettierConfigForESLint,
  getRecommendedVSCodeSettings,
  getVSCodeSettingsJSON,
} from 'zayat-eslint-rules';

console.log('✅ Prettier detection:', typeof detectPrettierConfig === 'function');
console.log('✅ Prettier config getter:', typeof getPrettierConfigForESLint === 'function');
console.log('✅ VS Code settings:', typeof getRecommendedVSCodeSettings === 'function');
console.log('✅ VS Code JSON:', typeof getVSCodeSettingsJSON === 'function');
```

## Test Rules Are Working

### Test: `no-empty-catch`

Create `test-no-empty-catch.ts`:

```typescript
try {
  doSomething();
} catch (error) {
  // Empty catch - should trigger error
}
```

Run:

```bash
npx eslint test-no-empty-catch.ts
```

Expected: Error about empty catch block.

### Test: `boolean-naming-convention`

Create `test-boolean-naming.ts`:

```typescript
const enabled: boolean = true; // Should trigger error
const isEnabled: boolean = true; // Should pass
```

Run:

```bash
npx eslint test-boolean-naming.ts
```

Expected: Error on `enabled`, no error on `isEnabled`.

### Test: `no-nested-ternary`

Create `test-nested-ternary.ts`:

```typescript
const color = isActive ? 'green' : isError ? 'red' : 'gray'; // Should trigger
```

Run:

```bash
npx eslint test-nested-ternary.ts
```

Expected: Error about nested ternary.

## Clean Up

After testing, remove test files:

```bash
rm test-eslint.js test-*.ts
```

## Common Issues During Testing

### "Cannot find module"

```bash
# Make sure you're in the project directory
cd your-project

# Reinstall
npm install
```

### "ESLint couldn't find config"

Ensure you have `eslint.config.js` or `eslint.config.ts` in your project root.

### TypeScript errors

For `.ts` config files, you may need:

```bash
npm install --save-dev tsx
```

Then run:

```bash
npx tsx node_modules/.bin/eslint .
```

Or use `.js` extension instead.

## Success Criteria

Your installation is successful if:

- [ ] Package is listed in `npm list`
- [ ] Import works without errors
- [ ] All 11+ rules are available
- [ ] All 4 configs are available
- [ ] Utility functions are accessible
- [ ] `npx eslint .` runs without config errors
- [ ] Test rules trigger expected errors

## Next Steps

Once verified:

1. Configure rules for your project in `eslint.config.ts`
2. Set up VS Code settings for best experience
3. Run `npx eslint . --fix` to auto-fix issues
4. Add to CI/CD pipeline

