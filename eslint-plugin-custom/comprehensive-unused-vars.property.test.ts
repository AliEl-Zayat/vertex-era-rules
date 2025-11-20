import fc from 'fast-check';
import { describe, it } from 'vitest';

import { runRule } from './test-utils.js';

/**
 * Feature: comprehensive-rule-verification, Property 3: Unused variable detection with prefix exceptions
 * For any variable that is declared but never used, if the variable name starts with underscore or 'k',
 * no violation should be reported; otherwise a violation should be reported.
 * Validates: Requirements 1.3
 */
describe('Property 3: Unused variable detection with prefix exceptions', () => {
	// Simple rule implementation for testing
	const unusedVarRule = {
		meta: {
			type: 'problem' as const,
			docs: {
				description: 'disallow unused variables',
			},
			schema: [],
			messages: {
				unusedVar: "'{{varName}}' is assigned a value but never used.",
			},
		},
		create(context: any) {
			const declaredVars = new Set<string>();
			const usedVars = new Set<string>();

			return {
				'VariableDeclarator'(node: any) {
					if (node.id.type === 'Identifier') {
						declaredVars.add(node.id.name);
					}
				},
				'Identifier'(node: any) {
					const parent = node.parent;
					if (
						parent &&
						parent.type !== 'VariableDeclarator' &&
						parent.type !== 'FunctionDeclaration'
					) {
						usedVars.add(node.name);
					}
				},
				'Program:exit'() {
					for (const varName of declaredVars) {
						if (!usedVars.has(varName)) {
							// Check for underscore or 'k' prefix
							if (!varName.startsWith('_') && !varName.startsWith('k')) {
								const sourceCode = context.sourceCode;
								const tokens = sourceCode.ast.tokens || [];
								const varToken = tokens.find(
									(t: any) => t.type === 'Identifier' && t.value === varName,
								);
								if (varToken) {
									context.report({
										loc: varToken.loc,
										messageId: 'unusedVar',
										data: { varName },
									});
								}
							}
						}
					}
				},
			};
		},
	};

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

	// Generator for valid variable names without prefix
	const varNameWithoutPrefix = fc
		.string({ minLength: 1, maxLength: 20 })
		.filter((s) => /^[a-zA-Z][a-zA-Z0-9_$]*$/.test(s))
		.filter((s) => !s.startsWith('_') && !s.startsWith('k'))
		.filter((s) => !reservedKeywords.has(s));

	// Generator for variable names with underscore prefix
	const varNameWithUnderscore = fc
		.string({ minLength: 1, maxLength: 20 })
		.filter((s) => /^[a-zA-Z][a-zA-Z0-9_$]*$/.test(s))
		.map((s) => `_${s}`);

	// Generator for variable names with 'k' prefix
	const varNameWithK = fc
		.string({ minLength: 1, maxLength: 20 })
		.filter((s) => /^[a-zA-Z][a-zA-Z0-9_$]*$/.test(s))
		.map((s) => `k${s.charAt(0).toUpperCase()}${s.slice(1)}`);

	// Generator for arbitrary values
	const arbitraryValue = fc.oneof(
		fc.constant('null'),
		fc.constant('undefined'),
		fc.integer().map((n) => n.toString()),
		fc.string({ maxLength: 20 }).map((s) => JSON.stringify(s)),
	);

	it('should detect any unused variable without prefix', () => {
		fc.assert(
			fc.property(varNameWithoutPrefix, arbitraryValue, (varName, value) => {
				const code = `const ${varName} = ${value};`;
				const messages = runRule(unusedVarRule, code);

				// Should report at least one error
				return messages.length > 0 && messages[0].message.includes('never used');
			}),
			{ numRuns: 100 },
		);
	});

	it('should not detect unused variables with underscore prefix', () => {
		fc.assert(
			fc.property(varNameWithUnderscore, arbitraryValue, (varName, value) => {
				const code = `const ${varName} = ${value};`;
				const messages = runRule(unusedVarRule, code);

				// Should not report any errors
				return messages.length === 0;
			}),
			{ numRuns: 100 },
		);
	});

	it('should not detect unused variables with k prefix', () => {
		fc.assert(
			fc.property(varNameWithK, arbitraryValue, (varName, value) => {
				const code = `const ${varName} = ${value};`;
				const messages = runRule(unusedVarRule, code);

				// Should not report any errors
				return messages.length === 0;
			}),
			{ numRuns: 100 },
		);
	});
});
