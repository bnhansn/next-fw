import { LocalStorageError } from './../../errors'
import { uuidv4 } from './../../helpers'

const guestIdLocalStorageKey = '_fwnguid'

export const isExpired = (expiresAt) =>
  !expiresAt || (expiresAt && Date.now() - Date.parse(expiresAt) > 0)

export const isValidGuestId = (guestId) =>
  !!guestId && guestId !== 'null' && guestId !== 'undefined'

export const fetchGuestId = () => {
  try {
    return (
      window.localStorage && window.localStorage.getItem(guestIdLocalStorageKey)
    )
  } catch (error) {
    throw new LocalStorageError(`fetchGuestId: ${error}`)
  }
}

export const setGuestId = (newGuestId) => {
  try {
    window.localStorage &&
      window.localStorage.setItem(guestIdLocalStorageKey, newGuestId)
  } catch (error) {
    // Pass silently
  }
}

export const clearGuestId = () => {
  try {
    window.localStorage && window.localStorage.clear(guestIdLocalStorageKey)
  } catch (error) {
    // Pass silently
  }
}
//
// Fetch GuestId from local storage or creates a new one.
// Returns promise.
let localGuestIdCached = null
export const fetchOrCreateGuestId = () => {
  return new Promise((resolve) => {
    try {
      const localGuestId = localGuestIdCached || fetchGuestId()

      if (localGuestId) {
        if (isValidGuestId(localGuestId)) {
          return resolve(localGuestId)
        } else {
          clearGuestId()
        }
      }

      localGuestIdCached = uuidv4()
      setGuestId(localGuestIdCached)
      return resolve(localGuestIdCached)
    } catch (error) {
      if (error instanceof LocalStorageError) {
        if (!localGuestIdCached) {
          localGuestIdCached = uuidv4()
        }
        return resolve(localGuestIdCached)
      }
      throw error
    }
  })
}
