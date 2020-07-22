import React from 'react'
import App from 'next/app'

const Noop = (page) => page

export default class FWApp extends App {
  render() {
    const { Component, pageProps } = this.props
    const getLayout = Component.getLayout || Noop

    return (
      <>
        {getLayout(<Component {...pageProps} />)}
        <style jsx global>{`
          html,
          body {
            padding: 0;
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
              Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
              sans-serif;
          }

          * {
            box-sizing: border-box;
          }
        `}</style>
      </>
    )
  }
}
