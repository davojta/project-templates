import { describe, expect, test } from "bun:test";
import { join } from "node:path";

const CLI_PATH = join(import.meta.dir, "..", "src", "cli.ts");
const BUN_PATH = process.execPath;

describe("CLI end-to-end tests", () => {
  test("should output 'Hello, World!' with no arguments", async () => {
    const proc = Bun.spawn([BUN_PATH, CLI_PATH], {
      stdout: "pipe",
    });

    const output = await new Response(proc.stdout).text();
    expect(output.trim()).toBe("Hello, World!");

    await proc.exited;
  });

  test("should output 'Hello, Alice!' with --name Alice", async () => {
    const proc = Bun.spawn([BUN_PATH, CLI_PATH, "--name", "Alice"], {
      stdout: "pipe",
    });

    const output = await new Response(proc.stdout).text();
    expect(output.trim()).toBe("Hello, Alice!");

    await proc.exited;
  });

  test("should display help with --help flag", async () => {
    const proc = Bun.spawn([BUN_PATH, CLI_PATH, "--help"], {
      stdout: "pipe",
    });

    const output = await new Response(proc.stdout).text();
    expect(output).toContain("Usage:");
    expect(output).toContain("--name");
    expect(output).toContain("--help");

    await proc.exited;
  });
});
