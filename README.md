# AI Rules

A script to transform YAML rules into various formats for different AI coding assistants.

## Installation

```bash
# Clone and install dependencies
git clone <repo-url>
cd ai-rules
pnpm install
```

## Usage

### Generate Rules

```bash
# Simple - generates all main rule formats (cursor, claude, windsurf)
pnpm run build
# or directly
node bin/transform.mjs

# Specific rule formats
pnpm run build:cursor     # Cursor format only
pnpm run build:claude     # Claude format only  
pnpm run build:windsurf   # Windsurf format only
pnpm run build:cline      # Cline format only
```

### Generate Commands

```bash
# Simple - generates main command formats (cursor, claude, cline)
pnpm run build:commands
# or directly
node bin/transform.mjs --type commands

# Specific command formats (use direct command)
node bin/transform.mjs --format cursor --type commands
node bin/transform.mjs --format claude --type commands
node bin/transform.mjs --format cline --type commands
```

### Testing

```bash
pnpm test              # Run tests
pnpm test:watch        # Watch mode
pnpm test:coverage     # With coverage
```

### Advanced Usage

```bash
# Generate specific format
node bin/transform.mjs --format cursor

# Generate commands instead of rules
node bin/transform.mjs --format cursor --type commands

# With specific scopes (for claude format)
node bin/transform.mjs --format claude --scope python docs

# Force overwrite existing files
node bin/transform.mjs --force

# Pass additional args to npm scripts using --
pnpm run build:cursor -- --type commands
```

## Available Scripts

- `pnpm run build` - Generate all main rule formats
- `pnpm run build:commands` - Generate all main command formats
- `pnpm run build:cursor` - Generate cursor rules
- `pnpm run build:claude` - Generate claude rules
- `pnpm run build:windsurf` - Generate windsurf rules  
- `pnpm run build:cline` - Generate cline rules

## Available Formats

### Rules
- **cursor**: Cursor IDE format
- **claude**: Claude AI format
- **windsurf**: Windsurf IDE format
- **cline**: Cline format

### Commands
- **cursor**: Cursor IDE commands
- **claude**: Claude AI commands
- **cline**: Cline commands
- **codex**: Codex commands
- **kilo**: Kilo commands

## Project Structure

- `rules.yaml` - Main rules configuration
- `commands.yaml` - Commands configuration
- `ignore.yaml` - Ignore patterns
- `src/` - Source code
- `bin/` - Executable scripts
- `docs/` - Documentation and generated files
