import type { Adapter } from '.'
import { Config } from '../config'
import cli from '../utils/cli'
import { CommandNotFoundError } from '../utils/errors'
import fs from '../utils/fs'

const OnePasswordAdapter = {
  async vaultExists(name: string): Promise<boolean> {
    try {
      await cli.run('op', ['vault', 'get', name, '--format', 'json'])

      return true
    } catch (err) {
      if (err instanceof Error && err.message.includes('vault in this account')) {
        return false
      }
      
      throw err
    }
  },

  async createItem(config: Config): Promise<void> {
    const fileContents = await fs.read(config.filePath)

    await cli.run('op', [
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
  },

  async updateItem(itemId: string, config: Config): Promise<void> {
    const fileContents = await fs.read(config.filePath)

    await cli.run('op', [
      'item',
      'edit',
      itemId,
      `notesPlain=${fileContents}`,
      '--vault',
      config.vault,
      '--title',
      config.entryName,
    ])
  },

  async getItem(config: Config): Promise<any> {
    try {
      const result = await cli.run('op', [
        'item',
        'get',
        config.entryName,
        '--vault',
        config.vault,
        '--format',
        'json',
      ])
      return JSON.parse(result)
    } catch (err) {
      if (err instanceof Error && err.message.includes('isn\'t an item in the')) {
        return null
      }

      throw err
    }
  },

  async push(config: Config): Promise<void> {
    const vaultExists = await this.vaultExists(config.vault)
    if (!vaultExists) {
      throw new Error(`Vault "${config.vault}" does not exist.`)
    }

    const item = await this.getItem(config)
    await (item ? this.updateItem(item.id, config) : this.createItem(config));
  },

  async pull(config: Config): Promise<void> {
    const vaultExists = await this.vaultExists(config.vault)
    if (!vaultExists) {
      throw new Error(`Vault "${config.vault}" does not exist.`)
    }

    const item = await this.getItem(config)
    if (!item) {
      throw new Error(`Entry "${config.entryName}" does not exist.`)
    }

    const note = item.fields.find((field: any) => field.id === 'notesPlain')
    if (!note) {
      throw new Error(`Entry "${config.entryName}" does not contain any notes.`)
    }

    await fs.write(config.filePath, note.value)
  }
} satisfies Adapter

export default OnePasswordAdapter
