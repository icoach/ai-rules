# AI Rules

This project provides a simple script to transform a universal YAML format for AI rules into various platform-specific formats. This allows you to maintain a single source of truth for your custom rules and easily generate the necessary files for different AI coding assistants.

## Universal YAML Format

The universal format is defined in the `rules.yaml` file. It consists of a root `rules` element, which is a list of individual rule objects. Each rule object has the following fields:

- `name`: (Required) A string that identifies the rule. This is used for the filename in formats that require one file per rule.
- `description`: (Required) A string that describes the purpose of the rule.
- `content`: (Required) A string that contains the body of the rule or prompt.
- `scope`: (Optional) A list of strings that define the scope(s) of the rule (e.g., `frontend`, `python`, `docs`).
- `globs`: (Optional) A list of glob patterns or a map to specify which files the rule applies to. This is primarily used by the Cursor format.

Here is an example of the `rules.yaml` format:

```yaml
rules:
  - name: General Coding Rules
    description: These are general coding rules
    scope: ['general', 'frontend']
    content: |
      - Use clear and descriptive variable names.
      - Write comments to explain complex logic.

  - name: Python Specific Rules
    description: Rules for writing Python code
    scope: ['python', 'backend']
    globs:
      - "**/*.py"
    content: |
      - Follow the PEP 8 style guide.
      - Use type hints for function signatures.
```

## Usage

The rule transformer can be used as a CLI tool. You need to have Node.js and npm installed to run the script.

First, install the dependencies and run the CLI command. This is necessary because the `node_modules` directory may not be persisted between commands in all environments.

```bash
npm install && npx ai-rules --format <format>
```

Alternatively, you can run the CLI directly:

```bash
npm install && node bin/transform.mjs --format <format>
```

Replace `<format>` with one of the supported formats: `cursor`, `claude`, `cline`, `codex`, `kilo`, `windsurf`, or `json`.

### Filtering by Scope

You can filter the rules by scope using the `--scope` or `-s` flag. You can provide one or more scopes. Only the rules that match at least one of the provided scopes will be processed.

```bash
# Process only rules with the 'frontend' scope
npm install && npx ai-rules --format cursor --scope frontend

# Process rules with either the 'python' or 'docs' scope
npm install && npx ai-rules --format claude --scope python docs
```

You can also specify a different input file using the `--input` or `-i` flag:
```bash
npm install && npx ai-rules --format <format> --input my_rules.yaml
```

### Overwrite Protection

By default, the script prevents overwriting existing output files and directories to avoid accidental data loss. If you try to run the script when output already exists, you'll see an error message:

```bash
npm install && npx ai-rules --format cursor
# Error: Directory '.cursor/rules' already exists.
# Use --force flag to overwrite existing output.
```

To intentionally overwrite existing output, use the `--force` flag:

```bash
# Force overwrite existing output
npm install && npx ai-rules --format cursor --force
```

This protection applies to all output formats:
- **Directory-based formats** (cursor, kilo, windsurf): Protects output directories
- **File-based formats** (claude, cline, codex): Protects output files

### CLI Options

The CLI supports the following options:

- `-f, --format`: **(Required)** The output format (cursor, claude, cline, codex, kilo, windsurf, json)
- `-i, --input`: Input YAML file (default: `rules.yaml`)
- `-s, --scope`: Filter rules by scope(s) - can be specified multiple times
- `--force`: Force overwrite existing output files/directories
- `-h, --help`: Show help information

Example with all options:
```bash
npm install && npx ai-rules --format cursor --input custom_rules.yaml --scope frontend python --force
```

## Output Formats

### Cursor (`--format cursor`)

Generates a `.cursor/rules/` directory with a `.mdc` file for each rule. The `description` and `globs` from the rule are used to generate the frontmatter.

### Claude (`--format claude`)

Generates a single `CLAUDE.md` file. Each rule is formatted with its name, description, and content.

### Cline (`--format cline`)

Generates a `.clinerules` file with the rules in a simple YAML format.

### Codex CLI (`--format codex`)

Generates an `AGENTS.md` file suitable for use with the Codex CLI.

### Kilo Code (`--format kilo`)

Generates a `.kilocode/rules/` directory with a simple `.md` file for each rule.

### Windsurf (`--format windsurf`)

Generates a `.windsurf/rules/` directory with a `.md` file for each rule, formatted with Title, Description, and Instructions sections.

### JSON (`--format json`)

Outputs the rules from the `rules.yaml` file as a JSON object to the console.
