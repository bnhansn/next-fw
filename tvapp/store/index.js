import createStore from 'redux-zero'
import { bindActions } from 'redux-zero/utils'
import { applyMiddleware } from 'redux-zero/middleware'
import uniqBy from 'lodash/uniqBy'
import getConfig from 'next/config'
import {
  DISCOVER_CONTEXT_TYPE,
  HASHTAG_CONTEXT_TYPE
} from '../components/helpers'
import { fetcher } from './fetchers'
import {
  initialState as commonInitialState,
  actions as commonActions
} from './common'

const { publicRuntimeConfig } = getConfig()

const initialState = {
  params: {
    api_host: publicRuntimeConfig.apiHost,
    pixel_host: publicRuntimeConfig.pixelHost,
    in_iframe: typeof window !== 'undefined' && window !== window.top,
    language: typeof window !== 'undefined' && window.navigator.language,
    location: typeof window !== 'undefined' && window.location,
    per_page: 15,
    lastActivity: new Date()
  },
  inViewportHashtags: {}, // { name: true/false }
  isMuted: false,
  videos: {},
  navigation: [],
  placeholders: [],
  error: null,
  loadingVideos: false,
  loadingVideo: false,
  discoverVideos: [],
  discoverVideosLoading: false,
  discoverVideosIDs: [],
  cursor: {
    type: undefined,
    index: undefined,
    last: {}
  },
  hashtags: [],
  hashtagsLoading: false,
  hashtagNames: [],
  hashtagVideos: {
    // [hashtag_name]: {
    //    loading: false,
    //    videos: [],
    //    videosIDs: []
    // }
  },
  watchedVideos: [],
  ...commonInitialState
}

let middlewares = []
if (process.env.DEVELOPMENT) {
  const { connect } = require('redux-zero/devtools')
  middlewares = connect ? applyMiddleware(connect(initialState)) : []
}

const videoUrlParams = (state, action) => {
  const { appContext, videoId } = action
  const { variant, tag } = appContext
  const { discoverVideos, discoverVideosIDs, hashtagVideos } = state

  let video = null
  switch (appContext.appContextType) {
    case DISCOVER_CONTEXT_TYPE:
      {
        const idx = discoverVideosIDs.indexOf(videoId)
        // check if we have the requested video locally
        if (idx >= 0) {
          video = discoverVideos[idx]
        }
      }
      break
    case HASHTAG_CONTEXT_TYPE:
      {
        if (hashtagVideos[tag]) {
          const idx = hashtagVideos[tag].videosIDs.indexOf(videoId)
          // check if we have the requested video locally
          if (idx >= 0) {
            video = hashtagVideos[tag].videos[idx]
          }
        }
      }
      break
  }
  return [
    `/embed/videos/${videoId}`,
    {
      variant
    },
    video
  ]
}

const _getHashtagVideos = async (hashtagName, page) => {
  const { params, hashtagVideos } = store.getState()
  let url = ''
  let query = {}

  if (page) {
    url = hashtagVideos[hashtagName]?.paging?.next
    store.setState({
      hashtagVideos: {
        ...hashtagVideos,
        [hashtagName]: {
          ...hashtagVideos[hashtagName],
          loading: true
        }
      }
    })
  } else {
    url = `/api/hashtags/${hashtagName}/videos`
    query = {
      page_size: 20
    }
    store.setState({
      hashtagVideos: {
        ...hashtagVideos,
        [hashtagName]: {
          videos: [],
          videosIDs: [],
          loading: true,
          paging: null
        }
      }
    })
  }

  if (!url) {
    // if no url, quit
    store.setState({
      hashtagVideos: {
        ...hashtagVideos,
        [hashtagName]: {
          ...hashtagVideos[hashtagName],
          loading: false
        }
      }
    })
    return
  }

  try {
    const response = await fetcher({
      params,
      url,
      query
    })

    if (!response.ok) {
      store.setState({
        hashtagVideos: {
          ...hashtagVideos,
          [hashtagName]: {
            ...hashtagVideos[hashtagName],
            loading: false
          }
        }
      })
      throw response
    }

    const { videos, paging } = await response.json()

    const newVideos = page
      ? uniqBy(
          [...hashtagVideos[hashtagName].videos, ...videos],
          (v) => v.encoded_id
        )
      : videos

    store.setState({
      hashtagVideos: {
        ...hashtagVideos,
        [hashtagName]: {
          videos: newVideos,
          videosIDs: newVideos.map((v) => v.encoded_id),
          loading: false,
          paging: paging
        }
      }
    })
  } catch (error) {
    store.setState({
      hashtagVideos: {
        ...hashtagVideos,
        [hashtagName]: {
          ...hashtagVideos[hashtagName],
          loading: false
        }
      }
    })
  }
}

