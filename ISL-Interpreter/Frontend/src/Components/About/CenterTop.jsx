import React from 'react'
import TopLeft from './TopLeft'
import TopRight from './TopRight'

const CenterTop = ({isDark}) => {
  return (
    <div className='w-full h-80 mt-2 p-10 flex justify-between items-center gap-10'>
        <TopLeft isDark={isDark} />
        <TopRight isDark={isDark} />
    </div>
  )
}

export default CenterTop