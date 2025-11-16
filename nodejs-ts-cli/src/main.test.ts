import { describe, expect, it, vi } from 'vitest';
import { main } from './main';

describe('main', () => {
  it('logs hello world', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const result = main();
    expect(result).toBe('hello world');
    expect(logSpy).toHaveBeenCalledWith('hello world');
    logSpy.mockRestore();
  });
});
