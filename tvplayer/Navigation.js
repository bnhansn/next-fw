import React, { useState, useRef, useEffect, useCallback } from 'react'
import Mousetrap from 'mousetrap'
import I18n from 'i18nline'
import throttle from 'lodash/throttle'
import { Box } from 'fwego'
import NavigationThumbnail from './NavigationThumbnail'
import VideoInfo from './VideoInfo'
import NavButton from './NavButton'
import Backdrop from './Backdrop'

const LEFT = 'left'
const RIGHT = 'right'

export default (props) => {
  const {
    actions,
    appContext,
    hasNavButtons,
    isMuted,
    onNextVideo,
    onPrevVideo,
    onVideoLinkClick,
    params,
    publisherClientId,
    video,
    videosList,
    videoNext,
    watchedVideos
  } = props

  const processThumbnailImpressionQueue_throttledRef = useRef(
    throttle(actions.processThumbnailImpressionQueue, 1000, {
      leading: false
    })
  )
  const listRef = useRef(null)
  const [, setListDimensions] = useState({ width: 0, heigh: 0 })
  const [{ showLeftNav, showRightNav }, setNav] = useState({
    showLeftNav: hasNavButtons,
    showRightNav: hasNavButtons
  })
  const [videoEnded, setVideoEnded] = useState(false)

  const infoPanelRef = useRef(null)
  const [infoPanelDimensions, setInfoPanelDimensions] = useState({
    display: 'none',
    height: 0,
    left: 0,
    top: 0,
    width: 0
  })

  const onScroll = useCallback(
    (direction) => {
      switch (direction) {
        case LEFT:
          if (watchedVideos && watchedVideos.length > 0) {
            onPrevVideo()
          }
          break
        case RIGHT:
          if (videosList && videosList.length > 0) {
            onNextVideo(videosList[0])
          }
          break
      }
    },
    [videosList, watchedVideos, onPrevVideo, onNextVideo]
  )

  const onVideoEnd = useCallback((event) => {
    event.preventDefault()
    setVideoEnded(true)
  }, [])

  useEffect(() => {
    if (videoEnded) {
      onScroll(RIGHT)
    }
  }, [videoEnded, onScroll])

  useEffect(() => {
    setVideoEnded(false)
  }, [video])

  useEffect(() => {
    if (videoNext) {
      const goNext = () => {
        onScroll(RIGHT)
      }
      Mousetrap.bind(['right'], goNext)

      return () => {
        Mousetrap.unbind(['right'])
      }
    }
  }, [videoNext, onScroll])

  useEffect(() => {
    if (showLeftNav) {
      const goPrev = () => {
        onScroll(LEFT)
      }
      Mousetrap.bind(['left'], goPrev)

      return () => {
        Mousetrap.unbind(['left'])
      }
    }
  }, [videoNext, showLeftNav, onScroll])

  useEffect(() => {
    let trigger
    if (listRef.current) {
      const updateListDimensions = () => {
        setListDimensions({
          width: listRef.current.offsetWidth,
          height: listRef.current.offsetHeight
        })
      }
      trigger = throttle(updateListDimensions, 250)
      trigger()
      window.addEventListener('resize', trigger)
    }

    return () => {
      trigger && window.removeEventListener('resize', trigger)
    }
  }, [listRef])

  useEffect(() => {
    setNav({
      showLeftNav: hasNavButtons && watchedVideos && watchedVideos.length > 0,
      showRightNav: hasNavButtons && videosList && videosList.length > 0
    })
  }, [hasNavButtons, watchedVideos, videosList])

  const onThumbnailClicked = (video, index) => (event) => {
    if (index !== 0) {
      onVideoLinkClick({ video })(event)
    }
  }

  const onAnimationEnded = (autoPlayThumbnailElmPos) => {
    const panel = {
      display: 'block',
      height: autoPlayThumbnailElmPos.offsetHeight,
      left:
        autoPlayThumbnailElmPos.offsetLeft +
        autoPlayThumbnailElmPos.offsetWidth,
      top: autoPlayThumbnailElmPos.offsetTop,
      width: autoPlayThumbnailElmPos.offsetWidth * 0.5
    }
    setInfoPanelDimensions(panel)
  }

  const renderThumbnail = (video, index, layers) => (
    <div key={video.encoded_id}>
      <Backdrop
        type={index === 0 ? 'full' : index > 0 ? 'right' : 'left'}
        zIndex={layers - Math.abs(index)}
      />
      <NavigationThumbnail
        actions={{
          ...actions,
          processThumbnailImpressionQueue_throttled:
            processThumbnailImpressionQueue_throttledRef.current
        }}
        appContext={appContext}
        containerWidth={listRef.current ? listRef.current.offsetWidth : 0}
        index={index}
        isMuted={isMuted}
        onAnimationEnded={onAnimationEnded}
        onClick={onThumbnailClicked(video, index)}
        onVideoEnd={onVideoEnd}
        params={params}
        publisherClientId={publisherClientId}
        video={video}
        zIndex={layers - Math.abs(index)}
      />
    </div>
  )

  const layers =
    (video ? 1 : 0) +
    Math.max(
      watchedVideos ? watchedVideos.length : 0,
      videosList ? videosList.length : 0
    )

  return (
    <Box height="100%" position="relative" m="auto" width="100%">
      <Box
        height="100%"
        m="none"
        overflow="hidden"
        p="none"
        position="relative"
        ref={listRef}
        width="100%"
      >
        {watchedVideos?.map((video, index) =>
          renderThumbnail(video, -(watchedVideos.length - index), layers)
        )}
        {video && renderThumbnail(video, 0, layers)}
        {videosList?.map((video, index) =>
          renderThumbnail(video, index + 1, layers)
        )}
        <Box
          bg="transparent"
          position="absolute"
          ref={infoPanelRef}
          zIndex="500"
          {...infoPanelDimensions}
        >
          <VideoInfo shareURL={''} video={video} />
        </Box>
      </Box>
      {showLeftNav && (
        <NavButton
          backgroundImage="url('/images/embed/tvPrev.svg')"
          left="0"
          onClick={() => onScroll(LEFT)}
          title={I18n.t('Previous')}
        />
      )}
      {showRightNav && videoNext && (
        <NavButton
          backgroundImage="url('/images/embed/tvNext.svg')"
          onClick={() => onScroll(RIGHT)}
          right="0"
          title={I18n.t('Next')}
        />
      )}
    </Box>
  )
}
