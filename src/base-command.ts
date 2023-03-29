import { Command } from '@oclif/core'
import { readFileSync, realpathSync, writeFileSync } from 'node:fs'
import path = require('node:path')
import { AdapterName, adapters } from './adapters'
import { Adapter } from './base-adapter'

export const CONFIG_NAME = '.confidante.json'

export interface Config {
  adapter: AdapterName
  vault: string
  filePath: string
  entryName: string
}

export const defaultConfig: Config = {
  adapter: '1password',
  vault: '',
  filePath: '',
  entryName: '',
}

export abstract class BaseCommand extends Command {
  getConfigPath(): string {
    return process.cwd()
  }

  getConfig(): Config {
    let config = defaultConfig

    let configFilePath = ''
    try {
      configFilePath = realpathSync(path.join(this.getConfigPath(), CONFIG_NAME))
    } catch {
      // noop
    }

    if (configFilePath) {
      try {
        config = JSON.parse(readFileSync(configFilePath, 'utf8'))
      } catch {
        this.warn(`Config file at ${configFilePath} is invalid. Using default config.`)
      }
    }

    return config
  }

  saveConfig(config: Config): void {
    writeFileSync(path.join(this.getConfigPath(), CONFIG_NAME), JSON.stringify(config, null, 2))
  }

  validateConfig(partialConfig: Partial<Config>): Config {
    const defaultConfig = this.getConfig()
    const mergedConfig = {
      adapter: partialConfig.adapter || defaultConfig.adapter,
      vault: partialConfig.vault || defaultConfig.vault,
      filePath: partialConfig.filePath || defaultConfig.filePath,
      entryName: partialConfig.entryName || defaultConfig.entryName,
    }

    if (!mergedConfig.adapter) {
      this.error('No adapter specified')
    }

    if (!adapters[mergedConfig.adapter]) {
      this.error(`Adapter ${mergedConfig.adapter} not found`)
    }

    if (!mergedConfig.vault) {
      this.error('No vault specified')
    }

    if (!mergedConfig.filePath) {
      this.error('No file path specified')
    }

    if (!mergedConfig.entryName) {
      this.error('No entry name specified')
    }

    return mergedConfig
  }

  getAdapter(adapterName: AdapterName): Adapter {
    const AdapterClass = adapters[adapterName]

    if (!AdapterClass) {
      this.error(`Adapter "${adapterName}" not found`)
    }

    return new AdapterClass()
  }
}
