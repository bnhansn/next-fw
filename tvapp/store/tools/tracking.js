import { withSession } from '../session'
import { stringify } from '../../../utils/qs'

const isArray = (value) => Array.isArray(value)
const isObject = (value) => value === Object(value) && !isArray(value)

const objectToFormData = (data, fd, namespace) => {
  const formData = fd || new FormData()

  return data
    ? Object.keys(data).reduce((acc, key) => {
        if (isObject(data[key])) {
          objectToFormData(data[key], formData, key)
        } else {
          const formDataKey = namespace ? `${namespace}[${key}]` : key
          acc.append(formDataKey, data[key])
        }
        return acc
      }, formData)
    : null
}

const sendBeacon = ({ host, path, query, data }) => {
  if (navigator.sendBeacon) {
    const q = query
      ? Object.entries(query)
          .filter(([, val]) => val !== undefined)
          .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
      : {}

    const formData = objectToFormData(data)

    const success = navigator.sendBeacon(
      `${host}${path}${stringify(q, { addQueryPrefix: true })}`,
      formData
    )
    if (success) {
      if (
        window.location &&
        window.location.search.indexOf('debug_fwn=') > 0
      ) {
        // eslint-disable-next-line
        console.info('tracking', { host, path, query, data })
      }
    }

    return Promise.resolve(success)
  }
  return Promise.reject()
}

/**
 * There is a bug with Chrome not setting the correct
 * Content-Type: application/x-www-form-urlencoded.
 * Firefox and Safari are both working.
 * https://bugs.chromium.org/p/chromium/issues/detail?id=747787
 * Implemented a workaround by sending multipart/form-data.
 *
 * @param {object} params Tracking params
 */
const sendBeaconPixel = ({ host, path, data }) => {
  if (navigator.sendBeacon) {
    // multipart/form-data
    const formData = new FormData()
    formData.append('_json', encodeURI(JSON.stringify(data)))

    const url = `${host}${path}`
    const success = navigator.sendBeacon(url, formData)
    if (success) {
      if (
        window.location &&
        window.location.search.indexOf('debug_fwn=') > 0
      ) {
        // eslint-disable-next-line
        console.info('tracking', { url, data })
      }
    }

    return Promise.resolve(success)
  }
  return Promise.reject()
}

export const sendTracking = ({ url: path, query, params, data, session }) => {
  const { api_host: host } = params
  const { token, embed_instance: { id: embed_instance_id } = {} } =
    session || {} // Note: token is optional here. session might not be available
  if (token) data = { ...data, access_token: token }
  if (embed_instance_id) data = { ...data, embed_instance_id }
  return sendBeacon({ host, path, query, data })
}

export const sendPixelTracking = ({
  url: path,
  data = {},
  params,
  session
}) => {
  const { pixel_host: host } = params
  const {
    user_id,
    guestId,
    visitor_id,
    embed_instance: { id: embed_instance_id } = {}
  } = session || {}
  const session_id =
    session.session_id || (session.session && session.session.session_id)
  const session_type =
    session.session_type || (session.session && session.session.session_type)

  // Append session params
  if (embed_instance_id) data = { ...data, embed_instance_id }
  if (session_id) data = { ...data, session_id }
  if (session_type) data = { ...data, session_type }
  if (user_id) data = { ...data, _user_id: user_id }
  if (visitor_id) data = { ...data, visitor_id: visitor_id }
  if (guestId) data = { ...data, guest_id: guestId }

  return sendBeaconPixel({ host, path, data })
}

export const sendTrackingWithSession = withSession(sendTracking)

export const sendPixelTrackingWithSession = withSession(sendPixelTracking)

// TODO: @deric remove after play_segments prod test
export const shouldSendToPixel = (publisherClientId) => {
  const whitelist = [
    'b5qXAv',
    'W5E3Jg',
    'Xv6M6g',
    'RoPlro',
    'AvGP85',
    'Po9D95',
    'ao0J8v',
    'W5EXKv',
    'Xv6OO5',
    'YoeM7o',
    'Mgdd3g',
    'xvJkG5',
    'G5z7ro',
    'no8Yjg',
    'wojPOv',
    'Xv6XJo',
    '35anjo',
    'no3ZK5',
    'joWJx5',
    'ao09dg',
    'RoPByv',
    'e5x2Jg',
    'e5xOqv',
    'no3L8g',
    'wojnEo',
    'AvGL05'
  ]
  const set = new Set(whitelist)
  return set.has(publisherClientId)
}
