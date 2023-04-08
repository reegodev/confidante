import { describe, it, expect } from 'vitest'
import cli from '../../src/utils/cli'
import { CommandNotFoundError } from '../../src/utils/errors'

describe('Utils - CLI', () => {
  it('runs a command and pipes stdout', async () => {
    const result = await cli.run('ls', ['-a'])
    expect(result.split('\n')).toEqual(expect.arrayContaining(['.', '..', '.gitignore']))
  })

  it('runs a command and pipes stderr', async () => {
    expect(async () => {
      await cli.run('ls', ['-0'])
    }).rejects.toThrow(/ls/)
  })

  it('throws a CommandNotFoundError if a command does not exist', async () => {
    expect(async () => {
      await cli.run('completely-madeup-command')
    }).rejects.toThrow(CommandNotFoundError)
  })
})
