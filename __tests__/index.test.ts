import { it, expect } from 'vitest'
import { GithubAgent } from '../src';

it('GithubAgent', () => {
  const githubAgent = new GithubAgent({ workspace: process.cwd() });
  expect(githubAgent.status()).toBe('idle');
});
