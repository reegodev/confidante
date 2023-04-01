import { Args, Flags } from '@oclif/core'
import { BaseCommand } from '../base-command'
import { adapters, AdapterName } from '../adapters'

export default class Pull extends BaseCommand {
  static description = 'Pull an environment file from the password manager'

  static examples = []

  static flags = {
    adapter: Flags.string({
      char: 'a',
      description: 'Adapter to use',
      required: false,
      options: Object.keys(adapters),
    }),
    vault: Flags.string({ char: 'v', description: 'Vault name', required: false }),
    save: Flags.boolean({ char: 's', description: 'Save the configuration', required: false, default: false }),
  }

  static args = {
    filePath: Args.string({ description: 'path of the environment file', required: false }),
    entryName: Args.string({ description: 'name of the entry created in the password manager', required: false }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Pull)

    const config = this.validateConfig({
      adapter: flags.adapter as AdapterName,
      vault: flags.vault,
      filePath: args.filePath,
      entryName: args.entryName,
    })

    const adapter = this.getAdapter(config.adapter)
    await adapter.pull(config)

    if (flags.save) {
      this.saveConfig(config)
    }

    this.exit()
  }
}
