import abbreviate from 'number-abbreviate'

export function abbreviatedNumber(number = 0, decimals = 1) {
  if (number < 10000) {
    return Number(number).toString()
  }
  return abbreviate(number, decimals)
}
