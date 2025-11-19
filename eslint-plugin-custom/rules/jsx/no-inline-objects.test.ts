import { describe, expect, it } from 'vitest';

import { runRule } from '../../test-utils';

import jsxRules from './eslint-plugin-jsx-rules';

describe('no-inline-objects', () => {
	const rule = jsxRules['no-inline-objects'];

	it('should report error for inline object in style prop', () => {
		const code = `
			const Component = () => (
				<div style={{ color: 'red' }} />
			);
		`;
		const messages = runRule(rule, code);
		expect(messages.length).toBeGreaterThan(0);
		expect(messages[0].message).toContain("Avoid inline object in prop 'style'");
	});

	it('should report error for inline object in any prop', () => {
		const code = `
			const Component = () => (
				<Button config={{ enabled: true }} />
			);
		`;
		const messages = runRule(rule, code);
		expect(messages.length).toBeGreaterThan(0);
		expect(messages[0].message).toContain("Avoid inline object in prop 'config'");
	});

	it('should not report error for variable reference', () => {
		const code = `
			const Component = () => {
				const style = { color: 'red' };
				return <div style={style} />;
			};
		`;
		const messages = runRule(rule, code);
		expect(messages.length).toBe(0);
	});

	it('should not report error for function call returning object', () => {
		const code = `
			const Component = () => (
				<div style={getStyle()} />
			);
		`;
		const messages = runRule(rule, code);
		expect(messages.length).toBe(0);
	});

	it('should report error for multiple inline objects', () => {
		const code = `
			const Component = () => (
				<div style={{ color: 'red' }} data={{ id: 1 }} />
			);
		`;
		const messages = runRule(rule, code);
		expect(messages.length).toBe(2);
	});

	it('should handle empty objects', () => {
		const code = `
			const Component = () => (
				<div style={{}} />
			);
		`;
		const messages = runRule(rule, code);
		expect(messages.length).toBeGreaterThan(0);
		expect(messages[0].message).toContain("Avoid inline object in prop 'style'");
	});

	it('should not report error for string literals', () => {
		const code = `
			const Component = () => (
				<div className="test" />
			);
		`;
		const messages = runRule(rule, code);
		expect(messages.length).toBe(0);
	});

	it('should not report error for boolean literals', () => {
		const code = `
			const Component = () => (
				<Button disabled={true} />
			);
		`;
		const messages = runRule(rule, code);
		expect(messages.length).toBe(0);
	});
});
