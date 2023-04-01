import { join } from 'node:path'
import fs from './utils/fs'

export interface Config {
  adapter: string
  vault: string
  filePath: string
  entryName: string
}

export const CONFIG_NAME = '.confidante.json'
export const CONFIG_PATH = process.cwd()
export const DEFAULT_CONFIG = {
  adapter: '1password',
  vault: '',
  filePath: '',
  entryName: '',
}

const adapters = {
  '1password': {},
} as Record<string, unknown>

const config = {
  merge(providedConfig: Partial<Config>, baseConfig: Config): Config {
    return {
      adapter: providedConfig.adapter || baseConfig.adapter,
      vault: providedConfig.vault || baseConfig.vault,
      filePath: providedConfig.filePath || baseConfig.filePath,
      entryName: providedConfig.entryName || baseConfig.entryName,
    }
  },

  validate(config: Config) {
    if (!config.adapter) {
      throw new Error(`No adapter specified.`)
    }

    if (!adapters[config.adapter]) {
      throw new Error(`The adapter "${config.adapter}" does not exist.`)
    }

    if (!config.vault) {
      throw new Error(`No vault specified.`)
    }

    if (!config.filePath) {
      throw new Error(`No file path specified.`)
    }

    if (!config.entryName) {
      throw new Error(`No entry name specified.`)
    }
  },

  async load() {
    let config: Config = DEFAULT_CONFIG
    let rawConfig = ''
    try {
      rawConfig = await fs.read(join(CONFIG_PATH, CONFIG_NAME), 'utf8')
    } catch {
      // noop
    }

    if (rawConfig) {
      try {
        config = JSON.parse(rawConfig)
        this.validate(config)
      } catch (err) {
        if (err instanceof SyntaxError) {
          throw new Error('Config file is corrupt.')
        }

        throw err
      }
    }

    return config
  },

  async save(config: Config) {
    await fs.write(join(CONFIG_PATH, CONFIG_NAME), JSON.stringify(config, null, 2))
  },

  async check(userConfig: Partial<Config>) {
    const savedConfig = await this.load()
    const mergedConfig = this.merge(userConfig, savedConfig)

    this.validate(mergedConfig)

    return mergedConfig
  },
}

export default config
