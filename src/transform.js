import fs from "fs";
import yaml from "yaml";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import {
  toCursorFormat,
  toClaudeFormat,
  toClineFormat,
  toCodexFormat,
  toKiloCodeFormat,
  toWindsurfFormat,
  toJsonFormat,
} from "./formatters.js";

export function transform(args = process.argv.slice(2)) {
  const argv = yargs(hideBin(["node", "transform", ...args]))
    .option("format", {
      alias: "f",
      type: "string",
      description:
        "The output format (cursor, claude, cline, codex, kilo, windsurf, json)",
      demandOption: true,
    })
    .option("input", {
      alias: "i",
      type: "string",
      description: "The input YAML file",
      default: "rules.yaml",
    })
    .option("scope", {
      alias: "s",
      type: "array",
      description: "Filter rules by scope(s)",
    })
    .help()
    .alias("help", "h").argv;

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

// If this module is run directly, execute the transform function
if (import.meta.url === `file://${process.argv[1]}`) {
  transform();
}
