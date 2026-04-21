import { useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_SIGN_API_URL || 'http://localhost:8000'

const buildStatus = (state, error = '') => ({ state, error })

const useSignInference = ({ videoRef, enabled }) => {
  const [prediction, setPrediction] = useState({
    label: '',
    confidence: 0,
    handDetected: false,
    accepted: false,
    modeName: 'LANDMARK_RF'
  })
  const [status, setStatus] = useState(buildStatus('idle'))

  const canvasRef = useRef(null)
  const inFlightRef = useRef(false)

  const intervalMs = useMemo(() => 250, [])

  useEffect(() => {
    if (!enabled) {
      setPrediction({
        label: '',
        confidence: 0,
        handDetected: false,
        accepted: false,
        modeName: 'LANDMARK_RF'
      })
      setStatus(buildStatus('idle'))
      return
    }

    let isCancelled = false

    const tick = async () => {
      const videoEl = videoRef?.current
      if (!videoEl || videoEl.readyState < 2 || inFlightRef.current) {
        return
      }

      inFlightRef.current = true

      try {
        if (!canvasRef.current) canvasRef.current = document.createElement('canvas')
        const canvas = canvasRef.current

        canvas.width = videoEl.videoWidth || 640
        canvas.height = videoEl.videoHeight || 480

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          throw new Error('Unable to initialize canvas context')
        }

        // Mirror the frame so backend preprocessing remains aligned with front camera UX.
        ctx.save()
        ctx.scale(-1, 1)
        ctx.drawImage(videoEl, -canvas.width, 0, canvas.width, canvas.height)
        ctx.restore()

        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.72))
        if (!blob) {
          throw new Error('Failed to capture frame')
        }

        const form = new FormData()
        form.append('image', blob, 'frame.jpg')
        form.append('threshold', '0.5')

        const { data } = await axios.post(`${API_BASE_URL}/predict`, form, {
          timeout: 4000,
          headers: { 'Content-Type': 'multipart/form-data' }
        })

        if (isCancelled) return

        setPrediction({
          label: data?.label || '',
          confidence: Number(data?.confidence || 0),
          handDetected: Boolean(data?.handDetected),
          accepted: Boolean(data?.accepted),
          modeName: data?.mode || 'LANDMARK_RF'
        })
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
      inFlightRef.current = false
    }
  }, [enabled, intervalMs, videoRef])

  return { prediction, status }
}

export default useSignInference
