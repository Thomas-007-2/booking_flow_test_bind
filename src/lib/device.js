export function isIOS() {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || ''
  const platform = navigator.platform || ''
  const iOS = /iPhone|iPad|iPod/.test(ua) || /iP(hone|od|ad)/.test(platform)
  const iPadOS13Plus = /Mac/.test(platform) && typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 1
  return iOS || iPadOS13Plus
}

export function isSafari() {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || ''
  const vendor = navigator.vendor || ''
  const isSafariUA = /Safari/.test(ua) && !/Chrome|CriOS|FxiOS|OPR|OPiOS|Edg|EdgiOS/.test(ua)
  const isAppleVendor = /Apple/.test(vendor)
  return isSafariUA && isAppleVendor
}

export function isIOSSafari() {
  return isIOS() && isSafari()
}