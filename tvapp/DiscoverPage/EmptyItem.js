import React from 'react'
import { Box } from 'fwego'
import { css } from 'emotion'

export default ({ repeat = 1, keyPrefix, ...rest }) => {
  const dummyArray = new Array(repeat).fill(0)
  return (
    <>
      {dummyArray.map((_, idx) => (
        <Box
          boxSizing="content-box"
          borderRadius="12"
          key={`${keyPrefix}_${idx}`}
          mr="small"
          className={css(`
            background: linear-gradient(168deg, #000000 9%, rgba(0, 0, 0, 0) 65%);
          `)}
          {...rest}
        />
      ))}
    </>
  )
}
