import React from 'react'
import { Box } from 'fwego'
import { css } from 'emotion'

const NAV_BUTTON_SIZE = 72
const ICON_HEIGHT = 32
const ICON_WIDTH = 18

export default (props) => {
  const { onClick, title, ...rest } = props
  return (
    <Box
      as="a"
      backgroundPosition="center center"
      backgroundSize={`${ICON_WIDTH}px ${ICON_HEIGHT}px`}
      bottom={`calc((100% - ${NAV_BUTTON_SIZE}px) / 2)`}
      cursor="pointer"
      height={NAV_BUTTON_SIZE}
      onClick={onClick}
      position="absolute"
      title={title}
      width={NAV_BUTTON_SIZE}
      zIndex="500"
      className={css`
        background-repeat: no-repeat;
        opacity: 1;
        &:hover {
          opacity: 0.75;
        }
        &:before {
          background: rgba(64, 64, 64, 0.2);
          border-radius: 50%;
          content: '';
          display: block;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -2;
        }
      `}
      {...rest}
    />
  )
}
