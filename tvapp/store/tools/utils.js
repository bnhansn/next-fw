export const filterCurrentInViewport = (inViewportIds) =>
  Object.entries(inViewportIds)
    .filter(([, value]) => value)
    .map(([key]) => key)

export const sortByOtherArray = (arr, other) =>
  [...arr].sort((a, b) => (other.indexOf(a) > other.indexOf(b) ? 1 : -1))
