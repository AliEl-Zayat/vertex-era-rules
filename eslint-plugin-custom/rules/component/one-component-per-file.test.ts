import { describe, expect, it } from 'vitest';

import { runRule } from '../../test-utils';

import componentRules from './eslint-plugin-component-rules';

describe('Unit Tests: one-component-per-file', () => {
	it('should not report error for single function component', () => {
		const code = `
      import React from 'react';
      
      function MyComponent() {
        return <div>Hello</div>;
      }
      
      export default MyComponent;
    `;

		const messages = runRule(componentRules['one-component-per-file'], code);
		expect(messages.length).toBe(0);
	});

	it('should report error for multiple function components', () => {
		const code = `
      import React from 'react';
      
      function ComponentOne() {
        return <div>One</div>;
      }
      
      function ComponentTwo() {
        return <div>Two</div>;
      }
      
      export default ComponentOne;
    `;

		const messages = runRule(componentRules['one-component-per-file'], code);
		expect(messages.length).toBe(1);
		expect(messages[0].message).toContain('component definitions');
		expect(messages[0].message).toContain('ComponentOne');
		expect(messages[0].message).toContain('ComponentTwo');
	});

	it('should not report error for compound component pattern', () => {
		const code = `
      import React from 'react';
      
      function Card() {
        return <div>Card</div>;
      }
      
      function CardHeader() {
        return <div>Header</div>;
      }
      
      Card.Header = CardHeader;
      
      export default Card;
    `;

		const messages = runRule(componentRules['one-component-per-file'], code);
		expect(messages.length).toBe(0);
	});

	it('should not report error for component with helper functions', () => {
		const code = `
      import React from 'react';
      
      function formatName(name: string) {
        return name.toUpperCase();
      }
      
      function MyComponent({ name }: { name: string }) {
        return <div>{formatName(name)}</div>;
      }
      
      export default MyComponent;
    `;

		const messages = runRule(componentRules['one-component-per-file'], code);
		expect(messages.length).toBe(0);
	});

	it('should detect arrow function components', () => {
		const code = `
      import React from 'react';
      
      const ComponentOne = () => <div>One</div>;
      const ComponentTwo = () => <div>Two</div>;
      
      export default ComponentOne;
    `;

		const messages = runRule(componentRules['one-component-per-file'], code);
		expect(messages.length).toBe(1);
		expect(messages[0].message).toContain('component definitions');
	});

	it('should detect class components', () => {
		const code = `
      import React from 'react';
      
      class ComponentOne extends React.Component {
        render() {
          return <div>One</div>;
        }
      }
      
      class ComponentTwo extends React.Component {
        render() {
          return <div>Two</div>;
        }
      }
      
      export default ComponentOne;
    `;

		const messages = runRule(componentRules['one-component-per-file'], code);
		expect(messages.length).toBe(1);
		expect(messages[0].message).toContain('component definitions');
	});

	it('should handle mixed component types', () => {
		const code = `
      import React from 'react';
      
      function FunctionComponent() {
        return <div>Function</div>;
      }
      
      const ArrowComponent = () => <div>Arrow</div>;
      
      export default FunctionComponent;
    `;

		const messages = runRule(componentRules['one-component-per-file'], code);
		expect(messages.length).toBe(1);
		expect(messages[0].message).toContain('component definitions');
	});

	it('should not report error for non-component functions', () => {
		const code = `
      import React from 'react';
      
      function utilityFunction() {
        return 'not jsx';
      }
      
      function MyComponent() {
        return <div>{utilityFunction()}</div>;
      }
      
      export default MyComponent;
    `;

		const messages = runRule(componentRules['one-component-per-file'], code);
		expect(messages.length).toBe(0);
	});

	it('should handle component with JSX fragment', () => {
		const code = `
      import React from 'react';
      
      function MyComponent() {
        return <>Hello</>;
      }
      
      export default MyComponent;
    `;

		const messages = runRule(componentRules['one-component-per-file'], code);
		expect(messages.length).toBe(0);
	});

	it('should detect multiple components even with compound pattern', () => {
		const code = `
      import React from 'react';
      
      function Card() {
        return <div>Card</div>;
      }
      
      function CardHeader() {
        return <div>Header</div>;
      }
      
      function AnotherComponent() {
        return <div>Another</div>;
      }
      
      Card.Header = CardHeader;
      
      export default Card;
    `;

		const messages = runRule(componentRules['one-component-per-file'], code);
		expect(messages.length).toBe(1);
		expect(messages[0].message).toContain('component definitions');
		expect(messages[0].message).toContain('Card');
		expect(messages[0].message).toContain('AnotherComponent');
	});
});
