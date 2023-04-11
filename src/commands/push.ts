import { Command, Option } from '@commander-js/extra-typings'
import * as figures from 'figures'
import config from '../config'
import { adapterNames, getAdapter } from '../adapters'
import { handleErrors } from '../utils/errors'
import cli from '../utils/cli'

export default new Command('push')
  .configureOutput(cli.outputConfiguration)
  .argument('[filePath]')
  .argument('[entryName]')
  .addOption(new Option('-a, --adapter <adapter>', 'Adapter to use').choices(adapterNames))
  .option('-v, --vault <vault>', 'Vault name')
  .action(async function (this: Command, filePath, entryName, options) {
    await handleErrors.call(this, async () => {
      const runtimeConfig = await config.check({
        filePath,
        entryName,
        adapter: options.adapter,
        vault: options.vault,
      })

      cli.info(`\nUsing adapter "${runtimeConfig.adapter}"\n\n`)

      cli.log(`${figures.bullet} Push "${runtimeConfig.filePath}" ${figures.arrowRight} "${runtimeConfig.entryName}"\n`)

      cli.spinner.start(`Pushing to vault "${runtimeConfig.vault}"...`)

      await getAdapter(runtimeConfig.adapter).push(runtimeConfig)

      cli.spinner.stop(`Done\n\n`)
    })
  })
