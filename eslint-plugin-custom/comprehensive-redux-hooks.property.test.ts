import fc from 'fast-check';
import { describe, it } from 'vitest';

import { runRule } from './test-utils.js';

/**
 * Feature: comprehensive-rule-verification, Property 4: Direct Redux hooks detection
 * For any code containing useSelector or useDispatch calls, the Redux hooks rule should detect a violation.
 * Validates: Requirements 1.4
 */
describe('Property 4: Direct Redux hooks detection', () => {
	// Rule that mimics no-restricted-syntax for Redux hooks
	const noRestrictedSyntaxRule = {
		meta: {
			type: 'suggestion' as const,
			docs: {
				description: 'Disallow specified syntax patterns',
			},
			schema: [],
			messages: {
				restrictedUseSelector: 'Use useAppSelector instead of useSelector',
				restrictedUseDispatch: 'Use useAppDispatch instead of useDispatch',
			},
		},
		create(context: any) {
			return {
				CallExpression(node: any) {
					if (node.callee.type === 'Identifier' && node.callee.name === 'useSelector') {
						context.report({
							node,
							messageId: 'restrictedUseSelector',
						});
					}
					if (node.callee.type === 'Identifier' && node.callee.name === 'useDispatch') {
						context.report({
							node,
							messageId: 'restrictedUseDispatch',
						});
					}
				},
			};
		},
	};

	// Rule that mimics no-restricted-imports for Redux hooks
	const noRestrictedImportsRule = {
		meta: {
			type: 'suggestion' as const,
			docs: {
				description: 'Disallow specified imports',
			},
			schema: [],
			messages: {
				restrictedImport:
					"Use 'useAppSelector' and 'useAppDispatch' instead for proper typing.",
			},
		},
		create(context: any) {
			return {
				ImportDeclaration(node: any) {
					if (node.source.value === 'react-redux') {
						const restrictedNames = ['useSelector', 'useDispatch'];
						for (const specifier of node.specifiers) {
							if (
								specifier.type === 'ImportSpecifier' &&
								restrictedNames.includes(specifier.imported.name)
							) {
								context.report({
									node: specifier,
									messageId: 'restrictedImport',
								});
							}
						}
					}
				},
			};
		},
	};

	// Generator for Redux hook names
	const reduxHook = fc.constantFrom('useSelector', 'useDispatch');

	// Generator for selector functions
	const selectorFunction = fc.oneof(
		fc.constant('state => state.data'),
		fc.constant('state => state.user'),
		fc.constant('state => state.items'),
		fc.constant('(state) => state.config'),
		fc.constant('(state) => state.auth.token'),
	);

	// Generator for variable names
	const variableName = fc.oneof(
		fc.constant('data'),
		fc.constant('dispatch'),
		fc.constant('value'),
		fc.constant('result'),
		fc.constant('selector'),
	);

	it('should detect useSelector usage with any selector function', { timeout: 10000 }, () => {
		fc.assert(
			fc.property(selectorFunction, variableName, (selector, varName) => {
				const code = `const ${varName} = useSelector(${selector});`;
				const messages = runRule(noRestrictedSyntaxRule, code);

				// Should report at least one error
				return messages.length > 0 && messages[0].message.includes('useAppSelector');
			}),
			{ numRuns: 100 },
		);
	});

	it('should detect useDispatch usage', () => {
		fc.assert(
			fc.property(variableName, (varName) => {
				const code = `const ${varName} = useDispatch();`;
				const messages = runRule(noRestrictedSyntaxRule, code);

				// Should report at least one error
				return messages.length > 0 && messages[0].message.includes('useAppDispatch');
			}),
			{ numRuns: 100 },
		);
	});

	it('should detect any direct Redux hook usage', () => {
		fc.assert(
			fc.property(reduxHook, variableName, (hook, varName) => {
				const arg = hook === 'useSelector' ? 'state => state.data' : '';
				const code = `const ${varName} = ${hook}(${arg});`;
				const messages = runRule(noRestrictedSyntaxRule, code);

				// Should report at least one error
				return messages.length > 0 && messages[0].message.includes('useApp');
			}),
			{ numRuns: 100 },
		);
	});

	it('should detect importing useSelector from react-redux', () => {
		fc.assert(
			fc.property(fc.constant('useSelector'), () => {
				const code = `import { useSelector } from 'react-redux';`;
				const messages = runRule(noRestrictedImportsRule, code);

				// Should report at least one error
				return messages.length > 0 && messages[0].message.includes('useApp');
			}),
			{ numRuns: 100 },
		);
	});

	it('should detect importing useDispatch from react-redux', () => {
		fc.assert(
			fc.property(fc.constant('useDispatch'), () => {
				const code = `import { useDispatch } from 'react-redux';`;
				const messages = runRule(noRestrictedImportsRule, code);

				// Should report at least one error
				return messages.length > 0 && messages[0].message.includes('useApp');
			}),
			{ numRuns: 100 },
		);
	});

	it('should detect importing any restricted Redux hook', () => {
		fc.assert(
			fc.property(reduxHook, (hook) => {
				const code = `import { ${hook} } from 'react-redux';`;
				const messages = runRule(noRestrictedImportsRule, code);

				// Should report at least one error
				return messages.length > 0 && messages[0].message.includes('useApp');
			}),
			{ numRuns: 100 },
		);
	});

	it('should detect Redux hooks in different code contexts', () => {
		fc.assert(
			fc.property(reduxHook, (hook) => {
				const arg = hook === 'useSelector' ? 'state => state.data' : '';
				const contexts = [
					`const value = ${hook}(${arg});`,
					`function Component() { const value = ${hook}(${arg}); }`,
					`const Component = () => { const value = ${hook}(${arg}); };`,
					`export const Component = () => { const value = ${hook}(${arg}); return null; };`,
				];

				// All contexts should detect the Redux hook usage
				return contexts.every((code) => {
					const messages = runRule(noRestrictedSyntaxRule, code);
					return messages.length > 0 && messages[0].message.includes('useApp');
				});
			}),
			{ numRuns: 100 },
		);
	});

	it('should allow custom hooks (useAppSelector, useAppDispatch)', () => {
		fc.assert(
			fc.property(fc.constantFrom('useAppSelector', 'useAppDispatch'), (hook) => {
				const arg = hook === 'useAppSelector' ? 'state => state.data' : '';
				const code = `const value = ${hook}(${arg});`;
				const messages = runRule(noRestrictedSyntaxRule, code);

				// Should not report any errors for custom hooks
				return messages.length === 0;
			}),
			{ numRuns: 100 },
		);
	});

	it('should allow importing other hooks from react-redux', () => {
		fc.assert(
			fc.property(
				fc.constantFrom('Provider', 'connect', 'batch', 'shallowEqual'),
				(hookName) => {
					const code = `import { ${hookName} } from 'react-redux';`;
					const messages = runRule(noRestrictedImportsRule, code);

					// Should not report any errors for non-restricted imports
					return messages.length === 0;
				},
			),
			{ numRuns: 100 },
		);
	});

	it('should detect multiple useSelector calls', () => {
		fc.assert(
			fc.property(fc.array(selectorFunction, { minLength: 2, maxLength: 5 }), (selectors) => {
				const calls = selectors.map((sel, i) => `const data${i} = useSelector(${sel});`);
				const code = calls.join('\n');
				const messages = runRule(noRestrictedSyntaxRule, code);

				// Should report one error per useSelector call
				return (
					messages.length === selectors.length &&
					messages.every((m) => m.message.includes('useAppSelector'))
				);
			}),
			{ numRuns: 100 },
		);
	});

	it('should detect multiple useDispatch calls', () => {
		fc.assert(
			fc.property(fc.integer({ min: 2, max: 5 }), (count) => {
				const calls = Array.from(
					{ length: count },
					(_, i) => `const dispatch${i} = useDispatch();`,
				);
				const code = calls.join('\n');
				const messages = runRule(noRestrictedSyntaxRule, code);

				// Should report one error per useDispatch call
				return (
					messages.length === count &&
					messages.every((m) => m.message.includes('useAppDispatch'))
				);
			}),
			{ numRuns: 100 },
		);
	});
});
