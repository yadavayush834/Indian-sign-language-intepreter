import React from 'react'

const TopLeft = ({ isDark }) => {
  return (
    <div className='w-1/2 h-64 p-8 rounded-2xl flex flex-col justify-start gap-4 hover:scale-103'
      style={{
        background: isDark ? "rgba(255,255,255,0.08)" : "rgba(248, 250,255, 1) ", boxShadow: isDark
          ? "0 8px 32px rgba(0,0,0,0.5)"
          : "0 8px 32px rgba(31,38,135,0.3)"
      }}>
      <div className='flex items-center justify-start gap-1 w-full h-20'>
        <div className='h-13 w-13 rounded-xl flex items-center justify-center'
          style={{
            background: isDark
              ? "rgba(255,255,255,0.08)"
              : "rgba(0, 0, 0, 1)",

          }}>
          <i className="ri-focus-2-line text-3xl text-white"
          ></i>
        </div>
        <h1 className='text-3xl p-4 text-white font-semibold' style={{ color: isDark ? 'white' : 'black' }}>Our Mission</h1>
      </div>

      <div>
        <p className='text-lg ' style={{ color: isDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.8)" }}>To empower the deaf and hard-of-hearing community by providing accessible, real-time sign language interpretation. We believe communication is a fundamental human right, and technology should bridge gaps, not create them.</p>
      </div>
    </div>
  )
}

export default TopLeft