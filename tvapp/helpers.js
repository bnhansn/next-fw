import throttle from 'lodash/throttle'
import { toObject } from '../utils/qs'
import {
  DISCOVER_CONTEXT_TYPE,
  HASHTAG_CONTEXT_TYPE
} from './components/helpers'

const SI_SYMBOL = ['', 'k', 'M', 'G', 'T', 'P', 'E']

export const abbreviateNumber = (number) => {
  var tier = (Math.log10(number) / 3) | 0

  if (tier === 0) return number

  var suffix = SI_SYMBOL[tier]
  var scale = Math.pow(10, tier * 3)
  var scaled = number / scale

  return scaled.toFixed(1) + suffix
}

export const nowAndNowLocal = () => {
  const now = new Date()
  const nowLocal = new Date(now - now.getTimezoneOffset() * 60 * 1000)

  return [now, nowLocal]
}

export const nowAndNowLocalToString = () => {
  const [now, nowLocal] = nowAndNowLocal()

  return [
    now.toISOString().replace('Z', ''),
    nowLocal.toISOString().replace('Z', '')
  ]
}

export const uuidv4 = () => {
  try {
    // UUID v4 using crypto RNG
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (char) => {
      const random = window.crypto.getRandomValues(new Uint8Array(1))[0]
      const value = char ^ (random & (15 >> (char / 4)))
      return value.toString(16)
    })
  } catch (error) {
    // Fallback to simple version using Math.random() as RNG
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
      const random = (Math.random() * 16) | 0
      const value = char === 'x' ? random : (random & 0x3) | 0x8
      return value.toString(16)
    })
  }
}

