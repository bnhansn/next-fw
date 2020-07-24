import qs from 'qs'

// Docs available here https://www.npmjs.com/package/qs

export function stringify(obj, options = {}) {
  // qs.stringify() can handle obj not being Object gracefully
  return qs.stringify(obj, { arrayFormat: 'comma', ...options })
}

export function toObject(qstring, options = {}) {
  // qs.parse() can handle object and string gracefully
  return qs.parse(qstring, { ignoreQueryPrefix: true, ...options })
}
