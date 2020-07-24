import React from 'react'
import { Box } from 'fwego'

export default (props) => {
  const { type, zIndex } = props

  const commonProps = {
    bg: 'rgba(0, 0, 0, 0.5)',
    height: '100%',
    position: 'absolute',
    zIndex
  }
  switch (type) {
    case 'left':
      return <Box {...commonProps} left="0" width="50%" />
    case 'right':
      return <Box {...commonProps} left="50%" width="50%" />
    case 'full':
      return <Box {...commonProps} left="0" width="100%" />
  }
  return null
}
