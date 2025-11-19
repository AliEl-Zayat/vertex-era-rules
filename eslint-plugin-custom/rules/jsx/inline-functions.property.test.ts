import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { runRule } from '../../test-utils';

import jsxRules from './eslint-plugin-jsx-rules';

describe('Property Tests: no-inline-functions', () => {
	it('Property 9: Inline function detection', () => {
		/**
		 * Feature: custom-eslint-rules, Property 9: Inline function detection
		 * For any JSX element with a prop containing an inline arrow function or function expression,
		 * the linting system should report an error with the prop name.
		 * Validates: Requirements 4.1, 4.2, 4.4
		 */

		// Generator for prop names (camelCase)
		const propNameGen = fc
			.string({ minLength: 1, maxLength: 15 })
			.map((s) => {
				const cleaned = s.replace(/[^a-zA-Z0-9]/g, '');
				if (cleaned.length === 0) return 'prop';
				return cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
			})
			.filter((name) => name.length > 0 && /^[a-z]/.test(name));

		// Generator for component names (PascalCase)
		const componentNameGen = fc
			.string({ minLength: 1, maxLength: 15 })
			.map((s) => {
				const cleaned = s.replace(/[^a-zA-Z0-9]/g, '');
				if (cleaned.length === 0) return 'Component';
				const firstChar = cleaned.charAt(0);
				if (/[0-9]/.test(firstChar)) {
					return 'C' + cleaned;
				}
				return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
			})
			.filter((name) => name.length > 0 && /^[A-Z]/.test(name));

		// Generator for inline function types (arrow function or function expression)
		const inlineFunctionGen = fc.oneof(
			// Arrow functions
			fc.constant('() => {}'), // No params, empty body
			fc.constant('() => console.log("test")'), // No params, expression body
			fc.constant('(e) => e.preventDefault()'), // Single param
			fc.constant('(x, y) => x + y'), // Multiple params
			fc.constant('(item) => { return item.id; }'), // Block body
			// Function expressions
			fc.constant('function() {}'), // No params
			fc.constant('function(e) { e.preventDefault(); }'), // With params
			fc.constant('function handler() { console.log("test"); }'), // Named function
		);

		fc.assert(
			fc.property(
				componentNameGen,
				propNameGen,
				inlineFunctionGen,
				(componentName, propName, inlineFunction) => {
					// Build code with inline function
					const code = `
						const TestComponent = () => (
							<${componentName} ${propName}={${inlineFunction}} />
						);
					`;

					// Run the rule
					const messages = runRule(jsxRules['no-inline-functions'], code);

					// Should report an error
					expect(messages.length).toBeGreaterThan(0);

					// Error message should contain the prop name
					const errorMessage = messages[0].message;
					expect(errorMessage).toContain(propName);
					expect(errorMessage).toContain('inline function');

					return true;
				},
			),
			{ numRuns: 100 },
		);
	});

	it('Property 10: Function reference exemption', () => {
		/**
		 * Feature: custom-eslint-rules, Property 10: Function reference exemption
		 * For any JSX element using function references (not inline declarations),
		 * the linting system should not report inline function errors.
		 * Validates: Requirements 4.3
		 */

		// Generator for function names (camelCase)
		const reservedWords = new Set([
			'arguments',
			'await',
			'break',
			'case',
			'catch',
			'class',
			'const',
			'continue',
			'debugger',
			'default',
			'delete',
			'do',
			'else',
			'enum',
			'export',
			'extends',
			'false',
			'finally',
			'for',
			'function',
			'if',
			'import',
			'in',
			'instanceof',
			'let',
			'new',
			'null',
			'return',
			'super',
			'switch',
			'this',
			'throw',
			'true',
			'try',
			'typeof',
			'var',
			'void',
			'while',
			'with',
			'yield',
		]);

		const functionNameGen = fc
			.string({ minLength: 1, maxLength: 15 })
			.map((s) => {
				const cleaned = s.replace(/[^a-zA-Z0-9]/g, '');
				if (cleaned.length === 0) return 'handleClick';
				return cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
			})
			.filter((name) => name.length > 0 && /^[a-z]/.test(name) && !reservedWords.has(name));

		// Generator for prop names
		const propNameGen = fc
			.string({ minLength: 1, maxLength: 15 })
			.map((s) => {
				const cleaned = s.replace(/[^a-zA-Z0-9]/g, '');
				if (cleaned.length === 0) return 'prop';
				return cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
			})
			.filter((name) => name.length > 0 && /^[a-z]/.test(name));

		// Generator for component names
		const componentNameGen = fc
			.string({ minLength: 1, maxLength: 15 })
			.map((s) => {
				const cleaned = s.replace(/[^a-zA-Z0-9]/g, '');
				if (cleaned.length === 0) return 'Component';
				const firstChar = cleaned.charAt(0);
				if (/[0-9]/.test(firstChar)) {
					return 'C' + cleaned;
				}
				return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
			})
			.filter((name) => name.length > 0 && /^[A-Z]/.test(name));

		fc.assert(
			fc.property(
				componentNameGen,
				propNameGen,
				functionNameGen,
				(componentName, propName, functionName) => {
					// Build code with function reference (not inline function)
					const code = `
						const TestComponent = () => {
							const ${functionName} = () => console.log('test');
							return <${componentName} ${propName}={${functionName}} />;
						};
					`;

					// Run the rule
					const messages = runRule(jsxRules['no-inline-functions'], code);

					// Should NOT report an error for function references
					expect(messages.length).toBe(0);

					return true;
				},
			),
			{ numRuns: 100 },
		);
	});

	it('Property 10 (extended): Function call exemption', () => {
		/**
		 * Extended test for Property 10: Function reference exemption
		 * Function calls that return functions should also be exempt
		 */

		const functionNameGen = fc
			.string({ minLength: 1, maxLength: 15 })
			.map((s) => {
				const cleaned = s.replace(/[^a-zA-Z0-9]/g, '');
				if (cleaned.length === 0) return 'getHandler';
				return cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
			})
			.filter((name) => name.length > 0 && /^[a-z]/.test(name));

		const propNameGen = fc
			.string({ minLength: 1, maxLength: 15 })
			.map((s) => {
				const cleaned = s.replace(/[^a-zA-Z0-9]/g, '');
				if (cleaned.length === 0) return 'prop';
				return cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
			})
			.filter((name) => name.length > 0 && /^[a-z]/.test(name));

		fc.assert(
			fc.property(functionNameGen, propNameGen, (functionName, propName) => {
				// Build code with function call (not inline function)
				const code = `
						const TestComponent = () => (
							<div ${propName}={${functionName}()} />
						);
					`;

				// Run the rule
				const messages = runRule(jsxRules['no-inline-functions'], code);

				// Should NOT report an error for function calls
				expect(messages.length).toBe(0);

				return true;
			}),
			{ numRuns: 100 },
		);
	});
});
