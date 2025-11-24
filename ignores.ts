/**
 * Default ignore patterns for ESLint
 * 
 * Provides sensible defaults for files and directories that should be ignored
 * by ESLint in most React/TypeScript projects.
 * 
 * Usage:
 * ```typescript
 * import { defaultIgnores, ignoreConfig } from 'zayat-eslint-rules/ignores';
 * 
 * export default [
 *   ignoreConfig,
 *   ...baseConfig,
 *   // Your custom rules here
 * ];
 * ```
 */

import type { Linter } from 'eslint';

/**
 * Default patterns to ignore
 */
export const defaultIgnores: string[] = [
	// Build outputs
	'**/dist/**',
	'**/build/**',
	'**/out/**',
	'**/.next/**',
	'**/.nuxt/**',
	'**/.output/**',
	'**/.vercel/**',
	'**/.netlify/**',

	// Dependencies
	'**/node_modules/**',
	'**/vendor/**',

	// Cache directories
	'**/.cache/**',
	'**/.eslintcache',
	'**/.turbo/**',
	'**/.parcel-cache/**',

	// Coverage reports
	'**/coverage/**',
	'**/.nyc_output/**',

	// Generated files
	'**/*.generated.*',
	'**/*.min.js',
	'**/*.bundle.js',
	'**/auto-imports.d.ts',
	'**/components.d.ts',

	// Lock files
	'**/package-lock.json',
	'**/yarn.lock',
	'**/pnpm-lock.yaml',
	'**/bun.lockb',

	// IDE and editor directories
	'**/.idea/**',
	'**/.vscode/**',
	'**/.vs/**',

	// OS files
	'**/.DS_Store',
	'**/Thumbs.db',

	// Git
	'**/.git/**',

	// Test fixtures that should be ignored
	'**/__fixtures__/**',
	'**/fixtures/**',

	// Storybook
	'**/storybook-static/**',

	// Documentation generated files
	'**/docs/.vitepress/cache/**',
	'**/docs/.vitepress/dist/**',

	// Environment files
	'**/.env*',
	'!**/.env.example',

	// TypeScript declaration maps (optional)
	'**/*.d.ts.map',
];

/**
 * ESLint ignore configuration
 * Use this at the beginning of your ESLint config array
 */
export const ignoreConfig: Linter.Config = {
	ignores: defaultIgnores,
};

/**
 * Create custom ignore config with additional patterns
 * 
 * @param additionalIgnores - Additional patterns to ignore
 * @returns ESLint ignore configuration
 */
export function createIgnoreConfig(additionalIgnores: string[] = []): Linter.Config {
	return {
		ignores: [...defaultIgnores, ...additionalIgnores],
	};
}

/**
 * Merge custom ignores with defaults
 * 
 * @param customIgnores - Custom patterns to add
 * @returns Combined ignore patterns array
 */
export function mergeIgnores(customIgnores: string[]): string[] {
	return [...defaultIgnores, ...customIgnores];
}

export default ignoreConfig;

