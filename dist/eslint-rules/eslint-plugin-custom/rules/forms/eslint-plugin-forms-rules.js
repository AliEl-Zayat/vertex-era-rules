import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import { isFormConfigProperty, isFormHook } from '../../utils/ast-helpers.js';
const formsRules = {
    'form-config-extraction': {
        meta: {
            type: 'problem',
            docs: {
                description: 'Require form configuration parameters to be defined in separate constant files with consistent naming. This improves maintainability by centralizing form configurations and makes them easier to test and reuse across components.',
                category: 'Best Practices',
                recommended: 'error',
                url: 'https://github.com/vertex-era/eslint-rules/blob/main/docs/rules/form-config-extraction.md',
            },
            schema: [],
            messages: {
                inlineConfig: 'Form configuration should be extracted to a constants file (e.g., "user-form-constants.ts") with UPPER_SNAKE_CASE naming (e.g., USER_FORM_CONFIG). This improves reusability and testability.',
                invalidNaming: 'Form configuration constant "{{name}}" must use UPPER_SNAKE_CASE naming convention (e.g., {{suggestion}}).',
                invalidImportSource: 'Form configuration must be imported from a file matching the pattern "*-constants.ts" or "*-constants.tsx". Found: "{{source}}". Consider renaming to "{{suggestion}}".',
            },
        },
        create(context) {
            const imports = new Map();
            const UPPER_SNAKE_CASE_PATTERN = /^[A-Z][A-Z0-9_]*$/;
            const CONSTANTS_FILE_PATTERN = /-constants\.(ts|tsx)$/;
            return {
                // Track imports to validate constant sources
                ImportDeclaration(node) {
                    try {
                        if (node.source.type !== AST_NODE_TYPES.Literal)
                            return;
                        if (typeof node.source.value !== 'string')
                            return;
                        const sourcePath = node.source.value;
                        // Track all imported identifiers
                        for (const specifier of node.specifiers) {
                            if (specifier.type === AST_NODE_TYPES.ImportSpecifier) {
                                const importedName = specifier.imported.type === AST_NODE_TYPES.Identifier
                                    ? specifier.imported.name
                                    : null;
                                const localName = specifier.local.type === AST_NODE_TYPES.Identifier
                                    ? specifier.local.name
                                    : null;
                                if (importedName && localName) {
                                    imports.set(localName, {
                                        variableName: importedName,
                                        sourcePath,
                                    });
                                }
                            }
                            else if (specifier.type === AST_NODE_TYPES.ImportDefaultSpecifier) {
                                const localName = specifier.local.type === AST_NODE_TYPES.Identifier
                                    ? specifier.local.name
                                    : null;
                                if (localName) {
                                    imports.set(localName, {
                                        variableName: localName,
                                        sourcePath,
                                    });
                                }
                            }
                        }
                    }
                    catch (error) {
                        console.error('Error in form-config-extraction (ImportDeclaration):', error);
                    }
                },
                // Detect useForm calls and validate configuration
                CallExpression(node) {
                    try {
                        // Check if this is a form hook call
                        if (!isFormHook(node))
                            return;
                        // Check if there's a first argument (configuration)
                        if (node.arguments.length === 0)
                            return;
                        const firstArg = node.arguments[0];
                        // Case 1: Inline object expression - report error
                        if (firstArg.type === AST_NODE_TYPES.ObjectExpression) {
                            // Check if it contains form configuration properties
                            const isFormConfigPresent = firstArg.properties.some((prop) => {
                                if (prop.type === AST_NODE_TYPES.Property &&
                                    prop.key.type === AST_NODE_TYPES.Identifier) {
                                    return isFormConfigProperty(prop.key.name);
                                }
                                return false;
                            });
                            if (isFormConfigPresent) {
                                context.report({
                                    node: firstArg,
                                    messageId: 'inlineConfig',
                                });
                            }
                            return;
                        }
                        // Case 2: Identifier reference - validate it's from constants file
                        if (firstArg.type === AST_NODE_TYPES.Identifier) {
                            const configName = firstArg.name;
                            const importInfo = imports.get(configName);
                            if (importInfo) {
                                // Validate naming convention
                                if (!UPPER_SNAKE_CASE_PATTERN.test(importInfo.variableName)) {
                                    const suggestion = importInfo.variableName
                                        .replace(/([a-z])([A-Z])/g, '$1_$2')
                                        .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
                                        .toUpperCase();
                                    context.report({
                                        node: firstArg,
                                        messageId: 'invalidNaming',
                                        data: {
                                            name: importInfo.variableName,
                                            suggestion,
                                        },
                                    });
                                }
                                // Validate import source matches constants file pattern
                                if (!CONSTANTS_FILE_PATTERN.test(importInfo.sourcePath)) {
                                    const pathParts = importInfo.sourcePath.split('/');
                                    const fileName = pathParts[pathParts.length - 1];
                                    const baseName = fileName.replace(/\.(ts|tsx|js|jsx)$/, '');
                                    const suggestion = `${baseName}-constants.ts`;
                                    context.report({
                                        node: firstArg,
                                        messageId: 'invalidImportSource',
                                        data: {
                                            source: importInfo.sourcePath,
                                            suggestion,
                                        },
                                    });
                                }
                            }
                            // If not imported, it might be defined locally - we'll check that separately
                            return;
                        }
                        // Case 3: Member expression (e.g., config.formOptions) - validate the base identifier
                        if (firstArg.type === AST_NODE_TYPES.MemberExpression) {
                            let baseIdentifier = null;
                            // Get the base identifier
                            let current = firstArg;
                            while (current.type === AST_NODE_TYPES.MemberExpression) {
                                current = current.object;
                            }
                            if (current.type === AST_NODE_TYPES.Identifier) {
                                baseIdentifier = current.name;
                            }
                            if (baseIdentifier) {
                                const importInfo = imports.get(baseIdentifier);
                                if (importInfo) {
                                    // Validate naming convention
                                    if (!UPPER_SNAKE_CASE_PATTERN.test(importInfo.variableName)) {
                                        const suggestion = importInfo.variableName
                                            .replace(/([a-z])([A-Z])/g, '$1_$2')
                                            .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
                                            .toUpperCase();
                                        context.report({
                                            node: firstArg,
                                            messageId: 'invalidNaming',
                                            data: {
                                                name: importInfo.variableName,
                                                suggestion,
                                            },
                                        });
                                    }
                                    // Validate import source
                                    if (!CONSTANTS_FILE_PATTERN.test(importInfo.sourcePath)) {
                                        const pathParts = importInfo.sourcePath.split('/');
                                        const fileName = pathParts[pathParts.length - 1];
                                        const baseName = fileName.replace(/\.(ts|tsx|js|jsx)$/, '');
                                        const suggestion = `${baseName}-constants.ts`;
                                        context.report({
                                            node: firstArg,
                                            messageId: 'invalidImportSource',
                                            data: {
                                                source: importInfo.sourcePath,
                                                suggestion,
                                            },
                                        });
                                    }
                                }
                            }
                            return;
                        }
                    }
                    catch (error) {
                        console.error('Error in form-config-extraction (CallExpression):', error);
                    }
                },
            };
        },
        defaultOptions: [],
    },
};
// eslint-disable-next-line custom/memoized-export
export default formsRules;
//# sourceMappingURL=eslint-plugin-forms-rules.js.map