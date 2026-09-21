export function tlv(tag, value) {
  const len = String(value.length).padStart(2, '0')
  return `${tag}${len}${value}`
}

export function crc16ccitt(payload) {
  let crc = 0xffff
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

export function buildTransferQR({ cuit, cbu, name, city }) {
  const cuitClean = (cuit || '').replace(/\D/g, '')
  const cbuClean = (cbu || '').replace(/\D/g, '')
  const nameClean = (name || 'PC AFONDO').trim().slice(0, 25)
  const cityClean = (city || '').trim().slice(0, 15)

  let payload =
    tlv('00', '01') +
    tlv('01', '11') +
    tlv('50', cuitClean) +
    tlv('51', cbuClean) +
    tlv('52', '0000') +
    tlv('53', '032') +
    tlv('58', 'AR') +
    tlv('59', nameClean)
  if (cityClean) payload += tlv('60', cityClean)

  return payload + '6304' + crc16ccitt(payload)
}

export function isValidCuit(cuit) {
  const digits = (cuit || '').replace(/\D/g, '')
  if (!/^\d{11}$/.test(digits)) return false
  const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]
  let acc = 0
  for (let i = 0; i < 10; i++) acc += Number(digits[i]) * weights[i]
  const verifier = 11 - (acc % 11)
  const expected = verifier === 11 ? 0 : verifier === 10 ? 9 : verifier
  return expected === Number(digits[10])
}

export function isValidCbu(cbu) {
  const digits = (cbu || '').replace(/\D/g, '')
  return /^\d{22}$/.test(digits)
}