import React from 'react'
import I18n from 'i18nline'
import VideoControlsButton from './VideoControlsButton'

export default (props) => {
  const { isPaused, onPlayClick, onPauseClick } = props

  return isPaused ? (
    <VideoControlsButton
      imgSrc="/images/embed/player/play.svg"
      onClick={onPlayClick}
      title={I18n.t('Play')}
    />
  ) : (
    <VideoControlsButton
      imgSrc="/images/embed/player/pause.svg"
      onClick={onPauseClick}
      title={I18n.t('Pause')}
    />
  )
}
