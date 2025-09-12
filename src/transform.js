import fs from "fs";
import path from "path";
import yaml from "yaml";
import {
  toCursorFormat,
  toClaudeFormat,
  toClineFormat,
  toCodexFormat,
  toKiloCodeFormat,
  toWindsurfFormat,
  toJsonFormat,
  toCursorCommandFormat,
  toClaudeCommandFormat,
  toClineCommandFormat,
  toCodexCommandFormat,
  toKiloCommandFormat,
} from "./formatters.js";

/**
 * @typedef {Object} Rule
 * @property {string} name - The name of the rule
 * @property {string} description - Description of the rule
 * @property {string[]} [scope] - Array of scopes where the rule applies
 * @property {string} content - The rule content
 * @property {string[]} [globs] - Glob patterns for file matching
 */

/**
 * @typedef {Object} RulesData
 * @property {Rule[]} rules - Array of rules
 */

/**
 * @typedef {Object} IgnoreData
 * @property {Object[]} ignore_rules - Array of ignore rule objects
 */

/**
 * @typedef {Object} TransformOptions
 * @property {string} format - Output format (cursor, claude, cline, codex, kilo, windsurf, json)
 * @property {string} [type] - Type of content to transform (rules, commands)
 * @property {string[]} [scopes] - Array of scopes to filter by
 * @property {string} [inputPath] - Path to input YAML file
 * @property {string} [cwd] - Working directory to change to
 * @property {boolean} [force] - Whether to overwrite existing files
 */

/**
 * Transforms rules or commands from YAML format to various AI assistant formats
 * @param {TransformOptions} [options] - Transform configuration options
 * @returns {void}
 */
