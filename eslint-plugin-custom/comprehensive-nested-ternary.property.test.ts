import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import plugin from '../src/plugin.js';

import { runRule } from './test-utils.js';

// JavaScript reserved words that cannot be used as variable names
const RESERVED_WORDS = new Set([
	'break',
	'case',
	'catch',
	'class',
	'const',
	'continue',
	'debugger',
	'default',
	'delete',
	'do',
	'else',
	'export',
	'extends',
	'finally',
	'for',
	'function',
	'if',
	'import',
	'in',
	'instanceof',
	'let',
	'new',
	'return',
	'super',
	'switch',
	'this',
	'throw',
	'try',
	'typeof',
	'var',
	'void',
	'while',
	'with',
	'yield',
	'enum',
	'await',
	'implements',
	'interface',
	'package',
	'private',
	'protected',
	'public',
	'static',
]);

// Helper to create a variable name generator that avoids reserved words
const createVarNameGen = () =>
	fc
		.string({ minLength: 1, maxLength: 10 })
		.map((s) => {
			const cleaned = s.replace(/[^a-zA-Z0-9]/g, '');
			if (cleaned.length === 0) return 'x';
			return cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
		})
		.filter((name) => name.length > 0 && /^[a-z]/.test(name) && !RESERVED_WORDS.has(name));

/**
 * Feature: comprehensive-rule-verification, Property 18: Nested ternary detection
 * For any ternary expression containing another ternary expression,
 * the no-nested-ternary rule should detect a violation.
 * Validates: Requirements 2.10
 */
describe('Property 18: Nested ternary detection', () => {
	const rule = plugin.rules?.['no-nested-ternary'] as any;

	// Generator for variable names
	const varNameGen = createVarNameGen();

	// Generator for simple values
	const valueGen = fc.oneof(
		fc.integer({ min: 0, max: 100 }).map((n) => n.toString()),
		fc.constantFrom('true', 'false'),
		fc.constantFrom('"a"', '"b"', '"c"', '"x"', '"y"', '"z"'),
	);

	// Generator for conditions
	const conditionGen = fc.oneof(
		varNameGen.map((v) => v),
		varNameGen.map((v) => `${v} > 0`),
		varNameGen.map((v) => `${v} === true`),
		fc.constant('true'),
		fc.constant('false'),
	);

	// Generator for ternary structure (nested or not)
	const ternaryGen = fc.oneof(
		// Simple ternary (not nested)
		fc.tuple(conditionGen, valueGen, valueGen).map(([cond, val1, val2]) => ({
			code: `${cond} ? ${val1} : ${val2}`,
			isNested: false,
		})),
		// Nested in consequent
		fc.tuple(conditionGen, conditionGen, valueGen, valueGen, valueGen).map(
			([cond1, cond2, val1, val2, val3]) =>
				({
					code: `${cond1} ? (${cond2} ? ${val1} : ${val2}) : ${val3}`,
					isNested: true,
				}) as const,
		),
		// Nested in alternate
		fc.tuple(conditionGen, valueGen, conditionGen, valueGen, valueGen).map(
			([cond1, val1, cond2, val2, val3]) =>
				({
					code: `${cond1} ? ${val1} : (${cond2} ? ${val2} : ${val3})`,
					isNested: true,
				}) as const,
		),
		// Nested in both
		fc
			.tuple(conditionGen, conditionGen, valueGen, valueGen, conditionGen, valueGen, valueGen)
			.map(
				([cond1, cond2, val1, val2, cond3, val3, val4]) =>
					({
						code: `${cond1} ? (${cond2} ? ${val1} : ${val2}) : (${cond3} ? ${val3} : ${val4})`,
						isNested: true,
					}) as const,
			),
	);

	it('should detect any nested ternary expression', () => {
		fc.assert(
			fc.property(varNameGen, ternaryGen, (varName, ternary) => {
				const code = `const ${varName} = ${ternary.code};`;

				// Run the rule
				const messages = runRule(rule, code);

				// Should report error if and only if ternary is nested
				if (ternary.isNested) {
					expect(messages.length).toBeGreaterThan(0);
					expect(messages[0].message).toContain('Nested ternary operators');
				} else {
					expect(messages.length).toBe(0);
				}

				return true;
			}),
			{ numRuns: 100 },
		);
	});

	it('should allow simple non-nested ternary expressions', () => {
		fc.assert(
			fc.property(
				varNameGen,
				conditionGen,
				valueGen,
				valueGen,
				(varName, cond, val1, val2) => {
					const code = `const ${varName} = ${cond} ? ${val1} : ${val2};`;

					// Run the rule
					const messages = runRule(rule, code);

					// Should NOT report any errors for simple ternaries
					expect(messages.length).toBe(0);

					return true;
				},
			),
			{ numRuns: 100 },
		);
	});

	it('should detect nested ternary in JSX', () => {
		fc.assert(
			fc.property(conditionGen, conditionGen, (cond1, cond2) => {
				const code = `
					const Component = () => (
						<div>
							{${cond1} ? (${cond2} ? <A /> : <B />) : <C />}
						</div>
					);
				`;

				// Run the rule
				const messages = runRule(rule, code);

				// Should report error for nested ternary in JSX
				expect(messages.length).toBeGreaterThan(0);
				expect(messages[0].message).toContain('Nested ternary operators');

				return true;
			}),
			{ numRuns: 100 },
		);
	});

	it('should allow multiple independent ternaries', () => {
		// Generator for number of independent ternaries (2-4)
		const countGen = fc.integer({ min: 2, max: 4 });

		fc.assert(
			fc.property(countGen, (count) => {
				// Generate multiple independent ternaries
				const ternaries: string[] = [];
				for (let i = 0; i < count; i++) {
					const varName = `var${i}`;
					const cond = i % 2 === 0 ? 'true' : 'false';
					const val1 = i.toString();
					const val2 = (i + 1).toString();
					ternaries.push(`const ${varName} = ${cond} ? ${val1} : ${val2};`);
				}

				const code = ternaries.join('\n');

				// Run the rule
				const messages = runRule(rule, code);

				// Should NOT report any errors for independent ternaries
				expect(messages.length).toBe(0);

				return true;
			}),
			{ numRuns: 100 },
		);
	});

	it('should detect deeply nested ternaries', () => {
		fc.assert(
			fc.property(
				varNameGen,
				conditionGen,
				conditionGen,
				conditionGen,
				valueGen,
				valueGen,
				(varName, cond1, cond2, cond3, val1, val2) => {
					// Create a deeply nested ternary (3 levels)
					const code = `const ${varName} = ${cond1} ? (${cond2} ? ${val1} : ${val2}) : (${cond3} ? ${val1} : ${val2});`;

					// Run the rule
					const messages = runRule(rule, code);

					// Should report error for deeply nested ternary
					expect(messages.length).toBeGreaterThan(0);
					expect(messages[0].message).toContain('Nested ternary operators');

					return true;
				},
			),
			{ numRuns: 100 },
		);
	});
});
