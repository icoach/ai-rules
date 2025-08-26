import fs from "fs";
import path from "path";
import yaml from "yaml";

export function toCursorFormat(data, outputDir = ".cursor/rules") {
  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
  fs.mkdirSync(outputDir, { recursive: true });

  data.rules.forEach((rule) => {
    const fileName =
      rule.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "") + ".mdc";
    const filePath = path.join(outputDir, fileName);

    let frontmatter = {
      description: rule.description,
    };

    if (rule.globs) {
      if (
        typeof rule.globs === "object" &&
        rule.globs.alwaysApply !== undefined &&
        !Array.isArray(rule.globs)
      ) {
        frontmatter.alwaysApply = rule.globs.alwaysApply;
      } else {
        frontmatter.globs = rule.globs;
      }
    }

    const fileContent = `---
${yaml.stringify(frontmatter)}---
${rule.content}
`;
    fs.writeFileSync(filePath, fileContent);
  });
  console.log(`Successfully created Cursor rules in ${outputDir}`);
}

export function toClaudeFormat(data, outputFile = "CLAUDE.md") {
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

export function toClineFormat(data, outputFile = ".clinerules") {
  const clineRules = {
    rules: data.rules.map((rule) => ({
      name: rule.name,
      description: rule.description,
      content: rule.content,
    })),
  };
  const yamlContent = yaml.stringify(clineRules);
  fs.writeFileSync(outputFile, yamlContent);
  console.log(`Successfully created Cline rules in ${outputFile}`);
}

export function toCodexFormat(data, outputFile = "AGENTS.md") {
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

export function toKiloCodeFormat(data, outputDir = ".kilocode/rules") {
  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
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

export function toWindsurfFormat(data, outputDir = ".windsurf/rules") {
  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
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
