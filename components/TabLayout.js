import React from 'react'
import Link from 'next/link'

export default function TabLayout({ children }) {
  return (
    <>
      <div
        style={{
          height: 50,
          paddingLeft: 16,
          paddingRight: 16,
          background: 'black',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Link href="/">
          <a style={{ color: 'white', marginRight: 8 }}>Home</a>
        </Link>
        <Link href="/discover">
          <a style={{ color: 'white' }}>Discover</a>
        </Link>
      </div>
      {children}
    </>
  )
}
