import onePassword from './1password'
export {BaseAdapter} from './base'

export const adapters = {
  '1password': onePassword,
  '1pass': onePassword,
  op: onePassword,
}

export type AdapterName = keyof typeof adapters
