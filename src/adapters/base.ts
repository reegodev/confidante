import {readFileSync, writeFileSync, mkdirSync} from 'node:fs'
import {dirname} from 'node:path'
import {spawn} from 'node:child_process'
import {Config} from '../base-command'

export abstract class BaseAdapter {
  getFileContents(filePath: string): string {
    try {
      return readFileSync(filePath, 'utf8')
    } catch {
      throw new Error(`Cannot read environment file at path ${filePath}`)
    }
  }

  setFileContents(filePath: string, contents: string): void {
    try {
      mkdirSync(dirname(filePath), {recursive: true})
    } catch {
      // do nothing
    }

    try {
      writeFileSync(filePath, contents)
    } catch {
      throw new Error(`Cannot write environment file at path ${filePath}`)
    }
  }

  runCommand(name: string, args: string[] = []): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      let result: string | null = null
      let error: string | null = null
      const command = spawn(name, args, {stdio: ['inherit', 'pipe', 'pipe']})

      command.stdout.on('data', data => {
        result = data.toString()
      })

      command.stderr.on('data', data => {
        error = data.toString()
      })

      command.on('close', code => {
        if (code === 0) {
          resolve(result)
        } else {
          reject(error)
        }
      })
    })
  }

  abstract push(config: Config): Promise<void>
  abstract pull(config: Config): Promise<void>
}
