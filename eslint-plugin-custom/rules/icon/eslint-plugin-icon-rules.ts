import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import { validateExportDefaultDeclaration, validateJSXElement } from '../../utils/ast-helpers';

interface IColorIssue {
	attribute: string;
	value: string;
	node: TSESTree.JSXAttribute;
}

// Performance optimization: Cache expensive color detection results
const colorCache = new WeakMap<TSESTree.JSXElement, Set<string>>();
const multiColorCache = new WeakMap<TSESTree.JSXElement, boolean>();

const iconRules = {
	'single-svg-per-file': {
		meta: {
			type: 'problem' as const,
			docs: {
				description:
					'Ensure only one SVG icon per file. This improves code organization, makes icons easier to find and maintain, and enables better tree-shaking in production builds.',
				category: 'Best Practices',
				recommended: 'error',
				url: 'https://github.com/vertex-era/eslint-rules/blob/main/docs/rules/single-svg-per-file.md',
			},
			schema: [],
			messages: {
				multipleSvgs:
					'Multiple SVG icons found ({{count}} total). Each icon must be in its own file for better maintainability and tree-shaking. Consider splitting into separate icon files.',
			},
		},
		create(context: TSESLint.RuleContext<'multipleSvgs', never[]>) {
			let svgCount = 0;

			return {
				'JSXElement'(node: TSESTree.JSXElement) {
					try {
						// Validate node structure
						if (!validateJSXElement(node)) {
							return;
						}

						if (
							node.openingElement.name.type === 'JSXIdentifier' &&
							node.openingElement.name.name === 'svg'
						) {
							svgCount++;
							if (svgCount > 1) {
								context.report({
									node,
									messageId: 'multipleSvgs',
									data: { count: svgCount },
								});
							}
						}
					} catch (error) {
						// Log error but don't crash ESLint
						console.error('Error in single-svg-per-file rule:', error);
					}
				},
				'Program:exit'() {
					svgCount = 0;
				},
			};
		},
		defaultOptions: [],
	},

	'svg-currentcolor': {
		meta: {
			type: 'problem' as const,
			docs: {
				description:
					'Ensure single-color SVGs use currentColor. This allows icons to inherit the text color from their parent element, making them more flexible and easier to theme.',
				category: 'Best Practices',
				recommended: 'error',
				url: 'https://github.com/vertex-era/eslint-rules/blob/main/docs/rules/svg-currentcolor.md',
			},
			fixable: 'code' as const,
			schema: [],
			messages: {
				useCurrentColor:
					'Single-color SVG should use "currentColor" instead of {{attribute}}="{{value}}". This allows the icon to inherit the text color from its parent, making it more flexible and themeable.',
			},
		},
		create(context: TSESLint.RuleContext<'useCurrentColor', never[]>) {
			return {
				JSXElement(node: TSESTree.JSXElement) {
					try {
						// Validate node structure
						if (!validateJSXElement(node)) {
							return;
						}

						if (
							node.openingElement.name.type === 'JSXIdentifier' &&
							node.openingElement.name.name === 'svg'
						) {
							// Check cache first for performance
							let hasMultipleColors = multiColorCache.get(node);

							if (hasMultipleColors === undefined) {
								const colors = new Set<string>();
								hasMultipleColors = checkForMultipleColors(node, colors);

								// Cache the results
								colorCache.set(node, colors);
								multiColorCache.set(node, hasMultipleColors);
							}

							if (!hasMultipleColors) {
								const colorIssues = findColorAttributeIssues(node);

								colorIssues.forEach((issue) => {
									context.report({
										node: issue.node,
										messageId: 'useCurrentColor',
										data: {
											attribute: issue.attribute,
											value: issue.value,
										},
										fix(fixer) {
											if (!issue.node.value) return null;
											return fixer.replaceText(
												issue.node.value,
												'"currentColor"',
											);
										},
									});
								});
							}
						}
					} catch (error) {
						// Log error but don't crash ESLint
						console.error('Error in svg-currentcolor rule:', error);
					}
				},
			};
		},
		defaultOptions: [],
	},

	'memoized-export': {
		meta: {
			type: 'problem' as const,
			docs: {
				description:
					'Ensure icon components are memoized using React.memo. This prevents unnecessary re-renders when the icon is used in parent components, improving performance especially when icons are used frequently.',
				category: 'Best Practices',
				recommended: 'error',
				url: 'https://github.com/vertex-era/eslint-rules/blob/main/docs/rules/memoized-export.md',
			},
			fixable: 'code' as const,
			schema: [],
			messages: {
				memoizeExport:
					'Icon component "{{componentName}}" should be wrapped with React.memo to prevent unnecessary re-renders. Use: export default memo({{componentName}});',
			},
		},
		create(context: TSESLint.RuleContext<'memoizeExport', never[]>) {
			let exportNode: TSESTree.ExportDefaultDeclaration | null = null;

			return {
				'JSXElement'(node: TSESTree.JSXElement) {
					if (
						node.openingElement.name.type === 'JSXIdentifier' &&
						node.openingElement.name.name === 'svg'
					) {
						// If we found an SVG and we already saw an export, check it now
						if (exportNode) {
							checkExport(context, exportNode);
							exportNode = null; // Clear it so we don't check again
						}
					}
				},
				'ExportDefaultDeclaration'(node: TSESTree.ExportDefaultDeclaration) {
					// Store the export node to check later when we find an SVG
					exportNode = node;
				},
				'Program:exit'() {
					// Check the export at the end if we found an SVG
					if (exportNode) {
						checkExport(context, exportNode);
					}
				},
			};

			function checkExport(
				ctx: TSESLint.RuleContext<'memoizeExport', never[]>,
				node: TSESTree.ExportDefaultDeclaration,
			) {
				try {
					// Validate node structure
					if (!validateExportDefaultDeclaration(node)) {
						return;
					}

					// Check if already memoized
					const isMemoized =
						node.declaration.type === 'CallExpression' &&
						node.declaration.callee.type === 'Identifier' &&
						node.declaration.callee.name === 'memo';

					if (!isMemoized) {
						const componentName = getComponentName(node.declaration);

						if (componentName) {
							ctx.report({
								node,
								messageId: 'memoizeExport',
								data: { componentName },
								fix(fixer) {
									const sourceCode = ctx.sourceCode;
									const reactImport = getReactImport(node);

									// Add memo import if not already imported
									const fixes: TSESLint.RuleFix[] = [];

									if (
										!reactImport?.specifiers.some(
											(s) =>
												s.type === 'ImportSpecifier' &&
												s.imported.type === 'Identifier' &&
												s.imported.name === 'memo',
										)
									) {
										if (reactImport) {
											// Add memo to existing react import
											const withNamedImports = reactImport.specifiers.some(
												(s) => s.type === 'ImportSpecifier',
											);
											const lastSpecifier =
												reactImport.specifiers[
													reactImport.specifiers.length - 1
												];

											if (withNamedImports) {
												// Already has named imports, just add memo
												fixes.push(
													fixer.insertTextAfter(lastSpecifier, ', memo'),
												);
											} else {
												// Only has default import, need to add curly braces
												fixes.push(
													fixer.insertTextAfter(
														lastSpecifier,
														', { memo }',
													),
												);
											}
										} else {
											// Add new react import with memo
											fixes.push(
												fixer.insertTextBefore(
													sourceCode.ast.body[0],
													"import { memo } from 'react';\n",
												),
											);
										}
									}

									// For function declarations, we need to convert to a separate declaration
									if (node.declaration.type === 'FunctionDeclaration') {
										const functionText = sourceCode.getText(node.declaration);
										fixes.push(
											fixer.replaceText(
												node,
												`${functionText}\n\nexport default memo(${componentName});`,
											),
										);
									} else {
										// Wrap export with memo
										fixes.push(
											fixer.replaceText(
												node,
												`export default memo(${componentName});`,
											),
										);
									}

									return fixes;
								},
							});
						}
					}
				} catch (error) {
					// Log error but don't crash ESLint
					console.error('Error in memoized-export rule:', error);
				}
			}
		},
		defaultOptions: [],
	},
};