export const removeEmojis = (text) => {
  // https://www.regextester.com/106421
  // the following code removes the following characters
  // 0x00A9(copy right symbol),
  // 0x00AE(register symbol),
  // 0x1F000 - 0x1F3FF, 0x1F400 - 0x1F7FF, 0x1F800 - 0x1FBFF (various emoji, symobols and pictographs)
  return typeof text === 'string'
    ? text
        .replace(
          /(\u00a9|\u00ae|[\u2000-\u2BFF]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g,
          ''
        )
        .trim()
    : ''
}

export const detectWordpress = () => {
  const meta = document.querySelector("meta[name='generator']")
  return (
    meta &&
    meta.hasAttribute('content') &&
    meta.getAttribute('content').toLowerCase().startsWith('wordpress')
  )
}

// Handles dispatching tracking of in inviewport thumbnails
// for both grid and player sidebar
let isScrolling = null
export const onGridScroll = (actions) => {
  const {
    processInViewportQueue,
    registerForAutoplay,
    trackScrollEndVideos
  } = actions
  const processInViewportQueue_throttled = throttle(
    processInViewportQueue,
    1000,
    {
      leading: false
    }
  )

  return () => {
    clearTimeout(isScrolling)
    isScrolling = setTimeout(() => {
      registerForAutoplay()
      trackScrollEndVideos()
    }, 500)

    processInViewportQueue_throttled()
  }
}

let polyfillCallbacks = []

export const fetchPolyfillio = (w, d, callback) => {
  const id = 'fwn_polyfills'
  const elem = d.getElementById(id)

  if (elem && elem.dataset.loaded) {
    callback()
  } else if (elem) {
    polyfillCallbacks.push(callback)
  } else {
    polyfillCallbacks.push(callback)

    const callbackName =
      '_fwnRender_' + Math.random().toString(36).substring(2, 10)

    w[callbackName] = () => {
      d.getElementById(id).dataset.loaded = true
      polyfillCallbacks.forEach((callback) => callback())
      polyfillCallbacks = []
    }

    const features = [
      'Array.from',
      'Array.prototype.entries',
      'Array.prototype.find',
      'Array.prototype.flat',
      'Array.prototype.includes',
      'Array.prototype.values',
      'CustomEvent',
      'ResizeObserver',
      'IntersectionObserver',
      'IntersectionObserverEntry',
      'JSON',
      'Object.assign',
      'Object.entries',
      'Object.fromEntries',
      'Object.values',
      'Promise',
      'requestAnimationFrame',
      'requestIdleCallback',
      'String.prototype.includes',
      'String.prototype.startsWith',
      'Symbol',
      'URL',
      'document.querySelector',
      'fetch'
    ]

    const script = d.createElement('script')
    script.async = true
    script.id = id
    script.src = `https://polyfill.io/v3/polyfill.min.js?features=${features.join(
      '%2C'
    )}&flags=gated&callback=${callbackName}`
    script.type = 'text/javascript'
    script.crossOrigin = 'anonymous'
    script.referrerPolicy = 'no-referrer'
    d.head.appendChild(script)
  }
}

export const eligibleForSentry = (params) => {
  const { app_id, widget_id } = params

  if (parseInt(widget_id.substr(0, 1), 16) % 2 === 0) {
    // Let every other widget be covered by Sentry
    return false
  }

  if (['Hv4b8ZJ3VjxHMg2H9zBEQyYn79CZZ3Zp'].includes(app_id)) {
    // Hv4b8ZJ3VjxHMg2H9zBEQyYn79CZZ3Zp - Omlet.gg
    return false
  }

  return true
}

export const getOS = () => {
  if (typeof window === 'undefined') {
    return
  }

  var userAgent = window.navigator.userAgent,
    platform = window.navigator.platform,
    macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K', 'darwin'],
    windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
    iosPlatforms = ['iPhone', 'iPad', 'iPod'],
    os = null

  if (macosPlatforms.indexOf(platform) !== -1) {
    os = 'MacOS'
  } else if (iosPlatforms.indexOf(platform) !== -1) {
    os = 'iOS'
  } else if (windowsPlatforms.indexOf(platform) !== -1) {
    os = 'Windows'
  } else if (/Android/.test(userAgent)) {
    os = 'Android'
  } else if (!os && /Linux/.test(platform)) {
    os = 'Linux'
  }

  return os
}

export const mobileOS = ['Android', 'iOS']

export const browserDetection = () => {
  if (typeof window === 'undefined') {
    return null
  }
  if (window.navigator.userAgent.search('MSIE') >= 0) {
    return 'IE'
  } else if (window.navigator.userAgent.search('Edge') >= 0) {
    return 'Edge'
  } else if (
    window.navigator.userAgent.search('Chrome') >= 0 ||
    window.navigator.userAgent.search('CriOS') >= 0
  ) {
    return 'Chrome'
  } else if (window.navigator.userAgent.search('Firefox') >= 0) {
    return 'Firefox'
  } else if (
    window.navigator.userAgent.search('Safari') >= 0 &&
    window.navigator.userAgent.search('Chrome') < 0
  ) {
    return 'Safari'
  } else if (window.navigator.userAgent.search('Opera') >= 0) {
    return 'Opera'
  } else {
    return null
  }
}

export const ITPFreeUserAgents = ['Chrome', 'Firefox']

export const extractPageUrlFromQuerystring = (location) => {
  const { href } = location || {}
  const [, query] = href ? href.split('?') : []
  let { page_url } = toObject(query)
  if (page_url) {
    // if the href contains page_url, return its page_url
    // remove query if page_url still contains query
    if (page_url.includes('?')) {
      page_url = page_url.split('?')[0]
    }
    return page_url
  }
  return null
}

export const extractPageUrl = (state) => {
  // Note: extractPageUrl helper is being used by both FWN and PWA to determine
  // most probable page_url passed to tracking requests. Be aware for FWN it is
  // a placement url, however for PWA it is a referrer url.

  const { params } = state || {}
  const { referrer, in_iframe, page_url } = params || {}

  if (in_iframe && referrer) {
    // value taken from referrer of an iframe
    return referrer
  }

  return page_url
}

export const appContextToTrackingData = ({ appContext }) => {
  const { appContextType } = appContext

  switch (appContextType) {
    case DISCOVER_CONTEXT_TYPE: {
      return {
        app_context_type: appContextType
      }
    }
    case HASHTAG_CONTEXT_TYPE: {
      const { tag } = appContext
      return {
        app_context_type: appContextType,
        hashtag: tag
      }
    }
  }
}

export const appContextToTrackingDataPixel = ({ appContext }) => {
  const { appContextType } = appContext

  switch (appContextType) {
    case DISCOVER_CONTEXT_TYPE: {
      return {
        app_context_type: appContextType
      }
    }
    case HASHTAG_CONTEXT_TYPE: {
      const { tag } = appContext
      return {
        app_context_type: appContextType,
        _hashtag: tag
      }
    }
  }
}

export const closeSelfIframe = () =>
  window.parent.postMessage({ event: 'hideVideoIframe' }, '*')

export const logInfo = (...args) => {
  // eslint-disable-next-line
  console.info('FWN:', ...args)
}

export const logWarning = (...args) => {
  // eslint-disable-next-line
  console.warn('FWN:', ...args)
}

export const logError = (...args) => {
  // eslint-disable-next-line
  console.error('FWN:', ...args)
}
