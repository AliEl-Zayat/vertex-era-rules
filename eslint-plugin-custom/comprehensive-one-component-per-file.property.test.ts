import fc from 'fast-check';
import { describe, it } from 'vitest';

import plugin from '../src/plugin.js';
import { runRule } from './test-utils.js';

/**
 * Feature: comprehensive-rule-verification, Property 14: One component per file enforcement
 * For any file containing multiple React component exports, the one-component-per-file rule
 * should detect a violation.
 * Validates: Requirements 2.6
 */
describe('Property 14: One component per file enforcement', () => {
	const rule = plugin.rules['one-component-per-file'];

	// Generator for component names (PascalCase)
	const componentNameGen = fc
		.string({ minLength: 1, maxLength: 15 })
		.map((s) => {
			const cleaned = s.replace(/[^a-zA-Z0-9]/g, '');
			if (cleaned.length === 0) return 'Component';
			const firstChar = cleaned.charAt(0);
			if (/[0-9]/.test(firstChar)) {
				return 'C' + cleaned;
			}
			return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
		})
		.filter((name) => name.length > 0 && /^[A-Z]/.test(name));

	it('should detect any file with multiple component definitions', () => {
		fc.assert(
			fc.property(
				fc
					.array(componentNameGen, { minLength: 2, maxLength: 4 })
					.map((names) => [...new Set(names)])
					.filter((names) => names.length >= 2),
				(componentNames) => {
					// Build code with multiple components
					const components = componentNames.map((name) => {
						return `function ${name}() { return <div>${name}</div>; }`;
					});

					const code = `
import React from 'react';
${components.join('\n')}
export default ${componentNames[0]};
`;

					// Run the rule
					const messages = runRule(rule, code);

					// Should report an error
					return messages.length > 0 && messages[0].message.includes('component definitions');
				},
			),
			{ numRuns: 100 },
		);
	});

	it('should allow any file with a single component definition', () => {
		fc.assert(
			fc.property(componentNameGen, (componentName) => {
				// Build code with single component
				const code = `
import React from 'react';
function ${componentName}() {
	return <div>${componentName}</div>;
}
export default ${componentName};
`;

				// Run the rule
				const messages = runRule(rule, code);

				// Should NOT report an error
				return messages.length === 0;
			}),
			{ numRuns: 100 },
		);
	});

	it('should detect multiple arrow function components', () => {
		fc.assert(
			fc.property(
				fc
					.array(componentNameGen, { minLength: 2, maxLength: 4 })
					.map((names) => [...new Set(names)])
					.filter((names) => names.length >= 2),
				(componentNames) => {
					// Build code with multiple arrow function components
					const components = componentNames.map((name) => {
						return `const ${name} = () => <div>${name}</div>;`;
					});

					const code = `
import React from 'react';
${components.join('\n')}
export default ${componentNames[0]};
`;

					// Run the rule
					const messages = runRule(rule, code);

					// Should report an error
					return messages.length > 0 && messages[0].message.includes('component definitions');
				},
			),
			{ numRuns: 100 },
		);
	});

	it('should detect multiple class components', () => {
		fc.assert(
			fc.property(
				fc
					.array(componentNameGen, { minLength: 2, maxLength: 3 })
					.map((names) => [...new Set(names)])
					.filter((names) => names.length >= 2),
				(componentNames) => {
					// Build code with multiple class components
					const components = componentNames.map((name) => {
						return `
class ${name} extends React.Component {
	render() {
		return <div>${name}</div>;
	}
}`;
					});

					const code = `
import React from 'react';
${components.join('\n')}
export default ${componentNames[0]};
`;

					// Run the rule
					const messages = runRule(rule, code);

					// Should report an error
					return messages.length > 0 && messages[0].message.includes('component definitions');
				},
			),
			{ numRuns: 100 },
		);
	});

	it('should allow compound component pattern', () => {
		fc.assert(
			fc.property(
				componentNameGen,
				fc
					.array(componentNameGen, { minLength: 1, maxLength: 3 })
					.map((names) => [...new Set(names)])
					.filter((names) => names.length >= 1),
				(parentName, subNames) => {
					// Build code with compound component pattern
					const subComponents = subNames.map((name) => {
						return `function ${name}() { return <div>${name}</div>; }`;
					});

					const assignments = subNames.map((name) => {
						return `${parentName}.${name} = ${name};`;
					});

					const code = `
import React from 'react';
function ${parentName}() {
	return <div>${parentName}</div>;
}
${subComponents.join('\n')}
${assignments.join('\n')}
export default ${parentName};
`;

					// Run the rule
					const messages = runRule(rule, code);

					// Should NOT report an error for compound component pattern
					return messages.length === 0;
				},
			),
			{ numRuns: 100 },
		);
	});

	it('should allow single component with helper functions', () => {
		fc.assert(
			fc.property(
				componentNameGen,
				fc.integer({ min: 1, max: 5 }),
				(componentName, helperCount) => {
					// Build code with helper functions (lowercase names, no JSX)
					const helpers = Array.from({ length: helperCount }, (_, i) => {
						return `function helper${i}(value) { return value.toUpperCase(); }`;
					});

					const code = `
import React from 'react';
${helpers.join('\n')}
function ${componentName}() {
	return <div>${componentName}</div>;
}
export default ${componentName};
`;

					// Run the rule
					const messages = runRule(rule, code);

					// Should NOT report an error for helper functions
					return messages.length === 0;
				},
			),
			{ numRuns: 100 },
		);
	});
});
