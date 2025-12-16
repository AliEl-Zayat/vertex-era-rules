import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

/**
 * Default Prettier configuration
 */
export const DEFAULT_PRETTIER_CONFIG = {
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  useTabs: true,
  trailingComma: "es5" as const,
  printWidth: 100,
  bracketSpacing: true,
  arrowParens: "always" as const,
  endOfLine: "lf" as const,
};

/**
 * Possible Prettier config file names
 */
export const PRETTIER_CONFIG_FILES = [
  ".prettierrc",
  ".prettierrc.json",
  ".prettierrc.yml",
  ".prettierrc.yaml",
  ".prettierrc.js",
  ".prettierrc.cjs",
  ".prettierrc.mjs",
  "prettier.config.js",
  "prettier.config.cjs",
  "prettier.config.mjs",
  "prettier.config.ts",
];

export interface PrettierDetectionResult {
  found: boolean;
  path: string | null;
  config: Record<string, unknown> | null;
  source: "file" | "package.json" | "default" | null;
}

/**
 * Detect existing Prettier configuration in a project
 * @param projectRoot - The root directory of the project
 * @returns Detection result with config details
 */
export function detectPrettierConfig(
  projectRoot?: string
): PrettierDetectionResult {
  const rootDir = projectRoot || process.cwd();

  try {
    // Check for standalone prettier config files
    for (const configFile of PRETTIER_CONFIG_FILES) {
      const configPath = join(rootDir, configFile);
      if (existsSync(configPath)) {
        try {
          // For JSON files, we can read and parse them
          if (configFile.endsWith(".json") || configFile === ".prettierrc") {
            const content = readFileSync(configPath, "utf-8");
            const config = JSON.parse(content) as Record<string, unknown>;
            return {
              found: true,
              path: configPath,
              config,
              source: "file",
            };
          }
          // For JS/TS config files, we just note that they exist
          return {
            found: true,
            path: configPath,
            config: null, // Can't synchronously load JS/TS configs
            source: "file",
          };
        } catch {
          // Config file exists but couldn't be parsed
          return {
            found: true,
            path: configPath,
            config: null,
            source: "file",
          };
        }
      }
    }

    // Check for prettier config in package.json
    const packageJsonPath = join(rootDir, "package.json");
    if (existsSync(packageJsonPath)) {
      try {
        const content = readFileSync(packageJsonPath, "utf-8");
        const packageJson = JSON.parse(content) as {
          prettier?: Record<string, unknown>;
        };
        if (packageJson.prettier) {
          return {
            found: true,
            path: packageJsonPath,
            config: packageJson.prettier,
            source: "package.json",
          };
        }
      } catch {
        // package.json couldn't be parsed
      }
    }

    // No prettier config found
    return {
      found: false,
      path: null,
      config: null,
      source: null,
    };
  } catch {
    return {
      found: false,
      path: null,
      config: null,
      source: null,
    };
  }
}

/**
 * Create default Prettier config file if none exists
 * @param projectRoot - The root directory of the project
 * @returns Whether the config was created
 */
export function createDefaultPrettierConfig(projectRoot?: string): boolean {
  const rootDir = projectRoot || process.cwd();

  try {
    const detection = detectPrettierConfig(rootDir);

    // Don't create if config already exists
    if (detection.found) {
      return false;
    }

    const configPath = join(rootDir, ".prettierrc.json");
    const content = JSON.stringify(DEFAULT_PRETTIER_CONFIG, null, 2);

    writeFileSync(configPath, content + "\n", "utf-8");

    console.log(`✅ Created default Prettier config at ${configPath}`);
    return true;
  } catch (error) {
    console.warn("⚠️ Could not create Prettier config:", error);
    return false;
  }
}

/**
 * Get Prettier config for use with eslint-plugin-prettier
 * Returns existing config or default config
 * @param projectRoot - The root directory of the project
 * @returns Prettier configuration object
 */
export function getPrettierConfigForESLint(
  projectRoot?: string
): Record<string, unknown> {
  const rootDir = projectRoot || process.cwd();
  const detection = detectPrettierConfig(rootDir);

  if (detection.found && detection.config) {
    return detection.config;
  }

  // Return default config if none found
  return DEFAULT_PRETTIER_CONFIG;
}

/**
 * Resolve the path to the Prettier config file
 * @param projectRoot - The root directory of the project
 * @returns Absolute path to config or null
 */
export function resolvePrettierConfigPath(projectRoot?: string): string | null {
  const rootDir = projectRoot || process.cwd();
  const detection = detectPrettierConfig(rootDir);

  if (detection.found && detection.path) {
    return resolve(detection.path);
  }

  return null;
}









