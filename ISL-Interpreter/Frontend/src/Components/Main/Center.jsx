import React, { useState, useRef, useEffect } from 'react'
import Camera from './Camera'
import Divider from './Divider'
import TranslationText from './TranslationText'
import useSignInference from '../../hooks/useSignInference'

const Center = ({ isDark }) => {
  const [isCameraOn, setIsCameraOn] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [signMode, setSignMode] = useState('static') // 'static' or 'dynamic'

  const videoRef = useRef(null)
  const { prediction, status, wordState, suggestions, addSpace, applySuggestion, deleteLastLetter, clearTranscript, refineTranscript } = useSignInference({
    videoRef,
    enabled: isTranslating && isCameraOn,
    mode: signMode
  })

  useEffect(() => {
    const onKeyDown = (event) => {
      if (!isTranslating || !isCameraOn) return
      
      // Shift + Enter for Space
      const isShiftEnter = event.shiftKey && (
        event.key === 'Enter' ||
        event.code === 'Enter' ||
        event.code === 'NumpadEnter'
      )

      if (isShiftEnter) {
        event.preventDefault()
        addSpace()
      }

      // Backspace for deleting last letter
      if (event.key === 'Backspace') {
        // Prevent browser back navigation if necessary, but here we just want to delete
        deleteLastLetter()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [addSpace, deleteLastLetter, isCameraOn, isTranslating])

  const handleToggle = () => {
    const next = !isTranslating
    setIsTranslating(next)
    setIsCameraOn(next)
  }

  return (
    <div className='flex flex-col items-center justify-center w-full flex-1 gap-12 mt-20'>

      {/* Mode Toggle (Pill Switch) */}
      <div 
        className='flex items-center p-1 rounded-full'
        style={{
          background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
          border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
          width: '240px',
          position: 'relative',
          height: '44px'
        }}
      >
        <div 
          className='absolute transition-all duration-300 ease-in-out'
          style={{
            left: signMode === 'static' ? '4px' : '120px',
            width: '116px',
            height: '36px',
            background: isDark ? 'rgba(255,255,255,0.15)' : '#ffffff',
            borderRadius: '999px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}
        />
        <button 
          onClick={() => setSignMode('static')}
          className='flex-1 z-10 text-sm font-medium transition-colors duration-300'
          style={{ color: signMode === 'static' ? (isDark ? '#fff' : '#000') : (isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)') }}
        >
          Static (Letters)
        </button>
        <button 
          onClick={() => setSignMode('dynamic')}
          className='flex-1 z-10 text-sm font-medium transition-colors duration-300'
          style={{ color: signMode === 'dynamic' ? (isDark ? '#fff' : '#000') : (isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)') }}
        >
          Dynamic (Words)
        </button>
      </div>

      {/* Main row */}
      <div className='flex items-center justify-center w-full gap-16'>
        <div className='flex items-center justify-center'>
          <Camera
            isDark={isDark}
            isCameraOn={isCameraOn}
            landmarks={null}
            videoRef={videoRef}
          />
        </div>
        <div className='flex items-center justify-center'>
          <Divider isDark={isDark} />
        </div>
        <div className='flex items-center justify-center'>
          <TranslationText
            isDark={isDark}
            isTranslating={isTranslating}
            prediction={prediction}
            status={status}
            wordState={wordState}
            suggestions={suggestions}
            applySuggestion={applySuggestion}
            deleteLastLetter={deleteLastLetter}
            clearTranscript={clearTranscript}
            refineTranscript={refineTranscript}
          />
        </div>
      </div>

      {/* Buttons row */}
      <div className='flex items-center justify-center gap-6'>
        <button
          onClick={handleToggle}
          className="px-10 py-3 rounded-full text-lg tracking-wide border hover:scale-105 transition-transform duration-300 ease-out active:scale-95"
          style={{
            background: isTranslating
              ? 'rgba(255, 107, 107, 0.15)'
              : isDark
              ? 'rgba(255,255,255,0.08)'
              : '#000000',
            color: '#ffffff',
            border: isTranslating
              ? '1px solid rgba(255,107,107,0.5)'
              : isDark
              ? '1px solid rgba(255,255,255,0.25)'
              : '1px solid rgba(0,0,0,0.85)',
            boxShadow: isDark
              ? `0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.35)`
              : `0 6px 18px rgba(0,0,0,0.25)`,
            backdropFilter: isDark ? 'blur(25px)' : 'none',
            WebkitBackdropFilter: isDark ? 'blur(25px)' : 'none',
            fontFamily: 'Playfair Display, serif',
            minWidth: '180px',
            cursor: 'pointer',
          }}
        >
          {isTranslating ? 'Stop Translation' : 'Start Translation'}
        </button>
      </div>

    </div>
  )
}

export default Center