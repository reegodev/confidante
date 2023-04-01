import { Command } from '@commander-js/extra-typings'
import initCommand from './init'

export default new Command('config')
  .addCommand(initCommand)
