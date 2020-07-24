import getConfig from 'next/config'
import { videoActionClickUrl } from '../components/helpers'
import {
  browserDetection,
  appContextToTrackingData,
  appContextToTrackingDataPixel,
  getOS,
  nowAndNowLocalToString,
  extractPageUrl
} from '../helpers'
import {
  sendTrackingWithSession,
  sendPixelTrackingWithSession,
  shouldSendToPixel
} from './tools/tracking'
import { filterCurrentInViewport, sortByOtherArray } from './tools/utils'

// FIXME
import { lastActivitySetter } from './session/visitor'
// const configuration = getConfig()

// const { publicRuntimeConfig } = getConfig()
// const { urls: trackingUrls } = publicRuntimeConfig.tracking
// console.log(publicRuntimeConfig.tracking)

// FIXME
const tracking = {
  urls: ({ videoId }) => ({
    engagement: `/api/videos/${videoId}/engagements`,
    playSegment: `/api/videos/${videoId}/play_segments`,
    views: `/api/videos/${videoId}/views`,
    picked_video: `/api/videos/${videoId}/picked_videos`,
    thumbnailImpressions: '/api/thumbnail_impressions',
    scrollVideos: '/api/videos/scroll_videos',
    scrollEndVideos: '/api/videos/scroll_end_videos'
  })
}

const trackingUrls = tracking.urls

const resolveNextAutoplay = ({ state }) => {
  const { inViewportIds, navigation, videos } = state
  const viewportIds = sortByOtherArray(
    filterCurrentInViewport(inViewportIds),
    navigation
  )

  const ads = viewportIds.filter((encoded_id) => videos[encoded_id].vast_tag)
  const featured = viewportIds.filter((encoded_id) => videos[encoded_id].badge)

  return ads.length > 0
    ? ads[0]
    : featured.length > 0
    ? featured[0]
    : viewportIds[0]
}

const impressionMeta = {
  browser: browserDetection(),
  // :context
  // country:
  //   window.navigator.language && window.navigator.language.split('-')[1],
  // :element_id
  // locale: window.navigator.language,
  os: getOS(),
  // :os_version
  platform: process.env.PLATFORM,
  product: process.env.PRODUCT,
  product_version: process.env.PRODUCT_VERSION,
  track_version: process.env.TRACK_VERSION
}

export const initialState = {
  inViewportIdsReportQueue: [], // [encoded_id] # Thumbnails which entered viewport and needs to be tracked
  inViewportIdsReportSuccess: [], // [encoded_id] # Thumbnails already tracked to avoid duplicate tracking
  inViewportIds: {}, // {encoded_id: true/false} # Current in viewport status for thumbnails
  autoplayIds: {}, // {encoded_id: true/false}
  autoplayIdsPrevious: {},
  thumbnailImpressionIdsReportQueue: [], // [encoded_id]
  thumbnailImpressionIdsReportSuccess: [], // [encoded_id]
  embedImpressionTracked: false,
  videosSeen: [],
  playSegment: {
    // :element_id,
    // :os_version,
    browser: browserDetection(),
    // country:
    //   window.navigator.language && window.navigator.language.split('-')[1],
    end_time: 0,
    // locale: window.navigator.language,
    os: getOS(),
    platform: process.env.PLATFORM,
    product: process.env.PRODUCT,
    product_version: process.env.PRODUCT_VERSION,
    track_version: process.env.TRACK_VERSION
  },
  engagement: {
    // :nav, // "first", "next", "prev", "push", "pop"
    // :context,
    // :video_type,
    seconds_watched: 0,
    os: getOS(),
    app_version: process.env.PRODUCT_VERSION,
    platform: process.env.PLATFORM,
    product: process.env.PRODUCT
  }
}

