import React, { useRef } from 'react'
import { Box, Text, Flex } from 'fwego'
import { css } from 'emotion'
import I18n from 'i18nline'
import QRCode from 'react-qr-code'
import Creator from './Creator'
import SponsoredText from './SponsoredText'
import { removeEmojis } from './helpers'

export const Component = (props) => {
  const { shareURL, video } = props

  const hasPublisherInfo = false // TODO: need caller to pass Publisher info like name
  const containerRef = useRef(null)
  const containerWidth =
    containerRef && containerRef.current ? containerRef.current.offsetWidth : 0
  const qrWidth = Math.min(containerWidth / 2, 256)
  const caption =
    video && video.caption
      ? removeEmojis(video.caption)
      : video
      ? video.caption
      : ''

  return (
    <Flex
      bg="transparent"
      borderTopRightRadius="15"
      borderBottomRightRadius="15"
      flexDirection="column"
      height="100%"
      ref={containerRef}
      width="100%"
    >
      {video && (
        <>
          {/* {hasPublisherInfo && (
            <Publisher
              containerClassName={css`
                padding-top: 24px;
                padding-bottom: 24px;
              `}
            />
          )} */}
          {hasPublisherInfo && <Box bg="#606060" height="1" my="xsmall" />}
          <Box p="small">
            {caption && (
              <Text
                as="h3"
                mb="small"
                fontWeight="medium"
                overflow="hidden"
                className={css`
                  font-size: 3vh;
                  display: -webkit-box;
                  line-clamp: 3;
                  -webkit-line-clamp: 3;
                  box-orient: vertical;
                  -webkit-box-orient: vertical;
                  text-overflow: ellipsis;
                `}
              >
                {caption}
              </Text>
            )}
            <SponsoredText video={video} />
            <Creator
              avatarUrl={video.creator?.avatar_url}
              username={video.creator?.username}
              name={video.creator?.name}
              linkClassName={css`
                color: white;
                font-weight: 500;
              `}
            />
          </Box>
          <Flex
            alignItems="center"
            bg="rgba(0, 0, 0, 0.38)"
            borderRadius="15"
            bottom="0"
            flexWrap="wrap"
            justifyContent="space-between"
            position="absolute"
            py="small"
            px="small"
            width="100%"
          >
            <QRCode
              bgColor="#0000000"
              fgColor="#FFFFFF"
              size={qrWidth}
              value={shareURL || video.web_share_url}
            />
            <Box
              as="img"
              width={qrWidth / 2}
              height={qrWidth}
              src="/images/embed/qrcode.svg"
            />
            <Text color="white" pt="small" className={css(`font-sze: 2vh`)}>
              {I18n.t('Interact the video on your phone')}
            </Text>
          </Flex>
        </>
      )}
    </Flex>
  )
}

export default Component
