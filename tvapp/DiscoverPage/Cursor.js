import { useEffect } from 'react'
import Mousetrap from 'mousetrap'

const VIDEO_TYPE = 'video'
const HASHTAG_TYPE = 'hashtag'

export default (props) => {
  const {
    cursor,
    dispatch,
    hashtags,
    loadingVideos,
    loadingHashtags,
    onOpenVideo,
    onOpenHashtag,
    videos
  } = props

  const onSelectItem = () => {
    const elem = document.getElementById(`${cursor.type}_${cursor.index}`)
    if (elem) {
      if (cursor.type === HASHTAG_TYPE) {
        onOpenHashtag(hashtags[cursor.index])
      } else {
        onOpenVideo(videos[cursor.index])
      }
    }
  }

  const onPrevItem = () => {
    if (cursor.index > 0) {
      switch (cursor.type) {
        case VIDEO_TYPE:
        case HASHTAG_TYPE:
          break
        default:
          return
      }
      const elm = document.getElementById(`${cursor.type}_${cursor.index - 1}`)
      if (elm) {
        elm.scrollIntoView(false)
        // below does not work well on tv emulator
        // elm.scrollIntoView({
        //   // behavior: 'smooth',
        //   block: 'nearest',
        //   inline: 'center'
        // })
      }
      dispatch.setCursor({ type: cursor.type, index: cursor.index - 1 })
      return false
    }
  }

  const onNextItem = () => {
    if (cursor.type === VIDEO_TYPE) {
      if (cursor.index + 1 >= videos.length) {
        return
      }
    } else if (cursor.type === HASHTAG_TYPE) {
      if (cursor.index + 1 >= hashtags.length) {
        return
      }
    } else {
      return
    }
    const elm = document.getElementById(`${cursor.type}_${cursor.index + 1}`)
    if (elm) {
      elm.scrollIntoView(false)
      // below does not work well on tv emulator
      // elm.scrollIntoView({
      //   // behavior: 'smooth',
      //   block: 'center',
      //   inline: 'center'
      // })
    }
    dispatch.setCursor({ type: cursor.type, index: cursor.index + 1 })
    return false
  }

  const onAboveItem = () => {
    // Note: should use getBoundingClientRect()
    // to find the closest item in viewport
    // but this is not working in 4.9/4.11 emulator
    if (cursor.type === HASHTAG_TYPE) {
      const elm = document.getElementById(
        `video_${cursor.last[VIDEO_TYPE] || 0}`
      )
      if (elm) {
        elm.scrollIntoView({
          // behavior: 'smooth', // does not work well on tv
          block: 'center',
          inline: 'nearest'
        })
      }
      window.scrollTo(0, -document.body.scrollHeight)
      dispatch.setCursor({
        type: VIDEO_TYPE,
        index: cursor.last[VIDEO_TYPE] || 0
      })
      return false
    }
  }

  const onBelowItem = () => {
    // Note: should use getBoundingClientRect()
    // to find the closest item in viewport
    // but this is not working in 4.9/4.11 emulator
    if (cursor.type === VIDEO_TYPE) {
      const elm = document.getElementById(
        `hashtag_${cursor.last[HASHTAG_TYPE] || 0}`
      )
      if (elm) {
        elm.scrollIntoView({
          // behavior: 'smooth', // does not work well on tv
          block: 'nearest',
          inline: 'nearest'
        })
      }
      window.scrollTo(0, document.body.scrollHeight)
      dispatch.setCursor({
        type: HASHTAG_TYPE,
        index: cursor.last[HASHTAG_TYPE] || 0
      })
      return false
    }
  }

  useEffect(() => {
    Mousetrap.bind(['enter'], onSelectItem, 'keyup')
    Mousetrap.bind(['left'], onPrevItem, 'keyup')
    Mousetrap.bind(['right'], onNextItem, 'keyup')
    Mousetrap.bind(['up'], onAboveItem, 'keyup')
    Mousetrap.bind(['down'], onBelowItem, 'keyup')

    return () => {
      Mousetrap.unbind(['enter'], 'keyup')
      Mousetrap.unbind(['left'], 'keyup')
      Mousetrap.unbind(['right'], 'keyup')
      Mousetrap.unbind(['up'], 'keyup')
      Mousetrap.unbind(['down'], 'keyup')
    }
  }, [videos, hashtags, cursor]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (cursor && !loadingHashtags && !loadingVideos) {
      const elem = document.getElementById(`${cursor.type}_${cursor.index}`)
      if (elem) {
        elem.scrollIntoView(false)
      }
      if (!elem || cursor.index === undefined) {
        if (videos.length) {
          dispatch.setCursor({ type: 'video', index: 0 })
        } else if (hashtags.length) {
          dispatch.setCursor({ type: 'hashtag', index: 0 })
        }
      }
    }
  }, [loadingHashtags, loadingVideos, hashtags, videos, cursor, dispatch])

  return null
}
