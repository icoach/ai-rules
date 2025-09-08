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
} from "./formatters.js";

export function transform({
  format,
  scopes = [],
  inputPath = "rules.yaml",
  cwd = process.cwd(),
  force = false,
} = {}) {
  // Change to the specified working directory if provided
  if (cwd && cwd !== process.cwd()) {
    process.chdir(cwd);
  }

  const argv = {
    format,
    input: inputPath,
    scope: scopes,
  };

  // Check if the input file exists
  if (!fs.existsSync(argv.input)) {
    // If the specified input file doesn't exist, check for rules.yaml in root
    const rootRulesPath = path.resolve(process.cwd(), "rules.yaml");

    if (argv.input !== "rules.yaml" && fs.existsSync(rootRulesPath)) {
      console.error(`Error: Input file '${argv.input}' does not exist.`);
      console.error(
        `However, 'rules.yaml' was found in the root directory: ${rootRulesPath}`
      );
      console.error(
        "Consider using the default or specify the correct path with --input flag."
      );
    } else if (argv.input === "rules.yaml") {
      console.error(
        `Error: 'rules.yaml' file not found in the current directory: ${process.cwd()}`
      );
      console.error(
        "Please ensure the rules.yaml file exists or specify a different input file with --input flag."
      );
    } else {
      console.error(`Error: Input file '${argv.input}' does not exist.`);
      if (!fs.existsSync(rootRulesPath)) {
        console.error(
          "Also, 'rules.yaml' was not found in the root directory."
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
  const inputPath =
    args.find((arg) => arg.startsWith("--input="))?.split("=")[1] ||
    args[args.indexOf("--input") + 1] ||
    "rules.yaml";

  if (!format) {
    console.error(
      "Missing --format. Supported: cursor | claude | cline | codex | kilo | windsurf | json"
    );
    process.exit(1);
  }

  transform({ format, inputPath });
}
