#!/usr/bin/env node
import minimist from "minimist";
import { transform } from "../src/transform.js"; // nebo "../dist/transform.js"

const argv = minimist(process.argv.slice(2), {
  string: ["format", "input"],
  alias: { s: "scope", i: "input" },
  default: { input: "rules.yaml" },
});
// argv.scope může být string nebo pole
const scopes = Array.isArray(argv.scope)
  ? argv.scope
  : argv.scope
  ? [argv.scope]
  : [];

if (!argv.format) {
  console.error(
    "Missing --format. Supported: cursor | claude | cline | codex | kilo | windsurf | json"
  );
  process.exit(1);
}

try {
  await transform({
    format: argv.format,
    scopes,
    inputPath: argv.input,
    cwd: process.cwd(),
  });
} catch (err) {
  console.error(err?.stack || String(err));
  process.exit(1);
}
