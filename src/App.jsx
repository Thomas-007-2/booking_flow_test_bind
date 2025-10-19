import React, { useEffect, useState } from 'react'
import { BookingProvider, useBooking } from './context/BookingContext'
import Stepper from './components/Stepper'
import SummarySidebar from './components/SummarySidebar'
import LocationStep from './steps/LocationStep'
import TimingStep from './steps/TimingStep'
import DurationStep from './steps/DurationStep'
import DateStep from './steps/DateStep'
import TimeStep from './steps/TimeStep'
import ProductsStep from './steps/ProductsStep'
import CheckoutStep from './steps/CheckoutStep'
import Confirmation from './steps/Confirmation'
import { Bike, Loader2 } from 'lucide-react'
import { isIOSSafari } from './lib/device'

function StepsRouter() {
  const { state } = useBooking()
  const { step, timing } = state

  const screens = React.useMemo(() => {
    return [
      <LocationStep key="s0" />,
      <TimingStep key="s1" />,
      <DurationStep key="s2" />,
      timing === 'reservation' ? <DateStep key="s3" /> : <div key="s3" className="card p-6">This step is skipped for immediate start.</div>,
      <TimeStep key="s4" />,
      <ProductsStep key="s5" />,
      <CheckoutStep key="s6" />,
      <Confirmation key="s7" />,
    ]
  }, [timing])

  return screens[step] || null
}

function Shell() {
  const { state, merchant } = useBooking()
  const iossafari = isIOSSafari()
  const stepsColRef = React.useRef(null)

  React.useEffect(() => {
    const isMobile = () => {
      if (typeof window === 'undefined' || !window.matchMedia) return true
      return window.matchMedia('(max-width: 1023px)').matches
    }
    if (!isMobile()) return

    const topTarget = 0
    if (iossafari) {
      window.scrollTo(0, topTarget)
    } else {
      try {
        window.scrollTo({ top: topTarget, behavior: 'smooth' })
      } catch {
        window.scrollTo(0, topTarget)
      }
    }
  }, [state.step, iossafari])

  const isProductsStep = state.step === 5

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          {merchant?.logo_url ? (
            <img src={merchant.logo_url} alt={`${merchant.name} logo`} className="h-10 w-10 object-contain rounded-lg" />
          ) : (
            <div className="p-2 rounded-lg bg-brand text-white">
              <Bike size={22} />
            </div>
          )}
          <div>
            <h1 className="text-xl font-semibold">{merchant?.name || 'Bike Rental Booking'}</h1>
            <p className="text-sm text-slate-500">{merchant?.headline || '...'}</p>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6">
          <Stepper />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div
            className={isProductsStep ? "lg:col-span-3" : "lg:col-span-2"}
            ref={stepsColRef}
          >
            <StepsRouter />
          </div>
          <div className={isProductsStep ? "hidden" : "hidden lg:block lg:col-span-1"}>
            <SummarySidebar />
          </div>
        </div>
      </main>
      <footer className="py-8 text-center text-sm text-slate-500">
        &copy; {new Date().getFullYear()} {merchant?.name || 'Bike Rental'}. All rights reserved.
      </footer>
    </div>
  )
}

function AppContainer() {
  const { loadInitialData, state } = useBooking()
  const [error, setError] = useState(null)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const merchantId = urlParams.get('merchant');

    if (!merchantId) {
      setError("Merchant ID is missing. Please provide a 'merchant' query parameter in the URL.");
      return;
    }

    loadInitialData(merchantId).catch(err => {
      console.error("Failed to load initial data:", err)
      setError("Could not load booking information. Please check the merchant ID or your connection.")
    })
  }, [loadInitialData])

  if (error) {
    return <div className="h-full flex items-center justify-center p-4 bg-red-50 text-red-700">{error}</div>
  }

  if (state.loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-600">
        <Loader2 size={32} className="animate-spin" />
        <p>Loading booking engine...</p>
      </div>
    )
  }

  return <Shell />
}

export default function App() {
  return (
    <BookingProvider>
      <AppContainer />
    </BookingProvider>
  )
}