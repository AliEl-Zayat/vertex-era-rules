import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import plugin from '../src/plugin.js';

import { runRule } from './test-utils.js';

/**
 * Feature: comprehensive-rule-verification, Property 27: Rule isolation in tests
 * For any rule being tested using the runRule utility, only that specific rule should be enabled
 * in the test configuration.
 * Validates: Requirements 6.3
 */
describe('Property 27: Rule isolation in tests', () => {
	// Get all custom plugin rules
	const allRuleNames = Object.keys(plugin.rules);

	// Generator for code that could trigger multiple rules
	const codeWithMultipleViolations = fc.constantFrom(
		// Code with console, unused var, and any type
		`const unused: any = 'value';\nconsole.log('test');`,
		// Code with inline object and inline function in JSX
		`const C = () => <Button style={{ color: 'red' }} onClick={() => {}} />;`,
		// Code with boolean naming and SVG issues
		`const enabled: boolean = true;\nconst Icon = () => <svg><path fill="red" /></svg>;`,
		// Code with multiple component exports and empty catch
		`export const A = () => <div />;\nexport const B = () => <div />;\ntry {} catch (e) {}`,
		// Code with nested ternary and form config
		`const v = a ? (b ? 1 : 2) : 3;\nconst f = useForm({ mode: 'onBlur' });`,
	);

	it('should only report violations from the specified rule', () => {
		fc.assert(
			fc.property(
				fc.constantFrom(...allRuleNames),
				codeWithMultipleViolations,
				(ruleName, code) => {
					const rule = plugin.rules[ruleName];
					const messages = runRule(rule, code);

					// All messages should be from the test rule (test/test-rule)
					// This verifies that runRule only enables the specified rule
					const allMessagesFromTestRule = messages.every(
						(m) => m.ruleId === 'test/test-rule',
					);

					return allMessagesFromTestRule;
				},
			),
			{ numRuns: 100 },
		);
	});

	it('should not trigger other rules when testing a specific rule', () => {
		fc.assert(
			fc.property(
				fc.constantFrom(...allRuleNames),
				(ruleName) => {
					const rule = plugin.rules[ruleName];

					// Code that violates multiple rules
					const code = `
const unused: any = 'value';
console.log('test');
const enabled: boolean = true;
const Component = () => (
  <Button 
    style={{ color: 'red' }}
    onClick={() => console.log('clicked')}
  />
);
`;

					const messages = runRule(rule, code);

					// If there are messages, they should all be from the test rule
					if (messages.length > 0) {
						return messages.every((m) => m.ruleId === 'test/test-rule');
					}

					// No messages is also valid (rule doesn't apply to this code)
					return true;
				},
			),
			{ numRuns: 100 },
		);
	});

	it('should isolate boolean naming rule from other rules', () => {
		fc.assert(
			fc.property(
				fc.string({ minLength: 1, maxLength: 20 }).filter((s) => /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(s)),
				(varName) => {
					const rule = plugin.rules['boolean-naming-convention'];

					// Code with boolean naming issue AND console statement
					const code = `
const ${varName}: boolean = true;
console.log('test');
`;

					const messages = runRule(rule, code);

					// Should not report console violations
					const hasConsoleViolation = messages.some((m) =>
						m.message.toLowerCase().includes('console'),
					);

					return !hasConsoleViolation;
				},
			),
			{ numRuns: 100 },
		);
	});

	it('should isolate inline object rule from inline function rule', () => {
		fc.assert(
			fc.property(
				fc.record({
					objectProp: fc.string({ minLength: 1, maxLength: 10 }),
					objectValue: fc.string({ minLength: 1, maxLength: 10 }),
				}),
				({ objectProp, objectValue }) => {
					const rule = plugin.rules['no-inline-objects'];

					// Code with BOTH inline object and inline function
					const code = `
const Component = () => (
  <Button 
    style={{ ${objectProp}: '${objectValue}' }}
    onClick={() => console.log('clicked')}
  />
);
`;

					const messages = runRule(rule, code);

					// Should not report inline function violations
					const hasInlineFunctionViolation = messages.some((m) =>
						m.message.toLowerCase().includes('inline function'),
					);

					return !hasInlineFunctionViolation;
				},
			),
			{ numRuns: 100 },
		);
	});

	it('should isolate SVG currentColor rule from other icon rules', () => {
		fc.assert(
			fc.property(
				fc.constantFrom('red', 'blue', 'green', '#000', '#fff', 'rgb(0,0,0)'),
				(color) => {
					const rule = plugin.rules['svg-currentcolor'];

					// Code with currentColor issue AND multiple SVGs AND no memoization
					const code = `
const Icon1 = () => <svg><path fill="${color}" /></svg>;
const Icon2 = () => <svg><path stroke="${color}" /></svg>;
export default Icon1;
export { Icon2 };
`;

					const messages = runRule(rule, code);

					// Should only report currentColor violations, not:
					// - multiple SVG elements
					// - multiple component exports
					// - missing memoization
					const hasOtherIconRuleViolations = messages.some(
						(m) =>
							m.message.toLowerCase().includes('multiple svg') ||
							m.message.toLowerCase().includes('one component') ||
							m.message.toLowerCase().includes('memo'),
					);

					return !hasOtherIconRuleViolations;
				},
			),
			{ numRuns: 100 },
		);
	});

	it('should verify runRule creates isolated configuration', () => {
		fc.assert(
			fc.property(
				fc.constantFrom(...allRuleNames),
				(ruleName) => {
					const rule = plugin.rules[ruleName];

					// Simple code that might trigger the rule
					const code = `const test = 'value';`;

					const messages = runRule(rule, code);

					// All messages must have ruleId 'test/test-rule'
					// This proves runRule creates an isolated config with only one rule
					return messages.every((m) => m.ruleId === 'test/test-rule');
				},
			),
			{ numRuns: 100 },
		);
	});
});
