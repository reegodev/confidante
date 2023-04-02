import { Command, Option } from '@commander-js/extra-typings'
import config from '../config'
import adapters , { adapterNames } from '../adapters'

export default new Command('pull')
  .argument('[filePath]')
  .argument('[entryName]')
  .addOption(new Option('-a, --adapter <adapter>', 'Adapter to use').choices(adapterNames))
  .option('-v, --vault <vault>', 'Vault name')
  .option('-s, --save', 'Save the configuration')
  .action(async (filePath, entryName, options) => {
    const runtimeConfig = await config.check({
      filePath,
      entryName,
      adapter: options.adapter,
      vault: options.vault,
    })

    if (options.save) {
      await config.save(runtimeConfig)
    }

    const adapter = adapters[runtimeConfig.adapter]
    await adapter.pull(runtimeConfig)
  })
