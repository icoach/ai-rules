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
    globs: ["**/*.py"]
    content: |
      - Follow the PEP 8 style guide.
      - Use type hints for function signatures.
```

## Ignore Rules

The project supports ignore rules to exclude specific files and patterns from processing. These are defined in the `ignore.yaml` file and help filter out unwanted files during rule transformation.

### Ignore Rules Format

The ignore rules follow a structured YAML format similar to the main rules, but are specifically designed for file filtering:

```yaml
ignore_rules:
  - name: Version Control Files
    description: Ignore version control and git-related files
    scope: ['general', 'development']
    content:
      - .git/**
      - .gitignore
      - .gitattributes
      - .gitmodules

  - name: Node.js Dependencies
    description: Ignore Node.js dependencies and package manager files
    scope: ['general', 'development', 'build']
    content:
      - node_modules/**
      - "npm-debug.log*"
      - "yarn-debug.log*"
      - package-lock.json
```

Each ignore rule object has the following fields:

- `name`: (Required) A descriptive name for the ignore rule category
- `description`: (Required) Explains what types of files this rule ignores
- `scope`: (Optional) Defines the contexts where this ignore rule applies (e.g., `general`, `development`, `build`, `testing`)
- `content`: (Required) A list of glob patterns specifying which files to ignore

### Glob Pattern Syntax

The ignore rules support standard glob patterns:

- `**/*` - Matches all files in all subdirectories
- `*.ext` - Matches all files with a specific extension (must be quoted: `"*.ext"`)
- `dir/**` - Matches all files within a directory and its subdirectories
- `file.txt` - Matches a specific file
- `*pattern*` - Matches files containing a pattern (must be quoted: `"*pattern*"`)

**Important:** Patterns containing wildcards (`*`) must be quoted to prevent YAML parsing errors.

### Using Ignore Rules

The ignore rules are automatically applied during rule processing. You can:

1. **Modify existing categories**: Edit the patterns in any ignore rule category
2. **Add new categories**: Create additional ignore rule objects for project-specific needs
3. **Filter by scope**: Use scopes to apply ignore rules contextually
4. **Custom ignore file**: Specify a different ignore file using CLI options

### Examples

#### Adding Custom Ignore Rules

```yaml
ignore_rules:
  # ... existing rules ...
  
  - name: Project Specific Files
    description: Ignore project-specific files that shouldn't be processed
    scope: ['custom', 'project']
    content:
      - config/secrets/**
      - "*.backup"
      - legacy/**
      - temp-*
```

#### Scope-based Filtering

```yaml
ignore_rules:
  - name: Development Only
    description: Files to ignore only during development
    scope: ['development']
    content:
      - .vscode/**
      - "*.dev.js"
      
  - name: Production Only
    description: Files to ignore only in production builds
    scope: ['production']
    content:
      - "*.test.js"
      - __tests__/**
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
- `--ignore`: Ignore rules YAML file (default: `ignore.yaml`)
- `-s, --scope`: Filter rules by scope(s) - can be specified multiple times
- `--ignore-scope`: Filter ignore rules by scope(s) - can be specified multiple times
- `--force`: Force overwrite existing output files/directories
- `-h, --help`: Show help information

Example with all options:
```bash
npm install && npx ai-rules --format cursor --input custom_rules.yaml --ignore custom_ignore.yaml --scope frontend python --ignore-scope development --force
```

#### Ignore-specific Options

You can customize how ignore rules are applied:

```bash
# Use custom ignore file
npm install && npx ai-rules --format cursor --ignore my_ignore.yaml

# Apply only development-scoped ignore rules
npm install && npx ai-rules --format cursor --ignore-scope development

# Combine multiple ignore scopes
npm install && npx ai-rules --format cursor --ignore-scope development build

# Skip ignore rules entirely (process all files)
npm install && npx ai-rules --format cursor --ignore ""
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
