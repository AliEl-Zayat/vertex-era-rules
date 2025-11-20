import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import plugin from '../src/plugin.js';

import { runRule } from './test-utils.js';

/**
 * Feature: comprehensive-rule-verification, Property 17: Empty catch block detection
 * For any try-catch block with an empty catch clause,
 * the no-empty-catch rule should detect a violation.
 * Validates: Requirements 2.9
 */
describe('Property 17: Empty catch block detection', () => {
	const rule = plugin.rules['no-empty-catch'];

	// Generator for function names (camelCase)
	const functionNameGen = fc
		.string({ minLength: 1, maxLength: 15 })
		.map((s) => {
			const cleaned = s.replace(/[^a-zA-Z0-9]/g, '');
			if (cleaned.length === 0) return 'doSomething';
			return cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
		})
		.filter((name) => name.length > 0 && /^[a-z]/.test(name));

	// Generator for catch parameter names
	const paramNameGen = fc.constantFrom('error', 'err', 'e', 'exception', 'ex');

	// Generator for catch block content (empty vs non-empty)
	const catchContentGen = fc.oneof(
		// Empty catch blocks (should trigger violation)
		fc.constant(''),
		fc.constant('   '),
		fc.constant('\n\n'),
		fc.constant('  \n  \n  '),
		// Non-empty catch blocks (should NOT trigger violation)
		fc.constant('console.error(error);'),
		fc.constant('console.log("Error occurred");'),
		fc.constant('throw error;'),
		fc.constant('return null;'),
		fc.constant('console.error(error);\nthrow error;'),
	);

	it('should detect any empty catch block', () => {
		fc.assert(
			fc.property(
				functionNameGen,
				paramNameGen,
				catchContentGen,
				(funcName, paramName, catchContent) => {
					// Build try-catch code
					const code = `
						try {
							${funcName}();
						} catch (${paramName}) {
							${catchContent}
						}
					`;

					// Run the rule
					const messages = runRule(rule, code);

					// Determine if catch block is effectively empty
					const isEmpty = catchContent.trim().length === 0;

					// Filter for empty catch block messages only
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
				},
			),
			{ numRuns: 100 },
		);
	});

	it('should allow catch blocks with error handling', () => {
		// Generator for error handling statements
		const errorHandlingGen = fc.oneof(
			fc.constant('console.error(error);'),
			fc.constant('console.log(error);'),
			fc.constant('throw error;'),
			fc.constant('console.error("Error:", error);'),
			fc.constant('console.error(error.message);'),
			fc.constant('return;'),
			fc.constant('console.warn(error);'),
		);

		fc.assert(
			fc.property(
				functionNameGen,
				paramNameGen,
				errorHandlingGen,
				(funcName, paramName, errorHandling) => {
					// Build try-catch code with error handling
					const code = `
						try {
							${funcName}();
						} catch (${paramName}) {
							${errorHandling}
						}
					`;

					// Run the rule
					const messages = runRule(rule, code);

					// Filter for empty catch block messages only
					const emptyCatchMessages = messages.filter((m) =>
						m.message.includes('Empty catch block'),
					);

					// Should NOT report empty catch block error
					expect(emptyCatchMessages.length).toBe(0);

					return true;
				},
			),
			{ numRuns: 100 },
		);
	});

	it('should allow catch blocks with intentional ignore comments', () => {
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
			fc.property(
				functionNameGen,
				paramNameGen,
				ignoreCommentGen,
				(funcName, paramName, comment) => {
					// Build try-catch code with intentional ignore comment
					const code = `
						try {
							${funcName}();
						} catch (${paramName}) {
							${comment}
						}
					`;

					// Run the rule
					const messages = runRule(rule, code);

					// Should NOT report any errors for intentional ignore comment
					expect(messages.length).toBe(0);

					return true;
				},
			),
			{ numRuns: 100 },
		);
	});

	it('should detect empty catch blocks without parameters', () => {
		fc.assert(
			fc.property(functionNameGen, (funcName) => {
				// Build try-catch code without catch parameter
				const code = `
					try {
						${funcName}();
					} catch {
					}
				`;

				// Run the rule
				const messages = runRule(rule, code);

				// Filter for empty catch block messages
				const emptyCatchMessages = messages.filter((m) =>
					m.message.includes('Empty catch block'),
				);

				// Should report error for empty catch block
				expect(emptyCatchMessages.length).toBeGreaterThan(0);
				expect(emptyCatchMessages[0].message).toContain('Empty catch block detected');

				return true;
			}),
			{ numRuns: 100 },
		);
	});
});
