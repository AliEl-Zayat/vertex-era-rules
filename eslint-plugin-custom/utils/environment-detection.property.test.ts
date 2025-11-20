import { TSESLint } from '@typescript-eslint/utils';
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { detectIconEnvironment, IconEnvironment } from './ast-helpers';

describe('Property Tests: Environment Detection', () => {
	it('Property: React Native detection accuracy', () => {
		/**
		 * Feature: icon-memoize-react-import-handling, Property: React Native detection accuracy
		 * For any icon component file, the detector should correctly identify whether it's a
		 * React web or React Native component based on react-native-svg imports and <Svg> JSX usage.
		 * Validates: Requirements 7.1, 7.2, 7.3
		 */

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

		// Generator for icon component code with different environment indicators
		const iconComponentGen = fc.oneof(
			// React web: no react-native-svg import, uses <svg>
			identifierGen.map((componentName) => ({
				code: `
import React from 'react';

const ${componentName} = () => (
  <svg width="24" height="24">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
  </svg>
);

export default ${componentName};
`,
				expectedEnvironment: IconEnvironment.REACT_WEB,
				hasReactNativeSvgImport: false,
				usesSvgComponent: false,
			})),

			// React Native: has react-native-svg import, uses <Svg>
			identifierGen.map((componentName) => ({
				code: `
import React from 'react';
import { Svg, Path } from 'react-native-svg';

const ${componentName} = () => (
  <Svg width="24" height="24">
    <Path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
  </Svg>
);

export default ${componentName};
`,
				expectedEnvironment: IconEnvironment.REACT_NATIVE,
				hasReactNativeSvgImport: true,
				usesSvgComponent: true,
			})),

			// React Native: has react-native-svg import but no JSX yet
			fc.array(identifierGen, { minLength: 1, maxLength: 3 }).map((imports) => ({
				code: `
import React from 'react';
import { ${imports.join(', ')} } from 'react-native-svg';

const Icon = () => null;
`,
				expectedEnvironment: IconEnvironment.REACT_NATIVE,
				hasReactNativeSvgImport: true,
				usesSvgComponent: false,
			})),

			// React Native: uses <Svg> but no explicit import (edge case)
			identifierGen.map((componentName) => ({
				code: `
import React from 'react';

const ${componentName} = () => (
  <Svg width="24" height="24">
    <Path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
  </Svg>
);

export default ${componentName};
`,
				expectedEnvironment: IconEnvironment.REACT_NATIVE,
				hasReactNativeSvgImport: false,
				usesSvgComponent: true,
			})),

			// React web: no indicators at all
			identifierGen.map((componentName) => ({
				code: `
import React from 'react';

const ${componentName} = () => <div>Icon</div>;

export default ${componentName};
`,
				expectedEnvironment: IconEnvironment.REACT_WEB,
				hasReactNativeSvgImport: false,
				usesSvgComponent: false,
			})),
		);

		fc.assert(
			fc.property(iconComponentGen, (componentData) => {
				const { code, expectedEnvironment, hasReactNativeSvgImport, usesSvgComponent } =
					componentData;

				// Parse the code to get AST
				const programNode = parseCode(code);
				if (!programNode) {
					throw new Error('Failed to parse code');
				}

				// Detect the environment
				const result = detectIconEnvironment(programNode as any);

				// Verify the environment is correctly detected
				expect(result.environment).toBe(expectedEnvironment);

				// Verify react-native-svg import detection
				expect(result.hasReactNativeSvgImport).toBe(hasReactNativeSvgImport);

				// Verify <Svg> component usage detection
				expect(result.usesSvgComponent).toBe(usesSvgComponent);
			}),
			{ numRuns: 100 },
		);
	});
});
