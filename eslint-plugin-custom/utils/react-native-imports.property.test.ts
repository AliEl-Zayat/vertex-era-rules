import { AST_NODE_TYPES, TSESLint } from '@typescript-eslint/utils';
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import {
	addTypeAnnotation,
	getTypeAnnotationStrategy,
	IconEnvironment,
	ReactImportStyle,
} from './ast-helpers';

describe('Property Tests: React Native Imports', () => {
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
			if (cleaned.length === 0) return 'Icon';
			if (/^[0-9]/.test(cleaned)) return 'I' + cleaned;
			return cleaned;
		})
		.filter((name) => name.length > 0 && /^[a-zA-Z_$]/.test(name));

	it('Property 8: React Native components get SvgProps type import', () => {
		/**
		 * Feature: icon-memoize-react-import-handling, Property 8: React Native components get SvgProps type import
		 * For any React Native icon component, the addTypeAnnotation function should add
		 * an import for SvgProps from react-native-svg.
		 * Validates: Requirements 7.1
		 */

		// Generator for React Native component code without react-native-svg import
		const componentGen = fc.oneof(
			// Function declaration
			identifierGen.map((name) => ({
				code: `
import React from 'react';

function ${name}() {
  return <Svg width="24" height="24"><Path d="M10 20" /></Svg>;
}

export default ${name};
`,
				componentName: name,
				componentType: 'FunctionDeclaration',
			})),

			// Arrow function
			identifierGen.map((name) => ({
				code: `
import React from 'react';

const ${name} = () => {
  return <Svg width="24" height="24"><Path d="M10 20" /></Svg>;
};

export default ${name};
`,
				componentName: name,
				componentType: 'VariableDeclarator',
			})),
		);

		fc.assert(
			fc.property(componentGen, (componentData) => {
				const { code, componentType } = componentData;

				// Parse the code to get AST
				const programNode = parseCode(code);
				if (!programNode) {
					throw new Error('Failed to parse code');
				}

				// Find the component node
				let componentNode: any = null;
				if (componentType === 'FunctionDeclaration') {
					for (const statement of programNode.body) {
						if (statement.type === AST_NODE_TYPES.FunctionDeclaration) {
							componentNode = statement;
							break;
						}
					}
				} else {
					for (const statement of programNode.body) {
						if (statement.type === AST_NODE_TYPES.VariableDeclaration) {
							componentNode = statement.declarations[0];
							break;
						}
					}
				}

				if (!componentNode) {
					throw new Error('Component node not found');
				}

				// Get type annotation strategy for React Native
				const strategy = getTypeAnnotationStrategy(
					IconEnvironment.REACT_NATIVE,
					ReactImportStyle.DEFAULT_ONLY,
				);

				// Add type annotation
				const result = addTypeAnnotation(componentNode, strategy, programNode);

				// Verify that fixes were generated
				expect(result.success).toBe(true);
				expect(result.fixes.length).toBeGreaterThan(0);

				// Verify that SvgProps import is added
				// The import fix should be separate from the type annotation fix
				const importFix = result.fixes.find((fix) =>
					fix.text.includes("from 'react-native-svg'"),
				);
				expect(importFix).toBeDefined();
				expect(importFix?.text).toContain('SvgProps');
			}),
			{ numRuns: 100 },
		);
	});

	it('Property 9: React Native components get Svg import', () => {
		/**
		 * Feature: icon-memoize-react-import-handling, Property 9: React Native components get Svg import
		 * For any React Native icon component, the addTypeAnnotation function should add
		 * an import for Svg component from react-native-svg.
		 * Validates: Requirements 7.2
		 */

		// Generator for React Native component code without react-native-svg import
		const componentGen = fc.oneof(
			// Function declaration
			identifierGen.map((name) => ({
				code: `
import React from 'react';

function ${name}() {
  return <Svg width="24" height="24"><Path d="M10 20" /></Svg>;
}

export default ${name};
`,
				componentName: name,
				componentType: 'FunctionDeclaration',
			})),

			// Arrow function
			identifierGen.map((name) => ({
				code: `
import React from 'react';

const ${name} = () => {
  return <Svg width="24" height="24"><Path d="M10 20" /></Svg>;
};

export default ${name};
`,
				componentName: name,
				componentType: 'VariableDeclarator',
			})),
		);

		fc.assert(
			fc.property(componentGen, (componentData) => {
				const { code, componentType } = componentData;

				// Parse the code to get AST
				const programNode = parseCode(code);
				if (!programNode) {
					throw new Error('Failed to parse code');
				}

				// Find the component node
				let componentNode: any = null;
				if (componentType === 'FunctionDeclaration') {
					for (const statement of programNode.body) {
						if (statement.type === AST_NODE_TYPES.FunctionDeclaration) {
							componentNode = statement;
							break;
						}
					}
				} else {
					for (const statement of programNode.body) {
						if (statement.type === AST_NODE_TYPES.VariableDeclaration) {
							componentNode = statement.declarations[0];
							break;
						}
					}
				}

				if (!componentNode) {
					throw new Error('Component node not found');
				}

				// Get type annotation strategy for React Native
				const strategy = getTypeAnnotationStrategy(
					IconEnvironment.REACT_NATIVE,
					ReactImportStyle.DEFAULT_ONLY,
				);

				// Add type annotation
				const result = addTypeAnnotation(componentNode, strategy, programNode);

				// Verify that fixes were generated
				expect(result.success).toBe(true);
				expect(result.fixes.length).toBeGreaterThan(0);

				// Verify that Svg import is added
				// The import fix should be separate from the type annotation fix
				const importFix = result.fixes.find((fix) =>
					fix.text.includes("from 'react-native-svg'"),
				);
				expect(importFix).toBeDefined();

				// Verify both SvgProps and Svg are in the same import
				expect(importFix?.text).toContain('SvgProps');
				expect(importFix?.text).toContain('Svg');
			}),
			{ numRuns: 100 },
		);
	});
});
