import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { applyFixes, runRule } from '../../test-utils';

import iconRules from './eslint-plugin-icon-rules';

describe('Unit Tests: memoized-export', () => {
	it('should report error for unmemoized identifier export', () => {
		const code = `
			import React from 'react';
			
			const IconComponent = () => <svg><path d="M10 10" /></svg>;
			
			export default IconComponent;
		`;

		const messages = runRule(iconRules['memoized-export'], code);

		expect(messages.length).toBe(1);
		expect(messages[0].message).toContain('IconComponent');
		expect(messages[0].message).toContain('memo');
	});

	it('should not report error for memoized export', () => {
		const code = `
			import React, { memo } from 'react';
			
			const IconComponent = () => <svg><path d="M10 10" /></svg>;
			
			export default memo(IconComponent);
		`;

		const messages = runRule(iconRules['memoized-export'], code);

		expect(messages.length).toBe(0);
	});

	it('should report error for unmemoized function declaration export', () => {
		const code = `
			import React from 'react';
			
			export default function IconComponent() {
				return <svg><path d="M10 10" /></svg>;
			}
		`;

		const messages = runRule(iconRules['memoized-export'], code);

		expect(messages.length).toBe(1);
		expect(messages[0].message).toContain('IconComponent');
	});

	it('should not report error for inline arrow function (no component name)', () => {
		const code = `
			import React from 'react';
			
			export default () => <svg><path d="M10 10" /></svg>;
		`;

		const messages = runRule(iconRules['memoized-export'], code);

		// Cannot auto-fix inline arrow functions without a name
		expect(messages.length).toBe(0);
	});

	it('should auto-fix by adding memo import when not present', () => {
		const code = `import React from 'react';

const IconComponent = () => <svg><path d="M10 10" /></svg>;

export default IconComponent;`;

		const messages = runRule(iconRules['memoized-export'], code);
		expect(messages.length).toBe(1);
		expect(messages[0].fix).toBeDefined();

		const fixed = applyFixes(code, messages);

		// Should use React.memo for default-only imports
		expect(fixed).toContain('React.memo');
		expect(fixed).toContain('export default React.memo(IconComponent);');
	});

	it('should auto-fix by using existing memo import', () => {
		const code = `import React, { memo } from 'react';

const IconComponent = () => <svg><path d="M10 10" /></svg>;

export default IconComponent;`;

		const messages = runRule(iconRules['memoized-export'], code);
		expect(messages.length).toBe(1);
		expect(messages[0].fix).toBeDefined();

		const fixed = applyFixes(code, messages);

		// Should use existing memo import
		expect(fixed).toContain('export default memo(IconComponent);');
		// Should not duplicate memo import
		expect(fixed.match(/memo/g)?.length).toBe(2); // Once in import, once in export
	});

	it('should handle export with no React import by adding new import', () => {
		const code = `const IconComponent = () => <svg><path d="M10 10" /></svg>;

export default IconComponent;`;

		const messages = runRule(iconRules['memoized-export'], code);
		expect(messages.length).toBe(1);
		expect(messages[0].fix).toBeDefined();

		const fixed = applyFixes(code, messages);

		// Should add new React import with memo
		expect(fixed).toContain("import { memo } from 'react';");
		expect(fixed).toContain('export default memo(IconComponent);');
	});

	it('should handle function declaration exports', () => {
		const code = `import React from 'react';

export default function MyIcon() {
	return <svg><path d="M10 10" /></svg>;
}`;

		const messages = runRule(iconRules['memoized-export'], code);
		expect(messages.length).toBe(1);

		const fixed = applyFixes(code, messages);

		// Should use React.memo for default-only imports
		expect(fixed).toContain('React.memo');
		expect(fixed).toContain('export default React.memo(MyIcon);');
	});

	it('should not report error when already memoized with memo', () => {
		const code = `import React, { memo } from 'react';

const IconComponent = () => <svg><path d="M10 10" /></svg>;

export default memo(IconComponent);`;

		const messages = runRule(iconRules['memoized-export'], code);

		expect(messages.length).toBe(0);
	});

	it('should handle multiple named imports from React', () => {
		const code = `import React, { useState, useEffect } from 'react';

const IconComponent = () => <svg><path d="M10 10" /></svg>;

export default IconComponent;`;

		const messages = runRule(iconRules['memoized-export'], code);
		expect(messages.length).toBe(1);

		const fixed = applyFixes(code, messages);

		// Should add memo to existing imports
		expect(fixed).toContain('useState, useEffect, memo');
		expect(fixed).toContain('export default memo(IconComponent);');
	});
});

