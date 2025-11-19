import type { TSESTree } from '@typescript-eslint/utils';
import { ESLintUtils } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
	(name) => `https://github.com/your-org/eslint-plugin-custom/blob/main/docs/${name}.md`,
);

/**
 * Rule: no-nested-ternary
 * Prevents nested ternary operators to improve code readability
 */
export const noNestedTernary = createRule({
	name: 'no-nested-ternary',
	meta: {
		type: 'suggestion',
		docs: {
			description:
				'Disallow nested ternary operators. Nested ternaries are difficult to read and understand. Use if-else statements or extract the logic into a well-named function for better code clarity.',
			url: 'https://github.com/vertex-era/eslint-rules/blob/main/docs/rules/no-nested-ternary.md',
		},
		messages: {
			noNestedTernary:
				'Nested ternary operators reduce code readability. Refactor to if-else statements or extract to a descriptive function (e.g., getStatusColor, calculateDiscount).',
		},
		schema: [],
	},
	defaultOptions: [],
	create(context) {
		/**
		 * Check if a node contains a nested ternary operator
		 */
		function containsNestedTernary(node: TSESTree.Node): boolean {
			if (node.type === 'ConditionalExpression') {
				return true;
			}

			// Handle parenthesized expressions
			if (node.type === 'TSAsExpression' || node.type === 'TSTypeAssertion') {
				return containsNestedTernary(node.expression);
			}

			return false;
		}

		/**
		 * Recursively check consequent and alternate branches for nested ternaries
		 */
		function hasNestedTernary(node: TSESTree.ConditionalExpression): boolean {
			return containsNestedTernary(node.consequent) || containsNestedTernary(node.alternate);
		}

		return {
			ConditionalExpression(node: TSESTree.ConditionalExpression) {
				if (hasNestedTernary(node)) {
					context.report({
						node,
						messageId: 'noNestedTernary',
					});
				}
			},
		};
	},
});

export default {
	'no-nested-ternary': noNestedTernary,
};
