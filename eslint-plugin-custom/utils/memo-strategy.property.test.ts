import { TSESLint } from '@typescript-eslint/utils';
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import {
	analyzeReactImport,
	ImportUpdateStrategy,
	ReactImportStyle,
	selectMemoStrategy,
	updateImports,
} from './ast-helpers';

describe('Property Tests: Memo Strategy Selection', () => {
	// Helper to parse code and get AST
	const parseCode = (code: string): any => {
		const linter = new TSESLint.Linter();
		let programNode: any = null;

		const config = [
			{
				files: ['**/*.tsx'],
				languageOptions: {
					ecmaVersion: 2022,
					sourceType: 'module',
					parser: require('@typescript-eslint/parser'),
					parserOptions: {
						ecmaFeatures: { jsx: true },
					},
				},
				plugins: {
					test: {
						meta: { name: 'test', version: '1.0.0' },
						rules: {
							capture: {
								create(context: any) {
									return {
										Program(node: any) {
											programNode = node;
										},
									};
								},
							},
						},
					},
				},
				rules: { 'test/capture': 'error' },
			},
		];

		linter.verify(code, config as any, { filename: 'test.tsx' });
		return programNode;
	};

	// Generator for valid identifier names
	const identifierGen = fc
		.string({ minLength: 1, maxLength: 10 })
		.map((s) => {
			const cleaned = s.replace(/[^a-zA-Z0-9_$]/g, '');
			if (cleaned.length === 0) return 'value';
			if (/^[0-9]/.test(cleaned)) return 'v' + cleaned;
			return cleaned;
		})
		.filter((name) => name.length > 0 && /^[a-zA-Z_$]/.test(name));

	it('Property 1: Namespace import uses React.memo', () => {
		/**
		 * Feature: icon-memoize-react-import-handling, Property 1: Namespace import uses React.memo
		 * For any icon component file with `import * as React from 'react'`, the fixer should
		 * wrap the export with `React.memo()` and not modify the import statement.
		 * Validates: Requirements 1.1, 1.2
		 */

		// Generator for namespace imports
		const namespaceImportGen = identifierGen.map((name) => ({
			code: `import * as ${name} from 'react';`,
			namespaceName: name,
		}));

		fc.assert(
			fc.property(namespaceImportGen, (importData) => {
				const { code } = importData;

				// Parse the code to get AST
				const programNode = parseCode(code);
				if (!programNode) {
					throw new Error('Failed to parse code');
				}

				// Analyze the import
				const analysis = analyzeReactImport(programNode);

				// Verify it's detected as namespace import
				expect(analysis.style).toBe(ReactImportStyle.NAMESPACE);

				// Select memo strategy
				const strategy = selectMemoStrategy(analysis);

				// Verify React.memo is used
				expect(strategy.memoReference).toBe('React.memo');

				// Verify no import changes needed
				expect(strategy.needsMemoImport).toBe(false);
				expect(strategy.importUpdateStrategy).toBe(ImportUpdateStrategy.NO_UPDATE);

				// Verify updateImports returns no fixes
				const importUpdate = updateImports(strategy, analysis.importNode, programNode);
				expect(importUpdate.fixes).toHaveLength(0);
				expect(importUpdate.updatedImports).toHaveLength(0);
			}),
			{ numRuns: 100 },
		);
	});

	it('Property 2: Default-only import uses React.memo', () => {
		/**
		 * Feature: icon-memoize-react-import-handling, Property 2: Default-only import uses React.memo
		 * For any icon component file with `import React from 'react'` and no named imports,
		 * the fixer should wrap the export with `React.memo()` and not add named imports.
		 * Validates: Requirements 2.1, 2.2
		 */

		// Generator for default-only imports
		const defaultOnlyImportGen = identifierGen.map((name) => ({
			code: `import ${name} from 'react';`,
			defaultName: name,
		}));

		fc.assert(
			fc.property(defaultOnlyImportGen, (importData) => {
				const { code } = importData;

				// Parse the code to get AST
				const programNode = parseCode(code);
				if (!programNode) {
					throw new Error('Failed to parse code');
				}

				// Analyze the import
				const analysis = analyzeReactImport(programNode);

				// Verify it's detected as default-only import
				expect(analysis.style).toBe(ReactImportStyle.DEFAULT_ONLY);

				// Select memo strategy
				const strategy = selectMemoStrategy(analysis);

				// Verify React.memo is used
				expect(strategy.memoReference).toBe('React.memo');

				// Verify no import changes needed
				expect(strategy.needsMemoImport).toBe(false);
				expect(strategy.importUpdateStrategy).toBe(ImportUpdateStrategy.NO_UPDATE);

				// Verify updateImports returns no fixes
				const importUpdate = updateImports(strategy, analysis.importNode, programNode);
				expect(importUpdate.fixes).toHaveLength(0);
				expect(importUpdate.updatedImports).toHaveLength(0);
			}),
			{ numRuns: 100 },
		);
	});

	it('Property 3: Named imports get memo added', () => {
		/**
		 * Feature: icon-memoize-react-import-handling, Property 3: Named imports get memo added
		 * For any icon component file with named imports from React (e.g., `import { useState } from 'react'`),
		 * the fixer should add `memo` to the named imports list.
		 * Validates: Requirements 3.1
		 */

		// Generator for named-only imports (without memo)
		const namedOnlyImportGen = fc
			.array(identifierGen, { minLength: 1, maxLength: 3 })
			.filter((names) => !names.includes('memo'))
			.map((names) => ({
				code: `import { ${names.join(', ')} } from 'react';`,
				namedImports: names,
			}));

		fc.assert(
			fc.property(namedOnlyImportGen, (importData) => {
				const { code } = importData;

				// Parse the code to get AST
				const programNode = parseCode(code);
				if (!programNode) {
					throw new Error('Failed to parse code');
				}

				// Analyze the import
				const analysis = analyzeReactImport(programNode);

				// Verify it's detected as named-only import
				expect(analysis.style).toBe(ReactImportStyle.NAMED_ONLY);
				expect(analysis.hasMemoImport).toBe(false);

				// Select memo strategy
				const strategy = selectMemoStrategy(analysis);

				// Verify memo import is needed
				expect(strategy.needsMemoImport).toBe(true);
				expect(strategy.importUpdateStrategy).toBe(ImportUpdateStrategy.ADD_TO_NAMED);

				// Verify updateImports returns fixes to add memo
				const importUpdate = updateImports(strategy, analysis.importNode, programNode);
				expect(importUpdate.fixes.length).toBeGreaterThan(0);
				expect(importUpdate.updatedImports).toContain('memo');

				// Verify the fix adds ", memo" to the import
				const fix = importUpdate.fixes[0];
				expect(fix.text).toBe(', memo');
			}),
			{ numRuns: 100 },
		);
	});

	it('Property 4: Named imports use memo directly', () => {
		/**
		 * Feature: icon-memoize-react-import-handling, Property 4: Named imports use memo directly
		 * For any icon component file with named imports from React (including mixed imports),
		 * the fixer should wrap the export with `memo()` not `React.memo()`.
		 * Validates: Requirements 3.2, 4.2
		 */

		// Generator for named-only and mixed imports (without memo already)
		const namedImportGen = fc.oneof(
			// Named-only
			fc
				.array(identifierGen, { minLength: 1, maxLength: 3 })
				.filter((names) => !names.includes('memo'))
				.map((names) => ({
					code: `import { ${names.join(', ')} } from 'react';`,
					importStyle: ReactImportStyle.NAMED_ONLY,
				})),
			// Mixed
			fc
				.tuple(identifierGen, fc.array(identifierGen, { minLength: 1, maxLength: 3 }))
				.filter(([, names]) => !names.includes('memo'))
				.map(([defaultName, names]) => ({
					code: `import ${defaultName}, { ${names.join(', ')} } from 'react';`,
					importStyle: ReactImportStyle.MIXED,
				})),
		);

		fc.assert(
			fc.property(namedImportGen, (importData) => {
				const { code, importStyle } = importData;

				// Parse the code to get AST
				const programNode = parseCode(code);
				if (!programNode) {
					throw new Error('Failed to parse code');
				}

				// Analyze the import
				const analysis = analyzeReactImport(programNode);

				// Verify it's detected as named or mixed import
				expect(analysis.style).toBe(importStyle);

				// Select memo strategy
				const strategy = selectMemoStrategy(analysis);

				// Verify memo (not React.memo) is used
				expect(strategy.memoReference).toBe('memo');
			}),
			{ numRuns: 100 },
		);
	});

	it('Property 5: Mixed imports add to named section', () => {
		/**
		 * Feature: icon-memoize-react-import-handling, Property 5: Mixed imports add to named section
		 * For any icon component file with `import React, { ... } from 'react'`,
		 * the fixer should add `memo` to the existing named imports section.
		 * Validates: Requirements 4.1
		 */

		// Generator for mixed imports (without memo)
		const mixedImportGen = fc
			.tuple(identifierGen, fc.array(identifierGen, { minLength: 1, maxLength: 3 }))
			.filter(([, names]) => !names.includes('memo'))
			.map(([defaultName, names]) => ({
				code: `import ${defaultName}, { ${names.join(', ')} } from 'react';`,
				defaultName,
				namedImports: names,
			}));

		fc.assert(
			fc.property(mixedImportGen, (importData) => {
				const { code } = importData;

				// Parse the code to get AST
				const programNode = parseCode(code);
				if (!programNode) {
					throw new Error('Failed to parse code');
				}

				// Analyze the import
				const analysis = analyzeReactImport(programNode);

				// Verify it's detected as mixed import
				expect(analysis.style).toBe(ReactImportStyle.MIXED);
				expect(analysis.hasMemoImport).toBe(false);

				// Select memo strategy
				const strategy = selectMemoStrategy(analysis);

				// Verify memo import is needed and added to named section
				expect(strategy.needsMemoImport).toBe(true);
				expect(strategy.importUpdateStrategy).toBe(ImportUpdateStrategy.ADD_TO_NAMED);

				// Verify updateImports returns fixes to add memo
				const importUpdate = updateImports(strategy, analysis.importNode, programNode);
				expect(importUpdate.fixes.length).toBeGreaterThan(0);
				expect(importUpdate.updatedImports).toContain('memo');

				// Verify the fix adds ", memo" to the import
				const fix = importUpdate.fixes[0];
				expect(fix.text).toBe(', memo');
			}),
			{ numRuns: 100 },
		);
	});

	it('Property 6: No duplicate memo imports', () => {
		/**
		 * Feature: icon-memoize-react-import-handling, Property 6: No duplicate memo imports
		 * For any icon component file where `memo` is already imported, the fixer should
		 * not add another `memo` import.
		 * Validates: Requirements 5.1
		 */

		// Generator for imports that already have memo
		const memoImportGen = fc.oneof(
			// Named-only with memo
			fc.array(identifierGen, { minLength: 0, maxLength: 3 }).map((names) => {
				const allNames = [...names, 'memo'];
				return {
					code: `import { ${allNames.join(', ')} } from 'react';`,
					importStyle: ReactImportStyle.NAMED_ONLY,
				};
			}),
			// Mixed with memo
			fc
				.tuple(identifierGen, fc.array(identifierGen, { minLength: 0, maxLength: 3 }))
				.map(([defaultName, names]) => {
					const allNames = [...names, 'memo'];
					return {
						code: `import ${defaultName}, { ${allNames.join(', ')} } from 'react';`,
						importStyle: ReactImportStyle.MIXED,
					};
				}),
		);

		fc.assert(
			fc.property(memoImportGen, (importData) => {
				const { code } = importData;

				// Parse the code to get AST
				const programNode = parseCode(code);
				if (!programNode) {
					throw new Error('Failed to parse code');
				}

				// Analyze the import
				const analysis = analyzeReactImport(programNode);

				// Verify memo is already imported
				expect(analysis.hasMemoImport).toBe(true);

				// Select memo strategy
				const strategy = selectMemoStrategy(analysis);

				// Verify no import changes needed
				expect(strategy.needsMemoImport).toBe(false);
				expect(strategy.importUpdateStrategy).toBe(ImportUpdateStrategy.NO_UPDATE);

				// Verify memo is used directly
				expect(strategy.memoReference).toBe('memo');

				// Verify updateImports returns no fixes
				const importUpdate = updateImports(strategy, analysis.importNode, programNode);
				expect(importUpdate.fixes).toHaveLength(0);
				expect(importUpdate.updatedImports).toHaveLength(0);
			}),
			{ numRuns: 100 },
		);
	});
});
