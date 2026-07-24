import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Home } from 'lucide-react'

/**
 * iPhone-style floating back/home button.
 * Always visible but translucent (opacity 0.3).
 * Becomes fully opaque on touch/hover, fades back after 1.5s of no interaction.
 */
export function FloatingBackHome() {
  const navigate = useNavigate()
  const [active, setActive] = useState(false)
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const activate = useCallback(() => {
    setActive(true)
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    fadeTimerRef.current = setTimeout(() => setActive(false), 1500)
  }, [])

  const handleBack = () => {
    activate()
    navigate(-1)
  }

  const handleHome = () => {
    activate()
    navigate('/my-schedule', { replace: true })
  }

  return (
    <div
      className="fixed top-[72px] left-3 z-50 flex items-center gap-0.5 rounded-full px-1 py-1 shadow-lg transition-all duration-300 pointer-events-auto"
      style={{
        opacity: active ? 1 : 0.3,
        background: active
          ? 'rgba(255, 255, 255, 0.95)'
          : 'rgba(255, 255, 255, 0.5)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: active
          ? '1px solid rgba(134, 78, 90, 0.3)'
          : '1px solid rgba(200, 200, 200, 0.3)',
      }}
      onPointerDown={activate}
      onPointerEnter={activate}
      onTouchStart={activate}
    >
      <button
        onClick={handleBack}
        className="p-2 rounded-full active:bg-gray-100 transition-colors"
        aria-label="Back"
      >
        <ChevronLeft size={18} className={active ? 'text-[#864e5a]' : 'text-gray-400'} />
      </button>
      <div className="w-px h-4 bg-gray-300" />
      <button
        onClick={handleHome}
        className="p-2 rounded-full active:bg-gray-100 transition-colors"
        aria-label="Home"
      >
        <Home size={16} className={active ? 'text-[#864e5a]' : 'text-gray-400'} />
      </button>
    </div>
  )
}
