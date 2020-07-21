import { useRouter } from 'next/router'
import axios from 'axios'
import Head from 'next/head'

export default function Video({ video }) {
  if (!video) {
    return <div>Video Not Found</div>
  }

  return (
    <>
      <Head>
        <title>{video.caption}</title>
      </Head>
      <div>This is a server rendered video</div>
      <div>Creator: {video.creator.username}</div>
      <div>Caption: {video.caption}</div>
    </>
  )
}

export async function getServerSideProps(context) {
  const { videoId } = context.params
  let video = null
  try {
    const response = await axios.get(
      `http://localhost:4000/api/videos/${videoId}`
    )
    video = response.data
  } catch (error) {}
  return {
    props: {
      video: video
    }
  }
}
