import type { Config } from 'prettier';

const config: Config = {
	// Use tabs for indentation
	useTabs: true,
	tabWidth: 2,

	// Use single quotes
	singleQuote: true,

	// Use semicolons
	semi: true,

	// Trailing commas where valid in ES5
	trailingComma: 'es5',

	// Line width
	printWidth: 100,

	// Arrow function parentheses
	arrowParens: 'always',

	// End of line
	endOfLine: 'lf',

	// JSX settings
	jsxSingleQuote: true,
	bracketSpacing: true,
	bracketSameLine: false,
};

export default config;