const _getDiscoverVideos = async (page) => {
  const { discoverVideos, params } = store.getState()
  let excludeIds = []

  if (page) {
    excludeIds = discoverVideos.map((v) => v.encoded_id)
    store.setState({ discoverVideosLoading: true })
  } else {
    store.setState({
      discoverVideos: [],
      discoverVideosIDs: [],
      discoverVideosLoading: true
    })
  }

  try {
    const response = await fetcher({
      params,
      url: '/api/suggested_videos',
      query: {
        exclude_ids: excludeIds
      }
    })

    if (!response.ok) {
      store.setState({
        discoverVideosLoading: false
      })
      throw response
    }

    const { videos } = await response.json()
    const newVideos = page
      ? uniqBy([...discoverVideos, ...videos], (v) => v.encoded_id)
      : videos

    store.setState({
      discoverVideosLoading: false,
      discoverVideos: newVideos,
      discoverVideosIDs: newVideos.map((v) => v.encoded_id)
    })
  } catch (error) {
    store.setState({
      discoverVideosLoading: false
    })
  }
}

const _fillWithExistingList = async (state, action) => {
  const { appContext, videoId } = action
  const { discoverVideos, discoverVideosIDs, hashtagVideos } = state

  const MINIMUM_LENGTH_TO_FETCH_MORE = 5
  const MAX_ITEMS = 10
  let videos = []

  // try to fill the recommended videos with either
  // existing discover videos or hashtag videos
  switch (appContext.appContextType) {
    case DISCOVER_CONTEXT_TYPE:
      {
        let _discoverList = discoverVideos
        let _discoverVideosIDs = discoverVideosIDs
        if (discoverVideos.length === 0) {
          // if no discover videos, try to get some
          await _getDiscoverVideos(false)
          _discoverList = store.getState().discoverVideos
          _discoverVideosIDs = store.getState().discoverVideosIDs
        }
        // fill the list with exising discover videos
        const startIdx = _discoverVideosIDs.indexOf(videoId)
        videos = _discoverList.slice(startIdx + 1, startIdx + 1 + MAX_ITEMS)

        // if we are about to exhaust all discover videos, get some more
        if (videos.length < MINIMUM_LENGTH_TO_FETCH_MORE) {
          await _getDiscoverVideos(true)
        }
      }
      break
    case HASHTAG_CONTEXT_TYPE: {
      let _hashtagVideoList = hashtagVideos[appContext.tag]
      if (!_hashtagVideoList) {
        // if no hashtag videos, try to get some
        await _getHashtagVideos(appContext.tag, false)
        _hashtagVideoList = store.getState().hashtagVideos[appContext.tag]
      }
      // fill the list with exising hashtag videos
      const startIdx = _hashtagVideoList.videosIDs.indexOf(videoId)
      videos = _hashtagVideoList.videos.slice(
        startIdx + 1,
        startIdx + 1 + MAX_ITEMS
      )
      // if we are about to exhaust all hashtag videos, get some more
      if (videos.length < MINIMUM_LENGTH_TO_FETCH_MORE) {
        await _getHashtagVideos(appContext.tag, true)
      }
      break
    }
  }
  return videos
}

export const store = createStore(initialState, middlewares)

