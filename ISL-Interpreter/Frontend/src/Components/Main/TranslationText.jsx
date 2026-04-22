import React, { useState } from 'react'

const TranslationText = ({ 
  isDark, 
  isTranslating, 
  prediction, 
  status, 
  wordState, 
  suggestions, 
  applySuggestion, 
  deleteLastLetter, 
  clearTranscript 
}) => {
  const [copied, setCopied] = useState(false)

  const textColor = isDark ? '#ffffff' : '#2d2d2d'
  const mutedColor = isDark ? '#6b7280' : '#9ca3af'
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
  const accentColor = '#6366f1' // Indigo accent

  const statusText = (() => {
    if (!isTranslating) return 'Press Start Translation\nto begin.'
    if (status?.state === 'error') return `Cannot reach backend API.\n${status?.error || ''}`
    if (!prediction?.handDetected && !wordState?.transcript && !wordState?.currentWord) return 'Show your hand to the camera'
    if (!prediction?.accepted && prediction?.handDetected && !wordState?.currentWord && !wordState?.transcript) {
      return `Low confidence (${Math.round((prediction?.confidence || 0) * 100)}%)`
    }
    return null
  })()

  const statusColor = status?.state === 'connected' ? '#22c55e' : status?.state === 'error' ? '#ef4444' : mutedColor

  const displayLabel = (wordState?.transcript || '') + (wordState?.currentWord || '') || '--'
  const buildingWord = wordState?.currentWord || ''
  const liveLetter = wordState?.liveLetter || '--'
  const confidence = Math.round((prediction?.confidence || 0) * 100)

  const handleCopy = () => {
    const text = (wordState?.transcript || '') + (wordState?.currentWord || '')
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSpeak = () => {
    const text = (wordState?.transcript || '') + (wordState?.currentWord || '')
    console.log('[TTS] Attempting to speak:', text)
    
    if (!text || text.trim() === '') {
      console.warn('[TTS] No text to speak')
      return
    }

    // Stop any current speech
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel()
    }

    const utterance = new SpeechSynthesisUtterance(text)
    
    // Select the first English voice if available, otherwise default
    const voices = window.speechSynthesis.getVoices()
    if (voices.length > 0) {
      utterance.voice = voices.find(v => v.lang.includes('en')) || voices[0]
    }

    utterance.rate = 0.9
    utterance.pitch = 1
    
    utterance.onstart = () => console.log('[TTS] Started speaking')
    utterance.onend = () => console.log('[TTS] Finished speaking')
    utterance.onerror = (e) => console.error('[TTS] Error:', e)

    window.speechSynthesis.speak(utterance)
  }

  const handleRefine = async () => {
    // Add a small rotation animation to the wand when clicked
    const wand = document.getElementById('refine-wand')
    if (wand) wand.style.transform = 'rotate(360deg)'
    await refineTranscript()
    if (wand) wand.style.transform = 'rotate(0deg)'
  }

  return (
    <div style={{ width: '380px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Main display card */}
      <div style={{
        borderRadius: '24px',
        padding: '32px 24px',
        textAlign: 'center',
        minHeight: '200px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
        border: `1px solid ${borderColor}`,
        backdropFilter: 'blur(10px)',
        position: 'relative',
        boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.3)' : '0 10px 30px rgba(0,0,0,0.05)',
      }}>
        {statusText ? (
          <p style={{
            color: mutedColor,
            fontFamily: 'Playfair Display, serif',
            fontSize: '1.5rem',
            lineHeight: 1.6,
            whiteSpace: 'pre-line',
          }}>
            {statusText}
          </p>
        ) : (
          <>
            {/* Predicted sign display */}
            <div style={{
              fontSize: '2.4rem',
              fontWeight: '600',
              color: textColor,
              fontFamily: 'Playfair Display, serif',
              lineHeight: 1.15,
              wordBreak: 'break-word',
              textAlign: 'center',
              minHeight: '84px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              padding: '0 10px',
            }}>
              {displayLabel}
            </div>

            {/* Utility Buttons Overlay */}
            <div style={{
              display: 'flex',
              gap: '12px',
              marginTop: '8px',
              marginBottom: '4px',
            }}>
              <button
                onClick={handleRefine}
                title="AI Refine (Transform to sentence)"
                style={{
                  background: 'none',
                  border: 'none',
                  color: accentColor,
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  transition: 'all 0.5s ease',
                }}
              >
                <i id="refine-wand" className="ri-magic-line" style={{ display: 'inline-block', transition: 'all 0.5s' }}></i>
              </button>

              <button
                onClick={handleSpeak}
                title="Speak text"
                style={{
                  background: 'none',
                  border: 'none',
                  color: mutedColor,
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.color = accentColor}
                onMouseOut={(e) => e.currentTarget.style.color = mutedColor}
              >
                <i className="ri-volume-up-line"></i>
              </button>

              <button
                onClick={handleCopy}
                title="Copy to clipboard"
                style={{
                  background: 'none',
                  border: 'none',
                  color: copied ? '#22c55e' : mutedColor,
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <i className={copied ? "ri-check-line" : "ri-file-copy-line"}></i>
                {copied && <span style={{ fontSize: '0.7rem' }}>Copied!</span>}
              </button>

              <button
                onClick={deleteLastLetter}
                title="Backspace (Delete last letter)"
                style={{
                  background: 'none',
                  border: 'none',
                  color: mutedColor,
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
                onMouseOut={(e) => e.currentTarget.style.color = mutedColor}
              >
                <i className="ri-backspace-line"></i>
              </button>

              <button
                onClick={clearTranscript}
                title="Clear all"
                style={{
                  background: 'none',
                  border: 'none',
                  color: mutedColor,
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
                onMouseOut={(e) => e.currentTarget.style.color = mutedColor}
              >
                <i className="ri-delete-bin-line"></i>
              </button>
            </div>

            {/* Suggestions logic */}
            {suggestions && suggestions.length > 0 && (
              <div style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap',
                justifyContent: 'center',
                marginTop: '12px',
                marginBottom: '16px',
                width: '100%',
              }}>
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => applySuggestion(s)}
                    style={{
                      padding: '6px 16px',
                      borderRadius: '20px',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      background: isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)',
                      color: isDark ? '#a5b4fc' : '#4f46e5',
                      border: `1px solid ${isDark ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = isDark ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.2)'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)'
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div style={{
              fontSize: '0.88rem',
              color: mutedColor,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              display: 'flex',
              justifyContent: 'space-between',
              width: '100%',
              marginTop: 'auto',
            }}>
              <span>Building: {buildingWord || '...'}</span>
              <span>Live Letter: {liveLetter}</span>
            </div>

            <div style={{
              fontSize: '0.8rem',
              color: mutedColor,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              borderTop: `1px solid ${borderColor}`,
              paddingTop: '12px',
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
            }}>
              <span>Model: {prediction?.modeName || 'LANDMARK_RF'}</span>
              <span>Confidence: {confidence}%</span>
            </div>

            <div style={{
              fontSize: '0.78rem',
              color: statusColor,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <span style={{ 
                width: '6px', 
                height: '6px', 
                borderRadius: '50%', 
                backgroundColor: statusColor,
                display: 'inline-block'
              }}></span>
              API: {status?.state || 'idle'}
            </div>
          </>
        )}
      </div>

    </div>
  )
}

export default TranslationText