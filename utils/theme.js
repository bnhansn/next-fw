export const breakpoints = {
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200
}

export const mq = Object.keys(breakpoints).reduce((acc, key) => {
  acc[key] = `@media (min-width: ${breakpoints[key]}px)`
  return acc
}, {})
