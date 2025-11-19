import { TSESLint } from '@typescript-eslint/utils';
export interface ILintMessage {
    ruleId: string | null;
    severity: number;
    message: string;
    line: number;
    column: number;
    nodeType: string;
    messageId?: string;
    fix?: {
        range: [number, number];
        text: string;
    };
}
export declare function runRule(rule: TSESLint.RuleModule<string, unknown[]>, code: string, filename?: string): ILintMessage[];
export declare function applyFixes(code: string, messages: ILintMessage[]): string;
//# sourceMappingURL=test-utils.d.ts.map