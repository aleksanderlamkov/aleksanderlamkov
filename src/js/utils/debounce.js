
/**
 * Debounce-обработка функций (выполнение не чаще, чем один раз в указанный промежуток времени)
 * @param func{Function} - выполняемая функция
 * @param wait{Number=} - интервал
 * @param isImmediate{Boolean=} - немедленное выполнение
 */
export const debounce = (func, wait = 250, isImmediate = false) => {
  let timeout;
  return function executedFunction () {
    const context = this;
    const args = arguments;
    const later = function () {
      timeout = null;
      if (!isImmediate) {
        func.apply(context, args);
      }
    };
    const callNow = isImmediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) {
      func.apply(context, args);
    }
  };
}