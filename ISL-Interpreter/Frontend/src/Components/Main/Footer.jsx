import React from 'react'
import { Link } from 'react-router-dom'

const Footer = ({ isDark }) => {
  return (
    <div className='py-8 flex justify-center px-10 gap-10 text-base'>
      <div className='flex rounded-full justify center px-10 gap-8 py-2' style={{
        background: isDark ? "rgba(255,255,255,0.06)" : "black",

        border: "1px solid rgba(255,255,255,0.18)",

        boxShadow: `
      0 8px 32px rgba(0,0,0,0.25),
      inset 0 1px 0 rgba(255,255,255,0.25),
      inset 0 -1px 0 rgba(255,255,255,0.05)
    `
      }}>
        {['About', 'Contact'].map((item) => (
          <Link
            key={item}
            to={`/${item.toLowerCase()}`}
            style={{ color: isDark ? '#FFFFFF' : '#FFFFFF' }}
            className='hover:scale-110 transition text-medium'
          >
            {item}
          </Link>
        ))}
      </div>

    </div>
  )
}

export default Footer