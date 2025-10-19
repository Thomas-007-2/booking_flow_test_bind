export async function pay({ items, customer, bookingSummary }) {
  // If no backend is configured, simulate a successful payment in the prototype.
  const endpoint = import.meta.env.VITE_CHECKOUT_SESSION_URL
  if (!endpoint) {
    await new Promise(r => setTimeout(r, 1000))
    return { ok: true, reference: makeRef() }
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, customer, booking: bookingSummary })
    })
    if (!res.ok) throw new Error('Failed to create checkout session')
    const data = await res.json()

    // Preferred: backend returns { url } from Stripe's session.url
    if (data && typeof data.url === 'string') {
      window.location.href = data.url
      return { ok: true, redirecting: true }
    }

    // If no URL returned, we cannot redirect from the frontend without stripe-js.
    return { ok: false, error: 'Checkout endpoint did not return a URL. Expected { url } in response.' }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

function makeRef() {
  const ts = Date.now().toString(36).slice(-6).toUpperCase()
  return `BR-${ts}-${Math.floor(Math.random() * 899 + 100)}`
}