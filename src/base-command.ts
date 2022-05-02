import {Command} from '@oclif/core'
import {readFileSync, realpathSync, writeFileSync} from 'node:fs'
import {AdapterName, adapters, BaseAdapter} from './adapters'

const CONFIG_NAME = '.confidante.json'

export interface Config {
  adapter: AdapterName
  vault: string
  filePath: string
  entryName: string
}

export const defaultConfig: Config = {
  adapter: '1password',
  vault: '',
  filePath: '.env',
  entryName: '',
}

export abstract class BaseCommand extends Command {
  getConfig(): Config {
    let configPath = ''
    let config = defaultConfig
    try {
      configPath = realpathSync(`${process.cwd()}/${CONFIG_NAME}`)
    } catch {
      // do nothing
    }

    if (configPath) {
      try {
        config = JSON.parse(readFileSync(configPath, 'utf8'))
      } catch {
        this.warn(`Config file at ${configPath} is invalid. Using default config.`)
      }
    }

    return config
  }

  setConfig(config: Config): void {
    writeFileSync(`${process.cwd()}/${CONFIG_NAME}`, JSON.stringify(config, null, 2))
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

  getAdapter(adapterName: AdapterName): BaseAdapter {
    if (!adapters[adapterName]) {
      this.error(`Adapter ${adapterName} not found`)
    }

    const adapter = new adapters[adapterName]()
    return adapter
  }
}
