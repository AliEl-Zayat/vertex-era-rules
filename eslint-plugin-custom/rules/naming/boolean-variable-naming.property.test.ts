import fc from 'fast-check';
import { describe, it } from 'vitest';

import { runRule } from '../../test-utils.js';

import namingRules from './eslint-plugin-naming-rules.js';

/**
 * Feature: custom-eslint-rules, Property 11: Boolean variable naming
 * For any boolean variable declaration, if the variable name does not start with "is"
 * followed by a capital letter, the linting system should report an error.
 * Validates: Requirements 5.1, 5.2
 */
describe('Property 11: Boolean variable naming', () => {
	const rule = namingRules['boolean-naming-convention'];

	// Generator for valid boolean variable names (isXxx format)
	const validBooleanName = fc
		.string({ minLength: 1, maxLength: 20 })
		.filter((s) => /^[a-zA-Z][a-zA-Z0-9_$]*$/.test(s)) // Must start with letter
		.map((s) => `is${s.charAt(0).toUpperCase()}${s.slice(1)}`);

	// Generator for invalid boolean variable names (not isXxx format)
	const invalidBooleanName = fc
		.string({ minLength: 1, maxLength: 20 })
		.filter((s) => /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(s))
		.filter((s) => !/^is[A-Z]/.test(s));

	it('should report error for any boolean variable without is prefix', () => {
		fc.assert(
			fc.property(invalidBooleanName, (varName) => {
				const code = `const ${varName}: boolean = true;`;
				const messages = runRule(rule, code);

				// Should report at least one error
				return messages.length > 0;
			}),
			{ numRuns: 100 },
		);
	});

	it('should not report error for any boolean variable with valid is prefix', () => {
		fc.assert(
			fc.property(validBooleanName, (varName) => {
				const code = `const ${varName}: boolean = true;`;
				const messages = runRule(rule, code);

				// Should not report any errors
				return messages.length === 0;
			}),
			{ numRuns: 100 },
		);
	});
});

/**
 * Feature: custom-eslint-rules, Property 12: Non-boolean exemption
 * For any non-boolean variable declaration, the boolean naming convention rule should not apply.
 * Validates: Requirements 5.3
 */
describe('Property 12: Non-boolean exemption', () => {
	const rule = namingRules['boolean-naming-convention'];

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

	// Generator for variable names that don't follow isXxx pattern
	const anyVariableName = fc
		.string({ minLength: 1, maxLength: 20 })
		.filter((s) => /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(s))
		.filter((s) => !reservedKeywords.has(s));

	// Generator for non-boolean types
	const nonBooleanType = fc.oneof(
		fc.constant('string'),
		fc.constant('number'),
		fc.constant('object'),
		fc.constant('any'),
		fc.constant('unknown'),
	);

	it('should not report error for any non-boolean variable regardless of name', () => {
		fc.assert(
			fc.property(anyVariableName, nonBooleanType, (varName, type) => {
				const code = `const ${varName}: ${type} = null as any;`;
				const messages = runRule(rule, code);

				// Should not report any errors for non-boolean types
				return messages.length === 0;
			}),
			{ numRuns: 100 },
		);
	});
});

/**
 * Feature: custom-eslint-rules, Property 13: Boolean parameter naming
 * For any function parameter with boolean type annotation, the parameter name should
 * follow the isVariableName convention.
 * Validates: Requirements 5.4
 */
describe('Property 13: Boolean parameter naming', () => {
	const rule = namingRules['boolean-naming-convention'];

	// Generator for valid boolean parameter names
	const validBooleanName = fc
		.string({ minLength: 1, maxLength: 20 })
		.filter((s) => /^[a-zA-Z][a-zA-Z0-9_$]*$/.test(s)) // Must start with letter
		.map((s) => `is${s.charAt(0).toUpperCase()}${s.slice(1)}`);

	// Generator for invalid boolean parameter names
	const invalidBooleanName = fc
		.string({ minLength: 1, maxLength: 20 })
		.filter((s) => /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(s))
		.filter((s) => !/^is[A-Z]/.test(s));

	it('should report error for any boolean parameter without is prefix', () => {
		fc.assert(
			fc.property(invalidBooleanName, (paramName) => {
				const code = `function test(${paramName}: boolean) {}`;
				const messages = runRule(rule, code);

				// Should report at least one error
				return messages.length > 0;
			}),
			{ numRuns: 100 },
		);
	});

	it('should not report error for any boolean parameter with valid is prefix', () => {
		fc.assert(
			fc.property(validBooleanName, (paramName) => {
				const code = `function test(${paramName}: boolean) {}`;
				const messages = runRule(rule, code);

				// Should not report any errors
				return messages.length === 0;
			}),
			{ numRuns: 100 },
		);
	});

	it('should work with arrow functions', () => {
		fc.assert(
			fc.property(invalidBooleanName, (paramName) => {
				const code = `const test = (${paramName}: boolean) => {};`;
				const messages = runRule(rule, code);

				// Should report at least one error
				return messages.length > 0;
			}),
			{ numRuns: 100 },
		);
	});
});

/**
 * Feature: custom-eslint-rules, Property 14: Boolean property naming
 * For any interface or type property with boolean type annotation, the property name
 * should follow the isVariableName convention.
 * Validates: Requirements 5.5
 */
describe('Property 14: Boolean property naming', () => {
	const rule = namingRules['boolean-naming-convention'];

	// Generator for valid boolean property names
	const validBooleanName = fc
		.string({ minLength: 1, maxLength: 20 })
		.filter((s) => /^[a-zA-Z][a-zA-Z0-9_$]*$/.test(s)) // Must start with letter
		.map((s) => `is${s.charAt(0).toUpperCase()}${s.slice(1)}`);

	// Generator for invalid boolean property names
	const invalidBooleanName = fc
		.string({ minLength: 1, maxLength: 20 })
		.filter((s) => /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(s))
		.filter((s) => !/^is[A-Z]/.test(s));

	it('should report error for any boolean property without is prefix in interfaces', () => {
		fc.assert(
			fc.property(invalidBooleanName, (propName) => {
				const code = `interface User { ${propName}: boolean; }`;
				const messages = runRule(rule, code);

				// Should report at least one error
				return messages.length > 0;
			}),
			{ numRuns: 100 },
		);
	});

	it('should not report error for any boolean property with valid is prefix in interfaces', () => {
		fc.assert(
			fc.property(validBooleanName, (propName) => {
				const code = `interface User { ${propName}: boolean; }`;
				const messages = runRule(rule, code);

				// Should not report any errors
				return messages.length === 0;
			}),
			{ numRuns: 100 },
		);
	});

	it('should work with type aliases', () => {
		fc.assert(
			fc.property(invalidBooleanName, (propName) => {
				const code = `type User = { ${propName}: boolean; };`;
				const messages = runRule(rule, code);

				// Should report at least one error
				return messages.length > 0;
			}),
			{ numRuns: 100 },
		);
	});
});
