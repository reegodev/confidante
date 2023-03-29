import { test } from '@oclif/test'
import { get, set } from 'lodash'

const decorated = test.register('spy', (object: any, path: any, value: (...args: any) => any) => {
  return {
    async run(ctx: { spies: Record<string, any[]>; stubs: any[] }) {
      if (!ctx.spies) {
        ctx.spies = {}
      }

      ctx.spies[path] = []

      ctx.stubs = ctx.stubs || []
      const descriptor = Object.getOwnPropertyDescriptor(object, path)
      if (descriptor && descriptor.get) {
        ctx.stubs.push(descriptor.get)
        descriptor.get = (...args: any[]) => {
          ctx.spies[path].push(args)
          return value(...args)
        }

        Object.defineProperty(object, path, descriptor)
      } else {
        ctx.stubs.push(get(object, path))
        set(object, path, (...args: any[]) => {
          ctx.spies[path].push(args)
          return value(...args)
        })
      }
    },
    async finally(ctx: { spies: Record<string, any[]>; stubs: any[] }) {
      const stub = ctx.stubs.pop()
      const descriptor = Object.getOwnPropertyDescriptor(object, path)
      if (descriptor && descriptor.get) {
        descriptor.get = stub
        Object.defineProperty(object, path, descriptor)
      } else {
        set(object, path, stub)
      }

      ctx.spies[path].pop()
    },
  }
})

export default decorated