export const actions = (store, props) => ({
  clearHistory: () => {
    return {
      watchedVideos: []
    }
  },

  pushHistory: (state, action = {}) => {
    const { video } = action
    const { watchedVideos } = state
    if (!video) {
      return
    }
    return {
      watchedVideos: [...watchedVideos, video.encoded_id]
    }
  },

  popHistory: (state) => {
    const { watchedVideos } = state
    if (watchedVideos.length === 0) {
      return
    }
    return {
      watchedVideos: watchedVideos.slice(0, watchedVideos.length - 1)
    }
  },

  resetCursor: () => {
    return {
      cursor: {
        type: undefined,
        index: undefined,
        last: {}
      }
    }
  },

  setCursor: (state, action) => {
    const { type, index } = action
    const { cursor: previous } = state
    return {
      cursor: {
        ...previous,
        type,
        index,
        last: {
          ...previous.last,
          [previous.type]: previous.index
        }
      }
    }
  },

  fetchedParams: (state, action) => ({
    params: action.params
  }),

  fetchVideo: async (state, action) => {
    const { params } = state
    const [url, query, cachedVideo] = videoUrlParams(state, action)

    if (cachedVideo) {
      return {
        video: cachedVideo,
        videos: {
          ...store.getState().videos,
          [cachedVideo.encoded_id]: cachedVideo
        },
        loadingVideo: false
      }
    }
    store.setState({ loadingVideo: true })

    try {
      const response = await fetcher({
        url: url,
        params,
        query: query
      })

      const video = await response.json()

      const { videos: videosPrevious } = store.getState()

      return {
        video,
        videos: {
          ...videosPrevious,
          [video.encoded_id]: video
        },
        loadingVideo: false
      }
    } catch (error) {
      return {
        error,
        loadingVideo: false
      }
    }
  },

  fetchVideos: async (state, action) => {
    const { videoId } = action
    const { error, loadingVideos, placeholders, params } = state
    const { per_page } = params

    if (loadingVideos || error) {
      return
    }

    store.setState({
      loadingVideos: true,
      placeholders: [...placeholders, ...new Array(per_page)]
    })

    try {
      const videos = await _fillWithExistingList(state, action)

      const {
        navigation: navigationPrevious,
        video: videoPrevious,
        videos: videosPrevious
      } = store.getState()

      return {
        navigation: [
          ...new Set([
            ...navigationPrevious,
            ...videos.map((video) => video.encoded_id)
          ])
        ],
        placeholders: [],
        video:
          videos.find((item) => item.encoded_id === videoId) || videoPrevious,
        videos: {
          ...videosPrevious,
          ...videos.reduce((obj, item) => {
            obj[item.encoded_id] = item
            return obj
          }, {})
        },
        videosSeen: [],
        loadingVideos: false
      }
    } catch (error) {
      return {
        error,
        loadingVideos: false
      }
    }
  },

  clearVideos: (state) => ({
    navigation: [],
    placeholders: [...new Array(state.params.per_page)]
  }),

  clearCache: () => ({
    videos: {},
    hashtagVideos: {}
  }),

  fetchDiscoverVideos: async (state, action = {}) => {
    const { page } = action
    await _getDiscoverVideos(page)
  },

  fetchHashtags: async (state) => {
    const { params } = state

    store.setState({
      hashtags: [],
      hashtagsLoading: true,
      hashtagNames: []
    })

    try {
      const response = await fetcher({
        params,
        url: '/api/hashtags',
        query: {
          page_size: 20
        }
      })

      if (!response.ok) {
        throw response
      }

      const { hashtags } = await response.json()

      return {
        hashtagsLoading: false,
        hashtags,
        hashtagNames: hashtags.map((hashtag) => hashtag.name)
      }
    } catch (error) {
      return {
        hastagsLoading: false
      }
    }
  },

  generateHashtagCover: async (state, action = {}) => {
    const { params } = state
    const { hashtag } = action
    if (!hashtag || hashtag.cover_video_thumbnail_url) {
      return
    }
    try {
      // calling this will generate hashtag cover video thumbnail on server
      const response = await fetcher({
        params,
        url: hashtag.url
      })

      if (!response.ok) {
        throw response
      }
      return
    } catch (error) {
      return
    }
  },

  fetchHashtagVideos: async (state, action = {}) => {
    const { hashtagName, onFirstVideo } = action

    try {
      await _getHashtagVideos(hashtagName, false)
      if (onFirstVideo) {
        const { hashtagVideos } = store.getState()
        const video = hashtagVideos[hashtagName].videos[0]
        onFirstVideo(video)
      }
    } catch (e) {}
  },

  registerHashtagInViewport: (state, action) => {
    const {
      hashtag: { name }
    } = action
    const { inViewportHashtags } = state

    // There might be a IntersectionObserver bug in UC Browser (More than 16% of India users)
    // where isIntersecting is always undefined
    // Solution might be to check float intersectionRatio instead of boolean isIntersecting

    if (!inViewportHashtags[name]) {
      return {
        inViewportHashtags: {
          ...inViewportHashtags,
          [name]: true
        }
      }
    }
  },

  unregisterHashtagInViewport: (state, action) => {
    const {
      hashtag: { name }
    } = action
    const { inViewportHashtags } = state

    if (inViewportHashtags[name]) {
      const newState = {
        ...inViewportHashtags
      }
      delete newState[name]
      return {
        inViewportHashtags: newState
      }
    }
  },

  ...commonActions(store, props)
})

export const dispatch = bindActions(actions, store)
