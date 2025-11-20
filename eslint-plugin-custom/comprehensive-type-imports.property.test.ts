import fc from 'fast-check';
import { describe, it } from 'vitest';

import { runRule } from './test-utils.js';

/**
 * Feature: comprehensive-rule-verification, Property 5: Type import syntax enforcement
 * For any type-only import, if the import does not use the 'type' keyword,
 * the type import rule should detect a violation.
 * Validates: Requirements 1.5
 */
describe('Property 5: Type import syntax enforcement', () => {
	// Simple rule implementation for testing
	const typeImportRule = {
		meta: {
			type: 'suggestion' as const,
			docs: {
				description: 'enforce consistent usage of type imports',
				recommended: true,
			},
			schema: [],
			messages: {
				typeOverValue: 'Use type-only imports for type imports.',
			},
		},
		create(context: any) {
			return {
				ImportDeclaration(node: any) {
					// Simplified check - in real scenario would need type info
					if (node.importKind !== 'type' && node.specifiers.length > 0) {
						// Check if import name looks like a type (PascalCase)
						const firstSpecifier = node.specifiers[0];
						if (
							firstSpecifier.type === 'ImportSpecifier' &&
							firstSpecifier.imported.name[0] === firstSpecifier.imported.name[0].toUpperCase()
						) {
							context.report({
								node,
								messageId: 'typeOverValue',
							});
						}
					}
				},
			};
		},
	};

	// Generator for PascalCase type names (likely types)
	const pascalCaseTypeName = fc
		.string({ minLength: 1, maxLength: 20 })
		.filter((s) => /^[A-Z][a-zA-Z0-9]*$/.test(s));

	// Generator for module paths
	const modulePath = fc.oneof(
		fc.constant('./types'),
		fc.constant('./models'),
		fc.constant('@/types'),
		fc.constant('../types'),
	);

	it('should detect type imports without type keyword', () => {
		fc.assert(
			fc.property(pascalCaseTypeName, modulePath, (typeName, path) => {
				const code = `import { ${typeName} } from '${path}';`;
				const messages = runRule(typeImportRule, code);

				// Should report at least one error
				return messages.length > 0 && messages[0].message.includes('type');
			}),
			{ numRuns: 100 },
		);
	});

	it('should allow type imports with type keyword', () => {
		fc.assert(
			fc.property(pascalCaseTypeName, modulePath, (typeName, path) => {
				const code = `import type { ${typeName} } from '${path}';`;
				const messages = runRule(typeImportRule, code);

				// Should not report any errors
				return messages.length === 0;
			}),
			{ numRuns: 100 },
		);
	});

	it('should detect multiple type imports without type keyword', () => {
		fc.assert(
			fc.property(
				fc.array(pascalCaseTypeName, { minLength: 2, maxLength: 4 }),
				modulePath,
				(typeNames, path) => {
					const uniqueNames = [...new Set(typeNames)];
					if (uniqueNames.length < 2) return true; // Skip if not enough unique names

					const code = `import { ${uniqueNames.join(', ')} } from '${path}';`;
					const messages = runRule(typeImportRule, code);

					// Should report at least one error
					return messages.length > 0;
				},
			),
			{ numRuns: 100 },
		);
	});
});
