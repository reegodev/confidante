import { expect } from '@oclif/test'
import test from '../helpers/test-decorator'
import OnePassword from '../../src/adapters/1password'

describe('Command - Push', () => {
  test
    .stdout()
    .command(['push'])
    .catch('No vault specified')
    .it('throws an error when a vault is not specified')

  test
    .stdout()
    .command(['push', '-v foo'])
    .catch('No file path specified')
    .it('throws an error when no file path is passed')

  test
    .stdout()
    .command(['push', '.env', '-v foo'])
    .catch('No entry name specified')
    .it('throws an error when no entry is passed')

  test
    .stdout()
    .command(['push', '-a foo'])
    .catch(/Expected --adapter= foo to be one of/)
    .it('throws an error when an invalid adapter is passed')

  test
    .stdout()
    .spy(OnePassword.prototype, 'push', () => Promise.resolve())
    .command(['push', '.env', 'My .env', '-v private'])
    .exit(0)
    .it('uses 1password as the default adapter', (ctx) => {
      expect(ctx.spies.push.length).to.eq(1)
    })
})
