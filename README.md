# AI Rules

Transform YAML-based coding rules into AI assistant-specific formats. Define your coding standards once and generate rules for Cursor, Claude, Cline, Windsurf, and other AI coding assistants.

## Installation

Install the package in your project:

```bash
# Using pnpm
pnpm add @icoach/ai-rules

# Using npm
npm install @icoach/ai-rules

# Using yarn
yarn add @icoach/ai-rules
```

## Quick Start

1. **Create a `rules.yaml` file** in your project root:

```yaml
rules:
  - name: Code Style Guidelines
    description: General coding standards for the project
    scope: ['general', 'frontend']
    content: |
      - Use TypeScript with strict mode enabled
      - Prefer functional components over class components
      - Use descriptive variable names
      - Add JSDoc comments for all public functions
```

2. **Generate AI assistant rules**:

```bash
# Generate rules for Cursor
pnpm exec ai-rules --format cursor

# Generate rules for all main formats (cursor, claude, windsurf)
pnpm exec ai-rules

# Generate rules for a specific assistant
pnpm exec ai-rules --format claude
```

3. **Use the generated files** in your AI assistant of choice.

## Configuration Files

### `rules.yaml` - Your Coding Rules

Define your project's coding standards, patterns, and best practices:

```yaml
rules:
  - name: React Component Guidelines
    description: Standards for React component development
    scope: ['frontend', 'react']
    content: |
      - Use functional components with hooks
      - Implement proper TypeScript interfaces
      - Follow the single responsibility principle
      - Use meaningful component and prop names

  - name: API Development Rules
    description: Backend API development standards
    scope: ['backend', 'api']
    content: |
      - Use RESTful conventions
      - Implement proper error handling
      - Add comprehensive input validation
      - Document all endpoints with OpenAPI/Swagger

  - name: Testing Requirements
    description: Testing standards and practices
    scope: ['testing']
    globs: ["**/*.test.*", "**/*.spec.*"]
    content: |
      - Write unit tests for all business logic
      - Aim for 80%+ code coverage
      - Use descriptive test names
      - Mock external dependencies
```

### `commands.yaml` - Custom AI Commands (Optional)

Define reusable AI commands for common tasks:

```yaml
rules:
  - name: "refactor"
    description: "Refactors selected code for better readability"
    scope: ['general']
    content: |
      Refactor the following code to improve its quality:
      - Improve readability and maintainability
      - Apply best practices
      - Optimize performance where possible
      
      Code to refactor:
      ```
      {{code}}
      ```

  - name: "add-tests"
    description: "Generate unit tests for selected code"
    scope: ['testing']
    content: |
      Generate comprehensive unit tests for this code:
      - Cover main functionality and edge cases
      - Use the project's testing framework
      - Include meaningful test descriptions
```

### `ignore.yaml` - File Exclusions (Optional)

Specify files and patterns to exclude from AI processing:

```yaml
ignore_rules:
  - name: Build Outputs
    description: Ignore generated files
    scope: ['general']
    content:
      - dist/**
      - build/**
      - node_modules/**
      - "*.log"

  - name: Configuration Files
    description: Ignore config files
    scope: ['general']
    content:
      - .env*
      - *.config.js
      - package-lock.json
```

## Usage Examples

### Generate Rules for Specific AI Assistant

```bash
# Cursor AI
pnpm exec ai-rules --format cursor

# Claude (Anthropic)
pnpm exec ai-rules --format claude

# Cline
pnpm exec ai-rules --format cline

# Windsurf
pnpm exec ai-rules --format windsurf
```

### Filter by Scope

```bash
# Only generate frontend-related rules
pnpm exec ai-rules --format cursor --scope frontend

# Generate rules for multiple scopes
pnpm exec ai-rules --format cursor --scope frontend backend
```

### Generate Commands Instead of Rules

```bash
# Generate custom commands for AI assistants
pnpm exec ai-rules --type commands --format cursor
```

### Use Custom Input Files

```bash
# Use a different rules file
pnpm exec ai-rules --input my-custom-rules.yaml --format cursor

# Process commands from a custom file
pnpm exec ai-rules --type commands --input my-commands.yaml --format cursor
```

## Generated Output

The tool generates AI assistant-specific configuration files:

- **Cursor**: `.cursor/rules` directory with formatted rule files
- **Claude**: `CLAUDE.md` with structured rules
- **Cline**: `.clinerules` file
- **Windsurf**: `.windsurf/rules.md`
- **JSON**: Raw JSON output for custom integrations

## Rule Structure

### Basic Rule Format

```yaml
rules:
  - name: "Rule Name"
    description: "Brief description of what this rule covers"
    scope: ['category1', 'category2']  # Optional: helps with filtering
    content: |
      Your rule content here.
      Can be multi-line.
      Supports markdown formatting.
```

### Advanced Rule with File Patterns

```yaml
rules:
  - name: "Component-Specific Rules"
    description: "Rules that apply only to React components"
    scope: ['frontend', 'react']
    globs: ["src/components/**/*.tsx", "src/pages/**/*.tsx"]
    content: |
      - Use PascalCase for component names
      - Export components as default exports
      - Place interfaces above the component definition
```

### Scopes

Use scopes to organize and filter your rules:

- `general` - Universal rules that apply everywhere
- `frontend` - Client-side development rules
- `backend` - Server-side development rules
- `testing` - Testing-related guidelines
- `docs` - Documentation standards
- `security` - Security best practices

## Best Practices

1. **Start Simple**: Begin with a few essential rules and expand over time
2. **Use Descriptive Names**: Make rule names clear and searchable
3. **Organize by Scope**: Group related rules using consistent scope names
4. **Keep Rules Focused**: Each rule should cover one specific area
5. **Update Regularly**: Evolve your rules as your project grows
6. **Team Collaboration**: Share and discuss rules with your team

## Integration with AI Assistants

### Cursor

After running `pnpm exec ai-rules --format cursor`, the rules are automatically available in Cursor's AI features.

### Claude

Import the generated `CLAUDE.md` file into your Claude conversations for consistent coding assistance.

### Cline

The `.clinerules` file is automatically recognized by Cline for enhanced code generation.

### Windsurf

Rules are saved to `.windsurf/rules.md` and integrated into Windsurf's AI capabilities.

## Troubleshooting

### File Not Found Errors

```bash
# Ensure your rules.yaml exists
ls rules.yaml

# Or specify a different input file
pnpm exec ai-rules --input path/to/your/rules.yaml --format cursor
```

### Permission Errors

```bash
# Use force flag to overwrite existing files
pnpm exec ai-rules --format cursor --force
```

### Scope Filtering Issues

```bash
# Check that your rules have the correct scope values
pnpm exec ai-rules --scope frontend --format json
```

## API Usage

You can also use this package programmatically:

```javascript
import { transform } from '@icoach/ai-rules';

// Transform rules to Cursor format
transform({
  format: 'cursor',
  type: 'rules',
  inputPath: './my-rules.yaml',
  force: true
});

// Transform commands to Claude format
transform({
  format: 'claude',
  type: 'commands',
  scopes: ['frontend', 'testing']
});
```

## License

MIT