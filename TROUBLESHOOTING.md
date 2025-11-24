# Troubleshooting Guide

Solutions to common issues when using `zayat-eslint-rules`.

## Table of Contents

- [Installation Issues](#installation-issues)
- [ESLint Configuration Issues](#eslint-configuration-issues)
- [Rule-Specific Issues](#rule-specific-issues)
- [Prettier Conflicts](#prettier-conflicts)
- [VS Code Issues](#vs-code-issues)
- [TypeScript Issues](#typescript-issues)
- [Performance Issues](#performance-issues)

---

## Installation Issues

### Cannot find module '@zayat/eslint-custom-rules'

**Cause:** Package not installed or incorrect import path.

**Solution:**

```bash
# Verify installation
npm list zayat-eslint-rules

# Reinstall if missing
npm install zayat-eslint-rules --save-dev
```

### Module resolution errors with Git installation

**Cause:** When installing from Git, the package name in `node_modules` may differ.

**Solution:**

```bash
# Install from the publish branch
npm install git+https://github.com/AliEl-Zayat/vertex-era-rules.git#publish
```

### Peer dependency warnings

**Cause:** Missing or incompatible peer dependencies.

**Solution:**

```bash
npm install --save-dev eslint@^9.0.0 typescript@^5.0.0
```

---

## ESLint Configuration Issues

### Error: ESLint couldn't find the config

**Cause:** ESLint 9.x requires flat config format.

**Solution:** Ensure your config file is named correctly:
- `eslint.config.js`
- `eslint.config.mjs`
- `eslint.config.ts` (requires tsx or ts-node)

### Rules not being applied

**Cause:** Plugin not loaded correctly.

**Solution:** Verify the plugin is properly configured:

```typescript
import eslintRules from 'zayat-eslint-rules';

// Check plugin is loaded
console.log(eslintRules.plugin.rules);

export default [
  ...eslintRules.configs.recommended,
];
```

**Debug command:**

```bash
npx eslint --print-config src/App.tsx
```

### Config array spread issues

**Cause:** Configs must be spread into the array.

**Solution:**

```typescript
// ❌ Wrong
export default [
  eslintRules.configs.recommended,  // Missing spread
];

// ✅ Correct
export default [
  ...eslintRules.configs.recommended,  // With spread
];
```

---

## Rule-Specific Issues

### `custom/boolean-naming-convention` false positives

**Cause:** Rule triggers on non-boolean variables.

**Solution:** The rule only triggers on:
- Variables with explicit `: boolean` type annotation
- Variables initialized with `true`, `false`, or `!expression`
- Variables with inferred boolean type (requires type-aware config)

If you get false positives, ensure your type annotations are correct.

### `custom/no-response-data-return` not triggering

**Cause:** Rule only applies to files in `src/services/` directory.

**Solution:** Ensure your service files are in the correct path:
- `src/services/userService.ts` ✅
- `services/userService.ts` ❌ (missing src/)
- `src/api/userService.ts` ❌ (wrong folder name)

### Icon rules not applying

**Cause:** Rules only apply to files matching icon patterns.

**Solution:** The strict config applies icon rules to:
- `**/icons/**/*.{ts,tsx}`
- `**/icon/**/*.{ts,tsx}`
- `**/*Icon.{ts,tsx}`

Rename your icon files to match these patterns or add custom file patterns:

```typescript
{
  files: ['**/my-icons/**/*.tsx'],
  rules: {
    'custom/single-svg-per-file': 'error',
    'custom/svg-currentcolor': 'error',
    'custom/memoized-export': 'error',
  },
}
```

---

## Prettier Conflicts

### Conflicting rules between ESLint and Prettier

**Cause:** Both ESLint and Prettier trying to format the same code.

**Solution:** This package includes `eslint-config-prettier` which should handle this automatically. If you still see conflicts:

1. Ensure `eslint-config-prettier` is at the end of your config:

```typescript
import eslintRules from 'zayat-eslint-rules';

export default [
  ...eslintRules.configs.recommended,
  // eslint-config-prettier is already included at the end
];
```

2. Check for duplicate Prettier rules in your config.

### Prettier config not detected

**Cause:** Non-standard Prettier config location.

**Solution:** The package looks for these files:
- `.prettierrc`
- `.prettierrc.json`
- `.prettierrc.yml` / `.prettierrc.yaml`
- `.prettierrc.js` / `.prettierrc.cjs` / `.prettierrc.mjs`
- `prettier.config.js` / `.cjs` / `.mjs` / `.ts`
- `prettier` field in `package.json`

Ensure your config is in one of these locations.

---

## VS Code Issues

### ESLint extension not showing errors

**Cause:** VS Code ESLint extension not configured for flat config.

**Solution:** Add to `.vscode/settings.json`:

```json
{
  "eslint.useFlatConfig": true,
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

### Duplicate formatting on save

**Cause:** Both Prettier extension and ESLint trying to format.

**Solution:** Use our recommended VS Code settings:

```typescript
import { getVSCodeSettingsJSON } from '@zayat/eslint-custom-rules';
console.log(getVSCodeSettingsJSON());
```

Or manually configure:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

---

## TypeScript Issues

### Parser errors on TypeScript files

**Cause:** TypeScript parser not configured.

**Solution:** The base config includes TypeScript parser. If you see errors, ensure:

```typescript
export default [
  ...eslintRules.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
  },
];
```

### Type-aware rules not working

**Cause:** Missing `parserOptions.project`.

**Solution:**

```typescript
export default [
  ...eslintRules.configs.recommended,
  ...eslintRules.configs.typeAware,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
```

### "Cannot read file tsconfig.json"

**Cause:** TypeScript config path incorrect.

**Solution:** Use absolute path:

```typescript
import path from 'node:path';

export default [
  ...eslintRules.configs.typeAware,
  {
    languageOptions: {
      parserOptions: {
        project: path.resolve(import.meta.dirname, './tsconfig.json'),
      },
    },
  },
];
```

---

## Performance Issues

### ESLint is slow

**Cause:** Large codebase, many files, or type-aware rules.

**Solutions:**

1. **Enable caching:**

```bash
npx eslint . --cache --cache-location .eslintcache
```

2. **Ignore unnecessary files:**

```typescript
export default [
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/coverage/**'],
  },
  ...eslintRules.configs.recommended,
];
```

3. **Disable type-aware rules if not needed:**

```typescript
// Don't include typeAware config if not necessary
export default [
  ...eslintRules.configs.recommended,
  // ...eslintRules.configs.typeAware,  // Comment out if slow
];
```

4. **Use parallel linting:**

```bash
npx eslint . --max-warnings 0 --parallel
```

---

## Still Having Issues?

If your issue isn't covered here:

1. **Check existing issues:** [GitHub Issues](https://github.com/AliEl-Zayat/vertex-era-rules/issues)

2. **Create a new issue** with:
   - ESLint version (`npx eslint --version`)
   - TypeScript version (`npx tsc --version`)
   - Node.js version (`node --version`)
   - Your `eslint.config.ts` content
   - Minimal reproduction example

3. **Debug output:**

```bash
# Print final config
npx eslint --print-config src/App.tsx

# Debug mode
DEBUG=eslint:* npx eslint src/App.tsx
```

