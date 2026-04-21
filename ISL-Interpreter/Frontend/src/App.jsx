import { useState } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import NavBar from './Components/Main/NavBar'
import Center from './Components/Main/Center'
import Footer from './Components/Main/Footer'
import About from './Components/About/About'
import Home from './Components/pages/Home'
import Contact from './Components/About/Contact'
import 'remixicon/fonts/remixicon.css'

const App = () => {
  const [isDark, setIsDark] = useState(true)

  return (
    <div style={{
      backgroundColor: isDark ? '#0E1334' : '#eeeded',
      transition: 'all 0.4s ease',
    }}>
      <div
        className='min-h-screen flex flex-col justify-start'
        style={{
          backgroundColor: isDark ? '#0E1334' : '#eeeded',
          transition: 'all 0.4s ease',
        }}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/app"
            element={
              <>
                <NavBar isDark={isDark} setIsDark={setIsDark} />
                <Center isDark={isDark} />
                <Footer isDark={isDark} />
              </>
            }
          />
          <Route
            path="/about"
            element={<About isDark={isDark} setIsDark={setIsDark} />}
          />
          <Route
            path="/contact"
            element={<Contact isDark={isDark} />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  )
}

export default App