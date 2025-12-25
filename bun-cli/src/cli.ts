#!/usr/bin/env bun
import { greet } from "./main.ts";

function showHelp(): void {
  console.log(`Usage: bun run src/cli.ts [options]

Options:
  --name <name>    Specify the name to greet (default: "World")
  --help           Show this help message
`);
}

function parseArgs(): { name?: string; help: boolean } {
  const args = Bun.argv.slice(2);
  const result: { name?: string; help: boolean } = { help: false };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--help") {
      result.help = true;
    } else if (arg === "--name" && i + 1 < args.length) {
      result.name = args[i + 1];
      i++;
    }
  }

  return result;
}

function main(): void {
  const { name, help } = parseArgs();

  if (help) {
    showHelp();
    return;
  }

  console.log(greet(name));
}

main();
