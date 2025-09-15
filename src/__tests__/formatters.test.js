import { jest } from "@jest/globals";
import fs from "fs";
import path from "path";
import {
  toCursorFormat,
  toClaudeFormat,
  toClineFormat,
  toCodexFormat,
  toKiloCodeFormat,
  toWindsurfFormat,
  toJsonFormat,
} from "../formatters.js";

describe("formatters", () => {
  const testData = {
    rules: [
      {
        name: "General Coding Rules",
        description: "These are general coding rules",
        globs: ["*.js", "*.ts"],
        content:
          "Use early returns whenever possible to make the code more readable.",
      },
      {
        name: "Python Rules",
        description: "Rules for Python",
        content: "Follow PEP 8 style guide.",
      },
    ],
  };

  const testIgnoreData = ["node_modules/**", "dist/**", "*.log"];

  // Helper to clean up test files
  const cleanupFiles = (files) => {
    files.forEach((file) => {
      if (fs.existsSync(file)) {
        const stat = fs.statSync(file);
        if (stat.isDirectory()) {
          fs.rmSync(file, { recursive: true, force: true });
        } else {
          fs.unlinkSync(file);
        }
      }
    });
  };

  let mockExit;
  let mockConsoleLog;
  let mockConsoleError;

  beforeEach(() => {
    mockConsoleLog = jest.spyOn(console, "log").mockImplementation(() => {});
    mockConsoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockExit = jest.spyOn(process, "exit").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("toCursorFormat", () => {
    const testOutputDir = "test-cursor/rules";

    afterEach(() => {
      cleanupFiles(["test-cursor", ".cursorignore"]);
    });

    test("should create cursor rules directory with .mdc files", () => {
      toCursorFormat(testData, testOutputDir, true);

      expect(fs.existsSync(testOutputDir)).toBe(true);

      const files = fs.readdirSync(testOutputDir);
      expect(files).toContain("General-Coding-Rules.mdc");
      expect(files).toContain("Python-Rules.mdc");
    });

    test("should create .mdc files with correct format", () => {
      toCursorFormat(testData, testOutputDir, true);

      const content = fs.readFileSync(
        "test-cursor/rules/General-Coding-Rules.mdc",
        "utf8"
      );

      expect(content).toContain("---");
      expect(content).toContain("description: These are general coding rules");
      expect(content).toContain("alwaysApply: true");
      expect(content).toContain('globs: "*.js,*.ts"');
      expect(content).toContain("Use early returns whenever possible");
    });

    test("should handle rules without globs", () => {
      toCursorFormat(testData, testOutputDir, true);

      const content = fs.readFileSync(
        "test-cursor/rules/Python-Rules.mdc",
        "utf8"
      );
      expect(content).toContain("description: Rules for Python");
      expect(content).not.toContain("globs:");
    });

    test("should create .cursorignore file when ignoreData provided", () => {
      toCursorFormat(testData, testOutputDir, true, testIgnoreData);

      expect(fs.existsSync(".cursorignore")).toBe(true);
      const ignoreContent = fs.readFileSync(".cursorignore", "utf8");
      expect(ignoreContent).toBe("node_modules/**\ndist/**\n*.log");
    });

    test("should handle force flag by overwriting existing directory", () => {
      // Create existing directory
      fs.mkdirSync(testOutputDir, { recursive: true });
      fs.writeFileSync(
        path.join(testOutputDir, "existing.mdc"),
        "existing content"
      );

      toCursorFormat(testData, testOutputDir, true);

      // Should overwrite and not contain the old file
      const files = fs.readdirSync(testOutputDir);
      expect(files).not.toContain("existing.mdc");
      expect(files).toContain("General-Coding-Rules.mdc");
    });

    test("should exit when directory exists and force is false", () => {
      // Create existing directory
      fs.mkdirSync(testOutputDir, { recursive: true });

      toCursorFormat(testData, testOutputDir, false);

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining(`Directory '${testOutputDir}' already exists`)
      );
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });

  describe("toClaudeFormat", () => {
    const testOutputFile = "test-CLAUDE.md";

    afterEach(() => {
      cleanupFiles([testOutputFile, ".claude"]);
    });

    test("should create CLAUDE.md with correct format", () => {
      toClaudeFormat(testData, testOutputFile);

      expect(fs.existsSync(testOutputFile)).toBe(true);
      const content = fs.readFileSync(testOutputFile, "utf8");

      expect(content).toContain("# Custom Rules for Claude");
      expect(content).toContain("## General Coding Rules");
      expect(content).toContain(
        "**Description:** These are general coding rules"
      );
      expect(content).toContain("Use early returns whenever possible");
      expect(content).toContain("---");
    });

    test("should create .claude/settings.json when ignoreData provided", () => {
      toClaudeFormat(testData, testOutputFile, true, testIgnoreData);

      expect(fs.existsSync(".claude/settings.json")).toBe(true);
      const settingsContent = JSON.parse(
        fs.readFileSync(".claude/settings.json", "utf8")
      );
      expect(settingsContent.ignore).toEqual(testIgnoreData);
    });

    test("should handle custom output file path", () => {
      const customFile = "custom-claude.md";
      toClaudeFormat(testData, customFile);

      expect(fs.existsSync(customFile)).toBe(true);
      cleanupFiles([customFile]);
    });
  });

  describe("toClineFormat", () => {
    const testOutputFile = "test-clinerules";

    afterEach(() => {
      cleanupFiles([testOutputFile, ".aiignore"]);
    });

    test("should create .clinerules with YAML format", () => {
      toClineFormat(testData, testOutputFile);

      expect(fs.existsSync(testOutputFile)).toBe(true);
      const content = fs.readFileSync(testOutputFile, "utf8");

      expect(content).toContain("rules:");
      expect(content).toContain("name: General Coding Rules");
      expect(content).toContain("description: These are general coding rules");
      expect(content).toContain("globs:");
      expect(content).toContain('- "*.js"');
      expect(content).toContain('- "*.ts"');
    });

    test("should preserve globs as array in YAML", () => {
      toClineFormat(testData, testOutputFile);

      const content = fs.readFileSync(testOutputFile, "utf8");
      expect(content).toContain("globs:");
      expect(content).toContain('- "*.js"');
      expect(content).toContain('- "*.ts"');
    });

    test("should create .aiignore when ignoreData provided", () => {
      toClineFormat(testData, testOutputFile, true, testIgnoreData);

      expect(fs.existsSync(".aiignore")).toBe(true);
      const ignoreContent = fs.readFileSync(".aiignore", "utf8");
      expect(ignoreContent).toBe("node_modules/**\ndist/**\n*.log");
    });
  });

  describe("toCodexFormat", () => {
    const testOutputFile = "test-AGENTS.md";

    afterEach(() => {
      cleanupFiles([testOutputFile, ".codex"]);
    });

    test("should create AGENTS.md with correct format", () => {
      toCodexFormat(testData, testOutputFile);

      expect(fs.existsSync(testOutputFile)).toBe(true);
      const content = fs.readFileSync(testOutputFile, "utf8");

      expect(content).toContain("# Agent Instructions for Codex CLI");
      expect(content).toContain("## General Coding Rules");
      expect(content).toContain(
        "**Description:** These are general coding rules"
      );
    });

    test("should create .codex/config.json when ignoreData provided", () => {
      toCodexFormat(testData, testOutputFile, true, testIgnoreData);

      expect(fs.existsSync(".codex/config.json")).toBe(true);
      const configContent = JSON.parse(
        fs.readFileSync(".codex/config.json", "utf8")
      );
      expect(configContent.ignorePatterns).toEqual(testIgnoreData);
    });
  });

  describe("toKiloCodeFormat", () => {
    const testOutputDir = "test-kilocode/rules";

    afterEach(() => {
      cleanupFiles(["test-kilocode", ".aiignore"]);
    });

    test("should create kilocode rules directory with .md files", () => {
      toKiloCodeFormat(testData, testOutputDir);

      expect(fs.existsSync(testOutputDir)).toBe(true);

      const files = fs.readdirSync(testOutputDir);
      expect(files).toContain("General-Coding-Rules.md");
      expect(files).toContain("Python-Rules.md");
    });

    test("should create .md files with correct format", () => {
      toKiloCodeFormat(testData, testOutputDir);

      const content = fs.readFileSync(
        "test-kilocode/rules/General-Coding-Rules.md",
        "utf8"
      );

      expect(content).toContain("# General Coding Rules");
      expect(content).toContain(
        "**Description:** These are general coding rules"
      );
      expect(content).toContain("Use early returns whenever possible");
    });
  });

  describe("toWindsurfFormat", () => {
    const testOutputDir = "test-windsurf/rules";

    afterEach(() => {
      cleanupFiles(["test-windsurf", ".aiignore"]);
    });

    test("should create windsurf rules directory with .md files", () => {
      toWindsurfFormat(testData, testOutputDir);

      expect(fs.existsSync(testOutputDir)).toBe(true);

      const files = fs.readdirSync(testOutputDir);
      expect(files).toContain("General-Coding-Rules.md");
      expect(files).toContain("Python-Rules.md");
    });

    test("should create .md files with windsurf-specific format", () => {
      toWindsurfFormat(testData, testOutputDir);

      const content = fs.readFileSync(
        "test-windsurf/rules/General-Coding-Rules.md",
        "utf8"
      );

      expect(content).toContain("# Title: General Coding Rules");
      expect(content).toContain("## Description");
      expect(content).toContain("These are general coding rules");
      expect(content).toContain("## Instructions");
      expect(content).toContain("Use early returns whenever possible");
    });
  });

  describe("toJsonFormat", () => {
    test("should output JSON to console", () => {
      const mockConsoleLog = jest
        .spyOn(console, "log")
        .mockImplementation(() => {});

      toJsonFormat(testData);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        JSON.stringify(testData, null, 2)
      );

      mockConsoleLog.mockRestore();
    });
  });

  describe("filename sanitization", () => {
    const testDataWithSpecialChars = {
      rules: [
        {
          name: "Test Rule: With Special@Characters & Spaces!",
          description: "Test description",
          content: "Test content",
        },
      ],
    };

    afterEach(() => {
      cleanupFiles(["test-cursor", "test-kilocode", "test-windsurf"]);
    });

    test("should sanitize filenames for cursor format", () => {
      toCursorFormat(testDataWithSpecialChars, "test-cursor/rules");

      const files = fs.readdirSync("test-cursor/rules");
      expect(files).toContain("Test-Rule-With-SpecialCharacters--Spaces.mdc");
    });

    test("should sanitize filenames for kilocode format", () => {
      toKiloCodeFormat(testDataWithSpecialChars, "test-kilocode/rules");

      const files = fs.readdirSync("test-kilocode/rules");
      expect(files).toContain("Test-Rule-With-SpecialCharacters--Spaces.md");
    });

    test("should sanitize filenames for windsurf format", () => {
      toWindsurfFormat(testDataWithSpecialChars, "test-windsurf/rules");

      const files = fs.readdirSync("test-windsurf/rules");
      expect(files).toContain("Test-Rule-With-SpecialCharacters--Spaces.md");
    });
  });

  describe("error handling", () => {
    test("should handle file write permissions", () => {
      // This test would need specific setup for permission testing
      // For now, we'll test the basic success path
      expect(() => {
        toCursorFormat(testData, "test-perms/rules");
        cleanupFiles(["test-perms"]);
      }).not.toThrow();
    });
  });

  describe("directory creation", () => {
    afterEach(() => {
      cleanupFiles([
        "test-cursor",
        "test-kilocode",
        "test-windsurf",
        ".claude",
        ".codex",
        "test-claude.md",
        "test-agents.md",
      ]);
    });

    test("should create nested directories as needed", () => {
      toCursorFormat(testData, "test-cursor/rules", true);
      toKiloCodeFormat(testData, "test-kilocode/rules", true);
      toWindsurfFormat(testData, "test-windsurf/rules", true);

      expect(fs.existsSync("test-cursor/rules")).toBe(true);
      expect(fs.existsSync("test-kilocode/rules")).toBe(true);
      expect(fs.existsSync("test-windsurf/rules")).toBe(true);
    });

    test("should create config directories for ignore files", () => {
      toClaudeFormat(testData, "test-claude.md", true, testIgnoreData);
      toCodexFormat(testData, "test-agents.md", true, testIgnoreData);

      expect(fs.existsSync(".claude")).toBe(true);
      expect(fs.existsSync(".codex")).toBe(true);
    });
  });
});
