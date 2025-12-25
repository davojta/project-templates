import { describe, expect, test } from "bun:test";
import { greet } from "./main.ts";

describe("greet", () => {
  test("should return 'Hello, World!' with default name", () => {
    expect(greet()).toBe("Hello, World!");
  });

  test("should return 'Hello, Alice!' with custom name", () => {
    expect(greet("Alice")).toBe("Hello, Alice!");
  });
});
