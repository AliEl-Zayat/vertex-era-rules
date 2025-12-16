import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../../utils/create-rule.js';
import {
	getAttributeName,
	getPropValue,
	isComponentReference,
	isInlineFunction,
	isInlineObject,
	isJSXElementValue,
	validateJSXAttributeStructure,
} from '../../utils/jsx-helpers.js';
import { hasExplicitReactNodeAnnotation, isReactNodeType } from '../../utils/type-helpers.js';

export const noInlineObjects = createRule({
	name: 'no-inline-objects',
	meta: {
		type: 'problem',
		docs: {
			description:
				'Prevent inline object literals in JSX props. Inline objects create new references on every render, causing unnecessary re-renders of child components. Extract objects to variables or useMemo for better performance.',
		},
		schema: [],
		messages: {
			noInlineObject:
				"Avoid inline object in prop '{{propName}}'. Inline objects create new references on every render, causing unnecessary re-renders. Extract to a variable, constant, or useMemo hook.",
		},
	},
	defaultOptions: [],
	create(context) {
		return {
			JSXAttribute(node: TSESTree.JSXAttribute) {
				try {
					if (!validateJSXAttributeStructure(node)) {
						return;
					}

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
					console.error('Error in no-inline-objects rule:', error);
				}
			},
		};
	},
});

export const noInlineFunctions = createRule({
	name: 'no-inline-functions',
	meta: {
		type: 'problem',
		docs: {
			description:
				'Prevent inline function declarations in JSX props. Inline functions create new references on every render, causing unnecessary re-renders of child components. Use useCallback or extract to component methods for better performance.',
		},
		schema: [],
		messages: {
			noInlineFunction:
				"Avoid inline function in prop '{{propName}}'. Inline functions create new references on every render, causing unnecessary re-renders. Extract to a useCallback hook or component method.",
		},
	},
	defaultOptions: [],
	create(context) {
		return {
			JSXAttribute(node: TSESTree.JSXAttribute) {
				try {
					if (!validateJSXAttributeStructure(node)) {
						return;
					}

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
					console.error('Error in no-inline-functions rule:', error);
				}
			},
		};
	},
});

export const reactNodePropNaming = createRule({
	name: 'react-node-prop-naming',
	meta: {
		type: 'problem',
		docs: {
			description:
				'Enforce PascalCase naming for props that are ReactNode or JSX.Element types, or receive JSX element values. This improves code readability and follows React conventions.',
		},
		schema: [],
		messages: {
			reactNodePropNaming:
				"Prop '{{propName}}' should be in PascalCase because it is a ReactNode or JSX.Element type, or receives JSX element values. Use '{{suggestedName}}' instead.",
		},
	},
	defaultOptions: [],
	create(context) {
		// Track props that receive JSX element values
		const propsWithJSXValues = new Set<string>();

		// Check if a name is PascalCase
		const isPascalCase = (name: string): boolean => {
			return /^[A-Z][a-zA-Z0-9]*$/.test(name);
		};

		// Convert to PascalCase
		const toPascalCase = (name: string): string => {
			if (name.length === 0) return name;
			return name.charAt(0).toUpperCase() + name.slice(1);
		};

		return {
			// Check function parameters for ReactNode/JSX.Element types
			'FunctionDeclaration,ArrowFunctionExpression,FunctionExpression'(
				node:
					| TSESTree.FunctionDeclaration
					| TSESTree.ArrowFunctionExpression
					| TSESTree.FunctionExpression
			) {
				try {
					if (!node.params || node.params.length === 0) {
						return;
					}

					// Handle destructured props
					for (const param of node.params) {
						if (param.type === 'ObjectPattern') {
							// Check if the ObjectPattern has a type annotation
							const typeAnnotation = param.typeAnnotation;
							let typeLiteral: TSESTree.TSTypeLiteral | TSESTree.TSTypeReference | null = null;

							if (typeAnnotation?.typeAnnotation) {
								const annotation = typeAnnotation.typeAnnotation;
								if (annotation.type === 'TSTypeLiteral') {
									typeLiteral = annotation;
								} else if (
									annotation.type === 'TSTypeReference' &&
									annotation.typeName.type === 'Identifier'
								) {
									// Could be a type alias, we'll use type checker for this
									typeLiteral = annotation;
								}
							}

							for (const property of param.properties) {
								if (property.type === 'Property' && property.key.type === 'Identifier') {
									const propName = property.key.name;
									const propNode = property.value;

									// Check if prop has ReactNode/JSX.Element type
									if (propNode.type === 'Identifier') {
										let isReactNode = false;

										// First, try to check type annotation from ObjectPattern
										if (typeLiteral?.type === 'TSTypeLiteral') {
											// Look for the property in the type literal
											for (const member of typeLiteral.members) {
												if (
													member.type === 'TSPropertySignature' &&
													member.key.type === 'Identifier' &&
													member.key.name === propName
												) {
													// Check if the property signature has ReactNode type
													isReactNode = hasExplicitReactNodeAnnotation(member);
													break;
												}
											}
										}

										// Fallback: use type checker
										if (!isReactNode) {
											isReactNode = isReactNodeType(propNode, context);
										}

										if (isReactNode && !isPascalCase(propName)) {
											const suggestedName = toPascalCase(propName);
											context.report({
												node: property.key,
												messageId: 'reactNodePropNaming',
												data: {
													propName,
													suggestedName,
												},
											});
										}
									}
								}
							}
						} else if (param.type === 'Identifier') {
							// Single parameter (props object)
							// We can't check individual props here, but we'll check at usage sites
						}
					}
				} catch (error) {
					console.error('Error in react-node-prop-naming rule:', error);
				}
			},

			// Track JSX element values passed to props
			JSXAttribute(node: TSESTree.JSXAttribute) {
				try {
					if (!validateJSXAttributeStructure(node)) {
						return;
					}

					const propName = getAttributeName(node);
					if (!propName) {
						return;
					}

					// Check if prop receives a JSX element value
					if (isJSXElementValue(node)) {
						propsWithJSXValues.add(propName);

						// Check if prop name is not PascalCase
						if (!isPascalCase(propName)) {
							const suggestedName = toPascalCase(propName);
							context.report({
								node: node.name,
								messageId: 'reactNodePropNaming',
								data: {
									propName,
									suggestedName,
								},
							});
						}
					}
				} catch (error) {
					console.error('Error in react-node-prop-naming rule:', error);
				}
			},
		};
	},
});

