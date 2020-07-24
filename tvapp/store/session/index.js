// import getConfig from 'next/config'
import { SessionError } from '../../errors'

// FIXME
import { getVisitorSession } from './visitor'
// const configuration = getConfig()
const configuration = { sessionGetter: getVisitorSession }

// Decorator returns async function which will return promise
// for session refresh if necessary. Uses dependency injection
// __sessionGetter for use in tests.
export const withSession = function (fn, __sessionGetter) {
  return async function () {
    const sessionGetter = configuration.sessionGetter || __sessionGetter
    const params = arguments[0].params || {}
    try {
      arguments[0].session = await sessionGetter({ params })
    } catch (error) {
      const { sentry } = params
      const { currentHub } = sentry || {}
      if (currentHub && !(error instanceof SessionError)) {
        currentHub.captureException(error)
      }
      throw error
    }

    return await fn.apply(this, arguments)
  }
}
