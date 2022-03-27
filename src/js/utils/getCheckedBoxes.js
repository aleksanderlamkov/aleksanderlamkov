
/**
 * Получение кликнутых input checkbox/radio из элемента
 * @param obj{NodeList|HTMLCollection|Node} - исходный элемент либо коллекция элементов
 * @param filter{String=} - фильтрующий селектор
 * @return Array - возвращает массив с элементами
 */
export const getCheckedBoxes = (obj, filter) => {
  let checkedBoxes = [];
  let checkboxes = (NodeList.prototype.isPrototypeOf(obj) || HTMLCollection.prototype.isPrototypeOf(obj)) ? obj : obj.querySelectorAll('input[type="checkbox"], input[type="radio"]');
  checkboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      if (filter && !checkbox.matches(filter)) {
        return;
      }
      checkedBoxes.push(checkbox);
    }
  });
  return checkedBoxes;
}