export const jsxElementComponentMismatch = createRule({
	name: 'jsx-element-component-mismatch',
	meta: {
		type: 'problem',
		docs: {
			description:
				'Detect when JSX elements are passed as props but used as components (or vice versa). JSX elements should be used as values {prop}, while component references should be used as components <Prop />.',
		},
		schema: [],
		messages: {
			jsxElementUsedAsComponent:
				"Prop '{{propName}}' was passed a JSX element (e.g., <Icon />) but is being used as a component (<{{propName}} />). Use it as a value instead: {{{{propName}}}}.",
			componentUsedAsValue:
				"Prop '{{propName}}' was passed a component reference (e.g., Icon) but is being used as a value ({{{{propName}}}}). Use it as a component instead: <{{propName}} />.",
		},
	},
	defaultOptions: [],
	create(context) {
		// Track prop values passed to components: component name -> prop name -> 'jsx' | 'component'
		const componentPropValues = new Map<string, Map<string, 'jsx' | 'component'>>();
		// Track prop usages within components: component node -> prop name -> usage node
		const componentPropUsages = new Map<
			TSESTree.Node,
			Map<string, { node: TSESTree.Node; type: 'jsx' | 'component' }>
		>();

		// Get component name from JSX element
		const getComponentName = (node: TSESTree.JSXOpeningElement): string | null => {
			if (node.name.type === 'JSXIdentifier') {
				return node.name.name;
			}
			return null;
		};

		// Find the component function that contains a node
		const findContainingComponent = (node: TSESTree.Node): TSESTree.Node | null => {
			let current: TSESTree.Node | undefined = node;
			while (current) {
				if (
					current.type === 'FunctionDeclaration' ||
					current.type === 'ArrowFunctionExpression' ||
					current.type === 'FunctionExpression'
				) {
					return current;
				}
				current = (current as any).parent;
			}
			return null;
		};

		// Get props from component parameters
		const getComponentProps = (
			node:
				| TSESTree.FunctionDeclaration
				| TSESTree.ArrowFunctionExpression
				| TSESTree.FunctionExpression
		): string[] => {
			const props: string[] = [];
			for (const param of node.params) {
				if (param.type === 'ObjectPattern') {
					for (const property of param.properties) {
						if (property.type === 'Property' && property.key.type === 'Identifier') {
							props.push(property.key.name);
						}
					}
				}
			}
			return props;
		};

		return {
			// Track when props receive JSX elements or component references at call sites
			JSXOpeningElement(node: TSESTree.JSXOpeningElement) {
				try {
					const componentName = getComponentName(node);
					if (!componentName) {
						return;
					}

					// Track props passed to this component
					if (!componentPropValues.has(componentName)) {
						componentPropValues.set(componentName, new Map());
					}

					const propValues = componentPropValues.get(componentName)!;

					for (const attr of node.attributes) {
						if (attr.type === 'JSXAttribute') {
							const propName = getAttributeName(attr);
							if (!propName) {
								continue;
							}

							// Check if prop receives a JSX element
							if (isJSXElementValue(attr)) {
								propValues.set(propName, 'jsx');
							}
							// Check if prop receives a component reference
							else if (isComponentReference(attr)) {
								propValues.set(propName, 'component');
							}
						}
					}
				} catch (error) {
					console.error('Error in jsx-element-component-mismatch rule:', error);
				}
			},

			// Track when props are used as components within a component body
			JSXElement(node: TSESTree.JSXElement) {
				try {
					if (!node.openingElement || !node.openingElement.name) {
						return;
					}

					if (node.openingElement.name.type === 'JSXIdentifier') {
						const propName = node.openingElement.name.name;
						const component = findContainingComponent(node);

						if (component) {
							const componentProps = getComponentProps(component as any);
							if (componentProps.includes(propName)) {
								if (!componentPropUsages.has(component)) {
									componentPropUsages.set(component, new Map());
								}

								const usages = componentPropUsages.get(component)!;
								usages.set(propName, {
									node: node.openingElement.name,
									type: 'component',
								});
							}
						}
					}
				} catch (error) {
					console.error('Error in jsx-element-component-mismatch rule:', error);
				}
			},

			// Track when props are used as values within a component body
			JSXExpressionContainer(node: TSESTree.JSXExpressionContainer) {
				try {
					if (node.expression.type === 'Identifier') {
						const propName = node.expression.name;
						const component = findContainingComponent(node);

						if (component) {
							const componentProps = getComponentProps(component as any);
							if (componentProps.includes(propName)) {
								if (!componentPropUsages.has(component)) {
									componentPropUsages.set(component, new Map());
								}

								const usages = componentPropUsages.get(component)!;
								usages.set(propName, { node: node.expression, type: 'jsx' });
							}
						}
					}
				} catch (error) {
					console.error('Error in jsx-element-component-mismatch rule:', error);
				}
			},

			// Report mismatches at the end of the program
			'Program:exit'() {
				try {
					// For each component, check if props are used correctly
					for (const [component, propUsages] of componentPropUsages.entries()) {
						// Try to find the component name
						let componentName: string | null = null;

						if (component.type === 'FunctionDeclaration' && component.id) {
							componentName = component.id.name;
						} else if (
							component.type === 'ArrowFunctionExpression' ||
							component.type === 'FunctionExpression'
						) {
							// For arrow functions and function expressions, check parent
							let parent = (component as any).parent;
							while (parent) {
								if (parent.type === 'VariableDeclarator' && parent.id.type === 'Identifier') {
									componentName = parent.id.name;
									break;
								}
								if (parent.type === 'FunctionDeclaration' && parent.id) {
									componentName = parent.id.name;
									break;
								}
								parent = parent.parent;
							}
						}

						if (!componentName) {
							continue;
						}

						// Get prop values passed to this component
						const propValues = componentPropValues.get(componentName);
						if (!propValues) {
							continue;
						}

						// Check each prop usage
						for (const [propName, usage] of propUsages.entries()) {
							const valueType = propValues.get(propName);

							if (valueType) {
								// JSX element passed but used as component
								if (valueType === 'jsx' && usage.type === 'component') {
									context.report({
										node: usage.node,
										messageId: 'jsxElementUsedAsComponent',
										data: { propName },
									});
								}
								// Component reference passed but used as value
								else if (valueType === 'component' && usage.type === 'jsx') {
									context.report({
										node: usage.node,
										messageId: 'componentUsedAsValue',
										data: { propName },
									});
								}
							}
						}
					}
				} catch (error) {
					console.error('Error in jsx-element-component-mismatch rule:', error);
				}
			},
		};
	},
});

export default {
	'no-inline-objects': noInlineObjects,
	'no-inline-functions': noInlineFunctions,
	'react-node-prop-naming': reactNodePropNaming,
	'jsx-element-component-mismatch': jsxElementComponentMismatch,
};
