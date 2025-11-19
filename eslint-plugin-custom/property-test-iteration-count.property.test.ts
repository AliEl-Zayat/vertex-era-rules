import * as fc from 'fast-check';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Property Test: Property test iteration count
 * Feature: eslint-package-enhancement, Property 5: Property test iteration count
 *
 * For any property-based test file, all fast-check property tests should be
 * configured to run at least 100 iterations.
 *
 * Validates: Requirements 8.1
 */
describe('Property: Property test iteration count', () => {
	/**
	 * Helper function to find all property test files
	 */
	function findAllPropertyTestFiles(dir: string): string[] {
		const propertyTestFiles: string[] = [];

		function scanDirectory(currentDir: string): void {
			const entries = fs.readdirSync(currentDir, { withFileTypes: true });

			for (const entry of entries) {
				const fullPath = path.join(currentDir, entry.name);

				if (entry.isDirectory()) {
					// Skip node_modules and other non-source directories
					if (
						!entry.name.startsWith('.') &&
						entry.name !== 'node_modules' &&
						entry.name !== 'dist'
					) {
						scanDirectory(fullPath);
					}
				} else if (entry.isFile() && entry.name.endsWith('.property.test.ts')) {
					propertyTestFiles.push(fullPath);
				}
			}
		}

		scanDirectory(dir);
		return propertyTestFiles;
	}

	/**
	 * Helper function to extract numRuns values from a property test file
	 */
	function extractNumRunsValues(filePath: string): { line: number; value: number | null }[] {
		const content = fs.readFileSync(filePath, 'utf-8');
		const lines = content.split('\n');
		const numRunsValues: { line: number; value: number | null }[] = [];

		// Pattern to match: { numRuns: <number> }
		const numRunsPattern = /\{\s*numRuns:\s*(\d+)\s*\}/g;

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			let match;

			while ((match = numRunsPattern.exec(line)) !== null) {
				const value = parseInt(match[1], 10);
				numRunsValues.push({
					line: i + 1, // 1-indexed line numbers
					value,
				});
			}
		}

		return numRunsValues;
	}

	/**
	 * Helper function to check if a file actually uses fast-check for property-based testing
	 * We check if it imports fast-check AND uses fc.property or fc.assert
	 */
	function containsFcAssert(filePath: string): boolean {
		const content = fs.readFileSync(filePath, 'utf-8');

		// Check if file imports fast-check
		const importsFastCheck =
			content.includes("from 'fast-check'") ||
			content.includes('from "fast-check"') ||
			content.includes('import * as fc');

		if (!importsFastCheck) {
			return false;
		}

		// Check if file uses fc.property (which is used with fc.assert)
		// This is more reliable than checking for fc.assert directly
		const usesFcProperty = content.includes('fc.property(');

		return usesFcProperty;
	}

	it('should verify all property test files have numRuns >= 100', () => {
		const projectRoot = path.join(__dirname, '../..');
		const propertyTestFiles = findAllPropertyTestFiles(projectRoot);

		// Ensure we found some property test files
		expect(propertyTestFiles.length).toBeGreaterThan(0);

		const violations: string[] = [];
		let filesChecked = 0;

		for (const filePath of propertyTestFiles) {
			// Only check files that actually use fc.assert (true property-based tests)
			if (!containsFcAssert(filePath)) {
				continue;
			}

			filesChecked++;
			const numRunsValues = extractNumRunsValues(filePath);
			const relativePath = path.relative(projectRoot, filePath);

			// Check if file has any numRuns configurations
			if (numRunsValues.length === 0) {
				violations.push(
					`${relativePath}: No numRuns configuration found (should have at least one with numRuns >= 100)`,
				);
				continue;
			}

			// Check each numRuns value
			for (const { line, value } of numRunsValues) {
				if (value === null || value < 100) {
					violations.push(
						`${relativePath}:${line}: numRuns is ${value ?? 'null'} (should be >= 100)`,
					);
				}
			}
		}

		// Ensure we checked at least some files
		expect(filesChecked).toBeGreaterThan(0);

		// Report all violations
		if (violations.length > 0) {
			const errorMessage = `Found ${violations.length} property test(s) with insufficient iterations:\n\n${violations.join('\n')}`;
			expect.fail(errorMessage);
		}

		expect(violations).toHaveLength(0);
	});

	it('should verify property test files that use fc.assert also import fast-check', () => {
		const projectRoot = path.join(__dirname, '../..');
		const propertyTestFiles = findAllPropertyTestFiles(projectRoot);

		const filesWithoutFastCheck: string[] = [];

		for (const filePath of propertyTestFiles) {
			const content = fs.readFileSync(filePath, 'utf-8');
			const relativePath = path.relative(projectRoot, filePath);

			// Check for fc.property usage (more reliable than fc.assert)
			const usesFcProperty = content.includes('fc.property(');

			// Only check files that use fc.property
			if (!usesFcProperty) {
				continue;
			}

			// Check for fast-check import
			const hasFastCheckImport =
				content.includes("from 'fast-check'") ||
				content.includes('from "fast-check"') ||
				content.includes('import * as fc');

			if (!hasFastCheckImport) {
				filesWithoutFastCheck.push(`${relativePath} (missing fast-check import)`);
			}
		}

		if (filesWithoutFastCheck.length > 0) {
			console.log('Files without fast-check import:', filesWithoutFastCheck);
		}

		expect(filesWithoutFastCheck).toHaveLength(0);
	});

	it('should use property-based testing to verify numRuns configuration', () => {
		const projectRoot = path.join(__dirname, '../..');
		const propertyTestFiles = findAllPropertyTestFiles(projectRoot);

		// Filter to only files that use fc.assert
		const filesWithFcAssert = propertyTestFiles.filter((filePath) =>
			containsFcAssert(filePath),
		);

		// Skip if no files found
		if (filesWithFcAssert.length === 0) {
			expect(filesWithFcAssert.length).toBeGreaterThan(0);
			return;
		}

		fc.assert(
			fc.property(fc.constantFrom(...filesWithFcAssert), (filePath) => {
				// Property: For any property test file, all numRuns values should be >= 100
				const numRunsValues = extractNumRunsValues(filePath);
				const relativePath = path.relative(projectRoot, filePath);

				// Each file should have at least one numRuns configuration
				expect(numRunsValues.length).toBeGreaterThan(0);

				// Each numRuns value should be >= 100
				for (const { value } of numRunsValues) {
					expect(value).toBeGreaterThanOrEqual(100);
				}

				return true;
			}),
			{ numRuns: 100 },
		);
	});

	it('should verify property test files have proper test structure', () => {
		const projectRoot = path.join(__dirname, '../..');
		const propertyTestFiles = findAllPropertyTestFiles(projectRoot);

		const filesWithIssues: string[] = [];

		for (const filePath of propertyTestFiles) {
			const content = fs.readFileSync(filePath, 'utf-8');
			const relativePath = path.relative(projectRoot, filePath);

			// Check for describe blocks
			const hasDescribe = content.includes('describe(');

			// Check for it/test blocks
			const hasTests = content.includes("it('") || content.includes('it("');

			// Check for expect assertions or fc.assert
			const hasExpect = content.includes('expect(');
			const hasFcAssert = content.includes('fc.assert(');
			const hasAssertions = hasExpect || hasFcAssert;

			if (!hasDescribe || !hasTests || !hasAssertions) {
				filesWithIssues.push(
					`${relativePath} (describe: ${hasDescribe}, tests: ${hasTests}, assertions: ${hasAssertions})`,
				);
			}
		}

		expect(filesWithIssues).toHaveLength(0);
	});
});
