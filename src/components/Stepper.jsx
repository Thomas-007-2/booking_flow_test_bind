import React from 'react'
import { useBooking } from '../context/BookingContext'
import { MapPin, Timer, CalendarDays, Clock3, Bike, ShoppingCart, CheckCircle2 } from 'lucide-react'
import classNames from 'classnames'

const ALL_STEPS = [
  { id: 0, label: 'Location', icon: MapPin },
  { id: 1, label: 'Timing', icon: Timer },
  { id: 2, label: 'Duration', icon: Clock3 },
  { id: 3, label: 'Start Date', icon: CalendarDays },
  { id: 4, label: 'Start Time', icon: Clock3 },
  { id: 5, label: 'Products', icon: Bike },
  { id: 6, label: 'Checkout', icon: ShoppingCart },
  { id: 7, label: 'Confirmed', icon: CheckCircle2 },
]

export default function Stepper() {
  const { state, setStep } = useBooking()
  const containerRef = React.useRef(null)
  const itemRefs = React.useRef({})
  const animRef = React.useRef(null)
  const lastWidthRef = React.useRef(0)
  const debounceRef = React.useRef(null)

  const visibleSteps = state.timing === 'immediate'
    ? ALL_STEPS.filter(s => ![3, 4].includes(s.id))
    : ALL_STEPS

  const registerRef = (id) => (el) => {
    if (el) itemRefs.current[id] = el
    else delete itemRefs.current[id]
  }

  const stopAnimation = React.useCallback(() => {
    if (animRef.current) {
      cancelAnimationFrame(animRef.current)
      animRef.current = null
    }
  }, [])

  function isMobileViewport() {
    if (typeof window === 'undefined' || !window.matchMedia) return true
    return window.matchMedia('(max-width: 1023px)').matches
  }

  function prefersReducedMotion() {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  function smoothScrollTo(c, to, duration = 700) {
    stopAnimation()
    if (duration <= 0) {
      c.scrollLeft = Math.round(to)
      return
    }
    const start = c.scrollLeft
    const change = to - start
    const startTime = performance.now()
    const easeInOutCubic = (t) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

    const step = (now) => {
      const elapsed = now - startTime
      const t = Math.min(1, elapsed / duration)
      c.scrollLeft = Math.round(start + change * easeInOutCubic(t))
      if (t < 1) {
        animRef.current = requestAnimationFrame(step)
      } else {
        animRef.current = null
      }
    }
    animRef.current = requestAnimationFrame(step)
  }

  function centerActive() {
    const c = containerRef.current
    if (!c) return
    const el = itemRefs.current[state.step]
    if (!el) return

    // Mobile: prefer native snapping/scrollIntoView for stability during address bar show/hide
    if (isMobileViewport()) {
      try {
        el.scrollIntoView({
          behavior: prefersReducedMotion() ? 'auto' : 'smooth',
          block: 'nearest',
          inline: 'center'
        })
        return
      } catch {
        // fall through to manual
      }
    }

    // Manual centering (desktop/fallback)
    const elCenter = el.offsetLeft + el.offsetWidth / 2
    const max = c.scrollWidth - c.clientWidth
    const target = Math.max(0, Math.min(elCenter - c.clientWidth / 2, max))
    const targetRounded = Math.round(target)

    // Skip tiny adjustments
    if (Math.abs(targetRounded - c.scrollLeft) < 4) return

    if (!isMobileViewport() || prefersReducedMotion()) {
      stopAnimation()
      c.scrollLeft = targetRounded
      return
    }
    smoothScrollTo(c, targetRounded, 700)
  }

  function queueCenter(delay = 120) {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
    debounceRef.current = setTimeout(() => {
      requestAnimationFrame(() => centerActive())
      debounceRef.current = null
    }, delay)
  }

  // Center when the step or visible step set changes
  React.useLayoutEffect(() => {
    const id = requestAnimationFrame(() => centerActive())
    return () => cancelAnimationFrame(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.step, state.timing, visibleSteps.length])

  // Debounced ResizeObserver to avoid thrashing during mobile UI chrome show/hide
  React.useEffect(() => {
    const c = containerRef.current
    if (!c || typeof ResizeObserver === 'undefined') return
    lastWidthRef.current = Math.round(c.clientWidth)
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const width = Math.round(entry.contentRect.width)
      const prev = lastWidthRef.current || 0
      if (Number.isFinite(width) && Math.abs(width - prev) >= 2) {
        lastWidthRef.current = width
        queueCenter(150)
      }
    })
    ro.observe(c)
    return () => ro.disconnect()
  }, [])

  // Orientation change (keep this, but debounced)
  React.useEffect(() => {
    const onOrientation = () => queueCenter(220)
    window.addEventListener('orientationchange', onOrientation)
    return () => window.removeEventListener('orientationchange', onOrientation)
  }, [])

  return (
    <div
      ref={containerRef}
      className="overflow-x-auto overscroll-x-contain -mx-4 px-4 snap-x snap-mandatory"
      style={{ WebkitOverflowScrolling: 'touch' }}
      aria-label="Booking steps"
    >
      <ol className="flex items-center gap-2 min-w-[720px] py-1">
        {visibleSteps.map((s, idx) => {
          const Icon = s.icon
          const active = state.step === s.id
          const completed = state.step > s.id
          const clickable = s.id < state.step
          return (
            <li key={s.label} className="flex items-center snap-center">
              <button
                ref={registerRef(s.id)}
                onClick={() => clickable && setStep(s.id)}
                disabled={!clickable}
                aria-current={active ? 'step' : undefined}
                className={classNames(
                  'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
                  active
                    ? 'bg-brand text-white'
                    : completed
                      ? 'bg-green-100 text-green-700'
                      : 'bg-slate-100 text-slate-700',
                  clickable ? 'hover:opacity-90' : 'cursor-default'
                )}
                title={s.label}
              >
                <Icon size={18} />
                <span className="text-sm whitespace-nowrap">{s.label}</span>
              </button>
              {idx < visibleSteps.length - 1 && <span className="mx-2 h-px w-8 bg-slate-300" />}
            </li>
          )
        })}
      </ol>
    </div>
  )
}