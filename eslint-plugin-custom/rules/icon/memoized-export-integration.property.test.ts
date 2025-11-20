import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { applyFixes, runRule } from '../../test-utils';

import iconRules from './eslint-plugin-icon-rules';

describe('Integration Property Tests: memoized-export', () => {
	it('Property: Complete fix flow integration', () => {
		/**
		 * Feature: icon-memoize-react-import-handling, Property: Complete fix flow integration
		 * For any icon component with various import styles, the complete fix flow should:
		 * 1. Apply fixes without errors
		 * 2. Result in code with no violations
		 * 3. Not create duplicate imports
		 * 4. Use the correct memo reference based on import style
		 * 5. Add correct type annotations
		 * Validates: Requirements: All requirements
		 */

		// Generator for component names (PascalCase)
		const componentNameGen = fc
			.string({ minLength: 1, maxLength: 15 })
			.map((s) => {
				const cleaned = s.replace(/[^a-zA-Z0-9]/g, '');
				if (cleaned.length === 0) return 'Icon';
				const firstChar = cleaned.charAt(0);
				if (/[0-9]/.test(firstChar)) {
					return 'I' + cleaned;
				}
				return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
			})
			.filter((name) => name.length > 0 && /^[A-Z]/.test(name));

		// Generator for React import styles
		const reactImportGen = fc.oneof(
			fc.constant({ type: 'namespace', code: "import * as React from 'react';" }),
			fc.constant({ type: 'default-only', code: "import React from 'react';" }),
			fc.constant({ type: 'named-only', code: "import { useState } from 'react';" }),
			fc.constant({
				type: 'mixed',
				code: "import React, { useState, useEffect } from 'react';",
			}),
			fc.constant({ type: 'none', code: '' }),
		);

		// Generator for component definition styles
		const componentDefStyleGen = fc.oneof(
			fc.constant('arrow'),
			fc.constant('function'),
			fc.constant('arrowWithProps'),
		);

		// Generator for environment (React web vs React Native)
		const environmentGen = fc.oneof(
			fc.constant({ type: 'web', imports: '', element: 'svg' }),
			fc.constant({
				type: 'native',
				imports: "import { Svg } from 'react-native-svg';",
				element: 'Svg',
			}),
		);

		fc.assert(
			fc.property(
				componentNameGen,
				reactImportGen,
				componentDefStyleGen,
				environmentGen,
				(componentName, reactImport, defStyle, environment) => {
					// Generate component definition based on style
					let componentDef: string;
					switch (defStyle) {
						case 'arrow':
							componentDef = `const ${componentName} = () => <${environment.element}><path d="M10 10" /></${environment.element}>;`;
							break;
						case 'function':
							componentDef = `function ${componentName}() { return <${environment.element}><path d="M10 10" /></${environment.element}>; }`;
							break;
						case 'arrowWithProps':
							componentDef = `const ${componentName} = (props) => <${environment.element} className={props.className}><path d="M10 10" /></${environment.element}>;`;
							break;
					}

					// Build the code
					const imports = [reactImport.code, environment.imports]
						.filter(Boolean)
						.join('\n');
					const code = `${imports}

${componentDef}

export default ${componentName};`;

					// Run the rule
					const messages = runRule(iconRules['memoized-export'], code);

					// Should report an error for unmemoized export
					expect(messages.length).toBeGreaterThan(0);
					expect(messages[0].message).toContain('memo');

					// Apply the fix
					const fixed = applyFixes(code, messages);

					// Verification 1: Fixed code should have no violations
					const messagesAfterFix = runRule(iconRules['memoized-export'], fixed);
					expect(messagesAfterFix.length).toBe(0);

					// Verification 2: Export should be wrapped with memo
					expect(fixed).toMatch(
						new RegExp(`export default (React\\.)?memo\\(${componentName}\\);`),
					);

					// Verification 3: No duplicate imports
					// Count occurrences of 'memo' in import statements
					const importLines = fixed.split('\n').filter((line) => line.includes('import'));
					const memoInImports = importLines.join('\n').match(/\bmemo\b/g) || [];
					expect(memoInImports.length).toBeLessThanOrEqual(1);

					// Verification 4: Correct memo reference based on import style
					if (reactImport.type === 'namespace' || reactImport.type === 'default-only') {
						// Should use React.memo
						expect(fixed).toContain(`export default React.memo(${componentName});`);
					} else if (
						reactImport.type === 'named-only' ||
						reactImport.type === 'mixed' ||
						reactImport.type === 'none'
					) {
						// Should use memo directly
						expect(fixed).toContain(`export default memo(${componentName});`);
						// Should have memo imported
						expect(fixed).toMatch(/import.*\bmemo\b.*from ['"]react['"]/);
					}

					// Verification 5: Correct type annotation added
					// Only check for type annotations if the component has props parameter
					// or is a function declaration (which can have props added)
					if (defStyle === 'arrowWithProps' || defStyle === 'function') {
						if (environment.type === 'web') {
							// React web should have SVGProps type
							expect(fixed).toContain('React.SVGProps<SVGSVGElement>');
						} else {
							// React Native should have SvgProps type
							expect(fixed).toContain('SvgProps');
							// Should import SvgProps from react-native-svg
							expect(fixed).toMatch(/import.*\bSvgProps\b.*from ['"]react-native-svg['"]/);
						}
					}

					return true;
				},
			),
			{ numRuns: 100 },
		);
	});

	it('Property: No duplicate memo imports', () => {
		/**
		 * Feature: icon-memoize-react-import-handling, Property 6: No duplicate memo imports
		 * For any icon component where memo is already imported, the fixer should not add another memo import.
		 * Validates: Requirements 5.1
		 */

		const componentNameGen = fc
			.string({ minLength: 1, maxLength: 15 })
			.map((s) => {
				const cleaned = s.replace(/[^a-zA-Z0-9]/g, '');
				if (cleaned.length === 0) return 'Icon';
				const firstChar = cleaned.charAt(0);
				if (/[0-9]/.test(firstChar)) {
					return 'I' + cleaned;
				}
				return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
			})
			.filter((name) => name.length > 0 && /^[A-Z]/.test(name));

		// Generator for imports that already have memo
		const reactImportWithMemoGen = fc.oneof(
			fc.constant("import React, { memo } from 'react';"),
			fc.constant("import React, { useState, memo } from 'react';"),
			fc.constant("import { memo } from 'react';"),
			fc.constant("import { useState, memo, useEffect } from 'react';"),
		);

		fc.assert(
			fc.property(
				componentNameGen,
				reactImportWithMemoGen,
				(componentName, reactImport) => {
					const code = `${reactImport}

const ${componentName} = () => <svg><path d="M10 10" /></svg>;

export default ${componentName};`;

					// Run the rule
					const messages = runRule(iconRules['memoized-export'], code);

					// Should report an error
					expect(messages.length).toBeGreaterThan(0);

					// Apply the fix
					const fixed = applyFixes(code, messages);

					// Count occurrences of 'memo' in the entire file
					const memoMatches = fixed.match(/\bmemo\b/g) || [];

					// Should have exactly 2 occurrences: one in import, one in export
					expect(memoMatches.length).toBe(2);

					// Verify no duplicate imports
					const importLines = fixed.split('\n').filter((line) => line.includes('import'));
					const memoInImports = importLines.join('\n').match(/\bmemo\b/g) || [];
					expect(memoInImports.length).toBe(1);

					return true;
				},
			),
			{ numRuns: 100 },
		);
	});

	it('Property: Namespace imports use React.memo', () => {
		/**
		 * Feature: icon-memoize-react-import-handling, Property 1: Namespace import uses React.memo
		 * For any icon component file with namespace import, the fixer should wrap with React.memo
		 * and not modify the import statement.
		 * Validates: Requirements 1.1, 1.2
		 */

		const componentNameGen = fc
			.string({ minLength: 1, maxLength: 15 })
			.map((s) => {
				const cleaned = s.replace(/[^a-zA-Z0-9]/g, '');
				if (cleaned.length === 0) return 'Icon';
				const firstChar = cleaned.charAt(0);
				if (/[0-9]/.test(firstChar)) {
					return 'I' + cleaned;
				}
				return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
			})
			.filter((name) => name.length > 0 && /^[A-Z]/.test(name));

		fc.assert(
			fc.property(componentNameGen, (componentName) => {
				const code = `import * as React from 'react';

const ${componentName} = () => <svg><path d="M10 10" /></svg>;

export default ${componentName};`;

				// Run the rule
				const messages = runRule(iconRules['memoized-export'], code);
				expect(messages.length).toBeGreaterThan(0);

				// Apply the fix
				const fixed = applyFixes(code, messages);

				// Should use React.memo
				expect(fixed).toContain(`export default React.memo(${componentName});`);

				// Should NOT add named imports
				expect(fixed).not.toMatch(/import.*{.*memo.*}.*from ['"]react['"]/);

				// Should maintain namespace import
				expect(fixed).toContain("import * as React from 'react';");

				// Fixed code should pass the rule
				const messagesAfterFix = runRule(iconRules['memoized-export'], fixed);
				expect(messagesAfterFix.length).toBe(0);

				return true;
			}),
			{ numRuns: 100 },
		);
	});

	it('Property: Default-only imports use React.memo', () => {
		/**
		 * Feature: icon-memoize-react-import-handling, Property 2: Default-only import uses React.memo
		 * For any icon component file with default-only import, the fixer should wrap with React.memo
		 * and not add named imports.
		 * Validates: Requirements 2.1, 2.2
		 */

		const componentNameGen = fc
			.string({ minLength: 1, maxLength: 15 })
			.map((s) => {
				const cleaned = s.replace(/[^a-zA-Z0-9]/g, '');
				if (cleaned.length === 0) return 'Icon';
				const firstChar = cleaned.charAt(0);
				if (/[0-9]/.test(firstChar)) {
					return 'I' + cleaned;
				}
				return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
			})
			.filter((name) => name.length > 0 && /^[A-Z]/.test(name));

		fc.assert(
			fc.property(componentNameGen, (componentName) => {
				const code = `import React from 'react';

const ${componentName} = () => <svg><path d="M10 10" /></svg>;

export default ${componentName};`;

				// Run the rule
				const messages = runRule(iconRules['memoized-export'], code);
				expect(messages.length).toBeGreaterThan(0);

				// Apply the fix
				const fixed = applyFixes(code, messages);

				// Should use React.memo
				expect(fixed).toContain(`export default React.memo(${componentName});`);

				// Should NOT add named imports
				expect(fixed).not.toMatch(/import.*{.*memo.*}.*from ['"]react['"]/);

				// Should maintain default import
				expect(fixed).toContain("import React from 'react';");

				// Fixed code should pass the rule
				const messagesAfterFix = runRule(iconRules['memoized-export'], fixed);
				expect(messagesAfterFix.length).toBe(0);

				return true;
			}),
			{ numRuns: 100 },
		);
	});

	it('Property: Named imports get memo added and use it directly', () => {
		/**
		 * Feature: icon-memoize-react-import-handling, Property 3 & 4: Named imports get memo added and use memo directly
		 * For any icon component file with named imports, the fixer should add memo to imports
		 * and wrap with memo() directly.
		 * Validates: Requirements 3.1, 3.2
		 */

		const componentNameGen = fc
			.string({ minLength: 1, maxLength: 15 })
			.map((s) => {
				const cleaned = s.replace(/[^a-zA-Z0-9]/g, '');
				if (cleaned.length === 0) return 'Icon';
				const firstChar = cleaned.charAt(0);
				if (/[0-9]/.test(firstChar)) {
					return 'I' + cleaned;
				}
				return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
			})
			.filter((name) => name.length > 0 && /^[A-Z]/.test(name));

		fc.assert(
			fc.property(componentNameGen, (componentName) => {
				const code = `import { useState } from 'react';

const ${componentName} = () => <svg><path d="M10 10" /></svg>;

export default ${componentName};`;

				// Run the rule
				const messages = runRule(iconRules['memoized-export'], code);
				expect(messages.length).toBeGreaterThan(0);

				// Apply the fix
				const fixed = applyFixes(code, messages);

				// Should add memo to named imports
				expect(fixed).toMatch(/import.*{.*useState.*memo.*}.*from ['"]react['"]/);

				// Should use memo directly (not React.memo)
				expect(fixed).toContain(`export default memo(${componentName});`);
				expect(fixed).not.toContain('React.memo');

				// Fixed code should pass the rule
				const messagesAfterFix = runRule(iconRules['memoized-export'], fixed);
				expect(messagesAfterFix.length).toBe(0);

				return true;
			}),
			{ numRuns: 100 },
		);
	});

	it('Property: Mixed imports add to named section', () => {
		/**
		 * Feature: icon-memoize-react-import-handling, Property 5: Mixed imports add to named section
		 * For any icon component file with mixed imports, the fixer should add memo to the named section
		 * and use memo() directly.
		 * Validates: Requirements 4.1, 4.2
		 */

		const componentNameGen = fc
			.string({ minLength: 1, maxLength: 15 })
			.map((s) => {
				const cleaned = s.replace(/[^a-zA-Z0-9]/g, '');
				if (cleaned.length === 0) return 'Icon';
				const firstChar = cleaned.charAt(0);
				if (/[0-9]/.test(firstChar)) {
					return 'I' + cleaned;
				}
				return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
			})
			.filter((name) => name.length > 0 && /^[A-Z]/.test(name));

		fc.assert(
			fc.property(componentNameGen, (componentName) => {
				const code = `import React, { useState } from 'react';

const ${componentName} = () => <svg><path d="M10 10" /></svg>;

export default ${componentName};`;

				// Run the rule
				const messages = runRule(iconRules['memoized-export'], code);
				expect(messages.length).toBeGreaterThan(0);

				// Apply the fix
				const fixed = applyFixes(code, messages);

				// Should add memo to named imports
				expect(fixed).toMatch(/import React,.*{.*useState.*memo.*}.*from ['"]react['"]/);

				// Should use memo directly (not React.memo)
				expect(fixed).toContain(`export default memo(${componentName});`);
				expect(fixed).not.toContain('React.memo');

				// Fixed code should pass the rule
				const messagesAfterFix = runRule(iconRules['memoized-export'], fixed);
				expect(messagesAfterFix.length).toBe(0);

				return true;
			}),
			{ numRuns: 100 },
		);
	});

	it('Property: React web components get SVGProps type', () => {
		/**
		 * Feature: icon-memoize-react-import-handling, Property 7: React web components get SVGProps type
		 * For any React web icon component, the fixer should add React.SVGProps<SVGSVGElement> type.
		 * Validates: Requirements 6.1, 6.5
		 */

		const componentNameGen = fc
			.string({ minLength: 1, maxLength: 15 })
			.map((s) => {
				const cleaned = s.replace(/[^a-zA-Z0-9]/g, '');
				if (cleaned.length === 0) return 'Icon';
				const firstChar = cleaned.charAt(0);
				if (/[0-9]/.test(firstChar)) {
					return 'I' + cleaned;
				}
				return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
			})
			.filter((name) => name.length > 0 && /^[A-Z]/.test(name));

		fc.assert(
			fc.property(componentNameGen, (componentName) => {
				const code = `import React from 'react';

const ${componentName} = (props) => <svg {...props}><path d="M10 10" /></svg>;

export default ${componentName};`;

				// Run the rule
				const messages = runRule(iconRules['memoized-export'], code);
				expect(messages.length).toBeGreaterThan(0);

				// Apply the fix
				const fixed = applyFixes(code, messages);

				// Should add SVGProps type
				expect(fixed).toContain('React.SVGProps<SVGSVGElement>');

				// Fixed code should pass the rule
				const messagesAfterFix = runRule(iconRules['memoized-export'], fixed);
				expect(messagesAfterFix.length).toBe(0);

				return true;
			}),
			{ numRuns: 100 },
		);
	});

	it('Property: React Native components get SvgProps type and imports', () => {
		/**
		 * Feature: icon-memoize-react-import-handling, Property 8, 9, 10: React Native components get proper types and imports
		 * For any React Native icon component, the fixer should add SvgProps type and necessary imports.
		 * Validates: Requirements 7.1, 7.2, 7.3
		 */

		const componentNameGen = fc
			.string({ minLength: 1, maxLength: 15 })
			.map((s) => {
				const cleaned = s.replace(/[^a-zA-Z0-9]/g, '');
				if (cleaned.length === 0) return 'Icon';
				const firstChar = cleaned.charAt(0);
				if (/[0-9]/.test(firstChar)) {
					return 'I' + cleaned;
				}
				return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
			})
			.filter((name) => name.length > 0 && /^[A-Z]/.test(name));

		fc.assert(
			fc.property(componentNameGen, (componentName) => {
				const code = `import React from 'react';
import { Svg } from 'react-native-svg';

const ${componentName} = (props) => <Svg {...props}><path d="M10 10" /></Svg>;

export default ${componentName};`;

				// Run the rule
				const messages = runRule(iconRules['memoized-export'], code);
				expect(messages.length).toBeGreaterThan(0);

				// Apply the fix
				const fixed = applyFixes(code, messages);

				// Should add SvgProps type
				expect(fixed).toContain('SvgProps');

				// Should import SvgProps from react-native-svg
				expect(fixed).toMatch(/import.*SvgProps.*from ['"]react-native-svg['"]/);

				// Fixed code should pass the rule
				const messagesAfterFix = runRule(iconRules['memoized-export'], fixed);
				expect(messagesAfterFix.length).toBe(0);

				return true;
			}),
			{ numRuns: 100 },
		);
	});
});
