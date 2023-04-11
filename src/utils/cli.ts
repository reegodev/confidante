import { spawn } from 'node:child_process'
import { CommandNotFoundError } from './errors'
import * as chalk from 'chalk'
import * as figures from 'figures'
import { OutputConfiguration } from '@commander-js/extra-typings'

const spinnerConfig = {
  interval: 80,
  frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
  ref: null as NodeJS.Timer | null,
  currentFrame: 0,
  /* c8 ignore next 3 */
  get frame() {
    return this.frames[this.currentFrame]
  }
}

const run = (name: string, args: string[] = []): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    let result: string
    let error: Error
    const command = spawn(name, args, { stdio: ['inherit', 'pipe', 'pipe'] })

    command.stdout.on('data', (data) => {
      result = data.toString()
    })

    command.on('error', () => {
      error = new CommandNotFoundError(name)
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
}

/* c8 ignore start */
const info = (message: string) => {
  process.stdout.write(`${chalk.cyan(figures.info)} ${message}`)
}


const error = (message: string) => {
  if (spinner.isSpinning()) {
    spinner.stop(`${message}\n`, false)
  } else {
    process.stderr.write(`\n${chalk.red(figures.cross)} ${message}\n`)
  }
}

const log = (message: string) => {
  process.stdout.write(message)
}

const spinner = {
  start(message: string) {
    if (process.stdout.isTTY) {
      log(`\r└── ${chalk.yellow(spinnerConfig.frame)} ${message}`)

      spinnerConfig.ref = setInterval(() => {
        spinnerConfig.currentFrame++
        if (spinnerConfig.currentFrame >= spinnerConfig.frames.length) {
          spinnerConfig.currentFrame = 0
        }
  
        process.stdout.clearLine(0);
        log(`\r└── ${chalk.yellow(spinnerConfig.frame)} ${message}`)
      }, spinnerConfig.interval)
    } else {
      log(`\r${chalk.yellow(spinnerConfig.frame)} ${message}`)
    }
  },

  stop(message: string, success = true) {
    process.stdout.clearLine(0);
    if (success) {
      log(`\r└── ${chalk.green(figures.tick)} ${message}`)
    } else {
      process.stdout.clearLine(0);
      log(`\r└── ${chalk.red(figures.cross)} ${message}`)
    }
    
    if (spinnerConfig.ref) {
      spinnerConfig.currentFrame = 0
      clearInterval(spinnerConfig.ref)
    }
  },

  isSpinning() {
    return !!spinnerConfig.ref
  }
}

const outputConfiguration = {
  writeErr: (str) => error(str),
} as OutputConfiguration
/* c8 ignore stop */

export default {
  run,
  info,
  error,
  log,
  spinner,
  outputConfiguration,
}
