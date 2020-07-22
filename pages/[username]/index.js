import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import axios from '../../utils/axios'
import TabLayout from '../../components/TabLayout'

export function Channel({ user, children }) {
  const router = useRouter()
  const { username } = router.query
  const [videos, setVideos] = useState([])

  useEffect(() => {
    async function fetchVideos() {
      try {
        const response = await axios.get(`/api/users/${username}/videos`)
        setVideos(response.data.videos)
      } catch (error) {}
    }
    fetchVideos()
    return () => {
      setVideos([])
    }
  }, [username])

  if (!user) {
    return <div>Channel Not Found</div>
  }

  return (
    <>
      <div style={{ border: '1px solid black', padding: 8, margin: 8 }}>
        <div>The data in this box is server rendered</div>
        <div>Name: {user.name}</div>
        <div>Username: {user.username}</div>
      </div>
      {videos.map((video) => (
        <div key={video.encoded_id}>
          <div>{video.caption}</div>
          <Link
            href="/[username]/videos/[videoId]"
            as={`/${username}/videos/${video.encoded_id}`}
          >
            <a>{`${window.location.origin}/${username}/videos/${video.encoded_id}`}</a>
          </Link>
          <div>
            <Link href="/[username]" as={`/${video.creator.username}`}>
              <a>{video.creator.username}</a>
            </Link>
          </div>
          <div>
            {video.hashtags.map((tag) => (
              <span key={tag} style={{ marginRight: 4 }}>
                <Link href="/hashtags/[tag]" as={`/hashtags/${tag}`}>
                  <a>#{tag}</a>
                </Link>
              </span>
            ))}
          </div>
          <hr />
        </div>
      ))}
      {children}
    </>
  )
}

export default function ChannelPage({ user }) {
  return (
    <>
      <Head>
        <title>{user.name} - Firework</title>
      </Head>
    </>
  )
}

ChannelPage.getLayout = (page) => {
  return (
    <TabLayout>
      <Channel {...page.props}>{page}</Channel>
    </TabLayout>
  )
}

export async function getServerSideProps(context) {
  const { username } = context.params
  let user = null
  try {
    const response = await axios.get(`/api/users/${username}`)
    user = response.data
  } catch (error) {}
  return {
    props: {
      user: user
    }
  }
}
