import { toObject, stringify } from '../../../utils/qs'
import { SessionError } from '../../errors'
import { isExpired } from './helpers'

const MIN_ACTIVITY = 1000 * 60 * 30
const sessionKey = '_fstptyfwvs'
const visitorIdTokenKey = 'vit'
const accessTokenKey = 'access_token'

let lastActivity = null
let sessionPromise = null
let sessionStore = {}

export const getVisitorSession = (
  { params },
  __sessionFetcher = fetchRemoteSession
) => {
  // We need to handle lastActivity locally to be able to reset activity
  // as soon as we receive updated session. Othervise we will continue to invalidate
  // session by old params.lastActivity even after fresh session is received.
  if (!lastActivity) lastActivity = params.lastActivity // initial setup
  if (params.lastActivity < lastActivity) params.lastActivity = lastActivity

  let visitorIdToken = null
  const locationQuery = toObject(window.location && window.location.search)

  try {
    if (
      window.location.pathname === '/pwa/oauth_callback' &&
      accessTokenKey in locationQuery
    ) {
      // Oauth2 flow after being redirected here from Oauth provider
      const now = new Date()
      const expiresIn = locationQuery['expires_in']
      const expiresAt = new Date(now.getTime() + expiresIn * 1000)
      return validateAndResolve({
        token: locationQuery[accessTokenKey],
        expires_at: expiresAt,
        expires_in: locationQuery['expires_in'],
        session_id: locationQuery['session_id'],
        visitor_id: locationQuery['visitor_id'],
        // When logging in with OAuth, we know the resource is a User, and the
        // visitor_id is a user_id, so that can be stored in the session to
        // differentiate this from a Guest session
        user_id: locationQuery['visitor_id']
      })
    }

    // Tries to return session from localStorage. Fails if there's no session in there or if
    // it's expired
    const session = getSessionFromLocalStorage()
    const { expires_at } = session || {}

    if (session) {
      return validateAndResolve(session, params)
    } else if (accessTokenKey in locationQuery) {
      // Tries to fetch an access_token from the URL (covers the case for iframes on ITP)
      // TODO: what about refresh token and session id
      return validateAndResolve({
        access_token: locationQuery[accessTokenKey],
        expires_at: locationQuery[expires_at]
      })
    }

    throw new SessionError('Missing session')
  } catch (error) {
    if (error instanceof SessionError) {
      clearSession()
      if (sessionPromise) {
        return sessionPromise
      } else {
        if (visitorIdTokenKey in locationQuery) {
          // Tries to fetch a new session on the API using temp token (visitor_id_token)
          // Resolve temp token from url
          visitorIdToken = locationQuery[visitorIdTokenKey]
        }

        sessionPromise = __sessionFetcher({
          visitorIdToken,
          params
        }).then((session) => {
          sessionPromise = null
          lastActivity = new Date()
          return Promise.resolve(session)
        })
        return sessionPromise
      }
    } else {
      throw error
    }
  }
}

export const fetchRemoteSession = async ({ visitorIdToken, params }) => {
  const { api_host } = params
  let session = undefined
  try {
    const url = `${api_host}/api/sessions?${stringify({
      vit: visitorIdToken,
      provider: 'fw_visitor'
    })}`
    const response = await fetch(url, {
      method: 'POST',
      cache: 'no-cache',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (response && response.status >= 200 && response.status < 300) {
      session = await response.json()
    } else {
      throw new SessionError(
        `Invalid response (${response && response.status})`
      )
    }
  } catch (error) {
    if (error instanceof TypeError) {
      // Bypass sentry for CORS related errors (failed to fetch)
      throw new SessionError(error)
    }
    if (error.message === 'Timeout') {
      throw new SessionError('Session timeout')
    }
    throw error
  }

  // Modify expires_at to reflect possible user's
  // date & time settings mismatch with server
  const { expires_in } = session
  const now = new Date()
  const expires_at = new Date(now.getTime() + expires_in * 1000)

  setSession({ ...session, expires_at })

  return session
}

export const getSessionFromLocalStorage = () => {
  try {
    return JSON.parse(
      window.localStorage && window.localStorage.getItem(sessionKey)
    )
  } catch (error) {
    return sessionStore
  }
}

export const validateAndResolve = (session, params) => {
  const { lastActivity } = params || {}
  const { expires_at } = session || {}

  if (!expires_at || isExpired(expires_at)) {
    throw new SessionError('Expired session token')
  }

  if (lastActivity && new Date() - lastActivity > MIN_ACTIVITY) {
    // Throw to request session refresh
    throw new SessionError('Inactivity')
  }

  setSession(session)

  return Promise.resolve(session)
}

export const setSession = (newSession) => {
  try {
    sessionStore = newSession
    window.localStorage &&
      window.localStorage.setItem(sessionKey, JSON.stringify(newSession))
  } catch (error) {
    // Pass silently
  }
}

export const clearSession = () => {
  try {
    sessionStore = {}
    window.localStorage && window.localStorage.clear(sessionKey)
  } catch (error) {
    // Pass silently
  }
}

export const lastActivitySetter = () => {
  lastActivity = new Date()
}
