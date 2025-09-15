#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { transform } from "../src/transform.js";

const argv = yargs(hideBin(process.argv))
  .option("format", {
    alias: "f",
    type: "string",
    description:
      "The output format (cursor, claude, cline, codex, kilo, windsurf, json). If not specified, generates cursor, claude, and windsurf formats.",
    demandOption: false,
  })
  .option("type", {
    alias: "t",
    type: "string",
    description: "Type of content to transform (rules, commands)",
    choices: ["rules", "commands"],
    default: "rules",
  })
  .option("input", {
    alias: "i",
    type: "string",
    description:
      "The input YAML file (auto-detected based on type if not specified)",
  })
  .option("scope", {
    alias: "s",
    type: "array",
    description: "Filter rules/commands by scope(s)",
  })
  .option("force", {
    type: "boolean",
    description: "Force overwrite existing output files/directories",
    default: false,
  })
  .help()
  .alias("help", "h").argv;

const scopes = argv.scope || [];

try {
  // If no format specified, generate the main formats
  if (!argv.format) {
    // Different default formats for rules vs commands
    const mainFormats =
      argv.type === "commands"
        ? ["cursor", "claude", "cline"]
        : ["cursor", "claude", "windsurf"];

    console.log(
      `No format specified. Generating main ${argv.type} formats:`,
      mainFormats.join(", ")
    );

    for (const format of mainFormats) {
      console.log(`\nGenerating ${format} format...`);
      await transform({
        format,
        type: argv.type,
        scopes: format === "claude" ? ["python", "docs"] : scopes,
        inputPath: argv.input,
        cwd: process.cwd(),
        force: argv.force,
      });
    }
  } else {
    await transform({
      format: argv.format,
      type: argv.type,
      scopes,
      inputPath: argv.input,
      cwd: process.cwd(),
      force: argv.force,
    });
  }
} catch (err) {
  console.error(err?.stack || String(err));
  process.exit(1);
}
