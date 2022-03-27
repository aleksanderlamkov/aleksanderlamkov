/**
 * Получение кратности исходя из заданной пропорции A к B
 * @param a{Number} - первое число
 * @param b{Number} - второе число
 * @param fixed{Number=} - максимальное число знаков после запятой
 */
const ratio = (a, b, fixed = 3) => {
  return (a / b).toFixed(fixed)
}

/**
 * Получение процента исходя из заданной пропорции A к B
 * @param a{Number} - первое число
 * @param b{Number} - второе число
 * @param fixed{Number=} - максимальное число знаков после запятой
 */
const percent = (a, b, fixed = 3) => {
  return (a / b * 100).toFixed(fixed) + '%'
}

module.exports = {
  ratio, percent
}
