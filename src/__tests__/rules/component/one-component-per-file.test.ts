import { RuleTester } from "@typescript-eslint/rule-tester";
import { afterAll, describe, it } from "vitest";
import { oneComponentPerFile } from "../../../rules/component/one-component-per-file.js";

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
});

ruleTester.run("one-component-per-file", oneComponentPerFile, {
  valid: [
    // Single function component
    {
      code: `
				function MyComponent() {
					return <div>Hello</div>;
				}
			`,
    },
    // Single arrow function component
    {
      code: `
				const MyComponent = () => {
					return <div>Hello</div>;
				};
			`,
    },
    // Single component with expression body
    {
      code: `
				const MyComponent = () => <div>Hello</div>;
			`,
    },
    // Compound component pattern
    {
      code: `
				function Main() {
					return <div>Main</div>;
				}
				function Sub() {
					return <span>Sub</span>;
				}
				Main.Sub = Sub;
			`,
    },
    // Non-component functions
    {
      code: `
				function MyComponent() {
					return <div>Hello</div>;
				}
				function helperFunction() {
					return 42;
				}
			`,
    },
  ],
  invalid: [
    // Multiple components - function declarations
    {
      code: `
				function ComponentA() {
					return <div>A</div>;
				}
				function ComponentB() {
					return <div>B</div>;
				}
			`,
      errors: [{ messageId: "multipleComponents" }],
    },
    // Multiple components - mixed declarations
    {
      code: `
				function ComponentA() {
					return <div>A</div>;
				}
				const ComponentB = () => <div>B</div>;
			`,
      errors: [{ messageId: "multipleComponents" }],
    },
    // Multiple arrow function components
    {
      code: `
				const ComponentA = () => <div>A</div>;
				const ComponentB = () => <div>B</div>;
			`,
      errors: [{ messageId: "multipleComponents" }],
    },
  ],
});




