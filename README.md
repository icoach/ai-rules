# Rule Transformer

This project provides a simple script to transform a universal YAML format for AI rules into various platform-specific formats. This allows you to maintain a single source of truth for your custom rules and easily generate the necessary files for different AI coding assistants.

## Universal YAML Format

The universal format is defined in the `rules.yaml` file. It consists of a list of groups, where each group has a name and a list of rules. Each rule has a name and a prompt.

Here is an example of the `rules.yaml` format:

```yaml
groups:
  - name: Group 1
    rules:
      - name: Rule 1.1
        prompt: This is the prompt for rule 1.1
      - name: Rule 1.2
        prompt: This is the prompt for rule 1.2
  - name: Group 2
    rules:
      - name: Rule 2.1
        prompt: This is the prompt for rule 2.1
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
node transform.js --format <format> --input my_rules.yaml
```

## Output Formats

### Cursor (`--format cursor`)

This format generates a `.cursor/rules/` directory in your project. Each rule from the `rules.yaml` file is transformed into a separate `.mdc` file. The filename is a sanitized version of the rule name.

### Claude (`--format claude`)

This format generates a single `CLAUDE.md` file. The groups and rules from the `rules.yaml` file are formatted using Markdown headings.

### Cline (`--format cline`)

This format generates a single `cline-rules.txt` file. This is a plain text file that you can copy and paste into the Cline UI.

### JSON (`--format json`)

This format outputs the rules from the `rules.yaml` file as a JSON object to the console.
