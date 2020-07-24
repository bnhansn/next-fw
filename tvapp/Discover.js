import React, { useEffect, useMemo } from 'react'
import { Connect } from 'redux-zero/react'
import { DISCOVER_CONTEXT_TYPE } from './components/helpers'
import { dispatch } from './store'
import { useSession } from './hooks'
import DiscoverPage from './DiscoverPage'

export default (props) => {
  const { params } = props
  const { session: { expires_at, token } = {} } = useSession({ params })

  const appContext = useMemo(() => {
    return {
      appContextType: DISCOVER_CONTEXT_TYPE,
      expires_at,
      access_token: token
    }
  }, [expires_at, token])

  useEffect(() => {
    dispatch.setContext({ appContext })
  }, [appContext])

  useEffect(() => {
    dispatch.resetCursor() // reset cursor since getting new list
    dispatch.fetchDiscoverVideos()
    dispatch.fetchHashtags()
  }, [])

  const mapStateToProps = (state) => {
    const {
      discoverVideos,
      discoverVideosLoading,
      discoverVideosIDs,
      hashtags,
      hashtagsLoading,
      hashtagNames,
      cursor
    } = state

    return {
      cursor,
      hashtags,
      hashtagNames,
      loadingVideos: discoverVideosLoading,
      loadingHashtags: hashtagsLoading,
      videoIds: discoverVideosIDs,
      videos: discoverVideos
    }
  }

  return (
    <Connect mapToProps={mapStateToProps}>
      {(props) => {
        const {
          cursor,
          hashtags,
          hashtagNames,
          loadingVideos,
          loadingHashtags,
          store,
          videoIds,
          videos
        } = props

        return (
          <DiscoverPage
            cursor={cursor}
            dispatch={dispatch}
            videoIds={videoIds}
            videos={videos}
            loadingVideos={loadingVideos}
            hashtags={hashtags}
            hashtagNames={hashtagNames}
            loadingHashtags={loadingHashtags}
            store={store}
          />
        )
      }}
    </Connect>
  )
}
