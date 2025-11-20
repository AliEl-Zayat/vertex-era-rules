import fc from 'fast-check';
import { describe, it } from 'vitest';

import { runRule } from './test-utils.js';

/**
 * Feature: comprehensive-rule-verification, Property 9: Unused module detection
 * For any imported module that is never referenced in the code, the unused imports rule should detect a violation.
 * Validates: Requirements 1.9
 */
describe('Property 9: Unused module detection', () => {
	// Rule that mimics unused-imports/no-unused-imports
	const unusedImportsRule = {
		meta: {
			type: 'problem' as const,
			docs: {
				description: 'Disallow unused imports',
			},
			schema: [],
			messages: {
				unusedImport: "'{{importName}}' is defined but never used.",
			},
		},
		create(context: any) {
			const importedNames = new Map<string, any>();
			const usedNames = new Set<string>();

			return {
				'ImportDeclaration'(node: any) {
					for (const specifier of node.specifiers) {
						if (specifier.type === 'ImportSpecifier') {
							importedNames.set(specifier.local.name, specifier);
						} else if (specifier.type === 'ImportDefaultSpecifier') {
							importedNames.set(specifier.local.name, specifier);
						} else if (specifier.type === 'ImportNamespaceSpecifier') {
							importedNames.set(specifier.local.name, specifier);
						}
					}
				},
				'JSXIdentifier'(node: any) {
					// Track JSX element usage
					usedNames.add(node.name);
				},
				'Identifier'(node: any) {
					// Track identifier usage (excluding the import declaration itself)
					const parent = node.parent;
					if (
						parent &&
						parent.type !== 'ImportSpecifier' &&
						parent.type !== 'ImportDefaultSpecifier' &&
						parent.type !== 'ImportNamespaceSpecifier'
					) {
						usedNames.add(node.name);
					}
				},
				'Program:exit'() {
					for (const [importName, specifier] of importedNames) {
						if (!usedNames.has(importName)) {
							context.report({
								node: specifier,
								messageId: 'unusedImport',
								data: { importName },
							});
						}
					}
				},
			};
		},
	};

	// Generator for import names
	const importName = fc.oneof(
		fc.constant('lodash'),
		fc.constant('axios'),
		fc.constant('react'),
		fc.constant('moment'),
		fc.constant('uuid'),
	);

	// Generator for named imports
	const namedImport = fc.oneof(
		fc.constant('map'),
		fc.constant('filter'),
		fc.constant('reduce'),
		fc.constant('forEach'),
		fc.constant('find'),
		fc.constant('some'),
		fc.constant('every'),
	);

	// Generator for variable names
	const variableName = fc.oneof(
		fc.constant('result'),
		fc.constant('data'),
		fc.constant('value'),
		fc.constant('output'),
		fc.constant('items'),
	);

	it('should detect any unused default import', { timeout: 10000 }, () => {
		fc.assert(
			fc.property(importName, (moduleName) => {
				const code = `import ${moduleName} from '${moduleName}';`;
				const messages = runRule(unusedImportsRule, code);

				// Should report at least one error
				return messages.length > 0 && messages[0].message.includes(moduleName);
			}),
			{ numRuns: 100 },
		);
	});

	it('should detect any unused named import', () => {
		fc.assert(
			fc.property(namedImport, importName, (name, moduleName) => {
				const code = `import { ${name} } from '${moduleName}';`;
				const messages = runRule(unusedImportsRule, code);

				// Should report at least one error
				return messages.length > 0 && messages[0].message.includes(name);
			}),
			{ numRuns: 100 },
		);
	});

	it('should detect any unused namespace import', () => {
		fc.assert(
			fc.property(variableName, importName, (varName, moduleName) => {
				const code = `import * as ${varName} from '${moduleName}';`;
				const messages = runRule(unusedImportsRule, code);

				// Should report at least one error
				return messages.length > 0 && messages[0].message.includes(varName);
			}),
			{ numRuns: 100 },
		);
	});

	it('should allow any used default import', () => {
		fc.assert(
			fc.property(importName, (moduleName) => {
				const code = `
import ${moduleName} from '${moduleName}';
const result = ${moduleName}.something();
`;
				const messages = runRule(unusedImportsRule, code);

				// Should not report any errors
				return messages.length === 0;
			}),
			{ numRuns: 100 },
		);
	});

	it('should allow any used named import', () => {
		fc.assert(
			fc.property(namedImport, importName, (name, moduleName) => {
				const code = `
import { ${name} } from '${moduleName}';
const result = ${name}([1, 2, 3]);
`;
				const messages = runRule(unusedImportsRule, code);

				// Should not report any errors
				return messages.length === 0;
			}),
			{ numRuns: 100 },
		);
	});

	it('should allow any used namespace import', () => {
		fc.assert(
			fc.property(variableName, importName, (varName, moduleName) => {
				const code = `
import * as ${varName} from '${moduleName}';
const result = ${varName}.method();
`;
				const messages = runRule(unusedImportsRule, code);

				// Should not report any errors
				return messages.length === 0;
			}),
			{ numRuns: 100 },
		);
	});

	it('should detect multiple unused named imports from same module', () => {
		fc.assert(
			fc.property(
				fc.array(namedImport, { minLength: 2, maxLength: 4 }),
				importName,
				(names, moduleName) => {
					// Remove duplicates
					const uniqueNames = [...new Set(names)];
					const code = `import { ${uniqueNames.join(', ')} } from '${moduleName}';`;
					const messages = runRule(unusedImportsRule, code);

					// Should report one error per unused import
					return messages.length === uniqueNames.length;
				},
			),
			{ numRuns: 100 },
		);
	});

	it('should detect unused imports while allowing used ones', () => {
		fc.assert(
			fc.property(
				fc.array(namedImport, { minLength: 3, maxLength: 5 }),
				importName,
				(names, moduleName) => {
					// Remove duplicates
					const uniqueNames = [...new Set(names)];
					if (uniqueNames.length < 2) return true; // Skip if not enough unique names

					// Use only the first import, leave others unused
					const usedName = uniqueNames[0];
					const code = `
import { ${uniqueNames.join(', ')} } from '${moduleName}';
const result = ${usedName}([1, 2, 3]);
`;
					const messages = runRule(unusedImportsRule, code);

					// Should report errors for all unused imports (all except the first one)
					return messages.length === uniqueNames.length - 1;
				},
			),
			{ numRuns: 100 },
		);
	});

	it('should allow imports used in JSX elements', () => {
		fc.assert(
			fc.property(
				fc.constantFrom('Button', 'Input', 'Card', 'Modal', 'Dialog'),
				(componentName) => {
					const code = `
import { ${componentName} } from './components';
const Component = () => <${componentName}>Content</${componentName}>;
`;
					const messages = runRule(unusedImportsRule, code);

					// Should not report any errors
					return messages.length === 0;
				},
			),
			{ numRuns: 100 },
		);
	});

	it('should allow imports used in type annotations', () => {
		fc.assert(
			fc.property(
				fc.constantFrom('User', 'Post', 'Comment', 'Product', 'Order'),
				(typeName) => {
					const code = `
import type { ${typeName} } from './types';
const value: ${typeName} = {} as ${typeName};
`;
					const messages = runRule(unusedImportsRule, code);

					// Should not report any errors
					return messages.length === 0;
				},
			),
			{ numRuns: 100 },
		);
	});

	it('should detect unused imports in different code contexts', () => {
		fc.assert(
			fc.property(namedImport, importName, (name, moduleName) => {
				const contexts = [
					`import { ${name} } from '${moduleName}';`,
					`import { ${name} } from '${moduleName}';\nconst x = 1;`,
					`import { ${name} } from '${moduleName}';\nfunction test() { return 1; }`,
					`import { ${name} } from '${moduleName}';\nconst Component = () => <div>Test</div>;`,
				];

				// All contexts should detect the unused import
				return contexts.every((code) => {
					const messages = runRule(unusedImportsRule, code);
					return messages.length > 0 && messages[0].message.includes(name);
				});
			}),
			{ numRuns: 100 },
		);
	});

	it('should allow imports used in function calls', () => {
		fc.assert(
			fc.property(namedImport, importName, variableName, (name, moduleName, varName) => {
				const code = `
import { ${name} } from '${moduleName}';
const ${varName} = ${name}([1, 2, 3], x => x * 2);
`;
				const messages = runRule(unusedImportsRule, code);

				// Should not report any errors
				return messages.length === 0;
			}),
			{ numRuns: 100 },
		);
	});

	it('should allow imports used as function parameters', () => {
		fc.assert(
			fc.property(fc.constantFrom('User', 'Post', 'Comment'), (typeName) => {
				const code = `
import { ${typeName} } from './types';
function process(item: ${typeName}) { return item; }
`;
				const messages = runRule(unusedImportsRule, code);

				// Should not report any errors
				return messages.length === 0;
			}),
			{ numRuns: 100 },
		);
	});

	it('should detect unused type imports', () => {
		fc.assert(
			fc.property(fc.constantFrom('User', 'Post', 'Comment', 'Product'), (typeName) => {
				const code = `import type { ${typeName} } from './types';`;
				const messages = runRule(unusedImportsRule, code);

				// Should report at least one error
				return messages.length > 0 && messages[0].message.includes(typeName);
			}),
			{ numRuns: 100 },
		);
	});
});
