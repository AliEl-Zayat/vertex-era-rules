/**
 * Gradual Adoption Example
 * 
 * This file demonstrates how to gradually adopt the custom rules
 * in an existing codebase by starting with warnings and progressively
 * converting them to errors.
 */

// eslint.config.ts
import eslintRules from 'zayat-eslint-rules';

export default [
	// Use the base configuration (no custom rules)
	...eslintRules.configs.base,

	// Add the custom plugin
	{
		plugins: {
			custom: eslintRules.plugin,
		},
		rules: {
			// ==========================================
			// Phase 1: Start with these as warnings
			// ==========================================

			// Easy wins - these are usually quick to fix
			'custom/no-empty-catch': 'warn',
			'custom/no-nested-ternary': 'warn',

			// ==========================================
			// Phase 2: Enable once Phase 1 is clean
			// ==========================================

			// May require refactoring
			// 'custom/one-component-per-file': 'warn',
			// 'custom/boolean-naming-convention': 'warn',

			// ==========================================
			// Phase 3: Enable once Phase 2 is clean
			// ==========================================

			// Performance-related rules - may need significant refactoring
			// 'custom/no-inline-objects': 'warn',
			// 'custom/no-inline-functions': 'warn',

			// ==========================================
			// Phase 4: Enable for new code only
			// ==========================================

			// Service layer rules
			// 'custom/no-response-data-return': 'warn',

			// Form rules
			// 'custom/form-config-extraction': 'warn',
		},
	},
];

