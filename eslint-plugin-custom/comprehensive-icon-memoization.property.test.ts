import fc from 'fast-check';
import { describe, it } from 'vitest';

import plugin from '../src/plugin.js';
import { runRule } from './test-utils.js';

/**
 * Feature: comprehensive-rule-verification, Property 12: Icon memoization enforcement
 * For any icon component export, if the export is not wrapped with memoization,
 * the memoized-export rule should detect a violation.
 * Validates: Requirements 2.4
 */
describe('Property 12: Icon memoization enforcement', () => {
	const rule = plugin.rules['memoized-export'];

	// Generator for component names (PascalCase)
	const componentNameGen = fc
		.string({ minLength: 1, maxLength: 15 })
		.map((s) => {
			const cleaned = s.replace(/[^a-zA-Z0-9]/g, '');
			if (cleaned.length === 0) return 'Icon';
			const firstChar = cleaned.charAt(0);
			if (/[0-9]/.test(firstChar)) {
				return 'I' + cleaned;
			}
			return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
		})
		.filter((name) => name.length > 0 && /^[A-Z]/.test(name));

	it('should detect any unmemoized icon component export', () => {
		fc.assert(
			fc.property(componentNameGen, (componentName) => {
				// Build code with unmemoized export
				const code = `
const ${componentName} = () => <svg><path /></svg>;
export default ${componentName};
`;

				// Run the rule
				const messages = runRule(rule, code);

				// Should report an error
				return messages.length > 0 && messages[0].message.includes('memo');
			}),
			{ numRuns: 100 },
		);
	});

	it('should allow any memoized icon component export', () => {
		fc.assert(
			fc.property(componentNameGen, (componentName) => {
				// Build code with memoized export
				const code = `
import { memo } from 'react';
const ${componentName} = () => <svg><path /></svg>;
export default memo(${componentName});
`;

				// Run the rule
				const messages = runRule(rule, code);

				// Should NOT report an error
				return messages.length === 0;
			}),
			{ numRuns: 100 },
		);
	});

	it('should detect unmemoized function declaration exports', () => {
		fc.assert(
			fc.property(componentNameGen, (componentName) => {
				// Build code with unmemoized function declaration export
				const code = `
export default function ${componentName}() {
	return <svg><path /></svg>;
}
`;

				// Run the rule
				const messages = runRule(rule, code);

				// Should report an error
				return messages.length > 0 && messages[0].message.includes('memo');
			}),
			{ numRuns: 100 },
		);
	});

	it('should allow memoized function declaration exports', () => {
		fc.assert(
			fc.property(componentNameGen, (componentName) => {
				// Build code with memoized function declaration export
				const code = `
import { memo } from 'react';
function ${componentName}() {
	return <svg><path /></svg>;
}
export default memo(${componentName});
`;

				// Run the rule
				const messages = runRule(rule, code);

				// Should NOT report an error
				return messages.length === 0;
			}),
			{ numRuns: 100 },
		);
	});
});
