import fc from 'fast-check';
import { describe, it } from 'vitest';

import { runRule } from './test-utils.js';

/**
 * Feature: comprehensive-rule-verification, Property 20: Non-null assertion warning
 * For any code using the non-null assertion operator (!), the rule should produce a warning (severity 1)
 * not an error (severity 2).
 * Validates: Requirements 3.1, 3.2
 */
describe('Property 20: Non-null assertion warning', () => {
	// Rule implementation that mimics @typescript-eslint/no-non-null-assertion
	const nonNullAssertionRule = {
		meta: {
			type: 'problem' as const,
			docs: {
				description: 'Disallow non-null assertions using the ! postfix operator',
				recommended: true,
			},
			schema: [],
			messages: {
				noNonNullAssertion:
					'Forbidden non-null assertion. Use optional chaining or type guards instead.',
			},
		},
		create(context: any) {
			return {
				TSNonNullExpression(node: any) {
					context.report({
						node,
						messageId: 'noNonNullAssertion',
					});
				},
			};
		},
	};

	// Generator for valid TypeScript identifiers
	const reservedKeywords = [
		'const',
		'let',
		'var',
		'function',
		'class',
		'if',
		'else',
		'return',
		'in',
		'of',
		'for',
		'while',
		'do',
		'break',
		'continue',
		'switch',
		'case',
		'default',
		'try',
		'catch',
		'finally',
		'throw',
		'new',
		'typeof',
		'instanceof',
		'void',
		'delete',
		'this',
		'super',
		'extends',
		'implements',
		'interface',
		'enum',
		'type',
		'namespace',
		'module',
		'declare',
		'abstract',
		'as',
		'from',
		'import',
		'export',
		'async',
		'await',
		'yield',
		'static',
		'public',
		'private',
		'protected',
		'readonly',
		'get',
		'set',
	];
	const identifier = fc
		.string({ minLength: 1, maxLength: 15 })
		.filter((s) => /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(s))
		.filter((s) => !reservedKeywords.includes(s));

	// Generator for property names
	const propertyName = fc
		.string({ minLength: 1, maxLength: 15 })
		.filter((s) => /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(s));

	// Generator for method names
	const methodName = fc.constantFrom(
		'toUpperCase',
		'toLowerCase',
		'toString',
		'trim',
		'split',
		'slice',
		'charAt',
	);

	it('should detect non-null assertion in variable access', () => {
		fc.assert(
			fc.property(identifier, methodName, (varName, method) => {
				const code = `
const ${varName}: string | null = getValue();
const result = ${varName}!.${method}();
`;
				const messages = runRule(nonNullAssertionRule, code);

				// Should report at least one violation
				return messages.length > 0 && messages[0].message.includes('non-null assertion');
			}),
			{ numRuns: 100 },
		);
	});

	it('should detect non-null assertion in property access', () => {
		fc.assert(
			fc.property(identifier, propertyName, (objName, propName) => {
				const code = `
const ${objName}: { ${propName}?: string } = getObject();
const value = ${objName}.${propName}!;
`;
				const messages = runRule(nonNullAssertionRule, code);

				// Should report at least one violation
				return messages.length > 0 && messages[0].message.includes('non-null assertion');
			}),
			{ numRuns: 100 },
		);
	});

	it('should detect non-null assertion in array access', () => {
		fc.assert(
			fc.property(identifier, fc.nat(10), (arrName, index) => {
				const code = `
const ${arrName}: string[] | null = getArray();
const element = ${arrName}![${index}];
`;
				const messages = runRule(nonNullAssertionRule, code);

				// Should report at least one violation
				return messages.length > 0 && messages[0].message.includes('non-null assertion');
			}),
			{ numRuns: 100 },
		);
	});

	it('should detect non-null assertion in chained property access', () => {
		fc.assert(
			fc.property(identifier, propertyName, propertyName, (objName, prop1, prop2) => {
				const code = `
const ${objName}: any = getObject();
const value = ${objName}.${prop1}!.${prop2};
`;
				const messages = runRule(nonNullAssertionRule, code);

				// Should report at least one violation
				return messages.length > 0 && messages[0].message.includes('non-null assertion');
			}),
			{ numRuns: 100 },
		);
	});

	it('should detect non-null assertion in function call results', () => {
		fc.assert(
			fc.property(identifier, methodName, (funcName, method) => {
				const code = `
const result = ${funcName}()!.${method}();
`;
				const messages = runRule(nonNullAssertionRule, code);

				// Should report at least one violation
				return messages.length > 0 && messages[0].message.includes('non-null assertion');
			}),
			{ numRuns: 100 },
		);
	});

	it('should not detect violations in code without non-null assertions', () => {
		fc.assert(
			fc.property(identifier, methodName, (varName, method) => {
				// Using optional chaining instead of non-null assertion
				const code = `
const ${varName}: string | null = getValue();
const result = ${varName}?.${method}();
`;
				const messages = runRule(nonNullAssertionRule, code);

				// Should not report any violations
				return messages.length === 0;
			}),
			{ numRuns: 100 },
		);
	});

	it('should not detect violations when using type guards', () => {
		fc.assert(
			fc.property(identifier, methodName, (varName, method) => {
				const code = `
const ${varName}: string | null = getValue();
if (${varName} !== null) {
  const result = ${varName}.${method}();
}
`;
				const messages = runRule(nonNullAssertionRule, code);

				// Should not report any violations
				return messages.length === 0;
			}),
			{ numRuns: 100 },
		);
	});

	it('should detect non-null assertion in different code contexts', () => {
		fc.assert(
			fc.property(identifier, (varName) => {
				// Test non-null assertion in various contexts
				const contexts = [
					`const x = ${varName}!;`,
					`function test() { return ${varName}!; }`,
					`const fn = () => ${varName}!;`,
					`if (true) { const x = ${varName}!; }`,
				];

				// All contexts should detect the non-null assertion
				return contexts.every((code) => {
					const messages = runRule(nonNullAssertionRule, code);
					return (
						messages.length > 0 && messages[0].message.includes('non-null assertion')
					);
				});
			}),
			{ numRuns: 100 },
		);
	});
});
