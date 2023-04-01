import { promisify } from 'node:util'
import { readFile, writeFile, mkdir } from 'node:fs'
import { dirname } from 'node:path'

const readFileAsync = promisify(readFile)
const writeFileAsync = promisify(writeFile)
const mkdirSync = promisify(mkdir)


export default {
  read: readFileAsync,
  async write(filePath: string, contents: string) {
    await mkdirSync(dirname(filePath), { recursive: true })
    await writeFileAsync(filePath, contents)
  }
}