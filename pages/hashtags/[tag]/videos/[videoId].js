import React from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import axios from '../../../../utils/axios'
import TabLayout from '../../../../components/TabLayout'
import VideoModal from '../../../../components/VideoModal'
import { Hashtag } from '../.'

export default function HashtagVideo({ video }) {
  const router = useRouter()
  const { tag } = router.query
  return (
    <>
      <Head>
        <title>{video?.caption || 'Firework'}</title>
      </Head>
      <VideoModal
        backHref="/hashtags/[tag]"
        backAs={`/hashtags/${tag}`}
        video={video}
      />
    </>
  )
}

HashtagVideo.getLayout = (page) => {
  return (
    <TabLayout>
      <Hashtag {...page.props}>{page}</Hashtag>
    </TabLayout>
  )
}

export async function getServerSideProps(context) {
  const { tag, videoId } = context.params
  let hashtag = null
  let video = null
  try {
    const [hashtagResponse, videoResponse] = await Promise.all([
      axios.get(`/api/hashtags/${tag}`),
      axios.get(`/api/videos/${videoId}`)
    ])
    hashtag = hashtagResponse.data
    video = videoResponse.data
  } catch (error) {}
  return {
    props: {
      hashtag: hashtag,
      video: video
    }
  }
}
