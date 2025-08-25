# Rule Transformer

This project provides a simple script to transform a universal YAML format for AI rules into various platform-specific formats. This allows you to maintain a single source of truth for your custom rules and easily generate the necessary files for different AI coding assistants.

## Universal YAML Format

The universal format is defined in the `rules.yaml` file. It consists of a root `rules` element, which is a list of individual rule objects. Each rule object has the following fields:

- `name`: (Required) A string that identifies the rule. This is used for the filename in formats that require one file per rule (e.g., Cursor).
- `description`: (Required) A string that describes the purpose of the rule.
- `content`: (Required) A string that contains the body of the rule or prompt.
- `globs`: (Optional) A list of glob patterns or a map to specify which files the rule applies to. This is primarily used by the Cursor format. If omitted, a default behavior is applied.

Here is an example of the `rules.yaml` format:

```yaml
rules:
  - name: General Coding Rules
    description: These are general coding rules
    globs:
      alwaysApply: true
    content: |
      - Use clear and descriptive variable names.
      - Write comments to explain complex logic.

  - name: Python Specific Rules
    description: Rules for writing Python code
    globs:
      - "**/*.py"
    content: |
      - Follow the PEP 8 style guide.
      - Use type hints for function signatures.
```

## Usage

The `transform.js` script is used to perform the transformations. You need to have Node.js and npm installed to run the script.

First, install the dependencies and run the script in a single command. This is necessary because the `node_modules` directory may not be persisted between commands in all environments.

```bash
npm install && node transform.js --format <format>
```

Replace `<format>` with one of the supported formats: `cursor`, `claude`, `cline`, or `json`.

You can also specify a different input file using the `--input` or `-i` flag:
```bash
npm install && node transform.js --format <format> --input my_rules.yaml
```

## Output Formats

### Cursor (`--format cursor`)

This format generates a `.cursor/rules/` directory in your project. Each rule from the `rules.yaml` file is transformed into a separate `.mdc` file. The filename is a sanitized version of the rule `name`. The `description` and `globs` fields are used to generate the frontmatter for each file.

### Claude (`--format claude`)

This format generates a single `CLAUDE.md` file. Each rule is formatted with its name as a heading, followed by its description and content.

### Cline (`--format cline`)

This format generates a single `cline-rules.txt` file. This is a plain text file with all the rules, which you can copy and paste into the Cline UI.

### JSON (`--format json`)

This format outputs the rules from the `rules.yaml` file as a JSON object to the console.
