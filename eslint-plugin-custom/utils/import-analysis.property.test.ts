import { AST_NODE_TYPES, TSESLint } from '@typescript-eslint/utils';
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { analyzeReactImport, ReactImportStyle } from './ast-helpers';

describe('Property Tests: Import Analysis', () => {
	it('Property: Import style detection accuracy', () => {
		/**
		 * Feature: icon-memoize-react-import-handling, Property: Import style detection accuracy
		 * For any React import statement, the analyzer should correctly identify the import style
		 * (namespace/default/named/mixed/none) and accurately report the presence of memo import.
		 * Validates: Requirements 1.1, 2.1, 3.1, 4.1
		 */

		// Helper to parse code and get AST
		const parseCode = (code: string) => {
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

		// JavaScript reserved keywords that cannot be used as identifiers
		const reservedKeywords = new Set([
			'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default',
			'delete', 'do', 'else', 'export', 'extends', 'finally', 'for', 'function',
			'if', 'import', 'in', 'instanceof', 'new', 'return', 'super', 'switch',
			'this', 'throw', 'try', 'typeof', 'var', 'void', 'while', 'with', 'yield',
			'enum', 'await', 'implements', 'interface', 'let', 'package', 'private',
			'protected', 'public', 'static',
		]);

		// Generator for valid identifier names
		const identifierGen = fc
			.string({ minLength: 1, maxLength: 10 })
			.map((s) => {
				const cleaned = s.replace(/[^a-zA-Z0-9_$]/g, '');
				if (cleaned.length === 0) return 'value';
				if (/^[0-9]/.test(cleaned)) return 'v' + cleaned;
				return cleaned;
			})
			.filter((name) => name.length > 0 && /^[a-zA-Z_$]/.test(name) && !reservedKeywords.has(name));

		// Generator for React import styles
		const reactImportGen = fc.oneof(
			// No import
			fc.constant({ code: '', expectedStyle: ReactImportStyle.NONE }),

			// Namespace import
			identifierGen.map((name) => ({
				code: `import * as ${name} from 'react';`,
				expectedStyle: ReactImportStyle.NAMESPACE,
			})),

			// Default-only import
			identifierGen.map((name) => ({
				code: `import ${name} from 'react';`,
				expectedStyle: ReactImportStyle.DEFAULT_ONLY,
			})),

			// Named-only import (without memo)
			fc
				.array(identifierGen, { minLength: 1, maxLength: 3 })
				.filter((names) => !names.includes('memo'))
				.map((names) => ({
					code: `import { ${names.join(', ')} } from 'react';`,
					expectedStyle: ReactImportStyle.NAMED_ONLY,
					hasMemo: false,
				})),

			// Named-only import (with memo)
			fc.array(identifierGen, { minLength: 0, maxLength: 3 }).map((names) => {
				const allNames = [...names, 'memo'];
				return {
					code: `import { ${allNames.join(', ')} } from 'react';`,
					expectedStyle: ReactImportStyle.NAMED_ONLY,
					hasMemo: true,
				};
			}),

			// Mixed import (without memo)
			fc
				.tuple(identifierGen, fc.array(identifierGen, { minLength: 1, maxLength: 3 }))
				.filter(([, names]) => !names.includes('memo'))
				.map(([defaultName, names]) => ({
					code: `import ${defaultName}, { ${names.join(', ')} } from 'react';`,
					expectedStyle: ReactImportStyle.MIXED,
					hasMemo: false,
				})),

			// Mixed import (with memo)
			fc
				.tuple(identifierGen, fc.array(identifierGen, { minLength: 0, maxLength: 3 }))
				.map(([defaultName, names]) => {
					const allNames = [...names, 'memo'];
					return {
						code: `import ${defaultName}, { ${allNames.join(', ')} } from 'react';`,
						expectedStyle: ReactImportStyle.MIXED,
						hasMemo: true,
					};
				}),
		);

		fc.assert(
			fc.property(reactImportGen, (importData) => {
				const { code, expectedStyle } = importData;
				const isMemoExpected = 'hasMemo' in importData ? importData.hasMemo : false;

				// Parse the code to get AST
				const programNode = parseCode(code);
				if (!programNode) {
					throw new Error('Failed to parse code');
				}

				// Analyze the import
				const result = analyzeReactImport(programNode);

				// Verify the import style is correctly detected
				expect(result.style).toBe(expectedStyle);

				// Verify memo import detection
				expect(result.hasMemoImport).toBe(isMemoExpected);

				// Verify hasDefaultImport flag
				const isDefaultImportExpected =
					expectedStyle === ReactImportStyle.DEFAULT_ONLY ||
					expectedStyle === ReactImportStyle.MIXED;
				expect(result.hasDefaultImport).toBe(isDefaultImportExpected);

				// Verify hasNamedImports flag
				const isNamedImportExpected =
					expectedStyle === ReactImportStyle.NAMED_ONLY ||
					expectedStyle === ReactImportStyle.MIXED;
				expect(result.hasNamedImports).toBe(isNamedImportExpected);

				// Verify importNode presence
				if (expectedStyle === ReactImportStyle.NONE) {
					expect(result.importNode).toBeNull();
				} else {
					expect(result.importNode).not.toBeNull();
					expect(result.importNode?.type).toBe(AST_NODE_TYPES.ImportDeclaration);
					expect(result.importNode?.source.value).toBe('react');
				}

				return true;
			}),
			{ numRuns: 100 },
		);
	});
});
