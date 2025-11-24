/**
 * Configuration with Ignores Example
 * 
 * This file demonstrates how to use the default ignore patterns
 * along with custom ignores for your project.
 */

// eslint.config.ts
import eslintRules from 'zayat-eslint-rules';
import { ignoreConfig, createIgnoreConfig } from 'zayat-eslint-rules/ignores';

export default [
	// Option 1: Use default ignores
	ignoreConfig,

	// Option 2: Create custom ignores (uncomment to use instead)
	// createIgnoreConfig([
	// 	// Add your custom ignore patterns
	// 	'**/legacy/**',
	// 	'**/generated/**',
	// 	'**/vendor/**',
	// ]),

	// Use the recommended configuration
	...eslintRules.configs.recommended,

	// Your custom overrides
	{
		rules: {
			// Override specific rules if needed
		},
	},
];

