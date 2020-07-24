import React from 'react'
import { Box, Flex } from 'fwego'

export default () => {
  return (
    <Flex
      alignItems="center"
      backgroundImage="radial-gradient(circle at 100% 0, #000000, rgba(0, 0, 0, 0) 47%)"
      justifyContent="flex-end"
      pr={['xsmall', 'xlarge', '3vw']}
      position="fixed"
      right="0"
      top="0"
      width="15%"
      height="12%"
      zIndex="1"
    >
      <Box
        as="img"
        src="/images/tv/logo.svg"
        mr={['none', 'xxxsmall', 'xxsmall', 'small']}
        width="40px"
        height="40px"
      />
      <Box as="img" src="/images/tv/firework.svg" height="22px" />
    </Flex>
  )
}
