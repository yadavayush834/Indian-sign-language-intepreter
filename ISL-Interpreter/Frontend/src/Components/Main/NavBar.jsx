import React from 'react'

const NavBar = ({ isDark, setIsDark }) => {
  return (
    <div className='flex justify-between items-center px-10 mt-3 h-20'>
      <div>
        <h1 style={{ color: isDark ? '#ffffff' : '#1a1a1a' }} className='text-5xl px-10 mt-7'>Zen ISL Interpreter</h1>
        <p style={{ color: isDark ? '#a0aec0' : '#6b7280' }} className='text-base px-10 text-gray-600 tracking-widest uppercase'>Active Translation</p>
      </div>

      <button
        onClick={() => setIsDark(!isDark)}
        className="
            h-14 w-14 flex items-center justify-center
            rounded-full
            backdrop-blur-xl
            border border-white/20
            shadow-xl
            transition-all duration-300
            hover:scale-110
            active:scale-95
  "
        style={{
          background: isDark
            ? "rgba(255,255,255,0.08)"
            : "rgba(255,255,255,0.45)",

          boxShadow: isDark
            ? "0 8px 32px rgba(0,0,0,0.5)"
            : "0 8px 32px rgba(31,38,135,0.15)",

          color: isDark ? "#fff" : "#1a1a1a"
        }}
      >
        {isDark
          ? <i className="ri-sun-line text-2xl"></i>
          : <i className="ri-moon-line text-2xl"></i>}
      </button>

    </div >
  )
}

export default NavBar