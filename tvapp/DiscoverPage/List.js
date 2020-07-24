import React, { useRef, useEffect } from 'react'
import throttle from 'lodash/throttle'
import { Box, Flex, Text } from 'fwego'
import { css } from 'emotion'

export default (props) => {
  const { children, onFetchMore, title, ...rest } = props
  const listRef = useRef(null)

  useEffect(() => {
    if (!listRef.current && !onFetchMore) {
      return
    }

    const ref = listRef.current
    const updateNav = () => {
      if (listRef.current.scrollLeft / listRef.current.scrollWidth > 0.7) {
        if (onFetchMore) {
          onFetchMore()
        }
      }
    }
    const scrollListener = throttle(updateNav, 250)
    listRef.current.addEventListener('scroll', scrollListener)

    return () => {
      if (scrollListener) {
        ref.removeEventListener('scroll', scrollListener)
      }
    }
  }, [onFetchMore])

  return (
    <Box mb="medium" px={['xxsmall', 'xsmall']} alignItems="center">
      <Text mb="3%" weight="bold" className={css(` font-size: 3.8vh; `)}>
        {title}
      </Text>
      <Flex
        flexDirection="row"
        flexWrap="nowrap"
        overflowX="scroll"
        overflowY="hidden"
        ref={listRef}
        className={css(`
          &::-webkit-scrollbar {
            display: none;
          }
          -ms-overflow-style: none;
          scrollbar-width: none;
        `)}
        {...rest}
      >
        {children}
      </Flex>
    </Box>
  )
}
