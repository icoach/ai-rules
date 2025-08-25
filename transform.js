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
      frontmatter.globs = rule.globs;
    } else {
      frontmatter.alwaysApply = false; // Default if no globs are provided
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

function toClineFormat(data, outputFile = 'cline-rules.txt') {
  let content = 'Custom Rules for Cline\n======================\n\n';
  data.rules.forEach(rule => {
    content += `Rule: ${rule.name}\n`;
    content += `Description: ${rule.description}\n`;
    content += '-----------------\n';
    content += `${rule.content}\n\n`;
  });
  fs.writeFileSync(outputFile, content);
  console.log(`Successfully created Cline rules in ${outputFile}`);
}

function toJsonFormat(data) {
  console.log(JSON.stringify(data, null, 2));
}

// --- Main Script ---

const argv = yargs(hideBin(process.argv))
  .option('format', {
    alias: 'f',
    type: 'string',
    description: 'The output format (cursor, claude, cline, json)',
    demandOption: true,
  })
  .option('input', {
    alias: 'i',
    type: 'string',
    description: 'The input YAML file',
    default: 'rules.yaml',
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
    case 'json':
      toJsonFormat(data);
      break;
    default:
      console.error(`Error: Format '${argv.format}' is not supported.`);
      console.error('Supported formats are: cursor, claude, cline, json');
      process.exit(1);
  }

} catch (error) {
  console.error('Error processing the file:', error.message);
  process.exit(1);
}