export function transform({
  format,
  type = "rules",
  scopes = [],
  inputPath,
  cwd = process.cwd(),
  force = false,
} = {}) {
  // Auto-detect input path based on type if not provided
  if (!inputPath) {
    inputPath = type === "commands" ? "commands.yaml" : "rules.yaml";
  }
  // Change to the specified working directory if provided
  if (cwd && cwd !== process.cwd()) {
    process.chdir(cwd);
  }

  const argv = {
    format,
    type,
    input: inputPath,
    scope: scopes,
  };

  // Check if the input file exists
  if (!fs.existsSync(argv.input)) {
    const defaultFile =
      argv.type === "commands" ? "commands.yaml" : "rules.yaml";
    const rootDefaultPath = path.resolve(process.cwd(), defaultFile);

    if (argv.input !== defaultFile && fs.existsSync(rootDefaultPath)) {
      console.error(`Error: Input file '${argv.input}' does not exist.`);
      console.error(
        `However, '${defaultFile}' was found in the root directory: ${rootDefaultPath}`
      );
      console.error(
        "Consider using the default or specify the correct path with --input flag."
      );
    } else if (argv.input === defaultFile) {
      console.error(
        `Error: '${defaultFile}' file not found in the current directory: ${process.cwd()}`
      );
      console.error(
        `Please ensure the ${defaultFile} file exists or specify a different input file with --input flag.`
      );
    } else {
      console.error(`Error: Input file '${argv.input}' does not exist.`);
      if (!fs.existsSync(rootDefaultPath)) {
        console.error(
          `Also, '${defaultFile}' was not found in the root directory.`
        );
      }
    }
    process.exit(1);
  }

  try {
    const file = fs.readFileSync(argv.input, "utf8");
    const data = yaml.parse(file);

    // Determine if this is a rules file or ignore file
    const isIgnoreFile = data.ignore_rules && !data.rules;
    const isRulesFile = data.rules && !data.ignore_rules;

    if (!isIgnoreFile && !isRulesFile) {
      throw new Error(
        'The YAML file must have a root element named "rules" or "ignore_rules".'
      );
    }

    // If processing ignore.yaml directly, convert ignore rules to rules format
    if (isIgnoreFile) {
      data.rules = data.ignore_rules.map((rule) => ({
        name: rule.name,
        description: rule.description,
        scope: rule.scope,
        content: Array.isArray(rule.content)
          ? rule.content.join("\n")
          : rule.content,
      }));
    }

    // Filter rules by scope if the --scope option is provided
    if (argv.scope && argv.scope.length > 0) {
      const scopes = argv.scope.map((s) => s.toLowerCase());
      data.rules = data.rules.filter(
        (rule) =>
          rule.scope && rule.scope.some((s) => scopes.includes(s.toLowerCase()))
      );
    }

    // Read and parse ignore.yaml if it exists and we're processing rules.yaml
    let ignoreData = null;
    if (isRulesFile) {
      const ignorePath = path.join(path.dirname(argv.input), "ignore.yaml");
      if (fs.existsSync(ignorePath)) {
        const ignoreFile = fs.readFileSync(ignorePath, "utf8");
        const parsedIgnore = yaml.parse(ignoreFile);

        // Handle new structured format
        if (parsedIgnore && parsedIgnore.ignore_rules) {
          // Filter ignore rules by scope if specified
          let filteredIgnoreRules = parsedIgnore.ignore_rules;
          if (argv.scope && argv.scope.length > 0) {
            const scopes = argv.scope.map((s) => s.toLowerCase());
            filteredIgnoreRules = parsedIgnore.ignore_rules.filter(
              (rule) =>
                rule.scope &&
                rule.scope.some((s) => scopes.includes(s.toLowerCase()))
            );
          }

          // Flatten content arrays into a single array for backward compatibility
          ignoreData = filteredIgnoreRules
            .map((rule) => rule.content || [])
            .flat()
            .filter(Boolean);
        } else if (Array.isArray(parsedIgnore)) {
          // Handle legacy flat array format
          ignoreData = parsedIgnore;
        }
      }
    }

    // Route to appropriate formatter based on type
    if (argv.type === "commands") {
      switch (argv.format.toLowerCase()) {
        case "cursor":
          toCursorCommandFormat(data, undefined, force);
          break;
        case "claude":
          toClaudeCommandFormat(data, undefined, force);
          break;
        case "cline":
          toClineCommandFormat(data, undefined, force);
          break;
        case "codex":
          toCodexCommandFormat(data, undefined, force);
          break;
        case "kilo":
          toKiloCommandFormat(data, undefined, force);
          break;
        case "json":
          toJsonFormat(data);
          break;
        default:
          console.error(
            `Error: Format '${argv.format}' is not supported for commands.`
          );
          console.error(
            "Supported formats for commands are: cursor, claude, cline, codex, kilo, json"
          );
          process.exit(1);
      }
    } else {
      // Default rules handling
      switch (argv.format.toLowerCase()) {
        case "cursor":
          toCursorFormat(data, undefined, force, ignoreData);
          break;
        case "claude":
          toClaudeFormat(data, undefined, force, ignoreData);
          break;
        case "cline":
          toClineFormat(data, undefined, force, ignoreData);
          break;
        case "codex":
          toCodexFormat(data, undefined, force, ignoreData);
          break;
        case "kilo":
          toKiloCodeFormat(data, undefined, force, ignoreData);
          break;
        case "windsurf":
          toWindsurfFormat(data, undefined, force, ignoreData);
          break;
        case "json":
          toJsonFormat(data);
          break;
        default:
          console.error(`Error: Format '${argv.format}' is not supported.`);
          console.error(
            "Supported formats are: cursor, claude, cline, codex, kilo, windsurf, json"
          );
          process.exit(1);
      }
    }
  } catch (error) {
    console.error("Error processing the file:", error.message);
    process.exit(1);
  }
}

// If this module is run directly, execute the transform function with CLI args
if (import.meta.url === `file://${process.argv[1]}`) {
  // Parse command line arguments manually for direct execution
  const args = process.argv.slice(2);
  const format =
    args.find((arg) => arg.startsWith("--format="))?.split("=")[1] ||
    args[args.indexOf("--format") + 1];
  const type =
    args.find((arg) => arg.startsWith("--type="))?.split("=")[1] ||
    args[args.indexOf("--type") + 1] ||
    "rules";
  const inputPath =
    args.find((arg) => arg.startsWith("--input="))?.split("=")[1] ||
    args[args.indexOf("--input") + 1];

  if (!format) {
    console.error(
      "Missing --format. Supported: cursor | claude | cline | codex | kilo | windsurf | json"
    );
    process.exit(1);
  }

  transform({ format, type, inputPath });
}
