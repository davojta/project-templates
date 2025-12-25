import { describe, expect, test } from "bun:test";

function parseArgs(argv: string[]): { name?: string; help: boolean } {
  const result: { name?: string; help: boolean } = { help: false };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--help") {
      result.help = true;
    } else if (arg === "--name" && i + 1 < argv.length) {
      result.name = argv[i + 1];
      i++;
    }
  }

  return result;
}

describe("CLI argument parsing", () => {
  test("should parse --name option", () => {
    const result = parseArgs(["--name", "Alice"]);
    expect(result.name).toBe("Alice");
    expect(result.help).toBe(false);
  });

  test("should parse --help flag", () => {
    const result = parseArgs(["--help"]);
    expect(result.help).toBe(true);
    expect(result.name).toBeUndefined();
  });

  test("should handle no arguments", () => {
    const result = parseArgs([]);
    expect(result.name).toBeUndefined();
    expect(result.help).toBe(false);
  });

  test("should parse both --name and --help", () => {
    const result = parseArgs(["--name", "Bob", "--help"]);
    expect(result.name).toBe("Bob");
    expect(result.help).toBe(true);
  });
});