// Helper functions
function checkForMultipleColors(node: TSESTree.JSXElement, colors: Set<string>): boolean {
	// Early return: if we already have multiple colors, no need to check further
	if (colors.size > 1) {
		return true;
	}

	// Check attributes of current node - only if attributes exist
	const attributes = node.openingElement.attributes;
	if (attributes && attributes.length > 0) {
		for (const attr of attributes) {
			// Early continue: skip non-JSXAttribute nodes
			if (attr.type !== 'JSXAttribute') continue;

			// Early continue: only check fill and stroke attributes
			const attrName = attr.name.name;
			if (attrName !== 'fill' && attrName !== 'stroke') continue;

			// Early continue: skip attributes without values
			if (!attr.value) continue;

			const colorValue = getAttributeValue(attr.value);
			// Early continue: skip invalid or exempt color values
			if (!colorValue || colorValue === 'none' || colorValue === 'currentColor') {
				continue;
			}

			colors.add(colorValue);
			// Early return: if we already found multiple colors, no need to continue
			if (colors.size > 1) {
				return true;
			}
		}
	}

	// Recursively check children - only if children exist
	if (node.children && node.children.length > 0) {
		for (const child of node.children) {
			// Early continue: only check JSXElement children
			if (child.type !== 'JSXElement') continue;

			// Early return: stop traversal as soon as we find multiple colors
			if (checkForMultipleColors(child, colors)) {
				return true;
			}
		}
	}

	return colors.size > 1;
}

