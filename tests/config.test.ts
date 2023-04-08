import { join } from 'path'
import { describe, it, expect, afterEach, vi } from 'vitest'
import config, { Config, CONFIG_NAME, DEFAULT_CONFIG } from '../src/config'
import fs from '../src/utils/fs'

vi.mock('../src/utils/fs')
const mockedFs = vi.mocked(fs)

describe('Config', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('merges config files', async () => {
    const baseConfig = {
      adapter: 'a' as any,
      vault: 'v',
      entryName: 'e',
      filePath: 'f',
    }
    let merged = config.merge({}, baseConfig)
    expect(merged).toStrictEqual(baseConfig)

    merged = config.merge({ adapter: 'aa' as any }, baseConfig)
    expect(merged).toStrictEqual({
      ...baseConfig,
      adapter: 'aa',
    })

    merged = config.merge({ vault: 'vv' }, baseConfig)
    expect(merged).toStrictEqual({
      ...baseConfig,
      vault: 'vv',
    })

    merged = config.merge({ entryName: 'ee' }, baseConfig)
    expect(merged).toStrictEqual({
      ...baseConfig,
      entryName: 'ee',
    })

    merged = config.merge({ filePath: 'ff' }, baseConfig)
    expect(merged).toStrictEqual({
      ...baseConfig,
      filePath: 'ff',
    })
  })

  it('validates the config', () => {
    expect(() =>
      config.validate({
        adapter: '' as any,
        vault: '',
        filePath: '',
        entryName: '',
      }),
    ).toThrow('No adapter specified.')

    expect(() =>
      config.validate({
        adapter: 'foo' as any,
        vault: '',
        filePath: '',
        entryName: '',
      }),
    ).toThrow('The adapter "foo" does not exist.')

    expect(() =>
      config.validate({
        adapter: '1password',
        vault: '',
        filePath: '',
        entryName: '',
      }),
    ).toThrow('No vault specified.')

    expect(() =>
      config.validate({
        adapter: '1password',
        vault: 'My vault',
        filePath: '',
        entryName: '',
      }),
    ).toThrow('No file path specified.')

    expect(() =>
      config.validate({
        adapter: '1password',
        vault: 'My vault',
        filePath: '.env',
        entryName: '',
      }),
    ).toThrow('No entry name specified.')

    expect(() =>
      config.validate({
        adapter: '1password',
        vault: 'My vault',
        filePath: '.env',
        entryName: 'My local .env',
      }),
    ).not.toThrow()
  })

  it('loads the config file from the file system', async () => {
    mockedFs.read.mockRejectedValueOnce(new Error('file not found'))
    let loadedConfig = await config.load()

    expect(loadedConfig).toEqual(DEFAULT_CONFIG)

    mockedFs.read.mockResolvedValueOnce('Invalid json')
    expect(async () => {
      await config.load()
    }).rejects.toThrow('Config file is corrupt.')

    mockedFs.read.mockResolvedValueOnce(JSON.stringify({ adatper: '' }))
    expect(async () => {
      await config.load()
    }).rejects.toThrow('No adapter specified.')

    mockedFs.read.mockResolvedValueOnce(
      JSON.stringify({
        adapter: '1password',
        vault: 'My vault',
        filePath: '.env',
        entryName: 'My local .env',
      }),
    )
    loadedConfig = await config.load()
    expect(loadedConfig).toEqual({
      adapter: '1password',
      vault: 'My vault',
      filePath: '.env',
      entryName: 'My local .env',
    })
  })

  it('checks che provided config file against the stored config', async () => {
    mockedFs.read.mockRejectedValueOnce(new Error('file not found'))

    expect(async () => {
      await config.check({ adapter: '1password' })
    }).rejects.toThrow('No vault specified.')

    mockedFs.read.mockResolvedValueOnce(
      JSON.stringify({
        adapter: '1password',
        vault: 'My vault',
        filePath: '.env',
        entryName: 'My local file',
      }),
    )

    const resolvedCOnfig = await config.check({ adapter: '1password', vault: 'foo' })
    expect(resolvedCOnfig).toEqual({
      adapter: '1password',
      vault: 'foo',
      filePath: '.env',
      entryName: 'My local file',
    })
  })

  it('saves the config file', async () => {
    await config.save({
      adapter: '1password',
      vault: 'foo',
      filePath: '.env',
      entryName: 'My local file',
    })
    expect(mockedFs.write).toHaveBeenNthCalledWith(1, join(process.cwd(), CONFIG_NAME), `{
  "adapter": "1password",
  "vault": "foo",
  "filePath": ".env",
  "entryName": "My local file"
}`
    )
  })
})
