export default {
	extends: ['@commitlint/config-conventional'],
	rules: {
		// Type must be one of these
		'type-enum': [
			2,
			'always',
			[
				'feat',     // New feature (minor version bump)
				'fix',      // Bug fix (patch version bump)
				'docs',     // Documentation only changes
				'style',    // Code style changes (formatting, semicolons, etc)
				'refactor', // Code refactoring (no functional changes)
				'perf',     // Performance improvements
				'test',     // Adding or updating tests
				'build',    // Build system or external dependencies
				'ci',       // CI configuration changes
				'chore',    // Other changes that don't modify src or test files
				'revert',   // Revert a previous commit
			],
		],
		// Type is required
		'type-empty': [2, 'never'],
		// Subject is required
		'subject-empty': [2, 'never'],
		// Subject must not end with period
		'subject-full-stop': [2, 'never', '.'],
		// Subject must be in lowercase
		'subject-case': [2, 'always', 'lower-case'],
		// Header max length (type(scope): subject)
		'header-max-length': [2, 'always', 100],
	},
};








