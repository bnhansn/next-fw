import React from 'react'
import Head from 'next/head'
import axios from '../../../utils/axios'
import TabLayout from '../../../components/TabLayout'
import VideoModal from '../../../components/VideoModal'
import { Channel } from '..'

export default function ChannelVideo({ user, video }) {
  return (
    <>
      <Head>
        <title>{video?.caption || 'Firework'}</title>
      </Head>
      <VideoModal
        backHref="/[username]"
        backAs={`/${user.username}`}
        video={video}
      />
    </>
  )
}

ChannelVideo.getLayout = (page) => {
  return (
    <TabLayout>
      <Channel {...page.props}>{page}</Channel>
    </TabLayout>
  )
}

export async function getServerSideProps(context) {
  const { username, videoId } = context.params
  let user = null
  let video = null
  try {
    const [userResponse, videoResponse] = await Promise.all([
      axios.get(`/api/users/${username}`),
      axios.get(`/api/videos/${videoId}`)
    ])
    user = userResponse.data
    video = videoResponse.data
  } catch (error) {}
  return {
    props: {
      user: user,
      video: video
    }
  }
}
