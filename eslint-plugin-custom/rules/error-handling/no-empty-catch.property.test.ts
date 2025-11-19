import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { runRule } from '../../test-utils';

import errorHandlingRules from './eslint-plugin-error-handling-rules';

describe('Property Tests: no-empty-catch', () => {
	it('Property 10: Unused catch parameter warning', () => {
		/**
		 * Feature: additional-eslint-rules, Property 10: Unused catch parameter warning
		 * For any catch block with an unused error parameter, the rule should report a warning
		 * Validates: Requirements 3.5
		 */

		// Generator for function names
		const functionNameGen = fc
			.string({ minLength: 1, maxLength: 15 })
			.map((s) => {
				const cleaned = s.replace(/[^a-zA-Z0-9]/g, '');
				if (cleaned.length === 0) return 'riskyOperation';
				return cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
			})
			.filter((name) => name.length > 0 && /^[a-z]/.test(name));

		// Generator for parameter names
		const paramNameGen = fc.constantFrom('error', 'err', 'e', 'exception', 'ex');

		// Generator for catch block content (with or without parameter usage)
		const catchContentGen = fc.oneof(
			// Content that doesn't use the parameter
			fc.constant('console.log("An error occurred");'),
			fc.constant('return null;'),
			fc.constant('console.warn("Something went wrong");'),
			// Content that uses the parameter (will be replaced with actual param name)
			fc.constant('console.error(PARAM);'),
			fc.constant('console.log("Error:", PARAM);'),
			fc.constant('throw PARAM;'),
			fc.constant('console.error(PARAM.message);'),
		);

		fc.assert(
			fc.property(
				functionNameGen,
				paramNameGen,
				catchContentGen,
				(funcName, paramName, catchContent) => {
					// Replace PARAM placeholder with actual parameter name
					const isParamUsed = catchContent.includes('PARAM');
					const actualContent = catchContent.replace(/PARAM/g, paramName);

					const code = `
					try {
						${funcName}();
					} catch (${paramName}) {
						${actualContent}
					}
				`;

					// Run the rule
					const messages = runRule(errorHandlingRules['no-empty-catch'], code);

					// Should report warning if and only if parameter is unused
					if (isParamUsed) {
						// Parameter is used, should not report unused param warning
						const unusedParamMessages = messages.filter((m) =>
							m.message.includes('never used'),
						);
						expect(unusedParamMessages.length).toBe(0);
					} else {
						// Parameter is unused, should report warning
						const unusedParamMessages = messages.filter((m) =>
							m.message.includes('never used'),
						);
						expect(unusedParamMessages.length).toBeGreaterThan(0);
						expect(unusedParamMessages[0].message).toContain(paramName);
					}

					return true;
				},
			),
			{ numRuns: 100 },
		);
	});

	it('Property 9: Empty catch block detection', () => {
		/**
		 * Feature: additional-eslint-rules, Property 9: Empty catch block detection
		 * For any catch block, the rule should report an error if and only if the block contains
		 * no statements (excluding whitespace and comments without the intentional ignore pattern)
		 * Validates: Requirements 3.1, 3.2, 3.3
		 */

		// Generator for function names
		const functionNameGen = fc
			.string({ minLength: 1, maxLength: 15 })
			.map((s) => {
				const cleaned = s.replace(/[^a-zA-Z0-9]/g, '');
				if (cleaned.length === 0) return 'riskyOperation';
				return cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
			})
			.filter((name) => name.length > 0 && /^[a-z]/.test(name));

		// Generator for catch block content (empty or with statements)
		const catchContentGen = fc.oneof(
			// Empty catch block
			fc.constant(''),
			// Catch block with whitespace only
			fc.constant('   \n   '),
			// Catch block with a statement
			fc.constant('console.error(error);'),
			// Catch block with logging
			fc.constant('console.log("Error occurred");'),
			// Catch block with rethrow
			fc.constant('throw error;'),
			// Catch block with multiple statements
			fc.constant('console.error(error);\nthrow error;'),
		);

		fc.assert(
			fc.property(functionNameGen, catchContentGen, (funcName, catchContent) => {
				const code = `
					try {
						${funcName}();
					} catch (error) {
						${catchContent}
					}
				`;

				// Run the rule
				const messages = runRule(errorHandlingRules['no-empty-catch'], code);

				// Determine if catch block is effectively empty
				const isEmpty = catchContent.trim().length === 0;

				// Filter for empty catch block messages only (not unused parameter warnings)
				const emptyCatchMessages = messages.filter((m) =>
					m.message.includes('Empty catch block'),
				);

				// Should report error if and only if catch block is empty
				if (isEmpty) {
					expect(emptyCatchMessages.length).toBeGreaterThan(0);
					expect(emptyCatchMessages[0].message).toContain('Empty catch block detected');
				} else {
					expect(emptyCatchMessages.length).toBe(0);
				}

				return true;
			}),
			{ numRuns: 100 },
		);
	});

	it('Property 9 (Extended): Intentional ignore comment exemption', () => {
		/**
		 * Feature: additional-eslint-rules, Property 9: Empty catch block detection
		 * For any catch block with an intentional ignore comment, the rule should not report an error
		 * Validates: Requirements 3.4
		 */

		// Generator for function names
		const functionNameGen = fc
			.string({ minLength: 1, maxLength: 15 })
			.map((s) => {
				const cleaned = s.replace(/[^a-zA-Z0-9]/g, '');
				if (cleaned.length === 0) return 'riskyOperation';
				return cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
			})
			.filter((name) => name.length > 0 && /^[a-z]/.test(name));

		// Generator for intentional ignore comment patterns
		const ignoreCommentGen = fc.constantFrom(
			'// intentionally ignored',
			'// deliberately ignored',
			'// ignore error',
			'// no-op',
			'// noop',
			'/* intentionally ignored */',
		);

		fc.assert(
			fc.property(functionNameGen, ignoreCommentGen, (funcName, comment) => {
				const code = `
					try {
						${funcName}();
					} catch (error) {
						${comment}
					}
				`;

				// Run the rule
				const messages = runRule(errorHandlingRules['no-empty-catch'], code);

				// Should NOT report error for intentional ignore comment
				expect(messages.length).toBe(0);

				return true;
			}),
			{ numRuns: 100 },
		);
	});
});
