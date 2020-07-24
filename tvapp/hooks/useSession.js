import { useEffect, useState } from 'react'
import { withSession } from '../store/session'

// Creates a session state object
// Session is async fetched

export default ({ params }) => {
  const [session, setSession] = useState({})

  useEffect(() => {
    const { widget_id } = params
    if (widget_id) {
      ;(async () => {
        await withSession(({ session }) => {
          setSession(session)
        })({ session, params })
      })()
    }
  }, [params.widget_id])

  return session
}
