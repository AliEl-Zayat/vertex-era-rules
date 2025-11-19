import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { runRule } from '../../test-utils';

import servicesRules from './eslint-plugin-services-rules';

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

describe('Property Tests: no-response-data-return', () => {
	it('Property 13: Service file response.data detection', () => {
		/**
		 * Feature: additional-eslint-rules, Property 13: Service file response.data detection
		 * For any file in the `src/services/*` directory (including nested subdirectories),
		 * the rule should report an error if and only if it contains a return statement
		 * with direct `response.data` access
		 * Validates: Requirements 5.1, 5.5
		 */

		// Generator for response variable names
		const responseVarGen = fc.constantFrom('response', 'res', 'apiResponse', 'result', 'r');

		// Generator for API endpoint paths
		const endpointGen = fc.string({ minLength: 3, maxLength: 20 }).map((s) => {
			const cleaned = s.replace(/[^a-z-]/gi, '').toLowerCase();
			return cleaned.length > 0 ? `/${cleaned}` : '/api/data';
		});

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
					const messages = runRule(
						servicesRules['no-response-data-return'],
						code,
						'src/services/api.ts',
					);

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

	it('Property 14: Non-service file exemption', () => {
		/**
		 * Feature: additional-eslint-rules, Property 14: Non-service file exemption
		 * For any file outside the `src/services/*` directory, the rule should not
		 * report errors for `response.data` returns
		 * Validates: Requirements 5.2
		 */

		// Generator for response variable names
		const responseVarGen = fc.constantFrom('response', 'res', 'apiResponse', 'result');

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
					const messages = runRule(
						servicesRules['no-response-data-return'],
						code,
						filePath,
					);

					// Should NOT report any errors for non-service files
					expect(messages.length).toBe(0);

					return true;
				},
			),
			{ numRuns: 100 },
		);
	});

	it('Property 15: Transformed response exemption', () => {
		/**
		 * Feature: additional-eslint-rules, Property 15: Transformed response exemption
		 * For any service function that transforms, validates, destructures, or processes
		 * `response.data` before returning, the rule should not report errors
		 * Validates: Requirements 5.3, 5.4
		 */

		// Generator for response variable names
		const responseVarGen = fc.constantFrom('response', 'res', 'apiResponse');

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
					const messages = runRule(
						servicesRules['no-response-data-return'],
						code,
						'src/services/api.ts',
					);

					// Should NOT report errors for transformed responses
					expect(messages.length).toBe(0);

					return true;
				},
			),
			{ numRuns: 100 },
		);
	});
});
