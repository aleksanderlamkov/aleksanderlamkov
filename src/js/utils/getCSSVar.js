
/**
 * Получение значения CSS3-переменной
 * @param node{Element} - DOM-узел с необходимой переменной
 * @param variable{String} - название переменной (допускается без дефисов)
 * @param isNumber{Boolean=} - вернуть число с плавающей запятой
 * @return String||Number
 */
export const getCSSVar = (node, variable, isNumber = false) => {
  if(!variable.startsWith('--')) {
    variable = `--${variable}`;
  }
  const value = window.getComputedStyle(node).getPropertyValue(variable);
  return (isNumber) ? parseFloat(value) : value;
}
