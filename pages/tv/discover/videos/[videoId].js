import React from 'react'
import { useRouter } from 'next/router'
import DiscoverVideo from '../../../../tvapp/DiscoverVideo'
import TvAppLayout from '../../../../tvapp/TvAppLayout'

export default function TvDiscoverVideoPage(props) {
  const router = useRouter()
  const { videoId } = router.query

  // TODO this page uses Automatic Static Optimization so router.query will be
  // empty on first render if this page is refreshed. Decide if this is ok or
  // should getServerSideProps
  // https://nextjs.org/docs/advanced-features/automatic-static-optimization
  if (!videoId) {
    return null
  }

  return <DiscoverVideo videoId={videoId} {...props} />
}

TvDiscoverVideoPage.getLayout = (page) => {
  return <TvAppLayout>{page}</TvAppLayout>
}