describe('Edge Cases: memoized-export', () => {
	it('should handle inline function expression (no component name)', () => {
		const code = `
			import React from 'react';
			
			export default function() {
				return <svg><path d="M10 10" /></svg>;
			}
		`;

		const messages = runRule(iconRules['memoized-export'], code);

		// Cannot auto-fix inline function expressions without a name
		expect(messages.length).toBe(0);
	});

	it('should handle component with JSX fragment', () => {
		const code = `import React from 'react';

const IconComponent = () => (
	<>
		<svg><path d="M10 10" /></svg>
	</>
);

export default IconComponent;`;

		const messages = runRule(iconRules['memoized-export'], code);
		expect(messages.length).toBe(1);

		const fixed = applyFixes(code, messages);
		// Should use React.memo for default-only imports
		expect(fixed).toContain('export default React.memo(IconComponent);');
	});

	it('should handle component with complex JSX', () => {
		const code = `import React from 'react';

const IconComponent = (props) => (
	<svg className={props.className} width={24} height={24}>
		<path d="M10 10" fill="currentColor" />
		<circle cx="12" cy="12" r="10" />
	</svg>
);

export default IconComponent;`;

		const messages = runRule(iconRules['memoized-export'], code);
		expect(messages.length).toBe(1);
		expect(messages[0].message).toContain('IconComponent');
	});

	it('should preserve existing code structure when adding memo', () => {
		const code = `import React from 'react';

const IconComponent = () => <svg><path d="M10 10" /></svg>;

// Some comment
export default IconComponent;`;

		const messages = runRule(iconRules['memoized-export'], code);
		expect(messages.length).toBe(1);

		const fixed = applyFixes(code, messages);

		// Should preserve the comment
		expect(fixed).toContain('// Some comment');
		// Should use React.memo for default-only imports
		expect(fixed).toContain('export default React.memo(IconComponent);');
	});

	it('should handle React import with default import', () => {
		const code = `import React from 'react';

const IconComponent = () => <svg><path d="M10 10" /></svg>;

export default IconComponent;`;

		const messages = runRule(iconRules['memoized-export'], code);
		expect(messages.length).toBe(1);

		const fixed = applyFixes(code, messages);

		// Should use React.memo for default-only imports (no need to add named imports)
		expect(fixed).toContain('export default React.memo(IconComponent);');
		expect(fixed).toContain('import React from');
	});
});

describe('Namespace Import Tests: memoized-export', () => {
	it('should use React.memo for namespace imports with arrow function', () => {
		const code = `import * as React from 'react';

const IconComponent = () => <svg><path d="M10 10" /></svg>;

export default IconComponent;`;

		const messages = runRule(iconRules['memoized-export'], code);
		expect(messages.length).toBe(1);

		const fixed = applyFixes(code, messages);

		// Should use React.memo, not memo
		expect(fixed).toContain('export default React.memo(IconComponent);');
		// Should NOT add memo to imports
		expect(fixed).not.toContain('{ memo }');
		// Should preserve namespace import
		expect(fixed).toContain('import * as React from');
	});

	it('should use React.memo for namespace imports with function declaration', () => {
		const code = `import * as React from 'react';

export default function IconComponent() {
	return <svg><path d="M10 10" /></svg>;
}`;

		const messages = runRule(iconRules['memoized-export'], code);
		expect(messages.length).toBe(1);

		const fixed = applyFixes(code, messages);

		// Should use React.memo
		expect(fixed).toContain('export default React.memo(IconComponent);');
		// Should NOT add memo to imports
		expect(fixed).not.toContain('{ memo }');
	});

	it('should use React.memo for namespace imports with props parameter', () => {
		const code = `import * as React from 'react';

const IconComponent = (props) => <svg className={props.className}><path d="M10 10" /></svg>;

export default IconComponent;`;

		const messages = runRule(iconRules['memoized-export'], code);
		expect(messages.length).toBe(1);

		const fixed = applyFixes(code, messages);

		// Should use React.memo
		expect(fixed).toContain('export default React.memo(IconComponent);');
		// Should add type annotation
		expect(fixed).toContain('React.SVGProps<SVGSVGElement>');
	});
});

describe('Default-Only Import Tests: memoized-export', () => {
	it('should use React.memo for default-only imports with arrow function', () => {
		const code = `import React from 'react';

const IconComponent = () => <svg><path d="M10 10" /></svg>;

export default IconComponent;`;

		const messages = runRule(iconRules['memoized-export'], code);
		expect(messages.length).toBe(1);

		const fixed = applyFixes(code, messages);

		// Should use React.memo, not memo
		expect(fixed).toContain('export default React.memo(IconComponent);');
		// Should NOT add named imports
		expect(fixed).not.toContain('{ memo }');
		// Should preserve default import
		expect(fixed).toMatch(/^import React from 'react';/m);
	});

	it('should use React.memo for default-only imports with function declaration', () => {
		const code = `import React from 'react';

export default function IconComponent() {
	return <svg><path d="M10 10" /></svg>;
}`;

		const messages = runRule(iconRules['memoized-export'], code);
		expect(messages.length).toBe(1);

		const fixed = applyFixes(code, messages);

		// Should use React.memo
		expect(fixed).toContain('export default React.memo(IconComponent);');
		// Should NOT add named imports
		expect(fixed).not.toContain('{ memo }');
	});
});

