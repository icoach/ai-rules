import fs from "fs";
import path from "path";
import yaml from "yaml";

// Helper function to check if output exists and handle force logic
function checkOutputExists(outputPath, force, type = "directory") {
  if (fs.existsSync(outputPath)) {
    if (!force) {
      console.error(
        `Error: ${
          type === "directory" ? "Directory" : "File"
        } '${outputPath}' already exists.`
      );
      console.error("Use --force flag to overwrite existing output.");
      process.exit(1);
    }
    // If force is true, remove the existing output
    if (type === "directory") {
      fs.rmSync(outputPath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(outputPath);
    }
  }
}

export function toCursorFormat(
  data,
  outputDir = ".cursor/rules",
  force = false
) {
  checkOutputExists(outputDir, force, "directory");
  fs.mkdirSync(outputDir, { recursive: true });

  data.rules.forEach((rule) => {
    const fileName =
      rule.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "") + ".mdc";
    const filePath = path.join(outputDir, fileName);

    let frontmatter = {
      description: rule.description,
      alwaysApply: true,
    };

    if (rule.globs) {
      // Cursor expects globs as comma-separated string
      frontmatter.globs = Array.isArray(rule.globs)
        ? rule.globs.join(",")
        : rule.globs;
    }

    const fileContent = `---
${yaml.stringify(frontmatter)}---
${rule.content}
`;
    fs.writeFileSync(filePath, fileContent);
  });
  console.log(`Successfully created Cursor rules in ${outputDir}`);
}

export function toClaudeFormat(data, outputFile = "CLAUDE.md", force = false) {
  checkOutputExists(outputFile, force, "file");
  let content = "# Custom Rules for Claude\n\n";
  data.rules.forEach((rule) => {
    content += `## ${rule.name}\n\n`;
    content += `**Description:** ${rule.description}\n\n`;
    content += `${rule.content}\n\n`;
    content += "---\n\n";
  });
  fs.writeFileSync(outputFile, content);
  console.log(`Successfully created Claude rules in ${outputFile}`);
}

export function toClineFormat(data, outputFile = ".clinerules", force = false) {
  checkOutputExists(outputFile, force, "file");
  const clineRules = {
    rules: data.rules.map((rule) => {
      const clineRule = {
        name: rule.name,
        description: rule.description,
        content: rule.content,
      };
      // Include globs if they exist (keep as array for YAML)
      if (rule.globs) {
        clineRule.globs = rule.globs;
      }
      return clineRule;
    }),
  };
  const yamlContent = yaml.stringify(clineRules);
  fs.writeFileSync(outputFile, yamlContent);
  console.log(`Successfully created Cline rules in ${outputFile}`);
}

export function toCodexFormat(data, outputFile = "AGENTS.md", force = false) {
  checkOutputExists(outputFile, force, "file");
  let content = "# Agent Instructions for Codex CLI\n\n";
  data.rules.forEach((rule) => {
    content += `## ${rule.name}\n\n`;
    content += `**Description:** ${rule.description}\n\n`;
    content += `${rule.content}\n\n`;
    content += "---\n\n";
  });
  fs.writeFileSync(outputFile, content);
  console.log(`Successfully created Codex CLI rules in ${outputFile}`);
}

export function toKiloCodeFormat(
  data,
  outputDir = ".kilocode/rules",
  force = false
) {
  checkOutputExists(outputDir, force, "directory");
  fs.mkdirSync(outputDir, { recursive: true });

  data.rules.forEach((rule) => {
    const fileName =
      rule.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "") + ".md";
    const filePath = path.join(outputDir, fileName);
    const fileContent = `# ${rule.name}\n\n**Description:** ${rule.description}\n\n${rule.content}\n`;
    fs.writeFileSync(filePath, fileContent);
  });
  console.log(`Successfully created Kilo Code rules in ${outputDir}`);
}

export function toWindsurfFormat(
  data,
  outputDir = ".windsurf/rules",
  force = false
) {
  checkOutputExists(outputDir, force, "directory");
  fs.mkdirSync(outputDir, { recursive: true });

  data.rules.forEach((rule) => {
    const fileName =
      rule.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "") + ".md";
    const filePath = path.join(outputDir, fileName);
    const fileContent = `# Title: ${rule.name}\n\n## Description\n\n${rule.description}\n\n## Instructions\n\n${rule.content}\n`;
    fs.writeFileSync(filePath, fileContent);
  });
  console.log(`Successfully created Windsurf rules in ${outputDir}`);
}

export function toJsonFormat(data) {
  console.log(JSON.stringify(data, null, 2));
}
