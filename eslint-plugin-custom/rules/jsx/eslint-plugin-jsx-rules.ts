import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import {
	getAttributeName,
	getPropValue,
	isInlineFunction,
	isInlineObject,
	validateJSXAttributeStructure,
} from '../../utils/jsx-helpers';

const jsxRules = {
	'no-inline-objects': {
		meta: {
			type: 'problem' as const,
			docs: {
				description:
					'Prevent inline object literals in JSX props. Inline objects create new references on every render, causing unnecessary re-renders of child components. Extract objects to variables or useMemo for better performance.',
				category: 'Best Practices',
				recommended: 'error',
				url: 'https://github.com/vertex-era/eslint-rules/blob/main/docs/rules/no-inline-objects.md',
			},
			schema: [],
			messages: {
				noInlineObject:
					"Avoid inline object in prop '{{propName}}'. Inline objects create new references on every render, causing unnecessary re-renders. Extract to a variable, constant, or useMemo hook.",
			},
		},
		create(context: TSESLint.RuleContext<'noInlineObject', never[]>) {
			return {
				JSXAttribute(node: TSESTree.JSXAttribute) {
					try {
						// Validate node structure using jsx-helpers
						if (!validateJSXAttributeStructure(node)) {
							return;
						}

						// Check if the attribute value is an inline object using jsx-helpers
						if (isInlineObject(node)) {
							const propName = getAttributeName(node) || 'unknown';
							const propValue = getPropValue(node);
							if (propValue) {
								context.report({
									node: propValue,
									messageId: 'noInlineObject',
									data: { propName },
								});
							}
						}
					} catch (error) {
						// Log error but don't crash ESLint
						console.error('Error in no-inline-objects rule:', error);
					}
				},
			};
		},
		defaultOptions: [],
	},

	'no-inline-functions': {
		meta: {
			type: 'problem' as const,
			docs: {
				description:
					'Prevent inline function declarations in JSX props. Inline functions create new references on every render, causing unnecessary re-renders of child components. Use useCallback or extract to component methods for better performance.',
				category: 'Best Practices',
				recommended: 'error',
				url: 'https://github.com/vertex-era/eslint-rules/blob/main/docs/rules/no-inline-functions.md',
			},
			schema: [],
			messages: {
				noInlineFunction:
					"Avoid inline function in prop '{{propName}}'. Inline functions create new references on every render, causing unnecessary re-renders. Extract to a useCallback hook or component method.",
			},
		},
		create(context: TSESLint.RuleContext<'noInlineFunction', never[]>) {
			return {
				JSXAttribute(node: TSESTree.JSXAttribute) {
					try {
						// Validate node structure using jsx-helpers
						if (!validateJSXAttributeStructure(node)) {
							return;
						}

						// Check if the attribute value is an inline function using jsx-helpers
						if (isInlineFunction(node)) {
							const propName = getAttributeName(node) || 'unknown';
							const propValue = getPropValue(node);
							if (propValue) {
								context.report({
									node: propValue,
									messageId: 'noInlineFunction',
									data: { propName },
								});
							}
						}
					} catch (error) {
						// Log error but don't crash ESLint
						console.error('Error in no-inline-functions rule:', error);
					}
				},
			};
		},
		defaultOptions: [],
	},
};

// eslint-disable-next-line custom/memoized-export
export default jsxRules;
