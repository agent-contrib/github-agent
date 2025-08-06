import { it, expect } from 'vitest'
import { SearchAgent } from '../src';

it('SearchAgent', () => {
  const searchAgent = new SearchAgent({});
  expect(searchAgent.status()).toBe('idle');
});
