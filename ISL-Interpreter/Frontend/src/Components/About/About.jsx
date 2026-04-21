import React from 'react'
import Heading from './Heading'
import Center from './Center'
import NavBarAbout from './NavBarAbout'
const About = ({isDark, setIsDark}) => {
  return (
    <div className='transition-all duration-300' style={{ backgroundColor: isDark ? '#0E1334' : '#eeeded' }}>
        <NavBarAbout isDark={isDark} setIsDark={setIsDark} />
        <Heading isDark={isDark} />
        <Center isDark={isDark} />
    </div>
  )
}

export default About