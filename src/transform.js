import fs from "fs";
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

  try {
    const file = fs.readFileSync(argv.input, "utf8");
    const data = yaml.parse(file);

    if (!data.rules) {
      throw new Error('The YAML file must have a root element named "rules".');
    }

    // Filter rules by scope if the --scope option is provided
    if (argv.scope && argv.scope.length > 0) {
      const scopes = argv.scope.map((s) => s.toLowerCase());
      data.rules = data.rules.filter(
        (rule) =>
          rule.scope && rule.scope.some((s) => scopes.includes(s.toLowerCase()))
      );
    }

    switch (argv.format.toLowerCase()) {
      case "cursor":
        toCursorFormat(data);
        break;
      case "claude":
        toClaudeFormat(data);
        break;
      case "cline":
        toClineFormat(data);
        break;
      case "codex":
        toCodexFormat(data);
        break;
      case "kilo":
        toKiloCodeFormat(data);
        break;
      case "windsurf":
        toWindsurfFormat(data);
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
