import { useMemo, useEffect, useReducer } from 'react'
import throttle from 'lodash/throttle'
import { trackerFactory } from '../../utils/vastTracker'
import { stringify } from '../../utils/qs'
import { appContextToTrackingData } from '../helpers'

/**
 *  NOTE:
 *
 *  - When starting video programatically (autoplay) order of events is like:
 *    - VIDEO_RESET
 *    - VIDEO_PLAY
 *    - VIDEO_LOADEDDATA
 *    - VIDEO_AUTOPLAY_SUCCESS (custom)
 *    - VIDEO_TIMEUPDATE
 *    - VIDEO_TIMEUPDATE
 *    - ...
 *
 *  - When looping programatically order of events follows:
 *    - ...
 *    - VIDEO_TIMEUPDATE
 *    - VIDEO_TIMEUPDATE
 *    - VIDEO_PAUSE
 *    - VIDEO_ENDED
 *    - VIDEO_SEEKING
 *    - VIDEO_PLAY
 *    - VIDEO_TIMEUPDATE
 *    - VIDEO_SEEKED
 *    - VIDEO_TIMEUPDATE
 *    - VIDEO_TIMEUPDATE
 *    - ...
 *
 *  - When looping naturally (video.loop) order of events:
 *    - ...
 *    - VIDEO_TIMEUPDATE
 *    - VIDEO_TIMEUPDATE
 *    - VIDEO_SEEKING (currentTime: 0)
 *    - VIDEO_TIMEUPDATE (currentTime: 0)
 *    - VIDEO_SEEKED (currentTime: 0)
 *    - VIDEO_TIMEUPDATE
 *    - VIDEO_TIMEUPDATE
 *    - ...
 */

