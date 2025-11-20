import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import plugin from '../src/plugin.js';

import { runRule } from './test-utils.js';

// Reserved keywords that cannot be used as function names
const RESERVED_KEYWORDS = new Set([
	'do',
	'if',
	'in',
	'for',
	'let',
	'new',
	'try',
	'var',
	'case',
	'else',
	'enum',
	'eval',
	'null',
	'this',
	'true',
	'void',
	'with',
	'await',
	'break',
	'catch',
	'class',
	'const',
	'false',
	'super',
	'throw',
	'while',
	'yield',
	'delete',
	'export',
	'import',
	'public',
	'return',
	'static',
	'switch',
	'typeof',
	'default',
	'extends',
	'finally',
	'package',
	'private',
	'continue',
	'debugger',
	'function',
	'arguments',
	'interface',
	'protected',
	'implements',
	'instanceof',
]);

// Generator for valid function names (not reserved keywords)
const functionNameGen = fc
	.string({ minLength: 3, maxLength: 15 })
	.map((s) => {
		const cleaned = s.replace(/[^a-zA-Z]/g, '');
		return cleaned.length > 0 ? cleaned : 'fetchData';
	})
	.filter((name) => name.length > 0 && !RESERVED_KEYWORDS.has(name));

/**
 * Feature: comprehensive-rule-verification, Property 19: Service response.data return detection
 * For any service function that directly returns response.data,
 * the no-response-data-return rule should detect a violation.
 * Validates: Requirements 2.11
 */
