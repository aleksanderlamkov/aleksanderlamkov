

/**
 * Установка значения CSS3-переменной для элемента
 * @param node{HTMLElement} - DOM-узел с необходимой переменной
 * @param variable{String} - название переменной (допускается без дефисов)
 * @param value{String=} - значение переменной
 */
export const setCSSVar = (node= document.documentElement, variable, value = '') => {
  if(!variable.startsWith('--')) {
    variable = `--${variable}`;
  }
  node.style.setProperty(variable, value);
}
