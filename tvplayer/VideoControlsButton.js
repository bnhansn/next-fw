import React from 'react'
import { css, cx } from 'emotion'
import { Box, Button } from 'fwego'

export default ({ imgSrc, className, ...rest }) => (
  <Button
    display="flex"
    width="50"
    height="50"
    flex="0 0 50px"
    justifyContent="center"
    alignItems="center"
    bg="transparent"
    backgroundImage="none"
    p="0"
    m="0"
    className={cx(
      className,
      css`
        &:focus {
          outline: none;
        }
      `
    )}
    {...rest}
  >
    <Box as="img" height="50" src={imgSrc} />
  </Button>
)
