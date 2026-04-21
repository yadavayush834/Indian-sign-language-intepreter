import React from 'react'

const Heading = ({isDark}) => {
  return (
    <div className='flex flex-col justify-center items-center gap-4'>
        <h1 style={{ fontFamily: 'Playfair Display, serif', color: isDark ? '#ffffff' : '#000000' }} className='text-5xl px-10 mt-7'>About ISL Interpreter</h1>
        <p style={{ color: isDark ? '#a0aec0' : '#525762' }} className='text-base px-10 text-gray-600 tracking-widest uppercase'>Breaking communication barriers through technology and sign language</p>
    </div>
  )
}

export default Heading