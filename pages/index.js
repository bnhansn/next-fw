import React from 'react'
import Head from 'next/head'
import TabLayout from '../components/TabLayout'

export default function Home() {
  return (
    <>
      <Head>
        <title>Firework</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        This is the homepage. It does not contain any dynamic data so it is
        pre-generated in the next.js build process and served as a static html
        file.
      </div>
    </>
  )
}

Home.getLayout = (page) => <TabLayout>{page}</TabLayout>
