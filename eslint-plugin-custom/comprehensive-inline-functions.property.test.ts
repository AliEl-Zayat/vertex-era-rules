import fc from 'fast-check';
import { describe, it } from 'vitest';

import plugin from '../src/plugin.js';
import { runRule } from './test-utils.js';

/**
 * Feature: comprehensive-rule-verification, Property 11: JSX inline function detection
 * For any JSX element with a prop containing an inline arrow function,
 * the no-inline-functions rule should detect a violation.
 * Validates: Requirements 2.2
 */
describe('Property 11: JSX inline function detection', () => {
	const rule = plugin.rules['no-inline-functions'];

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

	// Generator for inline functions
	const inlineFunctionGen = fc.oneof(
		fc.constant('() => {}'), // No params, empty body
		fc.constant('() => console.log("test")'), // No params, expression body
		fc.constant('(e) => e.preventDefault()'), // Single param
		fc.constant('(x, y) => x + y'), // Multiple params
		fc.constant('(item) => { return item.id; }'), // Block body
		fc.constant('function() {}'), // Function expression, no params
		fc.constant('function(e) { e.preventDefault(); }'), // Function expression with params
	);

	it('should detect any inline function in JSX props', () => {
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
					const messages = runRule(rule, code);

					// Should report an error
					return messages.length > 0 && messages[0].message.includes('inline function');
				},
			),
			{ numRuns: 100 },
		);
	});

	it('should allow function references (not inline functions)', () => {
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
					const messages = runRule(rule, code);

					// Should NOT report an error for function references
					return messages.length === 0;
				},
			),
			{ numRuns: 100 },
		);
	});
});
