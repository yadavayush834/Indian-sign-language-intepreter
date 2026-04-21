import React, { useEffect, useState } from 'react'
import MainCamera from './MainCamera'

const blobShapes = [
  '60% 40% 55% 45% / 50% 60% 40% 50%',
  '45% 55% 40% 60% / 60% 40% 55% 45%',
  '55% 45% 65% 35% / 45% 55% 50% 50%',
  '40% 60% 50% 50% / 55% 45% 60% 40%',
  '65% 35% 45% 55% / 40% 60% 45% 55%',
  '50% 50% 60% 40% / 65% 35% 55% 45%',
]

const Camera = ({ isDark, isCameraOn, videoRef }) => {
  const [shapeIndex, setShapeIndex] = useState(0)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const shapeInterval = setInterval(() => {
      setShapeIndex(prev => (prev + 1) % blobShapes.length)
    }, 2000)
    const scaleInterval = setInterval(() => {
      setScale(prev => prev === 1 ? 1.04 : 1)
    }, 1000)
    return () => {
      clearInterval(shapeInterval)
      clearInterval(scaleInterval)
    }
  }, [])

  return (
    <div className="relative flex justify-center items-center">
      {/* Animated glass blob */}
      <div
        className="absolute backdrop-blur-3xl"
        style={{
          width: '520px',
          height: '420px',
          background: isDark
            ? 'rgba(45, 63, 94, 0.35)'
            : 'rgba(212,196,176,0.45)',
          borderRadius: blobShapes[shapeIndex],
          border: isDark
            ? '1px solid rgba(160,190,255,0.25)'
            : '1px solid rgba(255,255,255,0.6)',
          boxShadow: isDark
            ? `0 10px 45px rgba(0,0,0,0.55), inset 0 2px 6px rgba(180,210,255,0.25), inset 0 -2px 6px rgba(0,0,0,0.35)`
            : `0 8px 30px rgba(0,0,0,0.12), inset 0 2px 6px rgba(255,255,255,0.6)`,
          backdropFilter: 'blur(35px)',
          WebkitBackdropFilter: 'blur(35px)',
          transform: `scale(${scale})`,
          transition: 'border-radius 2s ease-in-out, transform 1s ease-in-out, background 0.4s ease',
        }}
      />
      <div className="relative z-10">
        <MainCamera
          ref={videoRef}
          isDark={isDark}
          isCameraOn={isCameraOn}
        />
      </div>
    </div>
  )
}

export default Camera