import * as fs from 'node:fs';
import * as path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Property Test: Rule-to-test correspondence
 * Feature: eslint-package-enhancement, Property 2: Rule-to-test correspondence
 *
 * For any custom ESLint rule file in the rules directory, there should exist
 * at least one corresponding test file with a matching name pattern.
 *
 * Validates: Requirements 1.3
 */
describe('Property: Rule-to-test correspondence', () => {
	it('should have at least one test file for each rule file', () => {
		const rulesDir = path.join(__dirname, 'rules');
		const categories = fs
			.readdirSync(rulesDir, { withFileTypes: true })
			.filter((dirent) => dirent.isDirectory())
			.map((dirent) => dirent.name);

		const missingTests: string[] = [];

		for (const category of categories) {
			const categoryPath = path.join(rulesDir, category);
			const files = fs.readdirSync(categoryPath);

			// Find all rule files (files that define rules, typically named eslint-plugin-*-rules.ts)
			const ruleFiles = files.filter(
				(file) =>
					file.endsWith('-rules.ts') &&
					!file.endsWith('.test.ts') &&
					!file.endsWith('.property.test.ts'),
			);

			for (const ruleFile of ruleFiles) {
				const baseName = ruleFile.replace('.ts', '');

				// Check for corresponding test files
				const hasUnitTest = files.some(
					(file) => file === `${baseName}.test.ts` || file.includes('.test.ts'),
				);
				const hasPropertyTest = files.some((file) => file.includes('.property.test.ts'));

				// At least one test file should exist
				if (!hasUnitTest && !hasPropertyTest) {
					missingTests.push(`${category}/${ruleFile}`);
				}
			}
		}

		// Property: For all rule files, there should be at least one test file
		expect(missingTests).toEqual([]);
	});

	it('should have test files that match rule names', () => {
		const rulesDir = path.join(__dirname, 'rules');
		const categories = fs
			.readdirSync(rulesDir, { withFileTypes: true })
			.filter((dirent) => dirent.isDirectory())
			.map((dirent) => dirent.name);

		const testCoverage: Record<string, { hasUnit: boolean; hasProperty: boolean }> = {};

		for (const category of categories) {
			const categoryPath = path.join(rulesDir, category);
			const files = fs.readdirSync(categoryPath);

			// Find all rule files
			const ruleFiles = files.filter(
				(file) =>
					file.endsWith('-rules.ts') &&
					!file.endsWith('.test.ts') &&
					!file.endsWith('.property.test.ts'),
			);

			for (const ruleFile of ruleFiles) {
				const ruleKey = `${category}/${ruleFile}`;

				// Check for test files
				const hasUnitTest = files.some((file) => file.includes('.test.ts'));
				const hasPropertyTest = files.some((file) => file.includes('.property.test.ts'));

				testCoverage[ruleKey] = {
					hasUnit: hasUnitTest,
					hasProperty: hasPropertyTest,
				};
			}
		}

		// Property: All rules should have at least unit tests
		const rulesWithoutTests = Object.entries(testCoverage)
			.filter(([_, coverage]) => !coverage.hasUnit)
			.map(([rule]) => rule);

		expect(rulesWithoutTests).toEqual([]);
	});

	it('should verify test file naming conventions', () => {
		const rulesDir = path.join(__dirname, 'rules');
		const categories = fs
			.readdirSync(rulesDir, { withFileTypes: true })
			.filter((dirent) => dirent.isDirectory())
			.map((dirent) => dirent.name);

		const invalidTestFiles: string[] = [];

		for (const category of categories) {
			const categoryPath = path.join(rulesDir, category);
			const files = fs.readdirSync(categoryPath);

			// Find all test files
			const testFiles = files.filter(
				(file) => file.endsWith('.test.ts') || file.endsWith('.property.test.ts'),
			);

			for (const testFile of testFiles) {
				// Test files should follow naming convention:
				// - *.test.ts for unit tests
				// - *.property.test.ts for property tests
				const isValidNaming =
					testFile.endsWith('.test.ts') || testFile.endsWith('.property.test.ts');

				if (!isValidNaming) {
					invalidTestFiles.push(`${category}/${testFile}`);
				}
			}
		}

		// Property: All test files should follow naming conventions
		expect(invalidTestFiles).toEqual([]);
	});
});
