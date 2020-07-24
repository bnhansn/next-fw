export const DISCOVER_CONTEXT_TYPE = 'discover_player'
export const HASHTAG_CONTEXT_TYPE = 'hashtag_player'

export const displayDiscoverVideoUrl = ({ video }) => {
  return [
    '/tv/discover/videos/[videoId]',
    `/tv/discover/videos/${video.encoded_id}`
  ]
}

export const displayHashtagVideoUrl = ({ video, hashtag }) => {
  return [
    '/tv/tags/[tagname]/videos/[videoId]',
    `/tv/tags/${hashtag.name}/videos/${video.encoded_id}`
  ]
}

export const videoActionClickUrl = ({ video, appContext }) => {}
