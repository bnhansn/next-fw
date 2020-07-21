import { useRouter } from 'next/router'
import axios from 'axios'
import Head from 'next/head'

export default function Hashtag({ hashtag }) {
  if (!hashtag) {
    return <div>Hashtag Not Found</div>
  }

  return (
    <>
      <Head>
        <title>{hashtag.name} - Firework</title>
      </Head>
      <div>This is a server rendered hashtag</div>
      <div>Name: {hashtag.name}</div>
    </>
  )
}

export async function getServerSideProps(context) {
  const { tag } = context.params
  let hashtag = null
  try {
    const response = await axios.get(
      `http://localhost:4000/api/hashtags/${tag}`
    )
    hashtag = response.data
  } catch (error) {}
  return {
    props: {
      hashtag: hashtag
    }
  }
}
