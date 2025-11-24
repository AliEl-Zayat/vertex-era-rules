/**
 * Strict Usage Example
 * 
 * This file demonstrates the strict configuration of @zayat/eslint-custom-rules
 * which enables ALL custom rules for maximum code quality enforcement.
 */

// eslint.config.ts
import eslintRules from 'zayat-eslint-rules';

export default [
	// Use the strict configuration (all custom rules enabled)
	...eslintRules.configs.strict,

	// Add your own custom overrides
	{
		rules: {
			// Override specific rules if needed
		},
	},
];

