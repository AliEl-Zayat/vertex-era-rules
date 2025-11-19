import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
declare const jsxRules: {
    'no-inline-objects': {
        meta: {
            type: "problem";
            docs: {
                description: string;
                category: string;
                recommended: string;
                url: string;
            };
            schema: never[];
            messages: {
                noInlineObject: string;
            };
        };
        create(context: TSESLint.RuleContext<"noInlineObject", never[]>): {
            JSXAttribute(node: TSESTree.JSXAttribute): void;
        };
        defaultOptions: never[];
    };
    'no-inline-functions': {
        meta: {
            type: "problem";
            docs: {
                description: string;
                category: string;
                recommended: string;
                url: string;
            };
            schema: never[];
            messages: {
                noInlineFunction: string;
            };
        };
        create(context: TSESLint.RuleContext<"noInlineFunction", never[]>): {
            JSXAttribute(node: TSESTree.JSXAttribute): void;
        };
        defaultOptions: never[];
    };
};
export default jsxRules;
//# sourceMappingURL=eslint-plugin-jsx-rules.d.ts.map