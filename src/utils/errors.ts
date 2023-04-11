import { Command, CommanderError } from "@commander-js/extra-typings"

export async function handleErrors(this: Command, cb: () => Promise<void>) {
  try {
    await cb.call(this)
  } catch (err) {
    if (err instanceof CommanderError) {
      this.error(err.message, {
        code: err.code,
        exitCode: err.exitCode
      })
    } else if (err instanceof Error) {
      this.error(err.message)
    } else {
      throw err
    }
  }
}

export class CommandNotFoundError extends CommanderError {
  command: string

  constructor(command: string) {
    super(1, 'CMD_NOT_FOUND', `Command "${command}" not found. Did you forget to install your password manager's CLI?`)
    this.command = command
  }
}