describe('Property 19: Service response.data return detection', () => {
	const rule = plugin.rules?.['no-response-data-return'] as any;

	// Generator for response variable names
	const responseVarGen = fc.constantFrom('response', 'res', 'apiResponse', 'result', 'r');

	// Generator for API endpoint paths
	const endpointGen = fc.string({ minLength: 3, maxLength: 20 }).map((s) => {
		const cleaned = s.replace(/[^a-z-]/gi, '').toLowerCase();
		return cleaned.length > 0 ? `/${cleaned}` : '/api/data';
	});

	it('should detect direct response.data returns in service files', () => {
		fc.assert(
			fc.property(
				responseVarGen,
				functionNameGen,
				endpointGen,
				(responseVar, functionName, endpoint) => {
					// Build code with direct response.data return
					const code = `
						import axios from 'axios';
						
						export async function ${functionName}() {
							const ${responseVar} = await axios.get('${endpoint}');
							return ${responseVar}.data;
						}
					`;

					// Run the rule with service file context
					const messages = runRule(rule, code, 'src/services/api.ts');

					// Should report error for direct response.data return in service file
					expect(messages.length).toBeGreaterThan(0);
					expect(messages[0].messageId).toBe('directResponseDataReturn');
					expect(messages[0].message).toContain('transformation');

					return true;
				},
			),
			{ numRuns: 100 },
		);
	});

	it('should allow response.data in non-service files', () => {
		// Generator for non-service file paths
		const nonServicePathGen = fc.constantFrom(
			'src/components/UserList.tsx',
			'src/hooks/useData.ts',
			'src/utils/api.ts',
			'src/pages/Dashboard.tsx',
			'src/lib/fetcher.ts',
			'src/api/client.ts',
		);

		fc.assert(
			fc.property(
				responseVarGen,
				nonServicePathGen,
				functionNameGen,
				(responseVar, filePath, functionName) => {
					// Build code with direct response.data return
					const code = `
						import axios from 'axios';
						
						export async function ${functionName}() {
							const ${responseVar} = await axios.get('/api/data');
							return ${responseVar}.data;
						}
					`;

					// Run the rule with non-service file context
					const messages = runRule(rule, code, filePath);

					// Should NOT report any errors for non-service files
					expect(messages.length).toBe(0);

					return true;
				},
			),
			{ numRuns: 100 },
		);
	});

	it('should allow transformed response data', () => {
		// Generator for transformation patterns
		const transformationGen = fc.constantFrom(
			// Destructuring
			(responseVar: string) => `const { data } = ${responseVar};\n\t\t\treturn data;`,
			// Mapping
			(responseVar: string) =>
				`const data = ${responseVar}.data;\n\t\t\treturn data.map(item => ({ ...item, processed: true }));`,
			// Validation
			(responseVar: string) =>
				`const data = ${responseVar}.data;\n\t\t\tif (!data) throw new Error('No data');\n\t\t\treturn data;`,
			// Type casting
			(responseVar: string) =>
				`const data = ${responseVar}.data as UserData;\n\t\t\treturn data;`,
			// Property access
			(responseVar: string) => `const data = ${responseVar}.data;\n\t\t\treturn data.items;`,
			// Spread operator
			(responseVar: string) =>
				`const data = ${responseVar}.data;\n\t\t\treturn { ...data, timestamp: Date.now() };`,
			// Filter
			(responseVar: string) =>
				`const data = ${responseVar}.data;\n\t\t\treturn data.filter(item => item.active);`,
		);

		fc.assert(
			fc.property(
				responseVarGen,
				transformationGen,
				functionNameGen,
				(responseVar, transformationFn, functionName) => {
					// Build code with transformed response
					const transformation = transformationFn(responseVar);
					const code = `
						import axios from 'axios';
						
						export async function ${functionName}() {
							const ${responseVar} = await axios.get('/api/data');
							${transformation}
						}
					`;

					// Run the rule with service file context
					const messages = runRule(rule, code, 'src/services/api.ts');

					// Should NOT report errors for transformed responses
					expect(messages.length).toBe(0);

					return true;
				},
			),
			{ numRuns: 100 },
		);
	});

	it('should detect optional chaining response?.data', () => {
		fc.assert(
			fc.property(responseVarGen, functionNameGen, (responseVar, functionName) => {
				const code = `
					import axios from 'axios';
					
					export async function ${functionName}() {
						const ${responseVar} = await axios.get('/api/data');
						return ${responseVar}?.data;
					}
				`;

				// Run the rule with service file context
				const messages = runRule(rule, code, 'src/services/api.ts');

				// Should report error for optional chaining response?.data
				expect(messages.length).toBeGreaterThan(0);
				expect(messages[0].messageId).toBe('directResponseDataReturn');

				return true;
			}),
			{ numRuns: 100 },
		);
	});

	it('should detect response.data in nested service directories', () => {
		// Generator for nested service paths
		const nestedServicePathGen = fc.constantFrom(
			'src/services/user/profile-service.ts',
			'src/services/api/auth-service.ts',
			'src/services/data/user-service.ts',
			'src/services/external/payment-service.ts',
		);

		fc.assert(
			fc.property(
				responseVarGen,
				nestedServicePathGen,
				functionNameGen,
				(responseVar, filePath, functionName) => {
					const code = `
						import axios from 'axios';
						
						export async function ${functionName}() {
							const ${responseVar} = await axios.get('/api/data');
							return ${responseVar}.data;
						}
					`;

					// Run the rule with nested service file context
					const messages = runRule(rule, code, filePath);

					// Should report error for nested service directories
					expect(messages.length).toBeGreaterThan(0);
					expect(messages[0].messageId).toBe('directResponseDataReturn');

					return true;
				},
			),
			{ numRuns: 100 },
		);
	});

	it('should not flag non-response variables with data property', () => {
		// Generator for non-response variable names
		const nonResponseVarGen = fc.constantFrom('config', 'options', 'settings', 'params');

		fc.assert(
			fc.property(nonResponseVarGen, functionNameGen, (varName, functionName) => {
				const code = `
					export function ${functionName}() {
						const ${varName} = { data: { key: 'value' } };
						return ${varName}.data;
					}
				`;

				// Run the rule with service file context
				const messages = runRule(rule, code, 'src/services/config-service.ts');

				// Should NOT report errors for non-response variables
				expect(messages.length).toBe(0);

				return true;
			}),
			{ numRuns: 100 },
		);
	});
});
