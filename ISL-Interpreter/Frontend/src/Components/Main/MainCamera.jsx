import React, { useEffect, useRef, forwardRef } from 'react'

const MainCamera = forwardRef(function MainCamera({ isDark, isCameraOn }, ref) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const setVideoRef = (node) => {
    videoRef.current = node

    if (!ref) return
    if (typeof ref === 'function') {
      ref(node)
    } else {
      ref.current = node
    }
  }

  useEffect(() => {
    if (isCameraOn) {
      navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' } })
        .then(stream => {
          streamRef.current = stream
          if (videoRef.current) {
            videoRef.current.srcObject = stream
            videoRef.current.onloadedmetadata = () => videoRef.current.play()
          }
        })
        .catch(err => console.error('[MainCamera] Camera error:', err))
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
      if (videoRef.current) videoRef.current.srcObject = null
    }

    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop())
    }
  }, [isCameraOn])

  return (
    <div
      className='relative rounded-2xl overflow-hidden'
      style={{
        width: '424px',
        height: '296px',
        backgroundColor: isDark ? '#1a2235' : '#e8e0d5',
        border: isDark ? '1px solid #3d5070' : '1px solid #c0b09a',
      }}
    >
      {isCameraOn ? (
        <video
          ref={setVideoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'scaleX(-1)',
          }}
        />
      ) : (
        <div className='w-full h-full flex items-center justify-center' style={{ position: 'absolute', inset: 0 }}>
          <p style={{
            color: isDark ? '#4a6080' : '#a09080',
            fontFamily: 'Playfair Display, serif',
            fontSize: '0.9rem',
          }}>
            Camera is off
          </p>
        </div>
      )}
    </div>
  )
})

export default MainCamera