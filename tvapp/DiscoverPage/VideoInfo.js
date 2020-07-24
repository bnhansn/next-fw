import React from 'react'
import { Box, Flex, Text } from 'fwego'
import { css } from 'emotion'
import truncate from 'lodash/truncate'
import { removeEmojis } from '../helpers'

export default ({ video }) => {
  return (
    <Box bg="transparent" mt="small" px="xxsmall">
      <Flex alignItems="center" flexDirection="row">
        <Box
          as="img"
          borderRadius="50%"
          height="3.7vh"
          width="3.7vh"
          src={video.creator.avatar_url}
        />
        <Text ml="small" weight="normal" className={css(`font-size: 1.5vh;`)}>
          {video.creator.name}
        </Text>
      </Flex>
      <Text
        mt="xxsmall"
        weight="semiBold"
        className={css(`
          font-size: 1.8vh;
        `)}
      >
        {truncate(removeEmojis(video ? video.caption : '' || ''), {
          length: 60
        })}
      </Text>
    </Box>
  )
}
