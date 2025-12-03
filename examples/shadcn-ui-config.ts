/**
 * Shadcn UI Configuration Example
 * 
 * This file demonstrates how to use file-specific configurations
 * for main.tsx and shadcn UI components.
 * 
 * Note: This example assumes you have the following plugins installed:
 * - eslint-plugin-react-refresh
 * - eslint-plugin-react-hooks
 */

// eslint.config.ts
import eslintRules from 'zayat-eslint-rules';
import { mainTsxConfig, shadcnUiConfig } from 'zayat-eslint-rules/file-specific';

export default [
	// Use the recommended configuration (base + common custom rules)
	...eslintRules.configs.recommended,

	// Apply file-specific configurations
	mainTsxConfig,
	shadcnUiConfig,

	// Optional: Add react-refresh and react-hooks plugins if not already included
	// {
	//   plugins: {
	//     'react-refresh': require('eslint-plugin-react-refresh'),
	//     'react-hooks': require('eslint-plugin-react-hooks'),
	//   },
	// },

	// Your additional custom overrides can go here
	{
		rules: {
			// Add any project-specific rule overrides
		},
	},
];





