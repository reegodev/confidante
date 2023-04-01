import { Command } from '@commander-js/extra-typings'
import config from '../config'

export default new Command('push')
  .argument('[filePath]')
  .argument('[entryName]')
  .option('-a, --adapter <adapter>', 'Adapter to use')
  .option('-v, --vault <vault>', 'Vault name')
  .action(async (filePath, entryName, options) => {
    const runtimeConfig = await config.check({
      filePath,
      entryName,
      adapter: options.adapter,
      vault: options.vault,
    })
  })
