import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import { matchesServicePath } from '../../utils/ast-helpers.js';
const servicesRules = {
    'no-response-data-return': {
        meta: {
            type: 'problem',
            docs: {
                description: 'Prevent direct response.data returns in service layer files to ensure proper response transformation. Service layers should transform, validate, or normalize API responses before returning them to ensure type safety and consistent data structures.',
                category: 'Best Practices',
                recommended: 'error',
                url: 'https://github.com/vertex-era/eslint-rules/blob/main/docs/rules/no-response-data-return.md',
            },
            schema: [],
            messages: {
                directResponseDataReturn: "Direct return of response.data bypasses the service layer's responsibility to transform and validate data. Add transformation logic (e.g., map to domain models, validate types, normalize structure) before returning.",
            },
        },
        create(context) {
            // Check if current file is in the services directory
            const filename = context.filename;
            const isServiceFile = matchesServicePath(filename);
            // Only apply this rule to service files
            if (!isServiceFile) {
                return {};
            }
            /**
             * Check if a member expression represents response.data pattern
             * Handles cases like:
             * - response.data
             * - res.data
             * - apiResponse.data
             */
            function isResponseDataAccess(node) {
                try {
                    // Check if property is 'data'
                    if (node.property.type !== AST_NODE_TYPES.Identifier ||
                        node.property.name !== 'data') {
                        return false;
                    }
                    // Check if the object contains 'response' in its chain
                    let current = node.object;
                    // Traverse the member expression chain
                    while (current.type === AST_NODE_TYPES.MemberExpression) {
                        current = current.object;
                    }
                    // Check if the base identifier suggests a response object
                    if (current.type === AST_NODE_TYPES.Identifier) {
                        const name = current.name.toLowerCase();
                        return (name.includes('response') ||
                            name.includes('res') ||
                            name === 'r' ||
                            name.includes('result'));
                    }
                    return false;
                }
                catch (error) {
                    console.error('Error in isResponseDataAccess:', error);
                    return false;
                }
            }
            /**
             * Check if the return statement is a direct response.data return
             * Returns false if the data is transformed or processed
             */
            function isDirectResponseDataReturn(returnNode) {
                try {
                    if (!returnNode.argument)
                        return false;
                    // Direct member expression: return response.data
                    if (returnNode.argument.type === AST_NODE_TYPES.MemberExpression) {
                        return isResponseDataAccess(returnNode.argument);
                    }
                    // Check for optional chaining: return response?.data
                    if (returnNode.argument.type === AST_NODE_TYPES.ChainExpression) {
                        const expr = returnNode.argument.expression;
                        if (expr.type === AST_NODE_TYPES.MemberExpression) {
                            return isResponseDataAccess(expr);
                        }
                    }
                    return false;
                }
                catch (error) {
                    console.error('Error in isDirectResponseDataReturn:', error);
                    return false;
                }
            }
            return {
                ReturnStatement(node) {
                    try {
                        if (isDirectResponseDataReturn(node)) {
                            context.report({
                                node,
                                messageId: 'directResponseDataReturn',
                            });
                        }
                    }
                    catch (error) {
                        console.error('Error in no-response-data-return (ReturnStatement):', error);
                    }
                },
            };
        },
        defaultOptions: [],
    },
};
// eslint-disable-next-line custom/memoized-export
export default servicesRules;
//# sourceMappingURL=eslint-plugin-services-rules.js.map