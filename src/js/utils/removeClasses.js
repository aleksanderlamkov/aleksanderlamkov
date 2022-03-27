/**
 * Удаляет множество классов у элемента
 * @param el{Element} - элемент
 * @param classesArray{Array} - массив удаляемых классов
 */
export const removeClasses = (el, classesArray = []) => {
  classesArray.forEach((className) => {
    el.classList.remove(className);
  });
}
