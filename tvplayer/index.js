import React, { useEffect, useRef, useState } from 'react'
import Mousetrap from 'mousetrap'
import throttle from 'lodash/throttle'
import { Flex, Text } from 'fwego'
import { useRouter } from 'next/router'
import Navigation from './Navigation'

export const isDesktop = () => {
  const media =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia(`only screen and (min-width: 1024px)`)
  return media && media.matches
}

const customKeys = {
  461: 'vk_back'
}

export default (props) => {
  const {
    video,
    videosList,
    videoNext,
    isInIframe,
    appContext,
    params,
    actions,
    watchedVideos
  } = props
  const { trackVideoPick } = actions
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      Mousetrap.addKeycodes(customKeys)
    }
  }, [])

  const [isWideEnough, setIsWideEnough] = useState(isDesktop())
  const currentVideoRef = useRef(null)
  currentVideoRef.current = currentVideoRef.current || video

  useEffect(() => {
    if (!isInIframe) {
      document.getElementsByTagName('html')[0].classList.add('playerTVMode')
      document.getElementsByTagName('body')[0].classList.add('playerTVMode')
    }
  }, [isInIframe])

  const onBackButtonClick = (event) => {
    event.preventDefault()
    actions.clearHistory()
    router.back()
  }

  const onNextVideo = (video) => {
    actions.pushHistory({ video: currentVideoRef.current })
    trackVideoPick({ video })
    currentVideoRef.current = video
    actions.clearVideos({})
    actions.fetchVideos({ videoId: video.encoded_id, appContext })
  }

  const onPrevVideo = () => {
    const video =
      watchedVideos.length > 0 ? watchedVideos[watchedVideos.length - 1] : null
    if (!video) {
      return
    }
    actions.popHistory()
    trackVideoPick({ video })
    currentVideoRef.current = video
    actions.clearVideos({})
    actions.fetchVideos({ videoId: video.encoded_id, appContext })
  }

  useEffect(() => {
    Mousetrap.bind(['esc', 'backspace', 'vk_back'], onBackButtonClick)

    return () => {
      Mousetrap.unbind(['esc', 'backspace', 'vk_back'])
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let trigger = null
    const checkWidth = () => {
      setIsWideEnough(isDesktop())
    }
    trigger = throttle(checkWidth, 250)
    trigger()
    window.addEventListener('resize', trigger)

    return () => {
      trigger && window.removeEventListener('resize', trigger)
    }
  }, [])

  if (isWideEnough) {
    return (
      <>
        <Flex
          alignItems="center"
          flexDirection="row"
          height="100vh"
          justifyContent="center"
          pb="xxxlarge"
          pt="xxxlarge"
          width="100%"
          bg="black"
          position="fixed"
          top="0"
          left="0"
        >
          <Navigation
            actions={actions}
            appContext={appContext}
            hasNavButtons={true}
            isMuted={false}
            onNextVideo={onNextVideo}
            onPrevVideo={onPrevVideo}
            params={params}
            publisherClientId={appContext.publisherClientId}
            video={currentVideoRef.current}
            videoNext={videoNext}
            videosList={videosList}
            watchedVideos={watchedVideos}
          />
        </Flex>
      </>
    )
  }
  // in theory we should not be here if showing on TV
  return (
    <>
      <Flex
        alignItems="center"
        flexDirection="row"
        height="100vh"
        justifyContent="center"
        p="small"
        width="100%"
      >
        <Text>Expand the width of your window to view this experience</Text>
      </Flex>
    </>
  )
}
