import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import axios from '../../utils/axios'
import TabLayout from '../../components/TabLayout'

export function Discover({ children }) {
  const [videos, setVideos] = useState([])

  useEffect(() => {
    async function fetchVideos() {
      try {
        const response = await axios.get(`/api/suggested_videos`)
        setVideos(response.data.videos)
      } catch (error) {}
    }
    fetchVideos()
  }, [])

  return (
    <>
      <h1>Discover Page</h1>
      {videos.map((video) => (
        <div key={video.encoded_id}>
          <div>{video.caption}</div>
          <Link href="/discover/[videoId]" as={`/discover/${video.encoded_id}`}>
            <a>{`${window.location.origin}/discover/${video.encoded_id}`}</a>
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

export default function DiscoverPage() {
  return (
    <>
      <Head>
        <title>Firework</title>
      </Head>
    </>
  )
}

DiscoverPage.getLayout = (page) => {
  return (
    <TabLayout>
      <Discover {...page.props}>{page}</Discover>
    </TabLayout>
  )
}
