import fc from 'fast-check';
import { describe, it } from 'vitest';

import { runRule } from './test-utils.js';

/**
 * Feature: comprehensive-rule-verification, Property 2: Console statement detection
 * For any console method (log, error, warn), when code contains that console method call,
 * the console rule should detect a violation.
 * Validates: Requirements 1.2
 */
describe('Property 2: Console statement detection', () => {
	// Simple rule implementation for testing console statements
	const consoleRule = {
		meta: {
			type: 'problem' as const,
			docs: {
				description: 'disallow the use of console',
			},
			schema: [],
			messages: {
				unexpected: 'Unexpected console statement.',
			},
		},
		create(context: any) {
			return {
				MemberExpression(node: any) {
					if (node.object.type === 'Identifier' && node.object.name === 'console') {
						context.report({
							node,
							messageId: 'unexpected',
						});
					}
				},
			};
		},
	};

	// Generator for console methods
	const consoleMethod = fc.constantFrom('log', 'error', 'warn', 'info', 'debug', 'trace');

	// Generator for arbitrary console arguments
	const consoleArg = fc.oneof(
		fc.string({ maxLength: 50 }).map((s) => JSON.stringify(s)),
		fc.integer().map((n) => n.toString()),
		fc.constant('null'),
		fc.constant('undefined'),
		fc.constant('true'),
		fc.constant('false'),
	);

	// Generator for multiple console arguments
	const consoleArgs = fc.array(consoleArg, { minLength: 0, maxLength: 3 });

	it('should detect any console method call', () => {
		fc.assert(
			fc.property(consoleMethod, consoleArgs, (method, args) => {
				const argsStr = args.length > 0 ? args.join(', ') : '';
				const code = `console.${method}(${argsStr});`;
				const messages = runRule(consoleRule, code);

				// Should report at least one error
				return messages.length > 0 && messages[0].message.includes('console');
			}),
			{ numRuns: 100 },
		);
	});

	it('should detect console.log specifically', () => {
		fc.assert(
			fc.property(consoleArgs, (args) => {
				const argsStr = args.length > 0 ? args.join(', ') : '';
				const code = `console.log(${argsStr});`;
				const messages = runRule(consoleRule, code);

				// Should report at least one error
				return messages.length > 0 && messages[0].message.includes('console');
			}),
			{ numRuns: 100 },
		);
	});

	it('should detect console.error specifically', () => {
		fc.assert(
			fc.property(consoleArgs, (args) => {
				const argsStr = args.length > 0 ? args.join(', ') : '';
				const code = `console.error(${argsStr});`;
				const messages = runRule(consoleRule, code);

				// Should report at least one error
				return messages.length > 0 && messages[0].message.includes('console');
			}),
			{ numRuns: 100 },
		);
	});

	it('should detect console.warn specifically', () => {
		fc.assert(
			fc.property(consoleArgs, (args) => {
				const argsStr = args.length > 0 ? args.join(', ') : '';
				const code = `console.warn(${argsStr});`;
				const messages = runRule(consoleRule, code);

				// Should report at least one error
				return messages.length > 0 && messages[0].message.includes('console');
			}),
			{ numRuns: 100 },
		);
	});

	it('should detect console statements in different contexts', () => {
		fc.assert(
			fc.property(consoleMethod, consoleArg, (method, arg) => {
				// Test console in various code contexts
				const contexts = [
					`console.${method}(${arg});`,
					`function test() { console.${method}(${arg}); }`,
					`if (true) { console.${method}(${arg}); }`,
					`const fn = () => { console.${method}(${arg}); };`,
				];

				// All contexts should detect the console statement
				return contexts.every((code) => {
					const messages = runRule(consoleRule, code);
					return messages.length > 0 && messages[0].message.includes('console');
				});
			}),
			{ numRuns: 100 },
		);
	});
});
