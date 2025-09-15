# Components Inventory

## Core Application Components

### Transform Module
- **Component**: `transform`
- **Description**: Main transformation engine that processes YAML rules/commands and converts them to various AI assistant formats (Cursor, Claude, Cline, Codex, Kilo, Windsurf, JSON)
- **Filename**: `src/transform.js`

### Formatters Module
- **Component**: `formatters`
- **Description**: Collection of format-specific converter functions that handle output generation for different AI assistants and command formats
- **Filename**: `src/formatters.js`

### CLI Interface
- **Component**: `cli-interface`
- **Description**: Command-line interface wrapper using yargs for argument parsing and user interaction with the transformation tool
- **Filename**: `bin/transform.mjs`

## Formatter Components

### Cursor Formatter
- **Component**: `toCursorFormat`
- **Description**: Converts rules to Cursor IDE format (.cursor/rules/*.mdc files with YAML frontmatter)
- **Filename**: `src/formatters.js`

### Claude Formatter
- **Component**: `toClaudeFormat`
- **Description**: Converts rules to Claude format (CLAUDE.md file with structured markdown sections)
- **Filename**: `src/formatters.js`

### Cline Formatter
- **Component**: `toClineFormat`
- **Description**: Converts rules to Cline format (.clinerules YAML file)
- **Filename**: `src/formatters.js`

### Codex Formatter
- **Component**: `toCodexFormat`
- **Description**: Converts rules to Codex CLI format (AGENTS.md file with markdown structure)
- **Filename**: `src/formatters.js`

### Kilo Code Formatter
- **Component**: `toKiloCodeFormat`
- **Description**: Converts rules to Kilo Code format (.kilocode/rules/*.md files)
- **Filename**: `src/formatters.js`

### Windsurf Formatter
- **Component**: `toWindsurfFormat`
- **Description**: Converts rules to Windsurf format (.windsurf/rules/*.md files with title and sections)
- **Filename**: `src/formatters.js`

### JSON Formatter
- **Component**: `toJsonFormat`
- **Description**: Outputs rules in JSON format to console for programmatic use
- **Filename**: `src/formatters.js`

## Command Formatter Components

### Cursor Command Formatter
- **Component**: `toCursorCommandFormat`
- **Description**: Converts command definitions to Cursor IDE command format (.cursor/commands/*.md files)
- **Filename**: `src/formatters.js`

### Claude Command Formatter
- **Component**: `toClaudeCommandFormat`
- **Description**: Converts command definitions to Claude Code slash commands (.claude/commands/*.md files)
- **Filename**: `src/formatters.js`

### Cline Command Formatter
- **Component**: `toClineCommandFormat`
- **Description**: Converts command definitions to Cline slash commands (.cline/commands/*.md files)
- **Filename**: `src/formatters.js`

### Codex Command Formatter
- **Component**: `toCodexCommandFormat`
- **Description**: Converts command definitions to Codex CLI command format (COMMANDS.md file)
- **Filename**: `src/formatters.js`

### Kilo Command Formatter
- **Component**: `toKiloCommandFormat`
- **Description**: Converts command definitions to Kilo Code workflow format (.kilocode/workflows/*.md files)
- **Filename**: `src/formatters.js`

## Utility Components

### Output Checker
- **Component**: `checkOutputExists`
- **Description**: Utility function that handles file/directory existence checks and force overwrite logic for safe output generation
- **Filename**: `src/formatters.js`

### Ignore File Generator
- **Component**: `generateIgnoreFile`
- **Description**: Utility function that creates format-specific ignore files (.cursorignore, .claude/settings.json, .codex/config.json, .aiignore)
- **Filename**: `src/formatters.js`
