import { describe, expect, it } from 'vitest';

import { runRule } from '../../test-utils';

import readabilityRules from './eslint-plugin-readability-rules';

describe('Unit Tests: no-nested-ternary', () => {
	it('should not report error for simple ternary', () => {
		const code = `
      const result = condition ? 'yes' : 'no';
    `;

		const messages = runRule(readabilityRules['no-nested-ternary'], code);
		expect(messages.length).toBe(0);
	});

	it('should report error for nested ternary in consequent', () => {
		const code = `
      const result = condition1 ? (condition2 ? 'a' : 'b') : 'c';
    `;

		const messages = runRule(readabilityRules['no-nested-ternary'], code);
		expect(messages.length).toBe(1);
		expect(messages[0].message).toContain('Nested ternary operators');
	});

	it('should report error for nested ternary in alternate', () => {
		const code = `
      const result = condition1 ? 'a' : (condition2 ? 'b' : 'c');
    `;

		const messages = runRule(readabilityRules['no-nested-ternary'], code);
		expect(messages.length).toBe(1);
		expect(messages[0].message).toContain('Nested ternary operators');
	});

	it('should not report error for multiple independent ternaries', () => {
		const code = `
      const result1 = condition1 ? 'a' : 'b';
      const result2 = condition2 ? 'c' : 'd';
      const result3 = condition3 ? 'e' : 'f';
    `;

		const messages = runRule(readabilityRules['no-nested-ternary'], code);
		expect(messages.length).toBe(0);
	});

	it('should report error for nested ternary in parentheses', () => {
		const code = `
      const result = condition1 ? ((condition2 ? 'a' : 'b')) : 'c';
    `;

		const messages = runRule(readabilityRules['no-nested-ternary'], code);
		expect(messages.length).toBe(1);
		expect(messages[0].message).toContain('Nested ternary operators');
	});

	it('should report error for deeply nested ternaries', () => {
		const code = `
      const result = condition1 ? (condition2 ? 'a' : 'b') : (condition3 ? 'c' : 'd');
    `;

		const messages = runRule(readabilityRules['no-nested-ternary'], code);
		expect(messages.length).toBe(1);
		expect(messages[0].message).toContain('Nested ternary operators');
	});

	it('should not report error for ternary with complex expressions', () => {
		const code = `
      const result = (a + b > 10) ? (x * 2) : (y / 2);
    `;

		const messages = runRule(readabilityRules['no-nested-ternary'], code);
		expect(messages.length).toBe(0);
	});

	it('should report error for nested ternary in JSX', () => {
		const code = `
      const Component = () => (
        <div>
          {condition1 ? (condition2 ? <A /> : <B />) : <C />}
        </div>
      );
    `;

		const messages = runRule(readabilityRules['no-nested-ternary'], code);
		expect(messages.length).toBe(1);
		expect(messages[0].message).toContain('Nested ternary operators');
	});

	it('should not report error for independent ternaries in JSX', () => {
		const code = `
      const Component = () => (
        <div>
          {condition1 ? <A /> : <B />}
          {condition2 ? <C /> : <D />}
        </div>
      );
    `;

		const messages = runRule(readabilityRules['no-nested-ternary'], code);
		expect(messages.length).toBe(0);
	});
});
