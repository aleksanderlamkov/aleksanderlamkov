
/**
 * Удаляет множество атрибутов у элемента
 * @param el{Element} - элемент
 * @param attrsArray{Array} - массив атрибутов для удаления
 */
export const removeAttrs = (el, attrsArray = []) => {
  attrsArray.forEach((attr) => {
    el.removeAttribute(attr);
  });
}
