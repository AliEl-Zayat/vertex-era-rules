#!/usr/bin/env node

/**
 * Post-install script for @zayat/eslint-custom-rules
 * 
 * This script runs after package installation and:
 * 1. Detects if a Prettier config exists
 * 2. Creates a default config if none is found
 * 3. Prints helpful setup information
 */

import { createDefaultPrettierConfig, detectPrettierConfig } from '../utils/prettier-detector.js';

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
	console.log('   import { getVSCodeSettingsJSON } from \'@zayat/eslint-custom-rules\';');
	console.log('   console.log(getVSCodeSettingsJSON());');
	console.log('');
	console.log('━'.repeat(50));
	console.log('\n📖 Documentation: https://github.com/AliEl-Zayat/vertex-era-rules');
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

