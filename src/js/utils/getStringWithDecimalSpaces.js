
/**
 * Получение из числа строки с тысячным форматированием
 * @param number{Number} - число
 * @param decimalSeparator{String=} - разделитель тысячных
 * @return String
 */
export const getStringWithDecimalSpaces = (number, decimalSeparator = ' ') => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, decimalSeparator);
};
