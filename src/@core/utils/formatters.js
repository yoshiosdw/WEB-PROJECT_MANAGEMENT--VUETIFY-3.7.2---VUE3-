import { isToday } from './index'

export const avatarText = value => {
  if (!value)
    return ''
  const nameArray = value.split(' ')
  
  return nameArray.map(word => word.charAt(0).toUpperCase()).join('')
}

// TODO: Try to implement this: https://twitter.com/fireship_dev/status/1565424801216311297
export const kFormatter = num => {
  const regex = /\B(?=(\d{3})+(?!\d))/g
  
  return Math.abs(num) > 9999 ? `${Math.sign(num) * +((Math.abs(num) / 1000).toFixed(1))}k` : Math.abs(num).toFixed(0).replace(regex, ',')
}

/**
 * Format and return date in Humanize format
 * Intl docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/format
 * Intl Constructor: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat
 * @param {String} value date to format
 * @param {Intl.DateTimeFormatOptions} formatting Intl object to format with
 */
export const formatDate = (value, formatting = { month: 'short', day: 'numeric', year: 'numeric' }) => {
  if (!value)
    return value
  
  return new Intl.DateTimeFormat('en-US', formatting).format(new Date(value))
}

/**
 * Return short human friendly month representation of date
 * Can also convert date to only time if date is of today (Better UX)
 * @param {String} value date to format
 * @param {Boolean} toTimeForCurrentDay Shall convert to time if day is today/current
 */
export const formatDateToMonthShort = (value, toTimeForCurrentDay = true) => {
  const date = new Date(value)
  let formatting = { month: 'short', day: 'numeric' }
  if (toTimeForCurrentDay && isToday(date))
    formatting = { hour: 'numeric', minute: 'numeric' }
  
  return new Intl.DateTimeFormat('en-US', formatting).format(new Date(value))
}

/**
 * Create By Pamungkas
 */
export const formatTanggal = value => {
  if(!value) return ''
  const date = new Date(value)
  const day = date.getDate().toString().padStart(2, '0') // padStart untuk menambahkan leading zero pada tanggal jika diperlukan
  const month = (date.getMonth() + 1).toString().padStart(2, '0') // +1 karena bulan dimulai dari 0
  const year = date.getFullYear()

  return `${day}/${month}/${year}`
}

export const formatDateMySql = value => {
  if(!value) return ''
  const date = new Date(value)
  const day = date.getDate().toString().padStart(2, '0') // padStart untuk menambahkan leading zero pada tanggal jika diperlukan
  const month = (date.getMonth() + 1).toString().padStart(2, '0') // +1 karena bulan dimulai dari 0
  const year = date.getFullYear()

  // return `${day}/${month}/${year}`;
  return `${year}/${month}/${day}`
}

export const formatDateTimeMySql = value => {
  if (!value) return ''

  const date = new Date(value)
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')

  // Format yang diinginkan: YYYY/MM/DD HH:MM
  return `${year}/${month}/${day} ${hours}:${minutes}`
}

export const formatRibuan = value => {
  const angkaStr = value.toString()
  const [integerPart, decimalPart] = angkaStr.split('.')
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  return decimalPart ? `${formattedInteger},${decimalPart}` : formattedInteger
}

export const dateNow = () => {
  const now = new Date()
  const currentMonth = now.toLocaleString('default', { month: '2-digit' })
  const currentDate = now.toLocaleString('default', { day: '2-digit' })
  
  return `${now.getFullYear()}-${currentMonth}-${currentDate}`
}

export const rawToFormattedNumber = value => {
  // Hapus semua karakter kecuali angka, titik, dan koma
  let sanitizedValue = value.replace(/[^0-9.,]/g, "")

  // Jika ada lebih dari satu koma, hanya pertahankan yang pertama
  const commaIndex = sanitizedValue.indexOf(",")
  if (commaIndex !== -1) {
    sanitizedValue =
      sanitizedValue.slice(0, commaIndex + 1) + // Bagian sebelum dan termasuk koma pertama
      sanitizedValue.slice(commaIndex + 1).replace(/,/g, "") // Hapus koma berikutnya
  }

  // Ganti titik (.) dengan kosong dan koma (,) menjadi titik (.)
  const rawValue = sanitizedValue.replace(/\./g, "").replace(",", ".")

  // Pisahkan bagian integer dan desimal
  const [integerPart, decimalPart] = rawValue.split(".")

  // Format bagian integer dengan thousand separator
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".")

  // Gabungkan kembali integer dan desimal dengan format yang benar
  const formattedValue =
    decimalPart !== undefined
      ? `${formattedInteger},${decimalPart}`
      : formattedInteger

  return { raw: rawValue, formatted: formattedValue }
}

// export const rawToFormattedNumber = value => {
//   if (!value) return ''

//   const rawValue = value.replace(/\./g, '').replace(',', '.')

//   const [integerPart, decimalPart] = rawValue.split('.')

//   const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')

//   return decimalPart !== undefined
//     ? `${formattedInteger},${decimalPart}`
//     : formattedInteger
// }

export const getCurrentDateTimeWIB = () => {
  const now = new Date()

  // Konversi waktu ke UTC lalu tambahkan 7 jam untuk WIB
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const wibTime = new Date(utc + 7 * 3600000) // WIB = UTC + 7

  const year = wibTime.getFullYear()
  const month = (wibTime.getMonth() + 1).toString().padStart(2, '0')
  const day = wibTime.getDate().toString().padStart(2, '0')
  const hours = wibTime.getHours().toString().padStart(2, '0')
  const minutes = wibTime.getMinutes().toString().padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}
export const getCurrentDate = (dateString) => {
  const date = new Date(dateString)

  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}



