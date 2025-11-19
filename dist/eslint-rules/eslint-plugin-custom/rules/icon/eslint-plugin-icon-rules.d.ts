import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
declare const iconRules: {
    'single-svg-per-file': {
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
                multipleSvgs: string;
            };
        };
        create(context: TSESLint.RuleContext<"multipleSvgs", never[]>): {
            JSXElement(node: TSESTree.JSXElement): void;
            'Program:exit'(): void;
        };
        defaultOptions: never[];
    };
    'svg-currentcolor': {
        meta: {
            type: "problem";
            docs: {
                description: string;
                category: string;
                recommended: string;
                url: string;
            };
            fixable: "code";
            schema: never[];
            messages: {
                useCurrentColor: string;
            };
        };
        create(context: TSESLint.RuleContext<"useCurrentColor", never[]>): {
            JSXElement(node: TSESTree.JSXElement): void;
        };
        defaultOptions: never[];
    };
    'memoized-export': {
        meta: {
            type: "problem";
            docs: {
                description: string;
                category: string;
                recommended: string;
                url: string;
            };
            fixable: "code";
            schema: never[];
            messages: {
                memoizeExport: string;
            };
        };
        create(context: TSESLint.RuleContext<"memoizeExport", never[]>): {
            JSXElement(node: TSESTree.JSXElement): void;
            ExportDefaultDeclaration(node: TSESTree.ExportDefaultDeclaration): void;
            'Program:exit'(): void;
        };
        defaultOptions: never[];
    };
};
export default iconRules;
//# sourceMappingURL=eslint-plugin-icon-rules.d.ts.map