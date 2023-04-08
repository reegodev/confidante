import { describe, it, expect } from 'vitest'
import { getAdapter, adapterNames, adapters } from '../../src/adapters'
import OnePasswordAdapter from '../../src/adapters/1password'

describe('Adapters - index', () => {
  it('throws an error if the adapter does not exist', async () => {
    expect(async () => {
      await getAdapter('foo' as any)
    }).rejects.toThrow('The adapter "foo" does not exist.')
  })

  it('returns an existing adapter', async () => {
    const adapter = await getAdapter('1password')
    expect(adapter).toBe(OnePasswordAdapter)
  })

  it('exposes the list of adapter names', async () => {
    expect(adapterNames).toEqual(Object.keys(adapters))
  })
})
