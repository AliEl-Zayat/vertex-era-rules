import fc from 'fast-check';
import { describe, it } from 'vitest';

import plugin from '../src/plugin.js';
import { runRule } from './test-utils.js';

/**
 * Feature: comprehensive-rule-verification, Property 10: JSX inline object detection
 * For any JSX element with a prop containing an inline object literal,
 * the no-inline-objects rule should detect a violation.
 * Validates: Requirements 2.1
 */
describe('Property 10: JSX inline object detection', () => {
	const rule = plugin.rules['no-inline-objects'];

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

	it('should detect any inline object literal in JSX props', () => {
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
					const messages = runRule(rule, code);

					// Should report an error
					return messages.length > 0 && messages[0].message.includes('inline object');
				},
			),
			{ numRuns: 100 },
		);
	});

	it('should allow variable references (not inline objects)', () => {
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
					const messages = runRule(rule, code);

					// Should NOT report an error for variable references
					return messages.length === 0;
				},
			),
			{ numRuns: 100 },
		);
	});
});
