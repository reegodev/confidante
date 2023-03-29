/* eslint-disable @typescript-eslint/no-empty-function */
import { expect } from '@oclif/test'
import test from '../helpers/test-decorator'
import { Adapter } from '../../src/base-adapter'
import { join } from 'node:path'

class ConcreteAdapter extends Adapter {
  async push() {}
  async pull() {}
}

describe('Adapter - Base', () => {
  test.it('runs a command and pipes the output to stdout', async () => {
    const adapter = new ConcreteAdapter()
    const result = await adapter.runCommand('ls')
    const folders = result.split('\n').filter(Boolean)
    expect(folders).to.include.members(['LICENSE', 'README.md', 'bin', 'src', 'test', 'tsconfig.json'])
  })

  test.it('runs a command and pipes the output to stderr', async () => {
    let assertions = 0
    const adapter = new ConcreteAdapter()
    try {
      await adapter.runCommand('ls', ['-z'])
    } catch (error) {
      expect((error as Error).message).to.include('ls: invalid option -- z')
      assertions++
    }

    expect(assertions).to.eq(1)
  })

  test.it('runs a command and catches ENOENT errors', async () => {
    let assertions = 0
    const adapter = new ConcreteAdapter()
    try {
      await adapter.runCommand('completely-madeup-command')
    } catch (error) {
      expect((error as Error).message).to.eq('Error: spawn completely-madeup-command ENOENT')
      assertions++
    }

    expect(assertions).to.eq(1)
  })

  test.it('can write and read files', async () => {
    const adapter = new ConcreteAdapter()
    adapter.writeFile(join(process.cwd(), 'test', 'tmp', 'test-file.txt'), 'test contents')
    const contents = adapter.readFile(join(process.cwd(), 'test', 'tmp', 'test-file.txt'))
    expect(contents).to.eq('test contents')
  })
})
