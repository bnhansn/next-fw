import React from 'react'
import { useRouter } from 'next/router'
import DiscoverVideo from '../../../../../tvapp/DiscoverVideo'
import TvAppLayout from '../../../../../tvapp/TvAppLayout'

export default function TvHashtagVideoPage(props) {
  const router = useRouter()
  const { tagname, videoId } = router.query

  // TODO this page uses Automatic Static Optimization so router.query will be
  // empty on first render if this page is refreshed. Decide if this is ok or
  // should getServerSideProps
  // https://nextjs.org/docs/advanced-features/automatic-static-optimization
  if (!videoId || !tagname) {
    return null
  }

  return <DiscoverVideo tagname={tagname} videoId={videoId} {...props} />
}

TvHashtagVideoPage.getLayout = (page) => {
  return <TvAppLayout>{page}</TvAppLayout>
}
