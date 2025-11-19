import { TSESLint } from '@typescript-eslint/utils';
export function runRule(rule, code, filename) {
    const linter = new TSESLint.Linter();
    // Configure the linter using flat config format
    const config = [
        {
            files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
            languageOptions: {
                ecmaVersion: 2022,
                sourceType: 'module',
                parser: require('@typescript-eslint/parser'),
                parserOptions: {
                    ecmaFeatures: {
                        jsx: true,
                    },
                },
            },
            plugins: {
                test: {
                    meta: {
                        name: 'test-plugin',
                        version: '1.0.0',
                    },
                    rules: {
                        'test-rule': rule,
                    },
                },
            },
            rules: {
                'test/test-rule': 'error',
            },
        },
    ];
    // Run the linter
    const messages = linter.verify(code, config, { filename: filename || 'test.tsx' });
    return messages;
}
export function applyFixes(code, messages) {
    // Apply fixes in reverse order to maintain positions
    const sortedMessages = messages
        .filter((m) => m.fix)
        .sort((a, b) => {
        const aRange = a.fix?.range[0] ?? 0;
        const bRange = b.fix?.range[0] ?? 0;
        return bRange - aRange;
    });
    let fixed = code;
    for (const message of sortedMessages) {
        if (!message.fix)
            continue;
        const [start, end] = message.fix.range;
        fixed = fixed.slice(0, start) + message.fix.text + fixed.slice(end);
    }
    return fixed;
}
//# sourceMappingURL=test-utils.js.map