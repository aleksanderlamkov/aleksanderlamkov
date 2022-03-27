
/**
 * Получает номер с нулевым префиксом, если он менее 10
 * @param number{Number} - исходный номер
 * @return Number
 */
export const getNumberWithZeroPrefix = (number = 0) => {
  return (number < 10) ? '0' + number : number;
}
