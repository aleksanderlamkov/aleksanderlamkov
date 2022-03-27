/**
 * Получение вычисляемого CSS свойства элемента
 * @param node{HTMLElement} - DOM-узел
 * @param prop{String} - свойство, значение которого нужно получить
 * @return String
 */
export const getCSSValue = (node, prop) => {
  return window.getComputedStyle(node).getPropertyValue(prop);
}
