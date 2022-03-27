
/**
 * Ожидание
 * @param ms{Number} - исходная функция
 * @return Promise - возвращает Promise
 */
export const wait = (ms = 1000) => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}
