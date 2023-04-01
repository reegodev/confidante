import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { spawn } from 'node:child_process'
import { Config } from './base-command'

export abstract class Adapter {

  readFile(filePath: string): string {
    try {
      return readFileSync(filePath, 'utf8')
    } catch {
      throw new Error(`Cannot read environment file at path ${filePath}`)
    }
  }

  writeFile(filePath: string, contents: string): void {
    try {
      mkdirSync(dirname(filePath), { recursive: true })
      writeFileSync(filePath, contents)
    } catch {
      throw new Error(`Cannot write environment file at path ${filePath}`)
    }
  }

  runCommand(name: string, args: string[] = []): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      let result: string
      let errorMessage: string
      const command = spawn(name, args, { stdio: ['inherit', 'pipe', 'pipe'] })

      command.stdout.on('data', (data) => {
        result = data.toString()
      })

      command.on('error', data => {
        errorMessage = data.toString()
      })

      command.stderr.on('data', (data) => {
        errorMessage = data.toString()
      })

      command.on('close', (code) => {
        if (code === 0) {
          resolve(result)
        } else {
          reject(new Error(errorMessage))
        }
      })
    })
  }

  abstract push(config: Config): Promise<void>
  abstract pull(config: Config): Promise<void>
}
