/**
 * Example ESLint configuration using @vertex-era/eslint-rules
 * 
 * This file demonstrates the correct usage of the package.
 */

import vertexEraRules from '@vertex-era/eslint-rules';

// ✅ CORRECT: Spread the config array from the configs object
export default [
	...vertexEraRules.configs.recommended,
	{
		// Your custom overrides
		rules: {
			// Override or disable specific rules
			'custom/no-inline-objects': 'warn',
		},
	},
];

// ❌ WRONG: Don't try to spread configs itself
// export default [...vertexEraRules.configs];  // This will fail!

// ✅ CORRECT: Using base config
// export default [...vertexEraRules.configs.base];

// ✅ CORRECT: Using strict config
// export default [...vertexEraRules.configs.strict];

// ✅ CORRECT: Combining multiple configs
// export default [
//   ...vertexEraRules.configs.base,
//   {
//     rules: {
//       'custom/one-component-per-file': 'error',
//     },
//   },
// ];

// ✅ CORRECT: Using individual rules from the plugin
// export default [
//   {
//     plugins: {
//       custom: vertexEraRules.plugin,
//     },
//     rules: {
//       'custom/one-component-per-file': 'error',
//       'custom/no-empty-catch': 'error',
//     },
//   },
// ];
