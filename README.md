# zayat-eslint-rules

Custom ESLint rules and configurations for React/TypeScript projects.

> **Note**: This library is _vibe coded_ - built with passion and continuously evolving! I'm actively listening to the community for enhancement requests and improvements. Feel free to [open an issue](https://github.com/AliEl-Zayat/eslint-rules-zayat/issues) or submit a PR. Your feedback shapes this library!

## Features

- 🎯 **12 Custom Rules** - Best practices for React/TypeScript development
- 📦 **Pre-configured Configs** - Base, recommended, strict, and type-aware presets
- 💄 **Prettier Integration** - Auto-detects existing config or creates default
- 🔧 **IDE Support** - VS Code settings helper to prevent ESLint/Prettier conflicts
- 📝 **TypeScript Naming** - Enforces T prefix for types, I prefix for interfaces
- ⚛️ **Redux Support** - Typed hooks enforcement (useAppSelector, useAppDispatch)

## Installation

```bash
npm install zayat-eslint-rules --save-dev
```

Or via GitHub:

```bash
npm install git+https://github.com/AliEl-Zayat/eslint-rules-zayat.git
```

## Quick Start

Create or update your `eslint.config.ts`:

```typescript
import eslintRules from "zayat-eslint-rules";

export default [
  ...eslintRules.configs.recommended,
  // Your custom rules here
];
```

## Available Configs

### Base Config

Core configuration without custom rules:

```typescript
import { baseConfig } from "zayat-eslint-rules";

export default [...baseConfig];
```

### Recommended Config (Default)

Base config + commonly used custom rules:

```typescript
import eslintRules from "zayat-eslint-rules";

export default [...eslintRules.configs.recommended];
```

### Strict Config

All custom rules enabled:

```typescript
import eslintRules from "zayat-eslint-rules";

export default [...eslintRules.configs.strict];
```

### Type-Aware Config

For projects with TypeScript type checking:

```typescript
import eslintRules from "zayat-eslint-rules";

export default [
  ...eslintRules.configs.recommended,
  ...eslintRules.configs.typeAware,
  {
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
  },
];
```

## Custom Rules

### Component Rules

| Rule                            | Description                          |
| ------------------------------- | ------------------------------------ |
| `custom/one-component-per-file` | Enforce one React component per file |

### Error Handling Rules

| Rule                    | Description                |
| ----------------------- | -------------------------- |
| `custom/no-empty-catch` | Prevent empty catch blocks |

### Forms Rules

| Rule                            | Description                                 |
| ------------------------------- | ------------------------------------------- |
| `custom/form-config-extraction` | Enforce form config extraction to constants |

### Icon Rules (Icon files only)

| Rule                         | Description                           |
| ---------------------------- | ------------------------------------- |
| `custom/single-svg-per-file` | One SVG icon per file                 |
| `custom/svg-currentcolor`    | Use currentColor in single-color SVGs |
| `custom/memoized-export`     | Memoize icon exports with React.memo  |

### JSX Rules

| Rule                         | Description                           |
| ---------------------------- | ------------------------------------- |
| `custom/no-inline-objects`   | Prevent inline objects in JSX props   |
| `custom/no-inline-functions` | Prevent inline functions in JSX props |

### Naming Rules

| Rule                               | Description                                               |
| ---------------------------------- | --------------------------------------------------------- |
| `custom/boolean-naming-convention` | Boolean variables must have is/has/should/can/will prefix |

### Readability Rules

| Rule                       | Description                      |
| -------------------------- | -------------------------------- |
| `custom/no-nested-ternary` | Prevent nested ternary operators |

### Services Rules

| Rule                             | Description                                      |
| -------------------------------- | ------------------------------------------------ |
| `custom/no-response-data-return` | Prevent direct response.data returns in services |

## Prettier Integration

The package automatically detects your existing Prettier configuration. If none is found, it creates a sensible default `.prettierrc.json` during post-install.

### Supported Prettier Config Files

- `.prettierrc`
- `.prettierrc.json`
- `.prettierrc.yml` / `.prettierrc.yaml`
- `.prettierrc.js` / `.prettierrc.cjs` / `.prettierrc.mjs`
- `prettier.config.js` / `prettier.config.cjs` / `prettier.config.mjs` / `prettier.config.ts`
- `prettier` field in `package.json`

## Preventing ESLint/Prettier Conflicts

This package includes `eslint-config-prettier` to automatically disable ESLint rules that conflict with Prettier.

### VS Code Setup

Get recommended VS Code settings:

```typescript
import { getVSCodeSettingsJSON } from "zayat-eslint-rules";

console.log(getVSCodeSettingsJSON());
```

Add to `.vscode/settings.json`:

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

## TypeScript Naming Conventions

The package enforces naming conventions for TypeScript:

- **Type aliases**: Must start with `T` (e.g., `TUser`, `TApiResponse`)
- **Interfaces**: Must start with `I` (e.g., `IUserProps`, `IConfig`)

**Note**: The package does NOT enforce using interfaces over types (or vice versa). You're free to use whichever you prefer.

## Redux Typed Hooks

The package enforces using typed Redux hooks:

```typescript
// ❌ Error
import { useSelector, useDispatch } from "react-redux";

// ✅ Correct
import { useAppSelector, useAppDispatch } from "@store/hooks";
```

## Utilities

### Prettier Detection

```typescript
import {
  detectPrettierConfig,
  getPrettierConfigForESLint,
} from "zayat-eslint-rules";

// Check if Prettier config exists
const result = detectPrettierConfig();
console.log(result.found, result.path, result.source);

// Get config for ESLint plugin
const config = getPrettierConfigForESLint();
```

### VS Code Settings

```typescript
import {
  getRecommendedVSCodeSettings,
  getVSCodeSettingsJSON,
  getVSCodeExtensionsRecommendations,
} from "zayat-eslint-rules";

// Get settings object
const settings = getRecommendedVSCodeSettings();

// Get formatted JSON string
const json = getVSCodeSettingsJSON();

// Get recommended extensions
const extensions = getVSCodeExtensionsRecommendations();
```

## Contributing

This library is community-driven and I welcome all contributions! Here's how you can help:

- **Report bugs**: Found something broken? [Open an issue](https://github.com/AliEl-Zayat/eslint-rules-zayat/issues/new)
- **Request features**: Have an idea for a new rule or improvement? I'd love to hear it!
- **Submit PRs**: Code contributions are always appreciated
- **Share feedback**: Even small suggestions help make this library better

### Development

```bash
# Clone the repo
git clone https://github.com/AliEl-Zayat/eslint-rules-zayat.git

# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Type check
npm run typecheck
```

## License

MIT © Zayat

## Links

- [GitHub Repository](https://github.com/AliEl-Zayat/eslint-rules-zayat)
- [Issue Tracker](https://github.com/AliEl-Zayat/eslint-rules-zayat/issues)









