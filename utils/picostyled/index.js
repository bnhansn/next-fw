import {
  hashString,
  getProperties,
  parseSelector,
  getValidAttributes,
  css
} from './utils'

let cache = {}

const sheet = document.head.appendChild(document.createElement('style')).sheet
const insert = (rule) => sheet.insertRule(rule, sheet.cssRules.length)
const generateName = (inthash) => `_${inthash.toString(36)}`
const createRule = (className, properties, media) => {
  const rule = `.${className}{${properties}}`

  return media ? `${media}{${rule}}` : rule
}

const parse = (rules, child = '', media) => {
  const inlineRules = rules.replace(/^\s+|\s+$|[\t\n\r]*/gm, '') // remove whitespace
  const selectors = inlineRules.match(/[&|@](.*?){(.*?)}/g) || []
  const properties = getProperties(inlineRules)
  const hash = hashString(rules)

  if (cache[hash]) return cache[hash]

  const className = generateName(hash)

  insert(createRule(className, properties))

  selectors.forEach((item) => {
    let { selector, props } = parseSelector(item)

    if (/^@/.test(selector)) {
      insert(createRule(className, props, selector))
    } else {
      selector = selector.replace(/^&/, className)
      insert(createRule(selector, props))
    }
  })

  cache[hash] = className

  return className
}

export default (h) => (tag) => (chunks, ...interpolations) => (
  { children, innerRef, ...props },
  context
) => {
  props = props || {}

  const className = parse(css(chunks, interpolations, props))
  const attributes = getValidAttributes(props, document.createElement(tag))

  const data = {
    ...attributes,
    ref: innerRef,
    class: [
      className,
      (props.className || '').trim(),
      (props.class || '').trim()
    ]
      .filter(Boolean)
      .join(' ')
  }

  return h(tag, data, children)
}