const reducer = (state, action) => {
  const { type } = action

  const pixel = (...args) => {
    const { trackers, loopCount } = state
    if (loopCount === 0) {
      trackers.forEach((tracker) => tracker(...args))
    }
  }

  switch (type) {
    case 'SET_TRACKER': {
      const { tracker } = action

      return {
        ...state,
        trackers: [...state.trackers, tracker]
      }
    }

    case 'VIDEO_AUTOPLAY_SUCCESS': {
      return {
        ...state,
        isPreventedAutoplay: false
      }
    }

    case 'VIDEO_AUTOPLAY_FAIL': {
      return {
        ...state,
        isPaused: true,
        isPreventedAutoplay: true
      }
    }

    case 'VIDEO_RESET': {
      return {
        ...state,
        videoId: action.videoId,
        video: action.video,
        isAbleToPlay: undefined,
        isLoaded: undefined
      }
    }

    case 'VIDEO_LOADEDDATA': {
      const {
        actions: { resetEngagement, resetPlaySegment }
      } = state
      const { duration } = event.target
      resetPlaySegment()
      resetEngagement()
      pixel('trackImpression')
      pixel('setDuration', duration)
      return {
        ...state,
        isLoaded: true,
        loopCount: 0,
        playUid: new Date().valueOf().toString()
      }
    }

    case 'VIDEO_PLAY': {
      const {
        isAbleToPlay,
        isPaused,
        actions: { trackVideoStarted }
      } = state
      const { video } = action
      if (!isAbleToPlay) {
        // First play event
        trackVideoStarted({ video })
        // pixel('start') // NOTE: No need to emit start, will be emmited with first setProgress
      }
      if (isPaused) {
        pixel('setPaused', false)
      }
      return {
        ...state,
        isAbleToPlay: true, // In case of prevented autoplay, onpause event needs to know if video was playing before
        isPaused: false
      }
    }

    case 'VIDEO_TIMEUPDATE': {
      const {
        publisherClientId,
        isLoaded,
        isMuted,
        loopCount,
        playUid,
        variant,
        trackPlaySegment_throttled,
        actions: { updateEngagement }
      } = state
      const { event, video } = action
      const { currentTime, duration, seeking, volume } = event.target
      if (!seeking && isLoaded) {
        // The time indicated by the element's currentTime attribute has changed.
        // Note: target.duration might change when going from loop 0 -> 1
        trackPlaySegment_throttled({
          publisherClientId,
          duration,
          endTime: currentTime,
          isMuted,
          loopCount,
          playUid,
          state: 'playing',
          variant,
          video,
          volume
        })
        updateEngagement({
          duration,
          loopCount,
          secondsWatched: currentTime,
          variant,
          video
        })
        pixel('setProgress', currentTime)
      }
      return state
    }

    case 'VIDEO_SEEKING': {
      const {
        event: {
          target: { currentTime }
        }
      } = action
      return {
        ...state,
        seeking: {
          ...state.seeking,
          currentTime
        }
      }
    }

    case 'VIDEO_SEEKED': {
      const {
        loopCount,
        seeking: { currentTime: lastSeekingCurrentTime },
        actions: { resetPlaySegment }
      } = state
      const {
        event: {
          target: { currentTime, seeking }
        }
      } = action

      if (!seeking) {
        // Reset the end_time for next timeupdate iteration
        resetPlaySegment({
          endTime: currentTime
        })
      }

      if (!seeking && lastSeekingCurrentTime <= 0.01 && currentTime <= 0.01) {
        // Zero is never a true zero!
        pixel('complete')

        return {
          ...state,
          loopCount: loopCount + 1
        }
      }
      return state
    }

    case 'VIDEO_PAUSE': {
      const {
        publisherClientId,
        isAbleToPlay,
        isMuted,
        loopCount,
        playUid,
        variant,
        actions: { trackPlaySegment }
      } = state
      const { event, video } = action
      const { currentTime, duration, volume } = event.target
      if (isAbleToPlay) {
        // Autoplay block (safari) will trigger pause event at the begging
        trackPlaySegment({
          publisherClientId,
          duration,
          endTime: currentTime,
          isMuted,
          loopCount,
          playUid,
          state: 'paused',
          variant,
          video,
          volume
        })
        pixel('setPaused', true)
      }
      return {
        ...state,
        isPaused: true
      }
    }

    case 'VIDEO_ENDED': {
      const {
        actions: { resetPlaySegment }
      } = state
      resetPlaySegment()
      pixel('complete')
      return state
    }

    case 'VIDEO_VOLUMECHANGE': {
      pixel('setMuted', action.event.target.muted)
      return state
    }

    case 'USER_PAUSED': {
      return {
        ...state,
        isUserPaused: true
      }
    }

    case 'USER_UNPAUSED': {
      return {
        ...state,
        isUserPaused: false
      }
    }

    case 'USER_ADCLICK':
    case 'USER_CTACLICK': {
      const { event, video } = action
      const {
        detail: { video: eventVideo }
      } = event

      if (video.encoded_id === eventVideo.encoded_id) {
        pixel('click')
      }
      return state
    }

    case 'USER_ADSKIP': {
      const { event, video } = action
      const {
        detail: { video: eventVideo }
      } = event

      if (video.encoded_id === eventVideo.encoded_id) {
        pixel('skip')
      }
      return state
    }

    case 'VISIBILITY_CHANGED': {
      const {
        isUserPaused,
        loopCount,
        videoId,
        actions: { trackEngagement }
      } = state
      const { event, videoRef } = action

      if (event.target.hidden) {
        trackEngagement({
          completed: loopCount > 0,
          videoId
        })
        if (!isUserPaused) {
          // Pause video when window/tab goes to background
          videoRef.current.pause()
        }
      } else {
        if (!isUserPaused) {
          videoRef.current.play()
        }
      }
      return state
    }

    case 'VIDEO_TRACK_ENGAGEMENT': {
      const {
        loopCount,
        videoId,
        actions: { trackEngagement }
      } = state
      trackEngagement({
        completed: loopCount > 0,
        videoId
      })
      return state
    }

    case 'WINDOW_UNLOAD': {
      const {
        loopCount,
        videoId,
        actions: { trackEngagement }
      } = state

      trackEngagement({
        completed: loopCount > 0,
        videoId
      })
      pixel('close')
      return state
    }
  }

  return state
}

