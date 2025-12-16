/**
 * IDE Settings Helper
 * Provides recommended VS Code settings and helps prevent ESLint/Prettier conflicts
 */

export interface VSCodeSettings {
  "editor.formatOnSave": boolean;
  "editor.defaultFormatter": string;
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": string;
    "source.organizeImports"?: string;
  };
  "eslint.validate": string[];
  "eslint.format.enable"?: boolean;
  "prettier.requireConfig"?: boolean;
  "[typescript]"?: {
    "editor.defaultFormatter": string;
  };
  "[typescriptreact]"?: {
    "editor.defaultFormatter": string;
  };
  "[javascript]"?: {
    "editor.defaultFormatter": string;
  };
  "[javascriptreact]"?: {
    "editor.defaultFormatter": string;
  };
}

/**
 * Get recommended VS Code settings that prevent ESLint/Prettier conflicts
 *
 * This configuration ensures:
 * 1. Prettier handles formatting (via defaultFormatter)
 * 2. ESLint handles code quality rules (via codeActionsOnSave)
 * 3. Both run on save without conflict
 *
 * @returns Recommended VS Code settings object
 */
export function getRecommendedVSCodeSettings(): VSCodeSettings {
  return {
    // Enable format on save
    "editor.formatOnSave": true,

    // Use Prettier as the default formatter
    "editor.defaultFormatter": "esbenp.prettier-vscode",

    // Run ESLint fix on save (after Prettier formats)
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": "explicit",
    },

    // File types ESLint should validate
    "eslint.validate": [
      "javascript",
      "javascriptreact",
      "typescript",
      "typescriptreact",
    ],

    // Language-specific formatters (optional but recommended)
    "[typescript]": {
      "editor.defaultFormatter": "esbenp.prettier-vscode",
    },
    "[typescriptreact]": {
      "editor.defaultFormatter": "esbenp.prettier-vscode",
    },
    "[javascript]": {
      "editor.defaultFormatter": "esbenp.prettier-vscode",
    },
    "[javascriptreact]": {
      "editor.defaultFormatter": "esbenp.prettier-vscode",
    },
  };
}

/**
 * Get VS Code settings as a formatted JSON string
 * Ready to be copied into .vscode/settings.json
 *
 * @returns Formatted JSON string
 */
export function getVSCodeSettingsJSON(): string {
  return JSON.stringify(getRecommendedVSCodeSettings(), null, "\t");
}

/**
 * Recommended extensions for the ESLint + Prettier setup
 */
export const RECOMMENDED_VSCODE_EXTENSIONS = [
  "dbaeumer.vscode-eslint", // ESLint extension
  "esbenp.prettier-vscode", // Prettier extension
  "bradlc.vscode-tailwindcss", // Tailwind CSS IntelliSense (optional)
];

/**
 * Get VS Code extensions recommendations
 * Ready to be copied into .vscode/extensions.json
 *
 * @returns Extensions recommendations object
 */
export function getVSCodeExtensionsRecommendations(): {
  recommendations: string[];
} {
  return {
    recommendations: RECOMMENDED_VSCODE_EXTENSIONS,
  };
}

/**
 * Get VS Code extensions as a formatted JSON string
 *
 * @returns Formatted JSON string
 */
export function getVSCodeExtensionsJSON(): string {
  return JSON.stringify(getVSCodeExtensionsRecommendations(), null, "\t");
}

/**
 * Documentation for preventing ESLint/Prettier conflicts
 */
export const CONFLICT_PREVENTION_GUIDE = `
# Preventing ESLint/Prettier Conflicts

This package includes \`eslint-config-prettier\` which automatically disables
ESLint rules that would conflict with Prettier formatting.

## How it works:

1. **Prettier handles formatting**: whitespace, semicolons, quotes, etc.
2. **ESLint handles code quality**: unused variables, React rules, custom rules, etc.

## Recommended workflow:

1. Save file → Prettier formats the code
2. Save file → ESLint fixes remaining issues

## VS Code setup:

Add to your \`.vscode/settings.json\`:

\`\`\`json
${JSON.stringify(getRecommendedVSCodeSettings(), null, "\t")}
\`\`\`

## Troubleshooting:

If you see conflicting rules:
1. Check if you have duplicate Prettier/ESLint formatting rules
2. Ensure \`eslint-config-prettier\` is included in your config
3. Make sure Prettier is the default formatter in VS Code

## Note on eslint-plugin-prettier:

This package uses \`eslint-plugin-prettier\` to show Prettier errors as ESLint errors.
This provides a unified experience in your editor. The \`eslint-config-prettier\` 
ensures ESLint's own formatting rules don't conflict with these Prettier rules.
`;

/**
 * Get the conflict prevention guide
 *
 * @returns Documentation string
 */
export function getConflictPreventionGuide(): string {
  return CONFLICT_PREVENTION_GUIDE;
}









