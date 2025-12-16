import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import { jsxElementComponentMismatch } from '../../../rules/jsx/jsx-rules.js';

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

ruleTester.run('jsx-element-component-mismatch', jsxElementComponentMismatch, {
	valid: [
		// JSX element passed and used as value
		{
			code: `
				const TestComponent = ({ TestProp }: any) => {
					return <div>{TestProp}</div>;
				};

				const Test = () => {
					return <TestComponent TestProp={<Icon className="w-4 h-4" />} />;
				};
			`,
		},
		// Component reference passed and used as component
		{
			code: `
				const TestComponent = ({ TestProp }: any) => {
					return <div><TestProp /></div>;
				};

				const Test = () => {
					return <TestComponent TestProp={Icon} />;
				};
			`,
		},
		// Multiple correct usages
		{
			code: `
				const TestComponent = ({ IconProp, ComponentProp, TextProp }: any) => {
					return (
						<div>
							{IconProp}
							<ComponentProp />
							{TextProp}
						</div>
					);
				};

				const Test = () => {
					return (
						<TestComponent 
							IconProp={<Icon />} 
							ComponentProp={Button}
							TextProp="Hello"
						/>
					);
				};
			`,
		},
	],
	invalid: [
		// JSX element passed but used as component
		{
			code: `
				const TestComponent = ({ TestProp }: any) => {
					return <div><TestProp /></div>;
				};

				const Test = () => {
					return <TestComponent TestProp={<Icon className="w-4 h-4" />} />;
				};
			`,
			errors: [{ messageId: 'jsxElementUsedAsComponent' }],
		},
		// Component reference passed but used as value
		{
			code: `
				const TestComponent = ({ TestProp }: any) => {
					return <div>{TestProp}</div>;
				};

				const Test = () => {
					return <TestComponent TestProp={Icon} />;
				};
			`,
			errors: [{ messageId: 'componentUsedAsValue' }],
		},
		// Multiple prop mismatches
		{
			code: `
				const TestComponent = ({ IconProp, ComponentProp }: any) => {
					return (
						<div>
							<IconProp />
							{ComponentProp}
						</div>
					);
				};

				const Test = () => {
					return (
						<TestComponent 
							IconProp={<Icon />} 
							ComponentProp={Button} 
						/>
					);
				};
			`,
			errors: [{ messageId: 'jsxElementUsedAsComponent' }, { messageId: 'componentUsedAsValue' }],
		},
	],
});
