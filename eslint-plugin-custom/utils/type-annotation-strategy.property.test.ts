import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import {
	getTypeAnnotationStrategy,
	IconEnvironment,
	ReactImportStyle,
} from './ast-helpers';

describe('Property Tests: Type Annotation Strategy', () => {
	it('Property 7: React web components get SVGProps type', () => {
		/**
		 * Feature: icon-memoize-react-import-handling, Property 7: React web components get SVGProps type
		 * For any React web icon component, the type annotation strategy should return
		 * React.SVGProps<SVGSVGElement> as the props type.
		 * Validates: Requirements 6.1, 7.3
		 */

		// Generator for all React import styles
		const importStyleGen = fc.constantFrom(
			ReactImportStyle.NAMESPACE,
			ReactImportStyle.DEFAULT_ONLY,
			ReactImportStyle.NAMED_ONLY,
			ReactImportStyle.MIXED,
			ReactImportStyle.NONE,
		);

		fc.assert(
			fc.property(importStyleGen, (importStyle) => {
				// Get type annotation strategy for React web
				const strategy = getTypeAnnotationStrategy(
					IconEnvironment.REACT_WEB,
					importStyle,
				);

				// Verify React web components get React.SVGProps<SVGSVGElement> type
				expect(strategy.propsType).toBe('React.SVGProps<SVGSVGElement>');

				// Verify no type import is needed for React web
				expect(strategy.needsTypeImport).toBe(false);
				expect(strategy.typeImportSource).toBeNull();
				expect(strategy.needsComponentImport).toBe(false);
			}),
			{ numRuns: 100 },
		);
	});

	it('Property 10: React Native components use SvgProps type', () => {
		/**
		 * Feature: icon-memoize-react-import-handling, Property 10: React Native components use SvgProps type
		 * For any React Native icon component, the type annotation strategy should return
		 * SvgProps as the props type.
		 * Validates: Requirements 7.3
		 */

		// Generator for all React import styles
		const importStyleGen = fc.constantFrom(
			ReactImportStyle.NAMESPACE,
			ReactImportStyle.DEFAULT_ONLY,
			ReactImportStyle.NAMED_ONLY,
			ReactImportStyle.MIXED,
			ReactImportStyle.NONE,
		);

		fc.assert(
			fc.property(importStyleGen, (importStyle) => {
				// Get type annotation strategy for React Native
				const strategy = getTypeAnnotationStrategy(
					IconEnvironment.REACT_NATIVE,
					importStyle,
				);

				// Verify React Native components get SvgProps type
				expect(strategy.propsType).toBe('SvgProps');

				// Verify type import is needed from react-native-svg
				expect(strategy.needsTypeImport).toBe(true);
				expect(strategy.typeImportSource).toBe('react-native-svg');
				expect(strategy.needsComponentImport).toBe(true);
			}),
			{ numRuns: 100 },
		);
	});
});
