import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { runRule } from '../../test-utils';

import jsxRules from './eslint-plugin-jsx-rules';

describe('Property Tests: no-inline-objects', () => {
	it('Property 7: Inline object detection', () => {
		/**
		 * Feature: custom-eslint-rules, Property 7: Inline object detection
		 * For any JSX element with a prop containing an inline object literal,
		 * the linting system should report an error identifying the specific prop name.
		 * Validates: Requirements 3.1, 3.2, 3.4
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

		// Generator for object properties
		const objectPropertyGen = fc.oneof(
			fc.constant('{ }'), // Empty object
			fc.constant('{ a: 1 }'), // Single property
			fc.constant('{ x: "test", y: 42 }'), // Multiple properties
			fc.constant('{ enabled: true }'), // Boolean value
			fc.constant('{ color: "red", size: "large" }'), // String values
		);

		fc.assert(
			fc.property(
				componentNameGen,
				propNameGen,
				objectPropertyGen,
				(componentName, propName, objectLiteral) => {
					// Build code with inline object
					const code = `
						const TestComponent = () => (
							<${componentName} ${propName}={${objectLiteral}} />
						);
					`;

					// Run the rule
					const messages = runRule(jsxRules['no-inline-objects'], code);

					// Should report an error
					expect(messages.length).toBeGreaterThan(0);

					// Error message should contain the prop name
					const errorMessage = messages[0].message;
					expect(errorMessage).toContain(propName);
					expect(errorMessage).toContain('inline object');

					return true;
				},
			),
			{ numRuns: 100 },
		);
	});

	it('Property 8: Variable reference exemption for objects', () => {
		/**
		 * Feature: custom-eslint-rules, Property 8: Variable reference exemption for objects
		 * For any JSX element using variable references for props (not inline literals),
		 * the linting system should not report inline object errors.
		 * Validates: Requirements 3.3
		 */

		// Generator for variable names (camelCase)
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

		const variableNameGen = fc
			.string({ minLength: 1, maxLength: 15 })
			.map((s) => {
				const cleaned = s.replace(/[^a-zA-Z0-9]/g, '');
				if (cleaned.length === 0) return 'variable';
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
				variableNameGen,
				(componentName, propName, variableName) => {
					// Build code with variable reference (not inline object)
					const code = `
						const TestComponent = () => {
							const ${variableName} = { x: 1, y: 2 };
							return <${componentName} ${propName}={${variableName}} />;
						};
					`;

					// Run the rule
					const messages = runRule(jsxRules['no-inline-objects'], code);

					// Should NOT report an error for variable references
					expect(messages.length).toBe(0);

					return true;
				},
			),
			{ numRuns: 100 },
		);
	});

	it('Property 8 (extended): Function call exemption for objects', () => {
		/**
		 * Extended test for Property 8: Variable reference exemption
		 * Function calls that return objects should also be exempt
		 */

		const functionNameGen = fc
			.string({ minLength: 1, maxLength: 15 })
			.map((s) => {
				const cleaned = s.replace(/[^a-zA-Z0-9]/g, '');
				if (cleaned.length === 0) return 'getObject';
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
				// Build code with function call (not inline object)
				const code = `
						const TestComponent = () => (
							<div ${propName}={${functionName}()} />
						);
					`;

				// Run the rule
				const messages = runRule(jsxRules['no-inline-objects'], code);

				// Should NOT report an error for function calls
				expect(messages.length).toBe(0);

				return true;
			}),
			{ numRuns: 100 },
		);
	});
});
