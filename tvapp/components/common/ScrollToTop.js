// import { useEffect } from 'react'
// import { useLocation } from 'react-router-dom'
// import { usePrevious } from '../../hooks'

export default ({ children }) => {
  // const { pathname } = useLocation()
  // const previousPath = usePrevious(pathname)
  //
  // useEffect(() => {
  //   if (
  //     previousPath &&
  //     pathname !== previousPath &&
  //     !previousPath.startsWith(pathname)
  //   ) {
  //     window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  //   }
  // }, [pathname, previousPath])

  return children
}
