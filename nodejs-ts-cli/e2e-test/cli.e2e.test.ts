import { describe, expect, it } from 'vitest';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

async function runCliViaBash(command: string) {
  return execFileAsync('bash', ['-lc', command], {
    cwd: process.cwd(),
    env: { ...process.env, PATH: `${process.cwd()}/node_modules/.bin:${process.env.PATH ?? ''}` },
  });
}

describe('CLI e2e', () => {
  it('emits hello world when executed via bash', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'nodejs-ts-cli-'));
    const outputFile = join(tempDir, 'cli-output.txt');
    await runCliViaBash(`./bin/cli.ts > ${outputFile}`);
    const contents = await readFile(outputFile, 'utf8');
    expect(contents.trim()).toBe('hello world');
  });
});
