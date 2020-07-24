import React from 'react'
import I18n from 'i18nline'
import { Box, Text } from 'fwego'
import { css } from 'emotion'

export default (props) => {
  const { video } = props

  const sponsored = !!video.badge && video.badge === 'ad'
  const featured = !!video.badge && video.badge === 'featured'

  return (
    <Box as="span">
      {sponsored && (
        <Text
          display="inline"
          size="xsmall"
          weight="medium"
          textShadow="0 1px 0 rgba(0, 0, 0, 0.5)"
          className={css`
            opacity: 0.5;
          `}
        >
          {I18n.t('Sponsored')}
        </Text>
      )}
      {featured && (
        <Text
          display="inline"
          size="xsmall"
          weight="medium"
          textShadow="0 1px 0 rgba(0, 0, 0, 0.5)"
          className={css`
            opacity: 0.5;
          `}
        >
          {I18n.t('Featured')}
        </Text>
      )}
    </Box>
  )
}
