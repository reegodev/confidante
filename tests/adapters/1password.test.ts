import { describe, it, expect, afterEach, vi } from 'vitest'
import OnePasswordAdapter from '../../src/adapters/1password'
import cli from '../../src/utils/cli'
import { Config } from '../../src/config'
import fs from '../../src/utils/fs'

vi.mock('../../src/utils/fs')
const mockedFs = vi.mocked(fs)

vi.mock('../../src/utils/cli', () => ({
  default: {
    run: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
    log: vi.fn(),
    spinner: vi.fn(),
    outputConfiguration: vi.fn(),
  }
}))
const mockedCli = vi.mocked(cli)

describe('Adapters - 1password', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const config: Config = {
    adapter: '1password',
    vault: 'My vault',
    filePath: '.env',
    entryName: 'My local .env'
  }

  it('tells if a vault exists', async () => {
    let exists = await OnePasswordAdapter.vaultExists('My vault')
    expect(exists).toBe(true)

    mockedCli.run.mockRejectedValueOnce(new Error('The "foo" vault in this account does not exist'))
    exists = await OnePasswordAdapter.vaultExists('My vault')
    expect(exists).toBe(false)

    mockedCli.run.mockRejectedValueOnce(new Error('foo'))
    expect(async () => {
      await OnePasswordAdapter.vaultExists('My vault')
    }).rejects.toThrow('foo')
  })

  it('creates an item in the vault', async () => {
    mockedFs.read.mockResolvedValueOnce('test read')

    await OnePasswordAdapter.createItem(config)
    expect(mockedCli.run).toHaveBeenNthCalledWith(1, 'op', [
      'item',
      'create',
      `notesPlain=${'test read'}`,
      '--category',
      'Secure Note',
      '--vault',
      config.vault,
      '--title',
      config.entryName,
    ])
  })

  it('updates an item in the vault', async () => {
    mockedFs.read.mockResolvedValueOnce('test read')

    await OnePasswordAdapter.updateItem('123', config)
    expect(mockedCli.run).toHaveBeenNthCalledWith(1, 'op', [
      'item',
      'edit',
      '123',
      `notesPlain=${'test read'}`,
      '--vault',
      config.vault,
      '--title',
      config.entryName,
    ])
  })

  it('gets an item from the vault', async () => {
    mockedCli.run.mockResolvedValueOnce(JSON.stringify({ foo: 'bar' }))

    let result = await OnePasswordAdapter.getItem(config)
    expect(result).toEqual({ foo: 'bar' })
    expect(mockedCli.run).toHaveBeenNthCalledWith(1, 'op', [
      'item',
      'get',
      config.entryName,
      '--vault',
      config.vault,
      '--format',
      'json',
    ])

    mockedCli.run.mockRejectedValueOnce(new Error('"foo" isn\'t an item in the "Test" vault'))
    result = await OnePasswordAdapter.getItem(config)
    expect(result).toBe(null)

    mockedCli.run.mockRejectedValueOnce(new Error('foo'))
    expect(async () => {
      await OnePasswordAdapter.getItem(config)
    }).rejects.toThrow('foo')
  })

  describe('push', () => {
    it('throws an error if the vault does not exist while pushing', async () => {
      mockedCli.run
        .mockRejectedValueOnce(new Error('The "foo" vault in this account does not exist')) // vaultExists
  
      expect(async () => {
        await OnePasswordAdapter.push(config)
      }).rejects.toThrow('Vault "My vault" does not exist.')
    })
    
    it('pushes a new item into the vault', async () => {
      mockedFs.read.mockResolvedValueOnce('test read')
      mockedCli.run
        .mockResolvedValueOnce('vault exists') // vaultExists
        .mockRejectedValueOnce(new Error('"foo" isn\'t an item in the "Test" vault')) // getItem
        .mockResolvedValueOnce('created') // createItem
  
      await OnePasswordAdapter.push(config)
  
      expect(mockedCli.run).toHaveBeenNthCalledWith(1, 'op', ['vault', 'get', config.vault, '--format', 'json'])
      expect(mockedCli.run).toHaveBeenNthCalledWith(2, 'op', [
        'item',
        'get',
        config.entryName,
        '--vault',
        config.vault,
        '--format',
        'json',
      ])
      expect(mockedCli.run).toHaveBeenNthCalledWith(3, 'op', [
        'item',
        'create',
        `notesPlain=${'test read'}`,
        '--category',
        'Secure Note',
        '--vault',
        config.vault,
        '--title',
        config.entryName,
      ])
    })
  
    it('pushes an existing item into the vault', async () => {
      mockedFs.read.mockResolvedValueOnce('test read')
      mockedCli.run
        .mockResolvedValueOnce('vault exists') // vaultExists
        .mockResolvedValueOnce(JSON.stringify({ id: '123', foo: 'bar' })) // getItem
        .mockResolvedValueOnce('updated') // updatedItem
  
      await OnePasswordAdapter.push(config)
  
      expect(mockedCli.run).toHaveBeenNthCalledWith(1, 'op', ['vault', 'get', config.vault, '--format', 'json'])
      expect(mockedCli.run).toHaveBeenNthCalledWith(2, 'op', [
        'item',
        'get',
        config.entryName,
        '--vault',
        config.vault,
        '--format',
        'json',
      ])
      expect(mockedCli.run).toHaveBeenNthCalledWith(3, 'op', [
        'item',
        'edit',
        '123',
        `notesPlain=${'test read'}`,
        '--vault',
        config.vault,
        '--title',
        config.entryName,
      ])
    })
  })

  describe('pull', () => {
    it('throws an error if the vault does not exist', async () => {
      mockedCli.run
        .mockRejectedValueOnce(new Error('The "foo" vault in this account does not exist')) // vaultExists
  
      expect(async () => {
        await OnePasswordAdapter.pull(config)
      }).rejects.toThrow('Vault "My vault" does not exist.')
    })
  
    it('throws an error if the item does not exist', async () => {
      mockedFs.read.mockResolvedValueOnce('test read')
      mockedCli.run
        .mockResolvedValueOnce('vault exists') // vaultExists
        .mockRejectedValueOnce(new Error('"foo" isn\'t an item in the "Test" vault')) // getItem
  
      expect(async () => {
        await OnePasswordAdapter.pull(config)
      }).rejects.toThrow('Entry "My local .env" does not exist.')
    })
  
    it('throws an error if the item does not contain secure notes', async () => {
      mockedFs.read.mockResolvedValueOnce('test read')
      mockedCli.run
        .mockResolvedValueOnce('vault exists') // vaultExists
        .mockResolvedValueOnce(JSON.stringify({ fields: [] })) // getItem
  
      expect(async () => {
        await OnePasswordAdapter.pull(config)
      }).rejects.toThrow('Entry "My local .env" does not contain any notes.')
    })

    it('pulls the item from the vault', async () => {
      mockedFs.read.mockResolvedValueOnce('test read')
      mockedCli.run
        .mockResolvedValueOnce('vault exists') // vaultExists
        .mockResolvedValueOnce(JSON.stringify({ fields: [ { id: 'notesPlain', value: 'foo' } ] })) // getItem
  
      await OnePasswordAdapter.pull(config)
      expect(mockedFs.write).toHaveBeenLastCalledWith(config.filePath, 'foo')
    })
  })
})
