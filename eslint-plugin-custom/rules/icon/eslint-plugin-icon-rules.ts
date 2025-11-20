import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import {
	addTypeAnnotation,
	analyzeReactImport,
	detectIconEnvironment,
	getTypeAnnotationStrategy,
	selectMemoStrategy,
	updateImports,
	validateExportDefaultDeclaration,
	validateJSXElement,
} from '../../utils/ast-helpers.js';

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
			let svgNode: TSESTree.JSXElement | null = null;

			return {
				'JSXElement'(node: TSESTree.JSXElement) {
					if (
						node.openingElement.name.type === 'JSXIdentifier' &&
						(node.openingElement.name.name === 'svg' ||
							node.openingElement.name.name === 'Svg')
					) {
						// Store the SVG node for environment detection
						svgNode = node;

						// If we found an SVG and we already saw an export, check it now
						if (exportNode) {
							checkExport(context, exportNode, svgNode);
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
						checkExport(context, exportNode, svgNode);
					}
				},
			};

			function checkExport(
				ctx: TSESLint.RuleContext<'memoizeExport', never[]>,
				node: TSESTree.ExportDefaultDeclaration,
				svg: TSESTree.JSXElement | null,
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
									const programNode = sourceCode.ast;

									// Step 1: Analyze React import style
									const importAnalysis = analyzeReactImport(programNode);

									// Step 2: Detect icon environment (React web vs React Native)
									const envDetection = detectIconEnvironment(programNode, svg || undefined);

									// Step 3: Select memo strategy
									const memoStrategy = selectMemoStrategy(importAnalysis);

									// Step 4: Get type annotation strategy
									const typeStrategy = getTypeAnnotationStrategy(
										envDetection.environment,
										importAnalysis.style,
									);

									// Step 5: Generate all fixes
									const fixes: TSESLint.RuleFix[] = [];

									// Step 5a: Update imports (add memo if needed)
									const importUpdate = updateImports(
										memoStrategy,
										importAnalysis.importNode,
										programNode,
									);

									// Convert import update fixes to RuleFix format
									importUpdate.fixes.forEach((fix) => {
										fixes.push(fixer.replaceTextRange(fix.range, fix.text));
									});

									// Step 5b: Handle export wrapping and type annotations
									// For function declarations, we need special handling to avoid overlapping fixes
									if (node.declaration.type === 'FunctionDeclaration') {
										const functionNode = node.declaration;
										
										// Build the new function declaration with type annotation
										let functionText = sourceCode.getText(functionNode);
										
										// Add type annotation if the function has parameters
										if (functionNode.params.length > 0) {
											const firstParam = functionNode.params[0];
											if (
												firstParam.type === 'Identifier' &&
												!firstParam.typeAnnotation
											) {
												// Find the parameter in the function text and add type annotation
												// We need to match the parameter specifically within the parameter list
												const paramName = firstParam.name;
												// Match the parameter within parentheses, handling optional whitespace
												const paramPattern = new RegExp(`\\(\\s*${paramName}\\s*\\)`);
												functionText = functionText.replace(
													paramPattern,
													`(${paramName}: ${typeStrategy.propsType})`,
												);
											}
										} else {
											// If no parameters, add props parameter with type
											// Match the empty parameter list
											const emptyParamsPattern = /\(\s*\)/;
											functionText = functionText.replace(
												emptyParamsPattern,
												`(props: ${typeStrategy.propsType})`,
											);
										}
										
										// Replace the entire export statement with function + export
										fixes.push(
											fixer.replaceText(
												node,
												`${functionText}\n\nexport default ${memoStrategy.memoReference}(${componentName});`,
											),
										);
									} else {
										// For identifier exports, add type annotation to the component definition
										const componentNode = getComponentNode(node.declaration);
										if (componentNode) {
											const typeAnnotationResult = addTypeAnnotation(
												componentNode,
												typeStrategy,
												programNode,
											);

											// Convert type annotation fixes to RuleFix format
											typeAnnotationResult.fixes.forEach((fix) => {
												fixes.push(
													fixer.replaceTextRange(fix.range, fix.text),
												);
											});
										}
										
										// Wrap export with memo using the selected memo reference
										fixes.push(
											fixer.replaceText(
												node,
												`export default ${memoStrategy.memoReference}(${componentName});`,
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

function getComponentNode(
	declaration: TSESTree.ExportDefaultDeclaration['declaration'],
): TSESTree.Node | null {
	// For identifier exports, we need to find the actual component definition
	if (declaration.type === 'Identifier') {
		// We need to traverse up to find the variable declaration or function declaration
		// For now, return the identifier itself - the type annotation logic will handle it
		let current: TSESTree.Node | undefined = declaration;

		// Traverse up to find Program node
		while (current?.parent) {
			current = current.parent;
			if (current.type === 'Program') {
				break;
			}
		}

		if (current?.type !== 'Program') {
			return null;
		}

		// Find the variable or function declaration with this name
		for (const statement of current.body) {
			// Check variable declarations
			if (statement.type === 'VariableDeclaration') {
				for (const declarator of statement.declarations) {
					if (
						declarator.id.type === 'Identifier' &&
						declarator.id.name === declaration.name
					) {
						return declarator;
					}
				}
			}

			// Check function declarations
			if (
				statement.type === 'FunctionDeclaration' &&
				statement.id &&
				statement.id.name === declaration.name
			) {
				return statement;
			}
		}

		return null;
	}

	// For function declarations, return the declaration itself
	if (declaration.type === 'FunctionDeclaration') {
		return declaration;
	}

	// For inline arrow functions or function expressions, we can't add type annotations
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
