import { useRouter } from 'next/router'
import axios from 'axios'
import Head from 'next/head'

export default function Channel({ user }) {
  if (!user) {
    return <div>Channel Not Found</div>
  }

  return (
    <>
      <Head>
        <title>{user.name} - Firework</title>
      </Head>
      <div>This is a server rendered channel</div>
      <div>Name: {user.name}</div>
      <div>Username: {user.username}</div>
    </>
  )
}

export async function getServerSideProps(context) {
  const { username } = context.params
  let user = null
  try {
    const response = await axios.get(
      `http://localhost:4000/api/users/${username}`
    )
    user = response.data
  } catch (error) {}
  return {
    props: {
      user: user
    }
  }
}
