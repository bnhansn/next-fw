import React, { forwardRef } from 'react'
import { Box } from 'fwego'

export default forwardRef((props, ref) => {
  return (
    <Box
      ref={ref}
      boxSizing="content-box"
      borderRadius="12"
      mr="small"
      {...props}
    >
      {props.children}
    </Box>
  )
})