function findColorAttributeIssues(node: TSESTree.JSXElement): IColorIssue[] {
	const issues: IColorIssue[] = [];

	function traverse(currentNode: TSESTree.JSXElement) {
		const attributes = currentNode.openingElement.attributes;

		// Check attributes if they exist
		if (attributes && attributes.length > 0) {
			for (const attr of attributes) {
				// Early continue: skip non-JSXAttribute nodes
				if (attr.type !== 'JSXAttribute') continue;

				// Early continue: only check fill and stroke attributes
				const attrName = attr.name.name;
				if (attrName !== 'fill' && attrName !== 'stroke') continue;

				// Early continue: skip attributes without values
				if (!attr.value) continue;

				const value = getAttributeValue(attr.value);

				// Early continue: skip valid values
				if (
					!value ||
					value === 'currentColor' ||
					value === 'none' ||
					value.includes('url(')
				) {
					continue;
				}

				// Found an issue
				issues.push({
					attribute: attrName,
					value,
					node: attr,
				});
			}
		}

		// Traverse children only if they exist
		const children = currentNode.children;
		if (children && children.length > 0) {
			for (const child of children) {
				// Early continue: only traverse JSXElement children
				if (child.type !== 'JSXElement') continue;
				traverse(child);
			}
		}
	}

	traverse(node);
	return issues;
}

function getAttributeValue(value: TSESTree.JSXAttribute['value']): string | null {
	// Early return: null values
	if (!value) return null;

	// Early return: literal values (most common case)
	if (value.type === 'Literal') {
		return value.value as string;
	}

	// Skip expressions - they might be dynamic
	// Early return: expression containers
	if (value.type === 'JSXExpressionContainer') {
		return null;
	}

	// Early return: all other cases
	return null;
}

function getComponentName(
	declaration: TSESTree.ExportDefaultDeclaration['declaration'],
): string | null {
	// Early return: identifier (most common case)
	if (declaration.type === 'Identifier') {
		return declaration.name;
	}

	// Early return: function declaration with id
	if (declaration.type === 'FunctionDeclaration' && declaration.id) {
		return declaration.id.name;
	}

	// Early return: inline arrow functions or function expressions
	// We can't auto-fix because we don't have a component name to reference
	if (
		declaration.type === 'ArrowFunctionExpression' ||
		declaration.type === 'FunctionExpression'
	) {
		return null;
	}

	// Early return: all other cases
	return null;
}

function getReactImport(node: TSESTree.Node): TSESTree.ImportDeclaration | null {
	let current: TSESTree.Node | undefined = node;

	// Traverse up to find Program node - optimize by checking parent existence first
	while (current?.parent) {
		current = current.parent;
		// Early return: found Program node
		if (current.type === 'Program') {
			break;
		}
	}

	// Early return: no Program node found
	if (current?.type !== 'Program') {
		return null;
	}

	// Find React import - use for-of for early return capability
	const body = current.body;
	if (!body || body.length === 0) {
		return null;
	}

	for (const statement of body) {
		// Early continue: skip non-import declarations
		if (statement.type !== 'ImportDeclaration') continue;

		// Early return: found React import
		if (statement.source.value === 'react') {
			return statement;
		}
	}

	return null;
}

// eslint-disable-next-line custom/memoized-export
export default iconRules;
