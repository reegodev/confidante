import { Adapter } from '../base-adapter'
import { Config } from '../base-command'

export default class OnePasswordAdapter extends Adapter {

  async push(config: Config): Promise<void> {
    const vaultExists = await this.vaultExists(config.vault)
    if (!vaultExists) {
      throw new Error(`Vault "${config.vault}" does not exist`)
    }

    const item = await this.getItem(config)
    if (item) {
      await this.updateItem(item.id, config)
    } else {
      this.createItem(config)
    }
  }

  async pull(config: Config): Promise<void> {
    const vaultExists = await this.vaultExists(config.vault)
    if (!vaultExists) {
      throw new Error(`Vault "${config.vault}" does not exist`)
    }

    const item = await this.getItem(config)
    if (!item) {
      throw new Error(`Entry "${config.entryName}" does not exist`)
    }

    const fileContents = item.fields.find((field: any) => field.id === 'notesPlain')?.value
    if (!fileContents) {
      throw new Error(`Entry "${config.entryName}" does not contain any notes`)
    }

    await this.writeFile(config.filePath, fileContents)
  }

  protected async vaultExists(name: string): Promise<boolean> {
    try {
      await this.runCommand('op', ['vault', 'get', name, '--format', 'json'])

      return true
    } catch {
      return false
    }
  }

  protected async createItem(config: Config): Promise<void> {
    const fileContents = this.readFile(config.filePath)

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
    const fileContents = this.readFile(config.filePath)

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
