export class CommandNotFoundError extends Error {
  command: string

  constructor(message: string, command: string) {
    super(message)
    this.command = command
  }
}
