import React from 'react'

const Divider = ({ isDark }) => {
  return (
    <div className='ml-20'
      style={{
        width: '1px',
        height: '280px',
        background: isDark
          ? 'linear-gradient(to bottom, transparent, #4a6080, transparent)'
          : 'linear-gradient(to bottom, transparent, #9ca3af, transparent)',
        transition: 'all 0.4s ease'
      }}
    />
  )
}

export default Divider