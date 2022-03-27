/**
 * Проверка, является ли указанный объект DOM-элементом
 * @param element{Object} - проверяемый объект
 * @return Boolean
 */
export const isNode = (element) => {
  return element instanceof Element || element instanceof HTMLDocument
}
