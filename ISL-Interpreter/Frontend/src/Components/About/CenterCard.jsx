import React from 'react'

const CenterCard = ({ index, title, desc, isDark }) => {
  return (
    <div
      className='w-1/4 flex flex-col gap-3 items-center justify-center text-center hover:scale-103'
      style={{ color: isDark ? 'white' : 'black' }}
    >
      <div
        className='h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold text-2xl'
        style={{
          background: isDark
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(0,0,0,1)'
        }}
      >
        {index + 1}
      </div>

      <h1 className='text-lg font-semibold'>{title}</h1>

      <p className='text-sm'>{desc}</p>
    </div>
  )
}

export default CenterCard
