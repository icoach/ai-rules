const fs = require('fs');
const path = require('path');
const yaml = require('yaml');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// --- Transformation Functions ---

function toCursorFormat(data, outputDir = '.cursor/rules') {
  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
  fs.mkdirSync(outputDir, { recursive: true });

  data.rules.forEach(rule => {
    const fileName = rule.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '') + '.mdc';
    const filePath = path.join(outputDir, fileName);

    let frontmatter = {
      description: rule.description
    };

    if (rule.globs) {
      if (typeof rule.globs === 'object' && rule.globs.alwaysApply !== undefined && !Array.isArray(rule.globs)) {
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

function toClaudeFormat(data, outputFile = 'CLAUDE.md') {
  let content = '# Custom Rules for Claude\n\n';
  data.rules.forEach(rule => {
    content += `## ${rule.name}\n\n`;
    content += `**Description:** ${rule.description}\n\n`;
    content += `${rule.content}\n\n`;
    content += '---\n\n';
  });
  fs.writeFileSync(outputFile, content);
  console.log(`Successfully created Claude rules in ${outputFile}`);
}

function toClineFormat(data, outputFile = '.clinerules') {
  const clineRules = {
    rules: data.rules.map(rule => ({
      name: rule.name,
      description: rule.description,
      content: rule.content
    }))
  };
  const yamlContent = yaml.stringify(clineRules);
  fs.writeFileSync(outputFile, yamlContent);
  console.log(`Successfully created Cline rules in ${outputFile}`);
}

function toCodexFormat(data, outputFile = 'AGENTS.md') {
  let content = '# Agent Instructions for Codex CLI\n\n';
  data.rules.forEach(rule => {
    content += `## ${rule.name}\n\n`;
    content += `**Description:** ${rule.description}\n\n`;
    content += `${rule.content}\n\n`;
    content += '---\n\n';
  });
  fs.writeFileSync(outputFile, content);
  console.log(`Successfully created Codex CLI rules in ${outputFile}`);
}

function toKiloCodeFormat(data, outputDir = '.kilocode/rules') {
  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
  fs.mkdirSync(outputDir, { recursive: true });

  data.rules.forEach(rule => {
    const fileName = rule.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '') + '.md';
    const filePath = path.join(outputDir, fileName);
    const fileContent = `# ${rule.name}\n\n**Description:** ${rule.description}\n\n${rule.content}\n`;
    fs.writeFileSync(filePath, fileContent);
  });
  console.log(`Successfully created Kilo Code rules in ${outputDir}`);
}

function toWindsurfFormat(data, outputDir = '.windsurf/rules') {
  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
  fs.mkdirSync(outputDir, { recursive: true });

  data.rules.forEach(rule => {
    const fileName = rule.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '') + '.md';
    const filePath = path.join(outputDir, fileName);
    const fileContent = `# Title: ${rule.name}\n\n## Description\n\n${rule.description}\n\n## Instructions\n\n${rule.content}\n`;
    fs.writeFileSync(filePath, fileContent);
  });
  console.log(`Successfully created Windsurf rules in ${outputDir}`);
}

function toJsonFormat(data) {
  console.log(JSON.stringify(data, null, 2));
}

// --- Main Script ---

const argv = yargs(hideBin(process.argv))
  .option('format', {
    alias: 'f',
    type: 'string',
    description: 'The output format (cursor, claude, cline, codex, kilo, windsurf, json)',
    demandOption: true,
  })
  .option('input', {
    alias: 'i',
    type: 'string',
    description: 'The input YAML file',
    default: 'rules.yaml',
  })
  .option('scope', {
    alias: 's',
    type: 'array',
    description: 'Filter rules by scope(s)',
  })
  .help()
  .alias('help', 'h')
  .argv;

try {
  const file = fs.readFileSync(argv.input, 'utf8');
  const data = yaml.parse(file);

  if (!data.rules) {
    throw new Error('The YAML file must have a root element named "rules".');
  }

  // Filter rules by scope if the --scope option is provided
  if (argv.scope && argv.scope.length > 0) {
    const scopes = argv.scope.map(s => s.toLowerCase());
    data.rules = data.rules.filter(rule =>
      rule.scope && rule.scope.some(s => scopes.includes(s.toLowerCase()))
    );
  }

  switch (argv.format.toLowerCase()) {
    case 'cursor':
      toCursorFormat(data);
      break;
    case 'claude':
      toClaudeFormat(data);
      break;
    case 'cline':
      toClineFormat(data);
      break;
    case 'codex':
      toCodexFormat(data);
      break;
    case 'kilo':
      toKiloCodeFormat(data);
      break;
    case 'windsurf':
      toWindsurfFormat(data);
      break;
    case 'json':
      toJsonFormat(data);
      break;
    default:
      console.error(`Error: Format '${argv.format}' is not supported.`);
      console.error('Supported formats are: cursor, claude, cline, codex, kilo, windsurf, json');
      process.exit(1);
  }

} catch (error) {
  console.error('Error processing the file:', error.message);
  process.exit(1);
}
