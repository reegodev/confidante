import { spawn } from 'node:child_process'
import { CommandNotFoundError } from './errors'

export default {
  run(name: string, args: string[] = []): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      let result: string
      let error: Error
      const command = spawn(name, args, { stdio: ['inherit', 'pipe', 'pipe'] })

      command.stdout.on('data', (data) => {
        result = data.toString()
      })

      command.on('error', (data) => {
        error = new CommandNotFoundError(data.message, name)
      })

      command.stderr.on('data', (data) => {
        error = new Error(data.toString())
      })

      command.on('close', (code) => {
        if (code === 0) {
          resolve(result)
        } else {
          reject(error)
        }
      })
    })
  },
}
