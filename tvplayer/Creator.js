import React from 'react'
import { connect } from 'redux-zero/react'
import { Box, Text, Flex } from 'fwego'
import { css, cx } from 'emotion'
import Link from 'next/link'

export default connect((state) => ({ isInIframe: state.params.in_iframe }))(
  (props) => {
    const {
      avatarUrl,
      username,
      name,
      containerClassName = css``,
      linkClassName = css``,
      isInIframe
    } = props
    return (
      <Flex
        alignItems="center"
        flexDirection="row"
        justifyContent="flex-start"
        className={containerClassName}
      >
        <Box
          as="img"
          border="1px solid white"
          borderRadius="50%"
          height="40"
          mr="small"
          src={avatarUrl}
          width="40"
        />
        <Flex flexDirection="column" width="calc(100% - ${40 + 12}px)">
          <Link href="/[username]" as={`/${username}`}>
            <Text
              as="a"
              target={isInIframe ? '_parent' : '_self'}
              size="2vh"
              className={cx(
                css`
                  &:hover {
                    color: inherit;
                    text-decoration: none;
                  }
                `,
                linkClassName
              )}
            >
              {name}
            </Text>
          </Link>
        </Flex>
      </Flex>
    )
  }
)
