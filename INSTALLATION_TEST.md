# Installation Test Guide

## Test the package installation

To verify the package works correctly when installed from Git:

### 1. Create a test project

```bash
mkdir test-vertex-era-rules
cd test-vertex-era-rules
npm init -y
```

### 2. Install the package from Git

```bash
npm install --save-dev git+https://github.com/AliEl-Zayat/vertex-era-rules.git
```

### 3. Create a test ESLint config

Create `eslint.config.js`:

```javascript
import vertexEraRules from '@vertex-era/eslint-rules';

export default [
  ...vertexEraRules.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      // Your custom overrides
    },
  },
];
```

### 4. Test that it loads

```bash
node -e "import('@vertex-era/eslint-rules').then(m => console.log('✅ Package loaded successfully!', Object.keys(m))).catch(e => console.error('❌ Error:', e.message))"
```

### Expected output

```
✅ Package loaded successfully! [ 'configs', 'default', 'plugin', 'rules' ]
```

### 5. Verify rules are available

```bash
node -e "import('@vertex-era/eslint-rules').then(m => console.log('Available rules:', Object.keys(m.default.rules))).catch(e => console.error('Error:', e.message))"
```

### Expected output

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

## Troubleshooting

### Error: Cannot find module

If you see module resolution errors, ensure:
1. You're using Node.js 18.0.0 or higher
2. Your project has `"type": "module"` in package.json (for ESM)
3. All dependencies are installed: `npm install`

### Error: Invalid package name

Make sure you're using the correct package name: `@vertex-era/eslint-rules`

### Error: Module not found in dist

This means the build files weren't committed. Run:
```bash
npm run build
git add dist/
git commit -m "Add dist files"
git push
```
