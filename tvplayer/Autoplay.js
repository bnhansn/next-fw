import React, { useEffect, useRef, useState, memo } from 'react'
import Mousetrap from 'mousetrap'
import { Box, Flex } from 'fwego'
import { useVideoTracking } from '../tvapp/hooks'
import usePrevious from './hooks/usePrevious'
import Timeline from './Timeline'
import VideoControlsPlayPause from './VideoControlsPlayPause'

const customKeys = {
  19: 'vk_pause',
  415: 'vk_play'
}

const memoShouldRerender = (prev, next) =>
  !(prev.hasAutoplay !== next.hasAutoplay || prev.isMuted !== next.isMuted)

export default memo((props) => {
  const {
    appContext,
    videoId,
    video,
    variant,
    isMuted,
    hasAutoplay,
    params,
    actions,
    onVideoEnd,
    publisherClientId
  } = props

  useEffect(() => {
    if (typeof window !== 'undefined') {
      Mousetrap.addKeycodes(customKeys)
    }
  }, [])

  const videoRef = useRef()
  const [isFullscreen, setIsFullscreen] = useState(false)

  const videoPlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.dispatchEvent(new CustomEvent('userunpause', {}))
        videoRef.current.play()
      } else {
        videoRef.current.dispatchEvent(new CustomEvent('userpause', {}))
        videoRef.current.pause()
      }
    }
  }

  const { isPaused } = useVideoTracking(videoRef, {
    appContext,
    publisherClientId,
    videoId,
    video,
    variant,
    isMuted,
    params,
    actions
  })

  const onFullscreenClick = (event) => {
    event.preventDefault()
    if (videoRef.current) {
      const requestFullscreen =
        videoRef.current.requestFullscreen ||
        videoRef.current.webkitRequestFullscreen ||
        videoRef.current.mozRequestFullScreen ||
        videoRef.current.oRequestFullscreen ||
        videoRef.current.msRequestFullscreen

      if (requestFullscreen) {
        videoRef.current.setAttribute('controlslist', 'nodownload')
        videoRef.current.setAttribute('disablePictureInPicture', true)
        requestFullscreen.call(videoRef.current)
      } else if (videoRef.current.webkitEnterFullscreen) {
        videoRef.current.webkitEnterFullscreen()
      }
    }
  }

  useEffect(() => {
    const fullscreen = (event) => {
      onFullscreenClick(event)
    }
    const pause = () => {
      if (videoRef.current) {
        if (!videoRef.current.paused) {
          videoPlayPause()
        }
      }
    }
    const play = () => {
      if (videoRef.current) {
        if (videoRef.current.paused) {
          videoPlayPause()
        }
      }
    }
    Mousetrap.bind(['enter'], fullscreen)
    Mousetrap.bind(['vk_pause'], pause)
    Mousetrap.bind(['vk_play'], play)

    return () => {
      Mousetrap.unbind(['enter'])
      Mousetrap.unbind(['vk_pause'])
      Mousetrap.unbind(['vk_play'])
    }
  }, [])

  useEffect(() => {
    const ref = videoRef.current
    const onChange = () => {
      if (
        document.fullScreenElement ||
        document.webkitIsFullScreen ||
        document.mozFullScreen ||
        document.msFullscreenElement
      ) {
        setIsFullscreen(true)
      } else {
        setIsFullscreen(false)
      }
    }
    const onExit = () => {
      setIsFullscreen(false)
    }
    const onError = () => {
      setIsFullscreen(false)
    }

    if (ref) {
      ref.addEventListener('webkitenterfullscreen', onChange)
      ref.addEventListener('webkitendfullscreen', onExit)
    }
    document.addEventListener('webkitfullscreenchange', onChange)
    document.addEventListener('mozfullscreenchange', onChange)
    document.addEventListener('fullscreenchange', onChange)
    document.addEventListener('fullscreenerror', onError)

    return () => {
      if (ref) {
        ref.removeEventListener('webkitenterfullscreen', onChange)
        ref.removeEventListener('webkitendfullscreen', onExit)
      }
      document.removeEventListener('webkitfullscreenchange', onChange)
      document.removeEventListener('mozfullscreenchange', onChange)
      document.removeEventListener('fullscreenchange', onChange)
      document.removeEventListener('fullscreenerror', onError)
    }
  }, [video])

  useEffect(() => {
    const ref = videoRef.current
    if (ref) {
      ref.addEventListener('ended', onVideoEnd)

      return () => {
        ref.removeEventListener('ended', onVideoEnd)
      }
    }
  }, [video, onVideoEnd])

  const [autoplayPromise, setAutoplayPromise] = useState(null)

  useEffect(() => {
    if (videoRef.current) {
      ;(async () => {
        if (hasAutoplay) {
          try {
            const promise = await videoRef.current.play()
            if (promise) {
              setAutoplayPromise(promise)
            }
          } catch (error) {
            // logInfo('Autoplay', error)
          }
        } else {
          if (autoplayPromise) {
            autoplayPromise.then(() => {
              videoRef.current.pause()
            })
          } else {
            videoRef.current.pause()
          }
        }
      })()
    }
  }, [hasAutoplay, autoplayPromise])

  const hasAutoplayPrevious = usePrevious(hasAutoplay)

  useEffect(() => {
    if (hasAutoplayPrevious && !hasAutoplay) {
      videoRef.current.dispatchEvent(new CustomEvent('trackengagement', {}))
    }
  }, [hasAutoplay, hasAutoplayPrevious])

  if (!hasAutoplay) {
    return null
  }

  const isLandscape = video && video.width > video.height

  return (
    <Box bottom="0" left="0" position="absolute" right="0" top="0">
      <video
        onClick={videoPlayPause}
        src={video.download_url}
        poster={video.thumbnail_url}
        muted={isMuted}
        ref={videoRef}
        style={{
          background: 'transparent',
          borderRadius: 12,
          height: '100%',
          left: 0,
          objectFit: isLandscape || isFullscreen ? 'contain' : 'cover',
          top: 0,
          width: '100%'
        }}
      />
      <Box bottom="0" pl="small" pr="small" position="absolute" width="100%">
        <Timeline videoEl={videoRef.current} />
      </Box>
      {isPaused && (
        <Flex
          alignItems="center"
          bg="rgba(0, 0, 0, 0.5)"
          bottom="0"
          justifyContent="center"
          left="0"
          onClick={videoPlayPause}
          position="absolute"
          right="0"
          top="0"
        >
          <VideoControlsPlayPause isPaused />
        </Flex>
      )}
    </Box>
  )
}, memoShouldRerender)
