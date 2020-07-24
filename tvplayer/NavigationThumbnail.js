import React, { useEffect, useRef, useState } from 'react'
import { Box } from 'fwego'
import { css, cx } from 'emotion'
import debounce from 'lodash/debounce'
import Autoplay from './Autoplay'

export const VERTICAL = 'vertical'
export const HORIZONTAL = 'horizontal'

const MAX_CAROUSEL_ITEMS = 9 // should be odd number

const CarouselView = {
  maxItems: MAX_CAROUSEL_ITEMS,
  maxItemsOnSide: function () {
    return (this.maxItems - 1) / 2
  },
  isVisible: function (idx) {
    return idx === 0 || this.isVisibleOnLeft(idx) || this.isVisibleOnRight(idx)
  },
  isVisibleOnRight: function (idx) {
    const rightMostVisibleIdx = this.maxItemsOnSide()
    return idx > 0 && idx <= rightMostVisibleIdx
  },
  isVisibleOnLeft: function (idx) {
    const leftMostVidibleIdx = -this.maxItemsOnSide()
    return leftMostVidibleIdx <= idx && idx < 0
  }
}

const LEFT_TRANSITION_TIME = '0.5s'
const TRANSFORM_TRANSITION_TIME = '0.2s'

const getItemStyle = ({
  containerWidth,
  index,
  isLandscape,
  thumbnailWidth,
  zIndex
}) => {
  // center our thumbnail - this is where all thumbnails start
  let left = (containerWidth - thumbnailWidth) / 2
  let scale = 1

  if (index === 0) {
    if (isLandscape) {
      return {
        style: {
          bg: 'rgba(255, 255, 255, 0.25)',
          left,
          zIndex
        },
        className: css`
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          transform: scale(1);
          transition: left ${LEFT_TRANSITION_TIME}, transform 0.2s;
        `
      }
    }
    return {
      style: {
        left,
        zIndex
      },
      className: css`
        transform: scale(1);
        transition: left ${LEFT_TRANSITION_TIME}, transform 0.2s;
      `
    }
  } else if (
    CarouselView.isVisibleOnRight(index) ||
    CarouselView.isVisibleOnLeft(index)
  ) {
    // move to right or left progressively
    for (let i = 1; i <= Math.abs(index); i++) {
      const amountToMove = ((1 - 0.1 * i) * thumbnailWidth) / 2
      left += index > 0 ? amountToMove : -amountToMove
    }
    // scale it accordingly
    // 1 is 0.9, 2 is 0.8, 3 is 0.7, ...
    scale = 1 - 0.1 * Math.abs(index)
    return {
      style: {
        left,
        zIndex
      },
      className: css`
        transform: scale(${scale});
        transition: opacity 1s, left ${LEFT_TRANSITION_TIME},
          transform ${TRANSFORM_TRANSITION_TIME};
      `
    }
  } else {
    // hide it if not visible
    return {
      style: {
        left: containerWidth * 0.5
      },
      className: css`
        opacity: 0;
      `
    }
  }
}

export default (props) => {
  const {
    actions,
    appContext,
    containerWidth,
    index,
    isMuted,
    onAnimationEnded,
    onClick,
    onVideoEnd,
    params,
    publisherClientId,
    video,
    zIndex
  } = props

  const videoRef = useRef()
  const impressionTimeout = useRef(null)
  const [thumbnailWidth, setThumbnailWidth] = useState(1)
  const isLandscape = video && video.width > video.height

  useEffect(() => {
    // if index is 0, this is the one currently active.
    // anything on the right of the active one is > 0 and < 0 if on the left
    if (!CarouselView.isVisible(index)) {
      // thumbnail has disappeared from visible range
      actions.unregisterInViewport({ video })
      if (impressionTimeout.current) {
        clearTimeout(impressionTimeout.current)
        impressionTimeout.current = null
      }
    } else if (CarouselView.isVisible(index)) {
      // thumbnail has come into view
      actions.registerInViewport({ video })
      if (!impressionTimeout) {
        // Register thumbnail impression if thumbnail
        // stays in viewport for at least 1s
        impressionTimeout.current = setTimeout(() => {
          actions.registerThumbnailImpression({ video })
          actions.processThumbnailImpressionQueue_throttled()
        }, 1000)
      }
    }
  }, [index, video]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      // unregister these upcoming videos
      if (index > 0 && CarouselView.isVisible(index)) {
        // thumbnail has disappeared from visible range
        actions.unregisterInViewport({ video })
        if (impressionTimeout.current) {
          clearTimeout(impressionTimeout.current)
          impressionTimeout.current = null
        }
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!videoRef.current) {
      return
    }
    const thumbnailWidth = videoRef.current.offsetHeight / 1.65
    const newMaxViewableItems =
      Math.round(containerWidth / thumbnailWidth) * 2 + 1
    CarouselView.maxItems = Math.min(newMaxViewableItems, MAX_CAROUSEL_ITEMS)
    setThumbnailWidth(thumbnailWidth)
  }, [containerWidth])

  useEffect(() => {
    if (videoRef && videoRef.current && index === 0) {
      const elm = videoRef.current
      const onEnded = debounce(() => {
        // cancel listener as this is one time only
        elm.removeEventListener('webkitTransitionEnd', onEnded)
        elm.removeEventListener('transitionend', onEnded)
        elm.removeEventListener('oTransitionEnd', onEnded)
        if (index === 0) {
          const { offsetHeight, offsetLeft, offsetTop, offsetWidth } = elm
          if (offsetHeight > 0) {
            onAnimationEnded({
              offsetHeight,
              offsetLeft,
              offsetTop,
              offsetWidth
            })
          }
        }
      }, 300)
      elm.addEventListener('webkitTransitionEnd', onEnded)
      elm.addEventListener('transitionend', onEnded)
      elm.addEventListener('oTransitionEnd', onEnded)
      return () => {
        elm.removeEventListener('webkitTransitionEnd', onEnded)
        elm.removeEventListener('transitionend', onEnded)
        elm.removeEventListener('oTransitionEnd', onEnded)
      }
    }
  }, [index, thumbnailWidth]) // eslint-disable-line react-hooks/exhaustive-deps

  const itemStyle = getItemStyle({
    containerWidth,
    index,
    isLandscape,
    thumbnailWidth,
    zIndex
  })

  return (
    <Box
      bg="black"
      backgroundImage={
        (!isLandscape || index !== 0) && video.thumbnail_url
          ? `url('${video.thumbnail_url}')`
          : 'none'
      }
      backgroundPosition="center center"
      backgroundSize="100% 100%"
      borderRadius={12}
      boxShadow="rgba(0, 0, 0, 0.3) 0px 0px 30px 39px;"
      cursor="pointer"
      height="100%"
      p="none"
      position="absolute"
      ref={videoRef}
      top="0"
      width={thumbnailWidth}
      zIndex="1"
      className={cx(
        css`
          opacity: 1;
          transform: scale(0);
        `,
        itemStyle.className
      )}
      {...itemStyle.style}
    >
      <Box
        height="100%"
        left="0"
        onClick={onClick}
        overflow="hidden"
        position="absolute"
        top="0"
        width="100%"
      >
        {index === 0 && (
          <Autoplay
            actions={actions}
            hasAutoplay
            isMuted={isMuted}
            appContext={appContext}
            onVideoEnd={onVideoEnd}
            params={params}
            publisherClientId={publisherClientId}
            variant={video.variant}
            video={video}
            videoId={video.encoded_id}
          />
        )}
      </Box>
    </Box>
  )
}
