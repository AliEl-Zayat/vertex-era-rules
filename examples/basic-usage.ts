/**
 * Basic Usage Example
 * 
 * This file demonstrates the basic usage of @zayat/eslint-custom-rules
 * in an ESLint flat configuration file.
 */

// eslint.config.ts
import eslintRules from 'zayat-eslint-rules';

export default [
	// Use the recommended configuration (base + common custom rules)
	...eslintRules.configs.recommended,

	// Add your own custom overrides
	{
		rules: {
			// Override specific rules if needed
			// 'custom/boolean-naming-convention': 'warn',
		},
	},
];

