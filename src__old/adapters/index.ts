import onePassword from './1password'

export const adapters = {
  '1password': onePassword,
}

export type AdapterName = keyof typeof adapters
