/**
 * Type-Aware Usage Example
 * 
 * This file demonstrates how to use the type-aware configuration
 * which enables TypeScript rules that require type information.
 * 
 * Note: Type-aware rules require `parserOptions.project` to be configured.
 */

// eslint.config.ts
import eslintRules from 'zayat-eslint-rules';

export default [
	// Use the recommended configuration
	...eslintRules.configs.recommended,

	// Add type-aware rules
	...eslintRules.configs.typeAware,

	// Configure TypeScript parser with project reference
	{
		languageOptions: {
			parserOptions: {
				project: './tsconfig.json',
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},

	// Add your own custom overrides
	{
		rules: {
			// Override specific rules if needed
		},
	},
];

