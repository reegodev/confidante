import { Command } from '@commander-js/extra-typings'
import pullCommand from './commands/pull'
import pushCommand from './commands/push'
import configCommand from './commands/config'

const pkg = require('../package.json')

new Command(pkg.name)
  .version(pkg.version)
  .addCommand(pullCommand)
  .addCommand(pushCommand)
  // .addCommand(configCommand)
  .parseAsync()
