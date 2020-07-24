import React, { useEffect, useRef, useState } from 'react'
import { Box, Text } from 'fwego'
import { css } from 'emotion'
import { attachIntersectionObserver } from '../hooks'

export default (props) => {
  const { dispatch, hashtag, height, width } = props
  const [, setIsInViewport] = useState(false)
  const hashtagRef = useRef(null)
  let imageUrl =
    'radial-gradient(circle at 50% 0, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0) 89%)'
  if (hashtag?.cover_video_thumbnail_url) {
    imageUrl = `url(${hashtag?.cover_video_thumbnail_url})`
  }
  useEffect(() => {
    if (!hashtagRef.current) {
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
              dispatch.registerHashtagInViewport({ hashtag })
            }
          } else if (currentInViewportValue) {
            dispatch.unregisterHashtagInViewport({ hashtag })
          }
          return isVisible
        })
      },
      hashtagRef.current,
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
      backgroundImage={imageUrl}
      backgroundPosition="center center"
      backgroundSize="cover"
      borderRadius="12"
      boxSizing="content-box"
      cursor="pointer"
      height={height}
      position="relative"
      ref={hashtagRef}
      width={width}
    >
      <div
        className={css`
          position: absolute;
          top: 0px;
          left: 0px;
          width: 100%;
          height: 100%;
          background: linear-gradient(168deg, #000000 9%, rgba(0, 0, 0, 0) 65%);
          border-radius: 12px;
        `}
      >
        <Text
          mt="1.5vw"
          mx="1.5vw"
          overflow="hidden"
          weight="bold"
          className={css(`font-size: 2.8vh; text-overflow: ellipsis;`)}
        >
          #{hashtag.name}
        </Text>
      </div>
    </Box>
  )
}