export const actions = () => ({
  processInViewportQueue: (state) => {
    const {
      params,
      appContext,
      session,
      navigation,
      inViewportIdsReportQueue,
      inViewportIdsReportSuccess
    } = state

    const alreadySent = new Set(inViewportIdsReportSuccess)
    const ids = [...new Set(inViewportIdsReportQueue)].filter(
      (x) => !alreadySent.has(x)
    )
    const contextData = appContextToTrackingData({ appContext })

    if (ids.length) {
      const data = {
        viewport_video_ids: sortByOtherArray(ids, navigation),
        ...contextData
      }

      sendTrackingWithSession({
        url: trackingUrls({}).scrollVideos,
        params,
        data,
        session
      })

      return {
        inViewportIdsReportQueue: [],
        inViewportIdsReportSuccess: [...alreadySent, ...ids]
      }
    }
  },

  setContext: (state, action) => {
    const { appContext } = action

    // Resets the playSegment and engagement tracking state when the context changes
    return {
      appContext,
      playSegment: {},
      engagement: {}
    }
  },

  trackScrollEndVideos: (state) => {
    const { params, appContext, session, navigation, inViewportIds } = state

    const contextData = appContextToTrackingData({ appContext })

    const ids = filterCurrentInViewport(inViewportIds)
    if (ids.length) {
      const data = {
        viewport_video_ids: sortByOtherArray(ids, navigation),
        ...contextData
      }

      sendTrackingWithSession({
        url: trackingUrls({}).scrollEndVideos,
        params,
        data,
        session
      })
    }
  },

  trackEmbedImpression: (state) => {
    const {
      embedImpressionTracked,
      params,
      session,
      appContext,
      videos
    } = state

    if (!embedImpressionTracked) {
      const { mode, placement } = params
      const [now, nowLocal] = nowAndNowLocalToString()
      const videosArray = Object.values(videos)
      const contextData = appContextToTrackingData({ appContext })
      const data = {
        ...impressionMeta,
        displayed_at: now,
        displayed_at_local: nowLocal,
        mode: mode,
        page_url: extractPageUrl({ params }),
        placement: placement || '',
        variant: videosArray.length > 0 ? videosArray[0].variant : '',
        ...contextData
      }

      sendTrackingWithSession({
        url: '/embed/impressions',
        params,
        data,
        session
      })
      return {
        embedImpressionTracked: true
      }
    }
  },

  trackVideoPick: (state, action) => {
    const { video } = action
    const { variant } = video
    const { params, appContext, session, inViewportIds } = state
    const contextData = appContextToTrackingData({ appContext })
    const data = {
      variant: variant,
      viewport_video_ids: filterCurrentInViewport(inViewportIds),
      ...contextData
    }

    lastActivitySetter(params)

    sendTrackingWithSession({
      url: trackingUrls({ videoId: video.encoded_id }).picked_video,
      params,
      data,
      session
    })
  },

  registerInViewport: (state, action) => {
    const {
      video: { encoded_id }
    } = action
    const { inViewportIds, inViewportIdsReportQueue } = state

    // There might be a IntersectionObserver bug in UC Browser (More than 16% of India users)
    // where isIntersecting is always undefined
    // Solution might be to check float intersectionRatio instead of boolean isIntersecting

    if (!inViewportIds[encoded_id]) {
      return {
        inViewportIdsReportQueue: [...inViewportIdsReportQueue, encoded_id],
        inViewportIds: {
          ...inViewportIds,
          [encoded_id]: true
        }
      }
    }
  },

  unregisterInViewport: (state, action) => {
    const {
      video: { encoded_id }
    } = action
    const { inViewportIds } = state

    if (inViewportIds[encoded_id]) {
      return {
        inViewportIds: {
          ...inViewportIds,
          [encoded_id]: false
        }
      }
    }
  },

  setAutoplay: (state, action) => {
    const { video } = action || {}
    const { autoplayIds, iframe, params, inViewportIds } = state
    const autoplayEnabled = params.autoplay && !iframe.isOpen

    if (!autoplayEnabled || !video || !video.encoded_id) {
      return state
    }

    // video is in viewport and has no autoplay
    if (inViewportIds[video.encoded_id] && !autoplayIds[video.encoded_id]) {
      return {
        autoplayIds: {
          [video.encoded_id]: true
        }
      }
    }
  },

  registerForAutoplay: (state, action) => {
    const { video } = action || {}
    const { autoplayIds, iframe, params } = state
    const autoplayEnabled = params.autoplay && !iframe.isOpen

    if (!autoplayEnabled) {
      return state
    }

    const nextAutoplayId =
      (video && video.encoded_id) || resolveNextAutoplay({ state })

    if (!autoplayIds[nextAutoplayId]) {
      return {
        autoplayIds: {
          [nextAutoplayId]: true
        }
      }
    }
  },

  unregisterForAutoplay: (state, action) => {
    const { video } = action
    const { autoplayIds, iframe, params } = state
    const autoplayEnabled = params.autoplay && !iframe.isOpen

    if (!autoplayEnabled) {
      return state
    }

    if (autoplayIds[video.encoded_id]) {
      return {
        autoplayIds: {
          ...autoplayIds,
          [video.encoded_id]: false
        }
      }
    }
  },

  processThumbnailImpressionQueue: (state) => {
    const {
      params,
      appContext,
      session,
      thumbnailImpressionIdsReportQueue: queue,
      thumbnailImpressionIdsReportSuccess: success,
      videos
    } = state
    const { mode, placement } = params

    const ids = [...new Set(queue)]

    if (ids.length) {
      const [now, nowLocal] = nowAndNowLocalToString()
      const contextData = appContextToTrackingData({ appContext })

      const data = {
        ...impressionMeta,
        displayed_at: now,
        displayed_at_local: nowLocal,
        mode: mode,
        page_url: extractPageUrl({ params }),
        placement: placement || '',
        variant: videos[queue[0]].variant,
        video_ids: ids,
        ...contextData
      }

      sendTrackingWithSession({
        url: trackingUrls({}).thumbnailImpressions,
        params,
        data,
        session
      })

      return {
        thumbnailImpressionIdsReportQueue: [],
        thumbnailImpressionIdsReportSuccess: [...success, ...queue]
      }
    }
  },

  registerThumbnailImpression: (state, action) => {
    const {
      thumbnailImpressionIdsReportQueue: queue,
      thumbnailImpressionIdsReportSuccess: success
    } = state

    const {
      video: { encoded_id }
    } = action

    if (success.indexOf(encoded_id) < 0) {
      return {
        thumbnailImpressionIdsReportQueue: [...queue, encoded_id]
      }
    }
  },

  resetEngagement: () => ({
    engagement: { ...initialState.engagement }
  }),

  updateEngagement: (state, action) => {
    const {
      duration: playerDuration,
      loopCount,
      secondsWatched: playerCurrentTime,
      variant
    } = action
    const [now, nowLocal] = nowAndNowLocalToString()

    const duration = Math.round(playerDuration * 1000) / 1000
    const secondsWatched = Math.round(playerCurrentTime * 1000) / 1000

    return {
      engagement: {
        ...state.engagement,
        duration,
        engaged_at: now,
        engaged_at_local: nowLocal,
        loop_count: loopCount,
        progress: Math.round((secondsWatched / duration) * 100),
        seconds_watched: secondsWatched,
        variant
      }
    }
  },

  trackEngagement: (state, action) => {
    const { engagement, params, session, appContext } = state
    const { completed, videoId } = action
    const [now, nowLocal] = nowAndNowLocalToString()
    const contextData = appContextToTrackingData({ appContext })

    const data = {
      engaged_at: now,
      engaged_at_local: nowLocal,
      ...engagement,
      autoplay: !!params.autoplay,
      completed: !!completed,
      ...contextData
    }

    lastActivitySetter(params)

    sendTrackingWithSession({
      url: trackingUrls({ videoId }).engagement,
      data,
      params,
      session
    })
  },

  resetPlaySegment: (state, action) => {
    const { end_time } = initialState.playSegment
    const { endTime } = action || {}
    return {
      playSegment: {
        ...initialState.playSegment,
        end_time: endTime || end_time || 0
      }
    }
  },

  trackPlaySegment: (state, action) => {
    const { session, appContext, params, playSegment } = state
    const {
      duration: playerDuration,
      state: playerState,
      variant,
      video,
      isMuted,
      endTime: currentEndTime,
      loopCount,
      playUid,
      volume
    } = action
    const { autoplay, placement } = params
    const [now, nowLocal] = nowAndNowLocalToString()
    const query = { video_id: video.encoded_id }
    const startTime = Math.round(playSegment.end_time * 1000) / 1000
    const endTime = Math.round(currentEndTime * 1000) / 1000
    const duration = Math.round(playerDuration * 1000) / 1000

    let data = {
      ...state.playSegment,
      autoplay: !!autoplay,
      duration,
      end_time: endTime,
      loop_count: loopCount,
      muted: isMuted,
      placement: placement,
      play_uid: playUid,
      resolution: video.quality,
      start_time: startTime,
      state: playerState,
      triggered_at: now,
      triggered_at_local: nowLocal,
      variant,
      volume
    }

    if (
      loopCount <= 100 &&
      data.start_time >= 0 &&
      data.start_time < data.end_time
    ) {
      if (shouldSendToPixel(appContext.publisherClientId)) {
        data = {
          ...data,
          mode: params.mode,
          page_type: params.page_type,
          // play_trigger: // TODO: @deric add play trigger logic
          _video_id: video.encoded_id,
          ...impressionMeta,
          ...appContextToTrackingDataPixel({ appContext })
        }
        sendPixelTrackingWithSession({
          url: `/play_segments`,
          data,
          params,
          session
        })
      } else {
        // TODO: @deric remove after switch to Pixel2
        data = {
          ...data,
          ...appContextToTrackingData({ appContext })
        }
        sendTrackingWithSession({
          url: trackingUrls({ videoId: video.encoded_id }).playSegment,
          params,
          data,
          query,
          session
        })
      }

      return {
        playSegment: {
          ...state.playSegment,
          ...data
        }
      }
    }
    return state
  },

  trackVideoStarted: (state, action) => {
    const { params, session, appContext } = state
    const { video } = action
    const { autoplay } = params
    const contextData = appContextToTrackingData({ appContext })
    const data = {
      autoplay: !!autoplay,
      ...contextData
    }

    sendTrackingWithSession({
      url: trackingUrls({ videoId: video.encoded_id }).views,
      params,
      data,
      session
    })
    return {
      videosSeen: [...state.videosSeen, video.encoded_id]
    }
  },

  trackCTAClick: (state, action) => {
    const { params, session, appContext } = state
    const { video } = action
    const url = videoActionClickUrl({ video, appContext })
    const data = {
      ...appContextToTrackingData({ appContext }),
      play_uid: state.playSegment?.play_uid
    }

    sendTrackingWithSession({
      url,
      data,
      params,
      session
    })
  }
})
