import { useEffect } from 'react'

export default ({ children }) => {
  useEffect(() => {
    // Freeze window scroll position
    const scrollY = window.scrollY
    const body = document.getElementsByTagName('body')[0]
    body.style.overflow = 'hidden'
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`

    return () => {
      // Restore window scroll
      body.style.overflow = ''
      body.style.position = ''
      body.style.top = ''
      window.scrollTo(0, scrollY)
    }
  }, [])

  return children
}
