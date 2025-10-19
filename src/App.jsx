import React, { useEffect, useState, useRef } from 'react'
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
    import { Bike, Loader2, MapPin, Clock, Calendar, Shield } from 'lucide-react'
    import { isIOSSafari } from './lib/device'

    function StepsRouter() {
      const { state } = useBooking()
      const { step } = state

      switch (step) {
        case 0: return <LocationStep />
        case 1: return <TimingStep />
        case 2: return <DurationStep />
        case 3: return <DateStep />
        case 4: return <TimeStep />
        case 5: return <ProductsStep />
        case 6: return <CheckoutStep />
        case 7: return <Confirmation />
        default: return null
      }
    }

    function Shell() {
      const { state, merchant } = useBooking()
      const iossafari = isIOSSafari()
      const stepsColRef = useRef(null)

      useEffect(() => {
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
        <div className="min-h-screen pattern-bg">
          {/* Enhanced Header */}
          <header className="glass sticky top-0 z-30 border-b border-slate-200/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {merchant?.logo_url ? (
                    <div className="relative">
                      <img 
                        src={merchant.logo_url} 
                        alt={`${merchant.name} logo`} 
                        className="h-12 w-12 sm:h-14 sm:w-14 object-contain rounded-xl shadow-lg"
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-2xl gradient-bg text-white shadow-lg">
                      <Bike size={24} />
                    </div>
                  )}
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                      {merchant?.name || 'Bike Rental Booking'}
                    </h1>
                    <p className="text-sm text-slate-600 mt-0.5">
                      {merchant?.headline || 'Premium Bike Rentals'}
                    </p>
                  </div>
                </div>
                
                {/* Trust badges */}
                <div className="hidden sm:flex items-center gap-6">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Shield size={16} className="text-green-600" />
                    <span>Secure Booking</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock size={16} className="text-blue-600" />
                    <span>Instant Confirmation</span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Hero Section for First Step */}
          {state.step === 0 && (
            <div className="gradient-bg text-white py-12 sm:py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                    Discover the Perfect Ride
                  </h2>
                  <p className="text-lg sm:text-xl opacity-90 max-w-2xl mx-auto">
                    Choose from our premium selection of bikes and explore the beautiful surroundings with confidence
                  </p>
                  <div className="flex justify-center gap-8 mt-8">
                    <div className="flex items-center gap-2">
                      <MapPin size={20} />
                      <span>2 Locations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={20} />
                      <span>Flexible Dates</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bike size={20} />
                      <span>Premium Bikes</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8 fade-in">
              <Stepper />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className={`${isProductsStep ? "lg:col-span-3" : "lg:col-span-2"}`} ref={stepsColRef}>
                <div className="fade-in">
                  <StepsRouter />
                </div>
              </div>
              
              <div className={`${isProductsStep ? "hidden" : "hidden lg:block lg:col-span-1"}`}>
                <div className="sticky top-24 fade-in">
                  <SummarySidebar />
                </div>
              </div>
            </div>
          </main>

          {/* Enhanced Footer */}
          <footer className="bg-slate-900 text-white py-12 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">About {merchant?.name || 'Bike Rental'}</h3>
                  <p className="text-slate-400 text-sm">
                    Your trusted partner for premium bike rentals. Experience the freedom of cycling with our top-quality fleet.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                  <ul className="space-y-2 text-sm text-slate-400">
                    <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Support</h3>
                  <p className="text-slate-400 text-sm">
                    Need help? Reach out to our customer support team for assistance with your booking.
                  </p>
                </div>
              </div>
              <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-400">
                <p>&copy;{new Date().getFullYear()} {merchant?.name || 'Bike Rental'}. All rights reserved.</p>
              </div>
            </div>
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
        return (
          <div className="min-h-screen pattern-bg flex items-center justify-center p-4">
            <div className="card p-8 max-w-lg w-full text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield size={32} className="text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Oops! Something went wrong</h2>
              <p className="text-slate-600">{error}</p>
            </div>
          </div>
        )
      }

      if (state.loading) {
        return (
          <div className="min-h-screen pattern-bg flex flex-col items-center justify-center">
            <div className="relative">
              <Loader2 size={48} className="animate-spin text-blue-600" />
              <div className="absolute inset-0 animate-ping">
                <div className="w-12 h-12 bg-blue-600/20 rounded-full"></div>
              </div>
            </div>
            <p className="mt-4 text-lg font-medium text-slate-700">Loading booking engine...</p>
            <p className="text-sm text-slate-500 mt-2">Preparing your premium rental experience</p>
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