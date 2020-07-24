import React, { useEffect, useMemo } from 'react'
import { Connect } from 'redux-zero/react'
import Helmet from 'react-helmet'
import TVPlayer from '../tvplayer'
import { actions, dispatch } from './store'
import { useSession } from './hooks'
import {
  DISCOVER_CONTEXT_TYPE,
  HASHTAG_CONTEXT_TYPE
} from './components/helpers'

export default (props) => {
  const { videoId, tagname, variant, params } = props
  const { session: { expires_at, token } = {} } = useSession({ params })

  const appContext = useMemo(() => {
    return {
      appContextType: tagname ? HASHTAG_CONTEXT_TYPE : DISCOVER_CONTEXT_TYPE,
      expires_at,
      access_token: token,
      tag: tagname
    }
  }, [expires_at, token, tagname])

  useEffect(() => {
    dispatch.setContext({ appContext })
  }, [appContext])

  useEffect(() => {
    dispatch.clearVideos({ videoId })
    dispatch.fetchVideo({ videoId, appContext })
    dispatch.fetchVideos({ videoId, appContext })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId])

  useEffect(() => {
    return () => {
      dispatch.clearVideos()
      dispatch.clearCache()
    }
  }, [])

  const mapStateToProps = (state) => {
    const {
      navigation,
      videosSeen,
      videos,
      placeholders,
      isMuted,
      params,
      watchedVideos
    } = state

    return {
      videosSeen,
      video: videos[videoId],
      videosList: navigation.map((encodedId) => videos[encodedId]),
      videoPrevious:
        videos[navigation[navigation.indexOf(videoId) - 1]] || null,
      videoNext: videos[navigation[navigation.indexOf(videoId) + 1]] || null,
      watchedVideos: watchedVideos.map((encodedId) => videos[encodedId]),
      placeholders,
      isMuted,
      params
    }
  }

  return (
    <Connect mapToProps={mapStateToProps} actions={actions}>
      {(props) => {
        const {
          video,
          videosList,
          videoNext,
          params,
          watchedVideos,
          ...actions
        } = props

        return (
          <>
            <Helmet
              title={video?.caption}
              meta={[
                { property: 'og:title', content: video?.caption },
                { property: 'og:description', content: video?.caption },
                { property: 'og:image', content: video?.thumbnail_url },
                { property: 'og:type', content: 'video.other' },
                { property: 'og:video', content: video?.download_url },
                { property: 'og:video:type', content: 'video/mp4' },
                {
                  property: 'og:video:duration',
                  content: video?.duration
                },
                { property: 'og:video:width', content: video?.width },
                { property: 'og:video:height', content: video?.height }
              ]}
              link={[
                {
                  rel: 'canonical',
                  href: `/videos/${video?.encoded_id}`
                }
              ]}
            />
            <TVPlayer
              video={video}
              videosList={videosList}
              videoNext={videoNext}
              variant={variant}
              appContext={appContext}
              params={params}
              actions={actions}
              watchedVideos={watchedVideos}
            />
          </>
        )
      }}
    </Connect>
  )
}
