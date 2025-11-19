import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import { hasIntentionalIgnoreComment, isEffectivelyEmpty } from '../../utils/ast-helpers.js';
/**
 * Check if a parameter name is used within a block statement
 */
function checkIfParamUsed(block, paramName) {
    let isUsed = false;
    function traverse(node) {
        if (!node || isUsed)
            return;
        // Check if this node is an Identifier with the parameter name
        if (node.type === AST_NODE_TYPES.Identifier && node.name === paramName) {
            isUsed = true;
            return;
        }
        // Traverse child nodes
        for (const key in node) {
            if (key === 'parent' || key === 'range' || key === 'loc')
                continue;
            const value = node[key];
            if (value && typeof value === 'object') {
                if (Array.isArray(value)) {
                    for (const item of value) {
                        if (item && typeof item === 'object' && 'type' in item) {
                            traverse(item);
                        }
                    }
                }
                else if ('type' in value) {
                    traverse(value);
                }
            }
        }
    }
    traverse(block);
    return isUsed;
}
const errorHandlingRules = {
    'no-empty-catch': {
        meta: {
            type: 'problem',
            docs: {
                description: 'Prevent empty catch blocks in try-catch statements. Empty catch blocks can hide errors and make debugging difficult. Either handle the error appropriately or explicitly document why it is being ignored.',
                category: 'Best Practices',
                recommended: 'error',
                url: 'https://github.com/vertex-era/eslint-rules/blob/main/docs/rules/no-empty-catch.md',
            },
            fixable: 'code',
            schema: [],
            messages: {
                emptyCatch: 'Empty catch block detected. Either handle the error (e.g., log it, show user feedback) or add an explicit comment: // intentionally ignored',
                unusedParam: 'Catch parameter "{{paramName}}" is declared but never used. Either use the error parameter to handle the error, or add a comment explaining why it is intentionally ignored.',
            },
        },
        create(context) {
            const sourceCode = context.sourceCode;
            return {
                CatchClause(node) {
                    try {
                        // Check if catch block is effectively empty
                        const isEmpty = isEffectivelyEmpty(node);
                        const isIntentionallyIgnored = hasIntentionalIgnoreComment(node, sourceCode);
                        if (isEmpty) {
                            // Check for intentional ignore comment
                            if (!isIntentionallyIgnored) {
                                context.report({
                                    node,
                                    messageId: 'emptyCatch',
                                    fix(fixer) {
                                        // Auto-fix: add intentional ignore comment
                                        const catchKeyword = sourceCode.getFirstToken(node);
                                        if (catchKeyword) {
                                            return fixer.insertTextAfter(catchKeyword, ' // intentionally ignored');
                                        }
                                        return null;
                                    },
                                });
                            }
                        }
                        // Check for unused catch parameter (only if block is not empty and no intentional ignore)
                        if (!isEmpty && !isIntentionallyIgnored && node.param) {
                            const param = node.param;
                            // Only check if param is an Identifier
                            if (param.type === AST_NODE_TYPES.Identifier) {
                                const paramName = param.name;
                                // Check if the parameter is used in the catch block
                                const isParamUsed = checkIfParamUsed(node.body, paramName);
                                if (!isParamUsed) {
                                    context.report({
                                        node: param,
                                        messageId: 'unusedParam',
                                        data: {
                                            paramName,
                                        },
                                    });
                                }
                            }
                        }
                    }
                    catch (error) {
                        console.error('Error in no-empty-catch:', error);
                    }
                },
            };
        },
        defaultOptions: [],
    },
};
// eslint-disable-next-line custom/memoized-export
export default errorHandlingRules;
//# sourceMappingURL=eslint-plugin-error-handling-rules.js.map