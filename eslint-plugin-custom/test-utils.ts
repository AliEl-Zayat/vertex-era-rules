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

export function runRule(
	rule: TSESLint.RuleModule<string, unknown[]>,
	code: string,
	filename?: string,
): ILintMessage[] {
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
						'test-rule': rule as any,
					},
				},
			},
			rules: {
				'test/test-rule': 'error',
			},
		},
	];

	// Run the linter
	const messages = linter.verify(code, config as any, { filename: filename || 'test.tsx' });

	return messages as ILintMessage[];
}

export function applyFixes(code: string, messages: ILintMessage[]): string {
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
		if (!message.fix) continue;
		const [start, end] = message.fix.range;
		fixed = fixed.slice(0, start) + message.fix.text + fixed.slice(end);
	}
	return fixed;
}
