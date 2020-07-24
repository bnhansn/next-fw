import React from 'react'
import Discover from '../../tvapp/Discover'
import TvAppLayout from '../../tvapp/TvAppLayout'

export default function TvPage(props) {
  return <Discover {...props} />
}

TvPage.getLayout = (page) => {
  return <TvAppLayout>{page}</TvAppLayout>
}
