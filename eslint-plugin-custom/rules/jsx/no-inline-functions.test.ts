import { describe, expect, it } from 'vitest';

import { runRule } from '../../test-utils';

import jsxRules from './eslint-plugin-jsx-rules';

describe('no-inline-functions', () => {
	const rule = jsxRules['no-inline-functions'];

	it('should report error for inline arrow function', () => {
		const code = `
			const Component = () => (
				<button onClick={() => console.log('clicked')} />
			);
		`;
		const messages = runRule(rule, code);
		expect(messages.length).toBeGreaterThan(0);
		expect(messages[0].message).toContain("Avoid inline function in prop 'onClick'");
		expect(messages[0].message).toContain('useCallback');
	});

	it('should report error for inline function expression', () => {
		const code = `
			const Component = () => (
				<button onClick={function() { console.log('clicked'); }} />
			);
		`;
		const messages = runRule(rule, code);
		expect(messages.length).toBeGreaterThan(0);
		expect(messages[0].message).toContain("Avoid inline function in prop 'onClick'");
	});

	it('should not report error for function reference', () => {
		const code = `
			const Component = () => {
				const handleClick = () => console.log('clicked');
				return <button onClick={handleClick} />;
			};
		`;
		const messages = runRule(rule, code);
		expect(messages.length).toBe(0);
	});

	it('should not report error for function call', () => {
		const code = `
			const Component = () => (
				<button onClick={getHandler()} />
			);
		`;
		const messages = runRule(rule, code);
		expect(messages.length).toBe(0);
	});

	it('should report error for multiple inline functions', () => {
		const code = `
			const Component = () => (
				<button 
					onClick={() => console.log('click')} 
					onHover={() => console.log('hover')}
				/>
			);
		`;
		const messages = runRule(rule, code);
		expect(messages.length).toBe(2);
	});

	it('should handle inline arrow functions with parameters', () => {
		const code = `
			const Component = () => (
				<button onClick={(e) => e.preventDefault()} />
			);
		`;
		const messages = runRule(rule, code);
		expect(messages.length).toBeGreaterThan(0);
		expect(messages[0].message).toContain("Avoid inline function in prop 'onClick'");
	});

	it('should not report error for string literals', () => {
		const code = `
			const Component = () => (
				<button type="submit" />
			);
		`;
		const messages = runRule(rule, code);
		expect(messages.length).toBe(0);
	});

	it('should handle custom event handlers', () => {
		const code = `
			const Component = () => (
				<CustomComponent onCustomEvent={() => doSomething()} />
			);
		`;
		const messages = runRule(rule, code);
		expect(messages.length).toBeGreaterThan(0);
		expect(messages[0].message).toContain("Avoid inline function in prop 'onCustomEvent'");
	});
});
