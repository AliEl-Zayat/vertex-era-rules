import * as fs from 'node:fs';
import * as path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Property Test: Test case completeness
 * Feature: eslint-package-enhancement, Property 6: Test case completeness
 *
 * For any custom ESLint rule test file, it should contain at least one valid
 * code example and at least one invalid code example.
 *
 * Validates: Requirements 8.2
 */
describe('Property: Test case completeness', () => {
	it('should have both valid and invalid examples in unit tests', () => {
		const rulesDir = path.join(__dirname, 'rules');
		const categories = fs
			.readdirSync(rulesDir, { withFileTypes: true })
			.filter((dirent) => dirent.isDirectory())
			.map((dirent) => dirent.name);

		const incompleteTests: string[] = [];

		for (const category of categories) {
			const categoryPath = path.join(rulesDir, category);
			const files = fs.readdirSync(categoryPath);

			// Find all unit test files (not property tests)
			const unitTestFiles = files.filter(
				(file) => file.endsWith('.test.ts') && !file.endsWith('.property.test.ts'),
			);

			for (const testFile of unitTestFiles) {
				const testFilePath = path.join(categoryPath, testFile);
				const content = fs.readFileSync(testFilePath, 'utf-8');

				// Check for valid examples
				// Look for patterns like: valid: [...], expect(messages.length).toBe(0), etc.
				const hasValidExamples =
					content.includes('valid:') ||
					content.includes('.toBe(0)') ||
					content.includes('should not report') ||
					content.includes('should pass');

				// Check for invalid examples
				// Look for patterns like: invalid: [...], expect(messages.length).toBe(1), etc.
				const hasInvalidExamples =
					content.includes('invalid:') ||
					content.includes('.toBe(1)') ||
					content.includes('.toBeGreaterThan(0)') ||
					content.includes('should report') ||
					content.includes('should fail');

				// Property: Each test file should have both valid and invalid examples
				if (!hasValidExamples || !hasInvalidExamples) {
					incompleteTests.push(
						`${category}/${testFile} (valid: ${hasValidExamples}, invalid: ${hasInvalidExamples})`,
					);
				}
			}
		}

		expect(incompleteTests).toEqual([]);
	});

	it('should verify test files contain actual test cases', () => {
		const rulesDir = path.join(__dirname, 'rules');
		const categories = fs
			.readdirSync(rulesDir, { withFileTypes: true })
			.filter((dirent) => dirent.isDirectory())
			.map((dirent) => dirent.name);

		const emptyTests: string[] = [];

		for (const category of categories) {
			const categoryPath = path.join(rulesDir, category);
			const files = fs.readdirSync(categoryPath);

			// Find all test files
			const testFiles = files.filter(
				(file) => file.endsWith('.test.ts') || file.endsWith('.property.test.ts'),
			);

			for (const testFile of testFiles) {
				const testFilePath = path.join(categoryPath, testFile);
				const content = fs.readFileSync(testFilePath, 'utf-8');

				// Check for test cases
				const hasTestCases =
					content.includes("it('") ||
					content.includes('it("') ||
					content.includes('test(') ||
					content.includes('describe(');

				// Property: Each test file should contain actual test cases
				if (!hasTestCases) {
					emptyTests.push(`${category}/${testFile}`);
				}
			}
		}

		expect(emptyTests).toEqual([]);
	});

	it('should verify test files use proper testing framework', () => {
		const rulesDir = path.join(__dirname, 'rules');
		const categories = fs
			.readdirSync(rulesDir, { withFileTypes: true })
			.filter((dirent) => dirent.isDirectory())
			.map((dirent) => dirent.name);

		const invalidTests: string[] = [];

		for (const category of categories) {
			const categoryPath = path.join(rulesDir, category);
			const files = fs.readdirSync(categoryPath);

			// Find all test files
			const testFiles = files.filter(
				(file) => file.endsWith('.test.ts') || file.endsWith('.property.test.ts'),
			);

			for (const testFile of testFiles) {
				const testFilePath = path.join(categoryPath, testFile);
				const content = fs.readFileSync(testFilePath, 'utf-8');

				// Check for proper testing framework imports
				const hasVitestImport = content.includes("from 'vitest'");

				// Check for assertions - either expect() or fc.assert() for property tests
				const hasExpectUsage = content.includes('expect(');
				const hasFcAssert = content.includes('fc.assert(');
				const hasAssertions = hasExpectUsage || hasFcAssert;

				// Property: Each test file should use the proper testing framework
				if (!hasVitestImport || !hasAssertions) {
					invalidTests.push(
						`${category}/${testFile} (vitest: ${hasVitestImport}, assertions: ${hasAssertions})`,
					);
				}
			}
		}

		expect(invalidTests).toEqual([]);
	});

	it('should verify unit tests include error message validation', () => {
		const rulesDir = path.join(__dirname, 'rules');
		const categories = fs
			.readdirSync(rulesDir, { withFileTypes: true })
			.filter((dirent) => dirent.isDirectory())
			.map((dirent) => dirent.name);

		const testsWithoutMessageValidation: string[] = [];

		for (const category of categories) {
			const categoryPath = path.join(rulesDir, category);
			const files = fs.readdirSync(categoryPath);

			// Find all unit test files (not property tests)
			const unitTestFiles = files.filter(
				(file) => file.endsWith('.test.ts') && !file.endsWith('.property.test.ts'),
			);

			for (const testFile of unitTestFiles) {
				const testFilePath = path.join(categoryPath, testFile);
				const content = fs.readFileSync(testFilePath, 'utf-8');

				// Check if test validates error messages
				const validatesMessages =
					content.includes('messageId') ||
					content.includes('.message') ||
					content.includes('toContain(') ||
					content.includes('errors:');

				// Only flag if the test has invalid examples but doesn't validate messages
				const hasInvalidExamples =
					content.includes('invalid:') ||
					content.includes('should report') ||
					content.includes('should fail');

				// Property: Tests with invalid examples should validate error messages
				if (hasInvalidExamples && !validatesMessages) {
					testsWithoutMessageValidation.push(`${category}/${testFile}`);
				}
			}
		}

		expect(testsWithoutMessageValidation).toEqual([]);
	});
});
