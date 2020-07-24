// murmurhash2 via https://gist.github.com/raycmorgan/588423
export function hashString(str, seed) {
  let hash = 0
  let i
  let chr

  if (str.length === 0) return hash

  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i)
    hash = (hash << 5) - hash + chr
    hash |= 0
  }

  return hash
}

const getSelector = (str) => str.match(/[&|@](.*?){/g)[0].replace(/{$/, '')
const getDeclaration = (str) => str.match(/{(.*?)}/)[1]

export function getProperties(str) {
  return str
    .replace(/[&|@](.*?){(.*?)}/g, '') // remove selectors
    .split(/;/) // split properties
    .filter(Boolean)
    .join(';')
}

export function parseSelector(str) {
  return {
    selector: getSelector(str),
    props: getProperties(getDeclaration(str))
  }
}

export function getValidAttributes(props, el) {
  const allowed = ['playsInline', 'allowFullScreen'] // some properties are perfectly valid but not recognized using `x in y`

  return Object.keys(props)
    .filter((prop) => prop.toLowerCase() in el || allowed.indexOf(prop) > -1)
    .reduce((all, attr) => {
      all[attr] = props[attr]
      return all
    }, {})
}

export function css(chunks, interpolations, props) {
  return chunks
    .map((chunk, i) =>
      interpolations[i] && typeof interpolations[i] === 'function'
        ? `${chunk}${interpolations[i](props || {})}`
        : interpolations[i]
        ? `${chunk}${interpolations[i]}`
        : chunk
    )
    .join('')
}
