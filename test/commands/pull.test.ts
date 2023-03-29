/* eslint-disable @typescript-eslint/no-empty-function */
import { expect } from '@oclif/test'
import test from '../helpers/test-decorator'
import OnePassword from '../../src/adapters/1password'
import { BaseCommand } from '../../src/base-command'

describe('Command - Pull', () => {
  test.stdout().command(['pull']).catch('No vault specified').it('throws an error when a vault is not specified')

  test
    .stdout()
    .command(['pull', '-v foo'])
    .catch('No file path specified')
    .it('throws an error when no file path is passed')

  test
    .stdout()
    .command(['pull', '.env', '-v foo'])
    .catch('No entry name specified')
    .it('throws an error when no entry is passed')

  test
    .stdout()
    .command(['pull', '-a foo'])
    .catch(/Expected --adapter= foo to be one of/)
    .it('throws an error when an invalid adapter is passed')

  test
    .stdout()
    .spy(OnePassword.prototype, 'pull', () => Promise.resolve())
    .command(['pull', '.env', 'foo', '-v bar'])
    .exit(0)
    .it('uses 1password as the default adapter', (ctx) => {
      expect(ctx.spies.pull.length).to.eq(1)
    })

  test
    .stdout()
    .spy(BaseCommand.prototype, 'saveConfig', () => {})
    .spy(OnePassword.prototype, 'pull', () => Promise.resolve())
    .command(['pull', '.env', 'foo', '-v bar', '-s'])
    .exit(0)
    .it('saves the config if the flag is passed', (ctx) => {
      expect(ctx.spies.saveConfig.length).to.eq(1)
    })
})
