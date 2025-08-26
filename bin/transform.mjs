#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { transform } from "../src/transform.js";

const argv = yargs(hideBin(process.argv))
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
  .option("force", {
    type: "boolean",
    description: "Force overwrite existing output files/directories",
    default: false,
  })
  .help()
  .alias("help", "h").argv;

const scopes = argv.scope || [];

try {
  await transform({
    format: argv.format,
    scopes,
    inputPath: argv.input,
    cwd: process.cwd(),
    force: argv.force,
  });
} catch (err) {
  console.error(err?.stack || String(err));
  process.exit(1);
}
