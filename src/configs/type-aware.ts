import type { Linter } from 'eslint';

/**
 * Type-aware configuration for TypeScript projects
 *
 * This config enables TypeScript rules that require type information.
 * It requires parserOptions.project to be configured.
 *
 * Usage:
 * ```javascript
 * import eslintRules from 'zayat-eslint-rules';
 *
 * export default [
 *   ...eslintRules.configs.recommended,
 *   ...eslintRules.configs.typeAware,
 *   {
 *     languageOptions: {
 *       parserOptions: {
 *         project: './tsconfig.json',
 *       },
 *     },
 *   },
 * ];
 * ```
 */
export const typeAwareConfig: Linter.Config[] = [
	{
		files: ['**/*.{ts,tsx}'],
		rules: {
			// Type-aware rules that require parserOptions.project
			'@typescript-eslint/prefer-optional-chain': 'error',
			'@typescript-eslint/non-nullable-type-assertion-style': 'error',
			'@typescript-eslint/prefer-string-starts-ends-with': 'error',
			'@typescript-eslint/prefer-find': 'error',
			'@typescript-eslint/prefer-includes': 'error',
			'@typescript-eslint/no-unsafe-argument': 'error',
		},
	},
];

export default typeAwareConfig;

