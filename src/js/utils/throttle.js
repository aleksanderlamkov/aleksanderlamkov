
/**
 * Задержка выполнения функции
 * @param func{Function} - исходная функция
 * @param limit{Number} - лимит выполнения
 * @return Function - возвращает исходную функцию
 */
export const throttle = (func, limit) => {
  let lastFunc, lastRan;
  return function() {
    const context = this;
    const args = arguments;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function() {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(context, args);
          lastRan = Date.now()
        }
      }, limit - (Date.now() - lastRan))
    }
  }
}
