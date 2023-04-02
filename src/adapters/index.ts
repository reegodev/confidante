import { Config } from '../config'
import OnePassword from './1password'

export interface Adapter {
  pull: (config: Config) => Promise<void>
  push: (config: Config) => Promise<void>
  [key: string]: any
}

const adapters = {
  '1password': OnePassword,
} as const

export const adapterNames = Object.keys(adapters) as (keyof typeof adapters)[]

export default adapters
