import { describe, expect, it, vi } from 'vitest';
import { createCli } from '../../bin/cli';

describe('commander CLI', () => {
  it('runs main action when invoked', async () => {
    const cli = createCli();
    cli.exitOverride();
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await cli.parseAsync([], { from: 'user' });
    expect(logSpy).toHaveBeenCalledWith('hello world');
    logSpy.mockRestore();
  });
});
