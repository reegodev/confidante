/* eslint-disable @typescript-eslint/no-empty-function */
import { expect } from '@oclif/test'
import test from '../helpers/test-decorator'
import { Adapter } from '../../src/base-adapter'
import OnePasswordAdapter from '../../src/adapters/1password'

describe('Adapter - 1password', () => {
  describe('pull', () => {
    test
      .stub(OnePasswordAdapter.prototype, 'vaultExists', () => false)
      .do(async () => {
        const adapter = new OnePasswordAdapter()
        await adapter.pull({
          vault: 'My vault',
          adapter: '1password',
          entryName: 'My local .env',
          filePath: '.env'
        })
      })
      .catch('Vault "My vault" does not exist')
      .it('throws an error if the vault does not exist')

    test
      .stub(OnePasswordAdapter.prototype, 'vaultExists', () => true)
      .stub(OnePasswordAdapter.prototype, 'getItem', () => null)
      .do(async () => {
        const adapter = new OnePasswordAdapter()
        await adapter.pull({
          vault: 'My vault',
          adapter: '1password',
          entryName: 'My local .env',
          filePath: '.env'
        })
      })
      .catch('Entry "My local .env" does not exist')
      .it('throws an error if the entry does not exist')

    test
      .stub(OnePasswordAdapter.prototype, 'vaultExists', () => true)
      .stub(OnePasswordAdapter.prototype, 'getItem', () => ({
        fields: []
      }))
      .do(async () => {
        const adapter = new OnePasswordAdapter()
        await adapter.pull({
          vault: 'My vault',
          adapter: '1password',
          entryName: 'My local .env',
          filePath: '.env'
        })
      })
      .catch('Entry "My local .env" does not contain any notes')
      .it('throws an error if the entry does not contain notes')

    test
      .stub(OnePasswordAdapter.prototype, 'vaultExists', () => true)
      .stub(OnePasswordAdapter.prototype, 'getItem', () => ({
        fields: [
          { id: 'notesPlain', value: 'foo' }
        ]
      }))
      .spy(Adapter.prototype, 'writeFile', () => {})
      .do(async () => {
        const adapter = new OnePasswordAdapter()
        await adapter.pull({
          vault: 'My vault',
          adapter: '1password',
          entryName: 'My local .env',
          filePath: '.env'
        })
      })
      .it('Writes the entry content to the file system', (ctx) => {
        expect(ctx.spies.writeFile[0]).to.eql(['.env', 'foo'])
      })

  })

  describe('push', () => {
    test
      .stub(OnePasswordAdapter.prototype, 'vaultExists', () => true)
      .stub(OnePasswordAdapter.prototype, 'getItem', () => null)
      .spy(OnePasswordAdapter.prototype, 'createItem', () => null)
      .spy(OnePasswordAdapter.prototype, 'updateItem', () => null)
      .it('creates the entry in the vault if it does not exist', async (ctx) => {
        const adapter = new OnePasswordAdapter()
        await adapter.push({
          vault: 'My vault',
          adapter: '1password',
          entryName: 'My local .env',
          filePath: '.env'
        })
        expect(ctx.spies.createItem.length).to.eq(1)
        expect(ctx.spies.updateItem.length).to.eq(0)
      })

    test
      .stub(OnePasswordAdapter.prototype, 'vaultExists', () => true)
      .stub(OnePasswordAdapter.prototype, 'getItem', () => ({ id: 'test' }))
      .spy(OnePasswordAdapter.prototype, 'createItem', () => null)
      .spy(OnePasswordAdapter.prototype, 'updateItem', () => null)
      .it('updates the entry in the vault if it already exists', async (ctx) => {
        const adapter = new OnePasswordAdapter()
        await adapter.push({
          vault: 'My vault',
          adapter: '1password',
          entryName: 'My local .env',
          filePath: '.env'
        })
        expect(ctx.spies.createItem.length).to.eq(0)
        expect(ctx.spies.updateItem.length).to.eq(1)
      })
  })
})
