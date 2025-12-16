import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import { noInlineObjects, noInlineFunctions } from '../../../rules/jsx/jsx-rules.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module',
		parserOptions: {
			ecmaFeatures: {
				jsx: true,
			},
		},
	},
});

// Test no-inline-objects rule
ruleTester.run('no-inline-objects', noInlineObjects, {
	valid: [
		// Variable reference
		{
			code: `
				const style = { color: 'red' };
				function Component() {
					return <div style={style}>Hello</div>;
				}
			`,
		},
		// String prop
		{
			code: `
				function Component() {
					return <div className="container">Hello</div>;
				}
			`,
		},
		// Number prop
		{
			code: `
				function Component() {
					return <input tabIndex={0} />;
				}
			`,
		},
		// Boolean prop
		{
			code: `
				function Component() {
					return <input disabled={true} />;
				}
			`,
		},
		// Identifier reference
		{
			code: `
				const options = { value: 1 };
				function Component() {
					return <Select options={options} />;
				}
			`,
		},
	],
	invalid: [
		// Inline style object
		{
			code: `
				function Component() {
					return <div style={{ color: 'red' }}>Hello</div>;
				}
			`,
			errors: [{ messageId: 'noInlineObject' }],
		},
		// Inline object prop
		{
			code: `
				function Component() {
					return <Button config={{ size: 'large' }} />;
				}
			`,
			errors: [{ messageId: 'noInlineObject' }],
		},
	],
});

// Test no-inline-functions rule
ruleTester.run('no-inline-functions', noInlineFunctions, {
	valid: [
		// Callback reference
		{
			code: `
				function Component() {
					const handleClick = () => {};
					return <button onClick={handleClick}>Click</button>;
				}
			`,
		},
		// Named function reference
		{
			code: `
				function handleClick() {}
				function Component() {
					return <button onClick={handleClick}>Click</button>;
				}
			`,
		},
		// Non-function prop
		{
			code: `
				function Component() {
					return <div className="container">Hello</div>;
				}
			`,
		},
	],
	invalid: [
		// Inline arrow function
		{
			code: `
				function Component() {
					return <button onClick={() => console.log('clicked')}>Click</button>;
				}
			`,
			errors: [{ messageId: 'noInlineFunction' }],
		},
		// Inline function expression
		{
			code: `
				function Component() {
					return <button onClick={function() { console.log('clicked'); }}>Click</button>;
				}
			`,
			errors: [{ messageId: 'noInlineFunction' }],
		},
		// Inline arrow function with parameters
		{
			code: `
				function Component() {
					return <Input onChange={(e) => setValue(e.target.value)} />;
				}
			`,
			errors: [{ messageId: 'noInlineFunction' }],
		},
	],
});








