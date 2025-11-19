# @vertex-era-rules

> Comprehensive ESLint plugin with custom rules for React/TypeScript projects

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![ESLint](https://img.shields.io/badge/ESLint-9.0+-purple.svg)](https://eslint.org/)
[![Node](https://img.shields.io/badge/Node-18.0+-green.svg)](https://nodejs.org/)

A production-ready ESLint plugin featuring 12 custom rules designed to enforce best practices, improve code quality, and enhance developer experience in React/TypeScript projects. Built with comprehensive property-based testing using fast-check.

## ✨ Features

- 🎯 **12 Custom Rules** across 8 categories (component, error-handling, forms, icon, jsx, naming, readability, services)
- 📦 **3 Configuration Presets** (base, recommended, strict) for different project needs
- 🔧 **Auto-fix Support** for many rules to streamline code improvements
- ✅ **Property-Based Testing** with 100+ iterations per test for reliability
- 🚀 **TypeScript-First** with full type safety and IntelliSense support
- 📚 **Comprehensive Documentation** with examples for every rule

## 📦 Installation

### Install from GitHub

```bash
# Using npm
npm install --save-dev git+https://github.com/AliEl-Zayat/vertex-era-rules.git

# Using yarn
yarn add --dev git+https://github.com/AliEl-Zayat/vertex-era-rules.git

# Using pnpm
pnpm add --save-dev git+https://github.com/AliEl-Zayat/vertex-era-rules.git
```

### Install specific version/branch/tag

```bash
# Install from a specific branch
npm install --save-dev git+https://github.com/AliEl-Zayat/vertex-era-rules.git#main

# Install from a specific tag
npm install --save-dev git+https://github.com/AliEl-Zayat/vertex-era-rules.git#v1.0.0

# Install from a specific commit
npm install --save-dev git+https://github.com/AliEl-Zayat/vertex-era-rules.git#8c620d6
```

#### Hot-Reloading with yalc

For development with automatic updates:

```bash
# In the package directory - watch mode
npm run build:watch

# In another terminal - push changes
npm run yalc:push

# Changes will be automatically reflected in projects using the package
```

#### Cleanup

When done testing:

```bash
# In your project
yalc remove @vertex-era-rules
npm install

# Remove from yalc store (optional)
yalc installations clean @vertex-era-rules
```

### Git Installation

Install directly from the Git repository:

```bash
# From publish branch (recommended for Git installation)
npm install git+https://github.com/Vertex-Era/aurails-FE.git#publish

# Specific version tag
npm install git+https://github.com/Vertex-Era/aurails-FE.git#v1.0.0

# Using SSH (if you have SSH keys configured)
npm install git+ssh://git@github.com/Vertex-Era/aurails-FE.git#publish
```

**Important Notes:**

- The `publish` branch contains the built `dist` files required for the package to work
- Installing from other branches (e.g., `main`) will not include these files
- After installation, the package files will be in `node_modules/aurails-fe/eslint-rules/`
- The package is installed as `aurails-fe` (repository name), not `@vertex-era-rules`

**Usage after Git installation:**

```typescript
// Import from the installed location
import baseConfig from 'aurails-fe/eslint-rules/dist/configs/base.js';
import recommendedConfig from 'aurails-fe/eslint-rules/dist/configs/recommended.js';

export default [
	...recommendedConfig,
	// Your custom configuration
];
```

## 🚀 Usage

### Quick Start (Recommended Preset)

The easiest way to get started is with the recommended preset:

```javascript
// eslint.config.mjs or eslint.config.js
import vertexEraRules from '@vertex-era/eslint-rules';

export default [
	...vertexEraRules.configs.recommended,  // ✅ Spread the array
	{
		// Your custom overrides
		rules: {
			'custom/no-inline-objects': 'warn',
		},
	},
];
```

**Important:** Make sure to spread the config array (`.configs.recommended`), not the configs object itself.

### Configuration Presets

#### Base Configuration

Core TypeScript, import management, and Prettier rules without custom rules:

```javascript
import vertexEraRules from '@vertex-era/eslint-rules';

export default [...vertexEraRules.configs.base];
```

**Includes:**

- ESLint recommended rules
- TypeScript recommended, stylistic, and strict rules (non-type-aware)
- Import sorting and management
- Prettier integration
- React configuration
- **TypeScript naming conventions** (Type prefix: `T`, Interface prefix: `I`)
- **Redux typed hooks enforcement** (enforces `useAppSelector` and `useAppDispatch`)

**Note:** The base config does NOT include type-aware rules to avoid requiring `parserOptions.project`. See the Type-Aware Configuration section below if you need those rules.

#### Recommended Configuration

Extends base with commonly used custom rules (suitable for most projects):

```javascript
import vertexEraRules from '@vertex-era/eslint-rules';

export default [...vertexEraRules.configs.recommended];
```

**Additional rules enabled:**

- `one-component-per-file`
- `no-empty-catch`
- `no-inline-objects`
- `no-inline-functions`
- `boolean-naming-convention`
- `no-nested-ternary`

#### Strict Configuration

Extends recommended with ALL custom rules (maximum code quality):

```typescript
import vertexEraRules from '@vertex-era-rules';

export default [...vertexEraRules.configs.strict];
```

**Additional rules enabled:**

- `form-config-extraction`
- `single-svg-per-file` (icon files only)
- `svg-currentcolor` (icon files only)
- `memoized-export` (icon files only)
- `no-response-data-return`

**Note:** Icon rules only apply to files matching: `**/icons/**/*.{ts,tsx}`, `**/icon/**/*.{ts,tsx}`, or `**/*Icon.{ts,tsx}`

#### Type-Aware Configuration (Optional)

Enable TypeScript type-aware rules for enhanced type checking:

```javascript
import vertexEraRules from '@vertex-era/eslint-rules';

export default [
	...vertexEraRules.configs.recommended,
	...vertexEraRules.configs.typeAware,  // Add type-aware rules
	{
		languageOptions: {
			parserOptions: {
				project: './tsconfig.json',  // Required for type-aware rules
			},
		},
	},
];
```

**Type-aware rules enabled:**

- `@typescript-eslint/prefer-optional-chain`
- `@typescript-eslint/non-nullable-type-assertion-style`
- `@typescript-eslint/prefer-string-starts-ends-with`
- `@typescript-eslint/prefer-find`
- `@typescript-eslint/prefer-includes`
- `@typescript-eslint/no-unsafe-argument`

**Note:** Type-aware rules require `parserOptions.project` to be configured and can slow down linting. Only use if you need these specific rules.

### Custom Configuration

Enable specific rules individually:

```typescript
import vertexEraRules from '@vertex-era-rules';

export default [
	...vertexEraRules.configs.base,
	{
		plugins: {
			custom: vertexEraRules.plugin,
		},
		rules: {
			// Enable specific custom rules
			'custom/one-component-per-file': 'error',
			'custom/no-inline-objects': 'warn',
			'custom/boolean-naming-convention': [
				'error',
				{
					prefix: 'is',
					allowedPrefixes: ['as', 'with', 'has'],
				},
			],
		},
	},
];
```

## 📋 Built-in Rules

### TypeScript Naming Conventions

The base config enforces TypeScript naming conventions:

**Type Aliases:** Must start with `T` prefix
```typescript
// ✅ Correct
type TUser = { name: string };
type TApiResponse = { data: any };

// ❌ Incorrect
type User = { name: string };  // Missing T prefix
```

**Interfaces:** Must start with `I` prefix
```typescript
// ✅ Correct
interface IUser { name: string }
interface IApiResponse { data: any }

// ❌ Incorrect
interface User { name: string }  // Missing I prefix
```

### Redux Typed Hooks

The base config enforces using typed Redux hooks for better type safety:

**Enforces `useAppSelector` instead of `useSelector`:**
```typescript
// ✅ Correct
import { useAppSelector } from '@/store/hooks';
const user = useAppSelector(state => state.user);

// ❌ Incorrect
import { useSelector } from 'react-redux';  // Error: Use useAppSelector
const user = useSelector(state => state.user);
```

**Enforces `useAppDispatch` instead of `useDispatch`:**
```typescript
// ✅ Correct
import { useAppDispatch } from '@/store/hooks';
const dispatch = useAppDispatch();

// ❌ Incorrect
import { useDispatch } from 'react-redux';  // Error: Use useAppDispatch
const dispatch = useDispatch();
```

**Why:** Typed hooks provide better TypeScript inference and catch type errors at compile time.

## 📋 Custom Rules

### Component Rules

#### `custom/one-component-per-file`

Enforce one component per file with explicit compound component patterns.

**Why:** Improves code organization, testability, and maintainability by keeping components focused and easy to locate.

**❌ Incorrect:**

```typescript
// UserProfile.tsx
export function UserProfile() {
  return <div>Profile</div>;
}

export function UserSettings() {
  return <div>Settings</div>;
}
```

**✅ Correct:**

```typescript
// UserProfile.tsx
export function UserProfile() {
  return <div>Profile</div>;
}

// UserSettings.tsx (separate file)
export function UserSettings() {
  return <div>Settings</div>;
}

// Or use compound component pattern
export function UserProfile() {
  return <div>Profile</div>;
}

function UserProfileHeader() {
  return <div>Header</div>;
}

UserProfile.Header = UserProfileHeader; // Compound component
```

---

### Error Handling Rules

#### `custom/no-empty-catch`

Prevent empty catch blocks in try-catch statements.

**Why:** Empty catch blocks can hide errors and make debugging difficult.

**Auto-fix:** Adds `// intentionally ignored` comment.

**❌ Incorrect:**

```typescript
try {
	riskyOperation();
} catch (error) {
	// Empty catch block
}
```

**✅ Correct:**

```typescript
try {
	riskyOperation();
} catch (error) {
	console.error('Operation failed:', error);
	showErrorToast(error.message);
}

// Or explicitly document why it's ignored
try {
	riskyOperation();
} catch (error) {
	// intentionally ignored
	// This error is expected and can be safely ignored
}
```

---

### Forms Rules

#### `custom/form-config-extraction`

Require form configuration parameters to be defined in separate constant files.

**Why:** Improves maintainability by centralizing form configurations and makes them easier to test and reuse.

**❌ Incorrect:**

```typescript
const form = useForm({
	defaultValues: { name: '', email: '' },
	validationSchema: yup.object({
		/* ... */
	}),
});
```

**✅ Correct:**

```typescript
// user-form-constants.ts
export const USER_FORM_CONFIG = {
	defaultValues: { name: '', email: '' },
	validationSchema: yup.object({
		/* ... */
	}),
};

// UserForm.tsx
import { USER_FORM_CONFIG } from './user-form-constants';

const form = useForm(USER_FORM_CONFIG);
```

---

### Icon Rules

**Note:** These rules only apply to icon files matching:
- `**/icons/**/*.{ts,tsx}`
- `**/icon/**/*.{ts,tsx}`
- `**/*Icon.{ts,tsx}`

#### `custom/single-svg-per-file`

Ensure only one SVG icon per file.

**Why:** Improves code organization, makes icons easier to find and maintain, and enables better tree-shaking.

**❌ Incorrect:**

```typescript
// icons.tsx
export const HomeIcon = () => <svg>...</svg>;
export const UserIcon = () => <svg>...</svg>;
```

**✅ Correct:**

```typescript
// HomeIcon.tsx
export const HomeIcon = () => <svg>...</svg>;

// UserIcon.tsx (separate file)
export const UserIcon = () => <svg>...</svg>;
```

#### `custom/svg-currentcolor`

Ensure single-color SVGs use `currentColor`.

**Why:** Allows icons to inherit text color from parent elements, making them more flexible and easier to theme.

**Auto-fix:** Replaces hardcoded colors with `currentColor`.

**❌ Incorrect:**

```typescript
<svg>
  <path fill="#000000" d="..." />
</svg>
```

**✅ Correct:**

```typescript
<svg>
  <path fill="currentColor" d="..." />
</svg>
```

#### `custom/memoized-export`

Ensure icon components are memoized using `React.memo`.

**Why:** Prevents unnecessary re-renders when icons are used in parent components.

**Auto-fix:** Wraps component with `memo()`.

**❌ Incorrect:**

```typescript
export default function HomeIcon() {
  return <svg>...</svg>;
}
```

**✅ Correct:**

```typescript
import { memo } from 'react';

function HomeIcon() {
  return <svg>...</svg>;
}

export default memo(HomeIcon);
```

---

### JSX Rules

#### `custom/no-inline-objects`

Prevent inline object literals in JSX props.

**Why:** Inline objects create new references on every render, causing unnecessary re-renders of child components.

**❌ Incorrect:**

```typescript
<UserCard style={{ padding: 20, margin: 10 }} />
```

**✅ Correct:**

```typescript
const cardStyle = { padding: 20, margin: 10 };

<UserCard style={cardStyle} />

// Or use useMemo for dynamic values
const cardStyle = useMemo(() => ({
  padding: 20,
  margin: isCompact ? 5 : 10
}), [isCompact]);

<UserCard style={cardStyle} />
```

#### `custom/no-inline-functions`

Prevent inline function declarations in JSX props.

**Why:** Inline functions create new references on every render, causing unnecessary re-renders.

**❌ Incorrect:**

```typescript
<Button onClick={() => handleClick(id)} />
```

**✅ Correct:**

```typescript
const handleButtonClick = useCallback(() => {
  handleClick(id);
}, [id]);

<Button onClick={handleButtonClick} />
```

---

### Naming Rules

#### `custom/boolean-naming-convention`

Enforce boolean variables to follow naming convention with prefixes.

**Why:** Makes code more readable by clearly indicating that a variable holds a boolean value.

**Options:**

- `prefix` (default: `'is'`): Primary prefix to use
- `allowedPrefixes` (default: `['as', 'with']`): Additional allowed prefixes

**❌ Incorrect:**

```typescript
const enabled: boolean = true;
const loading: boolean = false;
```

**✅ Correct:**

```typescript
const isEnabled: boolean = true;
const isLoading: boolean = false;
const hasPermission: boolean = true;
const withAuth: boolean = true;
```

**Custom Configuration:**

```typescript
{
  'custom/boolean-naming-convention': ['error', {
    prefix: 'is',
    allowedPrefixes: ['as', 'with', 'has', 'should', 'can']
  }]
}
```

---

### Readability Rules

#### `custom/no-nested-ternary`

Disallow nested ternary operators.

**Why:** Nested ternaries are difficult to read and understand.

**❌ Incorrect:**

```typescript
const color = isActive ? 'green' : isError ? 'red' : 'gray';
```

**✅ Correct:**

```typescript
function getStatusColor(isActive: boolean, isError: boolean): string {
	if (isActive) return 'green';
	if (isError) return 'red';
	return 'gray';
}

const color = getStatusColor(isActive, isError);
```

---

### Services Rules

#### `custom/no-response-data-return`

Prevent direct `response.data` returns in service layer files.

**Why:** Service layers should transform, validate, or normalize API responses before returning them to ensure type safety and consistent data structures.

**❌ Incorrect:**

```typescript
// services/user-service.ts
export async function getUser(id: string) {
	const response = await api.get(`/users/${id}`);
	return response.data; // Direct return
}
```

**✅ Correct:**

```typescript
// services/user-service.ts
export async function getUser(id: string): Promise<User> {
	const response = await api.get(`/users/${id}`);

	// Transform and validate
	return {
		id: response.data.id,
		name: response.data.name,
		email: response.data.email,
		createdAt: new Date(response.data.created_at),
	};
}
```

## 🔧 Troubleshooting

### Import Resolution Issues

If ESLint can't resolve imports with aliases:

```typescript
// eslint.config.ts
export default [
	{
		settings: {
			'import/resolver': {
				typescript: {
					project: './tsconfig.json', // Adjust path if needed
				},
			},
		},
	},
];
```

### TypeScript Parser Errors

Ensure you have the required peer dependencies:

```bash
npm install --save-dev eslint@^9.0.0 typescript@^5.0.0
```

### Rules Not Working

1. Verify the plugin is loaded:

```typescript
import vertexEraRules from '@vertex-era-rules';

export default [
	{
		plugins: {
			custom: vertexEraRules.plugin,
		},
	},
];
```

2. Check rule configuration:

```bash
npx eslint --print-config src/App.tsx
```

### Performance Issues

For large codebases, enable caching:

```typescript
// eslint.config.ts
export default [
	{
		// ... your config
	},
	{
		linterOptions: {
			cache: true,
			cacheLocation: '.eslintcache',
		},
	},
];
```

### Yalc Issues

If yalc installation doesn't work:

```bash
# Remove and reinstall
yalc remove @vertex-era-rules
yalc add @vertex-era-rules
npm install

# Or use yalc push for hot-reloading
npm run yalc:push
```

**Known Issue:** If you encounter module resolution errors with yalc, this is due to ESM import path resolution. As a workaround:

1. Ensure the package is built before publishing: `npm run build`
2. Use the `--no-scripts` flag if prepublishOnly fails: `yalc publish --no-scripts`
3. For production use, install via npm or Git instead of yalc

### Git Installation Issues

#### Cannot find module 'aurails-fe'

The package is installed as `aurails-fe` (repository name), not `@vertex-era-rules`. Use:

```typescript
import baseConfig from 'aurails-fe/eslint-rules/dist/configs/base.js';
```

#### dist directory not found

You may have installed from the wrong branch. Always install from `publish`:

```bash
npm install git+https://github.com/Vertex-Era/aurails-FE.git#publish
```

#### Permission denied (publickey)

Use HTTPS instead of SSH:

```bash
npm install git+https://github.com/Vertex-Era/aurails-FE.git#publish
```

#### Verifying Git Installation

After installing from Git, verify the package structure:

```bash
# Check if dist directory exists
ls -la node_modules/aurails-fe/eslint-rules/dist/

# Verify package.json
cat node_modules/aurails-fe/eslint-rules/package.json
```

## 📚 Migration Guide

### From Existing ESLint Configuration

1. **Install the package:**

```bash
npm install --save-dev @vertex-era-rules
```

2. **Update your ESLint config:**

```typescript
// eslint.config.ts
import vertexEraRules from '@vertex-era-rules';

export default [
	...vertexEraRules.configs.recommended,
	// Keep your existing custom rules
	{
		rules: {
			// Your project-specific overrides
		},
	},
];
```

3. **Run ESLint and fix issues:**

```bash
npx eslint . --fix
```

4. **Review changes:**

Review auto-fixed changes and manually fix remaining issues.

### Gradual Adoption

For large codebases, enable rules gradually:

```typescript
import vertexEraRules from '@vertex-era-rules';

export default [
	vertexEraRules.configs.base,
	{
		plugins: {
			custom: vertexEraRules.plugin,
		},
		rules: {
			// Start with warnings
			'custom/one-component-per-file': 'warn',
			'custom/no-inline-objects': 'warn',

			// Enable as errors once fixed
			// 'custom/no-empty-catch': 'error',
		},
	},
];
```

### From ESLint 8.x

This package requires ESLint 9.x (flat config). To migrate:

1. Update ESLint:

```bash
npm install --save-dev eslint@^9.0.0
```

2. Convert your config to flat config format (see [ESLint migration guide](https://eslint.org/docs/latest/use/configure/migration-guide))

3. Install and configure @vertex-era-rules as shown above

## 🤝 Contributing

Contributions are welcome! Please see our [contributing guidelines](CONTRIBUTING.md) for details.

## 📄 License

MIT © Vertex Era

## 🔗 Links

- [GitHub Repository](https://github.com/Vertex-Era/aurails-FE)
- [Issue Tracker](https://github.com/Vertex-Era/aurails-FE/issues)
- [Changelog](CHANGELOG.md)

## 💡 Support

If you encounter any issues or have questions:

1. Check the [troubleshooting section](#-troubleshooting)
2. Search [existing issues](https://github.com/Vertex-Era/aurails-FE/issues)
3. Create a [new issue](https://github.com/Vertex-Era/aurails-FE/issues/new) with:
    - ESLint version
    - TypeScript version
    - Node version
    - Minimal reproduction example

---

Made with ❤️ by Vertex Era
