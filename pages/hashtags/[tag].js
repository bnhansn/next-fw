import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Head from 'next/head'
import axios from '../../utils/axios'
import TabLayout from '../../components/TabLayout'

export function Hashtag({ hashtag, children }) {
  const router = useRouter()
  const { tag } = router.query
  const [videos, setVideos] = useState([])

  useEffect(() => {
    async function fetchVideos() {
      try {
        const response = await axios.get(`/api/hashtags/${tag}/videos`)
        setVideos(response.data.videos)
      } catch (error) {}
    }
    fetchVideos()
    return () => {
      setVideos([])
    }
  }, [tag])

  if (!hashtag) {
    return <div>Hashtag Not Found</div>
  }

  return (
    <>
      <div style={{ border: '1px solid black', padding: 8, margin: 8 }}>
        <div>The data in this box is server rendered</div>
        <div>Name: {hashtag.name}</div>
      </div>
      {videos.map((video) => (
        <div key={video.encoded_id}>
          <div>{video.caption}</div>
          <Link
            href="/hashtags/[tag]/videos/[videoId]"
            as={`/hashtags/${tag}/videos/${video.encoded_id}`}
          >
            <a>{`${window.location.origin}/hashtags/${tag}/videos/${video.encoded_id}`}</a>
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

export default function HashtagPage() {
  const router = useRouter()
  const { tag } = router.query

  return (
    <>
      <Head>
        <title>{tag} - Firework</title>
      </Head>
    </>
  )
}

HashtagPage.getLayout = (page) => {
  return (
    <TabLayout>
      <Hashtag {...page.props}>{page}</Hashtag>
    </TabLayout>
  )
}

export async function getServerSideProps(context) {
  const { tag } = context.params
  let hashtag = null
  try {
    const response = await axios.get(`/api/hashtags/${tag}`)
    hashtag = response.data
  } catch (error) {}
  return {
    props: {
      hashtag: hashtag
    }
  }
}
