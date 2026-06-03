/** Unicode letters, spaces, hyphens */
const PERSON_NAME_RE = /^[\p{L}\s\-]+$/u

export function formatPersonName(value) {
  const trimmed = value.trim().replace(/\s+/g, ' ')
  const parts = trimmed.split(/([\s\-])/)
  return parts
    .map((part) => {
      if (part === ' ' || part === '-') return part
      if (!part) return ''
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
    })
    .join('')
}

/** Live first-name typing: capitalize first letter of each word segment. */
export function formatFirstNameLive(value) {
  if (!value) return ''
  return value.replace(/(^|[\s\-])([\p{L}])/gu, (_, sep, ch) => sep + ch.toUpperCase())
}

export function validatePersonName(value, label) {
  const formatted = formatPersonName(value)
  if (!formatted) return { ok: false, error: `${label} is required.` }
  if (formatted.length < 2 || formatted.length > 50) {
    return { ok: false, error: `${label} must be 2–50 characters.` }
  }
  if (!PERSON_NAME_RE.test(formatted)) {
    return { ok: false, error: `${label}: letters, spaces, and hyphens only.` }
  }
  return { ok: true, value: formatted }
}

export function validateEmail(value) {
  const email = value.trim().toLowerCase()
  if (!email) return { ok: false, error: 'Email is required.' }
  if (email.length > 100) return { ok: false, error: 'Email must not exceed 100 characters.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email)) {
    return { ok: false, error: 'Enter a valid email (e.g. name@company.com).' }
  }
  return { ok: true, value: email }
}

/** Format digits as 09XX XXX XXX (max 11 digits; e.g. 0917 555 0123). */
function formatLocalDigits(digits) {
  let d = digits
  if (d.length > 0 && !d.startsWith('0')) {
    d = `0${d}`
  }
  d = d.slice(0, 11)

  if (d.length === 0) return ''
  if (d.length <= 4) return d
  if (d.length <= 7) return `${d.slice(0, 4)} ${d.slice(4)}`
  return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`
}

/** Live input: 09XX XXX XXX only */
export function formatPhoneInputLive(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  return formatLocalDigits(digits)
}

export function normalizePhilippineMobile(value) {
  const digits = value.replace(/\D/g, '')
  if (value.includes('+')) return ''
  if (/^09\d{9}$/.test(digits)) return digits
  if (/^639\d{9}$/.test(digits)) return `0${digits.slice(2)}`
  return digits
}

export function formatPhilippineMobileDisplay(stored) {
  const digits = normalizePhilippineMobile(stored)
  if (!/^09\d{9}$/.test(digits)) return stored
  return formatLocalDigits(digits)
}

export function validatePhilippineMobile(value) {
  const normalized = normalizePhilippineMobile(value)
  if (!normalized) return { ok: false, error: 'Contact number is required.' }
  if (!/^09\d{9}$/.test(normalized)) {
    return { ok: false, error: 'Use 09XXXXXXXXX (11 digits, format 09XX XXX XXX).' }
  }
  return { ok: true, value: normalized }
}

export function validateCustomerForm(form) {
  const errors = {}
  const first = validatePersonName(form.first_name, 'First name')
  if (!first.ok) errors.first_name = [first.error]
  const last = validatePersonName(form.last_name, 'Last name')
  if (!last.ok) errors.last_name = [last.error]
  const email = validateEmail(form.email)
  if (!email.ok) errors.email = [email.error]
  const phone = validatePhilippineMobile(form.contact_number)
  if (!phone.ok) errors.contact_number = [phone.error]

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors }
  }

  return {
    ok: true,
    data: {
      first_name: first.value,
      last_name: last.value,
      email: email.value,
      contact_number: phone.value,
    },
  }
}
