import {Flags} from '@oclif/core'
import {BaseCommand} from '../base-command'
import {adapters, AdapterName} from '../adapters'

export default class Push extends BaseCommand {
  static description = 'Push an environment file into the password manager'

  static examples = []

  static flags = {
    adapter: Flags.string({char: 'a', description: 'Adapter to use', required: false, options: Object.keys(adapters)}),
    vault: Flags.string({char: 'v', description: 'Vault name', required: false}),
  }

  static args = [
    {name: 'filePath', description: 'path of the environment file', required: false, default: '.env'},
    {name: 'entryName', description: 'name of the entry created in the password manager', required: false},
  ]

  async run(): Promise<void> {
    const {args, flags} = await this.parse(Push)

    const config = this.validateConfig({
      adapter: flags.adapter as AdapterName,
      vault: flags.vault,
      filePath: args.filePath,
      entryName: args.entryName,
    })

    const adapter = this.getAdapter(config.adapter)
    return adapter.push(config)
  }
}

