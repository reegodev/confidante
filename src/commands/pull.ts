import { Command } from '@commander-js/extra-typings'
import config from '../config'

export default new Command('pull')
  .argument('[filePath]')
  .argument('[entryName]')
  .option('-a, --adapter <adapter>', 'Adapter to use')
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
  })