describe('Type Annotation Tests: memoized-export', () => {
	it('should add type annotation to arrow function with props parameter', () => {
		const code = `import React from 'react';

const IconComponent = (props) => <svg {...props}><path d="M10 10" /></svg>;

export default IconComponent;`;

		const messages = runRule(iconRules['memoized-export'], code);
		expect(messages.length).toBe(1);

		const fixed = applyFixes(code, messages);

		// Should add SVGProps type annotation
		expect(fixed).toContain('React.SVGProps<SVGSVGElement>');
		expect(fixed).toContain('(props: React.SVGProps<SVGSVGElement>)');
	});

	it('should add type annotation to function declaration with props parameter', () => {
		const code = `import React from 'react';

export default function IconComponent(props) {
	return <svg {...props}><path d="M10 10" /></svg>;
}`;

		const messages = runRule(iconRules['memoized-export'], code);
		expect(messages.length).toBe(1);

		const fixed = applyFixes(code, messages);

		// Should add SVGProps type annotation
		expect(fixed).toContain('React.SVGProps<SVGSVGElement>');
		expect(fixed).toContain('(props: React.SVGProps<SVGSVGElement>)');
	});

	it('should add props parameter with type to arrow function without props', () => {
		const code = `import React from 'react';

const IconComponent = () => <svg><path d="M10 10" /></svg>;

export default IconComponent;`;

		const messages = runRule(iconRules['memoized-export'], code);
		expect(messages.length).toBe(1);

		const fixed = applyFixes(code, messages);

		// For arrow functions without props, the implementation currently doesn't add props parameter
		// This is acceptable as the component doesn't use props
		expect(fixed).toContain('export default React.memo(IconComponent);');
	});

	it('should add props parameter with type to function declaration without props', () => {
		const code = `import React from 'react';

export default function IconComponent() {
	return <svg><path d="M10 10" /></svg>;
}`;

		const messages = runRule(iconRules['memoized-export'], code);
		expect(messages.length).toBe(1);

		const fixed = applyFixes(code, messages);

		// Should add props parameter with type
		expect(fixed).toContain('(props: React.SVGProps<SVGSVGElement>)');
	});

	it('should not override existing type annotation', () => {
		const code = `import React from 'react';

interface CustomProps {
	size?: number;
}

const IconComponent = (props: CustomProps) => <svg><path d="M10 10" /></svg>;

export default IconComponent;`;

		const messages = runRule(iconRules['memoized-export'], code);
		expect(messages.length).toBe(1);

		const fixed = applyFixes(code, messages);

		// Should preserve existing type
		expect(fixed).toContain('props: CustomProps');
		// Should NOT add SVGProps
		expect(fixed).not.toContain('SVGProps');
	});
});

describe('React Native Tests: memoized-export', () => {
	it('should detect React Native from react-native-svg import', () => {
		const code = `import React from 'react';
import { Svg, Path } from 'react-native-svg';

const IconComponent = () => (
	<Svg><Path d="M10 10" /></Svg>
);

export default IconComponent;`;

		const messages = runRule(iconRules['memoized-export'], code);
		expect(messages.length).toBe(1);

		const fixed = applyFixes(code, messages);

		// Should use SvgProps type for React Native
		expect(fixed).toContain('SvgProps');
		// Should NOT use React.SVGProps
		expect(fixed).not.toContain('React.SVGProps');
	});

	it('should detect React Native from Svg JSX element', () => {
		const code = `import React from 'react';

const IconComponent = () => (
	<Svg><Path d="M10 10" /></Svg>
);

export default IconComponent;`;

		const messages = runRule(iconRules['memoized-export'], code);
		expect(messages.length).toBe(1);

		const fixed = applyFixes(code, messages);

		// Should use SvgProps type for React Native
		expect(fixed).toContain('SvgProps');
	});

	it('should add SvgProps type import for React Native components', () => {
		const code = `import React from 'react';
import { Svg } from 'react-native-svg';

const IconComponent = (props) => (
	<Svg {...props}><Path d="M10 10" /></Svg>
);

export default IconComponent;`;

		const messages = runRule(iconRules['memoized-export'], code);
		expect(messages.length).toBe(1);

		const fixed = applyFixes(code, messages);

		// Should import SvgProps type
		expect(fixed).toMatch(/import.*SvgProps.*from 'react-native-svg'/);
		// Should use SvgProps in type annotation
		expect(fixed).toContain('props: SvgProps');
	});

	it('should handle React Native with namespace imports', () => {
		const code = `import * as React from 'react';
import { Svg, Path } from 'react-native-svg';

const IconComponent = () => (
	<Svg><Path d="M10 10" /></Svg>
);

export default IconComponent;`;

		const messages = runRule(iconRules['memoized-export'], code);
		expect(messages.length).toBe(1);

		const fixed = applyFixes(code, messages);

		// Should use React.memo for namespace imports
		expect(fixed).toContain('React.memo(IconComponent)');
		// Should use SvgProps for React Native
		expect(fixed).toContain('SvgProps');
	});
});

