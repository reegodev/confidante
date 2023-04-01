/* eslint-disable @typescript-eslint/no-empty-function */
import { expect } from '@oclif/test'
import test from '../helpers/test-decorator'
import { BaseCommand } from '../../src/base-command'
import { join } from 'node:path'
import { realpathSync } from 'node:fs'
import OnePasswordAdapter from '../../src/adapters/1password'

class ConcreteCommand extends BaseCommand {
  async run() {}
}

describe('Command - base', () => {
  test
    .stub(BaseCommand.prototype, 'getConfigPath', () => {
      return realpathSync(join(process.cwd(), 'test', 'tmp'))
    })
    .loadConfig()
    .it('can write and read config files', (ctx) => {
      const cmd = new ConcreteCommand([], ctx.config as any)

      cmd.saveConfig({
        adapter: '1password',
        vault: 'Test vault',
        filePath: '.env',
        entryName: 'My local .env',
      })
      expect(cmd.getConfig()).to.eql({
        adapter: '1password',
        vault: 'Test vault',
        filePath: '.env',
        entryName: 'My local .env',
      })
    })

  test
    .loadConfig()
    .do((ctx) => {
      const cmd = new ConcreteCommand([], ctx.config as any)
      cmd.validateConfig({
        adapter: 'foo' as any,
      })
    })
    .catch('Adapter foo not found')
    .it('Requires a valid adapter')

  test
    .loadConfig()
    .do((ctx) => {
      const cmd = new ConcreteCommand([], ctx.config as any)
      cmd.validateConfig({})
    })
    .catch('No vault specified')
    .it('Requires a vault')

  test
    .loadConfig()
    .do((ctx) => {
      const cmd = new ConcreteCommand([], ctx.config as any)
      cmd.validateConfig({
        vault: 'test vault'
      })
    })
    .catch('No file path specified')
    .it('Requires a file path')

  test
    .loadConfig()
    .do((ctx) => {
      const cmd = new ConcreteCommand([], ctx.config as any)
      cmd.validateConfig({
        vault: 'test vault',
        filePath: '.env'
      })
    })
    .catch('No entry name specified')
    .it('Requires an entry name')

  test
    .loadConfig()
    .it('Returns the current adapter', (ctx) => {
      const cmd = new ConcreteCommand([], ctx.config as any)
      const adapter = cmd.getAdapter('1password')
      expect(adapter).to.be.instanceOf(OnePasswordAdapter)
    })

  test
    .loadConfig()
    .do((ctx) => {
      const cmd = new ConcreteCommand([], ctx.config as any)
      cmd.getAdapter('foo' as any)
    })
    .catch('Adapter "foo" not found')
    .it('Throws an error if the adapter cannot be found')

  test
    .stub(BaseCommand.prototype, 'getConfig', () => {
      return {
        adapter: 'foo',
        vault: 'bar',
        filePath: 'baz',
        entryName: 'test',
      }
    })
    .loadConfig()
    .it('Merges the default config with the one provided', (ctx) => {
      const cmd = new ConcreteCommand([], ctx.config as any)
      const config = cmd.validateConfig({
        adapter: '1password',
        vault: 'My vault',
        filePath: '.env',
        entryName: 'My local .env',
      })
      expect(config).to.eql({
        adapter: '1password',
        vault: 'My vault',
        filePath: '.env',
        entryName: 'My local .env',
      })
    })
})
