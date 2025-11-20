import { TSESLint } from '@typescript-eslint/utils';
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort';
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

/**
 * Feature: comprehensive-rule-verification, Property 7: Import order enforcement
 * For any set of imports that are not ordered according to the specified groups
 * (builtin, internal-alias, internal, external, parent, sibling, index, object, type),
 * the import order rule should detect a violation.
 * Validates: Requirements 1.7, 5.1
 */
describe('Property 7: Import order enforcement', () => {
	// Use the actual simple-import-sort rule with configuration
	const importOrderRule = simpleImportSortPlugin.rules.imports;

	// Helper function to run the rule with proper configuration
	function runRuleWithConfig(code: string): any[] {
		const linter = new TSESLint.Linter();

		const config = [
			{
				files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
				languageOptions: {
					ecmaVersion: 2022,
					sourceType: 'module',
					parser: require('@typescript-eslint/parser'),
					parserOptions: {
						ecmaFeatures: {
							jsx: true,
						},
					},
				},
				plugins: {
					'simple-import-sort': {
						meta: {
							name: 'simple-import-sort',
							version: '1.0.0',
						},
						rules: {
							imports: importOrderRule as any,
						},
					},
				},
				rules: {
					'simple-import-sort/imports': [
						'error',
						{
							groups: [
								['^react', '^react-dom', '^react', '^@?\\w'],
								[
									'^@(?:assets|constants|types|lib|hooks|store|services|pages|components|ui|forms|contexts|providers)(?:/.*)?$',
									'^@/',
								],
								['^\\u0000'],
								['^\\.\\.(?!/?$)', '^\\./(?=.*/)(?!/?$)', '^\\./?$'],
								['^.+\\.s?css$', '^.+\\.(?:svg|png|jpe?g|gif|ico|ttf|woff2?)$'],
							],
						},
					],
				},
			},
		];

		const messages = linter.verify(code, config as any, { filename: 'test.tsx' });
		return messages;
	}

	// Generator for React/builtin imports (group 1)
	const builtinImport = fc.oneof(
		fc.constant('react'),
		fc.constant('react-dom'),
		fc.constant('react-router-dom'),
	);

	// Generator for external package names (group 1)
	const externalPackage = fc.oneof(
		fc.constant('lodash'),
		fc.constant('axios'),
		fc.constant('date-fns'),
		fc.constant('uuid'),
	);

	// Generator for internal alias imports (group 2 - first part)
	const internalAliasImport = fc.oneof(
		fc.constant('@constants/app'),
		fc.constant('@assets/logo'),
		fc.constant('@types/user'),
		fc.constant('@hooks/useAuth'),
		fc.constant('@components/Button'),
	);

	// Generator for internal imports (group 2 - second part)
	const internalImport = fc.oneof(
		fc.constant('@/components/Button'),
		fc.constant('@/utils/format'),
		fc.constant('@/hooks/useAuth'),
	);

	// Generator for relative import paths (group 4)
	const relativeImport = fc.oneof(
		fc.constant('./helper'),
		fc.constant('./utils'),
		fc.constant('../components'),
		fc.constant('./types'),
	);

	it('should detect when relative imports come before react', { timeout: 10000 }, () => {
		fc.assert(
			fc.property(relativeImport, (path) => {
				const code = `import { helper } from '${path}';\nimport React from 'react';`;
				const messages = runRuleWithConfig(code);

				// Should report at least one error for incorrect order
				expect(messages.length).toBeGreaterThan(0);
				return true;
			}),
			{ numRuns: 100 },
		);
	});

	it('should detect when relative imports are mixed with external packages without blank lines', () => {
		fc.assert(
			fc.property(externalPackage, relativeImport, (pkg, relative) => {
				const code = `import { external } from '${pkg}';\nimport { helper } from '${relative}';`;
				const messages = runRuleWithConfig(code);

				// Should report error because different groups need blank lines
				expect(messages.length).toBeGreaterThan(0);
				return true;
			}),
			{ numRuns: 100 },
		);
	});

	it('should detect when internal imports come before internal-alias', () => {
		fc.assert(
			fc.property(internalImport, internalAliasImport, (internal, alias) => {
				const code = `import React from 'react';\nimport { Component } from '${internal}';\nimport { CONSTANT } from '${alias}';`;
				const messages = runRuleWithConfig(code);

				// Should report at least one error
				expect(messages.length).toBeGreaterThan(0);
				return true;
			}),
			{ numRuns: 100 },
		);
	});

	it('should detect when relative imports come before internal imports', () => {
		fc.assert(
			fc.property(relativeImport, internalImport, (relative, internal) => {
				const code = `import React from 'react';\nimport { helper } from '${relative}';\nimport { Component } from '${internal}';`;
				const messages = runRuleWithConfig(code);

				// Should report at least one error
				expect(messages.length).toBeGreaterThan(0);
				return true;
			}),
			{ numRuns: 100 },
		);
	});

	it('should allow correct import order with blank lines: builtin -> internal-alias -> relative', () => {
		fc.assert(
			fc.property(
				builtinImport,
				internalAliasImport,
				relativeImport,
				(builtin, alias, relative) => {
					// Internal alias and internal (@/) are in the same group, so no blank line between them
					// But need blank lines between different groups
					const code = `import React from '${builtin}';\n\nimport { CONSTANT } from '${alias}';\n\nimport { helper } from '${relative}';`;
					const messages = runRuleWithConfig(code);

					// Should not report any errors
					expect(messages.length).toBe(0);
					return true;
				},
			),
			{ numRuns: 100 },
		);
	});

	it('should allow correct order with blank lines between groups', () => {
		fc.assert(
			fc.property(relativeImport, (path) => {
				const code = `import React from 'react';\n\nimport { helper } from '${path}';`;
				const messages = runRuleWithConfig(code);

				// Should not report any errors when blank line separates groups
				expect(messages.length).toBe(0);
				return true;
			}),
			{ numRuns: 100 },
		);
	});
});
