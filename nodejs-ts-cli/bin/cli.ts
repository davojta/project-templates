#!/usr/bin/env -S node -r ts-node/register
import { Command } from '@commander-js/extra-typings';
import { main } from '../src/main';

export function createCli(): Command {
  const program = new Command();
  program
    .name('nodejs-ts-cli')
    .description('Minimal hello world CLI')
    .action(() => {
      main();
    });
  return program;
}

if (require.main === module) {
  createCli()
    .parseAsync()
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
