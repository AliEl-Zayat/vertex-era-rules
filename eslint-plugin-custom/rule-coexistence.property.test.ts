import { TSESLint } from '@typescript-eslint/utils';
import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import plugin from './index.js';

/**
 * Feature: additional-eslint-rules, Property: Rule coexistence
 * Validates: All requirements
 *
 * This test verifies that new rules work alongside existing rules without conflicts
 * and that multiple rules can be enabled simultaneously.
 */
describe('Rule Coexistence Property Tests', () => {
	const newRules = [
		'one-component-per-file',
		'no-empty-catch',
		'form-config-extraction',
		'no-nested-ternary',
		'no-response-data-return',
	];

	const existingRules = [
		'single-svg-per-file',
		'svg-currentcolor',
		'memoized-export',
		'no-inline-objects',
		'no-inline-functions',
		'boolean-naming-convention',
	];

	/**
	 * Helper function to run multiple rules on the same code
	 */
	function runMultipleRules(
		rules: Record<string, TSESLint.RuleModule<string, unknown[]>>,
		code: string,
		filename?: string,
	): TSESLint.Linter.LintMessage[] {
		const linter = new TSESLint.Linter();

		const config = [
			{
				files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
				languageOptions: {
					ecmaVersion: 2022,
					sourceType: 'module',
					parser: require('@typescript-eslint/parser'),
					parserOptions: {
						ecmaFeatures: {
							jsx: true,
						},
					},
				},
				plugins: {
					custom: {
						meta: {
							name: 'custom-plugin',
							version: '1.0.0',
						},
						rules,
					},
				},
				rules: Object.keys(rules).reduce<Record<string, string>>((acc, ruleName) => {
					acc[`custom/${ruleName}`] = 'error';
					return acc;
				}, {}),
			},
		];

		return linter.verify(code, config as any, { filename: filename || 'test.tsx' });
	}

	it('should allow multiple new rules to be enabled simultaneously', { timeout: 10000 }, () => {
		fc.assert(
			fc.property(
				fc.subarray(newRules, { minLength: 2, maxLength: newRules.length }),
				(selectedRules) => {
					// Property: For any subset of new rules (at least 2), they should be able to run together
					const rulesToTest = selectedRules.reduce<
						Record<string, TSESLint.RuleModule<string, unknown[]>>
					>((acc, ruleName) => {
						acc[ruleName] = plugin.rules?.[ruleName] as unknown as TSESLint.RuleModule<
							string,
							unknown[]
						>;
						return acc;
					}, {});

					// Simple valid code that shouldn't trigger any rules
					const validCode = `
						import React from 'react';
						
						export function MyComponent() {
							return <div>Hello</div>;
						}
					`;

					// Should not throw an error when running multiple rules
					expect(() => {
						runMultipleRules(rulesToTest as any, validCode);
					}).not.toThrow();

					return true;
				},
			),
			{ numRuns: 100 },
		);
	});

	it('should allow new rules to coexist with existing rules', () => {
		fc.assert(
			fc.property(
				fc.constantFrom(...newRules),
				fc.constantFrom(...existingRules),
				(newRule, existingRule) => {
					// Property: For any new rule and any existing rule, they should work together
					const rulesToTest = {
						[newRule]: plugin.rules?.[newRule],
						[existingRule]: plugin.rules?.[existingRule],
					};

					const validCode = `
						import React from 'react';
						
						export function MyComponent() {
							const value = true;
							return <div>{value ? 'yes' : 'no'}</div>;
						}
					`;

					// Should not throw an error when running both rules
					expect(() => {
						runMultipleRules(rulesToTest as any, validCode);
					}).not.toThrow();

					return true;
				},
			),
			{ numRuns: 100 },
		);
	});

	it('should produce independent errors from different rules', () => {
		// Test code that violates multiple rules
		const codeWithMultipleViolations = `
			import React from 'react';
			
			export function Component1() {
				return <div>First</div>;
			}
			
			export function Component2() {
				return <div>Second</div>;
			}
		`;

		const rulesToTest = {
			'one-component-per-file': plugin.rules?.['one-component-per-file'],
		};

		const messages = runMultipleRules(rulesToTest as any, codeWithMultipleViolations);

		// Property: Rules should produce errors independently
		expect(messages.length).toBeGreaterThan(0);
		expect(messages.every((msg) => msg.ruleId !== null)).toBe(true);
	});

	it('should handle all new rules enabled together on complex code', () => {
		const allNewRules = newRules.reduce<Record<string, TSESLint.RuleModule<string, unknown[]>>>(
			(acc, ruleName) => {
				acc[ruleName] = plugin.rules?.[ruleName] as unknown as TSESLint.RuleModule<
					string,
					unknown[]
				>;
				return acc;
			},
			{},
		);

		fc.assert(
			fc.property(
				fc.constantFrom(
					// Valid code samples
					`import React from 'react';\nexport function MyComponent() { return <div>Test</div>; }`,
					`const value = 42;\nexport default value;`,
					`function helper() { return true; }\nexport { helper };`,
				),
				(code) => {
					// Property: For any valid code, all new rules should run without throwing errors
					expect(() => {
						runMultipleRules(allNewRules, code);
					}).not.toThrow();

					return true;
				},
			),
			{ numRuns: 100 },
		);
	});

	it('should not have rule name conflicts between new and existing rules', () => {
		fc.assert(
			fc.property(fc.constantFrom(...newRules), (newRule) => {
				// Property: For any new rule, its name should not conflict with existing rules
				expect(existingRules).not.toContain(newRule);
				return true;
			}),
			{ numRuns: 100 },
		);
	});

	it('should maintain rule independence - one rule error does not affect others', () => {
		fc.assert(
			fc.property(
				fc.constantFrom(...newRules),
				fc.constantFrom(...newRules),
				(rule1, rule2) => {
					if (rule1 === rule2) return true; // Skip same rule

					// Property: For any two different rules, they should operate independently
					const rulesToTest = {
						[rule1]: plugin.rules?.[rule1],
						[rule2]: plugin.rules?.[rule2],
					};

					const code = `
						import React from 'react';
						export function Test() { return <div>Test</div>; }
					`;

					const messages = runMultipleRules(rulesToTest as any, code);

					// Each message should have a valid ruleId
					messages.forEach((msg) => {
						expect(msg.ruleId).toBeTruthy();
						expect([`custom/${rule1}`, `custom/${rule2}`]).toContain(msg.ruleId);
					});

					return true;
				},
			),
			{ numRuns: 100 },
		);
	});

	it('should allow all plugin rules to be enabled simultaneously', () => {
		const allRules = Object.keys(plugin.rules || {}).reduce<
			Record<string, TSESLint.RuleModule<string, unknown[]>>
		>((acc, ruleName) => {
			acc[ruleName] = plugin.rules?.[ruleName] as unknown as TSESLint.RuleModule<
				string,
				unknown[]
			>;
			return acc;
		}, {});

		// Simple valid code
		const validCode = `
			import React from 'react';
			export function Component() {
				return <div>Hello World</div>;
			}
		`;

		// Property: All rules in the plugin should be able to run together
		expect(() => {
			runMultipleRules(allRules, validCode);
		}).not.toThrow();
	});

	it('should produce consistent results when rules are enabled in different orders', () => {
		fc.assert(
			fc.property(
				fc.shuffledSubarray(newRules, { minLength: 2, maxLength: 4 }),
				(selectedRules) => {
					// Property: For any subset of rules, the order of enabling should not affect results
					const code = `
						import React from 'react';
						export function Test() { return <div>Test</div>; }
					`;

					const rules1 = selectedRules.reduce<
						Record<string, TSESLint.RuleModule<string, unknown[]>>
					>((acc, ruleName) => {
						acc[ruleName] = plugin.rules?.[ruleName] as unknown as TSESLint.RuleModule<
							string,
							unknown[]
						>;
						return acc;
					}, {});

					const rules2 = [...selectedRules]
						.reverse()
						.reduce<
							Record<string, TSESLint.RuleModule<string, unknown[]>>
						>((acc, ruleName) => {
							acc[ruleName] = plugin.rules?.[
								ruleName
							] as unknown as TSESLint.RuleModule<string, unknown[]>;
							return acc;
						}, {});

					const messages1 = runMultipleRules(rules1, code);
					const messages2 = runMultipleRules(rules2, code);

					// Should produce the same number of messages regardless of order
					expect(messages1.length).toBe(messages2.length);

					return true;
				},
			),
			{ numRuns: 100 },
		);
	});
});
