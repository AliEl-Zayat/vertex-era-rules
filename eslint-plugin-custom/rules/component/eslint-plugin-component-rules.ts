import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { isReactComponent } from '../../utils/ast-helpers.js';

interface IComponentInfo {
	name: string;
	node: TSESTree.Node;
	isCompoundChild: boolean;
}

const componentRules = {
	'one-component-per-file': {
		meta: {
			type: 'problem' as const,
			docs: {
				description:
					'Enforce one component per file with explicit compound component patterns. This improves code organization, testability, and maintainability by keeping components focused and easy to locate.',
				category: 'Best Practices',
				recommended: 'error',
				url: 'https://github.com/vertex-era/eslint-rules/blob/main/docs/rules/one-component-per-file.md',
			},
			schema: [],
			messages: {
				multipleComponents:
					'File contains {{count}} component definitions. Only one component per file is allowed. Found: {{componentNames}}. Consider splitting into separate files or using the compound component pattern (e.g., Component.SubComponent = SubComponent).',
			},
		},
		create(context: TSESLint.RuleContext<'multipleComponents', never[]>) {
			const components: IComponentInfo[] = [];
			const compoundChildren = new Set<string>();

			return {
				// Detect compound component pattern: Component.SubComponent = SubComponent
				'AssignmentExpression'(node: TSESTree.AssignmentExpression) {
					try {
						// Check for pattern: Component.SubComponent = ...
						if (
							node.left.type === AST_NODE_TYPES.MemberExpression &&
							node.left.object.type === AST_NODE_TYPES.Identifier &&
							node.left.property.type === AST_NODE_TYPES.Identifier
						) {
							// Mark the right-hand side as a compound child
							if (node.right.type === AST_NODE_TYPES.Identifier) {
								compoundChildren.add(node.right.name);
							}
						}
					} catch (error) {
						console.error(
							'Error in one-component-per-file (AssignmentExpression):',
							error,
						);
					}
				},

				// Detect function declaration components
				'FunctionDeclaration'(node: TSESTree.FunctionDeclaration) {
					try {
						if (isReactComponent(node)) {
							const name = node.id?.name || 'anonymous';
							components.push({
								name,
								node,
								isCompoundChild: false,
							});
						}
					} catch (error) {
						console.error(
							'Error in one-component-per-file (FunctionDeclaration):',
							error,
						);
					}
				},

				// Detect variable declarator components (arrow functions, function expressions)
				'VariableDeclarator'(node: TSESTree.VariableDeclarator) {
					try {
						if (isReactComponent(node)) {
							const name =
								node.id.type === AST_NODE_TYPES.Identifier
									? node.id.name
									: 'anonymous';
							components.push({
								name,
								node,
								isCompoundChild: false,
							});
						}
					} catch (error) {
						console.error(
							'Error in one-component-per-file (VariableDeclarator):',
							error,
						);
					}
				},

				// Detect class component declarations
				'ClassDeclaration'(node: TSESTree.ClassDeclaration) {
					try {
						if (isReactComponent(node)) {
							const name = node.id?.name || 'anonymous';
							components.push({
								name,
								node,
								isCompoundChild: false,
							});
						}
					} catch (error) {
						console.error('Error in one-component-per-file (ClassDeclaration):', error);
					}
				},

				// After traversing the entire file, check component count
				'Program:exit'() {
					try {
						// Mark components that are compound children
						components.forEach((component) => {
							if (compoundChildren.has(component.name)) {
								component.isCompoundChild = true;
							}
						});

						// Filter out compound children
						const nonCompoundComponents = components.filter((c) => !c.isCompoundChild);

						// Report error if more than one non-compound component
						if (nonCompoundComponents.length > 1) {
							const componentNames = nonCompoundComponents
								.map((c) => c.name)
								.join(', ');

							// Report on the second component (first violation)
							context.report({
								node: nonCompoundComponents[1].node,
								messageId: 'multipleComponents',
								data: {
									count: nonCompoundComponents.length,
									componentNames,
								},
							});
						}
					} catch (error) {
						console.error('Error in one-component-per-file (Program:exit):', error);
					}
				},
			};
		},
		defaultOptions: [],
	},
};

// eslint-disable-next-line custom/memoized-export
export default componentRules;
