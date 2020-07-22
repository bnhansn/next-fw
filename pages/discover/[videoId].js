import React from 'react'
import Head from 'next/head'
import axios from '../../utils/axios'
import TabLayout from '../../components/TabLayout'
import VideoModal from '../../components/VideoModal'
import { Discover } from '.'

export default function DiscoverVideo({ video }) {
  return (
    <>
      <Head>
        <title>{video?.caption || 'Firework'}</title>
      </Head>
      <VideoModal backHref="/discover" backAs="/discover" video={video} />
    </>
  )
}

DiscoverVideo.getLayout = (page) => {
  return (
    <TabLayout>
      <Discover {...page.props}>{page}</Discover>
    </TabLayout>
  )
}

export async function getServerSideProps(context) {
  const { videoId } = context.params
  let video = null
  try {
    const [videoResponse] = await Promise.all([
      axios.get(`/api/videos/${videoId}`)
    ])
    video = videoResponse.data
  } catch (error) {}
  return {
    props: {
      video: video
    }
  }
}
