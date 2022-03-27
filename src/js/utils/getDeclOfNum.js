
/**
 * Получение нужного склонения слова в зависимости от числительного
 * @param number{Number} - искомое число
 * @param wordsArr{Array} - массив со словами, например, [ 'товар', 'товара', 'товаров' ]
 * @return String
 */
export const getDeclOfNum = (number, wordsArr) => {
  return wordsArr[(number % 100 > 4 && number % 100 < 20) ? 2 : [2, 0, 1, 1, 1, 2][(number % 10 < 5) ? Math.abs(number) % 10 : 5]];
}
