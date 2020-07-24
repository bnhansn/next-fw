import React, { memo, useEffect, useState } from 'react'
import throttle from 'lodash/throttle'
import { Box } from 'fwego'

export default memo((props) => {
  const { videoEl } = props
  const [percentage, setPercentage] = useState(0)

  useEffect(() => {
    const onTimeUpdate = throttle((event) => {
      const { currentTime, duration } = event.target
      setPercentage(Math.floor((currentTime / duration) * 100))
    }, 250)

    const onEnded = () => setPercentage(100)

    if (videoEl) {
      videoEl.addEventListener('timeupdate', onTimeUpdate)
      videoEl.addEventListener('ended', onEnded)
    }
    return () => {
      if (videoEl) {
        videoEl.removeEventListener('timeupdate', onTimeUpdate)
        videoEl.removeEventListener('ended', onEnded)
      }
    }
  }, [videoEl])

  return (
    <Box bg="rgba(255, 255, 255, 0.2)" height="2" width="100%">
      <div
        style={{
          background: 'white',
          height: '100%',
          transition: '0.25s',
          width: `${percentage}%`
        }}
      />
    </Box>
  )
})