export default (videoRef, props, options) => {
  const {
    appContext,
    publisherClientId,
    videoId,
    video,
    variant,
    isMuted,
    params,
    actions
  } = props
  const { disableAutoplay } = options || {}

  const trackPlaySegment_throttled = useMemo(
    () => throttle(actions.trackPlaySegment, 1000),
    []
  )

  if (!('videoId' in props)) {
    throw new Error(
      `useVideoTracking hook is missing videoId. Got ${videoId} instead.`
    )
  }

  if (!('video' in props)) {
    throw new Error(
      `useVideoTracking hook is missing video. Got ${video} instead.`
    )
  }

  const [state, dispatch] = useReducer(reducer, {
    isAbleToPlay: undefined,
    isLoaded: false,
    isMuted,
    isPreventedAutoplay: undefined,
    isPaused: false,
    isUserPaused: false,
    loopCount: 0,
    playUid: new Date().valueOf().toString(),
    trackers: [],
    seeking: {},
    //
    publisherClientId,
    variant,
    video,
    videoId,
    trackPlaySegment_throttled,
    params,
    actions
  })

  useEffect(() => {
    // Reset what needs to be reset
    dispatch({ type: 'VIDEO_RESET', videoId, video })
    return () => {
      // Track engagement when unmounting current video
      dispatch({ type: 'VIDEO_TRACK_ENGAGEMENT' })
    }
  }, [videoId])

  useEffect(() => {
    /**
     * Autoplay resolver
     */
    if (!disableAutoplay && videoRef.current) {
      const promise = videoRef.current.play()
      if (promise !== undefined) {
        promise
          .then(() => {
            dispatch({ type: 'VIDEO_AUTOPLAY_SUCCESS' })
          })
          .catch((error) => {
            dispatch({ type: 'VIDEO_AUTOPLAY_FAIL' })
          })
      } else {
        dispatch({ type: 'VIDEO_AUTOPLAY_FAIL' })
      }
    }
  }, [video])

  useEffect(() => {
    /**
     * Play/Pause bindings
     */
    if (videoRef.current) {
      // videoRef.current.onabort = event => {} //	Sent when playback is aborted; for example, if the media is playing and is restarted from the beginning, this event is sent.
      // videoRef.current.oncanplay = event => {} //	Sent when enough data is available that the media can be played, at least for a couple of frames.  This corresponds to the HAVE_FUTURE_DATA readyState.
      // videoRef.current.oncanplaythrough = event => {} //	Sent when the readyState changes to HAVE_ENOUGH_DATA, indicating that the entire media can be played without interruption, assuming the download rate remains at least at the current level. It will also be fired when playback is toggled between paused and playing. Note: Manually setting the currentTime will eventually fire a canplaythrough event in firefox. Other browsers might not fire this event.
      // videoRef.current.ondurationchange = event => {} //	The metadata has loaded or changed, indicating a change in duration of the media.  This is sent, for example, when the media has loaded enough that the duration is known.
      // videoRef.current.onemptied = event => {} //	The media has become empty; for example, this event is sent if the media has already been loaded (or partially loaded), and the load() method is called to reload it.
      // videoRef.current.onencrypted = event => {} // 	The user agent has encountered initialization data in the media data.
      // videoRef.current.onended = event => {} //	Sent when playback completes.
      // videoRef.current.onerror = event => {} //	Sent when an error occurs.  The element's error attribute contains more information. See HTMLMediaElement.error for details.
      // videoRef.current.oninterruptbegin = event => {} //	Sent when audio playing on a Firefox OS device is interrupted, either because the app playing the audio is sent to the background, or audio in a higher priority audio channel begins to play. See Using the AudioChannels API for more details.
      // videoRef.current.oninterruptend = event => {} //	Sent when previously interrupted audio on a Firefox OS device commences playing again — when the interruption ends. This is when the associated app comes back to the foreground, or when the higher priority audio finished playing. See Using the AudioChannels API for more details.
      // videoRef.current.onloadeddata = event => {} //	The first frame of the media has finished loading.
      // videoRef.current.onloadedmetadata = event => {} //	The media's metadata has finished loading; all attributes now contain as much useful information as they're going to.
      // videoRef.current.onloadstart = event => {} //	Sent when loading of the media begins.
      // videoRef.current.onmozaudioavailable = event => {} //	Sent when an audio buffer is provided to the audio layer for processing; the buffer contains raw audio samples that may or may not already have been played by the time you receive the event.
      // videoRef.current.onpause = event => {} //	Sent when the playback state is changed to paused (paused property is true).
      // videoRef.current.onplay = event => {} //	Sent when the playback state is no longer paused, as a result of the play method, or the autoplay attribute.
      // videoRef.current.onplaying = event => {} //	Sent when the media has enough data to start playing, after the play event, but also when recovering from being stalled, when looping media restarts, and after seeked, if it was playing before seeking.
      // videoRef.current.onprogress = event => {} //	Sent periodically to inform interested parties of progress downloading the media. Information about the current amount of the media that has been downloaded is available in the media element's buffered attribute.
      // videoRef.current.onratechange = event => {} //	Sent when the playback speed changes.
      // videoRef.current.onseeked = event => {} //	Sent when a seek operation completes.
      // videoRef.current.onseeking = event => {} //	Sent when a seek operation begins.
      // videoRef.current.onstalled = event => {} //	Sent when the user agent is trying to fetch media data, but data is unexpectedly not forthcoming.
      // videoRef.current.onsuspend = event => {} //	Sent when loading of the media is suspended; this may happen either because the download has completed or because it has been paused for any other reason.
      // videoRef.current.ontimeupdate = event => {} //	The time indicated by the element's currentTime attribute has changed.
      // videoRef.current.onvolumechange = event => {} //	Sent when the audio volume changes (both when the volume is set and when the muted attribute is changed).
      // videoRef.current.onwaiting = event => {} //	Sent when the requested operation (such as playback) is delayed pending the completion of another operation (such as a seek).

      const onLoadedData = (event) =>
        dispatch({ type: 'VIDEO_LOADEDDATA', event, video })
      videoRef.current.addEventListener('loadeddata', onLoadedData)

      const onPlay = (event) => dispatch({ type: 'VIDEO_PLAY', event, video })
      videoRef.current.addEventListener('play', onPlay)

      const onTimeUpdate = (event) =>
        dispatch({ type: 'VIDEO_TIMEUPDATE', event, video })
      videoRef.current.addEventListener('timeupdate', onTimeUpdate)

      const onSeeking = (event) =>
        dispatch({ type: 'VIDEO_SEEKING', event, video })
      videoRef.current.addEventListener('seeking', onSeeking)

      const onSeeked = (event) =>
        dispatch({ type: 'VIDEO_SEEKED', event, video })
      videoRef.current.addEventListener('seeked', onSeeked)

      const onEnded = (event) => dispatch({ type: 'VIDEO_ENDED', event, video })

      videoRef.current.addEventListener('ended', onEnded)

      const onVolumeChange = (event) =>
        dispatch({ type: 'VIDEO_VOLUMECHANGE', event, video })
      videoRef.current.addEventListener('volumechange', onVolumeChange)

      const onPause = (event) => dispatch({ type: 'VIDEO_PAUSE', event, video })
      videoRef.current.addEventListener('pause', onPause)

      const onUserPause = (event) =>
        dispatch({ type: 'USER_PAUSED', event, video })
      videoRef.current.addEventListener('userpause', onUserPause)

      const onUserUnpause = (event) =>
        dispatch({ type: 'USER_UNPAUSED', event, video })
      videoRef.current.addEventListener('userunpause', onUserUnpause)

      const onUserCTAClick = (event) =>
        dispatch({ type: 'USER_CTACLICK', event, video })
      document.addEventListener('userctaclick', onUserCTAClick)

      const onUserAdClick = (event) =>
        dispatch({ type: 'USER_ADCLICK', event, video })
      document.addEventListener('useradclick', onUserAdClick)

      const onUserAdSkip = (event) =>
        dispatch({ type: 'USER_ADSKIP', event, video })
      document.addEventListener('useradskip', onUserAdSkip)

      const onTrackEngagement = (event) =>
        dispatch({ type: 'VIDEO_TRACK_ENGAGEMENT', event })
      videoRef.current.addEventListener('trackengagement', onTrackEngagement)

      const onVisibilityChange = (event) =>
        dispatch({ type: 'VISIBILITY_CHANGED', event, video, videoRef })
      document.addEventListener('visibilitychange', onVisibilityChange)

      const onBeforeUnload = (event) => {
        dispatch({ type: 'WINDOW_UNLOAD', event })
      }
      window.addEventListener('beforeunload', onBeforeUnload)

      return () => {
        videoRef.current.removeEventListener('loadeddata', onLoadedData)
        videoRef.current.removeEventListener('play', onPlay)
        videoRef.current.removeEventListener('timeupdate', onTimeUpdate)
        videoRef.current.removeEventListener('seeking', onSeeking)
        videoRef.current.removeEventListener('seeked', onSeeked)
        videoRef.current.removeEventListener('ended', onEnded)
        videoRef.current.removeEventListener('volumechange', onVolumeChange)
        videoRef.current.removeEventListener('pause', onPause)
        videoRef.current.removeEventListener('userpause', onUserPause)
        videoRef.current.removeEventListener('userunpause', onUserUnpause)
        document.removeEventListener('userctaclick', onUserCTAClick)
        document.removeEventListener('useradclick', onUserAdClick)
        document.removeEventListener('useradskip', onUserAdSkip)
        videoRef.current.removeEventListener(
          'trackengagement',
          onTrackEngagement
        )
        document.removeEventListener('visibilitychange', onVisibilityChange)
        window.removeEventListener('beforeunload', onBeforeUnload)
      }
    }
  }, [video])

  useEffect(() => {
    if (video && video.encoded_id && video.vast_tag) {
      dispatch({
        type: 'SET_TRACKER',
        tracker: trackerFactory(video.vast_tag)
      })
    }
  }, [video && video.encoded_id && video.vast_tag])

  useEffect(() => {
    if (video && video.encoded_id) {
      const trackingData = appContext
        ? appContextToTrackingData({ appContext })
        : {}
      const querystring = stringify({
        ...trackingData,
        autoplay: !!params.autoplay,
        format: 'vast',
        variant: variant
      })

      const path = `/api/videos/${video.encoded_id}/pixels`

      dispatch({
        type: 'SET_TRACKER',
        tracker: trackerFactory(`${params.api_host}${path}?${querystring}`)
      })
    }
  }, [video && video.encoded_id])

  // Return hook state
  return state
}
