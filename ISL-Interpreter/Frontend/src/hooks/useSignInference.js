import { useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_SIGN_API_URL || 'http://localhost:8000'
const HIGH_CONFIDENCE_THRESHOLD = 0.5
const STABLE_STREAK_REQUIRED = 3
const LETTER_RESET_DELAY_MS = 700

const buildStatus = (state, error = '') => ({ state, error })

const buildWordState = () => ({
  currentWord: '',
  transcript: '',
  lastCommittedWord: '',
  liveLetter: '',
  liveLetterConfidence: 0,
})

const useSignInference = ({ videoRef, enabled, mode = 'static' }) => {
  const [prediction, setPrediction] = useState({
    label: '',
    confidence: 0,
    handDetected: false,
    accepted: false,
    modeName: 'LANDMARK_RF'
  })
  const [status, setStatus] = useState(buildStatus('idle'))
  const [wordState, setWordState] = useState(buildWordState())
  const [suggestions, setSuggestions] = useState([])

  const canvasRef = useRef(null)
  const inFlightRef = useRef(false)
  const stableCandidateRef = useRef({ label: '', streak: 0 })
  const letterBufferRef = useRef([])
  const sequenceBufferRef = useRef([])
  const lastAcceptedAtRef = useRef(0)
  const lastCommittedLetterRef = useRef('')
  const manualSpaceActionRef = useRef(() => {})

  const intervalMs = useMemo(() => (mode === 'dynamic' ? 100 : 250), [mode])

  // Need a stable way to call applySuggestion inside the effect
  const applySuggestionRef = useRef(null)

  useEffect(() => {
    const resetWordBuilder = () => {
      stableCandidateRef.current = { label: '', streak: 0 }
      letterBufferRef.current = []
      sequenceBufferRef.current = []
      lastAcceptedAtRef.current = 0
      lastCommittedLetterRef.current = ''
      setWordState(buildWordState())
    }

    const commitCurrentWord = ({ forceSpace = false } = {}) => {
      const committedWord = letterBufferRef.current.join('')
      letterBufferRef.current = []

      setWordState(prev => {
        let nextTranscript = prev.transcript || ''
        if (committedWord) nextTranscript += committedWord
        if (forceSpace) nextTranscript += ' '

        return {
          ...prev,
          currentWord: '',
          lastCommittedWord: committedWord || prev.lastCommittedWord,
          transcript: nextTranscript,
        }
      })
    }

    manualSpaceActionRef.current = () => {
      commitCurrentWord({ forceSpace: true })
      stableCandidateRef.current = { label: '', streak: 0 }
      lastCommittedLetterRef.current = ''
      setWordState(prev => ({ ...prev, liveLetter: '', liveLetterConfidence: 0 }))
    }

    if (!enabled) {
      setPrediction({
        label: '',
        confidence: 0,
        handDetected: false,
        accepted: false,
        modeName: mode === 'dynamic' ? 'DYNAMIC_LSTM' : 'LANDMARK_RF'
      })
      setStatus(buildStatus('idle'))
      resetWordBuilder()
      return
    }

    let isCancelled = false

    const tick = async () => {
      const videoEl = videoRef?.current
      if (!videoEl || videoEl.readyState < 2 || inFlightRef.current) return

      inFlightRef.current = true

      try {
        if (!canvasRef.current) canvasRef.current = document.createElement('canvas')
        const canvas = canvasRef.current
        canvas.width = videoEl.videoWidth || 640
        canvas.height = videoEl.videoHeight || 480

        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('Unable to initialize canvas context')

        ctx.save()
        ctx.scale(-1, 1)
        ctx.drawImage(videoEl, -canvas.width, 0, canvas.width, canvas.height)
        ctx.restore()

        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.72))
        if (!blob) throw new Error('Failed to capture frame')

        const form = new FormData()
        form.append('image', blob, 'frame.jpg')
        form.append('threshold', String(HIGH_CONFIDENCE_THRESHOLD))

        const { data } = await axios.post(`${API_BASE_URL}/predict`, form, {
          timeout: 4000,
          headers: { 'Content-Type': 'multipart/form-data' }
        })

        if (isCancelled) return

        const landmarks = data?.landmarks || []
        const handDetected = Boolean(data?.handDetected)

        if (mode === 'static') {
          setPrediction({
            label: data?.label || '',
            confidence: Number(data?.confidence || 0),
            handDetected: handDetected,
            accepted: Boolean(data?.accepted),
            modeName: data?.mode || 'LANDMARK_RF'
          })

          const label = String(data?.label || '')
          const confidence = Number(data?.confidence || 0)
          const accepted = Boolean(data?.accepted)

          if (handDetected && accepted && confidence >= HIGH_CONFIDENCE_THRESHOLD && label) {
            lastAcceptedAtRef.current = Date.now()
            if (stableCandidateRef.current.label === label) {
              stableCandidateRef.current.streak += 1
            } else {
              stableCandidateRef.current = { label, streak: 1 }
            }
            setWordState(prev => ({ ...prev, liveLetter: label, liveLetterConfidence: confidence }))

            if (stableCandidateRef.current.streak >= STABLE_STREAK_REQUIRED && lastCommittedLetterRef.current !== label) {
              letterBufferRef.current.push(label)
              lastCommittedLetterRef.current = label
              setWordState(prev => ({ ...prev, currentWord: letterBufferRef.current.join('') }))
            }
          } else {
            stableCandidateRef.current = { label: '', streak: 0 }
            setWordState(prev => ({ ...prev, liveLetter: '', liveLetterConfidence: 0 }))
            if (Date.now() - lastAcceptedAtRef.current >= LETTER_RESET_DELAY_MS) {
              lastCommittedLetterRef.current = ''
            }
          }
        } else {
          // Dynamic Mode
          if (handDetected && landmarks.length === 126) {
            sequenceBufferRef.current.push(landmarks)
            if (sequenceBufferRef.current.length > 30) sequenceBufferRef.current.shift()
          } else {
            sequenceBufferRef.current = []
          }

          if (sequenceBufferRef.current.length === 30) {
            const seqForm = new FormData()
            seqForm.append('sequences', JSON.stringify(sequenceBufferRef.current))
            seqForm.append('threshold', '0.7')

            const seqRes = await axios.post(`${API_BASE_URL}/predict_sequence`, seqForm)
            const seqData = seqRes.data

            if (seqData.label && seqData.accepted) {
              setPrediction({
                label: seqData.label,
                confidence: seqData.confidence,
                handDetected: true,
                accepted: true,
                modeName: 'DYNAMIC_LSTM'
              })

              if (lastCommittedLetterRef.current !== seqData.label) {
                if (applySuggestionRef.current) applySuggestionRef.current(seqData.label)
                lastCommittedLetterRef.current = seqData.label
                lastAcceptedAtRef.current = Date.now()
                sequenceBufferRef.current = []
              }
            } else {
              setPrediction({
                label: '',
                confidence: seqData.confidence || 0,
                handDetected: true,
                accepted: false,
                modeName: 'DYNAMIC_LSTM'
              })
            }
          } else {
            setPrediction({
              label: 'Recording...',
              confidence: sequenceBufferRef.current.length / 30,
              handDetected: handDetected,
              accepted: false,
              modeName: 'DYNAMIC_LSTM'
            })
          }

          if (Date.now() - lastAcceptedAtRef.current >= 2000) lastCommittedLetterRef.current = ''
        }

        setStatus(buildStatus('connected'))
      } catch (error) {
        if (!isCancelled) {
          const message = error?.response?.data?.detail || error?.message || 'Inference request failed'
          setStatus(buildStatus('error', message))
        }
      } finally {
        inFlightRef.current = false
      }
    }

    const id = window.setInterval(tick, intervalMs)
    return () => {
      isCancelled = true
      window.clearInterval(id)
      manualSpaceActionRef.current = () => {}
      inFlightRef.current = false
    }
  }, [enabled, intervalMs, videoRef, mode])

  const deleteLastLetter = () => {
    if (!enabled) return
    setWordState(prev => {
      if (prev.currentWord) {
        const nextWord = prev.currentWord.slice(0, -1)
        letterBufferRef.current = nextWord.split('')
        return { ...prev, currentWord: nextWord }
      }
      return prev
    })
    // Reset stable candidate to prevent immediate re-addition of the same letter
    stableCandidateRef.current = { label: '', streak: 0 }
    lastCommittedLetterRef.current = ''
  }

  const clearTranscript = () => {
    letterBufferRef.current = []
    stableCandidateRef.current = { label: '', streak: 0 }
    lastCommittedLetterRef.current = ''
    setWordState(buildWordState())
    setSuggestions([])
  }

  // Fetch suggestions when word state changes
  useEffect(() => {
    if (!enabled || (!wordState.currentWord && !wordState.transcript)) {
      setSuggestions([])
      return
    }

    const timer = setTimeout(async () => {
      try {
        const form = new FormData()
        form.append('transcript', wordState.transcript || '')
        form.append('currentWord', wordState.currentWord || '')

        console.log('[useSignInference] Requesting suggestions for:', wordState.currentWord)
        const { data } = await axios.post(`${API_BASE_URL}/suggest`, form, { timeout: 3000 })
        console.log('[useSignInference] Received suggestions:', data.suggestions)
        if (data.suggestions) {
          setSuggestions(data.suggestions)
        }
      } catch (error) {
        console.error('[useSignInference] Suggestion error:', error)
      }
    }, 600) // Debounce suggestion calls

    return () => clearTimeout(timer)
  }, [wordState.currentWord, wordState.transcript, enabled])

  const addSpace = () => {
    if (!enabled) return
    manualSpaceActionRef.current()
  }

  const applySuggestion = (word) => {
    if (!enabled) return
    
    setWordState(prev => {
      let nextTranscript = prev.transcript || ''
      if (nextTranscript && !nextTranscript.endsWith(' ')) nextTranscript += ' '
      nextTranscript += word + ' '
      
      return {
        ...prev,
        currentWord: '',
        transcript: nextTranscript,
      }
    })

    letterBufferRef.current = []
    stableCandidateRef.current = { label: '', streak: 0 }
    lastCommittedLetterRef.current = ''
    setSuggestions([])
  }

  // Sync ref
  useEffect(() => {
    applySuggestionRef.current = applySuggestion
  }, [applySuggestion])

  const refineTranscript = async () => {
    if (!enabled) return
    const text = (wordState.transcript || '') + (wordState.currentWord || '')
    if (!text) return

    setStatus(buildStatus('connecting'))
    try {
      const form = new FormData()
      form.append('transcript', text)
      const { data } = await axios.post(`${API_BASE_URL}/refine`, form)
      
      if (data.refined) {
        setWordState(prev => ({
          ...prev,
          transcript: data.refined,
          currentWord: '',
        }))
        letterBufferRef.current = []
      }
      setStatus(buildStatus('connected'))
    } catch (error) {
      console.error('[Refine Error]', error)
      setStatus(buildStatus('error', 'Refine failed'))
    }
  }

  return { prediction, status, wordState, suggestions, addSpace, applySuggestion, deleteLastLetter, clearTranscript, refineTranscript }
}

export default useSignInference