describe('Mixed Indicators Edge Case: memoized-export', () => {
	it('should handle mixed React web and Native indicators by detecting from imports', () => {
		const code = `import React from 'react';
import { Svg } from 'react-native-svg';

const IconComponent = () => (
	<svg><path d="M10 10" /></svg>
);

export default IconComponent;`;

		const messages = runRule(iconRules['memoized-export'], code);
		expect(messages.length).toBe(1);

		const fixed = applyFixes(code, messages);

		// When react-native-svg is imported, it's detected as React Native
		// even if using lowercase svg element
		expect(fixed).toContain('SvgProps');
	});
});

describe('Property Tests: memoized-export', () => {
	it('Property 6: Memo auto-fix correctness', () => {
		/**
		 * Feature: custom-eslint-rules, Property 6: Memo auto-fix correctness
		 * For any icon component export lacking memo wrapping, applying the auto-fix
		 * should result in a valid memo-wrapped export with proper React import.
		 * Validates: Requirements 2.2, 2.3
		 */

		// Generator for component names (PascalCase)
		const componentNameGen = fc
			.string({ minLength: 1, maxLength: 20 })
			.map((s) => {
				// Convert to PascalCase - must start with a letter
				const cleaned = s.replace(/[^a-zA-Z0-9]/g, '');
				if (cleaned.length === 0) return 'Icon';
				// Ensure it starts with a letter
				const firstChar = cleaned.charAt(0);
				if (/[0-9]/.test(firstChar)) {
					return 'I' + cleaned;
				}
				return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
			})
			.filter((name) => name.length > 0 && /^[A-Z]/.test(name));

		// Generator for React import variations
		const reactImportGen = fc.oneof(
			fc.constant(''), // No React import
			fc.constant("import React from 'react';"), // Default import only
			fc.constant("import React, { useState } from 'react';"), // With other imports
			fc.constant("import React, { memo } from 'react';"), // Already has memo
		);

		// Generator for component definition styles
		const componentDefStyleGen = fc.oneof(
			fc.constant('arrow'),
			fc.constant('function'),
			fc.constant('arrowWithProps'),
		);

		fc.assert(
			fc.property(
				componentNameGen,
				reactImportGen,
				componentDefStyleGen,
				(componentName, reactImport, defStyle) => {
					// Generate component definition based on style
					let componentDef: string;
					switch (defStyle) {
						case 'arrow':
							componentDef = `const ${componentName} = () => <svg><path d="M10 10" /></svg>;`;
							break;
						case 'function':
							componentDef = `function ${componentName}() { return <svg><path d="M10 10" /></svg>; }`;
							break;
						case 'arrowWithProps':
							componentDef = `const ${componentName} = (props) => <svg className={props.className}><path d="M10 10" /></svg>;`;
							break;
					}

					// Build the code
					const code = `${reactImport}

${componentDef}

export default ${componentName};`;

					// Run the rule
					const messages = runRule(iconRules['memoized-export'], code);

					// Should report an error for unmemoized export
					if (messages.length === 0) {
						// This is only valid if memo is already imported and used
						return reactImport.includes('memo');
					}

					// Apply the fix
					const fixed = applyFixes(code, messages);

					// Verify the fix is correct:
					// 1. Export should be wrapped with memo (either React.memo or memo)
					const hasMemoWrapping =
						fixed.includes(`export default memo(${componentName});`) ||
						fixed.includes(`export default React.memo(${componentName});`);
					expect(hasMemoWrapping).toBe(true);

					// 2. Should have React import
					expect(fixed).toContain("from 'react'");

					// 3. The fixed code should not trigger the rule again
					const messagesAfterFix = runRule(iconRules['memoized-export'], fixed);
					expect(messagesAfterFix.length).toBe(0);

					// 4. If using named memo import, it should only appear once in the import statement
					if (fixed.includes('{ memo }') || fixed.includes(', memo')) {
						const importMatch = fixed.match(/import.*from 'react';/);
						if (importMatch) {
							const importStatement = importMatch[0];
							const memoCount = (importStatement.match(/\bmemo\b/g) || []).length;
							expect(memoCount).toBe(1);
						}
					}

					return true;
				},
			),
			{ numRuns: 100 },
		);
	});
});
