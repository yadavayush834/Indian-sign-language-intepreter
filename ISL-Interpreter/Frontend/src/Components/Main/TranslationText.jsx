import React from 'react'

const TranslationText = ({ isDark, isTranslating, prediction, status }) => {

  const textColor = isDark ? '#ffffff' : '#2d2d2d'
  const mutedColor = isDark ? '#6b7280' : '#9ca3af'
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'

  const statusText = (() => {
    if (!isTranslating) return 'Press Start Translation\nto begin.'
    if (status?.state === 'error') return `Cannot reach backend API.\n${status?.error || ''}`
    if (!prediction?.handDetected) return 'Show your hand to the camera'
    if (!prediction?.accepted) return `Low confidence (${Math.round((prediction?.confidence || 0) * 100)}%)`
    return null
  })()

  const statusColor = status?.state === 'connected' ? '#22c55e' : status?.state === 'error' ? '#ef4444' : mutedColor

  const displayLabel = prediction?.accepted ? prediction?.label : '--'
  const confidence = Math.round((prediction?.confidence || 0) * 100)

  return (
    <div style={{ width: '340px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Main display card */}
      <div style={{
        borderRadius: '16px',
        padding: '28px 24px',
        textAlign: 'center',
        minHeight: '160px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
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
              fontSize: '4rem',
              fontWeight: '600',
              color: textColor,
              fontFamily: 'Playfair Display, serif',
              lineHeight: 1.4,
              wordBreak: 'break-word',
              minHeight: '84px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {displayLabel}
            </div>

            <div style={{
              fontSize: '0.8rem',
              color: mutedColor,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              borderTop: `1px solid ${borderColor}`,
              paddingTop: '10px',
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
            }}>
              API: {status?.state || 'idle'}
            </div>
          </>
        )}
      </div>


    </div>
  )
}

export default TranslationText