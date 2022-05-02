import {BaseAdapter} from './base'
import {Config} from '../base-command'

export default class OnePasswordAdapter extends BaseAdapter {
  async push(config: Config): Promise<void> {
    if (!await this.vaultExists(config.vault)) {
      throw new Error(`Vault ${config.vault} does not exist`)
    }

    const item = await this.getItem(config)
    await (item ? this.updateItem(item.id, config) : this.createItem(config))
  }

  async pull(config: Config): Promise<void> {
    if (!await this.vaultExists(config.vault)) {
      throw new Error(`Vault ${config.vault} does not exist`)
    }

    const item = await this.getItem(config)
    if (!item) {
      throw new Error(`Entry ${config.entryName} does not exist`)
    }

    const fileContents = item.fields.find((field: any) => field.id === 'notesPlain').value
    if (!fileContents) {
      throw new Error(`Entry ${config.entryName} does not have any notes`)
    }

    await this.setFileContents(config.filePath, fileContents)
  }

  protected async vaultExists(name: string): Promise<boolean> {
    try {
      await this.runCommand('op', [
        'vault',
        'get',
        name,
        '--format',
        'json',
      ])

      return true
    } catch {
      return false
    }
  }

  protected async createItem(config: Config): Promise<void> {
    const fileContents = this.getFileContents(config.filePath)

    await this.runCommand('op', [
      'item',
      'create',
      `notesPlain=${fileContents}`,
      '--category',
      'Secure Note',
      '--vault',
      config.vault,
      '--title',
      config.entryName,
    ])
  }

  protected async updateItem(itemId: string, config: Config): Promise<void> {
    const fileContents = this.getFileContents(config.filePath)

    await this.runCommand('op', [
      'item',
      'edit',
      itemId,
      `notesPlain=${fileContents}`,
      '--vault',
      config.vault,
      '--title',
      config.entryName,
    ])
  }

  protected async getItem(config: Config): Promise<any> {
    try {
      const result = await this.runCommand('op', [
        'item',
        'get',
        config.entryName,
        '--vault',
        config.vault,
        '--format',
        'json',
      ])
      return JSON.parse(result)
    } catch {
      return null
    }
  }
}
