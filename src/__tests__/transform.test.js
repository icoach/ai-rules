import { jest } from '@jest/globals'
import fs from 'fs'
import path from 'path'
import { transform } from '../transform.js'

/**
 * @typedef {Object} MockConsole
 * @property {jest.SpyInstance} mockExit - Mocked process.exit function
 * @property {jest.SpyInstance} mockConsoleError - Mocked console.error function
 * @property {jest.SpyInstance} mockConsoleLog - Mocked console.log function
 */

/**
 * Simple integration tests that focus on core functionality
 */
describe('transform', () => {
  const originalCwd = process.cwd()
  const testFixtures = path.join(process.cwd(), '__tests__/fixtures')
  
  /** @type {jest.SpyInstance} */
  let mockExit
  /** @type {jest.SpyInstance} */
  let mockConsoleError
  /** @type {jest.SpyInstance} */
  let mockConsoleLog

  beforeEach(() => {
    mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called')
    })
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {})
    process.chdir(originalCwd)
  })

  afterEach(() => {
    jest.restoreAllMocks()
    process.chdir(originalCwd)
    // Clean up any test output files
    const outputFiles = [
      'test-output.md',
      'test-rules.json',
      '.test-ignore'
    ]
    const outputDirs = [
      'test-transform-cursor',
      'test-transform-windsurf', 
      'test-transform-kilocode'
    ]
    
    outputFiles.forEach(file => {
      if (fs.existsSync(file)) fs.unlinkSync(file)
    })
    
    outputDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true })
      }
    })
  })

  describe('file existence validation', () => {
    test('should exit when input file does not exist', () => {
      expect(() => {
        transform({
          format: 'json',
          inputPath: 'non-existent.yaml',
          cwd: testFixtures
        })
      }).toThrow('process.exit called')

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining("Error: Input file 'non-existent.yaml' does not exist")
      )
      expect(mockExit).toHaveBeenCalledWith(1)
    })
  })

  describe('YAML parsing', () => {
    test('should exit on invalid YAML structure', () => {
      const invalidYamlPath = path.join(testFixtures, 'temp-invalid.yaml')
      fs.writeFileSync(invalidYamlPath, 'invalid_structure: true')

      try {
        expect(() => {
          transform({
            format: 'json',
            inputPath: invalidYamlPath
          })
        }).toThrow('process.exit called')

        expect(mockConsoleError).toHaveBeenCalledWith(
          'Error processing the file:',
          expect.stringContaining('must have a root element named "rules" or "ignore_rules"')
        )
        expect(mockExit).toHaveBeenCalledWith(1)
      } finally {
        fs.unlinkSync(invalidYamlPath)
      }
    })

    test('should process valid rules.yaml with JSON format', () => {
      const testRulesPath = path.join(testFixtures, 'test-rules.yaml')
      
      // JSON format just outputs to console, no files created
      transform({
        format: 'json',
        inputPath: testRulesPath
      })

      // Should output valid JSON to console
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"rules"')
      )
    })

    test('should process ignore-only YAML file', () => {
      const ignoreOnlyPath = path.join(testFixtures, 'ignore-only.yaml')
      
      transform({
        format: 'json',
        inputPath: ignoreOnlyPath
      })

      // Should convert ignore rules to rules format and output JSON
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"rules"')
      )
    })
  })

  describe('scope filtering', () => {
    test('should filter rules by scope with JSON output', () => {
      const testRulesPath = path.join(testFixtures, 'test-rules.yaml')
      
      transform({
        format: 'json',
        inputPath: testRulesPath,
        scopes: ['python']
      })

      // Should only include Python rules in JSON output
      const output = mockConsoleLog.mock.calls[0][0]
      const parsedOutput = JSON.parse(output)
      
      expect(parsedOutput.rules).toHaveLength(1)
      expect(parsedOutput.rules[0].name).toBe('Python Specific Rules')
    })

    test('should be case insensitive for scope filtering', () => {
      const testRulesPath = path.join(testFixtures, 'test-rules.yaml')
      
      transform({
        format: 'json',
        inputPath: testRulesPath,
        scopes: ['JAVASCRIPT']
      })

      const output = mockConsoleLog.mock.calls[0][0]
      const parsedOutput = JSON.parse(output)
      
      expect(parsedOutput.rules).toHaveLength(1)
      expect(parsedOutput.rules[0].scope).toContain('javascript')
    })
  })

  describe('unsupported format handling', () => {
    test('should exit with error for unsupported format', () => {
      const testRulesPath = path.join(testFixtures, 'test-rules.yaml')

      expect(() => {
        transform({
          format: 'unsupported',
          inputPath: testRulesPath
        })
      }).toThrow('process.exit called')

      expect(mockConsoleError).toHaveBeenCalledWith(
        "Error: Format 'unsupported' is not supported."
      )
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Supported formats are: cursor, claude, cline, codex, kilo, windsurf, json'
      )
      expect(mockExit).toHaveBeenCalledWith(1)
    })
  })

  describe('integration tests with real formatters', () => {
    test('should create claude format output', () => {
      const testRulesPath = path.join(testFixtures, 'test-rules.yaml')
      const outputFile = 'test-output.md'
      
      // Mock the claude formatter to accept custom output path
      const originalToClaudeFormat = async () => {
        const { toClaudeFormat } = await import('../formatters.js')
        const testRulesContent = fs.readFileSync(testRulesPath, 'utf8')
        const yaml = await import('yaml')
        const data = yaml.parse(testRulesContent)
        
        toClaudeFormat(data, outputFile, true) // use force to overwrite
      }

      return originalToClaudeFormat().then(() => {
        expect(fs.existsSync(outputFile)).toBe(true)
        const content = fs.readFileSync(outputFile, 'utf8')
        expect(content).toContain('# Custom Rules for Claude')
        expect(content).toContain('## General Coding Rules')
      })
    })

    test('should create windsurf format output with unique directory', () => {
      const testRulesPath = path.join(testFixtures, 'test-rules.yaml')
      const outputDir = 'test-transform-windsurf/rules'
      
      const originalToWindsurfFormat = async () => {
        const { toWindsurfFormat } = await import('../formatters.js')
        const testRulesContent = fs.readFileSync(testRulesPath, 'utf8')
        const yaml = await import('yaml')
        const data = yaml.parse(testRulesContent)
        
        toWindsurfFormat(data, outputDir, true) // use force to overwrite
      }

      return originalToWindsurfFormat().then(() => {
        expect(fs.existsSync(outputDir)).toBe(true)
        const files = fs.readdirSync(outputDir)
        expect(files.length).toBeGreaterThan(0)
        expect(files.some(f => f.includes('General-Coding-Rules'))).toBe(true)
      })
    })
  })

  describe('working directory handling', () => {
    test('should handle working directory changes', () => {
      const testRulesPath = path.join(testFixtures, 'test-rules.yaml')
      
      transform({
        format: 'json',
        inputPath: 'test-rules.yaml', // relative path
        cwd: testFixtures // should change to this directory
      })

      // Should have processed the file successfully
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"rules"')
      )
      
      // Note: transform function changes CWD but doesn't restore it
      // This is the actual behavior of the function
      expect(process.cwd()).toBe(testFixtures)
    })
  })
})
