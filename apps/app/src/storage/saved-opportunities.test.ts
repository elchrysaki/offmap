import { describe, expect, it } from 'vitest';

import { nextSavedIds, normalizeSavedIds } from './saved-opportunities';

describe('local saved opportunities', () => {
  it('adds and removes without duplicates', () => {
    expect(nextSavedIds([], '12')).toEqual(['12']);
    expect(nextSavedIds(['12'], '12')).toEqual([]);
    expect(normalizeSavedIds(['12', '12', null, 4])).toEqual(['12']);
  });
});
