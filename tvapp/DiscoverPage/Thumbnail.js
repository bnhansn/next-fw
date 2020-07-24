import React, { useEffect, useRef, useState } from 'react'
import { Box } from 'fwego'
import { css } from 'emotion'
import { attachIntersectionObserver } from '../hooks'

export default (props) => {
  const { dispatch, video, height, width } = props
  const [, setIsInViewport] = useState(false)
  const thumbnailRef = useRef(null)

  useEffect(() => {
    if (!thumbnailRef.current) {
      return
    }
    const observer = attachIntersectionObserver(
      (entries) => {
        const entry = entries[0]
        let isVisible = false
        if (typeof entry.isVisible !== 'undefined') {
          // Chrome
          isVisible = entry.isVisible
        } else {
          // Safari
          isVisible = entry.intersectionRatio >= 0.5
        }

        setIsInViewport((currentInViewportValue) => {
          if (isVisible) {
            if (!currentInViewportValue) {
              dispatch.registerInViewport({ video })
            }
          } else if (currentInViewportValue) {
            dispatch.unregisterInViewport({ video })
          }
          return isVisible
        })
      },
      thumbnailRef.current,
      {
        root: null,
        threshold: [0.5],
        trackVisibility: true,
        delay: 100
      }
    )
    return () => {
      if (observer) {
        observer.disconnect()
      }
    }
  }, [])

  return (
    <Box
      cursor="pointer"
      height={height}
      position="relative"
      ref={thumbnailRef}
      width={width}
    >
      <div
        className={css`
          position: absolute;
          top: 0px;
          left: 0px;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            -90deg,
            rgb(238, 238, 238),
            rgb(204, 204, 204)
          );
          border-radius: 12px;
          overflow: hidden;
        `}
      >
        <Box
          backgroundPosition="center center"
          backgroundSize="cover"
          height="100%"
          width="100%"
          className={css`
            background-image: ${video && video.thumbnail_url
              ? `url('${video.thumbnail_url}')`
              : 'none'};
            &:hover,
            &:focus {
              filter: contrast(115%);
            }
          `}
        />
      </div>
    </Box>
  )
}
