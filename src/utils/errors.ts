import { CommanderError } from "@commander-js/extra-typings"

export class CommandNotFoundError extends CommanderError {
  command: string

  constructor(message: string, command: string) {
    super(1, 'CMD_NOT_FOUND', message)
    this.command = command
  }
}
