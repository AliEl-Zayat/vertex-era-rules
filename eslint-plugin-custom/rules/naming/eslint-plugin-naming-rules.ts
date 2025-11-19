import type { TSESTree } from '@typescript-eslint/utils';
import { ESLintUtils } from '@typescript-eslint/utils';

import { isIdentifier, isVariableDeclarator } from '../../utils/ast-helpers';
import {
	hasExplicitBooleanAnnotation as checkHasExplicitBooleanAnnotation,
	isBooleanType as checkIsBooleanType,
} from '../../utils/type-helpers';

const createRule = ESLintUtils.RuleCreator(
	(name) => `https://github.com/your-org/eslint-plugin-custom/blob/main/docs/rules/${name}.md`,
);

type TMessageIds = 'booleanNaming';
type TOptions = [
	{
		prefix?: string;
		allowedPrefixes?: string[];
	}?,
];

const namingRules = {
	'boolean-naming-convention': createRule<TOptions, TMessageIds>({
		name: 'boolean-naming-convention',
		meta: {
			type: 'suggestion',
			docs: {
				description:
					'Enforce boolean variables to follow naming convention with prefixes: is, as, or with (e.g., isEnabled, asBoolean, withFlag). This makes code more readable by clearly indicating that a variable holds a boolean value.',
				url: 'https://github.com/vertex-era/eslint-rules/blob/main/docs/rules/boolean-naming-convention.md',
			},
			schema: [
				{
					type: 'object',
					properties: {
						prefix: {
							type: 'string',
							default: 'is',
						},
						allowedPrefixes: {
							type: 'array',
							items: {
								type: 'string',
							},
						},
					},
					additionalProperties: false,
				},
			],
			messages: {
				booleanNaming:
					"Boolean variable '{{name}}' should start with one of [{{prefixes}}] followed by a capital letter for better readability. Example: '{{prefix}}{{suggestedName}}'",
			},
		},
		defaultOptions: [{ prefix: 'is', allowedPrefixes: ['as', 'with'] }],
		create(context) {
			const options = context.options[0] || {};
			const prefix = options.prefix || 'is';
			const allowedPrefixes = options.allowedPrefixes || [];
			const allPrefixes = [prefix, ...allowedPrefixes];

			function checkBooleanNaming(name: string, node: TSESTree.Node) {
				// Early return: check if name follows the convention
				// Optimize by checking the most common prefix first (usually 'is')
				const primaryPrefix = allPrefixes[0];
				if (name.length > primaryPrefix.length) {
					// Check if starts with primary prefix and next char is uppercase
					const nextChar = name.charAt(primaryPrefix.length);
					if (name.startsWith(primaryPrefix) && nextChar >= 'A' && nextChar <= 'Z') {
						return;
					}

					// Check other prefixes if primary didn't match
					for (let i = 1; i < allPrefixes.length; i++) {
						const p = allPrefixes[i];
						if (name.length > p.length) {
							const nextCharAlt = name.charAt(p.length);
							if (name.startsWith(p) && nextCharAlt >= 'A' && nextCharAlt <= 'Z') {
								return;
							}
						}
					}
				}

				// No valid prefix found, report error
				// Generate suggested name
				const suggestedName = name.charAt(0).toUpperCase() + name.slice(1);

				context.report({
					node,
					messageId: 'booleanNaming',
					data: {
						name,
						prefix,
						prefixes: allPrefixes.map((p) => `'${p}'`).join(', '),
						suggestedName,
					},
				});
			}

			function isBooleanType(node: TSESTree.Node): boolean {
				return checkIsBooleanType(node, context);
			}

			function hasExplicitBooleanAnnotation(node: TSESTree.Node): boolean {
				return checkHasExplicitBooleanAnnotation(node);
			}

			return {
				VariableDeclarator(node: TSESTree.VariableDeclarator) {
					try {
						// Validate node structure
						if (!isVariableDeclarator(node) || !node.id) {
							return;
						}

						if (isIdentifier(node.id)) {
							const name = node.id.name;

							// Check explicit type annotation first
							if (hasExplicitBooleanAnnotation(node.id)) {
								checkBooleanNaming(name, node.id);
							} else if (node.init && isBooleanType(node.init)) {
								// Check inferred type from initialization
								checkBooleanNaming(name, node.id);
							}
						}
					} catch (error) {
						// Log error but don't crash ESLint
						console.error(
							'Error in boolean-naming-convention rule (VariableDeclarator):',
							error,
						);
					}
				},

				FunctionDeclaration(node: TSESTree.FunctionDeclaration) {
					try {
						// Early return: validate params exist (params is always an array in AST)
						if (!node.params || node.params.length === 0) {
							return;
						}

						for (const param of node.params) {
							// Early continue: skip non-identifier params
							if (!isIdentifier(param)) continue;

							// Check annotation and naming
							if (hasExplicitBooleanAnnotation(param)) {
								checkBooleanNaming(param.name, param);
							}
						}
					} catch (error) {
						// Log error but don't crash ESLint
						console.error(
							'Error in boolean-naming-convention rule (FunctionDeclaration):',
							error,
						);
					}
				},

				ArrowFunctionExpression(node: TSESTree.ArrowFunctionExpression) {
					try {
						// Early return: validate params exist (params is always an array in AST)
						if (!node.params || node.params.length === 0) {
							return;
						}

						for (const param of node.params) {
							// Early continue: skip non-identifier params
							if (!isIdentifier(param)) continue;

							// Check annotation and naming
							if (hasExplicitBooleanAnnotation(param)) {
								checkBooleanNaming(param.name, param);
							}
						}
					} catch (error) {
						// Log error but don't crash ESLint
						console.error(
							'Error in boolean-naming-convention rule (ArrowFunctionExpression):',
							error,
						);
					}
				},

				FunctionExpression(node: TSESTree.FunctionExpression) {
					try {
						// Early return: validate params exist (params is always an array in AST)
						if (!node.params || node.params.length === 0) {
							return;
						}

						for (const param of node.params) {
							// Early continue: skip non-identifier params
							if (!isIdentifier(param)) continue;

							// Check annotation and naming
							if (hasExplicitBooleanAnnotation(param)) {
								checkBooleanNaming(param.name, param);
							}
						}
					} catch (error) {
						// Log error but don't crash ESLint
						console.error(
							'Error in boolean-naming-convention rule (FunctionExpression):',
							error,
						);
					}
				},

				TSPropertySignature(node: TSESTree.TSPropertySignature) {
					try {
						// Validate node structure
						if (!node.key || !node.typeAnnotation) {
							return;
						}

						if (
							isIdentifier(node.key) &&
							node.typeAnnotation.typeAnnotation.type === 'TSBooleanKeyword'
						) {
							checkBooleanNaming(node.key.name, node.key);
						}
					} catch (error) {
						// Log error but don't crash ESLint
						console.error(
							'Error in boolean-naming-convention rule (TSPropertySignature):',
							error,
						);
					}
				},
			};
		},
	}),
};

// eslint-disable-next-line custom/memoized-export
export default namingRules;
