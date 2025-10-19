export function required(v) {
  return !!(v && String(v).trim())
}

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validatePhone(phone) {
  return /^[+]?[\d\s().-]{7,}$/.test(phone)
}