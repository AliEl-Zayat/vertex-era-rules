import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import { reactNodePropNaming } from '../../../rules/jsx/jsx-rules.js';

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

ruleTester.run('react-node-prop-naming', reactNodePropNaming, {
	valid: [
		// PascalCase prop with ReactNode type
		{
			code: `
				const TestComponent = ({ TestProp }: { TestProp: React.ReactNode }) => {
					return <div>{TestProp}</div>;
				};
			`,
		},
		// PascalCase prop with JSX.Element type
		{
			code: `
				const TestComponent = ({ IconElement }: { IconElement: JSX.Element }) => {
					return <div>{IconElement}</div>;
				};
			`,
		},
		// PascalCase prop receiving JSX element value
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
		// Non-ReactNode props (should not trigger)
		{
			code: `
				const TestComponent = ({ title, count }: { title: string; count: number }) => {
					return <div>{title} - {count}</div>;
				};
			`,
		},
	],
	invalid: [
		// camelCase prop with ReactNode type
		{
			code: `
				const TestComponent = ({ testProp }: { testProp: React.ReactNode }) => {
					return <div>{testProp}</div>;
				};
			`,
			errors: [{ messageId: 'reactNodePropNaming' }],
		},
		// camelCase prop with JSX.Element type
		{
			code: `
				const TestComponent = ({ iconElement }: { iconElement: JSX.Element }) => {
					return <div>{iconElement}</div>;
				};
			`,
			errors: [{ messageId: 'reactNodePropNaming' }],
		},
		// camelCase prop receiving JSX element value
		{
			code: `
				const TestComponent = ({ testProp }: any) => {
					return <div>{testProp}</div>;
				};

				const Test = () => {
					return <TestComponent testProp={<Icon className="w-4 h-4" />} />;
				};
			`,
			errors: [{ messageId: 'reactNodePropNaming' }],
		},
		// Multiple camelCase props with JSX element values
		{
			code: `
				const TestComponent = ({ header, footer }: any) => {
					return <div>{header}{footer}</div>;
				};

				const Test = () => {
					return (
						<TestComponent 
							header={<Header />} 
							footer={<Footer />} 
						/>
					);
				};
			`,
			errors: [{ messageId: 'reactNodePropNaming' }, { messageId: 'reactNodePropNaming' }],
		},
	],
});
