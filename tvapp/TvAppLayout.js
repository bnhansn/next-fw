import React from 'react'

export default function TvAppLayout({ children }) {
  return (
    <>
      {children}
      <style jsx global>
        {`
          html,
          body {
            text-align: center;
            min-height: 100vh;
            width: 100%;
            margin: 0 auto;
            text-align: left;
          }

          #__next {
            max-width: 100%;
            max-height: 100%;
            overflow: auto;
          }

          body.playerIframe,
          html.playerIframe {
            background: transparent;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            max-width: 100%;
          }

          .navigable {
            outline: 0;
            border: 1px solid transparent;
          }

          .navigable:focus {
            border: 1px solid white;
          }

          a {
            color: white;
          }

          a:hover {
            color: white;
          }

          ::-webkit-scrollbar {
            display: none;
          }

          *:focus {
            border: none;
            outline: none;
            outline: 0 solid rgba(0, 0, 0, 0);
          }
        `}
      </style>
    </>
  )
}
