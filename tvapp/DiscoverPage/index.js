import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { Box } from 'fwego'
import i18n from 'i18nline'
import Mousetrap from 'mousetrap'
import {
  displayDiscoverVideoUrl,
  displayHashtagVideoUrl
} from '../components/helpers'
import Thumbnail from './Thumbnail'
import VideoInfo from './VideoInfo'
import List from './List'
import EmptyItem from './EmptyItem'
import Item from './Item'
import Hashtag from './Hashtag'
import Cursor from './Cursor'
import Logo from './Logo'

const getFocusClass = (cursor, type, index) => {
  if (cursor.type === type && cursor.index === index) {
    return 'focused'
  }
  return ''
}

export default (props) => {
  const {
    cursor,
    dispatch,
    hashtags,
    videos,
    loadingVideos,
    loadingHashtags
  } = props

  const router = useRouter()
  const itemWidth = '16vw'
  const thumbnailHeight = `${(16 * 1.65).toFixed(2)}vw`
  const emptyThumbnailHeight = `${(16 * 1.65 + 6.7).toFixed(2)}vw`

  const customKeys = {
    461: 'vk_back'
  }
  if (typeof window !== 'undefined') {
    Mousetrap.addKeycodes(customKeys)
  }

  const onExit = () => {
    router.back()
  }

  const onOpenHashtag = (hashtag) => {
    dispatch.generateHashtagCover({ hashtag })
    dispatch.fetchHashtagVideos({
      hashtagName: hashtag.name,
      onFirstVideo: (video) => {
        router.push(...displayHashtagVideoUrl({ hashtag, video }))
      }
    })
  }

  const onOpenVideo = (video) => {
    router.push(...displayDiscoverVideoUrl({ video }))
  }

  useEffect(() => {
    Mousetrap.bind(['esc', 'backspace', 'vk_back'], onExit)

    return () => {
      Mousetrap.unbind(['esc', 'backspace', 'vk_back'])
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box
      backgroundImage={[
        'none',
        'radial-gradient(circle at 50% 0, #494949, #121212 47%)'
      ]}
      height="100%"
      px={['xsmall', 'xlarge', '3vw']}
      py={['none', 'medium', '1.5vw']}
      width="100%"
    >
      <Cursor
        {...props}
        onOpenVideo={onOpenVideo}
        onOpenHashtag={onOpenHashtag}
      />
      <Logo />
      <List
        onFetchMore={() => {
          if (!loadingVideos) {
            dispatch.fetchDiscoverVideos({ page: true })
          }
        }}
        title={i18n.t('Popular Videos')}
      >
        {videos?.map((video, idx) => (
          <Item
            key={video.encoded_id}
            className={['navigable', getFocusClass(cursor, 'video', idx)]}
            flex={`0 0 ${itemWidth}`}
            id={`video_${idx}`}
            onClick={() => {
              dispatch.setCursor({ type: 'video', index: idx })
              onOpenVideo(video)
            }}
          >
            <Thumbnail
              dispatch={dispatch}
              height={thumbnailHeight}
              width={itemWidth}
              video={video}
            />
            <VideoInfo video={video} />
          </Item>
        ))}
        {loadingVideos && (
          <EmptyItem
            keyPrefix="loading_video"
            flex={`0 0 auto`}
            repeat={5}
            width={itemWidth}
            height={emptyThumbnailHeight}
          />
        )}
      </List>
      <List title={i18n.t('Trending Topics')}>
        {hashtags &&
          hashtags.map((hashtag, idx) => (
            <Item
              className={['navigable', getFocusClass(cursor, 'hashtag', idx)]}
              id={`hashtag_${idx}`}
              key={hashtag.name}
              flex="0 0 auto"
              onClick={() => {
                dispatch.setCursor({ type: 'hashtag', index: idx })
                onOpenHashtag(hashtag)
              }}
            >
              <Hashtag
                dispatch={dispatch}
                hashtag={hashtag}
                height={itemWidth}
                width={itemWidth}
              />
            </Item>
          ))}
        {loadingHashtags && (
          <EmptyItem
            keyPrefix="loading_hashtag"
            flex={`0 0 auto`}
            repeat={5}
            width={itemWidth}
            height={itemWidth}
          />
        )}
      </List>
    </Box>
  )
}
