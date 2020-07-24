import { VASTClient, VASTTracker } from 'vast-client'

const logError = () => 'FIXME'
// import { logError } from '../../embed/helpers'

const fetchTracker = async (url) => {
  const options = { resolveAll: false, timeout: 2000, withCredentials: true }
  const client = new VASTClient()
  const response = await client.get(url, options)

  const [ad] = response.ads
  const [creative] = ad.creatives

  const tracker = new VASTTracker(client, ad, creative)

  return tracker
}

const callTracker = (tracker) => (fn, ...args) => {
  try {
    if (fn in tracker) {
      // Standard VASTTracker public functions
      // For available events see
      // https://github.com/dailymotion/vast-client-js/blob/master/docs/api/vast-tracker.md#events
      tracker[fn](...args)
    } else {
      // Call pixel on custom event - call EventEmitter directly
      tracker['track'](fn, ...args)
    }
  } catch (error) {
    logError(
      `VAST failed to track ${fn} on tracker`,
      tracker,
      `with error`,
      error
    )
  }
}

export const trackerFactory = (url) => {
  let queue = []
  let tracker = null

  fetchTracker(url)
    .then((initialized) => (tracker = initialized))
    .catch((error) => logError(error))

  return (...args) => {
    queue.push(args)

    if (tracker) {
      queue.forEach((args) => callTracker(tracker)(...args))
      queue = []
    }
  }
}
