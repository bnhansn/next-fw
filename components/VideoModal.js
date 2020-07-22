import React from 'react'
import Link from 'next/link'

export default function VideoModal({ backHref, backAs, video }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: '10vh',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '500px',
        background: 'white',
        border: '1px solid black',
        boxShadow: '3px 3px 0px rgba(0, 0, 0, 1)'
      }}
    >
      <div style={{ position: 'relative', padding: 50 }}>
        <Link href={backHref} as={backAs}>
          <a style={{ position: 'absolute', top: 4, right: 4 }}>Close</a>
        </Link>
        <div>video_id: {video?.id}</div>
        <div>creator: {video?.creator?.username}</div>
        <div>caption: {video?.caption}</div>
      </div>
    </div>
  )
}
