export default (callback, element, options) => {
  const { root, threshold, ...rest } = options || {}
  const observerCallback = (entries) => callback(entries)
  const observerSettings = {
    root: root || null,
    threshold: threshold || [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
    ...rest
  }

  const observer = new IntersectionObserver(observerCallback, observerSettings)
  observer.observe(element)

  return observer
}
