import { describe, it, expect, afterEach, vi } from 'vitest'
import { handleErrors } from '../../src/utils/errors'
import { CommandNotFoundError } from '../../src/utils/errors'

describe('Utils - errors', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('gracefully handles errors', async () => {
    const ctx = {
      error: vi.fn()
    }
    const fn = handleErrors.bind(ctx)

    await fn(async () => {
      await Promise.resolve('foo')
    })
    expect(ctx.error).not.toHaveBeenCalled()

    await fn(async () => {
      throw new Error('foo')
    })

    expect(ctx.error).toHaveBeenLastCalledWith('foo')

    await fn(async () => {
      throw new CommandNotFoundError('foo')
    })

    expect(ctx.error).toHaveBeenLastCalledWith('Command "foo" not found. Did you forget to install your password manager\'s CLI?', {
      code: 'CMD_NOT_FOUND',
      exitCode: 1
    })

    expect(async () => {
      await fn(async () => {
        throw 'foo'
      })
    }).rejects.toThrow('foo')

    expect(ctx.error).toHaveBeenCalledTimes(2)
  })
})
