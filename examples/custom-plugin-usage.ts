/**
 * Custom Plugin Usage Example
 * 
 * This file demonstrates how to use individual custom rules
 * without using the pre-built configurations.
 */

// eslint.config.ts
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintRules from 'zayat-eslint-rules';

export default [
	// ESLint recommended rules
	eslint.configs.recommended,

	// TypeScript recommended rules
	...tseslint.configs.recommended,

	// Add the custom plugin and configure specific rules
	{
		plugins: {
			custom: eslintRules.plugin,
		},
		rules: {
			// Component rules
			'custom/one-component-per-file': 'error',

			// Error handling rules
			'custom/no-empty-catch': 'error',

			// JSX rules (set to warn for gradual adoption)
			'custom/no-inline-objects': 'warn',
			'custom/no-inline-functions': 'warn',

			// Naming rules
			'custom/boolean-naming-convention': ['error', {
				prefix: 'is',
				allowedPrefixes: ['has', 'should', 'can', 'will', 'as', 'with'],
			}],

			// Readability rules
			'custom/no-nested-ternary': 'error',

			// Form rules (only if you use react-hook-form or formik)
			// 'custom/form-config-extraction': 'error',

			// Service rules (only for files in src/services/)
			// 'custom/no-response-data-return': 'error',
		},
	},

	// Icon-specific rules (only for icon files)
	{
		files: ['**/icons/**/*.{ts,tsx}', '**/icon/**/*.{ts,tsx}', '**/*Icon.{ts,tsx}'],
		plugins: {
			custom: eslintRules.plugin,
		},
		rules: {
			'custom/single-svg-per-file': 'error',
			'custom/svg-currentcolor': 'error',
			'custom/memoized-export': 'error',
		},
	},
];

