#!/usr/bin/env node

/**
 * Post-install script for @zayat/eslint-custom-rules
 *
 * This script runs after package installation and:
 * 1. Detects if a Prettier config exists
 * 2. Creates a default config if none is found
 * 3. Creates prettier.config.ts if it doesn't exist
 * 4. Prints helpful setup information
 */

import { existsSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDefaultPrettierConfig, detectPrettierConfig } from '../utils/prettier-detector.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');

/**
 * Find the project root by looking for package.json
 * When installed as a package, we're in node_modules/@vertex-era/eslint-rules/scripts
 * We need to go up to find the user's project root
 */
function findProjectRoot(): string {
	// Start from the script's location
	let currentPath = resolve(__dirname, '..', '..', '..');

	// Keep going up until we find a package.json that's not in node_modules
	while (currentPath !== resolve(currentPath, '..')) {
		const packageJsonPath = join(currentPath, 'package.json');
		if (existsSync(packageJsonPath)) {
			// Check if we're still in node_modules
			if (!currentPath.includes('node_modules')) {
				return currentPath;
			}
			// If we're in node_modules, continue up
		}
		currentPath = resolve(currentPath, '..');
	}

	// Fallback: try process.cwd() (user's project root)
	const cwdPackageJson = join(process.cwd(), 'package.json');
	if (existsSync(cwdPackageJson)) {
		return process.cwd();
	}

	// Last resort: return current working directory
	return process.cwd();
}

/**
 * Create prettier.config.ts with appropriate configuration
 */
function createPrettierConfigTS(projectRoot: string): boolean {
	const configPath = join(projectRoot, 'prettier.config.ts');
	const configContent = `import type { Config } from 'prettier';

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
`;

	try {
		writeFileSync(configPath, configContent, 'utf8');
		console.log(`✓ Created prettier.config.ts at ${configPath}`);
		return true;
	} catch (error: any) {
		console.error(`✗ Failed to create prettier.config.ts: ${error.message}`);
		return false;
	}
}

function main(): void {
	console.log('\n🎨 zayat-eslint-rules - Post-install Setup\n');
	console.log('━'.repeat(50));

	// Check for existing Prettier config
	const detection = detectPrettierConfig();

	if (detection.found) {
		console.log('\n✅ Prettier configuration detected:');
		console.log(`   Source: ${detection.source}`);
		if (detection.path) {
			console.log(`   Path: ${detection.path}`);
		}
		console.log('\n   Using your existing Prettier configuration.\n');
	} else {
		console.log('\n⚠️  No Prettier configuration found.');
		console.log('   Creating a default .prettierrc.json...\n');

		const created = createDefaultPrettierConfig();

		if (created) {
			console.log('   ✅ Default Prettier config created successfully!\n');
		} else {
			console.log('   ⚠️  Could not create Prettier config (may already exist).\n');
		}
	}

	// Check and create prettier.config.ts if needed
	try {
		const projectRoot = findProjectRoot();
		const configPath = join(projectRoot, 'prettier.config.ts');
		if (existsSync(configPath)) {
			console.log(`ℹ prettier.config.ts already exists at ${configPath}, skipping creation.`);
		} else {
			createPrettierConfigTS(projectRoot);
		}
	} catch (error: any) {
		// Don't fail installation if prettier.config.ts creation fails
		console.warn(`⚠️  Could not create prettier.config.ts: ${error.message}`);
	}

	// Print setup tips
	console.log('━'.repeat(50));
	console.log('\n📝 Quick Setup Guide:\n');
	console.log('1. Create or update your eslint.config.ts:');
	console.log('');
	console.log(`   import eslintRules from 'zayat-eslint-rules';`);
	console.log('');
	console.log('   export default [');
	console.log('     ...eslintRules.configs.recommended,');
	console.log('     // Your custom rules here');
	console.log('   ];');
	console.log('');
	console.log('2. For maximum linting, use the strict config:');
	console.log('');
	console.log('   export default [');
	console.log('     ...eslintRules.configs.strict,');
	console.log('   ];');
	console.log('');
	console.log('3. To prevent ESLint/Prettier conflicts in VS Code:');
	console.log('');
	console.log("   import { getVSCodeSettingsJSON } from '@zayat/eslint-custom-rules';");
	console.log('   console.log(getVSCodeSettingsJSON());');
	console.log('');
	console.log('━'.repeat(50));
	console.log('\n📖 Documentation: https://github.com/AliEl-Zayat/eslint-rules-zayat');
	console.log('\n');
}

// Only run if executed directly (not imported)
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
	try {
		main();
	} catch {
		// Don't fail the install if post-install script fails
		console.warn('\n⚠️  Post-install script completed with warnings.');
		console.warn('   You can still use the package normally.\n');
	}
}

export { main };
