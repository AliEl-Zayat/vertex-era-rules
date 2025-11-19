import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
declare const componentRules: {
    'one-component-per-file': {
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
                multipleComponents: string;
            };
        };
        create(context: TSESLint.RuleContext<"multipleComponents", never[]>): {
            AssignmentExpression(node: TSESTree.AssignmentExpression): void;
            FunctionDeclaration(node: TSESTree.FunctionDeclaration): void;
            VariableDeclarator(node: TSESTree.VariableDeclarator): void;
            ClassDeclaration(node: TSESTree.ClassDeclaration): void;
            'Program:exit'(): void;
        };
        defaultOptions: never[];
    };
};
export default componentRules;
//# sourceMappingURL=eslint-plugin-component-rules.d.ts.map