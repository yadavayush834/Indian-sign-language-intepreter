import React from 'react'
import CenterTop from './CenterTop'
import CenterMiddle from './CenterMiddle'

const Center = ({isDark}) => {
  return (
    <div>
        <CenterTop isDark={isDark} />
        <CenterMiddle isDark={isDark} />
    </div>
  )
}

export default Center