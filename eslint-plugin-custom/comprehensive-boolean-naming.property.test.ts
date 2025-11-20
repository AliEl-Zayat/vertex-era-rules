import fc from 'fast-check';
import { describe, it } from 'vitest';

import namingRules from './rules/naming/eslint-plugin-naming-rules.js';
import { runRule } from './test-utils.js';

/**
 * Feature: comprehensive-rule-verification, Property 8: Boolean naming convention enforcement
 * For any boolean variable, if the variable name does not start with one of the allowed prefixes
 * (is, has, should, can, will, as, with), the boolean naming rule should detect a violation.
 * Validates: Requirements 1.8, 2.3
 */
describe('Property 8: Boolean naming convention enforcement', () => {
	const rule = namingRules['boolean-naming-convention'];

	// Allowed prefixes according to requirements
	const allowedPrefixes = ['is', 'has', 'should', 'can', 'will', 'as', 'with'];

	// Generator for valid boolean variable names (with allowed prefix)
	const validBooleanName = fc
		.string({ minLength: 1, maxLength: 20 })
		.filter((s) => /^[a-zA-Z][a-zA-Z0-9_$]*$/.test(s))
		.chain((s) =>
			fc
				.constantFrom(...allowedPrefixes)
				.map((prefix) => `${prefix}${s.charAt(0).toUpperCase()}${s.slice(1)}`),
		);

	// Generator for invalid boolean variable names (without allowed prefix)
	const invalidBooleanName = fc
		.string({ minLength: 1, maxLength: 20 })
		.filter((s) => /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(s))
		.filter((s) => {
			// Exclude names that start with any allowed prefix followed by uppercase
			return !allowedPrefixes.some((prefix) => {
				if (s.length > prefix.length) {
					const nextChar = s.charAt(prefix.length);
					return s.startsWith(prefix) && nextChar >= 'A' && nextChar <= 'Z';
				}
				return false;
			});
		});

	it(
		'should detect violation for any boolean variable without allowed prefix',
		{ timeout: 10000 },
		() => {
			fc.assert(
				fc.property(invalidBooleanName, (varName) => {
					const code = `const ${varName}: boolean = true;`;
					const messages = runRule(rule, code);

					// Should report at least one error
					return messages.length > 0;
				}),
				{ numRuns: 100 },
			);
		},
	);

	it('should not detect violation for any boolean variable with allowed prefix', () => {
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

	it('should detect violation for boolean parameters without allowed prefix', () => {
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

	it('should not detect violation for boolean parameters with allowed prefix', () => {
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

	it('should detect violation for boolean properties without allowed prefix', () => {
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

	it('should not detect violation for boolean properties with allowed prefix', () => {
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
});
